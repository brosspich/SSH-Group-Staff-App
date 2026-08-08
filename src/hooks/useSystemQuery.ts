// useSystemQuery.ts
import { serviceUser } from "@/services/userService";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useRef, useState } from "react";

class ClientDbBuilder {
  private systemId: string;
  private table: string;
  private selectColumns: string | null = null;
  private filters: ((item: any) => boolean)[] = [];
  private sortField: string | null = null;
  private sortAscending = true;
  private limitCount: number | null = null;
  private isSingle = false;
  private insertData: any = null;
  private updateData: any = null;
  private isDelete = false;

  constructor(systemId: string, table: string) {
    this.systemId = systemId;
    // Normalize physical per-tenant table names to centralized JSONB columns
    let normalized = table;
    if (normalized.startsWith(`${systemId}-`)) {
      normalized = normalized.substring(systemId.length + 1);
    }
    this.table = normalized;
  }

  select(columns: string) {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => {
      if (column === "is_active" && value === true) {
        return item.is_active !== false;
      }
      return item[column] === value;
    });
    return this;
  }

  ilike(column: string, pattern: string) {
    const cleanPattern = pattern.replace(/%/g, "").toLowerCase();
    this.filters.push((item) =>
      String(item[column] ?? "")
        .toLowerCase()
        .includes(cleanPattern),
    );
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => {
      const v = item[column];
      if (v == null) return false;
      return v >= value;
    });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((item) => {
      const v = item[column];
      if (v == null) return false;
      return v < value;
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sortField = column;
    this.sortAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(itemOrItems: any) {
    this.insertData = itemOrItems;
    return this;
  }

  update(payload: any) {
    this.updateData = payload;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  async execute() {
    try {
      // 1. Fetch current row from database
      const { data: row, error: fetchError } = await supabase
        .from("pos_admin_data")
        .select(this.table)
        .eq("system-id", this.systemId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        return { data: null, error: fetchError };
      }

      let currentArr = (row as any)?.[this.table] || [];

      if (!Array.isArray(currentArr)) {
        currentArr = [];
      }

      let resultData: any = null;
      let needsUpdate = false;

      // 2. Perform write operations
      if (this.insertData !== null) {
        const items = Array.isArray(this.insertData)
          ? this.insertData
          : [this.insertData];
        const enrichedItems = items.map((item) => {
          const newItem = { ...item };

          if (!newItem.created_at) {
            newItem.created_at = new Date().toISOString();
          }

          if (this.table === "pos-products") {
            if (newItem.is_active === undefined) {
              newItem.is_active = true;
            }
            if (!newItem.id) {
              let maxNum = 0;
              for (const p of currentArr) {
                if (
                  p.id &&
                  typeof p.id === "string" &&
                  p.id.startsWith("PRD-")
                ) {
                  const num = parseInt(p.id.substring(4), 10);
                  if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                  }
                }
              }
              const nextNum = maxNum + 1;
              newItem.id = `PRD-${String(nextNum).padStart(4, "0")}`;
            }
          }

          return newItem;
        });
        currentArr = [...currentArr, ...enrichedItems];
        resultData = Array.isArray(this.insertData)
          ? enrichedItems
          : enrichedItems[0];
        needsUpdate = true;
      } else if (this.updateData !== null) {
        let updatedItems: any[] = [];
        currentArr = currentArr.map((item: any) => {
          const matches = this.filters.every((filter) => filter(item));
          if (matches) {
            const updated = { ...item, ...this.updateData };
            updatedItems.push(updated);
            return updated;
          }
          return item;
        });
        resultData = updatedItems;
        needsUpdate = true;
      } else if (this.isDelete) {
        const deletedItems: any[] = [];
        currentArr = currentArr.filter((item: any) => {
          const matches = this.filters.every((filter) => filter(item));
          if (matches) {
            deletedItems.push(item);
            return false;
          }
          return true;
        });
        resultData = deletedItems;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const rowExists = row !== null;

        if (rowExists) {
          const { error: updateError } = await supabase
            .from("pos_admin_data")
            .update({ [this.table]: currentArr })
            .eq("system-id", this.systemId);

          if (updateError) {
            return { data: null, error: updateError };
          }
        } else {
          const { error: insertError } = await supabase
            .from("pos_admin_data")
            .insert({
              "system-id": this.systemId,
              [this.table]: currentArr,
            });

          if (insertError) {
            return { data: null, error: insertError };
          }
        }

        if (this.isSingle && Array.isArray(resultData)) {
          return { data: resultData[0] || null, error: null };
        }
        return { data: resultData, error: null };
      }

      // 3. Read/Query operations
      let filteredArr = [...currentArr];

      // Apply filters
      for (const filterFn of this.filters) {
        filteredArr = filteredArr.filter(filterFn);
      }

      // Apply sorting
      if (this.sortField) {
        filteredArr.sort((a, b) => {
          const valA = a[this.sortField!];
          const valB = b[this.sortField!];
          if (valA == null) return this.sortAscending ? 1 : -1;
          if (valB == null) return this.sortAscending ? -1 : 1;
          if (typeof valA === "string" && typeof valB === "string") {
            return this.sortAscending
              ? valA.localeCompare(valB)
              : valB.localeCompare(valA);
          }
          return this.sortAscending ? valA - valB : valB - valA;
        });
      }

      // Apply limit
      if (this.limitCount !== null) {
        filteredArr = filteredArr.slice(0, this.limitCount);
      }

      // Apply single
      if (this.isSingle) {
        if (filteredArr.length === 0) {
          return {
            data: null,
            error: { message: "No rows found", code: "PGRST116" },
          };
        }
        return { data: filteredArr[0], error: null };
      }

      return { data: filteredArr, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async then(
    onfulfilled?: (value: any) => any,
    onrejected?: (reason: any) => any,
  ) {
    try {
      const result = await this.execute();
      return onfulfilled ? onfulfilled(result) : result;
    } catch (error) {
      if (onrejected) {
        return onrejected(error);
      }
      throw error;
    }
  }
}

export function useSystemQuery() {
  const [system_id, setSystemId] = useState<string | null>(null);
  const systemIdRef = useRef<string | null>(null);

  useEffect(() => {
    serviceUser.get().then((user) => {
      if (user?.system_id) {
        systemIdRef.current = user.system_id;
        setSystemId(user.system_id);
      }
    });
  }, []);

  const resolveTable = useCallback((table: string): string => {
    const sid = systemIdRef.current;
    if (sid && !table.startsWith(`${sid}-`)) {
      return `${sid}-${table}`;
    }
    return table;
  }, []);

  const from = useCallback((table: string, columns?: string) => {
    const sid = systemIdRef.current;
    if (!sid) throw new Error(`system_id not ready (table: ${table})`);
    const builder = new ClientDbBuilder(sid, table);
    if (columns) {
      builder.select(columns);
    }
    return builder as any;
  }, []);

  return { from, resolveTable, system_id, ready: !!system_id };
}
