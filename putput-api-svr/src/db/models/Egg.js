const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Egg = new Schema({
    user_id: String,                    // 작성자 아이디
    contents: String,                   // 글 내용
    pic_URL: String,                    // 이미지경로
    emotion: String,                    // 감정표현
    show_cnt: Schema.Types.Number,      // 조회수 d 0
    comment_cnt: Schema.Types.Number,   // 댓글개수 d 0
    latitude: String,                   // 위도
    longitude: String,                  // 경도
    reg_dttm: {
        type: Date,
        default: datefomat.getCurrentDate()
    },
    del_dttm: {
        type: Date,
        default: null
    }
});

Egg.statics.localRegister = async function({
    user_id, contents, pic_URL, emotion, latitude, longitude}) {
        const egg = new this({
            user_id,
            contents,
            pic_URL,
            emotion,
            latitude,
            longitude,
            show_cnt : 0,
            comment_cnt : 0
        });
        return egg.save();
    };

module.exports = mongoose.model('eggs', Egg);