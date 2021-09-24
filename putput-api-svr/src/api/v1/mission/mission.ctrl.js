const Mission = require('../../../db/models/Mission');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');
const log = require('../../../lib/log');

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
        mission = JSON.parse(JSON.stringify(mission));
        mission.mission_key = mission._id;
        delete mission._id;
        console.log(mission);
        return ({
            result: 'ok',
            data: {
                mission
            }
        });
    } catch (e) {
        log.error(`mission register => ${e}`);
        return ({
            result: 'fail',
            msg: '문제 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.mission_key, det_dttm:null};
    delete param.mission_key;
    console.log(param);
    try{
        if (!ObjectId.isValid(matchQ._id) || param === undefined) {
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
        log.error(`mission update => ${e}`);
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
        if (!ObjectId.isValid(matchQ._id)) {
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
        log.error(`mission delete => ${e}`);
        return ({
            result: 'fail',
            msg: '문제 삭제 실패'
        });
    }
}
