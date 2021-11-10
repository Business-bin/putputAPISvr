const Reward = require('../../../db/models/Reward');
const { Types: { ObjectId } } = require('mongoose');
const datefomat = require('../../../lib/dateFomat');
const log = require('../../../lib/log');
const essentialVarChk = require('../../../lib/essentialVarChk');

exports.register = async (param) => {
    const {
        user_key,
        contents,
        img_url
    } = param;
    if(!essentialVarChk.valueCheck([user_key, contents])){
        return ({
            result: 'fail',
            msg: '필수 값 확인'
        });
    }
    try {
        let reward = await Reward.localRegister({
            user_key,
            contents,
            img_url
        });
        return ({
            result: 'ok',
            data: {
                reward_key:reward._id
            }
        });
    } catch (e) {
        log.error(`reward register =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '보상 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const matchQ = {_id : param.reward_key, det_dttm:null};
    delete param.reward_key;
    try{
        if (!ObjectId.isValid(matchQ._id)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const reward = await Reward.findOneAndUpdate(matchQ, {$set:param}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                reward // 리턴값 삭제예정
            }
        });
    }catch (e) {
        log.error(`reward update =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '보상 수정 실패'
        });
    }
}
//
exports.delete = async (param) => {
    const matchQ = {_id : param.reward_key, user_key : param.user_key, det_dttm:null};
    const fields = {
        det_dttm : datefomat.getCurrentDate()
    }
    try{
        if (!ObjectId.isValid(matchQ._id) || !ObjectId.isValid(matchQ.user_key)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const reward = await Reward.findOneAndUpdate(matchQ, {$set:fields}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
                reward // 리턴값 삭제예정
            }
        });
    }catch (e) {
        log.error(`reward delete =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '보상 삭제 실패'
        });
    }
}

exports.findOne = async (param) => {
    try {
        let reward =
            await Reward.findOne(
                param,
                {"_id":true, "contents":true, "img_url":true}
            ).exec();
        if(reward){
            reward = JSON.parse(JSON.stringify(reward));
            reward.reward_key = reward._id;
            delete reward._id;
        }
        return ({
            result: 'ok',
            data: {
                reward
            }
        });
    }catch (e) {
        log.error(`reward findOne =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '보상 검색 실패'
        });
    }
}

exports.search = async (param) => {
    try {
        if (!ObjectId.isValid(param.user_key)) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        param.det_dttm = null;
        let reward;
        let paging;
        if(param.page || param.page == ''){
            const page = param.page ? parseInt(param.page) : 1;
            delete param.page;
            const skipSize = (page-1) * 100;
            const limitSize = 100;
            const total = await Reward.count(param);
            paging = Math.ceil(total/limitSize);
            reward =
                await Reward.find(
                    param,
                    {"_id":true, "contents":true, "img_url":true}
                ).skip(skipSize).limit(limitSize).exec();
        }else{
            reward =
                await Reward.find(
                    param,
                    {"_id":true, "contents":true, "img_url":true}
                ).exec();
        }
        if(reward){
            reward = JSON.parse(JSON.stringify(reward));
            for(let r in reward){
                reward[r].reward_key = reward[r]._id;
                delete reward[r]._id;
            }
        }
        return ({
            result: 'ok',
            paging: paging,
            data: {
                reward
            }
        });
    }catch (e) {
        log.error(`reward search =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '보상 검색 실패'
        });
    }
}