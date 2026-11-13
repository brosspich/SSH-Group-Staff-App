import { useLanguage } from "@/features/language";
import { StaffUser, userService } from "@/shared/services/userService";
import { isOwnerRole } from "@/utils/roleUtils";
import { useCallback, useEffect, useState } from "react";
import { fetchAllCompaniesApi } from "../_api/infoCompanyApi";
import { useCompanyInfoQuery } from "./useCompanyInfoQuery";
import { useCompanyInfoStore } from "../_store/useCompanyInfoStore";
import { useUpdateCompanyMutation } from "./useUpdateCompanyMutation";
import type { CompanyInfo } from "../_types/infoCompany.types";

function extractFirstString(val: any): string {
  if (!val) return "";
  if (Array.isArray(val)) {
    const first = val[0];
    if (typeof first === "string") return first.trim();
    return String(first ?? "").trim();
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return String(parsed[0] ?? "").trim();
        }
      } catch {}
    }
    return trimmed;
  }
  return String(val).trim();
}

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
  const selectedCompanyId = useCompanyInfoStore(
    (state) => state.selectedCompanyId,
  );
  const setSelectedCompanyId = useCompanyInfoStore(
    (state) => state.setSelectedSystemId,
  );

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // TanStack Query & Mutation
  const {
    data: queryCompany,
    isLoading: loadingQuery,
    refetch: refetchCompany,
  } = useCompanyInfoQuery(selectedCompanyId);

  const updateMutation = useUpdateCompanyMutation();

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
  }, [setSelectedCompanyId]);

  // 2. Fetch list of all companies if owner
  useEffect(() => {
    let isMounted = true;
    if (isOwner) {
      fetchAllCompaniesApi().then((list) => {
        if (isMounted && list.length > 0) {
          setAvailableCompanies(list);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOwner]);

  // 3. Populate form when query data arrives
  useEffect(() => {
    if (queryCompany) {
      setName(queryCompany.name || "");
      setQrCodes(queryCompany.qrCodes || []);
      setLocations(queryCompany.location || []);
      setTelegramBotToken(extractFirstString(queryCompany.telegramBotToken));
      setTelegramChatId(extractFirstString(queryCompany.telegramChatId));
      setTimeIn(queryCompany.timeIn || "08:00:00");
      setTimeOut(queryCompany.timeOut || "17:00:00");
    }
  }, [queryCompany]);

  // QR Code management
  const handleAddQrCode = () => {
    const trimmed = newQrInput.trim();
    if (!trimmed) return;
    if (!qrCodes.includes(trimmed)) {
      setQrCodes([...qrCodes, trimmed]);
    }
    setNewQrInput("");
  };

  const handleRemoveQrCode = (codeToRemove: string) => {
    setQrCodes(qrCodes.filter((c) => c !== codeToRemove));
  };

  // Location GPS management
  const handleAddLocation = () => {
    const trimmed = newLocationInput.trim();
    if (!trimmed) return;
    if (!locations.includes(trimmed)) {
      setLocations([...locations, trimmed]);
    }
    setNewLocationInput("");
  };

  const handleRemoveLocation = (target: number | string) => {
    if (typeof target === "number") {
      setLocations(locations.filter((_, idx) => idx !== target));
    } else {
      setLocations(locations.filter((l) => l !== target));
    }
  };

  // 4. Save updates via TanStack Query useMutation
  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage(
        t("infoCompany.errNameRequired", "Company name is required"),
      );
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payloadTokens = telegramBotToken.trim()
        ? [telegramBotToken.trim()]
        : [];
      const payloadChats = telegramChatId.trim() ? [telegramChatId.trim()] : [];

      await updateMutation.mutateAsync({
        companyId: selectedCompanyId,
        payload: {
          name: name.trim(),
          qrCodes: qrCodes,
          location: locations,
          telegramBotToken: payloadTokens,
          telegramChatId: payloadChats,
          timeIn: timeIn.trim() || "08:00:00",
          timeOut: timeOut.trim() || "17:00:00",
        },
      });

      const successTxt = t(
        "infoCompany.updateSuccess",
        "Company information updated successfully",
      );
      setSuccessMessage(successTxt);
      await refetchCompany();
    } catch (err: any) {
      const msg =
        err?.message ||
        t("common.somethingWentWrong", "Failed to update company information");
      setErrorMessage(msg);
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
    loading: loadingQuery && !queryCompany,
    saving: updateMutation.isPending,
    errorMessage,
    successMessage,
    loadCompany: (companyId?: string) => {
      if (companyId) {
        setSelectedCompanyId(companyId);
      }
      return refetchCompany();
    },
    handleSave,
  };
}
