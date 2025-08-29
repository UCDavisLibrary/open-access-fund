import logger from '../../lib/utils/logger.js';

function handleError(res, req, error, details) {
  logger.error('Error in request', {error}, req.corkTraceId);

  res.status(500).json({
    message : error.message,
    details : details,
    stack : error.stack
  });

}

export default handleError;
