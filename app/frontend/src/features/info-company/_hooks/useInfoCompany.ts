import { useLanguage } from "@/features/language";
import { StaffUser, userService } from "@/shared/services/userService";
import { isOwnerRole } from "@/utils/roleUtils";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  fetchAllCompaniesApi,
  fetchCompanyByIdApi,
  updateCompanyApi,
} from "../_api/infoCompanyApi";
import type { CompanyInfo } from "../_types/infoCompany.types";

export function useInfoCompany() {
  const { t } = useLanguage();

  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Available companies for selection if owner
  const [availableCompanies, setAvailableCompanies] = useState<CompanyInfo[]>(
    [],
  );
  const [selectedCompanyId, setSelectedCompanyId] =
    useState<string>("system-0001");

  // Form states
  const [name, setName] = useState("");
  const [qrCodes, setQrCodes] = useState<string[]>([]);
  const [newQrInput, setNewQrInput] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocationInput, setNewLocationInput] = useState("");
  const [locationText, setLocationText] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [showBotToken, setShowBotToken] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [timeIn, setTimeIn] = useState("08:00:00");
  const [timeOut, setTimeOut] = useState("17:00:00");

  // Status states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Check user authentication and permissions
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const u = await userService.get();
        if (!isMounted) return;
        setCurrentUser(u);

        const role = (u?.role || "").toLowerCase().trim();
        const authorized =
          role === "admin" || role === "owner" || isOwnerRole(role);
        setIsAuthorized(authorized);
        setIsOwner(role === "owner" || isOwnerRole(role));

        // Determine default company for user
        const branchId =
          u?.companyId ||
          u?.details?.companyId ||
          u?.system_id?.match(/^(system-\d+)/i)?.[1]?.toLowerCase() ||
          "system-0001";
        setSelectedCompanyId(branchId);
      } catch {
        if (isMounted) setIsAuthorized(false);
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch company data when selectedCompanyId changes
  const loadCompany = useCallback(async (targetId: string) => {
    if (!targetId) return;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await fetchCompanyByIdApi(targetId);
      if (data) {
        setName(data.name || data.companyName || "");

        // QR codes
        const qrs = Array.isArray(data.qrCodes)
          ? data.qrCodes
          : Array.isArray(data.qrCode)
            ? data.qrCode
            : [];
        setQrCodes(qrs.map((q) => String(q).trim()).filter(Boolean));

        // Location
        let parsedLocs: string[] = [];
        if (Array.isArray(data.location)) {
          parsedLocs = data.location;
        } else if (Array.isArray(data.locationLinks)) {
          parsedLocs = data.locationLinks;
        } else if (typeof data.location === "string") {
          try {
            const parsed = JSON.parse(data.location);
            parsedLocs = Array.isArray(parsed) ? parsed : [data.location];
          } catch {
            parsedLocs = [data.location];
          }
        }
        const cleanedLocs = parsedLocs
          .map((loc) => String(loc).trim())
          .filter(Boolean);
        setLocations(cleanedLocs);
        setLocationText(cleanedLocs.length > 0 ? cleanedLocs[0] : "");

        // Telegram
        const tokens = Array.isArray(data.telegramBotToken)
          ? data.telegramBotToken
          : [data.telegramBotToken];
        setTelegramBotToken(tokens.filter(Boolean)[0] ? String(tokens[0]) : "");

        const chats = Array.isArray(data.telegramChatId)
          ? data.telegramChatId
          : [data.telegramChatId];
        setTelegramChatId(chats.filter(Boolean)[0] ? String(chats[0]) : "");

        // Work hours
        setTimeIn(data.timeIn || "08:00:00");
        setTimeOut(data.timeOut || "17:00:00");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load company details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized && selectedCompanyId) {
      loadCompany(selectedCompanyId);
    }
  }, [isAuthorized, selectedCompanyId, loadCompany]);

  // Load available companies list if owner
  useEffect(() => {
    if (isOwner) {
      fetchAllCompaniesApi().then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setAvailableCompanies(list);
        }
      });
    }
  }, [isOwner]);

  // QR Code operations
  const handleAddQrCode = () => {
    const clean = newQrInput.trim();
    if (!clean) return;
    if (qrCodes.includes(clean)) {
      setNewQrInput("");
      return;
    }
    setQrCodes((prev) => [...prev, clean]);
    setNewQrInput("");
  };

  const handleRemoveQrCode = (qrToRemove: string) => {
    setQrCodes((prev) => prev.filter((q) => q !== qrToRemove));
  };

  // Location operations
  const handleAddLocation = () => {
    const clean = newLocationInput.trim();
    if (!clean) return;
    if (locations.includes(clean)) {
      setNewLocationInput("");
      return;
    }
    setLocations((prev) => [...prev, clean]);
    setNewLocationInput("");
  };

  const handleRemoveLocation = (indexOrLoc: number | string) => {
    if (typeof indexOrLoc === "number") {
      setLocations((prev) => prev.filter((_, idx) => idx !== indexOrLoc));
    } else {
      setLocations((prev) => prev.filter((loc) => loc !== indexOrLoc));
    }
  };

  // Submit changes
  const handleSave = async () => {
    if (!selectedCompanyId) return;
    if (!name.trim()) {
      setErrorMessage(
        t("infoCompany.errNameRequired", "Company name is required"),
      );
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payloadTokens = telegramBotToken.trim()
        ? [telegramBotToken.trim()]
        : [];
      const payloadChats = telegramChatId.trim() ? [telegramChatId.trim()] : [];

      await updateCompanyApi(selectedCompanyId, {
        name: name.trim(),
        qrCodes: qrCodes,
        location: locations,
        telegramBotToken: payloadTokens,
        telegramChatId: payloadChats,
        timeIn: timeIn.trim() || "08:00:00",
        timeOut: timeOut.trim() || "17:00:00",
      });

      const successTxt = t(
        "infoCompany.updateSuccess",
        "Company information updated successfully",
      );
      setSuccessMessage(successTxt);
      Alert.alert(t("common.success", "Success"), successTxt);
    } catch (err: any) {
      const msg =
        err?.message ||
        t("common.somethingWentWrong", "Failed to update company information");
      setErrorMessage(msg);
      Alert.alert(t("common.error", "Error"), msg);
    } finally {
      setSaving(false);
    }
  };

  return {
    currentUser,
    checkingAuth,
    isAuthorized,
    isOwner,
    availableCompanies,
    selectedCompanyId,
    setSelectedCompanyId,
    name,
    setName,
    qrCodes,
    newQrInput,
    setNewQrInput,
    handleAddQrCode,
    handleRemoveQrCode,
    locations,
    setLocations,
    newLocationInput,
    setNewLocationInput,
    handleAddLocation,
    handleRemoveLocation,
    locationText,
    setLocationText,
    telegramBotToken,
    setTelegramBotToken,
    showBotToken,
    setShowBotToken,
    telegramChatId,
    setTelegramChatId,
    timeIn,
    setTimeIn,
    timeOut,
    setTimeOut,
    loading,
    saving,
    errorMessage,
    successMessage,
    loadCompany,
    handleSave,
  };
}
