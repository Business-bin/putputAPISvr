const Egg = require('../../../db/models/Egg');
const Comment = require('../../../db/models/Comment');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');

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

        return ({
            result: 'ok',
            data: {
                comment
            }
        });
    } catch (e) {
        console.log(e);
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
        console.log(e);
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
        console.log(comment);
        if(comment){
            return ({
                result: 'ok',
                data: {
                    comment // 리턴값 삭제예정
                }
            });
        }
    }catch (e) {
        console.log(e);
        return ({
            result: 'fail',
            msg: '댓글 삭제 실패'
        });
    }
}
