const Project = require('../../../db/models/Project');
const User = require('../../../db/models/User');
const Team = require('../team');
const Box = require('../box');
const log = require('../../../lib/log');
const { Types: { ObjectId } } = require('mongoose');


exports.register = async (param) => {
    const {
        user_key,
        title,
        join_code,
        teams,
        state,
        box_cnt
    } = param;
    try {
        let project = await Project.localRegister({
            user_key,
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
                const result = await Team.register({project_key:project._id,index:t, name:team_names[t].name});
                if(result.result === 'fail') {
                    throw new Error('팀 등록 에러');
                }
                teamList.push({teamKey:result._id,index:result.index, name:result.name});
            }
        } catch (e) {
            log.error(`project register team => ${e}`);
            return ({
                result: 'fail',
                msg: '팀 등록 실패 team'
            });
        }
        try{
            // require('../user'); 가 안됨... 크로스 안되는 듯??
            const user = await User.findOneAndUpdate({_id:user_key, det_dttm:null}, {$inc:{create_p:+1}}, {
                        upsert: false,
                        returnNewDocument: true,
                        new: true
                    }).exec();
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
        porjectKey
        , boxlist
    } = param;
    if(!ObjectId.isValid(porjectKey)) {
        console.log("11111")
        return ({
            result: 'fail',
            msg: '형식 오류'
        });
    }
    try {
        let data = {porjectKey:porjectKey};
        console.log(data)
        /*const project = await Project.findOneAndUpdate({_id:porjectKey}, {$set:param}, {
            upsert: false,
            returnNewDocument: true, // 결과 반환
            new: true
        }).exec();*/
        let boxresult = []
        for(let b in boxlist){
            boxlist[b]._id = boxlist[b].boxKey;
            delete boxlist[b].boxKey;
            const box = await Box.update(boxlist[b]);
            console.log(box.result);
            if(box.result === 'fail'){
                throw Error('box upsert error')
            }
            boxresult.push(box);
        }
        data.boxlist = boxresult;
        return ({
            result: 'ok',
            data: {
                data
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

