const Box = require('../db/models/Box');
const Comment = require('../db/models/Comment');
const Egg = require('../db/models/Egg');
const Mission = require('../db/models/Mission');
const Project = require('../db/models/Project');
const Reward = require('../db/models/Reward');
const Team = require('../db/models/Team');
const User = require('../db/models/User');

exports.deleteProcessiong = async (failData) => {
    for(let f in failData){
        switch (failData[f].failOb){
            case "BOX" :
                await Box.remove(failData[f].field);
                break
            case "COMMENT" :
                console.log(failData[f].field)
                await Comment.remove(failData[f].field);
                break
            case "EGG" :
                await Egg.remove(failData[f].field);
                break
            case "MISSION" :
                await Mission.remove(failData[f].field);
                break
            case "PROJECT" :
                await Project.remove(failData[f].field);
                break
            case "REWARD" :
                await Reward.remove(failData[f].field);
                break
            case "TEAM" :
                await Team.remove(failData[f].field);
                break
            case "USER" :
                await User.remove(failData[f].field);
                break
        }
    }
}

exports.updateProcessiong = async (failData) => {
    for(let f in failData){
        switch (failData[f].failOb){
            case "BOX" :
                await Box.update(failData[f].matchQ, failData[f].field, {
                    upsert: false,
                    multi: true,
                    new: true
                }).exec();
                break
            case "COMMENT" :
                console.log(failData[f].field)
                await Comment.update(failData[f].matchQ, failData[f].field, {
                    upsert: false,
                    multi: true,
                    new: true
                }).exec();
                break
            case "EGG" :
                await Egg.update(failData[f].matchQ, failData[f].field, {
                    upsert: false,
                    multi: true,
                    new: true
                }).exec();
                break
            case "MISSION" :
                await Mission.update(failData[f].matchQ, failData[f].field, {
                    upsert: false,
                    multi: true,
                    new: true
                }).exec();
                break
            case "PROJECT" :
                await Project.update(failData[f].matchQ, failData[f].field, {
                    upsert: false,
                    multi: true,
                    new: true
                }).exec();
                break
            case "REWARD" :
                await Reward.update(failData[f].matchQ, failData[f].field, {
                    upsert: false,
                    multi: true,
                    new: true
                }).exec();
                break
            case "TEAM" :
                await Team.update(failData[f].matchQ, failData[f].field, {
                    upsert: false,
                    multi: true,
                    new: true
                }).exec();
                break
            case "USER" :
                await User.update(failData[f].matchQ, failData[f].field, {
                    upsert: false,
                    multi: true,
                    new: true
                }).exec();
                break
        }
    }
}