const User = require('../../../db/models/User');
const crypto = require('../../../lib/CryptoAES');
const { Types: { ObjectId } } = require('mongoose');
const jwtMiddleware = require('../../../lib/jwtToken');
const Project = require('../project');
const Team = require('../team');
const Box = require('../box');

// 회원가입
exports.register = async (param) => {
    let {
        user_id,
        user_pw,
        name,
        email,
        phone,
        nick
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
            phone,
            nick
        });
        return ({
            result: 'ok',
            data: {
                account: {user}
            }
        });
    } catch (e) {
        console.log(e);
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
        console.log(e);
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
        console.log(e);
        return ({
            result: 'fail',
            msg: '패스워드 찾기 오류'
        });
    }
};

// 로그인
exports.login = async (param) => {
    const { user_id, user_pw } = param
    param = {user_id}
    try{
        let user =
            await User.findOne(
                param,
                {"_id":true, "user_id":true, "user_pw":true, "email":true, "max_p":true
                    , "create_p":true, "join_p_key":true, "join_p_teamKey":true}
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
            user.userKey = user._id;
            delete user._id;
            // 프로젝트 조회
            let project = await Project.findOne({_id:user.join_p_key});
            if(project.result === 'ok') {
                project = project.data.project;
            }else{
                project = project.data;
            }
            // 팀 조회
            let teamList = await Team.search({project_key:user.join_p_key});
            if(teamList.result === 'ok') {
                teamList = teamList.data.team;
            }else{
                teamList = teamList.data;
            }
            // 박스 조회
            let boxList = await Box.search({project_key:user.join_p_key});
            if(boxList.result === 'ok') {
                boxList = boxList.data.box;
            }else{
                boxList = boxList.data;
            }

            let token = null;
            try {
                token = await jwtMiddleware.generateToken(param);
            } catch (e) {
                console.log(500, e);
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
        console.log(e);
        return ({
            result: 'fail',
            msg: '로그인 오류'
        });
    }
}

// 회원정보 수정
exports.patchUpdate = async (param) => {
    const { id, name , lv, max_p} = param;
    const fields = {name, lv, max_p};
    if(!ObjectId.isValid(id) || name === undefined) {
        return ({
            result: 'fail',
            msg: '형식 오류'
        });
    }
    try {
        const user = await User.findByIdAndUpdate(id, fields, {
            upsert: false,
            new: true
        }).exec();

        return ({
            result: 'ok',
            data: {
                user
            }
        });
    } catch (e) {
        console.log(e);
        return ({
            result: 'fail',
            msg: '회원정보 수정 오류'
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