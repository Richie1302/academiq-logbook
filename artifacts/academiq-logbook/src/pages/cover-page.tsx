import { useState, useEffect } from "react";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileDown, BookOpen, Printer } from "lucide-react";
import jsPDF from "jspdf";

const COVER_STORAGE_KEY = "academiq_cover_data";

interface CoverData {
  matricNumber: string;
  faculty: string;
  level: string;
  companyAddress: string;
  itfCoordinator: string;
  supervisorName: string;
  startDate: string;
  endDate: string;
}

function loadCoverData(): CoverData {
  try {
    return JSON.parse(localStorage.getItem(COVER_STORAGE_KEY) || "{}");
  } catch {
    return {} as CoverData;
  }
}

function saveCoverData(data: CoverData) {
  localStorage.setItem(COVER_STORAGE_KEY, JSON.stringify(data));
}

function exportCoverPagePDF(
  data: CoverData,
  profile: { fullName?: string | null; school?: string | null; course?: string | null; siwesCompany?: string | null; department?: string | null; siwesDuration?: string | null } | null | undefined,
  filename = "siwes-cover-page.pdf"
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const margin = 20;

  // Outer border
  doc.setDrawColor(0);
  doc.setLineWidth(1.5);
  doc.rect(margin - 5, margin - 5, W - (margin - 5) * 2, H - (margin - 5) * 2);

  // Inner border
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, W - margin * 2, H - margin * 2);

  let y = 38;

  // Institution name
  const schoolName = (profile?.school || "YOUR UNIVERSITY NAME").toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const schoolLines = doc.splitTextToSize(schoolName, W - margin * 2 - 10);
  doc.text(schoolLines, W / 2, y, { align: "center" });
  y += schoolLines.length * 7 + 4;

  // SIWES heading
  doc.setFontSize(11);
  doc.text("STUDENT INDUSTRIAL WORK EXPERIENCE SCHEME", W / 2, y, { align: "center" });
  y += 7;
  doc.text("(SIWES)", W / 2, y, { align: "center" });
  y += 12;

  // Divider
  doc.setLineWidth(0.6);
  doc.line(margin + 5, y, W - margin - 5, y);
  y += 10;

  // Logbook title
  doc.setFontSize(14);
  doc.text("LOGBOOK", W / 2, y, { align: "center" });
  y += 16;

  // Details section
  const leftCol = margin + 8;
  const valueCol = 85;
  const lineH = 8;

  const fields: [string, string][] = [
    ["Name of Student", profile?.fullName || ""],
    ["Matric / ID Number", data.matricNumber || ""],
    ["Course of Study", profile?.course || ""],
    ["Faculty / College", data.faculty || ""],
    ["Level", data.level || ""],
    ["Department", profile?.department || ""],
  ];

  doc.setFontSize(10);
  for (const [label, value] of fields) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, leftCol, y);
    doc.setFont("helvetica", "normal");
    if (value) doc.text(value, valueCol, y);
    // Underline for value
    doc.setLineWidth(0.3);
    doc.line(valueCol - 2, y + 1.5, W - margin - 8, y + 1.5);
    y += lineH;
  }

  y += 6;
  doc.setLineWidth(0.6);
  doc.line(margin + 5, y, W - margin - 5, y);
  y += 10;

  // Attachment section
  const attachFields: [string, string][] = [
    ["Name of Establishment", profile?.siwesCompany || ""],
    ["Address", data.companyAddress || ""],
    ["Department / Unit", profile?.department || ""],
    ["Industry Supervisor", data.supervisorName || ""],
    ["ITF Supervisor / Coordinator", data.itfCoordinator || ""],
  ];

  doc.setFontSize(10);
  for (const [label, value] of attachFields) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, leftCol, y);
    doc.setFont("helvetica", "normal");
    if (value) doc.text(value, valueCol, y);
    doc.setLineWidth(0.3);
    doc.line(valueCol - 2, y + 1.5, W - margin - 8, y + 1.5);
    y += lineH;
  }

  y += 8;
  doc.setLineWidth(0.6);
  doc.line(margin + 5, y, W - margin - 5, y);
  y += 10;

  // Training period
  doc.setFontSize(10);
  const period = profile?.siwesDuration ||
    (data.startDate && data.endDate ? `${data.startDate} – ${data.endDate}` : "");
  doc.setFont("helvetica", "bold");
  doc.text("Training Period:", leftCol, y);
  doc.setFont("helvetica", "normal");
  if (period) doc.text(period, valueCol, y);
  doc.setLineWidth(0.3);
  doc.line(valueCol - 2, y + 1.5, W - margin - 8, y + 1.5);
  y += lineH * 2;

  // Signature block
  const sigY = H - margin - 30;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Student sig
  doc.line(margin + 8, sigY, margin + 60, sigY);
  doc.text("Student's Signature & Date", margin + 8, sigY + 5);

  // Supervisor sig
  const supX = W / 2 + 5;
  doc.line(supX, sigY, supX + 55, sigY);
  doc.text("Supervisor's Signature & Date", supX, sigY + 5);

  // ITF footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text("Industrial Training Fund (ITF) — SIWES Student Logbook", W / 2, H - margin - 8, { align: "center" });
  doc.setTextColor(0);

  doc.save(filename);
}

export default function CoverPage() {
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false } });

  const [data, setData] = useState<CoverData>(() => {
    const defaults = {
      matricNumber: "",
      faculty: "",
      level: "",
      companyAddress: "",
      itfCoordinator: "",
      supervisorName: "",
      startDate: "",
      endDate: "",
    };
    return { ...defaults, ...loadCoverData() };
  });

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    saveCoverData(data);
  }, [data]);

  const handleChange = (field: keyof CoverData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleDownload = () => {
    exportCoverPagePDF(data, profile, "siwes-cover-page.pdf");
    toast.success("Cover page downloaded!");
  };

  const fullName = profile?.fullName || "—";
  const school = profile?.school || "—";
  const course = profile?.course || "—";
  const company = profile?.siwesCompany || "—";
  const department = profile?.department || "—";
  const duration = profile?.siwesDuration || (data.startDate && data.endDate ? `${data.startDate} – ${data.endDate}` : "—");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cover Page Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Fill in the fields below to generate a print-ready SIWES logbook cover page.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Student Details
          </p>

          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={fullName === "—" ? "" : fullName} disabled placeholder="From your profile" className="bg-muted/30" />
            <p className="text-xs text-muted-foreground">Edit in your <a href="/profile" className="underline text-primary">Profile page</a></p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="matricNumber">Matric / ID Number</Label>
            <Input
              id="matricNumber"
              value={data.matricNumber}
              onChange={handleChange("matricNumber")}
              placeholder="e.g. FUT/2021/CSC/001"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Course of Study</Label>
            <Input value={course === "—" ? "" : course} disabled placeholder="From your profile" className="bg-muted/30" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faculty">Faculty / College</Label>
            <Input
              id="faculty"
              value={data.faculty}
              onChange={handleChange("faculty")}
              placeholder="e.g. Faculty of Engineering"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="level">Level / Year</Label>
            <Input
              id="level"
              value={data.level}
              onChange={handleChange("level")}
              placeholder="e.g. 300 Level"
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
            Attachment Details
          </p>

          <div className="space-y-1.5">
            <Label>Company / Establishment</Label>
            <Input value={company === "—" ? "" : company} disabled placeholder="From your profile" className="bg-muted/30" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Input
              id="companyAddress"
              value={data.companyAddress}
              onChange={handleChange("companyAddress")}
              placeholder="e.g. 10 Marina, Lagos Island"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supervisorName">Industry Supervisor's Name</Label>
            <Input
              id="supervisorName"
              value={data.supervisorName}
              onChange={handleChange("supervisorName")}
              placeholder="e.g. Mr. Femi Adeyemi"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="itfCoordinator">ITF Coordinator's Name</Label>
            <Input
              id="itfCoordinator"
              value={data.itfCoordinator}
              onChange={handleChange("itfCoordinator")}
              placeholder="e.g. Dr. Amaka Obi"
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
            Training Period
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={data.startDate}
                onChange={handleChange("startDate")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={data.endDate}
                onChange={handleChange("endDate")}
              />
            </div>
          </div>

          <Button
            id="download-cover-btn"
            onClick={handleDownload}
            size="lg"
            className="w-full mt-2"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download Cover Page PDF
          </Button>
        </div>

        {/* Live Preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</p>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1.5 text-xs text-muted-foreground">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>

          <Card className="border-2 border-foreground/80 overflow-hidden bg-white text-black shadow-xl">
            <CardContent className="p-0">
              {/* Double border inner */}
              <div className="m-2 border border-foreground/60 p-5 space-y-3 min-h-[600px] flex flex-col">
                {/* School name */}
                <div className="text-center space-y-0.5">
                  <p className="font-bold text-sm leading-tight uppercase">
                    {profile?.school || "YOUR UNIVERSITY NAME"}
                  </p>
                  <p className="text-xs font-semibold tracking-wide">STUDENT INDUSTRIAL WORK EXPERIENCE SCHEME</p>
                  <p className="text-xs font-semibold">(SIWES)</p>
                </div>

                <div className="border-t border-foreground/60" />

                <div className="text-center">
                  <p className="font-bold text-base tracking-widest">LOGBOOK</p>
                </div>

                {/* Student fields */}
                <div className="space-y-1.5 text-xs">
                  {[
                    ["Name of Student", fullName === "—" ? "" : fullName],
                    ["Matric / ID Number", data.matricNumber],
                    ["Course of Study", course === "—" ? "" : course],
                    ["Faculty / College", data.faculty],
                    ["Level", data.level],
                    ["Department", department === "—" ? "" : department],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2 items-end">
                      <span className="font-semibold shrink-0 w-[130px]">{label}:</span>
                      <span className="flex-1 border-b border-foreground/50 min-w-0 pb-0.5 text-xs truncate">
                        {value || <span className="opacity-0">_</span>}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-foreground/60" />

                {/* Attachment fields */}
                <div className="space-y-1.5 text-xs">
                  {[
                    ["Name of Establishment", company === "—" ? "" : company],
                    ["Address", data.companyAddress],
                    ["Department / Unit", department === "—" ? "" : department],
                    ["Industry Supervisor", data.supervisorName],
                    ["ITF Coordinator", data.itfCoordinator],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2 items-end">
                      <span className="font-semibold shrink-0 w-[130px]">{label}:</span>
                      <span className="flex-1 border-b border-foreground/50 min-w-0 pb-0.5 text-xs truncate">
                        {value || <span className="opacity-0">_</span>}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-foreground/60" />

                {/* Period */}
                <div className="flex gap-2 items-end text-xs">
                  <span className="font-semibold shrink-0 w-[130px]">Training Period:</span>
                  <span className="flex-1 border-b border-foreground/50 pb-0.5">
                    {duration === "—" ? "" : duration}
                  </span>
                </div>

                {/* Signature block */}
                <div className="mt-auto pt-6 flex justify-between text-xs">
                  <div className="space-y-1">
                    <div className="border-b border-foreground/60 w-36" />
                    <p>Student's Signature & Date</p>
                  </div>
                  <div className="space-y-1">
                    <div className="border-b border-foreground/60 w-36" />
                    <p>Supervisor's Signature & Date</p>
                  </div>
                </div>

                <p className="text-[9px] text-center text-foreground/60 mt-2">
                  Industrial Training Fund (ITF) — SIWES Student Logbook
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
