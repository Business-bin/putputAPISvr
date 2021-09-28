const User = require('../../../db/models/User');
const crypto = require('../../../lib/CryptoAES');
const { Types: { ObjectId } } = require('mongoose');
const log = require('../../../lib/log');
const jwtMiddleware = require('../../../lib/jwtToken');
const Project = require('../project/project.ctrl');
const Team = require('../team/team.ctrl');
const Box = require('../box/box.ctrl');

// 회원가입
exports.register = async (param) => {
    let {
        user_id,
        user_pw,
        name,
        email,
        phone
        // nick
    } = param;
    user_pw = crypto.encryptAES(user_pw);

    try {
        // 아이디 중복 확인
        const idCheck = await User.findOne({ user_id }).exec();
        if (idCheck) {
            return ({
                result: 'fail',
                overlapID: '아이디 중복'
            });
        }
        // 이메일 중복 확인
        const emailCheck = await User.findOne({ email }).exec();
        if (emailCheck) {
            return ({
                result: 'fail',
                overlapEMail: 'EMail 중복'
            });
        }
        // 핸드폰번호 중복 확인
        const phoneCheck = await User.findOne({ phone }).exec();
        if (phoneCheck) {
            return ({
                result: 'fail',
                overlapPhone: '핸드폰번호 중복'
            });
        }
        const user = await User.localRegister({
            user_id,
            user_pw,
            name,
            email,
            phone
            // nick
        });
        return ({
            result: 'ok',
            data: {
                account: {user}
            }
        });
    } catch (e) {
        log.error(`user register => ${e}`);
        return ({
            result: 'fail',
            msg: '회원가입 실패'
        });
    }
};

// 아이디 찾기
exports.findId = async (param) => {
    try {
        const user = await User.findOne(param).exec();
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
                    user: user.user_id
                }
            }
        });
    } catch (e) {
        log.error(`user findId => ${e}`);
        return ({
            result: 'fail',
            msg: '아이디 찾기 오류'
        });
    }
};
// 패스워드 찾기
exports.findPw = async (param) => {
    try {
        const user = await User.findOne(param).exec();
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
                    password: pw
                }
            }
        });
    } catch (e) {
        log.error(`user findPw => ${e}`);
        return ({
            result: 'fail',
            msg: '패스워드 찾기 오류'
        });
    }
};

exports.findOne = async (param) => {
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
    const { user_id, user_pw } = param
    param = {user_id, det_dttm : null}
    try{
        let user =
            await User.findOne(
                param,
                {"_id":true, "user_id":true, "user_pw":true, "email":true, "max_p":true
                    , "create_p":true, "join_p_key":true, "join_p_jointeamkey":true}
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
            // 프로젝트 조회
            let project = await Project.findOne({_id:user.join_p_key});
            project = project.data.project;
            // 팀 조회
            let teamList = await Team.search({project_key:user.join_p_key});
            teamList = teamList.data.team;
            // 박스 조회
            let boxList = await Box.search({project_key:user.join_p_key});
            boxList = boxList.data.box;

            let token = null;
            try {
                token = await jwtMiddleware.generateToken({user_id});
            } catch (e) {
                log.error(`user login generateToken => ${e}`);
                return ({
                    result: 'fail',
                    msg: '토큰 생성 오류'
                });
            }
            return ({
                result: 'ok',
                data: {
                    account: user,
                    project,
                    teamList,
                    boxList
                },
                token : token
            });
        }
    } catch (e){
        log.error(`user login => ${e}`);
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
        log.error(`user update => ${e}`);
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
        log.error(`project register user => ${e}`);
        return ({
            result: 'fail',
            msg: '수정 실패 user'
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