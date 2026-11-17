/**
 * Centralized Query Keys Factory (DRY & type-safe invalidation)
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  sshGroups: {
    all: ["ssh-groups"] as const,
    list: () => [...queryKeys.sshGroups.all, "list"] as const,
    detail: (id: string) => [...queryKeys.sshGroups.all, "detail", id] as const,
  },
  keys: {
    all: ["keys"] as const,
    list: () => [...queryKeys.keys.all, "list"] as const,
    detail: (id: string) => [...queryKeys.keys.all, "detail", id] as const,
  },
  attendance: {
    all: ["attendance"] as const,
    records: (userId: string, month?: string) =>
      [...queryKeys.attendance.all, "records", userId, month] as const,
    summary: (userId: string) =>
      [...queryKeys.attendance.all, "summary", userId] as const,
  },
  auditLogs: {
    all: ["audit-logs"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.auditLogs.all, "list", params] as const,
  },
  company: {
    all: ["company"] as const,
    list: () => [...queryKeys.company.all, "list"] as const,
    config: (systemId?: string) =>
      [...queryKeys.company.all, "config", systemId || "default"] as const,
  },
  staff: {
    all: ["staff"] as const,
    current: () => [...queryKeys.staff.all, "current"] as const,
    detail: (id: string) => [...queryKeys.staff.all, "detail", id] as const,
  },
  subscription: {
    all: ["subscription"] as const,
    check: (systemId: string) =>
      [
        ...queryKeys.subscription.all,
        "check",
        (systemId || "").toLowerCase(),
      ] as const,
    list: () => [...queryKeys.subscription.all, "list"] as const,
  },
  systemConfig: {
    all: ["system-config"] as const,
    supportLinks: () =>
      [...queryKeys.systemConfig.all, "support-links"] as const,
  },
  home: {
    all: ["home"] as const,
    data: (userId?: string) =>
      [...queryKeys.home.all, "data", userId || "current"] as const,
  },
  devices: {
    all: ["devices"] as const,
    list: (userId?: string) =>
      [...queryKeys.devices.all, "list", userId || "current"] as const,
  },
  infoCompany: {
    all: ["info-company"] as const,
    detail: (systemId?: string) =>
      [...queryKeys.infoCompany.all, "detail", systemId || "default"] as const,
  },
  reports: {
    all: ["reports"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.reports.all, "list", params] as const,
  },
  privacyPolicy: {
    all: ["privacy-policy"] as const,
    byLang: (lang: string) => [...queryKeys.privacyPolicy.all, lang] as const,
  },
} as const;
