import * as z from "zod";
import handleError from './handleError.js';
import { DataDefinitions } from "../../../lib/utils/DataDefinitions.js";
import fundAccountUtils from "../../../lib/utils/fundAccountUtils.js";

const requiredString = (msg = 'Required') =>
  z.preprocess(
    v => (v == null ? '' : v),
    z.string().trim().min(1, msg)
  );

export const requiredNumber = (
  messages = { required: "Required", nan: "Must be a number" }
  ) =>
  z.preprocess(
    v => {
      if (v == null) return "";               // undefined/null -> ''
      if (typeof v === "number") return String(v); // numbers -> strings
      return String(v);                       // everything else -> string
    },
    z.string().trim().min(1, messages.required)
  )
  .pipe(
    z
      .string()
      .regex(/^-?(?:\d+|\d*\.\d+)$/, messages.nan) // numeric check
      .transform(Number)
  );

const fundAccountSchema = z.
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

const submissionSchema = z
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
    requestedAmount: requiredNumber().refine(v => v > 0, {message: 'Must be greater than zero'}).refine(v => v <= 10000, {message: 'Must be less than or equal to $10,000'}),
  })
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

function validate(schema) {
  return async (req, res, next) => {
    try {
      const input = { ...req.params, ...req.query, ...req.body };
      const parse = await schema.safeParseAsync(input);
      if (parse.success) {
        req.validated = parse.data;
        return next();
      }

      return res.status(422).json(transformErrorIssues(parse.error.issues));

    } catch (e) {
      return handleError(res, req, e);
    }

  };
}

function transformErrorIssues(issues){
  const out = [];
  for ( let issue of issues ){
    issue = {...issue};
    out.push(issue);
  }

  return out;
}

export {
  validate,
  submissionSchema
};
