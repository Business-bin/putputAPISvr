const mongoose = require('mongoose');
const { Schema } = mongoose;
const datefomat = require('../../lib/dateFomat');

const Mission = new Schema({
    user_key: Schema.Types.ObjectId,        // 출제자 키
    question: String,                       // 문재내용
    ex1: String,                            // 보기1
    ex2: String,                            // 보기2
    ex3: String,                            // 보기3
    ex4: String,                            // 보기4
    solution: String,                       // 문제 답
    exposition: String,                     // 문제 해설
    reg_dttm: Date,
    det_dttm: Date
});

Mission.statics.localRegister = async function({
    user_key, question, ex1, ex2, ex3, ex4, solution, exposition}) {

    const mission = new this({
        user_key,
        question,
        ex1,
        ex2,
        ex3,
        ex4,
        solution,
        exposition,
        reg_dttm : datefomat.getCurrentDate(),
        det_dttm : null
    });
    return mission.save();
};

module.exports = mongoose.model('missions', Mission);