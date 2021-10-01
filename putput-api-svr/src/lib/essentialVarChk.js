/*
* 클라이언트가 호출하는 API인 경우에만 필수 값 체크
* arrParam : [필수 값 체크 할 데이터 배열] 
 */

exports.valueCheck = (arrParam) => {
    if(arrParam.includes(null)){
        return false;
    }
    const regex = / /gi;
    arrParam.forEach((e, i) => {
        e = e.toString();
        e = e.replace(regex, '');
        arrParam[i] = e
    })
    if(arrParam.includes('') || arrParam.includes('[objectObject]')){
        return false;
    }
    return true;
}