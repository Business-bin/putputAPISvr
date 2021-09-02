const Router = require('koa-router');
const gate = require('./gate');

const api = new Router();

//api.use('/gate', gate.routes());
api.use('/gate', gate.routes());

module.exports = api;