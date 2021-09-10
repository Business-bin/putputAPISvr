const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Box = new Schema({
    project_key: Schema.Types.ObjectId,     // 프로젝트 키
    mission_key:  {                         // 미션 키
        type: Schema.Types.ObjectId,
        default: null
    },
    reward_key:  {                          // 보상 키
        type: Schema.Types.ObjectId,
        default: null
    },
    latitude: String,                       // 위도
    longitude: String,                      // 경도
    get_limit: Schema.Types.Number,         // 미션성공횟수제한
    reg_dttm: {                             // 생성일시
        type: Date,
        default: datefomat.getCurrentDate()
    },
    det_dttm: {                             // 삭제일시
        type: Date,
        default: null
    }
});

Box.statics.localRegister = async function({
    project_key, mission_key, reward_key, latitude, longitude, get_limit}) {
    const box = new this({
        project_key,
        name
    });
    return box.save();
}

module.exports = mongoose.model('boxs', Box);