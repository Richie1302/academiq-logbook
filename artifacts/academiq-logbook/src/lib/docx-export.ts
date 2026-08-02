import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

export interface DocxProfile {
  fullName?: string | null;
  school?: string | null;
  course?: string | null;
  siwesCompany?: string | null;
  department?: string | null;
  siwesDuration?: string | null;
}

export interface DocxEntry {
  id: number;
  date: string;
  rawActivity: string;
  rewrittenEntry?: string | null;
  week?: number | null;
  dayOfWeek?: string | null;
}

const DEFAULT_FONT = "Times New Roman";

function createSectionHeader(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28, // 14pt
        font: DEFAULT_FONT,
      }),
    ],
  });
}

function createTextParagraph(text: string, bold = false, size = 24, italic = false) {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 360 }, // 1.5 line spacing
    children: [
      new TextRun({
        text,
        bold,
        italics: italic,
        size, // 24 = 12pt
        font: DEFAULT_FONT,
      }),
    ],
  });
}

export function exportEntriesToDocx(
  entries: DocxEntry[],
  profile?: DocxProfile | null,
  filename = "siwes-logbook.docx"
) {
  const children: any[] = [];

  // 1. Title Page Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: "STUDENT INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES)",
          bold: true,
          size: 32, // 16pt
          font: DEFAULT_FONT,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: "LOGBOOK MONTHLY / WEEKLY REPORTS",
          bold: true,
          size: 24, // 12pt
          font: DEFAULT_FONT,
          color: "555555",
        }),
      ],
    })
  );

  // 2. Student Details Table
  if (profile && Object.values(profile).some((v) => v)) {
    const fields: [string, string | null | undefined][] = [
      ["Student Name:", profile.fullName],
      ["Institution/School:", profile.school],
      ["Course of Study:", profile.course],
      ["Establishment/Company:", profile.siwesCompany],
      ["Department/Unit:", profile.department],
      ["Duration:", profile.siwesDuration],
    ];

    const tableRows = fields
      .filter(([_, val]) => val?.trim())
      .map(([label, val]) => {
        return new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
                      bold: true,
                      size: 22, // 11pt
                      font: DEFAULT_FONT,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: val?.trim() || "",
                      size: 22, // 11pt
                      font: DEFAULT_FONT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );

    // Spacer
    children.push(
      new Paragraph({
        spacing: { before: 400, after: 400 },
        children: [
          new TextRun({
            text: "_________________________________________________________________________________",
            color: "DDDDDD",
            font: DEFAULT_FONT,
          }),
        ],
      })
    );
  }

  // 3. Group entries by week
  const byWeek: Record<number, DocxEntry[]> = {};
  for (const entry of entries) {
    const w = entry.week ?? 0;
    if (!byWeek[w]) byWeek[w] = [];
    byWeek[w].push(entry);
  }

  const sortedWeeks = Object.keys(byWeek)
    .map(Number)
    .sort((a, b) => a - b);

  const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  sortedWeeks.forEach((week, weekIdx) => {
    // Add page break before every week except the first one (if profile was loaded)
    if (weekIdx > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // Week Heading
    children.push(createSectionHeader(`WEEK ${week} REPORT`));

    // Sort entries by day of week
    const weekEntries = byWeek[week].sort((a, b) => {
      const dayA = DAYS_ORDER.indexOf(a.dayOfWeek || "");
      const dayB = DAYS_ORDER.indexOf(b.dayOfWeek || "");
      return dayA - dayB;
    });

    weekEntries.forEach((entry) => {
      const dayLabel = entry.dayOfWeek || "";
      const dateLabel = entry.date;
      const headerText = `${dayLabel}${dayLabel ? ", " : ""}${dateLabel}`;

      // Day Title
      children.push(
        new Paragraph({
          spacing: { before: 180, after: 60 },
          children: [
            new TextRun({
              text: headerText,
              bold: true,
              size: 24, // 12pt
              font: DEFAULT_FONT,
            }),
          ],
        })
      );

      // Entry Text
      const body = entry.rewrittenEntry?.trim() || entry.rawActivity?.trim() || "No entry logged for this day.";
      children.push(createTextParagraph(body));

      // Divider line between days
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 100 },
          children: [
            new TextRun({
              text: "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
              color: "EEEEEE",
              size: 16,
              font: DEFAULT_FONT,
            }),
          ],
        })
      );
    });
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  // Pack and trigger download
  Packer.toBlob(doc).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }).catch((err) => {
    console.error("[DOCX_EXPORT_ERROR]", err);
  });
}

export function exportSingleEntryToDocx(entry: DocxEntry, profile?: DocxProfile | null) {
  const safeName = (entry.dayOfWeek || entry.date).replace(/\s+/g, "-").toLowerCase();
  exportEntriesToDocx([entry], profile, `logbook-entry-${safeName}.docx`);
}

export function exportWeekEntriesToDocx(entries: DocxEntry[], week: number, profile?: DocxProfile | null) {
  exportEntriesToDocx(entries, profile, `logbook-week-${week}.docx`);
}
