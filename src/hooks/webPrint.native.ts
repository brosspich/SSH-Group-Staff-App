import { ReceiptSettings } from "@/app/create/custom_receipt";
import { OrderData } from "@/components/sale/types";

export const printReceiptOnWeb = async (
  _order: OrderData,
  _settings: ReceiptSettings,
): Promise<void> => {
  // Not available on native
};
