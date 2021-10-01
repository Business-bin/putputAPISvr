const Project = require('../../../db/models/Project');
const User = require('../user/user.ctrl');
const Team = require('../team/team.ctrl');
const Box = require('../box/box.ctrl');
const log = require('../../../lib/log');
const datefomat = require('../../../lib/dateFomat');
const fail = require('../../../lib/fail');
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
        let teamlist = [];
        for(let t in team_names){
            const team = await Team.register({project_key:project._id,index:team_names[t].index, name:team_names[t].name});
            if(team.result === 'fail') {
                await fail.deleteProcessiong([
                    {failOb:"PROJECT", field:{_id:project._id}}
                    ,{failOb:"TEAM", field:{project_key:project._id}}
                ]);
                throw new Error('팀 등록 에러');
            }
            const data = team.data.team;
            teamlist.push({team_key:data._id, index:data.index, name:data.name});
        }

        const user = await User.projectCntUpdate({_id:user_key}, 1);
        if(user.result === 'fail'){
            await fail.deleteProcessiong([
                {failOb:"PROJECT", field:{_id:project._id}}
                ,{failOb:"TEAM", field:{project_key:project._id}}
            ]);
            throw Error("유저 create_p 업데이트 에러");
        }
        project = {
            project_key: project._id
            , user_key: project.user_key
            , title: project.title
            , join_code: project.join_code
            , state: project.state
            , box_cnt: project.box_cnt
            , team_name: teamlist
        }
        return ({
            result: 'ok',
            data: {
                project
            }
        });
    } catch (e) {
        log.error(`project register =>`);
        console.log(e);
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
        return ({
            result: 'fail',
            msg: '형식 오류'
        });
    }
    try {
        // 박스 생성/수정/삭제
        let boxCnt = 0;
        let boxInHistoryArr = [];
        let boxUpHistoryArr = [];
        let boxDeHistoryArr = [];
        for(let b in boxlist){
            let box;
            switch (boxlist[b].modifystate){
                case "insert" :
                    boxlist[b].mission_key = boxlist[b].mission_key == "" ? null : boxlist[b].mission_key;
                    boxlist[b].reward_key = boxlist[b].reward_key == "" ? null : boxlist[b].reward_key;
                    boxCnt++;
                    boxlist[b].project_key = project_key;
                    box = await Box.register(boxlist[b]);
                    boxInHistoryArr.push({_id : box.data.box._id});
                    break
                case "update" :
                    boxUpHistoryArr.push(await Box.findOne({_id:boxlist[b].box_key}));
                    boxlist[b].mission_key = boxlist[b].mission_key == "" ? null : boxlist[b].mission_key;
                    boxlist[b].reward_key = boxlist[b].reward_key == "" ? null : boxlist[b].reward_key;
                    box = await Box.update(boxlist[b]);
                    break
                case "delete" :
                    boxCnt--
                    boxDeHistoryArr.push({_id:boxlist[b].box_key});
                    box = await Box.delete({_id:boxlist[b].box_key});
                    break
            }
            if(box.result === 'fail'){
                for(let i in boxInHistoryArr){
                    await fail.deleteProcessiong([{failOb:"BOX", field:boxInHistoryArr[i]}]);
                }
                for(let u in boxUpHistoryArr){
                    await fail.updateProcessiong([
                        {failOb:"BOX", matchQ:{_id:boxUpHistoryArr[u].data.box.box_key}, field:boxUpHistoryArr[u].data.box}
                    ]);
                }
                for(let d in boxDeHistoryArr){
                    await fail.updateProcessiong([
                        {failOb:"BOX", matchQ:boxDeHistoryArr[d], field: {det_dttm:null}}
                    ]);
                }
                throw Error("boxlist 에러");
            }
        }
        // 프로젝트 박스카운트
        if(boxCnt != 0){
            await Project.findOneAndUpdate({_id:project_key},{$inc:{box_cnt:+boxCnt}});
        }
        const teamlist = await Team.search({project_key:project_key});
        return ({
            result: 'ok',
            data: {
                project_key
                ,teamlist:teamlist.data.team
            }
        });
    } catch (e) {
        log.error('project update => ');
        console.log(e)
        return ({
            result: 'fail',
            msg: '프로젝트 수정 실패'
        });
    }

}

exports.delete = async (param) => {
    const matchQ = {_id : param.project_key, user_key : param.user_key}
    if(!ObjectId.isValid(param.project_key)) {
        return ({
            result: 'fail',
            msg: '형식 오류'
        });
    }
    try{
        const project = await Project.findOneAndUpdate(matchQ, {$set:{det_dttm:datefomat.getCurrentDate()}}, {
            upsert: false,
            returnNewDocument: true, // 결과 반환
            new: true
        }).exec();
        const user = await User.projectCntUpdate({_id:param.user_key}, -1);
        if(user.result === 'fail') {
            await projectDelFail("USER", param);
            throw Error("유저 create_p 업데이트 에러");
        }
        const box = await Box.delete({project_key:param.project_key});
        if(box.result === 'fail'){
            await projectDelFail("BOX", param);
            throw Error("박스 삭제 에러");
        }
        const team = await Team.delete({project_key:param.project_key});
        if(team.result === 'fail'){
            await projectDelFail("TEAM", param);
            throw Error("팀 삭제 에러");
        }
        return ({
            result: 'ok',
            data: {
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
        project = project ? JSON.parse(JSON.stringify(project)) : {};
        if(project){
            project.project_key = project._id;
            delete project._id;
        }
        return ({
            result: 'ok',
            type: "project",
            data: {
                project
            }
        });
    }catch (e) {
        log.error(`project findOne =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '프로젝트 검색 실패'
        });
    }
};

exports.publicProjectList = async (param) => {
    param.state = 'play';
    try {
        const project = await this.search(param);
        return ({
            result: 'ok',
            data: {
                project : project.data.project
            }
        });
    } catch (e) {
        log.error(`project publicProjectList =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '진행중 프로젝트 검색 실패'
        });
    }
}

exports.myProjectList = async (param) => {
    try {
        const project = await this.search(param);
        return ({
            result: 'ok',
            data: {
                project : project.data.project
            }
        });
    } catch (e) {
        log.error(`project myProjectList =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '생성 프로젝트 검색 실패'
        });
    }
}

exports.eventProjectList = async (param) => {
    param.reg_flag = {$ne:""};
    try {
        const project = await this.search(param);
        return ({
            result: 'ok',
            data: {
                project : project.data.project
            }
        });
    } catch (e) {
        log.error(`project eventProjectList =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '지역 이벤트 프로젝트 검색 실패'
        });
    }
}

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
            let teamlist = await Team.search({project_key:project[p]._id});
            teamlist = teamlist.data.team;
            // 박스 조회
            let boxlist = await Box.search({project_key:project[p]._id});
            boxlist = boxlist.data.box;

            project[p] = JSON.parse(JSON.stringify(project[p]));
            project[p].project_key = project[p]._id;
            delete project[p]._id;
            project[p].teamlist = teamlist;
            project[p].boxlist = boxlist;
        }
        return ({
            result: 'ok',
            data: {
                project
            }
        });
    } catch (e) {
        log.error(`project search =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '프로젝트 검색 실패'
        });
    }
};

exports.joinProject = async (param) => {
    const{
        user_key
        ,project_key
        ,team_key
        ,join_code
    } = param
    try {
        // 참여중이 프로젝트 체크
        const userChk = await User.findOne({_id:user_key, det_dttm:null});
        if(userChk.data.user.join_p_key){
            return ({
                result: 'fail',
                msg: '참가중인 프로젝트 있음'
            });
        }
        // 참여코드 확인
        let project = await Project.findOne(
                {_id:project_key, det_dttm:null},
                {"_id":true, "user_key":true, "title":true, "join_code":true
                    , "teams":true, "state":true, "box_cnt":true}
            ).exec();
        if(project.join_code != '' && project.join_code != join_code){
            return ({
                result: 'fail',
                msg: '참여코드 확인 바랍니다.'
            });
        }
        // 유저 정보 업데이트
        const user = await User.update({user_key, join_p_key:project_key, join_p_jointeamkey:team_key});
        if(user.result === 'fail')
            throw Error("유저 참여 프로젝트 정보 업데이트 에러");
        // 팀 누적참여인원 업데이트
        const teamUpdate = await Team.updateJoinCnt({team_key});
        if(teamUpdate.result === 'fail'){
            await fail.updateProcessiong([
                {
                    failOb:"USER", matchQ:{_id:user_key},
                    field: {join_p_key:userChk.data.user.join_p_key, join_p_jointeamkey:userChk.data.user.join_p_jointeamkey}
                }
            ]);
            throw Error("팀 누적참여인원 업데이트 에러");
        }
        project = JSON.parse(JSON.stringify(project));
        project.project_key = project._id;
        delete project._id;

        const teamlist = await Team.search({project_key});
        const boxlist = await Box.search({project_key});
        return ({
            result: 'ok',
            data: {
                project
                ,teamlist:teamlist.data.team
                ,boxlist:boxlist.data.box
            }
        });
    }catch (e) {
        log.error(`project joinProject =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '프로젝트 참가 실패'
        });
    }
}

exports.exitProject = async (param) => {
    const {
        user_key
    } = param;
    try{
        const user = await User.update({user_key, join_p_key:null, join_p_jointeamkey:null});
        return ({
            result: 'ok',
            data: {
            }
        });
    }catch (e) {
        log.error(`project exitProject =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '프로젝트 나가기 실패'
        });
    }
}

exports.updateState = async (param) => {
    const {
        project_key
        ,state
    } = param;
    const chkState = {play:'play', stop:'stop'};
    try{
        if(!ObjectId.isValid(project_key) || (state in chkState) == false) {
            return ({
                result: 'fail',
                msg: '형식 오류'
            });
        }
        const project = await Project.findOneAndUpdate({_id:project_key, det_dttm:null}, {$set:{state}}, {
            upsert: false,
            returnNewDocument: true,
            new: true
        }).exec();
        return ({
            result: 'ok',
            data: {
            }
        });
    }catch (e) {
        log.error(`project updateState =>`);
        console.log(e);
        return ({
            result: 'fail',
            msg: '프로젝트 상태변경 실패'
        });
    }
}

projectDelFail = async (ob, param) => {
    if(ob === "USER"){
        await fail.updateProcessiong([
            {failOb:"PROJECT", matchQ: {_id : param.project_key, user_key : param.user_key}, field: {$set:{det_dttm:null}}}
        ]);
    }else if(ob === "BOX") {
        await fail.updateProcessiong([
            {failOb:"PROJECT", matchQ: matchQ, field: {$set:{det_dttm:null}}}
            ,{failOb:"USER", matchQ: {_id:param.user_key}, field: {$inc:{create_p:+1}}}
        ]);
    }else if(ob === "TEAM") {
        await fail.updateProcessiong([
            {failOb:"PROJECT", matchQ: {_id : param.project_key, user_key : param.user_key}, field: {$set:{det_dttm:null}}}
            ,{failOb:"USER", matchQ: {_id:param.user_key}, field: {$inc:{create_p:+1}}}
            ,{failOb:"BOX", matchQ: {project_key:param.project_key}, field: {$set:{det_dttm:null}}}
        ]);
    }
}