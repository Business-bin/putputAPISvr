const Router = require('koa-router');

const gate = new Router();
const command = require('./command');

gate.post('/cmd', command.cmd);

module.exports = gate;