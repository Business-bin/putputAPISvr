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

exports.verify = (typeStr, checkStr) => {
    let result = true;
    switch (typeStr){
        case "EMAIL" :
            const regEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
            if(!checkStr.match(regEmail)){
                result = false;
            }
            break
        case "PHONE" :
            const regPhone = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
            if(!checkStr.match(regPhone)){
                result = false;
            }
            break
    }
    return result;
}