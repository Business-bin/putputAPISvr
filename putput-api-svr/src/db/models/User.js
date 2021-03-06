const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const User = new Schema({
    join_p_key: {
        type:       Schema.Types.ObjectId,    // 프로젝트키(참가중인)
        default:    null
    },
    join_p_jointeamkey: {                   // 프로젝트 내 참가한 팀 키
        type:       Schema.Types.ObjectId,
        default:    null
    },
    user_id:        String,             // 아이디
    user_pw:        String,             // 패스워드
    name:           String,             // 이름
    email:          String,             // 이메일
    phone:          String,             // 핸드폰번호
    push_id:        String,             // 원시그널 유저아이디
    nick:           String,             // 닉네임
    lv:             String,             // 권한 (admin, user)
    max_p: {                            // 최대프로젝트개수
        type:       Schema.Types.Number,
        default:    0
    },
    create_p:  {                        // 현재생성프로젝트개수
        type:       Schema.Types.Number,
        default:    0
    },
    etc:  {                             // 기타
        type:       String,
        default:    ""
    },
    reg_dttm:       Date,               // 가입일시
    det_dttm:       Date                // 탈퇴일시
});

User.statics.localRegister = async function({
    user_id, user_pw, name, email, phone, push_id }) {
    const user = new this({
        user_id,
        user_pw,
        name,
        email,
        phone,
        push_id,
        nick : "",
        reg_dttm : datefomat.getCurrentDate(),
        det_dttm : null
    });
    return user.save();
}

module.exports = mongoose.model('users', User);