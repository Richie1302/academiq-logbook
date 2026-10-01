/**
 * Builds a clean, reliable API URL for fetch calls.
 * Sanitizes VITE_API_URL and strips trailing slashes/undefined paths.
 */
export function getApiUrl(path: string): string {
  const envUrl = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${envUrl}${cleanPath}`;
}

/**
 * Safely parses the department field, extracting supervisor name if encoded
 * as "supervisor::SupervisorName||DepartmentName".
 */
export function parseProfileDepartment(rawDept?: string | null): { supervisorName: string; department: string } {
  if (!rawDept) return { supervisorName: "", department: "" };
  if (rawDept.includes("supervisor::")) {
    const cleanStr = rawDept.slice(rawDept.indexOf("supervisor::") + "supervisor::".length);
    const parts = cleanStr.split("||");
    return {
      supervisorName: (parts[0] || "").trim(),
      department: (parts[1] || "").trim(),
    };
  }
  return { supervisorName: "", department: rawDept.trim() };
}
