const Egg = require('../../../db/models/Egg');
const Comment = require('../../../db/models/Comment');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');
const log = require('../../../lib/log');

exports.register = async (param) => {
    const {
        egg_key,
        user_id,
        ac_comment,
        emotion
    } = param;

    try {
        let comment = await Comment.localRegister({
            egg_key,
            user_id,
            ac_comment,
            emotion
        });
        comment = {
            commentKey : comment._id
            , date : comment.reg_dttm
        }
        const egg = await Egg.findOneAndUpdate({_id:egg_key}, {$inc:{comment_cnt:+1}}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();

        return ({
            result: 'ok',
            data: {
                comment
            }
        });
    } catch (e) {
        log.error(`comment register => ${e}`);
        return ({
            result: 'fail',
            msg: '댓글 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.commentKey, det_dttm:null};
    const fields = {
        ac_comment : param.ac_comment
        , emotion : param.emotion
    }
    try{
        if (!ObjectId.isValid(matchQ._id) || fields === undefined) {
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
        log.error(`comment update => ${e}`);
        return ({
            result: 'fail',
            msg: '댓글 수정 실패'
        });
    }
}

exports.delete = async (param) => {
    const matchQ = {_id : param.commentKey, user_id : param.user_id, det_dttm:null};
    const fields = {
        det_dttm : datefomat.getCurrentDate()
    }
    try{
        if (!ObjectId.isValid(matchQ._id) || fields === undefined) {
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
        const egg = await Egg.findOneAndUpdate({_id:comment.egg_key}, {$inc:{comment_cnt:-1}}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        if(comment){
            return ({
                result: 'ok',
                data: {
                    comment // 리턴값 삭제예정
                }
            });
        }
    }catch (e) {
        log.error(`comment delete => ${e}`);
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
                comment[c].commentKey = comment[c]._id;
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
        log.error(`comment search => ${e}`);
        return ({
            result: 'fail',
            msg: '팀 검색 실패'
        });
    }
}
