// app/create/custom_receipt.tsx
import AppbarBack from "@/components/appbar/appbarback";
import CustomReceiptPaper from "@/components/sale/CustomReceiptPaper";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaperSize = "57mm" | "80mm";

export interface ReceiptSettings {
  paperSize: PaperSize;
  logoUri: string | null;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  qrUri: string | null;
  showThankYou: boolean;
  thankYouText: string;
  showProducts: boolean;
  copies: number;
  printAsImage: boolean;
}

export const DEFAULT_SETTINGS: ReceiptSettings = {
  paperSize: "80mm",
  logoUri: null,
  companyName: "SSH GROUP",
  email: "support@sshgroups.com",
  phone: "(+855) 092 696 698",
  address: "Phnom Penh, Cambodia",
  qrUri: null,
  showThankYou: true,
  thankYouText: "Thank you!",
  showProducts: true,
  copies: 1,
  printAsImage: false,
};

export const STORAGE_KEY = "custom_receipt_settings";

export async function loadReceiptSettings(): Promise<ReceiptSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn("Failed to load receipt settings", e);
  }
  return DEFAULT_SETTINGS;
}

// ─── Mock products for preview ────────────────────────────────────────────────

const PREVIEW_ITEMS = [
  { name: "Product A", quantity: 2, price: 12.5 },
  { name: "Product B", quantity: 1, price: 8.0 },
  { name: "Product C", quantity: 3, price: 5.75 },
];

// ── Field component ───────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AppColors.grey + "88"}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: AppColors.grey, true: AppColors.secondary }}
        thumbColor={AppColors.background2}
        // @ts-expect-error - Web-only prop for React Native Web active thumb color
        activeThumbColor={AppColors.background2}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CustomReceipt() {
  const { isMobile } = useResponsive();
  const [settings, setSettings] = useState<ReceiptSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false); // small inline spinner, not a full-screen block
  const [qrBusy, setQrBusy] = useState(false);

  useEffect(() => {
    loadReceiptSettings().then(setSettings);
  }, []);

  const update = (
    key: keyof ReceiptSettings,
    value: ReceiptSettings[keyof ReceiptSettings],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // ── Paper size toggle ──────────────────────────────────────────────────────
  const handlePaperSizeChange = useCallback((size: PaperSize) => {
    setSettings((prev) => {
      const next = { ...prev, paperSize: size };
      // Persist immediately so paper size takes effect on the very next print
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((e) =>
        console.warn("Failed to persist paper size change:", e),
      );
      return next;
    });
  }, []);

  const pickImage = useCallback(async (target: "logoUri" | "qrUri") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow photo library access.");
      return;
    }
    if (target === "logoUri") setLogoBusy(true);
    if (target === "qrUri") setQrBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const ext = asset.uri.split("?")[0].split(".").pop()?.toLowerCase();
        const mime =
          ext === "png"
            ? "image/png"
            : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
        const uri = asset.base64
          ? `data:${mime};base64,${asset.base64}`
          : asset.uri;
        update(target, uri);
      }
    } catch (e) {
      console.warn("Failed to pick image", e);
    } finally {
      if (target === "logoUri") setLogoBusy(false);
      if (target === "qrUri") setQrBusy(false);
    }
  }, []);

  const removeLogo = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      logoUri: null,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    Alert.alert("Reset Settings", "Restore all defaults?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => setSettings(DEFAULT_SETTINGS),
      },
    ]);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      Alert.alert("Error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
        <AppbarBack Title="Custom Receipt Paper" />

        <KeyboardAwareScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={
              !isMobile && {
                maxWidth: "60%",
                width: "100%",
                alignSelf: "center",
              }
            }
          >
            <View style={styles.previewContainer}>
              <CustomReceiptPaper settings={settings} order={null} />
              <View
                style={[
                  styles.paperSizeRow,
                  { width: "100%", maxWidth: 280, alignSelf: "center" },
                ]}
              >
                {(["57mm", "80mm"] as PaperSize[]).map((size) => (
                  <Pressable
                    key={size}
                    style={[
                      styles.paperSizeBtn,
                      settings.paperSize === size && styles.paperSizeBtnActive,
                    ]}
                    onPress={() => handlePaperSizeChange(size)}
                  >
                    <Text
                      style={[
                        styles.paperSizeBtnText,
                        settings.paperSize === size &&
                          styles.paperSizeBtnTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* ── Logo ── */}
            <View style={[styles.section, { marginTop: 0 }]}>
              <Text style={styles.sectionTitle}>Company Logo</Text>
              <View style={styles.logoRow}>
                <TouchableOpacity
                  style={styles.logoBox}
                  onPress={() => pickImage("logoUri")}
                  activeOpacity={0.8}
                >
                  {settings.logoUri ? (
                    <Image
                      source={{ uri: settings.logoUri }}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={28}
                        color={AppColors.grey}
                      />
                      <Text style={styles.logoPlaceholderText}>
                        Tap to upload
                      </Text>
                    </View>
                  )}
                  {logoBusy && (
                    <View style={styles.logoBoxBusyOverlay}>
                      <ActivityIndicator
                        size="small"
                        color={AppColors.secondary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.logoActions}>
                  <TouchableOpacity
                    style={styles.logoActionBtn}
                    onPress={() => pickImage("logoUri")}
                  >
                    <MaterialIcons
                      name="photo-library"
                      size={16}
                      color={AppColors.secondary}
                    />
                    <Text style={styles.logoActionText}>Choose Logo</Text>
                  </TouchableOpacity>
                  {settings.logoUri && (
                    <TouchableOpacity
                      style={[styles.logoActionBtn, styles.logoRemoveBtn]}
                      onPress={removeLogo}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={16}
                        color="#e53935"
                      />
                      <Text
                        style={[styles.logoActionText, { color: "#e53935" }]}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!settings.logoUri && (
                    <Text style={styles.logoHint}>
                      Recommended: square image, min 200x200px
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* ── Company info ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company Info</Text>
              <Field
                label="Company name"
                value={settings.companyName}
                onChangeText={(v) => update("companyName", v)}
                placeholder="e.g. SSH Group"
              />
              <Field
                label="Email"
                value={settings.email}
                onChangeText={(v) => update("email", v)}
                placeholder="e.g. info@company.com"
              />
              <Field
                label="Phone"
                value={settings.phone}
                onChangeText={(v) => update("phone", v)}
                placeholder="e.g. (+855) 012 345 678"
              />
              <Field
                label="Address"
                value={settings.address}
                onChangeText={(v) => update("address", v)}
                placeholder="e.g. Phnom Penh, Cambodia"
              />
            </View>

            {/* ── QR Code ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QR Code</Text>

              <View style={styles.logoRow}>
                <TouchableOpacity
                  style={styles.logoBox}
                  onPress={() => pickImage("qrUri")}
                  activeOpacity={0.8}
                >
                  {settings.qrUri ? (
                    <Image
                      source={{ uri: settings.qrUri }}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <MaterialCommunityIcons
                        name="qrcode"
                        size={28}
                        color={AppColors.grey}
                      />
                      <Text style={styles.logoPlaceholderText}>
                        Tap to upload
                      </Text>
                    </View>
                  )}
                  {qrBusy && (
                    <View style={styles.logoBoxBusyOverlay}>
                      <ActivityIndicator
                        size="small"
                        color={AppColors.secondary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.logoActions}>
                  <TouchableOpacity
                    style={styles.logoActionBtn}
                    onPress={() => pickImage("qrUri")}
                  >
                    <MaterialIcons
                      name="photo-library"
                      size={16}
                      color={AppColors.secondary}
                    />
                    <Text style={styles.logoActionText}>Choose QR Image</Text>
                  </TouchableOpacity>
                  {settings.qrUri && (
                    <TouchableOpacity
                      style={[styles.logoActionBtn, styles.logoRemoveBtn]}
                      onPress={() => update("qrUri", null)}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={16}
                        color="#e53935"
                      />
                      <Text
                        style={[styles.logoActionText, { color: "#e53935" }]}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!settings.qrUri && (
                    <Text style={styles.logoHint}>
                      Optional. If not set, native QR is printed on all
                      printers.
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* ── Display Options ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Display Options</Text>
              <ToggleRow
                label="Show Products"
                value={settings.showProducts}
                onValueChange={(v) => update("showProducts", v)}
              />
              <ToggleRow
                label="Show Thank You"
                value={settings.showThankYou}
                onValueChange={(v) => update("showThankYou", v)}
              />
              {settings.showThankYou && (
                <Field
                  label="Thank you text"
                  value={settings.thankYouText}
                  onChangeText={(v) => update("thankYouText", v)}
                  placeholder="e.g. Thank you!"
                />
              )}
            </View>

            {/* ── Copies ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Print Copies</Text>
              <View style={styles.copiesRow}>
                {[1, 2, 3].map((n) => (
                  <Pressable
                    key={n}
                    style={[
                      styles.copyBtn,
                      settings.copies === n && styles.copyBtnActive,
                    ]}
                    onPress={() => update("copies", n)}
                  >
                    <Text
                      style={[
                        styles.copyBtnText,
                        settings.copies === n && styles.copyBtnTextActive,
                      ]}
                    >
                      {n}x
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* ── Reset ── */}
            <TouchableOpacity style={styles.btnReset} onPress={resetSettings}>
              <Text style={styles.btnResetText}>Reset Defaults</Text>
            </TouchableOpacity>

            <View style={{ height: 70 }} />
          </View>
        </KeyboardAwareScrollView>

        {/* Save button */}
        <View style={styles.footer}>
          <View
            style={
              !isMobile && {
                maxWidth: "60%",
                width: "100%",
                alignSelf: "center",
              }
            }
          >
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (saving || logoBusy || qrBusy) && { opacity: 0.6 },
              ]}
              onPress={handleSave}
              disabled={saving || logoBusy || qrBusy}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialIcons
                  name={saved ? "check-circle" : "save"}
                  size={18}
                  color="#fff"
                />
              )}
              <Text style={styles.saveBtnText}>
                {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },

  previewContainer: {
    alignItems: "center",
    backgroundColor: AppColors.background,
    marginTop: 15,
    paddingBottom: 16,
  },
  receiptPaper: {
    backgroundColor: AppColors.background2,
    padding: 12,
    borderRadius: 2,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  receiptLogo: {
    width: 60,
    height: 40,
    alignSelf: "center",
    marginBottom: 4,
  },
  receiptLogoPlaceholder: {
    width: 60,
    height: 40,
    alignSelf: "center",
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
    marginBottom: 4,
  },
  receiptLogoPlaceholderText: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  receiptCompanyName: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.textPrimary,
    textAlign: "center",
    marginBottom: 2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  receiptMeta: {
    fontSize: 8,
    color: AppColors.textPrimary,
    lineHeight: 12,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: AppColors.textPrimary,
    marginVertical: 6,
  },
  receiptMetaSmall: {
    fontSize: 7,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  receiptItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  receiptItemName: {
    flex: 1,
    fontSize: 8,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  receiptItemQty: {
    fontSize: 8,
    color: AppColors.textPrimary,
    marginHorizontal: 6,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  receiptItemPrice: {
    fontSize: 8,
    color: AppColors.textPrimary,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "right",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  receiptTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  receiptTotalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  receiptTotalValue: {
    fontSize: 10,
    fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  receiptQr: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginTop: 8,
  },
  receiptQrPlaceholder: {
    width: 60,
    height: 60,
    alignSelf: "center",
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
    marginTop: 8,
  },
  receiptQrPlaceholderText: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "700",
    textAlign: "center",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  receiptThankYou: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.textPrimary,
    textAlign: "center",
    marginTop: 8,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  paperSizeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  paperSizeBtn: {
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AppColors.grey,
    backgroundColor: AppColors.background,
    flex: 1,
    alignItems: "center",
  },
  paperSizeBtnActive: {
    borderColor: AppColors.secondary,
    backgroundColor: AppColors.background,
  },
  paperSizeBtnText: {
    color: AppColors.grey,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  paperSizeBtnTextActive: {
    color: AppColors.secondary,
  },

  section: {
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: `${AppColors.grey}33`,
    gap: 12,
    marginHorizontal: 15,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  sectionNote: {
    fontSize: 11,
    color: AppColors.grey,
    lineHeight: 16,
    marginTop: -4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  logoRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: `${AppColors.grey}55`,
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  logoBoxBusyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
  },
  logoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: AppColors.background,
  },
  logoPlaceholderText: {
    fontSize: 10,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  logoActions: {
    flex: 1,
    gap: 8,
  },
  logoActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${AppColors.secondary}55`,
    backgroundColor: `${AppColors.secondary}11`,
  },
  logoRemoveBtn: {
    borderColor: "#e5393555",
    backgroundColor: "#e5393511",
  },
  logoActionText: {
    fontSize: 13,
    color: AppColors.secondary,
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  logoHint: {
    fontSize: 10,
    color: AppColors.grey,
    lineHeight: 14,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  field: { gap: 4 },
  fieldLabel: {
    fontSize: 12,
    color: AppColors.textPrimary,
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: `${AppColors.grey}44`,
  },
  input: {
    flex: 1,
    backgroundColor: AppColors.background,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: `${AppColors.grey}44`,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: AppColors.textPrimary,
    fontSize: 13,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  copiesRow: {
    flexDirection: "row",
    gap: 10,
  },
  copyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: AppColors.grey,
    backgroundColor: AppColors.background,
  },
  copyBtnActive: {
    borderColor: AppColors.secondary,
    backgroundColor: `${AppColors.secondary}11`,
  },
  copyBtnText: {
    color: AppColors.grey,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  copyBtnTextActive: {
    color: AppColors.secondary,
  },

  btnReset: {
    paddingVertical: 10,
    // paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.secondary,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 15,
  },
  btnResetText: {
    color: AppColors.secondary,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  footer: {
    backgroundColor: AppColors.background2,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: `${AppColors.grey}44`,
  },
  saveBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
