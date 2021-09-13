const Egg = require('../../../db/models/Egg');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');

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
        console.log(e);
        return ({
            result: 'fail',
            msg: '글 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.eggKey, det_dttm:null};
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
        console.log(e);
        return ({
            result: 'fail',
            msg: '글 수정 실패'
        });
    }
}

exports.delete = async (param) => {
    const matchQ = {_id : param.eggKey, user_id : param.user_id, det_dttm:null};
    const fields = {
        del_dttm : datefomat.getCurrentDate()
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
        console.log(e);
        return ({
            result: 'fail',
            msg: '글 삭제 실패'
        });
    }
}

exports.search = async (param) => {
    try {
        const eggs = await Egg.find(param).limit(5).exec();
        var eggList = [];
        for(var i=0; i<Object.keys(eggs).length; i++){
            eggList.push({
                key : eggs[i].id
                , latitude : eggs[i].e_lat
                , longitude : eggs[i].e_lon
            });
        }
        console.log("--------------------------");
        console.log(eggList);
        console.log("--------------------------");
        if (!eggs) {
            return ({
                result: 'fail111',
                msg: '검색 정보 없음'
            });
        }

        return ({
            result: 'ok',
            type: "egg",
            data: {
                eggList
            }
        });
    } catch (e) {
        console.log(e);
        return ({
            result: 'fail222',
            msg: '정보 검색 실패'
        });
    }
};

