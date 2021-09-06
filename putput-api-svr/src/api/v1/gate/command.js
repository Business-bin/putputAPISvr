const Egg = require('../egg');
const Feed = require('../feed');

const Token = require('../token');

const cmds = {
    // 알&상자 검색 테스트
    'FeedSearch' : Feed.search,
    //egg
    'EggCreate': Egg.register,
    'EggSearch': Egg.search,

    // token test
    'TokenTest': Token.tokenTest,
    'TokenClaerTest': Token.tokenTest,
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
        } catch (e) {
            rep.body.error = '결과 변환 오류';
            console.log(e);
        }
    }
    // console.log(rep.result)
    console.log("----------------");
    // console.log(rep.result.result);
    if(rep.data.cmd != "TokenTest"){
        console.log(rep.result.token);
        ctx.cookies.set('access_token', rep.result.token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24  });
    }else{
        ctx.cookies.set('access_token', null, {
            maxAge: 0,
            httpOnly: true
        });
    }
    ctx.body = rep.body;
};