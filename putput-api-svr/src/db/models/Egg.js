const mongoose = require('mongoose');
const { Schema } = mongoose;

const Egg = new Schema({
  u_id: Schema.Types.ObjectId,
  u_name: String,
  e_content: String,
  e_file: String,
  e_show_cnt: Schema.Types.Number,
  e_lat: String,
  e_lon: String,
  reg_dttm: {
    type: Date,
    default: Date.now
  }
});

Egg.statics.localRegister = async function({
   u_id, u_name, e_content, e_file, e_show_cnt, e_lat, e_lon}) {

  const egg = new this({
    u_id,
    u_name,
    e_content,
    e_file,
    e_show_cnt,
    e_lat,
    e_lon
  });
  return egg.save();
};

module.exports = mongoose.model('eggs', Egg);