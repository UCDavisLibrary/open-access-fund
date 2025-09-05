import * as z from "zod";
import fundAccountUtils from "../../../../../lib/utils/fundAccountUtils.js";
import { requiredString } from "./utils.js";

const fundAccount = z.
  preprocess(
    v => (v == null ? {} : v),
    z.object({
      fundType: requiredString().pipe(z.enum(fundAccountUtils.registry.map(ft => ft.value))),
      parts: z.object({
        entity: z.string().optional(),
        department: z.string().optional(),
        program: z.string().optional(),
        project: z.string().optional(),
        activity: z.string().optional(),
        organization: z.string().optional(),
        task: z.string().optional()
      }).catch({})
    })
  )
  .superRefine((data, ctx) => {
    const fundAccount = fundAccountUtils.registry.find(fa => fa.value === data.fundType);
    if ( !fundAccount ) return;
    for ( const part of fundAccount.components ){
      const v = (data.parts[part.value] ?? '').trim();
      if ( part.required && !v ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['parts', part.value],
          message: 'Required',
        });
        continue;
      }
      if ( v && part.length && part.length != v.length ){
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['parts', part.value],
          message: `Invalid length: expected ${part.length} characters`,
        });
      }
    }
  })
  .transform(data => {
    const fundAccount = fundAccountUtils.registry.find(fa => fa.value === data.fundType);
    const parts = {};
    for ( const part of fundAccount?.components || [] ){
      parts[part.value] = (data.parts[part.value] ?? '').trim();
    }
    data.parts = parts;
    return data;
  });

export default fundAccount;
