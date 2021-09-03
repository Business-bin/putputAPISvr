const Egg = require('api/v1/egg');
const Feed = require('api/v1/feed');

const cmds = {
    // 알&상자 검색 테스트
    'FeedSearch' : Feed.search,
    //egg
    'EggCreate': Egg.register,
    'EggSearch': Egg.search,

}


exports.cmd = async (ctx) => {
    // ED: aes encode, CD: aes CShape encode,  ND: normal
    const { ED, ND, CD } = ctx.request.body;
    //console.log(ctx.request.body);
    const rep = {
        body: {},
        data: null,
        result: null
    };

    try {
        rep.data = ND !== undefined ? ND : null
    } catch (e) {
        //console.log(decryptAESCShape(CD));
        console.log(e);
    }

    // console.log(rep.data);
    if (rep.data === null) {
        rep.body.error = '잘못된 요청 정보입니다';
    } else {
        try {
            if (rep.data.cmd === undefined || rep.data.param === undefined) {
                rep.body.error = '잘못된 요청문 입니다.';
            } else {
                rep.result = cmds[rep.data.cmd] === undefined ? {
                    result: 'fail',
                    msg: `${rep.data.cmd} : CMD not found.`
                } : await cmds[rep.data.cmd](rep.data.param);

                //console.log(JSON.stringify(rep.result));
            }
        } catch (e) {
            rep.body.error = '요청 처리중 오류';
            console.log(e);
        }
    }

    if (rep.result === null && rep.body.error === undefined) {
        rep.body.error = '결과 정보가 없습니다.';
    }

    if (rep.result !== null) {
        try {
            rep.body.ND = rep.result;
            console.log("command.js----------------");
        } catch (e) {
            rep.body.error = '결과 변환 오류';
            console.log(e);
        }
    }
    ctx.body = rep.body;
};