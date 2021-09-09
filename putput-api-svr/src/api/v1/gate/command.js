const User = require('../user');

const Egg = require('../egg');
const Feed = require('../feed');

const Token = require('../token');

const cmds = {
    // 유저
    'req_Join' : User.register, // 회원가입
    'req_RevealID' : User.findId,  // 아이디 찾기
    'req_RevealPassword' : User.findPw,  // 패스워드 찾기
    'req_Login' : User.login,   // 로그인
    
    'req_UserUpdate' : User.patchUpdate, // 계정 수정
    'test1' : User.test1,
    'test2' : User.test2,

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
    const rep = {
        body: {},
        data: null,
        result: null
    };

    try {
        rep.data = ND !== undefined ? ND : null
    } catch (e) {
        console.log(e);
    }

    if (rep.data === null) {
        rep.body.error = '잘못된 요청 정보입니다';
    } else {
        try {
            if (rep.data.cmd === undefined || rep.data.param === undefined) {
                rep.body.error = '잘못된 요청문 입니다.';
            } else {
                // console.log("rep.data.cmd = "+rep.data.cmd)
                if(cmds[rep.data.cmd] === undefined){
                    rep.result = {
                        result: 'fail',
                        msg: `${rep.data.cmd} : CMD not found.`
                    }
                }else if(rep.data.cmd === 'req_Join' || rep.data.cmd === 'req_RevealID' || rep.data.cmd === 'req_RevealPassword' || rep.data.cmd === 'req_Login'){
                    rep.result = await cmds[rep.data.cmd](rep.data.param);
                }else{
                    let tokenUserId;
                    try{
                        tokenUserId = ctx.request.user.user_id;
                        rep.result = tokenUserId != rep.data.user ? {
                                result: 'fail',
                                msg: `not login`
                            }
                            : await cmds[rep.data.cmd](rep.data.param);

                    }catch (e){
                        rep.result = {
                            result: 'fail',
                            msg: `not login`
                        }
                    }
                }
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
    if(rep.data.cmd === "req_Login"){
        console.log(rep.result.token);
        ctx.cookies.set('access_token', rep.result.token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24  });
    }
    // else if(rep.data.cmd === "req_Logout"){
    //     ctx.cookies.set('access_token', null, {
    //         maxAge: 0,
    //         httpOnly: true
    //     });
    // }
    ctx.body = rep.body;
};