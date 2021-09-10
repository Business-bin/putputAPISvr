const Team = require('../../../db/models/Team');
const { Types: { ObjectId }, startSession } = require('mongoose');

exports.search = async (param) => {
    try {
        let team =
            await Team.find(
                param,
                {"_id":true, "name":true, "join_cnt":true, "openbox_cnt":true}
            ).exec();
        if(team != '' && team != undefined && team != null){
            team = JSON.parse(JSON.stringify(team));
            for(let t in team){
                team[t].teamKey = team[t]._id;
                delete team[t]._id;
            }
            return ({
                result: 'ok',
                type: "team",
                data: {
                    team
                }
            });
        }else{
            return ({
                result: 'fail',
                data: []
            });
        }
    }catch (e) {
        console.log(e);
        return ({
            result: 'fail',
            msg: '팀 검색 실패'
        });
    }
}

