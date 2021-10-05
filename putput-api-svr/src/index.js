// load environment variables
require('dotenv').config();
const {
  PORT: port,
  MONGO_URI: mongoURI
} = process.env;

process.env.TZ = 'Asia/Seoul';

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
const Moment = require('moment');

const db = require('./db');
const api = require('./api');

db.connect();

const app = new Koa();
const { jwtMiddleware } = require('./lib/jwtToken'); // jwt 미들웨어


app.use((ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Credentials', true);
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-timebase, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, Link');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, PUT, OPTIONS');
  ctx.set('Access-Control-Expose-Headers', 'Link');
  return next();
});
// Access-Control-Max-Age: 3600

app.use(compress());


app.use(bodyParser());
app.use(jwtMiddleware);

const router = new Router();
router.use('/api', api.routes());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, '0.0.0.0', () => {
  console.log(`
**************************************************************************
OPEN PORT: ${port}                    |\\_/|
PROJECT  : DUDA API SERVER         |q p|   /}
DATE     : ${new Moment().format('YYYY-MM-DD HH:mm:ss')}     ( 0 )"""\\
NODE -V  : v14.17.1                |\"^\"\`    |
DEVELOPER: BSB                     ||-/=\\\\--|
**************************************************************************`
  );
});
