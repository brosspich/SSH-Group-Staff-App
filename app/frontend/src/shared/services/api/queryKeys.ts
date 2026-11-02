/**
 * Centralized Query Keys Factory (DRY & type-safe invalidation)
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  sshGroups: {
    all: ['ssh-groups'] as const,
    list: () => [...queryKeys.sshGroups.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.sshGroups.all, 'detail', id] as const,
  },
  keys: {
    all: ['keys'] as const,
    list: () => [...queryKeys.keys.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.keys.all, 'detail', id] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    records: (userId: string, month?: string) =>
      [...queryKeys.attendance.all, 'records', userId, month] as const,
    summary: (userId: string) =>
      [...queryKeys.attendance.all, 'summary', userId] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.auditLogs.all, 'list', params] as const,
  },
  company: {
    all: ['company'] as const,
    list: () => [...queryKeys.company.all, 'list'] as const,
    config: (systemId?: string) =>
      [...queryKeys.company.all, 'config', systemId || 'default'] as const,
  },
  staff: {
    all: ['staff'] as const,
    current: () => [...queryKeys.staff.all, 'current'] as const,
    detail: (id: string) => [...queryKeys.staff.all, 'detail', id] as const,
  },
} as const;
