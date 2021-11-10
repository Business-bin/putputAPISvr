const Mission = require('../../../db/models/Mission');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');
const log = require('../../../lib/log');
const essentialVarChk = require('../../../lib/essentialVarChk');

exports.register = async (param) => {
    const {
        user_key,
        question,
        ex1,
        ex2,
        ex3,
        ex4,
        solution,
        exposition
    } = param;
    if(!essentialVarChk.valueCheck([user_key, question, ex1, ex2, ex3, ex4, solution])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    try {
        let mission = await Mission.localRegister({
            user_key,
            question,
            ex1,
            ex2,
            ex3,
            ex4,
            solution,
            exposition
        });
        return ({
            result: 'ok',
            data: {
                mission_key:mission._id
            }
        });
    } catch (e) {
        log.error(`mission register =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '문제 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.mission_key, det_dttm:null};
    delete param.mission_key;
    try{
        if (!ObjectId.isValid(matchQ._id)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const mission = await Mission.findOneAndUpdate(matchQ, {$set:param}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                mission // 리턴값 삭제예정
            }
        });
    }catch (e) {
        log.error(`mission update =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '문제 수정 실패'
        });
    }
}
//
exports.delete = async (param) => {
    const matchQ = {_id : param.mission_key, user_key : param.user_key, det_dttm:null};
    const fields = {
        det_dttm : datefomat.getCurrentDate()
    }
    try{
        if (!ObjectId.isValid(matchQ._id) || !ObjectId.isValid(matchQ.user_key)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const mission = await Mission.findOneAndUpdate(matchQ, {$set:fields}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                mission // 리턴값 삭제예정
            }
        });
    }catch (e) {
        log.error(`mission delete =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '문제 삭제 실패'
        });
    }
}

exports.findOne = async (param) => {
    try {
        let mission =
            await Mission.findOne(
                param,
                {"_id":true, "question":true, "ex1":true, "ex2":true, "ex3":true, "ex4":true
                    , "solution":true, "exposition":true}
            ).exec();
        if(mission){
            mission = JSON.parse(JSON.stringify(mission));
            mission.mission_key = mission._id;
            delete mission._id;
        }
        return ({
            result: 'ok',
            data: {
                mission
            }
        });
    }catch (e) {
        log.error(`mission findOne => ${e}`);
        return ({
            result: 'fail',
            msg: '문제 검색 실패'
        });
    }
}

exports.search = async (param) => {
    try {
        if (!ObjectId.isValid(param.user_key)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        param.det_dttm = null;
        let mission;
        let paging;
        if(param.page || param.page == ''){
            const page = param.page ? parseInt(param.page) : 1;
            delete param.page;
            const skipSize = (page-1) * 100;
            const limitSize = 100;
            const total = await Mission.count(param);
            paging = Math.ceil(total/limitSize);
            mission =
                await Mission.find(
                    param,
                    {"_id":true, "question":true, "ex1":true, "ex2":true, "ex3":true, "ex4":true
                        , "solution":true, "exposition":true}
                ).skip(skipSize).limit(limitSize).exec();
        }else{
            mission =
                await Mission.find(
                    param,
                    {"_id":true, "question":true, "ex1":true, "ex2":true, "ex3":true, "ex4":true
                        , "solution":true, "exposition":true}
                ).exec();
        }
        if(mission){
            mission = JSON.parse(JSON.stringify(mission));
            for(let m in mission){
                mission[m].mission_key = mission[m]._id;
                delete mission[m]._id;
            }
        }
        return ({
            result: 'ok',
            paging: paging,
            data: {
                mission
            }
        });
    }catch (e) {
        log.error(`mission search =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '문제 검색 실패'
        });
    }
}