const Box = require('../../../db/models/Box');
const log = require('../../../lib/log');
const { Types: { ObjectId } } = require('mongoose');


exports.update = async (param) => {
    param.det_dttm = null;
    console.log("param == ");
    console.log(param);
    const {
        _id
        , mission_key
        , reward_key
        , get_limit
        , latitude
        , longitude
    } = param;
    try{
        // const box = await Box.findOneAndUpdate(matchQ, {$set:fields}, {
        //     upsert: true,
        //     returnNewDocument: true, // 결과 반환
        //     new: true
        // }).exec();
        return ({
            result: 'ok',
            data: {
                // box
            }
        });
    }catch (e) {
        log.error(`box update => ${e}`);
        return ({
            result: 'fail',
            msg: '박스 수정 실패'
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

