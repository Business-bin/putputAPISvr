const Comment = require('../../../db/models/Comment');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');
const Egg = require('../egg/egg.ctrl');
const log = require('../../../lib/log');
const essentialVarChk = require('../../../lib/essentialVarChk');
const fail = require('../../../lib/fail');

exports.register = async (param) => {
    const {
        egg_key,
        user_id,
        ac_comment,
        emotion
    } = param;
    if(!essentialVarChk.valueCheck([egg_key, user_id, ac_comment])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    try {
        let comment = await Comment.localRegister({
            egg_key,
            user_id,
            ac_comment,
            emotion
        });
        // comment = {
        //     comment_key : comment._id,
        //     date : comment.reg_dttm
        // }
        const eggParam = {
            id:egg_key,
            cnt:+1 // {$inc:{comment_cnt:+1}}
        }
        const egg = await Egg.commentCntUpdate(eggParam);
        if(egg.result === 'fail'){
            await fail.deleteProcessiong([{failOb:"COMMENT", field:{_id:comment.comment_key}}]);
            throw Error("알 댓글 카운트 업데이트 에러");
        }
        return ({
            result: 'ok',
            data: {
                comment_key : comment._id,
                date : comment.reg_dttm
            }
        });
    } catch (e) {
        log.error('comment register => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '댓글 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.comment_key, det_dttm:null};
    const fields = {
        ac_comment : param.ac_comment
        , emotion : param.emotion
    }
    try{
        if (!ObjectId.isValid(matchQ._id)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const comment = await Comment.findOneAndUpdate(matchQ, {$set:fields}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        console.log(`comment = ${comment}`)
        if(comment){
            return ({
                result: 'ok',
                data: {
                    comment // 리턴값 삭제예정
                }
            });
        }
    }catch (e) {
        log.error('comment update => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '댓글 수정 실패'
        });
    }
}

exports.delete = async (param) => {
    const matchQ = {_id : param.comment_key, user_id : param.user_id, det_dttm:null};
    const fields = {
        det_dttm : datefomat.getCurrentDate()
    }
    if(!essentialVarChk.valueCheck([matchQ.user_id])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    try{
        if (!ObjectId.isValid(matchQ._id)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const comment = await Comment.findOneAndUpdate(matchQ, {$set:fields}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();

        const eggParam = {
            id:comment.egg_key,
            cnt:-1
        }
        const egg = await Egg.commentCntUpdate(eggParam);
        if(egg.result === "fail"){
            await fail.updateProcessiong([{failOb:"COMMENT", matchQ:{_id:matchQ._id}, field:{det_dttm:null}}]);
            throw Error("알 댓글 카운트 업데이트 에러");
        }

        if(comment){
            return ({
                result: 'ok',
                data: {
                    comment // 리턴값 삭제예정
                }
            });
        }
    }catch (e) {
        log.error('comment delete => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '댓글 삭제 실패'
        });
    }
}

exports.search = async (param) => {
    try {
        let comment =
            await Comment.find(
                param,
                {"_id":true, "user_id":true, "ac_comment":true, "emotion":true, "reg_dttm":true}
            ).exec();
        if(comment != '' && comment != undefined && comment != null){
            comment = JSON.parse(JSON.stringify(comment));
            for(let c in comment){
                comment[c].comment_key = comment[c]._id;
                comment[c].date = comment[c].reg_dttm;
                delete comment[c]._id;
                delete comment[c].reg_dttm;
            }
        }
        return ({
            result: 'ok',
            type: "comment",
            data: {
                comment
            }
        });
    }catch (e) {
        log.error('comment search => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '팀 검색 실패'
        });
    }
}
