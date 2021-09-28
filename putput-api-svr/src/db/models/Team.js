const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Team = new Schema({
    project_key: Schema.Types.ObjectId, // 프로젝트 키
    index: Schema.Types.Number,
    name: String,                       // 팀명
    join_cnt: Schema.Types.Number,      // 누적참여인원
    openbox_cnt: Schema.Types.Number,   // 누적획득상자
    reg_dttm: Date,
    det_dttm: Date
});

Team.statics.localRegister = async function({
    project_key, index, name}) {
    const team = new this({
        project_key,
        index,
        name,
        join_cnt:0,
        openbox_cnt:0,
        reg_dttm:datefomat.getCurrentDate(),
        det_dttm:null
    });
    return team.save();
}

module.exports = mongoose.model('teams', Team);