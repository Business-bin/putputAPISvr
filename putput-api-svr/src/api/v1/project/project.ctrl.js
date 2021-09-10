const Project = require('../../../db/models/Project');
const Team = require('../../../db/models/Team');
// const { Types: { ObjectId }, startSession } = require('mongoose');
const mongoose = require('mongoose');
const parseJson = require('../../../lib/common');

exports.register = async (param) => {
    const {
        user_key,
        title,
        join_code,
        teams,
        state,
        box_cnt
    } = param;

    // const session = await mongoose.startSession();
    // // session.startTransaction();
    // mongoose.connection.transaction(async function executor(session) {
        try {
            let project = await Project.localRegister({
                user_key,
                title,
                join_code,
                teams,
                state,
                box_cnt
            // }, {session});
            });
            const team_names = param.team_name;
            let teamList = [];
            try {
                for (var i = 0; i < team_names.length; i++) {
                    // if (i == 1)
                        // throw new Error("예외처리 추가 예정(트랜잭션 필요)");
                    let teamInfo = await Team.localRegister({
                        project_key: project._id.toString(),
                        name: team_names[i].name
                    // }, {session});
                    });
                    teamList.push({teamKey: teamInfo._id.toString(), name: teamInfo.name})
                }
            } catch (e) {
                console.log(e);
                // await session.abortTransaction();
                // session.endSession();
                return ({
                    result: 'fail',
                    msg: '등록 실패 team'
                });
            }
            project = {
                projectKey: project._id
                , user_key: user_key
                , title: project.title
                , join_code: project.join_code
                , state: project.state
                , box_cnt: project.box_cnt
                , team_name: teamList
            }
            // await session.commitTransaction();
            // session.endSession();
            return ({
                result: 'ok',
                data: {
                    project
                }
            });
        } catch (e) {
            console.log(e);
            // await session.abortTransaction();
            // session.endSession();
            return ({
                result: 'fail',
                msg: '등록 실패 project'
            });
        }
    // });
};

exports.findOne = async (param) => {
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
            return ({
                result: 'ok',
                type: "project",
                data: {
                    project
                }
            });
        }else{
            // return null;
            return ({
                result: 'fail',
                data: {}
            });
        }
    }catch (e) {
        console.log(e);
        return ({
            result: 'fail',
            msg: '프로젝트 검색 실패'
        });
    }
}
exports.searchTest = async (param) => {
    try {
        const projects = await Project.find(param).limit(5).exec();
        var eggList = [];
        // for(var i=0; i<Object.keys(eggs).length; i++){
        //     eggList.push({
        //         key : eggs[i].id
        //         , latitude : eggs[i].e_lat
        //         , longitude : eggs[i].e_lon
        //     });
        // }
        // console.log("--------------------------");
        // console.log(eggList);
        // console.log("--------------------------");
        // if (!eggs) {
        //     return ({
        //         result: 'fail111',
        //         msg: '검색 정보 없음'
        //     });
        // }

        return ({
            result: 'ok',
            type: "egg",
            data: {
                eggList
            }
        });
    } catch (e) {
        console.log(e);
        return ({
            result: 'fail222',
            msg: '정보 검색 실패'
        });
    }
};

