const Team = require('../../../db/models/Team');
const log = require('../../../lib/log');

exports.register = async (param) => {
    const {
        project_key,
        index,
        name
    } = param;

    try {
        const team = await Team.localRegister({
            project_key,
            index,
            name
        });

        return ({
            result: 'ok',
            data: {
                team
            }
        });
    } catch (e) {
        log.error(`team register => ${e}`);
        return ({
            result: 'fail',
            msg: '팀 등록 실패'
        });
    }
};

exports.search = async (param) => {
    try {
        param.det_dttm = null;
        let team =
            await Team.find(
                param,
                {"_id":true, "name":true, "join_cnt":true, "openbox_cnt":true}
            ).exec();
        if(team){
            team = JSON.parse(JSON.stringify(team));
            for(let t in team){
                team[t].teamKey = team[t]._id;
                delete team[t]._id;
            }
        }
        return ({
            result: 'ok',
            type: "team",
            data: {
                team
            }
        });
    }catch (e) {
        log.error(`team search => ${e}`);
        return ({
            result: 'fail',
            msg: '팀 검색 실패'
        });
    }
}

