const Team = require('../../../db/models/Team');
const log = require('../../../lib/log');
const datefomat = require('../../../lib/dateFomat');
const { Types: { ObjectId } } = require('mongoose');

exports.register = async (param) => {
    const {
        project_key,
        index,
        name
    } = param;

    try {
        const team = await Team.localRegister({
            project_key,
            index,
            name
        });

        return ({
            result: 'ok',
            data: {
                team
            }
        });
    } catch (e) {
        log.error(`team register => ${e}`);
        return ({
            result: 'fail',
            msg: '팀 등록 실패'
        });
    }
};

exports.updateJoinCnt = async (param) => {
    const matchQ = {_id : param.team_key, det_dttm:null};
    delete param.team_key;
    try{
        const team = await Team.findOneAndUpdate(matchQ, {$inc:{join_cnt:+1}}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                team
            }
        });
    }catch (e) {
        log.error(`team updateJoinCnt => ${e}`);
        return ({
            result: 'fail',
            msg: '팀 누적 참여인원 수정 실패'
        });
    }
}

exports.delete = async (param) => {
    param.det_dttm = null;
    console.log(param)
    const fields = {
        det_dttm : datefomat.getCurrentDate()
    }
    try{
        const team = await Team.update(param, {$set:fields}, {  // findAndModify
            upsert: false,
            multi: true,
            new: true
        }).exec();
        console.log(team)
        return ({
            result: 'ok',
            data: {
                team // 리턴값 삭제예정
            }
        });
    }catch (e) {
        log.error(`team delete => ${e}`);
        return ({
            result: 'fail',
            msg: '팀 삭제 실패'
        });
    }
}

exports.findOne = async (param) => {
    try {
        let team =
            await Team.findOne(
                param,
                {"_id":true, "name":true, "join_cnt":true, "openbox_cnt":true}
            ).exec();
        if(team){
            team = JSON.parse(JSON.stringify(team));
            team.team_key = team._id;
            delete team._id;
        }
        return ({
            result: 'ok',
            data: {
                team
            }
        });
    }catch (e) {
        log.error(`team findOne => ${e}`);
        return ({
            result: 'fail',
            msg: '팀 검색 실패'
        });
    }
}

exports.search = async (param) => {
    try {
        param.det_dttm = null;
        let team =
            await Team.find(
                param,
                {"_id":true, "name":true, "join_cnt":true, "openbox_cnt":true}
            ).exec();
        if(team){
            team = JSON.parse(JSON.stringify(team));
            for(let t in team){
                team[t].team_key = team[t]._id;
                delete team[t]._id;
            }
        }
        return ({
            result: 'ok',
            type: "team",
            data: {
                team
            }
        });
    }catch (e) {
        log.error(`team search => ${e}`);
        return ({
            result: 'fail',
            msg: '팀 검색 실패'
        });
    }
}

