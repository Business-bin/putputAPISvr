const Router = require('koa-router');

const parseJSON = (str) => {
  let parsed = null;
  try {
    parsed = JSON.parse(str);
  } catch (e) {
  }
  return parsed;
};

const ws = new Router();

const LoopGlobalGC = () => {
  try {
    global.gc();
    global.gc();
  } catch(e) {
    console.log('LoopGlobalGC Check --expose-gc !');
    // "You must run program with 'node --expose-gc index.js' or 'npm start'");
  }
  setTimeout(LoopGlobalGC, 30000);
};
setTimeout(LoopGlobalGC, 30000);


const cptSecretKey1 = 1273285;
let clientSN = 0;

ws.get('/ws', (ctx, next) => {

  clientSN++;
  const id = '#' + clientSN; //shortid.generate();
  ctx.websocket.id = id;
  ctx.websocket.clan = null;

  const liftTime = new Date().getTime();
  ctx.websocket.lifeTime = liftTime;
  ctx.websocket.connTime = liftTime;
  ctx.websocket.bReadMining = false;
  ctx.websocket.mining = 0;
  ctx.websocket.walletID = '';

  ctx.websocket.skey = 0;

  ctx.websocket.on('message', (message) => {
    const liftTime = new Date().getTime();
    ctx.websocket.lifeTime = liftTime;


    try {
      const parsed = parseJSON(message);
      if(!parsed || !parsed.szCmd) return;
      if(parsed.skey1 === undefined || parsed.skey2 === undefined) return;

      const rnd = parsed.skey1 ^ cptSecretKey1;
      const skey = parsed.skey2 ^ rnd;

      if((ctx.websocket.skey+1) !== skey){
        ctx.websocket.close();
        return;
      }
      ctx.websocket.skey = skey;

    } catch(e) {
      console.log('ws message, ERROR: ' + e);
    }
  });

  ctx.websocket.on('error', () => {
    try {
      ctx.websocket.close();
    } catch(e) {
      console.log('ws ERROR: ' + e);
    }
  }); 

  ctx.websocket.on('close', () => {
    try {
    } catch(e) {
      console.log('ws close ERROR: ' + e);
    }
  }); 
});

module.exports = ws;
