const Egg = require('../../../db/models/Egg');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');
const calcDistance = require('../../../lib/calcDistance');
const Comment = require('../comment');
const log = require('../../../lib/log');

exports.register = async (param) => {
    const {
        user_id,
        contents,
        pic_URL,
        emotion,
        latitude,
        longitude
    } = param;

    try {
        const egg = await Egg.localRegister({
            user_id,
            contents,
            pic_URL,
            emotion,
            latitude,
            longitude
        });

        return ({
            result: 'ok',
            data: {
                egg
            }
        });
    } catch (e) {
        log.error(`egg register => ${e}`);
        return ({
            result: 'fail',
            msg: '알 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.egg_key, det_dttm:null};
    const fields = {
        contents : param.contents
        , pic_URL : param.pic_URL
        , emotion : param.emotion
    }
    try{
        if (!ObjectId.isValid(matchQ._id) || fields === undefined) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const egg = await Egg.findOneAndUpdate(matchQ, {$set:fields}, {
            upsert: false,
            returnNewDocument: true, // 결과 반환
            new: true
        }).exec();
        console.log(`egg = ${egg}`)
        if(egg){
            return ({
                result: 'ok',
                data: {
                    egg // 리턴값 삭제예정
                }
            });
        }
    }catch (e) {
        log.error(`egg update => ${e}`);
        return ({
            result: 'fail',
            msg: '알 수정 실패'
        });
    }
}
showUpdate = async (param) => {
    try{
        const egg = await Egg.findOneAndUpdate(param, {$inc:{show_cnt:+1}}, {
            upsert: false,
            returnNewDocument: true, // 결과 반환
            new: true
        }).exec();
        if(egg){
            return ({
                result: 'ok',
                data: {
                    egg
                }
            });
        }
    }catch (e) {
        log.error(`egg showUpdate => ${e}`);
        return ({
            result: 'fail',
            msg: '알 조회수 수정 실패'
        });
    }
}

exports.delete = async (param) => {
    const matchQ = {_id : param.egg_key, user_id : param.user_id, det_dttm:null};
    const fields = {
        det_dttm : datefomat.getCurrentDate()
    }
    try{
        if (!ObjectId.isValid(matchQ._id) || fields === undefined) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const egg = await Egg.findOneAndUpdate(matchQ, {$set:fields}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        console.log(egg);
        if(egg){
            return ({
                result: 'ok',
                data: {
                    egg // 리턴값 삭제예정
                }
            });
        }
    }catch (e) {
        log.error(`egg delete => ${e}`);
        return ({
            result: 'fail',
            msg: '알 삭제 실패'
        });
    }
}

exports.findOne = async (param) => {
    try {
        let egg = await Egg.findOne(
            {_id : param.egg_key}
            ,{"_id":true, "user_id":true, "contents":true, "pic_URL":true, "emotion":true
            , "reg_dttm":true}
        ).exec();
        if(egg) {
            // 조회수 업데이트
            showUpdate({_id : param.egg_key, del_dttm: null});
            egg = JSON.parse(JSON.stringify(egg));
            egg.egg_key = egg._id;
            egg.date = egg.reg_dttm;
            delete egg._id;
            delete egg.reg_dttm;
            // 댓글 검색
            let commentList = await Comment.search({egg_key:param.egg_key, det_dttm: null});
            egg.comment = commentList.data.comment;
        }
        return ({
            result: 'ok',
            data: {
                egg
            }
        });
    } catch (e) {
        log.error(`egg findOne => ${e}`);
        return ({
            result: 'fail',
            msg: '알 검색 실패'
        });
    }
}

exports.search = async (param) => {
    try {
        let egg = await Egg.find(
            param
            ,{"_id":true, "user_id":true, "contents":true, "pic_URL":true, "emotion":true
                , "reg_dttm":true}
        ).exec();

        for(let e in egg){
            let commentList = await Comment.search({egg_key:egg[e]._id, det_dttm: null});
            egg[e] = JSON.parse(JSON.stringify(egg[e]));
            egg[e].egg_key = egg[e]._id;
            egg[e].date = egg[e].reg_dttm;
            delete egg[e]._id;
            delete egg[e].reg_dttm;
            egg[e].comment = commentList.data.comment;
        }
        return ({
            result: 'ok',
            data: {
                egg
            }
        });
    } catch (e) {
        log.error(`egg search => ${e}`);
        return ({
            result: 'fail',
            msg: '알 검색 실패'
        });
    }
};

exports.aroundSearch = async (param) => {
    const coordinate = calcDistance.calcDistance1(param.myLatitude, param.myLongitude);
    console.log("coordinate = ");
    console.log(coordinate);
    try{
        let egg = await Egg.find({
            $and : [{latitude:{$gte:coordinate.lLat}}
                , {longitude:{$gte:coordinate.lLon}}
                , {latitude:{$lte:coordinate.hLat}}
                , {longitude:{$lte:coordinate.hLon}}
                , {det_dttm:null}]
        }, {_id:true, user_id:true, comment_cnt:true, latitude:true, longitude:true}).exec();
        for(let e in egg){
            egg[e] = JSON.parse(JSON.stringify(egg[e]));
            egg[e].egg_key = egg[e]._id;
            delete egg[e]._id;
        }
        return ({
            result: 'ok',
            data: {
                egg
            }
        });
    }catch (e) {
        log.error(`egg aroundSearch => ${e}`);
        return ({
            result: 'fail',
            msg: '알 검색 실패'
        });
    }
}

