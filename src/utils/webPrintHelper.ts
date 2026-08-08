// utils/webPrintHelper.ts

let printInFlight = false;

function waitForImages(
  container: HTMLElement,
  timeoutMs = 1500,
): Promise<void> {
  const imgs = Array.from(container.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();

  const loaders = imgs.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.addEventListener("load", () => resolve(), { once: true });
      img.addEventListener("error", () => resolve(), { once: true }); // don't block forever on a broken image
    });
  });

  return Promise.race([
    Promise.all(loaders).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)), // hard cap so a slow/dead image can't stall printing
  ]);
}

function doubleRAF(): Promise<void> {
  // ensures the browser has actually committed a paint before we snapshot for print
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function printHtmlOnWeb(html: string): void {
  if (typeof window === "undefined") return;
  if (printInFlight) return;
  printInFlight = true;

  const releaseLock = () => {
    setTimeout(() => {
      printInFlight = false;
    }, 800);
  };

  // 1. Ensure @media print rules exist in document.head of the main window
  let styleEl = document.getElementById("mobile-print-global-style");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "mobile-print-global-style";
    styleEl.innerHTML = `
      @media print {
        body > *:not(#mobile-print-container) {
          display: none !important;
        }
        #mobile-print-container {
          display: block !important;
          position: static !important;
          width: 100% !important;
          height: auto !important;
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #mobile-print-container * {
          visibility: visible !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 2. Extract body content and inline <style> elements from report HTML
  let bodyContent = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    bodyContent = bodyMatch[1];
  }

  let headStyles = "";
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatches) {
    headStyles = styleMatches.join("\n");
  }

  // 3. Populate #mobile-print-container in document.body
  let container = document.getElementById("mobile-print-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "mobile-print-container";
    // hidden outside of print media so it never shows on the live page
    container.style.display = "none";
    document.body.appendChild(container);
  }
  container.innerHTML = headStyles + bodyContent;

  const isMobileWeb =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // 4. Mobile Web: trigger main window.print() so Mobile Chrome/Safari applies @media print
  if (isMobileWeb) {
    (async () => {
      // let the injected markup actually load/paint before snapshotting for print
      await waitForImages(container!);
      await doubleRAF();

      window.print();
      releaseLock();
      setTimeout(() => {
        if (container) container.innerHTML = "";
      }, 1000);
    })();
    return;
  }

  // 5. Desktop Web: iframe printing
  let iframe = document.getElementById(
    "web-print-iframe",
  ) as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "web-print-iframe";
    iframe.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    releaseLock();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch (e) {
      window.print();
    } finally {
      releaseLock();
    }
  }, 250);
}
