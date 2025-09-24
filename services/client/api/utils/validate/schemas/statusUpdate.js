import * as z from "zod";
import { requiredString } from "./utils.js";
import models from '../../../../../lib/models/index.js';

const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: requiredString()
    .refine(async v => {
      let statuses = await models.submissionStatus.list();
      if ( statuses.error ) return false;
      statuses = statuses.res.rows;
      return statuses.some(s => s.status_id === v || s.name === v);
    }, {error: "Status is not a valid status name or id"}),
  disableEmail: z.boolean().optional(),
  comment: z.string().max(2000).optional(),
  awardAmount: z.preprocess((val) => {
    if ( typeof val === 'string' ) {
      let f = parseFloat(val.replace(/,/g, ''));
      if (val.startsWith('$')) val = val.slice(1);
      if ( !isNaN(f) ) return f;
    }
    return val;
  }, z.number().min(0).optional()),
  accountingSystemNumber: z.string().max(255).optional()
}).superRefine(async (data, ctx) => {
  const r = await models.submission.submissionIsStatus(data.id, data.status);
  if ( r.error ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['status'],
      message: "Submission status is not valid"
    });
  }
  if ( r.res ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['status'],
      message: "Submission is already in this status."
    });
  }
});

export default statusUpdateSchema;
