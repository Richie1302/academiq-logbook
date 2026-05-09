import jsPDF from "jspdf";

export interface PdfProfile {
  fullName?: string | null;
  school?: string | null;
  course?: string | null;
  siwesCompany?: string | null;
  department?: string | null;
  siwesDuration?: string | null;
}

export interface PdfEntry {
  id: number;
  date: string;
  rawActivity: string;
  rewrittenEntry?: string | null;
  week?: number | null;
  dayOfWeek?: string | null;
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function checkPageBreak(doc: jsPDF, y: number, needed = 30, margin = 20): number {
  if (y + needed > 277) {
    doc.addPage();
    return margin;
  }
  return y;
}

export function exportEntriesToPDF(
  entries: PdfEntry[],
  profile?: PdfProfile | null,
  filename = "siwes-logbook.pdf",
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - 2 * margin;
  let y = margin;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("SIWES LOGBOOK", pageW / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Student Industrial Work Experience Scheme", pageW / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 8;

  if (profile && Object.values(profile).some((v) => v)) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const fields: [string, string | null | undefined][] = [
      ["Student", profile.fullName],
      ["Institution", profile.school],
      ["Course", profile.course],
      ["Establishment", profile.siwesCompany],
      ["Department", profile.department],
      ["Duration", profile.siwesDuration],
    ];
    for (const [label, value] of fields) {
      if (value?.trim()) {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(value.trim(), margin + 28, y);
        y += 5;
      }
    }
    y += 2;
  }

  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  for (const entry of entries) {
    y = checkPageBreak(doc, y, 35, margin);

    const dayLabel = entry.dayOfWeek || "";
    const dateLabel = entry.date;
    const weekLabel = entry.week != null ? ` · Week ${entry.week}` : "";
    const headerText = [dayLabel, dayLabel ? ", " : "", dateLabel, weekLabel]
      .filter(Boolean)
      .join("");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(headerText, margin, y);
    y += 6;

    const body = entry.rewrittenEntry?.trim() || entry.rawActivity?.trim() || "";
    if (body) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      y = addWrappedText(doc, body, margin, y, contentW, 5);
      y += 4;
    }

    doc.setDrawColor(180);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    y += 7;
  }

  doc.save(filename);
}

export function exportSingleEntry(entry: PdfEntry, profile?: PdfProfile | null) {
  const safeName = (entry.dayOfWeek || entry.date).replace(/\s+/g, "-").toLowerCase();
  exportEntriesToPDF([entry], profile, `logbook-entry-${safeName}.pdf`);
}

export function exportWeekEntries(entries: PdfEntry[], week: number, profile?: PdfProfile | null) {
  exportEntriesToPDF(entries, profile, `logbook-week-${week}.pdf`);
}
