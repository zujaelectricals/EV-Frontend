import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { WalletTransaction } from "@/app/api/walletApi";
import { formatWalletTransactionType } from "@/lib/utils";

const PDF_MARGIN = 20;
const PDF_PAGE_WIDTH = 210; // A4 mm
const PDF_PAGE_HEIGHT = 297;
const LOGO_URL = "/Zuja_Logo-removebg-preview.png";
const COMPANY_NAME = "ZUJA ELECTRICAL INNOVATION PRIVATE LIMITED";

/** Load image from public URL and return as base64 data URL for jsPDF. */
function loadLogoAsDataUrl(): Promise<string> {
  return fetch(LOGO_URL)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Format amount for PDF: "Rs. 1,400.00" or "- Rs. 400.00" (ASCII, no symbol to avoid display issues). */
function formatAmountForPdf(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  const numStr = Math.abs(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `- Rs. ${numStr}` : `Rs. ${numStr}`;
}

/**
 * Generates a professional PDF of wallet transactions for the current page.
 */
export async function exportWalletTransactionsToPdf(
  transactions: WalletTransaction[],
  options: {
    pageNumber?: number;
    totalPages?: number;
    totalCount?: number;
    dateRange?: { start?: string; end?: string };
  } = {}
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { pageNumber = 1, totalPages = 1, totalCount = 0, dateRange } = options;

  // ---- Top: Company logo and name ----
  const TOP_SECTION_HEIGHT = 28;
  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await loadLogoAsDataUrl();
  } catch {
    // Proceed without logo if load fails
  }

  if (logoDataUrl) {
    const logoSize = 20;
    doc.addImage(
      logoDataUrl,
      "PNG",
      PDF_MARGIN,
      4,
      logoSize,
      logoSize
    );
  }

  doc.setTextColor(33, 37, 41);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const companyX = PDF_MARGIN + (logoDataUrl ? 24 : 0);
  doc.text(COMPANY_NAME, companyX, 18);

  // ---- Header block (Wallet Transactions) ----
  const BAR_TOP = TOP_SECTION_HEIGHT;
  const BAR_HEIGHT = 24;
  doc.setFillColor(41, 53, 86);
  doc.rect(0, BAR_TOP, PDF_PAGE_WIDTH, BAR_HEIGHT, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Wallet Transactions", PDF_MARGIN, BAR_TOP + 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subtitle =
    dateRange?.start || dateRange?.end
      ? `Date range: ${dateRange.start ?? "—"} to ${dateRange.end ?? "—"}`
      : "Transaction history export";
  doc.text(subtitle, PDF_MARGIN, BAR_TOP + 20);

  let y = BAR_TOP + BAR_HEIGHT + 8;
  doc.setTextColor(0, 0, 0);

  // ---- Meta line ----
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const generatedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(
    `Generated on ${generatedAt}  •  Page ${pageNumber} of ${totalPages}  •  Showing ${transactions.length} of ${totalCount} transactions`,
    PDF_MARGIN,
    y
  );
  y += 10;

  // ---- Table ----
  const head = [
    [
      "Type",
      "Amount",
      "TDS",
      "Balance Before",
      "Balance After",
      "Date",
    ] as string[],
  ];

  const body = transactions.map((t) => {
    const amount = parseFloat(t.amount);
    const tdsStr =
      t.tds_amount && parseFloat(t.tds_amount) > 0
        ? formatAmountForPdf(t.tds_amount)
        : "—";
    return [
      formatWalletTransactionType(t.transaction_type),
      formatAmountForPdf(amount),
      tdsStr,
      formatAmountForPdf(t.balance_before),
      formatAmountForPdf(t.balance_after),
      formatDate(t.created_at),
    ];
  });

  const tableWidth = 0.95 * PDF_PAGE_WIDTH; // 95% of viewport for better alignment
  const tableMargin = (PDF_PAGE_WIDTH - tableWidth) / 2;

  autoTable(doc, {
    head,
    body,
    startY: y,
    margin: { left: tableMargin, right: tableMargin },
    tableWidth,
    theme: "striped",
    headStyles: {
      fillColor: [66, 84, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [33, 37, 41],
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 46 }, // Type
      1: { cellWidth: 25 },
      2: { cellWidth: 19 },
      3: { cellWidth: 29 },
      4: { cellWidth: 29 },
      5: { cellWidth: 51 }, // Date - wide enough for "DD/MM/YYYY, HH:MM:SS am/pm" on one line
    },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `EV Nexus Platform  •  Wallet Transactions  •  Page ${data.pageNumber} of ${pageCount}`,
        PDF_PAGE_WIDTH / 2,
        PDF_PAGE_HEIGHT - 10,
        { align: "center" }
      );
    },
  });

  doc.save(
    `wallet-transactions-page-${pageNumber}-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}
