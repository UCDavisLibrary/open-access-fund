import logger from '../../../lib/utils/logger.js';
import handleError from '../utils/handleError.js';
import textUtils from '../../../lib/utils/textUtils.js';
import models from '../../../lib/models/index.js';
import { validate, schema } from '../utils/validate/index.js';
import protect from '../utils/protect.js';

export default (app) => {
  app.post('/comment', protect('hasWriteAccess'), validate(schema.comment), async (req, res) => {
    try {
      let userCommentId;
      const data = {};
      for ( const key in req.validated ) {
        data[textUtils.camelToSnakeCase(key)] = req.validated[key];
      }

      // create new comment
      if ( !req.validated.userCommentId ){
        const result = await models.comment.create(data, req.auth.token.dbUpsertObject);
        if ( result.error ) {
          throw result.error;
        }
        userCommentId = result.res.userCommentId;
        logger.info(`Created comment ${userCommentId} for submission ${data.submission_id}`);

      // update existing comment
      } else {
        let existingComment = await models.comment.get(req.validated.userCommentId);
        if ( existingComment.error ) {
          throw existingComment.error;
        }
        if ( !existingComment.res ) {
          return res.status(404).json({ message: 'Comment not found' });
        }
        if ( existingComment.res.kerberos !== req.auth.token.id ) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
        const result = await models.comment.update(req.validated.userCommentId, req.validated.commentText);
        if ( result.error ) {
          throw result.error;
        }
        userCommentId = req.validated.userCommentId;
        logger.info(`Updated comment ${userCommentId} for submission ${data.submission_id}`);
      }

      return res.status(200).json({ userCommentId });


    } catch(e){
      return handleError(res, req, e);
    }

  });
};
