import * as z from "zod";

const submissionStatusQuerySchema = z.object({
  excludeArchived: z.preprocess((val) => {
    if ( val === 'false' ) return false;
    if ( val === 'true' ) return true;
  }, z.boolean().optional()),
  archivedOnly: z.preprocess((val) => {
    if ( val === 'false' ) return false;
    if ( val === 'true' ) return true;
  }, z.boolean().optional())
});

export default submissionStatusQuerySchema;
