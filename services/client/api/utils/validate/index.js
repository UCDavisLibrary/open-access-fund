import handleError from '../handleError.js';
import submissionSchema from './schemas/submission.js';

/**
 * @description Middleware to validate request data against a Zod schema.
 * Combines req.params, req.query, and req.body for validation.
 * On success, attaches validated data to req.validated.
 * @param {*} schema - A Zod schema
 * @returns
 */
function validate(schema) {
  return async (req, res, next) => {
    try {
      const input = { ...req.params, ...req.query, ...req.body };
      const parse = await schema.safeParseAsync(input);
      if (parse.success) {
        req.validated = parse.data;
        return next();
      }

      return res.status(422).json(formatErrorResponse(parse.error));

    } catch (e) {
      return handleError(res, req, e);
    }
  };
}

function formatErrorResponse(zodError) {
  const issues = [];
  for (let issue of zodError.issues) {
    issue = { ...issue };
    issues.push(issue);
  }
  return { validationError: true, errors: issues };
}

export {
  validate,
  submissionSchema
};
