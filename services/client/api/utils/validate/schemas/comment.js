import * as z from "zod";
import { requiredString } from "./utils.js";

export default z.object({
  submissionId: z.string().uuid().optional(),
  userCommentId: z.string().uuid().optional(),
  commentText: requiredString().pipe(z.string().max(500))
}).superRefine((data, ctx) => {
  if ( !data.submissionId && !data.userCommentId ){
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either submissionId or userCommentId must be provided"
    });
  }
});
