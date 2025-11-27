// app/(authenticated)/evaluation/admin/access/seniority.ts

export const SENIORITY_LEVELS = [
  "Intern",
  "Junior",
  "Mid",
  "Senior",
  "Lead",
] as const

export type SeniorityLevel = (typeof SENIORITY_LEVELS)[number]
