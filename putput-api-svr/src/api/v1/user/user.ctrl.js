const User = require('../../../db/models/User');
const crypto = require('../../../lib/CryptoAES');
const { Types: { ObjectId } } = require('mongoose');
const log = require('../../../lib/log');
const essentialVarChk = require('../../../lib/essentialVarChk');
const jwtMiddleware = require('../../../lib/jwtToken');
const Project = require('../project/project.ctrl');
const Team = require('../team/team.ctrl');
const Box = require('../box/box.ctrl');
const Mission = require('../mission/mission.ctrl');
const Reward = require('../reward/reward.ctrl');

// 회원가입
exports.register = async (param) => {
    let {
        user_id,
        user_pw,
        name,
        email,
        phone,
        push_id
    } = param;
    if(!essentialVarChk.valueCheck([user_id,user_pw,name,email,phone])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    user_pw = crypto.encryptAES(user_pw);

    try {
        // 아이디 중복 확인
        const idCheck = await User.findOne({ user_id }).exec();
        if (idCheck) {
            return ({
                result: 'fail',
                msg: '아이디 중복'
            });
        }
        if(!essentialVarChk.verify("EMAIL", email)){
            return ({
                result: 'fail',
                msg: 'EMail 형식 확인'
            });
        }
        // 이메일 중복 확인
        const emailCheck = await User.findOne({ email }).exec();
        if (emailCheck) {
            return ({
                result: 'fail',
                msg: 'EMail 중복'
            });
        }
        if(!essentialVarChk.verify("PHONE", phone)){
            return ({
                result: 'fail',
                msg: '핸드폰번호 형식 확인'
            });
        }
        // 핸드폰번호 중복 확인
        const phoneCheck = await User.findOne({ phone }).exec();
        if (phoneCheck) {
            return ({
                result: 'fail',
                msg: '핸드폰번호 중복'
            });
        }
        const user = await User.localRegister({
            user_id,
            user_pw,
            name,
            email,
            phone,
            push_id
        });
        const account = {
            user_key : user._id
            ,user_id : user.user_id
            ,user_pw : user.user_pw
            ,email : user.email
            ,max_p : user.max_p
            ,create_p : user.create_p
            ,join_p_key : user.join_p_key
            ,join_p_jointeamkey : user.join_p_jointeamkey
        }
        let token = null;
        try {
            token = await jwtMiddleware.generateToken({user_id});
        } catch (e) {
            log.error(`user register generateToke =>`);
            console.log(e);
            return ({
                result: 'fail',
                msg: '토큰 생성 오류'
            });
        }
        return ({
            result: 'ok',
            data: {
                account
                ,project : {}
                ,teamlist : []
                ,boxlist : []
            },
            token : token
        });
    } catch (e) {
        log.error(`user register =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '회원가입 실패'
        });
    }
};

// 아이디 찾기
exports.findId = async (param) => {
    param.det_dttm = null;
    try {
        if(!essentialVarChk.valueCheck([param.name,param.phone])){
            return ({
                result: 'fail',
                msg: '필수 값 확인'
            });
        }
        const user = await User.findOne(param,{"user_id":true}).exec();
        if(!user) {
            return ({
                result: 'fail',
                msg: '검색 정보 없음'
            });
        }
        return ({
            result: 'ok',
            data: {
                account: {
                    user_id:user.user_id
                }
            }
        });
    } catch (e) {
        log.error(`user findId =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '아이디 찾기 오류'
        });
    }
};
// 패스워드 찾기
exports.findPw = async (param) => {
    param.det_dttm = null;
    try {
        if(!essentialVarChk.valueCheck([param.user_id,param.phone])){
            return ({
                result: 'fail',
                msg: '필수 값 확인'
            });
        }
        const user = await User.findOne(param,{"user_pw":true}).exec();
        if(!user) {
            return ({
                result: 'fail',
                msg: '검색 정보 없음'
            });
        }
        const pw = crypto.decryptAES(user.user_pw);
        return ({
            result: 'ok',
            data: {
                account: {
                    user_pw: pw
                }
            }
        });
    } catch (e) {
        log.error(`user findPw =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '패스워드 찾기 오류'
        });
    }
};

exports.findOne = async (param) => {
    param.det_dttm = null;
    try {
        let user = await User.findOne(param).exec();
        return ({
            result: 'ok',
            data: {
                user
            }
        });
    }catch (e) {
        log.error(`user findOne => ${e}`);
        return ({
            result: 'fail',
            msg: '유저 검색 실패'
        });
    }
}

// 로그인
exports.login = async (param) => {
    const { user_id, user_pw, push_id } = param;
    if(!essentialVarChk.valueCheck([user_id, user_pw])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    param = {user_id, det_dttm : null}
    try{
        let user =
            await User.findOne(
                param,
                {"_id":true, "user_id":true, "user_pw":true, "email":true, "max_p":true
                    , "create_p":true, "join_p_key":true, "join_p_jointeamkey":true, "push_id":true}
            ).exec();
        if(!user) {
            return ({
                result: 'fail',
                msg: '회원 정보 없음'
            });
        }else if(crypto.decryptAES(user.user_pw) != user_pw){
            return ({
                result: 'fail',
                msg: '회원 정보 없음'
            });
        }else{
            user = JSON.parse(JSON.stringify(user));
            user.user_key = user._id;
            delete user._id;
            if(push_id && push_id != user.push_id){
                await User.findOneAndUpdate({_id:user.user_key}, {$set:{push_id}}, {
                    upsert: false,
                    returnNewDocument: true, // 결과 반환
                    new: true
                }).exec();
            }
            // 프로젝트 조회
            const project = await Project.findOne({_id:user.join_p_key});
            // 팀 조회
            const teamlist = await Team.search({project_key:user.join_p_key});
            // 박스 조회
            const boxlist = await Box.search({project_key:user.join_p_key});
            // 문제 리스트 조회
            const missionlist = await Mission.search({user_key:user.user_key});
            // 보상 리스트 조회
            const rewardlist = await Reward.search({user_key:user.user_key});

            let token = null;
            try {
                token = await jwtMiddleware.generateToken({user_id});
            } catch (e) {
                log.error(`user login generateToken =>`);
                console.log(e);
                return ({
                    result: 'fail',
                    msg: '토큰 생성 오류'
                });
            }
            return ({
                result: 'ok',
                data: {
                    account: user,
                    project:project.data.project,
                    teamlist:teamlist.data.team,
                    boxlist:boxlist.data.box,
                    missionlist:missionlist.data.mission,
                    rewardlist:rewardlist.data.reward
                },
                token : token
            });
        }
    } catch (e){
        log.error(`user login =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '로그인 오류'
        });
    }
}

exports.logout = async (param) => {
    console.log(`tokenUserId = ${tokenUserId}`)
    if(tokenUserId === param.user_id){
        return ({
            result: 'ok',
            msg: '로그아웃'
        });
    }else{
        return ({
            result: 'fail',
            msg: '로그아웃 실패'
        });
    }
}

exports.update = async (param) => {
    const matchQ = {_id : param.user_key, det_dttm:null};
    delete param.user_key;
    try{
        if (!ObjectId.isValid(matchQ._id) || param === undefined) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const user = await User.findOneAndUpdate(matchQ, {$set:param}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                user
            }
        });
    }catch (e) {
        log.error(`user update => `);
        console.log(e);
        return ({
            result: 'fail',
            msg: '유저 수정 실패'
        });
    }
}

exports.projectCntUpdate = async (param, cnt) => {
    param.det_dttm = null;
    if(!ObjectId.isValid(param._id)) {
        return ({
            result: 'fail',
            msg: '형식 오류'
        });
    }
    try{
        const user = await User.findOneAndUpdate(param, {$inc:{create_p:+cnt}}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                user
            }
        });
    }catch (e) {
        log.error(`user projectCntUpdate =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '수정 실패 user'
        });
    }
}

exports.joinProjectUpdate = async (param, filds) => {
    param.det_dttm = null;
    if(!ObjectId.isValid(param.join_p_key)) {
        return ({
            result: 'fail',
            msg: '형식 오류'
        });
    }
    // let userRe = [];
    try{
        // userRe = await User.find(
        //     param,
        //     {"_id":true, "join_p_key":true, "join_p_jointeamkey":true}
        // ).exec();
        const user = await User.updateMany(param, filds).exec();
        return ({
            result: 'ok',
            data: {
                user
            }
        });
    }catch (e) {
        log.error(`user joinProjectUpdate =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '수정 실패 user',
            // data: {
            //     userRe
            // }
        });
    }
}

exports.test1 = async (param) => {
    const {pw} = param;
    const pwen = crypto.encryptAES(pw);
    console.log(pwen);
    return ({
        result: 'fail',
        pwen: pwen
    });
}
exports.test2 = async (param) => {
    const {pw} = param;
    const pwde = crypto.decryptAES(pw);
    console.log(pwde);
    return ({
        result: 'fail',
        pwde: pwde
    });
}
exports.test3 = async (param) => {
    const {email, phone} = param;
    const e = essentialVarChk.verify("EMAIL", email);
    const p = essentialVarChk.verify("PHONE", phone);
    return ({
        result: 'fail',
        e,
        p
    });
}