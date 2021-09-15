const log = require('../../../lib/log');
const User = require('../user');
const Project = require('../project');
const Box = require('../box');
const Team = require('../team');
const Egg = require('../egg');
const Comment = require('../comment');

const Feed = require('../feed');

const Token = require('../token');

const cmds = {
    // 유저
    'req_Join' : User.register,             // 회원가입
    'req_RevealID' : User.findId,           // 아이디 찾기
    'req_RevealPassword' : User.findPw,     // 패스워드 찾기
    'req_Login' : User.login,               // 로그인
    'req_Logout' : User.logout,             // 로그아웃
    
    'req_UserUpdate' : User.patchUpdate,    // 계정 수정
    'test1' : User.test1,
    'test2' : User.test2,

    // 프로젝트
    'req_ProjectCreate' : Project.register,   // 프로젝트 생성
    'req_ProjectModify' : Project.update,
    'req_PublicProjectList' : Project.search,
    'req_ProjectFind' : Project.findOne,

    // 상자
    'reg_BoxFind' : Box.findOne,
    'reg_BoxSearch' : Box.search,

    // 팀
    'reg_TeamSearch' : Team.search,

    // 알&상자 검색 테스트
    'FeedSearch' : Feed.search,

    //egg
    'req_Writing': Egg.register,
    'req_Modify': Egg.update,
    'req_Delete': Egg.delete,
    'req_EggInfo': Egg.findOne,
    'req_EggInfoList': Egg.search,
    'req_AroundEggList': Egg.aroundSearch,

    // 댓글
    'req_CommentWriting': Comment.register,
    'req_CommentModify': Comment.update,
    'req_CommentDeleete': Comment.delete,

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

    log.info(`access_token === ${ctx.cookies.get('access_token')}`)

    try {
        rep.data = ND !== undefined ? ND : null
    } catch (e) {
        console.log(e);
    }

    if (rep.data === null) {
        log.info('rep.data null');
        rep.body.error = '잘못된 요청 정보입니다';
    } else {
        try {
            if (rep.data.cmd === undefined || rep.data.param === undefined) {
                log.info('rep.data.cmd or rep.data.param undefined');
                rep.body.error = '잘못된 요청문 입니다.';
            } else {
                // console.log("rep.data.cmd = "+rep.data.cmd)
                if(cmds[rep.data.cmd] === undefined){
                    log.info('CMD not found.');
                    rep.result = {
                        result: 'fail',
                        msg: `${rep.data.cmd} : CMD not found.`
                    }
                }else if(rep.data.cmd === 'req_Join' || rep.data.cmd === 'req_RevealID' || rep.data.cmd === 'req_RevealPassword' || rep.data.cmd === 'req_Login'){
                    log.info(`Client Request ***** ${rep.data.cmd} ***** START`);
                    rep.result = await cmds[rep.data.cmd](rep.data.param);
                }else{
                    try{
                        log.info(`Client Request ***** ${rep.data.cmd} ***** START`);
                        // 토큰값이 없을경우 에러, 토큰 user id와 post data user id 비교
                        rep.result = tokenUserId != rep.data.user ? {
                                result: 'fail',
                                msg: `not login`
                            }
                            : await cmds[rep.data.cmd](rep.data.param);

                    }catch (e){
                        log.error('Not login');
                        rep.result = {
                            result: 'fail',
                            msg: `not login`
                        }
                    }
                }
            }
        } catch (e) {
            log.error('요청 처리중 오류');
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
    // console.log(rep.result.result);
    if(rep.data.cmd === "req_Login"){
        // console.log("token = "+rep.result.token);
        ctx.cookies.set('access_token', rep.result.token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24  });
        delete rep.result.token;
    }else if(rep.data.cmd === "req_Logout"){
        if(rep.result.result === 'ok'){
            ctx.cookies.set('access_token', null, {
                maxAge: 0,
                httpOnly: true
            });
        }
    }
    log.info(`Client Request ***** ${rep.data.cmd} ***** END`);
    ctx.body = rep.body;
};