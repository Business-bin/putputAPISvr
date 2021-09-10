const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Team = new Schema({
    project_key: Schema.Types.ObjectId, // 프로젝트 키
    name: String,                       // 팀명
    join_cnt:  Schema.Types.Number,
    openbox_cnt: Schema.Types.Number,
    reg_dttm: Date,
    det_dttm: Date,
    // join_cnt:  {                        // 누적참여인원
    //     type: Schema.Types.Number,
    //     default: 0
    // },
    // openbox_cnt:  {                     // 누적획득상자
    //     type: Schema.Types.Number,
    //     default: 0
    // },
    // reg_dttm: {                         // 생성일시
    //     type: Date,
    //     default: datefomat.getCurrentDate()
    // },
    // det_dttm: {                         // 삭제일시
    //     type: Date,
    //     default: null
    // }
});

Team.statics.localRegister = async function({
    project_key, name}) {
    const team = new this({
        project_key,
        name,
        join_cnt:0,
        openbox_cnt:0,
        reg_dttm:datefomat.getCurrentDate(),
        det_dttm:null
    });
    return team.save();
}

module.exports = mongoose.model('teams', Team);