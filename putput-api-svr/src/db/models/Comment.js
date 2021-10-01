const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Comment = new Schema({
    egg_key:    Schema.Types.ObjectId,  // 알(글) 아이디
    user_id:    String,                 // 작성자 아이디
    ac_comment: String,                 // 댓글 내용
    emotion:    String,                 // 감정표현
    reg_dttm:   Date,
    det_dttm:   Date
});

Comment.statics.localRegister = async function({
    egg_key, user_id, ac_comment, emotion}) {

    const comment = new this({
        egg_key,
        user_id,
        ac_comment,
        emotion,
        reg_dttm : datefomat.getCurrentDate(),
        det_dttm : null
    });
    return comment.save();
};

module.exports = mongoose.model('comments', Comment);