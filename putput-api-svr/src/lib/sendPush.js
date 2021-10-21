const OneSignal = require('onesignal-node');
const crypto = require('./CryptoAES');

exports.sendPushMsg = async (aId, aKey, msg, push_id) => {
    const myClient = new OneSignal.Client(crypto.decryptAES(aId), crypto.decryptAES(aKey));
    try{
        const OneNoti = {
            contents : { "en" : msg},   // 내용
            include_player_ids: [push_id]    // 유저 키
        };
        const oneresult = await myClient.createNotification(OneNoti);
        return true;
    }catch (e) {
        console.log('push 실패')
        console.log(e);
        return false;
    }
}