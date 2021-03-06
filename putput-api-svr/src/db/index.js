const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const log = require('../lib/log');

const {
  MONGO_URI: mongoURI
} = process.env;

module.exports = (function () {
  mongoose.Promise = global.Promise;

  return {
    connect () {
      mongoose.set('debug', true);
      // return mongoose.connect(mongoURI, { useMongoClient: true }).then(
      return mongoose.connect(mongoURI).then(
        () => {
          log.info('Successfully connected to mongodb');
        }
      ).catch(e => {
        console.error(e);
      });
    }
  };
})();
