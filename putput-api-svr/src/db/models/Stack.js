const mongoose = require('mongoose');
const { Schema } = mongoose;

const Stack = new Schema({
  keyName: String, // key 명
  count: Schema.Types.Number
});

Stack.statics.incStack = async function(keyName) {
  const val = await this.findOne({keyName}).exec();
  if(!val) {
    const stack = new this({
      keyName,
      count: 1
    });
    return await stack.save();
  }
  // 번호 증가
  return await this.findByIdAndUpdate(val._id, {$inc: {count: 1}}, {
    upsert: false,
    new: true
  }).exec();
};

Stack.statics.incStackMin = async function(keyName, min) {
  const val = await this.findOne({keyName}).exec();
  if(!val) {
    const stack = new this({
      keyName,
      count: min
    });
    return await stack.save();
  }
  // 번호 증가
  return await this.findByIdAndUpdate(val._id, {$inc: {count: 1}}, {
    upsert: false,
    new: true
  }).exec();
};

Stack.statics.getStack = async function(keyName) {
  const val = await this.findOne({keyName}).exec();
  if(!val) {
    const stack = new this({
      keyName,
      count: 1
    });
    return await stack.save();
  }
  return val;
};

  
module.exports = mongoose.model('stacks', Stack);