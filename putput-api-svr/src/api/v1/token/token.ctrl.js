const Egg = require('../../../db/models/Egg');
const Mpoint = require('../../../db/models/Mpoint');
const Stack = require('../../../db/models/Stack');
const { Types: { ObjectId } } = require('mongoose');

// const jwtMiddleware = require('../../../lib/jwtToken');

exports.tokenTest = async (param) => {
    return ({
        result: 'ok',
    });
};

