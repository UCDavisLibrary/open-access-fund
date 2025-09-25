import * as z from "zod";
import { submissionObject } from './submission.js';

const additionalSchema = z.object({
  id: z.string().uuid(),
  awardAmount: z.preprocess((val) => {
    if ( typeof val === 'string' ) {
      let f = parseFloat(val.replace(/,/g, ''));
      if (val.startsWith('$')) val = val.slice(1);
      if ( !isNaN(f) ) return f;
    }
    return val;
  }, z.number().min(0).optional()),
  accountingSystemNumber: z.string().max(255).optional()
});

const submissionPatchSchema = submissionObject
  .partial()
  .extend(additionalSchema.shape)
  .superRefine((data, ctx) => {
    // PATCH-specific cross-field logic (only enforce relationships if relevant keys are present)
    const hasAff = "authorAffiliation" in data;
    const hasOther = "authorAffiliationOther" in data;

    if (hasAff && data.authorAffiliation === "other") {
      const v = (data.authorAffiliationOther ?? "").trim();
      const max = 250;
      if (v.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["authorAffiliationOther"], message: "Required when affiliation is 'other'" });
      } else if (v.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: max,
          inclusive: true,
          path: ["authorAffiliationOther"],
          message: `Too big: expected string to have <=${max} characters`,
        });
      }
    }

    if (hasOther && data.authorAffiliation !== "other") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["authorAffiliationOther"],
        message: "Provide authorAffiliation='other' when setting authorAffiliationOther",
      });
    }

    // Require at least one field besides id
    const keys = Object.keys(data);
    if (!(keys.length > 1)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one field other than 'id' must be provided" });
    }
  })
  .transform((data) => {
    if ("authorAffiliation" in data && data.authorAffiliation !== "other") {
      delete data.authorAffiliationOther;
    }
    return data;
  });

export default submissionPatchSchema;
