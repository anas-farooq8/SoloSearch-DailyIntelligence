// Shared constants across the application

// Group ID to Name Mapping
export const GROUP_MAPPING: Record<string, string> = {
  "1": "NHS Contracts",
  "2": "Startup Funding & Grants",
  "3": "HealthTech Media Coverage",
}

// Helper function to get group display name
export function getGroupDisplayName(groupId: string | null | undefined): string {
  if (!groupId) return "Unknown"
  return GROUP_MAPPING[groupId] || groupId
}

// Chart Colors Palette
export const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#a855f7", // violet
  "#84cc16", // lime
]

// Tag Constants
export const UNTAGGED_TAG = {
  name: "Untagged",
  color: "#94a3b8",
} as const

// Chart Style Constants
export const CHART_STYLES = {
  cartesianGrid: {
    strokeDasharray: "3 3",
    stroke: "#e2e8f0",
  },
  axis: {
    stroke: "#64748b",
    fontSize: "12px",
  },
  tooltip: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  labelLine: {
    stroke: "#64748b",
    strokeWidth: 1,
  },
} as const
