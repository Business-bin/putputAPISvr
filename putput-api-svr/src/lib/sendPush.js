const OneSignal = require('onesignal-node');

const myClient = new OneSignal.Client('', '');

exports.sendPushMsg = async () => {
    try{
        const msg = 'Test notification';
        const OneNoti = {
            contents : { "en" : msg},   // 내용
            include_player_ids: ['']    // 유저 키
        };
        const oneresult = await myClient.createNotification(OneNoti);
        // const oneresult = await myClient.sendNotification(OneNoti);
        console.log(oneresult);
        return true;
    }catch (e) {
        console.log('push 실패')
        console.log(e);
        return false;
    }
}