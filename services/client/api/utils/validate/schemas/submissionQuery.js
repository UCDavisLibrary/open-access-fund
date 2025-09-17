import * as z from "zod";
import models from '../../../../../lib/models/index.js';

const submissionQuerySchema = z.object({
  status: z.preprocess((val) => {
    if ( Array.isArray(val) ) return val;
    if ( typeof val === 'string' ) return val.split(',').filter(v => v);
    return [];
  }, z.array(z.string()).optional().refine(async (v) => {
    let statuses = await models.submissionStatus.list();
    if ( statuses.error ) return false;
    statuses = statuses.res.rows;
    return v.every(idorName => statuses.some(s => s.status_id === idorName || s.name === idorName));
  }, {
      message: "Status contains invalid status name or id",
    })
  ),
  submittedAfter: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, must be YYYY-MM-DD').optional(),
  submittedBefore: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, must be YYYY-MM-DD').optional(),
  keyword: z.string().optional(),
  page: z.preprocess((val) => {
    if ( typeof val === 'number' ) val = String(val);
    if ( typeof val === 'string' ) {
      const v = parseInt(val);
      if ( !isNaN(v) ) return v;
    }
    return 1;
  }, z.number().min(1).optional())
});

export default submissionQuerySchema;
