import * as z from "zod";

export default z.object({
  id: z.string().uuid()
});
