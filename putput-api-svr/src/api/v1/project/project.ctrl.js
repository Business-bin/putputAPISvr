const Project = require('../../../db/models/Project');
const User = require('../user/user.ctrl');
const Team = require('../team/team.ctrl');
const Box = require('../box/box.ctrl');
const log = require('../../../lib/log');
const datefomat = require('../../../lib/dateFomat');
const { Types: { ObjectId } } = require('mongoose');


exports.register = async (param) => {
    const {
        user_key,
        user_id,
        title,
        join_code,
        teams,
        state,
        box_cnt
    } = param;
    try {
        let project = await Project.localRegister({
            user_key,
            user_id,
            title,
            join_code,
            teams,
            state,
            box_cnt
        });
        const team_names = param.team_name;
        let teamList = [];
        try {
            for(let t in team_names){
                const team = await Team.register({project_key:project._id,index:team_names[t].index, name:team_names[t].name});
                if(team.result === 'fail') {
                    throw new Error('팀 등록 에러');
                }
                const data = team.data.team;
                teamList.push({teamKey:data._id, index:data.index, name:data.name});
            }
        } catch (e) {
            log.error(`project register team => ${e}`);
            return ({
                result: 'fail',
                msg: '팀 등록 실패 team'
            });
        }
        try{
            const user = await User.projectCntUpdate({_id:user_key}, 1);
            if(user.result === 'fail'){
                throw Error("유저 create_p 업데이트 에러");
            }
        }catch (e) {
            log.error(`project register user => ${e}`);
            return ({
                result: 'fail',
                msg: '수정 실패 user'
            });
        }
        project = {
            projectKey: project._id
            , user_key: project.user_key
            , title: project.title
            , join_code: project.join_code
            , state: project.state
            , box_cnt: project.box_cnt
            , team_name: teamList
        }
        return ({
            result: 'ok',
            data: {
                project
            }
        });
    } catch (e) {
        log.error(`project register => ${e}`);
        return ({
            result: 'fail',
            msg: '프로젝트 등록 실패'
        });
    }
};

exports.update = async (param) => {
    const {
        project_key
        , boxlist
    } = param;
    if(!ObjectId.isValid(project_key)) {
        console.log("11111")
        return ({
            result: 'fail',
            msg: '형식 오류'
        });
    }
    try {
        // 박스 생성/수정/삭제
        let boxCnt = 0;
        for(let b in boxlist){
            let box;
            switch (boxlist[b].modifystate){
                case "insert" :
                    log.info('박스 생성')
                    boxlist[b].mission_key = boxlist[b].mission_key == "" ? null : boxlist[b].mission_key;
                    boxlist[b].reward_key = boxlist[b].reward_key == "" ? null : boxlist[b].reward_key;
                    boxCnt++;
                    boxlist[b].project_key = project_key;
                    box = await Box.register(boxlist[b]);
                    break
                case "update" :
                    log.info('박스 수정')
                    boxlist[b].mission_key = boxlist[b].mission_key == "" ? null : boxlist[b].mission_key;
                    boxlist[b].reward_key = boxlist[b].reward_key == "" ? null : boxlist[b].reward_key;
                    box = await Box.update(boxlist[b]);
                    break
                case "delete" :
                    boxCnt--
                    log.info('삭제')
                    box = await Box.delete({_id:boxlist[b].boxKey});
                    break
            }
            if(box.result === 'fail')
                throw Error("boxlist 에러");
        }
        // 프로젝트 박스카운트
        if(boxCnt != 0){
            await Project.findOneAndUpdate({_id:project_key},{$inc:{box_cnt:+boxCnt}});
        }
        const teamList = await Team.search({project_key:project_key});
        return ({
            result: 'ok',
            data: {
                project_key
                ,teamList
            }
        });
    } catch (e) {
        log.error(`project update => ${e}`);
        return ({
            result: 'fail',
            msg: '프로젝트 수정 실패'
        });
    }

}

exports.delete = async (param) => {
    const matchQ = {_id : param.projectKey, user_key : param.user_key}
    try{
        const project = await Project.findOneAndUpdate(matchQ, {$set:{det_dttm:datefomat.getCurrentDate()}}, {
            upsert: true,
            returnNewDocument: true, // 결과 반환
            new: true
        }).exec();
        const user = await User.projectCntUpdate({_id:param.user_key}, -1);
        if(user.result === 'fail')
            throw Error("유저 create_p 업데이트 에러");
        const box = await Box.delete({project_key:param.projectKey});
        if(box.result === 'fail')
            throw Error("박스 삭제 에러");
        return ({
            result: 'ok',
            data: {
                project
            }
        });
    }catch (e) {
        log.error('project delete => ');
        console.log(e)
        return ({
            result: 'fail',
            msg: '프로젝트 삭제 실패'
        });
    }
}

exports.findOne = async (param) => {
    param.det_dttm = null;
    try {
        let project =
            await Project.findOne(
                param,
                {"_id":true, "user_key":true, "title":true, "join_code":true
                    , "teams":true, "state":true, "box_cnt":true}
            ).exec();
        if(project){
            project = JSON.parse(JSON.stringify(project));
            project.projectKey = project._id;
            delete project._id;
        }
        else{
            project = {};
        }
        return ({
            result: 'ok',
            type: "project",
            data: {
                project
            }
        });
    }catch (e) {
        log.error(`project findOne => ${e}`);
        return ({
            result: 'fail',
            msg: '프로젝트 검색 실패'
        });
    }
};

exports.search = async (param) => {
    param.det_dttm = null;
    try {
        const project = await Project.find(
            param
            ,{_id:true, user_key:true, title:true, join_code:true
                , teams:true, state:true, box_cnt:true}
        ).exec();

        for(let p in project){
            // 팀 조회
            let teamList = await Team.search({project_key:project[p]._id});
            teamList = teamList.data.team;
            // 박스 조회
            let boxList = await Box.search({project_key:project[p]._id});
            boxList = boxList.data.box;

            project[p] = JSON.parse(JSON.stringify(project[p]));
            project[p].projectKey = project[p]._id;
            delete project[p]._id;
            project[p].teamList = teamList;
            project[p].boxList = boxList;
        }

        return ({
            result: 'ok',
            data: {
                project
            }
        });
    } catch (e) {
        console.log(e);
        return ({
            result: 'fail',
            msg: '프로젝트 검색 실패'
        });
    }
};

