// app/create/custom_report_paper.tsx

import AppbarBack from "@/components/appbar/appbarback";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "report_paper_settings";

export interface ReportPaperSettings {
  companyName: string;
  tagline: string;
  logoUri: string | null;
}

const DEFAULT_SETTINGS: ReportPaperSettings = {
  companyName: "SSH Group",
  tagline: "",
  logoUri: null,
};

export async function loadReportPaperSettings(): Promise<ReportPaperSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

// ── Field component (module-level, not nested) ────────────────────────────────
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
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
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

// ── Screen ────────────────────────────────────────────────────────────────────
export default function CustomReportPaperScreen() {
  const { isMobile } = useResponsive();
  const [settings, setSettings] =
    useState<ReportPaperSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);

  useEffect(() => {
    loadReportPaperSettings().then(setSettings);
  }, []);

  const update = (key: keyof ReportPaperSettings, value: string | null) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  // ── pickLogo ────────────────────────────────────────────────────────────────
  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo access to pick a logo.",
      );
      return;
    }
    setLogoBusy(true);
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
        update("logoUri", uri);
      }
    } catch (e) {
      console.warn("Failed to pick logo", e);
    } finally {
      setLogoBusy(false);
    }
  };

  // ── removeLogo ──────────────────────────────────────────────────────────────
  // const removeLogo = () => {
  //   Alert.alert("Remove logo", "Remove the company logo?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Remove",
  //       style: "destructive",
  //       onPress: () => update("logoUri", null),
  //     },
  //   ]);
  // };

  // ── handleSave ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
    } catch {
      Alert.alert("Error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
      <View style={s.container}>
        <AppbarBack Title="Custom Report Paper" />
        <ScrollView
          contentContainerStyle={s.content}
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
            {/* Preview */}
            <View style={s.previewContainer}>
              <View style={s.previewCard}>
                <View style={s.previewHeader}>
                  {settings.logoUri ? (
                    <Image
                      source={{ uri: settings.logoUri }}
                      style={s.previewLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={s.previewLogoPlaceholder}>
                      <MaterialCommunityIcons
                        name="receipt"
                        size={18}
                        color={AppColors.secondary}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.previewCompany} numberOfLines={1}>
                      {settings.companyName || "Company Name"}
                    </Text>
                    {settings.tagline ? (
                      <Text style={s.previewTagline} numberOfLines={1}>
                        {settings.tagline}
                      </Text>
                    ) : null}
                    <Text style={s.previewReportType}>Daily Sales Report</Text>
                  </View>
                  <View style={s.previewRight}>
                    <Text style={s.previewPeriod}>11 Jun 2026</Text>
                    <Text style={s.previewGenerated}>Generated 10:00 AM</Text>
                  </View>
                </View>

                <View style={s.previewDivider} />

                <View style={s.previewCards}>
                  {[
                    { label: "Total Orders", value: "24" },
                    { label: "Total Revenue", value: "$312.50" },
                    { label: "Cash", value: "$198.00" },
                    { label: "KHQR", value: "$114.50" },
                  ].map((c) => (
                    <View key={c.label} style={s.previewMetric}>
                      <Text style={s.previewMetricLabel}>{c.label}</Text>
                      <Text style={s.previewMetricValue}>{c.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={s.previewFooter}>
                  <Text style={s.previewFooterText}>
                    {settings.companyName || "Company Name"} POS · 11 Jun 2026
                  </Text>
                  <Text style={s.previewFooterText}>Confidential</Text>
                </View>
              </View>
            </View>

            {/* Logo */}
            <View style={[s.section, { marginBottom: 8 }]}>
              <Text style={s.sectionTitle}>Company Logo</Text>
              <View style={s.logoRow}>
                <TouchableOpacity
                  style={s.logoBox}
                  onPress={pickLogo}
                  activeOpacity={0.8}
                >
                  {settings.logoUri ? (
                    <Image
                      source={{ uri: settings.logoUri }}
                      style={s.logoImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={s.logoPlaceholder}>
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={28}
                        color={AppColors.grey}
                      />
                      <Text style={s.logoPlaceholderText}>Tap to upload</Text>
                    </View>
                  )}
                  {logoBusy && (
                    <View style={s.logoBoxBusyOverlay}>
                      <ActivityIndicator
                        size="small"
                        color={AppColors.secondary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={s.logoActions}>
                  <TouchableOpacity style={s.logoActionBtn} onPress={pickLogo}>
                    <MaterialIcons
                      name="photo-library"
                      size={16}
                      color={AppColors.secondary}
                    />
                    <Text style={s.logoActionText}>Choose photo</Text>
                  </TouchableOpacity>
                  {settings.logoUri && (
                    <TouchableOpacity
                      style={[s.logoActionBtn, s.logoRemoveBtn]}
                      onPress={() => update("logoUri", null)}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={16}
                        color="#e53935"
                      />
                      <Text style={[s.logoActionText, { color: "#e53935" }]}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  )}
                  <Text style={s.logoHint}>
                    Recommended: square image, min 200x200px
                  </Text>
                </View>
              </View>
            </View>

            {/* Company info */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Company Info</Text>
              <Field
                label="Company name"
                value={settings.companyName}
                onChangeText={(v) => update("companyName", v)}
                placeholder="e.g. SSH Group"
              />
              <Field
                label="Tagline"
                value={settings.tagline}
                onChangeText={(v) => update("tagline", v)}
                placeholder="e.g. Your trusted POS partner"
              />
            </View>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={s.footer}>
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
              style={[s.saveBtn, (saving || logoBusy) && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving || logoBusy}
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
              <Text style={s.saveBtnText}>
                {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    paddingVertical: 16,
    gap: 16,
  },
  previewContainer: {
    alignItems: "center",
    backgroundColor: AppColors.background,
    paddingBottom: 8,
  },
  section: {
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: `${AppColors.grey}33`,
    gap: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Logo picker
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

  // Fields
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
  // Preview card
  previewCard: {
    width: 320,
    backgroundColor: AppColors.background2,
    padding: 16,
    borderRadius: 10,
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
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  previewLogo: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  previewLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  previewCompany: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  previewTagline: {
    fontSize: 10,
    color: "#888",
    marginTop: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  previewReportType: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  previewRight: {
    alignItems: "flex-end",
  },
  previewPeriod: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1a1a1a",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  previewGenerated: {
    fontSize: 9,
    color: "#aaa",
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  previewDivider: {
    height: 1,
    backgroundColor: "#e8e8e8",
    marginHorizontal: 12,
  },
  previewCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 12,
  },
  previewMetric: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fafafa",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  previewMetricLabel: {
    fontSize: 9,
    color: "#888",
    marginBottom: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  previewMetricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  previewFooterText: {
    fontSize: 9,
    color: "#bbb",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  // Save footer
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
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
