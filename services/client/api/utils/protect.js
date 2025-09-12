import { jwtDecode } from "jwt-decode";
import config from '../../../lib/utils/config.js';
import models from '../../../lib/models/index.js';
import logger from '../../../lib/utils/logger.js';
import AccessToken from '../../../lib/utils/AccessToken.js';

/**
 * @description Middleware to protect routes based on access token in request
 * @param {String} AccessTokenMethod - Method name from AccessToken helper class to evaluate for access
 * Usage:
 *   api.get('/foo', protect('hasAdminAccess'), async (req, res) => {});
 * @returns
 */
const protect = ( AccessTokenMethod ) => {
  return async ( req, res, next ) => {
    validateToken(req, res, (err) => {
      if (err) return next(err);

      // no method to check, just validate token for base access
      if ( !AccessTokenMethod ) return next();

      const auth = req.auth;
      if ( !auth?.token || !AccessTokenMethod || !auth.token[AccessTokenMethod] ) {
        logger.info('Access token missing or does not have sufficient permissions', {corkTraceId: req.corkTraceId});
        res.status(403).json({
          message: 'Not authorized to access this resource.'
        });
        return;
      }
      next();
    });
  };
}

/**
 * @description Middleware to validate access token in request against keycloak userinfo endpoint
 * Caches token and userinfo in database to limit requests to keycloak
 */
const validateToken = async (req, res, next) => {

    let token, userInfo;
    const clientId = config.adminApp.auth.keycloakJsClient.clientId.value;

    // check for access token
    if ( !req.headers.authorization ) {
      logger.info('No access token provided', {corkTraceId: req.corkTraceId});
      res.status(401).json({
        message: 'You must authenticate to access this resource.'
      });
      return;
    }

    // parse token
    try {
      token = req.headers.authorization.replace('Bearer ', '');
      token = jwtDecode(token)
      if ( !token.iss ) throw new Error('Missing iss');
      if ( !token.jti ) throw new Error('Missing jti');
    } catch (error) {
      logger.info('Unable to parse access token', {errorMessage: error.message, stack: error.stack, corkTraceId: req.corkTraceId});
      res.status(401).json({
        message: 'You must authenticate to access this resource.'
      });
      return;
    }

    // check for cached token
    let cached = await models.cache.get('accessToken', token.preferred_username, config.adminApp.auth.serverCacheExpiration.value);
    if ( cached.error ) {
      logger.error('Unable to retrieve access token cache: ', {errorMessage: cached.error?.message, stack: cached.error?.stack, corkTraceId: req.corkTraceId});
    }
    if ( cached.res && cached.res.rowCount ) {
      cached = cached.res.rows.find(row => row.data?.token?.jti === token.jti);
      if ( cached ) {
        const cachedToken = cached.data.token;
        const tokenExpiration = new Date(cachedToken.exp * 1000);
        if ( tokenExpiration >= (new Date()).getTime() && cachedToken.jti === token.jti ) {
          req.auth = {
            token: new AccessToken(cached.data.token, clientId),
            userInfo: cached.data.userInfo
          }
          next();
          return;
        }
      }
    }

    // fetch userinfo with access token
    try {
      const userInfoResponse = await fetch(`${token.iss}/protocol/openid-connect/userinfo`, {headers: {'Authorization': req.headers.authorization}});
      if ( !userInfoResponse.ok ) throw new Error(`HTTP Error Response: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
      userInfo = await userInfoResponse.json();
    } catch (error) {
      logger.info('Error when fetching userinfo with access token', {errorMessage: error.message, stack: error.stack, corkTraceId: req.corkTraceId});
      res.status(403).json({
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    // check if user has base privileges
    const accessToken = new AccessToken(token, clientId);
    if ( !accessToken.hasAccess ) {
      res.status(403).json({
        message: 'Not authorized to access this resource.'
      });
      return;
    }
    const setCache = await models.cache.set('accessToken', token.preferred_username, {token: token, userInfo}, config.adminApp.auth.serverCacheLruSize.value);
    if ( setCache.error ) {
      logger.error('Unable to set access token cache: ', {errorMessage: setCache.error?.message, stack: setCache.error?.stack, corkTraceId: req.corkTraceId});
    }
    req.auth = {
      token: accessToken,
      userInfo
    }

    next();
}

export default protect;
