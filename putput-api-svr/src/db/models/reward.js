const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Reward = new Schema({
    user_key: Schema.Types.ObjectId,        // 유저키(생성자)
    mission_key: Schema.Types.ObjectId,     // 미션키
    content: String,                        // 보상내용/링크
    img_url: String,                        // 이미지경로
    uselimit_start: Date,                   // 사용가능시작일
    uselimit_end: Date,                     // 사용가능종료일
    reg_dttm: {
        type: Date,
        default: datefomat.getCurrentDate()
    },
    det_dttm: {
        type: Date,
        default: null
    }
});

Reward.statics.localRegister = async function({
    user_key, content, img_url}) {

    const reward = new this({
        user_key,
        content,
        img_url
    });
    return reward.save();
};

module.exports = mongoose.model('rewards', Reward);