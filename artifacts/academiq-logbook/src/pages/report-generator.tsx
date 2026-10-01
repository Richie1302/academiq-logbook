import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Loader2,
  User,
  FileSpreadsheet,
  Sliders,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  FileImage,
} from "lucide-react";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { getApiUrl, parseProfileDepartment } from "@/lib/api-config";

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export interface ReportImage {
  id: string;
  url: string;
  caption: string;
  chapter: "chapter2" | "chapter3" | "chapter4";
}

function cleanText(str?: string): string {
  if (!str) return "";
  let text = str;
  if (text.includes("supervisor::")) {
    text = parseProfileDepartment(text).department;
  }
  return text
    .replace(/\*+/g, "")
    .replace(/—|–/g, "-")
    .replace(/[\u2013\u2014]/g, "-")
    .trim();
}

export default function ReportGenerator() {
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false } });

  const [studentName, setStudentName] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [department, setDepartment] = useState("");
  const [institution, setInstitution] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [industrySupervisor, setIndustrySupervisor] = useState("");
  const [institutionalSupervisor, setInstitutionalSupervisor] = useState("");
  const [trainingDuration, setTrainingDuration] = useState("6 Months");
  const [reportMonth, setReportMonth] = useState("NOVEMBER");
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
  const [includeReferences, setIncludeReferences] = useState(false);

  // Page count & detail settings
  const [targetPageCount, setTargetPageCount] = useState<number>(10);
  const [customPageCount, setCustomPageCount] = useState<string>("");
  const [detailLevel, setDetailLevel] = useState<"concise" | "detailed" | "exhaustive">("detailed");

  // Photos & Figures state
  const [reportImages, setReportImages] = useState<ReportImage[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingChapters, setIsGeneratingChapters] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [aiChapters, setAiChapters] = useState<{
    dedication?: string;
    acknowledgement?: string;
    abstract?: string;
    certification?: string;
    chapter1Background?: string;
    chapter2Overview?: string;
    chapter3Narrative?: string;
    chapter4Challenges?: string;
    chapter5Conclusion?: string;
    references?: string;
  } | null>(null);

  // Auto-fill from user profile
  useEffect(() => {
    if (profile) {
      const p = profile as any;
      const parsedDept = parseProfileDepartment(p.department);
      if (p.fullName && !studentName) setStudentName(p.fullName);
      if (p.matricNo && !matricNo) setMatricNo(p.matricNo);
      if (parsedDept.department && !department) setDepartment(parsedDept.department);
      if (p.institution && !institution) setInstitution(p.institution);
      if (p.companyName && !companyName) setCompanyName(p.companyName);
      if (p.companyAddress && !companyAddress) setCompanyAddress(p.companyAddress);
      if ((parsedDept.supervisorName || p.supervisorName) && !industrySupervisor) {
        setIndustrySupervisor(parsedDept.supervisorName || p.supervisorName);
      }
    }
  }, [profile]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(getApiUrl("/api/entries/report-data"), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error("Failed to load report data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const activePageTarget = customPageCount ? (parseInt(customPageCount, 10) || 10) : targetPageCount;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ReportImage[] = [];
    let loadedCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const formattedCaption = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          newImages.push({
            id: Math.random().toString(36).substring(2, 9),
            url: event.target.result as string,
            caption: formattedCaption,
            chapter: "chapter3",
          });
        }
        loadedCount++;
        if (loadedCount === files.length) {
          setReportImages((prev) => [...prev, ...newImages]);
          toast.success(`Successfully uploaded ${newImages.length} image(s).`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id: string) => {
    setReportImages((prev) => prev.filter((img) => img.id !== id));
    toast.info("Image removed from report.");
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setReportImages((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  const handleUpdateChapter = (id: string, chapter: "chapter2" | "chapter3" | "chapter4") => {
    setReportImages((prev) => prev.map((img) => (img.id === id ? { ...img, chapter } : img)));
  };

  const getChapterImages = (ch: "chapter2" | "chapter3" | "chapter4") => {
    const chNum = ch === "chapter2" ? "2" : ch === "chapter3" ? "3" : "4";
    const filtered = reportImages.filter((img) => img.chapter === ch);
    return filtered.map((img, index) => ({
      ...img,
      figureNumber: `Fig ${chNum}.${index + 1}`,
    }));
  };

  const handleGenerateAiChapters = async () => {
    if (!reportData?.totalEntries || reportData.totalEntries === 0) {
      toast.error("No logbook entries found. Please add or import your daily logbook entries first before generating a technical report.");
      return;
    }
    setIsGeneratingChapters(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(getApiUrl("/api/entries/report-generate-chapters"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          companyName,
          department,
          institution,
          targetPageCount: activePageTarget,
          detailLevel,
        }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server error while generating report chapters.");
      }

      if (!res.ok) throw new Error(data.error || "Failed to generate report chapters.");

      setAiChapters(data);
      toast.success(`Generated technical report content formatted strictly following standard institutional report structure!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report content.");
    } finally {
      setIsGeneratingChapters(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const reportHtml = document.getElementById("siwes-report-document")?.innerHTML;
    if (!reportHtml) {
      toast.error("Nothing to export");
      return;
    }

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
      "xmlns:w='urn:schemas-microsoft-com:office:word' "+
      "xmlns='http://www.w3.org/TR/REC-html40'>"+
      "<head><meta charset='utf-8'><title>SIWES Technical Report</title><style>"+
      "@page Section1 { size: 8.5in 11.0in; margin: 1.0in 1.0in 1.0in 1.0in; mso-header-margin: 0.5in; mso-footer-margin: 0.5in; mso-paper-source: 0; }"+
      "div.Section1 { page: Section1; }"+
      "body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.5; color: #000000; }"+
      "h1 { font-family: 'Times New Roman', Times, serif; font-size: 12pt; text-align: center; font-weight: bold; text-transform: uppercase; margin-top: 18pt; margin-bottom: 8pt; color: #000000; page-break-after: avoid; }"+
      "h2 { font-family: 'Times New Roman', Times, serif; font-size: 12pt; text-align: left; font-weight: bold; text-transform: uppercase; margin-top: 16pt; margin-bottom: 6pt; border-bottom: 1px solid #000000; padding-bottom: 2pt; color: #000000; page-break-after: avoid; }"+
      "h3 { font-family: 'Times New Roman', Times, serif; font-size: 12pt; text-align: left; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; color: #000000; page-break-after: avoid; }"+
      "h4 { font-family: 'Times New Roman', Times, serif; font-size: 12pt; text-align: left; font-weight: bold; margin-top: 10pt; margin-bottom: 4pt; color: #000000; page-break-after: avoid; }"+
      "p, li, span, td, th { font-family: 'Times New Roman', Times, serif; font-size: 10pt; color: #000000; line-height: 1.5; text-align: justify; }"+
      "table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 10pt; }"+
      "th, td { border: 1px solid #000000; padding: 4pt 6pt; text-align: left; font-size: 10pt; color: #000000; }"+
      "img { max-width: 450px; height: auto; display: block; margin: 10pt auto; }"+
      ".figure-caption { text-align: center; font-size: 10pt; font-weight: bold; font-style: italic; margin-top: 4pt; margin-bottom: 12pt; color: #000000; }"+
      ".page-break { page-break-before: always; mso-break-type: page-break; break-before: page; }"+
      "</style></head><body><div class='Section1'>";
    const footer = "</div></body></html>";
    const sourceHTML = header + reportHtml + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${studentName || "SIWES"}_Technical_Report_${activePageTarget}Pages.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    toast.success("Downloaded Word Document (.doc)");
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-16 print:p-0">
      {/* Non-printable header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">SIWES Technical Report Generator</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Auto-compiles your daily logbook history into standard institutional report layout &amp; page sequence.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
          <Button onClick={handleDownloadDoc} className="gap-2">
            <Download className="h-4 w-4" /> Export Word (.doc)
          </Button>
        </div>
      </div>

      <Tabs defaultValue="configure" className="print:hidden">
        <TabsList className="grid grid-cols-3 max-w-xl">
          <TabsTrigger value="configure" className="gap-2">
            <User className="h-4 w-4" /> 1. Configuration
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-2">
            <ImageIcon className="h-4 w-4" /> 2. Photos & Figures ({reportImages.length})
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> 3. Full Preview
          </TabsTrigger>
        </TabsList>

        {/* 1. Configuration tab */}
        <TabsContent value="configure" className="mt-4 space-y-6">
          <Card className="border-primary/20 bg-primary/[0.01]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Report Length & Detail Customization</CardTitle>
              </div>
              <CardDescription>
                Choose how many pages and how detailed you want your AI-generated technical report to be.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Target Page Length</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    [5, "5 Pages (Concise)"],
                    [10, "10 Pages (Standard)"],
                    [15, "15 Pages (Detailed)"],
                    [20, "20+ Pages (Exhaustive)"],
                  ].map(([count, label]) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => { setTargetPageCount(count as number); setCustomPageCount(""); }}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all text-center ${
                        targetPageCount === count && !customPageCount
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="customPages">Custom Target Pages (Optional)</Label>
                  <Input
                    id="customPages"
                    type="number"
                    min="3"
                    max="50"
                    placeholder="e.g. 8 or 12 pages"
                    value={customPageCount}
                    onChange={(e) => setCustomPageCount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Technical Detail Depth</Label>
                  <div className="flex rounded-lg border p-1 bg-muted/40">
                    {(["concise", "detailed", "exhaustive"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDetailLevel(level)}
                        className={`flex-1 py-1.5 text-xs font-medium capitalize rounded-md transition-colors ${
                          detailLevel === level ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-muted-foreground">
                  Current Target: <span className="font-bold text-foreground">{activePageTarget} Pages</span> • <span className="capitalize font-bold text-foreground">{detailLevel} Depth</span>
                </div>
                <Button
                  onClick={handleGenerateAiChapters}
                  disabled={isGeneratingChapters}
                  className="gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md"
                >
                  {isGeneratingChapters ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGeneratingChapters ? "Generating AI Prose..." : `✨ Generate ${activePageTarget}-Page Technical Report`}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Student & Establishment Info</CardTitle>
              <CardDescription>
                Auto-populated from your profile. Update anytime for title page and certificate.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Full Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="e.g. Emmanuel Chukwuemeka"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricNo">Matriculation / ID Number</Label>
                <Input
                  id="matricNo"
                  placeholder="e.g. 19/52HA042"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Academic Department</Label>
                <Input
                  id="department"
                  placeholder="e.g. Geology & Geotechnical Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">University / Polytechnic</Label>
                <Input
                  id="institution"
                  placeholder="e.g. University of Lagos (UNILAG)"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">IT / SIWES Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Geotech & Foundation Engineering Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industrySupervisor">Industry Supervisor Name</Label>
                <Input
                  id="industrySupervisor"
                  placeholder="e.g. Engr. O. Adebayo"
                  value={industrySupervisor}
                  onChange={(e) => setIndustrySupervisor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionalSupervisor">Institutional Supervisor / HOD Name</Label>
                <Input
                  id="institutionalSupervisor"
                  placeholder="e.g. Dr. O. A. Williams"
                  value={institutionalSupervisor}
                  onChange={(e) => setInstitutionalSupervisor(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Report Date &amp; Optional Sections</CardTitle>
              <CardDescription>
                Set the submission date shown on the title date page. Toggle optional sections on or off.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportMonth">Report Submission Month</Label>
                  <Input
                    id="reportMonth"
                    placeholder="e.g. NOVEMBER"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportYear">Report Submission Year</Label>
                  <Input
                    id="reportYear"
                    placeholder="e.g. 2025"
                    value={reportYear}
                    onChange={(e) => setReportYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1 border-t">
                <input
                  type="checkbox"
                  id="includeReferences"
                  checked={includeReferences}
                  onChange={(e) => setIncludeReferences(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <Label htmlFor="includeReferences" className="cursor-pointer select-none">
                  Include <strong>References</strong> section in report (optional)
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Photos & Figure Placement Manager tab */}
        <TabsContent value="photos" className="mt-4 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Workplace Photos & Smart Figure Placement</CardTitle>
              </div>
              <CardDescription>
                Upload photos of your field work, equipment, soil samples, or software screens. They will automatically be assigned figure numbers (e.g. Fig 3.1) and rendered in your report.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-xl p-6 text-center transition-colors bg-primary/[0.01]">
                <input
                  type="file"
                  id="reportPhotoUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="reportPhotoUpload" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Click to upload photos or diagrams</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports JPG, PNG, WEBP (Multiple files allowed)
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2 pointer-events-none gap-2">
                    <Plus className="h-4 w-4" /> Select Images
                  </Button>
                </label>
              </div>

              {reportImages.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Uploaded Report Figures ({reportImages.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {reportImages.map((img) => (
                      <div key={img.id} className="border rounded-xl p-4 flex gap-4 bg-card shadow-sm relative group">
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-24 h-24 object-cover rounded-lg border shrink-0"
                        />
                        <div className="flex-1 space-y-3 min-w-0">
                          <div>
                            <Label className="text-xs">Caption / Description</Label>
                            <Input
                              value={img.caption}
                              onChange={(e) => handleUpdateCaption(img.id, e.target.value)}
                              placeholder="e.g. Equipment operation in progress"
                              className="text-xs mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Insert into Report Chapter</Label>
                            <select
                              value={img.chapter}
                              onChange={(e) => handleUpdateChapter(img.id, e.target.value as any)}
                              className="w-full text-xs rounded-md border border-input bg-background px-3 py-1.5 shadow-sm mt-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="chapter2">Chapter 2: Establishment & Operations</option>
                              <option value="chapter3">Chapter 3: Working Experience & Projects (Recommended)</option>
                              <option value="chapter4">Chapter 4: Equipment & Technical Challenges</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-xl bg-muted/20 text-muted-foreground space-y-2">
                  <FileImage className="h-8 w-8 mx-auto opacity-50" />
                  <p className="text-sm font-medium">No photos uploaded yet</p>
                  <p className="text-xs max-w-md mx-auto">
                    Adding real photos of site visits, testing equipment, or technical setups elevates your report score significantly during university defenses!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <p className="text-sm text-muted-foreground mb-4">
            Viewing report formatted strictly according to standard institutional SIWES Report structure (Times New Roman, 12pt Headings, 10pt Body, Solid Black). Click **Export Word** or **Print PDF** at the top to save.
          </p>
        </TabsContent>
      </Tabs>

      {/* Printable / Rendered Document Container */}
      <div
        id="siwes-report-document"
        className="bg-white text-black p-8 md:p-14 border rounded-xl shadow-md leading-relaxed text-[10pt] space-y-12 print:border-none print:shadow-none print:p-0"
        style={{ fontFamily: "'Times New Roman', Times, serif", color: "#000000" }}
      >
        {/* PAGE 1: TITLE PAGE */}
        <div className="text-center py-12 space-y-6 min-h-[850px] flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-[12pt] font-bold uppercase tracking-wide text-black" style={{ fontSize: "12pt", color: "#000000" }}>
              TECHNICAL REPORT ON
            </h1>
            <h1 className="text-[12pt] font-bold uppercase tracking-wide text-black" style={{ fontSize: "12pt", color: "#000000" }}>
              STUDENT INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES)
            </h1>
            <p className="text-[10pt] uppercase font-bold text-black pt-2" style={{ fontSize: "10pt", color: "#000000" }}>
              UNDERTAKEN AT
            </p>
            <h2 className="text-[12pt] font-bold uppercase text-black" style={{ fontSize: "12pt", color: "#000000" }}>
              {companyName || "[COMPANY / ORGANIZATION NAME]"}
            </h2>
          </div>

          <div className="space-y-2 py-4">
            <p className="text-[10pt] uppercase text-black font-bold" style={{ fontSize: "10pt", color: "#000000" }}>
              PREPARED AND SUBMITTED BY
            </p>
            <p className="text-[12pt] font-bold uppercase text-black" style={{ fontSize: "12pt", color: "#000000" }}>
              {studentName || "[STUDENT FULL NAME]"}
            </p>
            <p className="text-[10pt] font-bold text-black" style={{ fontSize: "10pt", color: "#000000" }}>
              MATRIC NUMBER: {matricNo || "__________"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10pt] uppercase text-black font-bold" style={{ fontSize: "10pt", color: "#000000" }}>
              SUPERVISED BY
            </p>
            <p className="text-[12pt] font-bold uppercase text-black" style={{ fontSize: "12pt", color: "#000000" }}>
              {cleanText(industrySupervisor) || "[SUPERVISOR NAME]"}
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <p className="text-[10pt] uppercase text-black font-bold" style={{ fontSize: "10pt", color: "#000000" }}>
              SUBMITTED TO
            </p>
            <p className="text-[10pt] uppercase font-bold text-black" style={{ fontSize: "10pt", color: "#000000" }}>
              THE DEPARTMENT OF {cleanText(department)?.toUpperCase() || "[DEPARTMENT NAME]"},
            </p>
            <p className="text-[10pt] uppercase font-bold text-black" style={{ fontSize: "10pt", color: "#000000" }}>
              {cleanText(institution)?.toUpperCase() || "[UNIVERSITY / POLYTECHNIC]"}
            </p>
            <p className="text-[10pt] text-black pt-4 max-w-lg mx-auto" style={{ fontSize: "10pt", color: "#000000" }}>
              IN PARTIAL FULFILLMENT OF REQUIREMENTS FOR THE AWARD OF BSC. DEGREE IN {cleanText(department)?.toUpperCase() || "[FIELD OF STUDY]"}
            </p>
          </div>
        </div>

        {/* PAGE 2: DATE PAGE */}
        <div className="page-break text-center py-48 min-h-[400px] flex items-center justify-center" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <p className="text-[12pt] font-bold uppercase text-black tracking-widest" style={{ fontSize: "12pt", color: "#000000" }}>
            {reportMonth || "NOVEMBER"} {reportYear || new Date().getFullYear()}
          </p>
        </div>

        {/* PAGE 3: DEDICATION */}
        <div className="page-break space-y-6 pt-12 min-h-[400px]" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase text-black" style={{ fontSize: "12pt", color: "#000000" }}>
            DEDICATION
          </h2>
          <p className="text-justify leading-relaxed text-[10pt] text-black max-w-xl mx-auto" style={{ fontSize: "10pt", color: "#000000" }}>
            {cleanText(
              aiChapters?.dedication ||
                "This report is dedicated to God Almighty and my beloved family for their continuous love, guidance, and support throughout my academic journey."
            )}
          </p>
        </div>

        {/* PAGE 4: ACKNOWLEDGEMENT */}
        <div className="page-break space-y-6 pt-12 min-h-[500px]" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase text-black" style={{ fontSize: "12pt", color: "#000000" }}>
            ACKNOWLEDGEMENT
          </h2>
          <div className="space-y-4 text-justify leading-relaxed text-[10pt] text-black max-w-2xl mx-auto" style={{ fontSize: "10pt", color: "#000000" }}>
            {cleanText(
              aiChapters?.acknowledgement ||
                `I sincerely appreciate the Almighty God for His guidance, protection, and wisdom throughout the period of my Student Industrial Work Experience Scheme (SIWES).\n\nMy profound gratitude goes to the management and staff of ${companyName || "the organization"} for providing me with the opportunity to undergo my industrial training in their technical unit. The knowledge and practical experience I gained under their supervision have greatly contributed to my professional development.\n\nI also extend my appreciation to my SIWES Coordinator, the Department of ${department || "my academic department"}, ${institution || "my institution"}, and the Industrial Training Fund (ITF) for organizing and supporting this program.\n\nFinally, I am deeply grateful to my supervisors, colleagues, and family for their constant encouragement, guidance, and motivation throughout the training period.`
            )}
          </div>
        </div>

        {/* PAGE 5: ABSTRACT */}
        <div className="page-break space-y-6 pt-12 min-h-[500px]" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase text-black" style={{ fontSize: "12pt", color: "#000000" }}>
            ABSTRACT
          </h2>
          <div className="space-y-4 text-justify leading-relaxed text-[10pt] text-black max-w-2xl mx-auto" style={{ fontSize: "10pt", color: "#000000" }}>
            {cleanText(
              aiChapters?.abstract ||
                `This report presents a detailed account of my six-month Student Industrial Work Experience Scheme (SIWES) at ${companyName || "the organization"}. The program provided a practical platform to apply theoretical knowledge gained in class to real-world scenarios within a professional environment. During the training, I deepened my understanding of technical workflows, equipment operations, and practical applications in diverse organizational functions.\n\nThrough active participation in the company's operations, I gained hands-on experience in technical maintenance, safety practices, equipment operation, and solution deployment. The experience not only enhanced my technical competence but also strengthened my problem-solving, teamwork, and communication skills. This report therefore serves as a comprehensive compilation of my core tasks, learning outcomes, and professional development during the SIWES program.`
            )}
          </div>
        </div>

        {/* PAGE 6: CERTIFICATION */}
        <div className="page-break space-y-6 pt-12 min-h-[500px]" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase text-black" style={{ fontSize: "12pt", color: "#000000" }}>
            CERTIFICATION
          </h2>
          <div className="space-y-6 text-justify leading-relaxed text-[10pt] text-black max-w-2xl mx-auto" style={{ fontSize: "10pt", color: "#000000" }}>
            <p>
              This is to certify that the six-month Industrial Training was duly carried out by <strong>{cleanText(studentName) || "__________"}</strong> of the Department of <strong>{cleanText(department) || "__________"}</strong> at <strong>{cleanText(companyName) || "the organization"}</strong> under the supervision of <strong>{cleanText(industrySupervisor) || "__________"}</strong>.
            </p>
            <p>
              This report is hereby presented to the Department of <strong>{cleanText(department) || "__________"}</strong>, <strong>{cleanText(institution) || "the institution"}</strong>, as part of the requirements for the Students Industrial Work Experience Scheme (SIWES).
            </p>

            <div className="grid grid-cols-2 gap-12 pt-16 text-center text-[10pt]">
              <div className="border-t border-black pt-2">
                <p className="font-bold text-[12pt] text-black" style={{ fontSize: "12pt", color: "#000000" }}>{cleanText(industrySupervisor) || "Industry Supervisor"}</p>
                <p className="text-black text-[10pt]" style={{ fontSize: "10pt", color: "#000000" }}>Industry Supervisor Signature &amp; Date</p>
              </div>
              <div className="border-t border-black pt-2">
                <p className="font-bold text-[12pt] text-black" style={{ fontSize: "12pt", color: "#000000" }}>{cleanText(institutionalSupervisor) || "Head of Department / SIWES Coordinator"}</p>
                <p className="text-black text-[10pt]" style={{ fontSize: "10pt", color: "#000000" }}>Institutional Supervisor Signature &amp; Date</p>
              </div>
            </div>
          </div>
        </div>

        {/* PAGES 7-9: TABLE OF CONTENTS */}
        <div className="page-break space-y-6 pt-12" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase text-black mb-8" style={{ fontSize: "12pt", color: "#000000" }}>
            TABLE OF CONTENTS
          </h2>
          <div className="space-y-2 text-[10pt] text-black font-serif max-w-2xl mx-auto" style={{ fontSize: "10pt", color: "#000000" }}>
            <div className="flex justify-between border-b border-dotted border-black pb-1">
              <span>TITLE PAGE</span>
              <span>1</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-black pb-1">
              <span>DEDICATION</span>
              <span>2</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-black pb-1">
              <span>ACKNOWLEDGEMENT</span>
              <span>3</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-black pb-1">
              <span>ABSTRACT</span>
              <span>4</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-black pb-1">
              <span>CERTIFICATION</span>
              <span>5</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-black pb-1">
              <span>TABLE OF CONTENTS</span>
              <span>6</span>
            </div>

            <div className="pt-4 font-bold uppercase text-[12pt]">CHAPTER 1 - BACKGROUND AND INTRODUCTION</div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>1.1 INTRODUCTION</span>
              <span>8</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>1.2 HISTORICAL BACKGROUND OF SIWES</span>
              <span>9</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>1.3 AIMS AND OBJECTIVES OF SIWES</span>
              <span>10</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>1.4 IMPORTANCE AND BENEFITS OF SIWES</span>
              <span>11</span>
            </div>

            <div className="pt-4 font-bold uppercase text-[12pt]">CHAPTER 2 - DESCRIPTION OF {companyName?.toUpperCase() || "THE INDUSTRIAL ESTABLISHMENT"}</div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>2.1 HISTORY AND ACTIVITIES OF THE COMPANY</span>
              <span>12</span>
            </div>
            <div className="flex justify-between pl-8 border-b border-dotted border-black pb-1 text-[9pt]">
              <span>2.1.1 HISTORY OF THE ESTABLISHMENT</span>
              <span>12</span>
            </div>
            <div className="flex justify-between pl-8 border-b border-dotted border-black pb-1 text-[9pt]">
              <span>2.1.2 ACTIVITIES OF THE ESTABLISHMENT</span>
              <span>13</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>2.2 MISSION AND VISION</span>
              <span>14</span>
            </div>
            <div className="flex justify-between pl-8 border-b border-dotted border-black pb-1 text-[9pt]">
              <span>2.2.1 MISSION</span>
              <span>14</span>
            </div>
            <div className="flex justify-between pl-8 border-b border-dotted border-black pb-1 text-[9pt]">
              <span>2.2.2 VISION</span>
              <span>14</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>2.3 CORE VALUES</span>
              <span>15</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>2.4 STRUCTURE AND ORGANOGRAM</span>
              <span>16</span>
            </div>

            <div className="pt-4 font-bold uppercase text-[12pt]">CHAPTER 3 - WORKING EXPERIENCE</div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>3.1 TOOLS AND TECHNOLOGIES USED</span>
              <span>19</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>3.2 TECHNICAL CONCEPTS</span>
              <span>21</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>3.3 PROJECTS COMPLETED & FIELD/LAB WORK</span>
              <span>23</span>
            </div>

            <div className="pt-4 font-bold uppercase text-[12pt]">CHAPTER 4 - SUMMARY, CHALLENGES ENCOUNTERED, RECOMMENDATIONS AND CONCLUSION</div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>4.1 SUMMARY OF ACTIVITIES</span>
              <span>31</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>4.2 CHALLENGES ENCOUNTERED</span>
              <span>32</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>4.3 RECOMMENDATIONS</span>
              <span>34</span>
            </div>
            <div className="flex justify-between pl-4 border-b border-dotted border-black pb-1">
              <span>4.4 CONCLUSION</span>
              <span>36</span>
            </div>

            {includeReferences && (
              <div className="flex justify-between pt-4 font-bold uppercase text-[12pt]">
                <span>REFERENCES</span>
                <span>37</span>
              </div>
            )}
          </div>
        </div>

        {/* CHAPTER 1 */}
        <div className="page-break space-y-4 pt-8" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black" style={{ fontSize: "12pt", color: "#000000" }}>
            CHAPTER ONE
          </h2>
          <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black pb-4" style={{ fontSize: "12pt", color: "#000000" }}>
            BACKGROUND AND INTRODUCTION
          </h2>

          <h3 className="font-bold text-[12pt] text-black pt-2" style={{ fontSize: "12pt", color: "#000000" }}>1.1 INTRODUCTION</h3>
          <p className="text-justify leading-relaxed whitespace-pre-line text-[10pt] text-black" style={{ fontSize: "10pt", color: "#000000" }}>
            {cleanText(
              aiChapters?.chapter1Background ||
                `The Students Industrial Work Experience Scheme (SIWES) is the accepted skills training programme, which forms part of the approved minimum academic standards in the various degree programmes for all the Nigerian universities. It is an effort to bridge the gap existing between theory and practice of engineering and technology, medical science, physical science, biological science, agriculture, management, and other professional educational programmes in the Nigerian tertiary institutions.\n\nThe scheme is a tripartite programme, involving the students, the universities and the industry (employers of labour). It is funded by the Federal government of Nigeria and jointly coordinated by the Industrial Training Fund (ITF) and the National Universities commission (NUC).`
            )}
          </p>
        </div>

        {/* CHAPTER 2 */}
        <div className="page-break space-y-4 pt-8" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black" style={{ fontSize: "12pt", color: "#000000" }}>
            CHAPTER TWO
          </h2>
          <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black pb-4" style={{ fontSize: "12pt", color: "#000000" }}>
            DESCRIPTION OF {companyName?.toUpperCase() || "THE INDUSTRIAL ESTABLISHMENT"}
          </h2>

          <p className="text-justify leading-relaxed whitespace-pre-line text-[10pt] text-black" style={{ fontSize: "10pt", color: "#000000" }}>
            {cleanText(
              aiChapters?.chapter2Overview ||
                `During the attachment period, training was conducted at ${companyName || "the industrial establishment"}. The company operates actively within the field of ${department || "technology and engineering"}, serving clients across regional and national markets.`
            )}
          </p>

          {/* Chapter 2 Figures */}
          {getChapterImages("chapter2").map((img) => (
            <div key={img.id} className="my-6 text-center">
              <img
                src={img.url}
                alt={img.caption}
                className="max-h-72 max-w-full mx-auto border border-black print:max-h-60"
                style={{ display: "block", margin: "0 auto" }}
              />
              <p className="figure-caption text-[10pt] font-bold text-black mt-2 italic" style={{ fontSize: "10pt", color: "#000000" }}>
                {img.figureNumber}: {cleanText(img.caption || "Establishment Operations & Facilities")}
              </p>
            </div>
          ))}
        </div>

        {/* CHAPTER 3 */}
        <div className="page-break space-y-4 pt-8" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black" style={{ fontSize: "12pt", color: "#000000" }}>
            CHAPTER THREE
          </h2>
          <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black pb-4" style={{ fontSize: "12pt", color: "#000000" }}>
            WORKING EXPERIENCE & PROJECTS COMPLETED
          </h2>

          <p className="text-justify leading-relaxed whitespace-pre-line text-[10pt] text-black mb-3" style={{ fontSize: "10pt", color: "#000000" }}>
            {cleanText(
              aiChapters?.chapter3Narrative ||
                `Over the course of the SIWES attachment, activities were conducted across daily and weekly schedules. Below is the full compiled logbook breakdown of primary technical accomplishments:`
            )}
          </p>

          {/* Chapter 3 Figures */}
          {getChapterImages("chapter3").map((img) => (
            <div key={img.id} className="my-6 text-center">
              <img
                src={img.url}
                alt={img.caption}
                className="max-h-72 max-w-full mx-auto border border-black print:max-h-60"
                style={{ display: "block", margin: "0 auto" }}
              />
              <p className="figure-caption text-[10pt] font-bold text-black mt-2 italic" style={{ fontSize: "10pt", color: "#000000" }}>
                {img.figureNumber}: {cleanText(img.caption || "Technical Work & Project Procedure")}
              </p>
            </div>
          ))}
        </div>

        {/* CHAPTER 4 */}
        <div className="page-break space-y-4 pt-8" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black" style={{ fontSize: "12pt", color: "#000000" }}>
            CHAPTER FOUR
          </h2>
          <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black pb-4" style={{ fontSize: "12pt", color: "#000000" }}>
            SUMMARY, CHALLENGES ENCOUNTERED, RECOMMENDATIONS AND CONCLUSION
          </h2>

          <p className="text-justify leading-relaxed whitespace-pre-line text-[10pt] text-black" style={{ fontSize: "10pt", color: "#000000" }}>
            {cleanText(
              aiChapters?.chapter4Challenges ||
                `Hands-on technical work naturally introduced practical challenges. Key obstacles faced during operations included equipment calibration, field sampling constraints, and data verification. Solutions were systematically applied under the guidance of senior technical staff.`
            )}
          </p>

          <p className="text-justify leading-relaxed whitespace-pre-line text-[10pt] text-black pt-2" style={{ fontSize: "10pt", color: "#000000" }}>
            {cleanText(aiChapters?.chapter5Conclusion)}
          </p>

          {/* Chapter 4 Figures */}
          {getChapterImages("chapter4").map((img) => (
            <div key={img.id} className="my-6 text-center">
              <img
                src={img.url}
                alt={img.caption}
                className="max-h-72 max-w-full mx-auto border border-black print:max-h-60"
                style={{ display: "block", margin: "0 auto" }}
              />
              <p className="figure-caption text-[10pt] font-bold text-black mt-2 italic" style={{ fontSize: "10pt", color: "#000000" }}>
                {img.figureNumber}: {cleanText(img.caption || "Equipment & Technical Challenges Encountered")}
              </p>
            </div>
          ))}
        </div>

        {/* REFERENCES (optional) */}
        {includeReferences && (
          <div className="page-break space-y-4 pt-8" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
            <h2 className="text-[12pt] font-bold text-center uppercase tracking-wide text-black pb-4" style={{ fontSize: "12pt", color: "#000000" }}>
              REFERENCES
            </h2>
            <div className="space-y-3 text-justify leading-relaxed text-[10pt] text-black max-w-2xl mx-auto whitespace-pre-line" style={{ fontSize: "10pt", color: "#000000" }}>
              {aiChapters?.references
                ? cleanText(aiChapters.references)
                : <span className="italic text-gray-500">References will be generated when you click &ldquo;Generate Technical Report&rdquo; above. You may also type them manually here.</span>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
