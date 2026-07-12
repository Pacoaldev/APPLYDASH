import { z } from "zod";

function coerceOptionalDateString(val: unknown): string | null | undefined {
  if (val === undefined) return undefined;
  if (val === null || val === "") return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val.toISOString().split("T")[0];
  }
  if (typeof val === "string") return val;
  return null;
}

const optionalDateString = z.preprocess(
  coerceOptionalDateString,
  z.string().nullable().optional()
);

export const jobSchema = z.object({
  company: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  applicationLink: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  appliedDate: optionalDateString,
  location: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  nextFollowUpDate: optionalDateString,
  tags: z.union([z.array(z.string()), z.string()]).nullable().optional(),
});

export const updateJobSchema = jobSchema.extend({
  id: z.uuid(),
});

