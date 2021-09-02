const mongoose = require('mongoose');
const { Schema } = mongoose;

const Mpoint = new Schema({
  inx: Schema.Types.Number,

  ginx: Schema.Types.Number,    // 게임 inx
  name: String,                 // 미션 지점명(상자번호)
  lat: String,                  // 위도
  lon: String,                  // 경도
  // 퀘스트(0), 지령(1), 미니1(2), 미니2(3), 미니3(4), 자이언트(5)
  kind: Schema.Types.Number,    // 종류
  qinx: Schema.Types.Number,    // quest inx

  gt: Schema.Types.Number,    // 지령/미니게임 시간
  gc: Schema.Types.Number,    // 미니게임 목표 개수

  glat: String,                  // 지령 목표 gps 좌표
  glon: String,                  // 지령 목표 gps 좌표

  bclu: Schema.Types.Number,    // 보상할 정보카드 inx
  bkey: Schema.Types.Number,    // 보상할 KEY 개수
  ukey: Schema.Types.Number,    // 상자 OPEN 소모 KEY값
  part: Schema.Types.Number,    // 0-전체분기표시 , 1~4(분기별 표시)

  attr: Schema.Types.Number,     // 사용 않음
  delay: Schema.Types.Number,     // 미션 실패시 패널티 시간(초)
  limit: Schema.Types.Number     // 미션 성공 횟수 제한
});

Mpoint.statics.localRegister = async function({
  inx, ginx, name, lat, lon, kind, qinx, gt, gc,
  glat, glon, bclu, bkey, ukey, part, attr, delay, limit
}) {

  const mpoint = new this({
    inx, ginx, name, lat, lon, kind, qinx, gt, gc,
    glat, glon, bclu, bkey, ukey, part, attr, delay, limit
    });
  return mpoint.save();
};

module.exports = mongoose.model('mpoints', Mpoint);