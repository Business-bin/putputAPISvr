const log = require('../../../lib/log');
const push = require('../../../lib/sendPush');

exports.sendPush = async (param) => {
    try {
        const sendResult = push.sendPushMsg();
        if(sendResult){
            return ({
                result: 'ok',
                data: {msg : '푸쉬 전송 성공'}
            });
        }else{
            throw Error('푸쉬 전송 실패');
        }
    } catch (e) {
        log.error(`notice sendPush =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '푸쉬 전송 실패'
        });
    }
};

