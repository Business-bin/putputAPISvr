const Box = require('../../../db/models/Box');
const Mission = require('../mission/mission.ctrl');
const Reward = require('../reward/reward.ctrl');
const Team = require('../team/team.ctrl');
const fail = require('../../../lib/fail');
const log = require('../../../lib/log');
const datefomat = require('../../../lib/dateFomat');
const { Types: { ObjectId } } = require('mongoose');

exports.register = async (param) => {
    const {
        project_key,
        mission_key,
        reward_key,
        get_limit,
        latitude,
        longitude
    } = param;

    try {
        const box = await Box.localRegister({
            project_key,
            mission_key,
            reward_key,
            get_limit,
            latitude,
            longitude
        });
        return ({
            result: 'ok',
            data: {
                box
            }
        });
    } catch (e) {
        log.error(`box register => ${e}`);
        return ({
            result: 'fail',
            msg: '박스 등록 실패'
        });
    }
};
exports.update = async (param) => {
    const matchQ = {_id : param.box_key, det_dttm:null};
    const {
        mission_key
        , reward_key
        , get_limit
        , latitude
        , longitude
    } = param
    try{
        if (!ObjectId.isValid(matchQ._id) || param === undefined) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const box = await Box.findOneAndUpdate(matchQ, {
            mission_key
            , reward_key
            , get_limit
            , latitude
            , longitude
            , location:{type:"Point", coordinates:[Number(param.longitude),Number(param.latitude)]}
            }, {
            upsert: true,
            returnNewDocument: true, // 결과 반환
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                box
            }
        });
    }catch (e) {
        log.error('box update => ');
        console.log(e)
        return ({
            result: 'fail',
            msg: '박스 수정 실패'
        });
    }
}

exports.delete = async (param) => {
    try{
        const box = await Box.update(param, {$set:{det_dttm:datefomat.getCurrentDate()}}, {
            upsert: false,
            multi: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                box
            }
        });
    }catch (e) {
        log.error('box delete => ');
        console.log(e)
        return ({
            result: 'fail',
            msg: '박스 삭제 실패'
        });
    }
}

exports.findOne = async (param) => {
    try {
        let box =
            await Box.findOne(
                param,
                {"_id":true, "mission_key":true, "reward_key":true, "get_limit":true
                    , "latitude":true, "longitude":true}
            ).exec();
        if(box){
            box = JSON.parse(JSON.stringify(box));
            box.box_key = box._id;
            delete box._id;
            return ({
                result: 'ok',
                type: "box",
                data: {
                    box
                }
            });
        }else{
            return ({
                result: 'fail',
                msg: '상자 정보 없음'
            });
        }
    }catch (e) {
        log.error(`box findOne => ${e}`);
        return ({
            result: 'fail',
            msg: '상자 검색 실패'
        });
    }
}

exports.search = async (param) => {
    try {
        param.det_dttm = null;
        let box =
            await Box.find(
                param,
                {"_id":true, "mission_key":true, "reward_key":true, "get_limit":true
                    , "latitude":true, "longitude":true}
            ).exec();
        if(box){
            box = JSON.parse(JSON.stringify(box));
            for(let b in box){
                box[b].box_key = box[b]._id;
                delete box[b]._id;
            }
        }
        return ({
            result: 'ok',
            data: {
                box
            }
        });
    }catch (e) {
        log.error(`box search => ${e}`);
        return ({
            result: 'fail',
            msg: '상자 검색 실패'
        });
    }
}

exports.missionRewardFindOne = async (param) => {
    try {
        const box = await Box.findOne(
                {_id : param.box_key, det_dttm : null}
                ,{"_id":true, "mission_key":true, "reward_key":true}
            ).exec();
        if(!box){
            return ({
                result: 'ok'
                ,data: null
                ,msg: '키에대한 박스 없음'
            });
        }
        let mission = await Mission.findOne({_id:box.mission_key, det_dttm:null});
        mission = mission.data.mission;
        let reward = await Reward.findOne({_id:box.reward_key, det_dttm:null});
        reward = reward.data.reward;
        return ({
            result: 'ok'
            ,data: {
                mission
                ,reward
            }
        });
    }catch (e) {
        log.error(`box missionRewardFindOne => ${e}`);
        return ({
            result: 'fail',
            msg: '미션&보상 검색 실패'
        });
    }
}

exports.correctAnswer = async (param) => {
    const {
        project_key
        ,team_key
        ,box_key
    } = param;
    let get_reward = false;
    try {
        if (!ObjectId.isValid(project_key)
            || !ObjectId.isValid(team_key)
            || !ObjectId.isValid(box_key)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const box = await Box.findOne({_id : box_key, det_dttm : null}).exec();
        if(box.get_limit > box.get_cnt || box.get_limit === 0) {
            get_reward = true;
            await Box.findOneAndUpdate({_id : box_key, det_dttm : null}, {$inc:{get_cnt:+1}}, {
                upsert: false,
                returnNewDocument: true,
                new: true
            }).exec();
            // 팀 누적 획득 상자 +1
            const teamUpdate = await Team.update({team_key, $inc:{openbox_cnt:+1}});
            console.log(teamUpdate.data.team)
            if(teamUpdate.result === 'fail'){
                await fail.updateProcessiong([
                    {failOb:"BOX", matchQ:{_id:box_key}, field:{$inc:{get_cnt:-1}}}
                ]);
                throw Error("팀 상자 카운트 수정 오류");
            }
        }
        const team = await Team.search({project_key});
        return ({
            result: 'ok'
            ,data: {
                project_key
                ,get_reward
                ,teamlist : team.data.team
            }
        });
    }catch (e) {
        log.error(`correctAnswer => ${e}`);
        return ({
            result: 'fail',
            msg: '정답 처리 실패'
        });
    }
}