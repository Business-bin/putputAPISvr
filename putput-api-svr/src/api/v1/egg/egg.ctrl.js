const Egg = require('../../../db/models/Egg');
const Stack = require('../../../db/models/Stack');
const { Types: { ObjectId } } = require('mongoose');

exports.registerTest = async (param) => {
    const {
        u_id,
        u_name,
        e_content,
        e_file,
        e_show_cnt,
        e_lat,
        e_lon,
        reg_dttm
    } = param;

    try {
        const egg = await Egg.localRegister({
            u_id,
            u_name,
            e_content,
            e_file,
            e_show_cnt,
            e_lat,
            e_lon,
            reg_dttm
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

exports.searchTest = async (param) => {
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

