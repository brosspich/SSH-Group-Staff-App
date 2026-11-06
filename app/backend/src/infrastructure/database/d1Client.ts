import { Logger } from "../../core/utils/logger.js";

export interface D1QueryResult<T = any> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
    last_row_id?: number;
    changes?: number;
  };
}

export interface D1ApiResponse<T = any> {
  result: D1QueryResult<T>[];
  success: boolean;
  errors: { code: number; message: string }[];
  messages: string[];
}

export class CloudflareD1Client {
  private accountId: string;
  private databaseId: string;
  private apiToken: string;
  private baseUrl: string;
  private schemaChecked = false;

  constructor() {
    this.accountId =
      process.env.D1_ACCOUNT_ID ||
      process.env.CLOUDFLARE_ACCOUNT_ID ||
      "9a061f4a584c2e1727526b1006284098";
    this.databaseId =
      process.env.D1_DATABASE_ID || "81928e3d-002e-4e4e-bc70-bd2a1e4120e7";
    this.apiToken =
      process.env.CLOUDFLARE_API_TOKEN ||
      "cfat_voEolL8Iz48cH9I4VMvuqPQ6B8Ec6MQWvQmGoWUj3e3e6d2b";
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}`;
  }

  /**
   * Execute a SELECT query on Cloudflare D1 and return typed results
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await this.rawQuery(sql, params);
    return (res.results as T[]) || [];
  }

  /**
   * Execute a query and return the first row, or null if empty
   */
  async queryFirst<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const list = await this.query<T>(sql, params);
    return list.length > 0 ? list[0] : null;
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE on Cloudflare D1
   */
  async execute(sql: string, params: any[] = []): Promise<D1QueryResult> {
    return await this.rawQuery(sql, params);
  }

  /**
   * Execute multiple statements in batch on Cloudflare D1
   */
  async batch(statements: { sql: string; params?: any[] }[]): Promise<D1QueryResult[]> {
    if (!statements || statements.length === 0) return [];

    const url = `${this.baseUrl}/query`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statements),
    });

    const data = (await response.json()) as D1ApiResponse;
    if (!data.success || (data.errors && data.errors.length > 0)) {
      const errMsg =
        data.errors?.map((e) => e.message).join(", ") || "Cloudflare D1 batch query failed";
      Logger.error(`[Cloudflare D1 Batch Error]: ${errMsg}`);
      throw new Error(`[Cloudflare D1]: ${errMsg}`);
    }

    return data.result || [];
  }

  /**
   * Low-level query executor against Cloudflare D1 REST API
   */
  private async rawQuery(sql: string, params: any[] = []): Promise<D1QueryResult> {
    const url = `${this.baseUrl}/query`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!response.ok) {
      const errText = await response.text();
      Logger.error(`[Cloudflare D1 HTTP ${response.status}]: ${errText}`);
      throw new Error(`[Cloudflare D1 HTTP ${response.status}]: ${errText}`);
    }

    const data = (await response.json()) as D1ApiResponse;
    if (!data.success || (data.errors && data.errors.length > 0)) {
      const errMsg =
        data.errors?.map((e) => e.message).join(", ") || "Cloudflare D1 execution failed";
      Logger.error(`[Cloudflare D1 Error]: ${errMsg}`);
      throw new Error(`[Cloudflare D1]: ${errMsg}`);
    }

    return (
      data.result?.[0] || {
        results: [],
        success: true,
        meta: { duration: 0, rows_read: 0, rows_written: 0 },
      }
    );
  }

  /**
   * Ensure schema columns exist on Cloudflare D1 (e.g. image & remark in AttendanceLog)
   */
  async ensureSchema(): Promise<void> {
    if (this.schemaChecked) return;
    this.schemaChecked = true;

    try {
      await this.rawQuery("ALTER TABLE AttendanceLog ADD COLUMN image TEXT;");
      Logger.info("[Cloudflare D1] Added column 'image' to AttendanceLog");
    } catch {
      // Ignore if column already exists
    }

    try {
      await this.rawQuery("ALTER TABLE AttendanceLog ADD COLUMN remark TEXT;");
      Logger.info("[Cloudflare D1] Added column 'remark' to AttendanceLog");
    } catch {
      // Ignore if column already exists
    }
  }
}

export const d1Client = new CloudflareD1Client();
