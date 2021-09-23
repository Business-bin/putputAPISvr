const Box = require('../../../db/models/Box');
const log = require('../../../lib/log');
const datefomat = require('../../../lib/dateFomat');
const { Types: { ObjectId } } = require('mongoose');

exports.register = async (param) => {
    console.log('박스생성')
    console.log(param)
    const {
        project_key,
        get_limit,
        latitude,
        longitude
    } = param;

    try {
        const box = await Box.localRegister({
            project_key,
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

    const matchQ = {_id : param.boxKey, det_dttm:null};
    const {
        mission_key
        , reward_key
        , get_limit
        , latitude
        , longitude
    } = param
    try{
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
        const box = await Box.findOneAndUpdate(param, {$set:{det_dttm:datefomat.getCurrentDate()}}, {
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
            box.boxKey = box._id;
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
                box[b].boxKey = box[b]._id;
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

