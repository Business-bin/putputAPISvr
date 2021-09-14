const Box = require('../../../db/models/Box');
const Team = require('../../../db/models/Team');
const { Types: { ObjectId }, startSession } = require('mongoose');

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
        console.log(e);
        return ({
            result: 'fail',
            msg: '상자 검색 실패'
        });
    }
}

exports.search = async (param) => {
    try {
        let box =
            await Box.find(
                param,
                {"_id":true, "mission_key":true, "reward_key":true, "get_limit":true
                    , "latitude":true, "longitude":true}
            ).exec();
        if(box != '' && box != undefined && box != null){
            box = JSON.parse(JSON.stringify(box));
            for(let b in box){
                box[b].boxKey = box[b]._id;
                delete box[b]._id;
            }
        }else{
            box = [];
        }
        return ({
            result: 'ok',
            type: "box",
            data: {
                box
            }
        });
    }catch (e) {
        console.log(e);
        return ({
            result: 'fail',
            msg: '상자 검색 실패'
        });
    }
}

