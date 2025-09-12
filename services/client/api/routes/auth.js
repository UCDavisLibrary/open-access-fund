import protect from '../utils/protect.js';

export default (api) => {

  /**
   * @description Running protect middleware authorizes token and caches it on server
   */
  api.post('/auth/cache-token', protect(), async (req, res) => {
    res.json({success: true});
  });
};
