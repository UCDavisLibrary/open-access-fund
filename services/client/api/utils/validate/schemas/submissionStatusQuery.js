import * as z from "zod";

const submissionStatusQuerySchema = z.object({
  excludeArchived: z.preprocess((val) => {
    if ( val === 'true' ) return true;
    if ( val === 'false' ) return false;
    return val;
  }, z.boolean().optional()),
  archivedOnly: z.preprocess((val) => {
    if ( val === 'true' ) return true;
    if ( val === 'false' ) return false;
    return val;
  }, z.boolean().optional())
});

export default submissionStatusQuerySchema;
