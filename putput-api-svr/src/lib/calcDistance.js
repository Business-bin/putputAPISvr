// 위치 기준 반지름 약 25m
exports.calcDistance1 = (lat, lon) => {
    const coordinate = {
        lLat : (Number(lat)-0.000119155623816)
        , lLon : (Number(lon)-0.00024005769183)
        , hLat : (Number(lat)+0.000119155623816)
        , hLon : (Number(lon)+0.00024005769183)
    };
    return coordinate;
}

// 위도/경도 거리 계산
exports.calcDistance2 = (lat1, long1, lat2, long2) => {
    const R = 6371; // km (지구 반지름)
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (long2-long1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    const meter = d*1000
    return meter;
}

// const distance1 = calcDistance.calcDistance2(37.505781791308,127.05212309820787, 37.505662635684184, 127.05188304051604);   // - 0.000119155623816 , 0.00024005769183
// const distance2 = calcDistance.calcDistance2(37.505781791308,127.05212309820787, 37.505900946931816, 127.0523631558997);   // + 0.000119155623816 , 0.00024005769183
// const distance3 = calcDistance.calcDistance2(37.505781791308,127.05212309820787, lat1, lot1);   // - 0.000119155623816 , 0.00024005769183
// const distance4 = calcDistance.calcDistance2(37.505781791308,127.05212309820787, lat2, lot2);   // + 0.000119155623816 , 0.00024005769183