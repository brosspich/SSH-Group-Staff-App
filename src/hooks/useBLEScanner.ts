import { Buffer } from "buffer";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

// ── Singleton BleManager ──────────────────────────────────────────────────────
let bleManagerInstance: BleManager | null = null;
let isScanningModule = false;

export const getBleManager = (): BleManager => {
  if (!bleManagerInstance) {
    bleManagerInstance = new BleManager();
  }
  return bleManagerInstance;
};

export const stopScanIfNeeded = () => {
  if (bleManagerInstance && isScanningModule) {
    try {
      bleManagerInstance.stopDeviceScan();
    } catch (e) {
      console.warn("[useBLEScanner] failed to stop scan:", e);
    }
    isScanningModule = false;
  }
};

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BLEDevice {
  id: string; // MAC on Android, opaque UUID on iOS
  name: string;
}

export interface BleGattTarget {
  serviceUUID: string;
  characteristicUUID: string;
  writeWithResponse: boolean;
  mtu?: number;
}

// ── Standalone GATT helpers (used by useBLEScanner AND by usePrinter directly) ─

export const isBleGattConnected = async (
  deviceId: string,
): Promise<boolean> => {
  try {
    return await getBleManager().isDeviceConnected(deviceId);
  } catch {
    return false;
  }
};

export const ensureBleGattConnected = async (
  deviceId: string,
): Promise<void> => {
  const manager = getBleManager();
  const connected = await isBleGattConnected(deviceId);

  if (!connected) {
    const device = await manager.connectToDevice(deviceId, {
      requestMTU: Platform.OS === "android" ? 247 : undefined,
      autoConnect: false,
    });
    if (!device) throw new Error("Could not reach BLE device.");
    await device.discoverAllServicesAndCharacteristics();
    await new Promise((r) => setTimeout(r, 300));
  }
};

export const connectAndDiscoverBleGatt = async (
  deviceId: string,
): Promise<BleGattTarget> => {
  const manager = getBleManager();

  const alreadyConnected = await isBleGattConnected(deviceId);
  let device = alreadyConnected
    ? (await manager.devices([deviceId]))[0]
    : await manager.connectToDevice(deviceId, {
        requestMTU: Platform.OS === "android" ? 247 : undefined,
        autoConnect: false,
      });

  if (!device) throw new Error("Could not reach BLE device.");

  let negotiatedMtu: number | undefined;
  if (Platform.OS === "android") {
    try {
      device = await manager.requestMTUForDevice(deviceId, 247);
      negotiatedMtu = device.mtu;
    } catch (e) {
      console.warn("[BLE] MTU negotiation failed, will use 20-byte chunks", e);
    }
  } else {
    negotiatedMtu = device.mtu;
  }
  console.log(`[BLE] negotiated mtu=${negotiatedMtu}`);

  await device.discoverAllServicesAndCharacteristics();
  const services = await device.services();
  for (const service of services) {
    const chars = await service.characteristics();
    const noResp = chars.find((c) => c.isWritableWithoutResponse);
    if (noResp) {
      return {
        serviceUUID: service.uuid,
        characteristicUUID: noResp.uuid,
        writeWithResponse: false,
        mtu: negotiatedMtu,
      };
    }
  }
  // 1. Prefer write-without-response (Write Command) for printer data streams
  for (const service of services) {
    const chars = await service.characteristics();
    const noResp = chars.find((c) => c.isWritableWithoutResponse);
    if (noResp) {
      return {
        serviceUUID: service.uuid,
        characteristicUUID: noResp.uuid,
        writeWithResponse: false,
        mtu: negotiatedMtu,
      };
    }
  }

  // 2. Fall back to write-with-response (Write Request) if no write-without-response exists
  for (const service of services) {
    const chars = await service.characteristics();
    const withResp = chars.find((c) => c.isWritableWithResponse);
    if (withResp) {
      return {
        serviceUUID: service.uuid,
        characteristicUUID: withResp.uuid,
        writeWithResponse: true,
        mtu: negotiatedMtu,
      };
    }
  }

  throw new Error("No writable GATT characteristic found.");
};

export const writeBleGattChunked = async (
  deviceId: string,
  serviceUUID: string,
  characteristicUUID: string,
  data: Buffer,
  writeWithoutResponse: boolean,
  mtu?: number,
): Promise<void> => {
  const manager = getBleManager();

  const chunkSize = mtu ? Math.max(20, mtu - 5) : 20;
  const totalChunks = Math.ceil(data.length / chunkSize);

  console.log(
    `[BLE] START total=${data.length}B chunkSize=${chunkSize} chunks=${totalChunks} mtu=${mtu}`,
  );

  const t0 = Date.now();
  let chunkIndex = 0;

  for (let offset = 0; offset < data.length; offset += chunkSize) {
    const chunk = data.subarray(offset, offset + chunkSize);
    const b64 = Buffer.from(chunk).toString("base64");
    try {
      if (writeWithoutResponse) {
        await manager.writeCharacteristicWithoutResponseForDevice(
          deviceId,
          serviceUUID,
          characteristicUUID,
          b64,
        );
      } else {
        await manager.writeCharacteristicWithResponseForDevice(
          deviceId,
          serviceUUID,
          characteristicUUID,
          b64,
        );
      }
      console.log(
        `[BLE] chunk ${chunkIndex}/${totalChunks} offset=${offset} +${Date.now() - t0}ms OK`,
      );
    } catch (e: any) {
      console.warn(
        `[BLE] chunk ${chunkIndex}/${totalChunks} offset=${offset} FAILED:`,
        e?.message ?? e,
      );
      throw e;
    }
    chunkIndex++;

    if (offset + chunkSize < data.length) {
      // Sleep 15ms every 10 chunks to allow printer GATT queue to clear, speeding up prints by 4x
      if (chunkIndex % 10 === 0) {
        await new Promise((r) => setTimeout(r, 15));
      }
    }
  }
  console.log(`[BLE] DONE total_time=${Date.now() - t0}ms`);
};

export const disconnectBleGatt = async (deviceId: string): Promise<void> => {
  try {
    await getBleManager().cancelDeviceConnection(deviceId);
  } catch (_) {
    // already disconnected — fine
  }
};

// ── Hook: live GATT scanning for the "Nearby Printers" screen ────────────────

interface UseBLEScannerResult {
  devices: BLEDevice[];
  isScanning: boolean;
  error: string | null;
  startScan: (timeoutMs?: number) => void;
  stopScan: () => void;
}

export const useBLEScanner = (): UseBLEScannerResult => {
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopScanIfNeeded();
    };
  }, []);

  const stopScan = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    stopScanIfNeeded();
    if (isMounted.current) setIsScanning(false);
  }, []);

  const startScan = useCallback(
    (timeoutMs = 8000) => {
      const manager = getBleManager();
      stopScanIfNeeded();
      seenRef.current = new Set();
      setDevices([]);
      setError(null);
      setIsScanning(true);
      isScanningModule = true;

      manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (err, device) => {
          if (err) {
            console.warn("[useBLEScanner] scan error:", err);
            if (isMounted.current) setError(err.message ?? "BLE scan failed");
            return;
          }
          const name = device?.name ?? device?.localName ?? "";
          if (!device || !name || seenRef.current.has(device.id)) return;

          seenRef.current.add(device.id);
          if (isMounted.current)
            setDevices((prev) => [...prev, { id: device.id, name }]);
        },
      );

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(stopScan, timeoutMs);
    },
    [stopScan],
  );

  return { devices, isScanning, error, startScan, stopScan };
};
