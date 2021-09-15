const Egg = require('../../../db/models/Egg');
const Mpoint = require('../../../db/models/Mpoint');
const log = require('../../../lib/log');
const { Types: { ObjectId } } = require('mongoose');

exports.search = async (param) => {
    try {
        const eggs = await Egg.find().limit(5).exec();
        const mpoints = await Mpoint.find().limit(5).exec();
        var mpointList = [];
        var eggList = [];
        for(var i=0; i<Object.keys(eggs).length; i++){
            eggList.push({
                key : eggs[i].id
                , type : 'egg'
                , latitude : eggs[i].e_lat
                , longitude : eggs[i].e_lon
            });
        }
        for(var i=0; i<Object.keys(mpoints).length; i++){
            mpointList.push({
                key : mpoints[i].id
                , type : 'box'
                , latitude : mpoints[i].lat
                , longitude : mpoints[i].lon
            });
        }
        if (!eggs) {
            return ({
                result: 'fail111',
                msg: '검색 정보 없음'
            });
        }

        return ({
            result: 'ok',
            data: {
                egg : eggList,
                box : mpointList
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

