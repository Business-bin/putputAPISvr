const Egg = require('../../../db/models/Egg');
const Stack = require('../../../db/models/Stack');
const { Types: { ObjectId } } = require('mongoose');

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
            msg: '등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.eggKey, del_dttm:null};
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
        // const egg = await Egg.updateOne(key, fields,{
        //     upsert: false,
        //     multi: false,
        //     new: true
        // }).exec();
        const egg = await Egg.findByIdAndUpdate(matchQ, {$set: fields}, {  // set을 해야 해당 필드만 update 함
            upsert: false,
            new: true
        }).exec();
        console.log(`egg = ${JSON.stringify(egg)}`)
        if(egg){
            return ({
                result: 'ok',
                data: {
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

