const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Egg = new Schema({
    user_id:        String,                 // 작성자 아이디
    contents:       String,                 // 글 내용
    pic_url:        String,                 // 이미지경로
    emotion:        String,                 // 감정표현
    show_cnt:       Schema.Types.Number,    // 조회수 d 0
    comment_cnt:    Schema.Types.Number,    // 댓글개수 d 0
    latitude:       String,                 // 위도
    longitude:      String,                 // 경도
    location: {
        type :      Schema.Types.Object,
        index:      "2dsphere"
    },
    reg_dttm: Date,
    det_dttm: Date
});

Egg.statics.localRegister = async function({
    user_id, contents, pic_url, emotion, latitude, longitude}) {
        const egg = new this({
            user_id,
            contents,
            pic_url,
            emotion,
            latitude,
            longitude,
            location:{type:"Point", coordinates:[Number(longitude),Number(latitude)]},
            show_cnt : 0,
            comment_cnt : 0,
            reg_dttm : datefomat.getCurrentDate(),
            det_dttm : null
        });
        return egg.save();
    };

module.exports = mongoose.model('eggs', Egg);