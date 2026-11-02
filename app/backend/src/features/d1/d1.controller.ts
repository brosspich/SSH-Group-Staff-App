import { Request, Response } from "express";
import { prisma } from "../../infrastructure/database/prisma.js";
import {
  buildQueryCacheKey,
  serverCacheStore,
} from "../../infrastructure/cache/serverCacheStore.js";

function getPrismaDelegate(table: string): any {
  switch (table) {
    case "ssh_group_staff_users":
    case "StaffUser":
      return prisma.staffUser;
    case "Company":
    case "company":
    case "companies":
      return prisma.company;
    case "ssh-group-staff-attendance-qr":
    case "AttendanceQr":
      return prisma.company;
    case "User":
    case "user":
      return prisma.user;
    case "SshGroup":
    case "ssh_groups":
      return prisma.sshGroup;
    case "GroupMember":
    case "group_members":
      return prisma.groupMember;
    case "SshKey":
    case "ssh_keys":
      return prisma.sshKey;
    case "AuditLog":
    case "audit_logs":
      return prisma.auditLog;
    default:
      return null;
  }
}

function mapCompanyField(field: string): string {
  switch (field) {
    case "company_name":
    case "companyName":
      return "name";
    case "qr-code":
    case "qr_code":
    case "qrCode":
      return "qrCodes";
    case "location_links":
    case "locationLinks":
      return "location";
    case "telegram_bot_token":
      return "telegramBotToken";
    case "telegram_chat_id":
      return "telegramChatId";
    case "time-in":
      return "timeIn";
    case "time-out":
      return "timeOut";
    default:
      return field;
  }
}

function normalizeCompanyRow(row: any) {
  if (!row) return row;
  return {
    ...row,
    company_name: row.name ?? row.company_name,
    companyName: row.name ?? row.companyName,
    "qr-code": row.qrCodes ?? row["qr-code"],
    qrCode: row.qrCodes ?? row.qrCode,
    qrCodes: row.qrCodes ?? row["qr-code"],
    location_links: row.location ?? row.location_links,
    locationLinks: row.location ?? row.locationLinks,
    telegram_bot_token: row.telegramBotToken ?? row.telegram_bot_token,
    telegramBotToken: row.telegramBotToken ?? row.telegram_bot_token,
    telegram_chat_id: row.telegramChatId ?? row.telegram_chat_id,
    telegramChatId: row.telegramChatId ?? row.telegram_chat_id,
    "time-in": row.timeIn ?? row["time-in"],
    timeIn: row.timeIn ?? row["time-in"],
    "time-out": row.timeOut ?? row["time-out"],
    timeOut: row.timeOut ?? row["time-out"],
  };
}

function mapStaffUserField(field: string): string {
  switch (field) {
    case "system_id":
      return "systemId";
    case "is_active":
      return "isActive";
    case "request_attendance_rules":
      return "requestAttendanceRules";
    default:
      return field;
  }
}

function normalizeStaffUserRow(row: any) {
  if (!row) return row;
  return {
    ...row,
    system_id: row.systemId ?? row.system_id,
    systemId: row.systemId ?? row.system_id,
    is_active: row.isActive ?? row.is_active,
    isActive: row.isActive ?? row.is_active,
    request_attendance_rules:
      row.requestAttendanceRules ?? row.request_attendance_rules,
    requestAttendanceRules:
      row.requestAttendanceRules ?? row.request_attendance_rules,
  };
}

function serializePayloadFields(data: any): any {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map(serializePayloadFields);
  }

  const result: any = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== null && typeof val === "object" && !(val instanceof Date)) {
      result[key] = JSON.stringify(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

function mapWhereObject(where: any, fieldMapper: (f: string) => string): any {
  if (!where || typeof where !== "object") return where;
  if (Array.isArray(where)) {
    return where.map((item) => mapWhereObject(item, fieldMapper));
  }

  const mapped: any = {};
  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" && Array.isArray(val)) {
      mapped.OR = val.map((item) => mapWhereObject(item, fieldMapper));
    } else if (key === "AND" && Array.isArray(val)) {
      mapped.AND = val.map((item) => mapWhereObject(item, fieldMapper));
    } else {
      const mappedKey = fieldMapper(key);
      mapped[mappedKey] = val;
    }
  }
  return mapped;
}

export const handleD1Query = async (req: Request, res: Response) => {
  const {
    table,
    action = "select",
    where,
    data,
    select,
    orderBy,
    limit,
    single,
  } = req.body;

  const delegate = getPrismaDelegate(table);
  if (!delegate) {
    return res.status(400).json({
      data: null,
      error: { message: `Table "${table}" is not supported on Cloudflare D1.` },
    });
  }

  const isCompanyTable =
    table === "Company" ||
    table === "company" ||
    table === "companies" ||
    table === "ssh-group-staff-attendance-qr" ||
    table === "AttendanceQr";

  const isStaffUserTable =
    table === "ssh_group_staff_users" || table === "StaffUser";

  const fieldMapper = isCompanyTable
    ? mapCompanyField
    : isStaffUserTable
      ? mapStaffUserField
      : (f: string) => f;

  try {
    let result: any = null;

    if (action === "select") {
      const cacheKey = buildQueryCacheKey(table, action, {
        where,
        select,
        orderBy,
        limit,
        single,
      });

      const cached = serverCacheStore.getState().get(cacheKey);
      if (cached !== null) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json({
          data: cached,
          error: null,
        });
      }

      const queryOptions: any = {};

      if (where && Object.keys(where).length > 0) {
        queryOptions.where = mapWhereObject(where, fieldMapper);
      }

      if (orderBy) {
        if (typeof orderBy === "object") {
          const mappedOrder: any = {};
          for (const [col, dir] of Object.entries(orderBy)) {
            mappedOrder[fieldMapper(col)] = dir;
          }
          queryOptions.orderBy = mappedOrder;
        } else {
          queryOptions.orderBy = orderBy;
        }
      }

      if (limit) {
        queryOptions.take = Number(limit);
      }

      if (
        select &&
        Array.isArray(select) &&
        select.length > 0 &&
        select[0] !== "*"
      ) {
        queryOptions.select = {};
        select.forEach((field: string) => {
          const mappedKey = fieldMapper(field.trim());
          queryOptions.select[mappedKey] = true;
        });
      }

      if (single) {
        result = await delegate.findFirst(queryOptions);
      } else {
        result = await delegate.findMany(queryOptions);
      }

      if (isCompanyTable) {
        if (Array.isArray(result)) {
          result = result.map(normalizeCompanyRow);
        } else if (result) {
          result = normalizeCompanyRow(result);
        }
      } else if (isStaffUserTable) {
        if (Array.isArray(result)) {
          result = result.map(normalizeStaffUserRow);
        } else if (result) {
          result = normalizeStaffUserRow(result);
        }
      }

      serverCacheStore.getState().set(cacheKey, result, table);
      res.setHeader("X-Cache", "MISS");
    } else if (action === "insert") {
      serverCacheStore.getState().invalidateTable(table);
      const mappedData = isCompanyTable
        ? mapWhereObject(data, mapCompanyField)
        : isStaffUserTable
          ? mapWhereObject(data, mapStaffUserField)
          : data;

      const payload = serializePayloadFields(mappedData);

      if (Array.isArray(payload)) {
        result = await delegate.createMany({ data: payload });
      } else {
        result = await delegate.create({ data: payload });
      }

      if (isCompanyTable && result) {
        result = normalizeCompanyRow(result);
      } else if (isStaffUserTable && result) {
        result = normalizeStaffUserRow(result);
      }
    } else if (action === "update") {
      serverCacheStore.getState().invalidateTable(table);
      const mappedWhere = mapWhereObject(where, fieldMapper);
      const mappedData = isCompanyTable
        ? mapWhereObject(data, mapCompanyField)
        : isStaffUserTable
          ? mapWhereObject(data, mapStaffUserField)
          : data;

      const payload = serializePayloadFields(mappedData);

      if (mappedWhere?.id) {
        result = await delegate.update({
          where: { id: mappedWhere.id },
          data: payload,
        });
      } else {
        result = await delegate.updateMany({
          where: mappedWhere,
          data: payload,
        });
      }

      if (isCompanyTable && result) {
        result = normalizeCompanyRow(result);
      } else if (isStaffUserTable && result) {
        result = normalizeStaffUserRow(result);
      }
    } else if (action === "delete") {
      serverCacheStore.getState().invalidateTable(table);
      const mappedWhere = mapWhereObject(where, fieldMapper);
      if (mappedWhere?.id) {
        result = await delegate.delete({ where: { id: mappedWhere.id } });
      } else {
        result = await delegate.deleteMany({ where: mappedWhere });
      }
    } else {
      return res.status(400).json({
        data: null,
        error: { message: `Unsupported action: ${action}` },
      });
    }

    return res.status(200).json({
      data: result,
      error: null,
    });
  } catch (error: any) {
    console.error(`[Cloudflare D1 Query Error on ${table}]:`, error);
    return res.status(500).json({
      data: null,
      error: {
        message: error?.message || "Internal Cloudflare D1 query error",
      },
    });
  }
};
