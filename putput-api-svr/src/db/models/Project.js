const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Project = new Schema({
    user_key:   Schema.Types.ObjectId,  // 유저키
    user_id:    String,                 // 유저아이디 (생성자)
    title:      String,                 // 프로젝트 명
    teams:      String,                 // 팀 수(1:개인전, 2~ : 팀전)
    join_code:  String,                 // 초대코드(null : 공개)
    state:      String,                 // 프로젝트상태(play:진행중 , stop:중지)
    reg_flag: {                         // 지역이벤트플래그(광고)
        type:   String,
        default: ""
    },
    box_cnt:    Schema.Types.Number,    // 생성된 박스 개수
    reg_dttm:   Date,                   // 생성일시
    det_dttm:   Date                    // 삭제일시
});

Project.statics.localRegister = async function({
    user_key, user_id, title, join_code, teams, state, box_cnt}) {
    const project = new this({
        user_key,
        user_id,
        title,
        join_code,
        teams,
        state,
        box_cnt,
        reg_dttm : datefomat.getCurrentDate(),
        det_dttm : null
    });
    return project.save();
}

module.exports = mongoose.model('projects', Project);