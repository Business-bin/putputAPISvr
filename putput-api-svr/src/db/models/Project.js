const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Project = new Schema({
    user_key: Schema.Types.ObjectId,    // 유저키
    user_id: String,                    // 유저아이디 (생성자)
    title: String,                      // 프로젝트 명
    teams:  {                           // 팀 수(1:개인전, 2~ : 팀전)
        type: String,
        default: "1"
    },
    join_code:  {                       // 초대코드(null : 공개)
        type: String,
        default: null
    },
    state:  {                           // 프로젝트상태(play:진행중 , stop:중지)
        type: String,
        default: "stop"
    },
    reg_flag:  {                        // 지역이벤트플래그(광고)
        type: String,
        default: ""
    },
    box_cnt: {                          // 생성된 박스 개수
        type: Schema.Types.Number,
        default: 0
    },
    reg_dttm: {                         // 생성일시
        type: Date,
        default: datefomat.getCurrentDate()
    },
    det_dttm: {                         // 삭제일시
        type: Date,
        default: null
    }
});

Project.statics.localRegister = async function({
    user_key, title, join_code, teams, state, box_cnt}) {
    const project = new this({
        user_key,
        title,
        join_code,
        teams,
        state,
        box_cnt
    });
    return project.save();
}

module.exports = mongoose.model('projects', Project);