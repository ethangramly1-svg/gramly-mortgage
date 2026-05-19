export const CONTACT_EMAIL = "chris.gramly@clearmtg.com";
export const CONTACT_PHONE_DISPLAY = "(702) 767-4072";
export const CONTACT_PHONE_RAW = "+17027674072";
export const CONTACT_LOCATION = "Las Vegas, NV";
export const NMLS = "1984074";

/**
 * Mortgage pipeline stages. Order matters — used in both the CRM
 * column display and the dashboard pipeline chart.
 *
 * Terminal stages: funded (win), declined (lender no), withdrawn
 * (borrower walked). 'declined' and 'withdrawn' are intentionally
 * separated — different remediation playbooks.
 */
export const PIPELINE_STATUSES = [
  "new",
  "contacted",
  "pre-approved",
  "application",
  "underwriting",
  "funded",
  "declined",
  "withdrawn",
] as const;
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export const STATUS_COLORS: Record<PipelineStatus, string> = {
  "new":          "#5b9bff",  // cool blue — fresh
  "contacted":    "#4fd1c5",  // teal — in motion
  "pre-approved": "#d4b46a",  // gold — qualified
  "application":  "#a08eff",  // violet — paperwork
  "underwriting": "#f4a149",  // amber — review
  "funded":       "#4ade80",  // emerald — win
  "declined":     "#f87171",  // red — lender no
  "withdrawn":    "#9ca3af",  // gray — borrower walked
};
