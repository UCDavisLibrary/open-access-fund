import * as z from "zod";
import { requiredString, requiredNumber } from "./utils.js";
import fundAccountSchema from "./fundAccount.js";
import { DataDefinitions } from "../../../../../lib/utils/DataDefinitions.js";

export const submissionObject = z
  .object({
    authorLastName: requiredString().pipe(z.string().max(250)),
    authorFirstName: requiredString().pipe(z.string().max(250)),
    authorMiddleInitial: z.string().max(10).optional(),
    otherAuthors: z.string().max(2000).optional(),
    authorAffiliation: requiredString().pipe(z.enum(DataDefinitions.AFFILIATIONS.map(a => a.value))),
    authorAffiliationOther: z.string().trim().optional(),
    authorDepartment: requiredString().pipe(z.string().max(250)),
    authorEmail: requiredString().pipe(z.string().email().max(250)),
    authorPhone: requiredString().pipe(z.string().max(50)),
    financialContactFirstName: requiredString().pipe(z.string().max(250)),
    financialContactLastName: requiredString().pipe(z.string().max(250)),
    financialContactEmail: requiredString().pipe(z.string().email().max(250)),
    financialContactPhone: requiredString().pipe(z.string().max(50)),
    fundAccount: fundAccountSchema,
    requestedAmount: requiredNumber()
      .pipe(z.number().gt(0, {message: 'Must be more than $0'}).lte(1000, {message: 'Must be less than or equal to $1,000'}))
      .refine(v => (v*100) % 1 === 0, {message: 'Maximum two decimal places'}),
    articleTitle: requiredString().pipe(z.string().max(1000)),
    articleJournal: requiredString().pipe(z.string().max(1000)),
    articleStatus: requiredString().pipe(z.enum(DataDefinitions.ARTICLE_STATUSES.map(s => s.value))),
    articleLink: z.string().trim().url().max(2000).optional(),
    authorComment: z.string().max(2000).optional()
  });

const submissionSchema = submissionObject
  .superRefine((data, ctx) => {

    // if affiliation is other, otherAffiliation is required
    if (data.authorAffiliation === 'other') {
      const v = data.authorAffiliationOther?.trim() ?? '';
      const max = 250;
      if (v.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['authorAffiliationOther'],
          message: 'Required',
        });
      } else if (v.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: max,
          inclusive: true,
          path: ['authorAffiliationOther'],
          message: `Too big: expected string to have <=${max} characters`
        });
      }
    }
  })
  .transform(data => {
    if (data.authorAffiliation !== 'other') {
      delete data.authorAffiliationOther;
    }
    return data;
  });


  export default submissionSchema;
