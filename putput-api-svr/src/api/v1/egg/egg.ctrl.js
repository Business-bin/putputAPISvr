const Egg = require('../../../db/models/Egg');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');
const Comment = require('../comment/comment.ctrl');
const log = require('../../../lib/log');
const essentialVarChk = require('../../../lib/essentialVarChk');

exports.register = async (param) => {
    const {
        user_id,
        contents,
        pic_url,
        emotion,
        latitude,
        longitude
    } = param;
    if(!essentialVarChk.valueCheck([user_id, contents, latitude, longitude])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    try {
        const egg = await Egg.localRegister({
            user_id,
            contents,
            pic_url,
            emotion,
            latitude,
            longitude
        });
        return ({
            result: 'ok',
            data: {
                egg_key:egg._id,
                date:egg.reg_dttm
            }
        });
    } catch (e) {
        log.error('egg register => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '알 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.egg_key, det_dttm:null};
    const fields = {
        contents : param.contents
        , pic_url : param.pic_url
        , emotion : param.emotion
    }
    try{
        if (!ObjectId.isValid(matchQ._id)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const egg = await Egg.findOneAndUpdate(matchQ, {$set:fields}, {
            upsert: false,
            returnNewDocument: true, // 결과 반환
            new: true
        }).exec();
        console.log(`egg = ${egg}`)
        if(egg){
            return ({
                result: 'ok',
                data: {
                    egg // 리턴값 삭제예정
                }
            });
        }
    }catch (e) {
        log.error('egg update => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '알 수정 실패'
        });
    }
}

exports.commentCntUpdate = async (param) => {
    const matchQ = {_id : param.id, det_dttm:null};
    try{
        const egg = await Egg.findOneAndUpdate(matchQ, {$inc:{comment_cnt:param.cnt}}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                egg
            }
        });
    }catch (e) {
        log.error('egg commentCntUpdate => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '알 수정 실패'
        });
    }
}
exports.delete = async (param) => {
    const matchQ = {_id : param.egg_key, user_id : param.user_id, det_dttm:null};
    const fields = {
        det_dttm : datefomat.getCurrentDate()
    }
    try{
        if (!ObjectId.isValid(matchQ._id)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        let egg = await Egg.findOneAndUpdate(matchQ, {$set:fields}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        if(!egg) {
            return ({
                result: 'fail',
                msg: '글이 존재하지 않습니다.'
            });
        }else{
            return ({
                result: 'ok',
                data: {
                    egg // 리턴값 삭제예정
                }
            });
        }
    }catch (e) {
        log.error('egg delete => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '알 삭제 실패'
        });
    }
}

exports.findOne = async (param) => {
    try {
        if (!ObjectId.isValid(param.egg_key)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        let egg = await Egg.findOne(
            {_id : param.egg_key, det_dttm:null},
            {"_id":true, "user_id":true, "contents":true, "pic_url":true, "emotion":true
            , "reg_dttm":true}
        ).exec();
        if(egg) {
            // 조회수 업데이트
            await Egg.findOneAndUpdate({_id : param.egg_key,det_dttm:null}, {$inc:{show_cnt:+1}}, {
                upsert: false,
                returnNewDocument: true, // 결과 반환
                new: true
            }).exec();
            egg = JSON.parse(JSON.stringify(egg));
            egg.egg_key = egg._id;
            egg.date = egg.reg_dttm;
            delete egg._id;
            delete egg.reg_dttm;
            // 댓글 검색
            let commentList = await Comment.search({egg_key:param.egg_key, det_dttm: null});
            egg.comment = commentList.data.comment.length == 0 ? [] : commentSort(commentList);
        }
        return ({
            result: 'ok',
            data: {
                egg
            }
        });
    } catch (e) {
        log.error('egg findOne => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '알 검색 실패'
        });
    }
}

exports.search = async (param) => {
    // param.det_dttm = null;
    if(!essentialVarChk.valueCheck([param.user_id])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    try {
        const page = param.page ? parseInt(param.page) : 1;                     // 현재 페이지번호
        const skipSize = (page-1) * 10;                                         // 스킵할 데이터 개수
        const limitSize = 10;                                                   // 검색할 데이터 개수
        const total = await Egg.count({user_id:param.user_id, det_dttm:null});  // 총 데이터 개수
        const paging = Math.ceil(total/limitSize);                           // 총 페이지 번호

        let egg = await Egg.find(
            {user_id:param.user_id, det_dttm:null}
            ,{"_id":true, "user_id":true, "contents":true, "pic_url":true, "emotion":true
                , "reg_dttm":true}
        ).sort({"reg_dttm": -1}).skip(skipSize).limit(limitSize).exec();

        for(let e in egg){
            let commentList = await Comment.search({egg_key:egg[e]._id, page:page, det_dttm: null});
            egg[e] = JSON.parse(JSON.stringify(egg[e]));
            egg[e].egg_key = egg[e]._id;
            egg[e].date = egg[e].reg_dttm;
            delete egg[e]._id;
            delete egg[e].reg_dttm;
            egg[e].comment = commentList.data.comment.length == 0 ? [] : commentSort(commentList);
        }
        return ({
            result: 'ok',
            data: {
                paging : paging,
                egg
            }
        });
    } catch (e) {
        log.error('egg search => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '알 검색 실패'
        });
    }
};

exports.aroundSearch = async (param) => {
    if(!essentialVarChk.valueCheck([param.longitude, param.latitude])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    try{
        let egg = await Egg.find({
                    location: {
                        $near:{     // 몽고디비 위치기반 쿼리
                            $geometry:{type:"Point", coordinates:[Number(param.longitude), Number(param.latitude)]},    // 경도 / 위도 순
                            $maxDistance:50 // 50m
                        }
                    }, det_dttm : null
                }, {_id:true, user_id:true, contents:true, comment_cnt:true, latitude:true, longitude:true}).exec();
        for(let e in egg){
            egg[e] = JSON.parse(JSON.stringify(egg[e]));
            egg[e].egg_key = egg[e]._id;
            delete egg[e]._id;
        }
        log.info(`egg ${egg.length}건 검색 완료`);
        return ({
            result: 'ok',
            data: {
                egg
            }
        });
    }catch (e) {
        log.error('egg aroundSearch => ');
        console.log(e);
        return ({
            result: 'fail',
            msg: '알 검색 실패'
        });
    }
}

commentSort = (commentList) => {
    if(commentList.data.comment.length < 4)
        return commentList.data.comment;
    commentList.data.comment.sort((d1, d2) => {
        return new Date(d2.date) - new Date(d1.date)
    })
    let commentSort = [];
    const constLength = commentList.data.comment.length;
    for(let i=1; i<=3; i++){
        commentSort.push(commentList.data.comment[constLength-i]);
    }
    for(let i=0; i<constLength-3; i++){
        commentSort.push(commentList.data.comment[i]);
    }
    return commentSort;
}
