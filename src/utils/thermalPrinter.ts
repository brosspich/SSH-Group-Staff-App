import { Platform } from "react-native";

export type {
  IBLEPrinter,
  INetPrinter,
  IUSBPrinter,
} from "@haroldtran/react-native-thermal-printer";

let BLEPrinter: any = null;
let NetPrinter: any = null;
let USBPrinter: any = null;
let COMMANDS: any = null;

if (Platform.OS !== "web") {
  try {
    const lib = require("@haroldtran/react-native-thermal-printer");
    BLEPrinter = lib.BLEPrinter ?? null;
    NetPrinter = lib.NetPrinter ?? null;
    COMMANDS = lib.COMMANDS ?? null;
    // USBPrinter is Android-only — importing it on iOS throws
    if (Platform.OS === "android") {
      USBPrinter = lib.USBPrinter ?? null;
    }
  } catch (e) {
    console.warn("[thermalPrinter] failed to load library:", e);
  }
}

export { BLEPrinter, COMMANDS, NetPrinter, USBPrinter };
