const log = require('../../../lib/log');
const User = require('../user');
const Project = require('../project');
const Box = require('../box');
const Team = require('../team');
const Mission = require('../mission');
const Reward = require('../reward');
const Egg = require('../egg');
const Comment = require('../comment');
const Notice = require('../notice');

const cmds = {
    // 유저
    'req_Join' : User.register,             // 회원가입
    'req_RevealID' : User.findId,           // 아이디 찾기
    'req_RevealPassword' : User.findPw,     // 패스워드 찾기
    'req_Login' : User.login,               // 로그인
    'req_Logout' : User.logout,             // 로그아웃
    
    // 'req_UserUpdate' : User.patchUpdate,    // 계정 수정
    'test1' : User.test1,
    'test2' : User.test2,
    'test3' : User.test3,

    // 프로젝트
    'req_ProjectCreate' : Project.register,                 // 프로젝트 생성
    'req_ProjectModify' : Project.update,                   // 프로젝트 수정(박스 생성/수정/삭제)
    'req_ProjectDelete' : Project.delete,
    'req_PublicProjectList' : Project.publicProjectList,    // 플레이(state)중인 프로젝트 검색
    'req_MyProjectList' : Project.myProjectList,            // 내가만드 프로젝트 검색
    'req_EventProjectList' : Project.eventProjectList,      // 지역이벤트 프로젝트 검색
    'req_ProjectChart' : Project.projectChartList,          // 프로젝트 통계
    'req_ProjectFind' : Project.findOne,
    'req_JoinProject' : Project.joinProject,                // 프로젝트 참가
    'req_ExitProject' : Project.exitProject,                // 프로젝트 나가기
    'req_ProjectChangeState' : Project.updateState,         // 프로젝트 상태 변경

    // 상자
    'reg_BoxFind' : Box.findOne,
    'reg_BoxSearch' : Box.search,
    'req_MissionRewardInfo' : Box.missionRewardFindOne,     // 미션&보상 정보
    'req_CorrectAnswer' : Box.correctAnswer,                // 미션 성공

    // 팀
    'reg_TeamSearch' : Team.search,

    // 문제
    'req_MissionCreate' : Mission.register,
    'req_MissionModify' : Mission.update,
    'req_MissionDelete' : Mission.delete,
    'req_MissionList' : Mission.search,

    // 보상
    'req_RewardCreate' : Reward.register,
    'req_RewardModify' : Reward.update,
    'req_RewardDelete' : Reward.delete,
    'req_RewardList' : Reward.search,

    //egg
    'req_Writing': Egg.register,
    'req_Modify': Egg.update,
    'req_Delete': Egg.delete,
    'req_EggInfo': Egg.findOne,
    'req_EggInfoList': Egg.search,
    'req_AroundEggList': Egg.aroundSearch,  // 알 위치정보(내 기준 50m)

    // 댓글
    'req_CommentWriting': Comment.register,
    'req_CommentModify': Comment.update,
    'req_CommentDelete': Comment.delete,

    // 공지
    'req_SendPush': Notice.sendPush
}


exports.cmd = async (ctx) => {
    // ND: normal
    const { ND } = ctx.request.body;
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
                if(cmds[rep.data.cmd] === undefined){
                    log.info('CMD not found.');
                    rep.result = {
                        result: 'fail',
                        msg: `${rep.data.cmd} : CMD not found.`
                    }
                }else if(rep.data.cmd in {req_Join:'req_Join', req_RevealID:'req_RevealID', req_RevealPassword:'req_RevealPassword', req_Login:'req_Login'} ){
                    log.info(`Client Request ***** ${rep.data.cmd} ***** START`);
                    rep.result = await cmds[rep.data.cmd](rep.data.param);
                }else{
                    log.info(`Client Request ***** ${rep.data.cmd} ***** START`);
                    console.log(`rep.data.param-------------------------`);
                    console.log(rep.data.param);
                    console.log(`---------------------------------------`);
                    // 토큰값이 없을경우 에러, 토큰 user id와 post data user id 비교
                    console.log(`rep.data.user = ${rep.data.user}`);    // 삭제예정
                    rep.result = tokenUserId != rep.data.user ? {
                            result: 'fail',
                            msg: `not login`
                        }
                        : await cmds[rep.data.cmd](rep.data.param);
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
    if(rep.data.cmd in {req_Login:'req_Login', req_Join:'req_Join'}){
        ctx.cookies.set('access_token', rep.result.token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24  });
        log.info(`발행한 토큰 ***** ${rep.result.token}`);
        delete rep.result.token;
    }else if(rep.data.cmd === "req_Logout"){
        if(rep.result.result === 'ok'){
            ctx.cookies.set('access_token', null, {
                maxAge: 0,
                httpOnly: true
            });
        }
    }
    log.info(`Client Request ***** ${rep.data.cmd} ***** END
    `);
    ctx.body = rep.body;
};