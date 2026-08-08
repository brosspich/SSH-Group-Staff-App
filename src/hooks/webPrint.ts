// hooks/webPrint.ts
import { ReceiptSettings } from "@/app/create/custom_receipt";
import { OrderData } from "@/components/sale/types";
import { buildReceiptHtml } from "@/utils/receiptHtmlBuilder";

export async function printReceiptOnWeb(
  order: OrderData,
  settings: ReceiptSettings,
): Promise<void> {
  const html = await buildReceiptHtml(order, settings);

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    throw new Error("Could not access print iframe document.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };
}
