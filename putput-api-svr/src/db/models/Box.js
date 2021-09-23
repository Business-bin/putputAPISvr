const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Box = new Schema({
    project_key: Schema.Types.ObjectId,     // 프로젝트 키
    mission_key: {
        type : Schema.Types.ObjectId,
        default : null
    },                                      // 미션 키
    reward_key: {
        type : Schema.Types.ObjectId,
        default : null
    },                                      // 보상 키
    get_limit: String,                      // 미션성공횟수제한
    latitude: String,                       // 위도
    longitude: String,                      // 경도
    location: {
        type : Schema.Types.Object,
        index: "2dsphere"
    },
    reg_dttm: Date,
    det_dttm: Date
});

Box.statics.localRegister = async function({
    project_key, get_limit, latitude, longitude}) {
    const box = new this({
        project_key
        ,get_limit
        ,latitude
        ,longitude
        ,location:{type:"Point", coordinates:[Number(longitude),Number(latitude)]}
        ,reg_dttm:datefomat.getCurrentDate()
        ,det_dttm:null
    });
    return box.save();
}

module.exports = mongoose.model('boxs', Box);