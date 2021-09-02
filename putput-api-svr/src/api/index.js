const Router = require('koa-router');
const versions = {
    'v1': require('./v1')
};
const api = new Router();
api.use('/v1', versions['v1'].routes());
module.exports = api;