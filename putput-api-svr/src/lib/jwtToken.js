const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

//JWT 토큰 생성
/*
    payload : 사용자의 profile 정보(토큰에 넣을 데이터)
 */
function generateToken(payload) {
    return new Promise(
        (resolve, reject) => {
            jwt.sign(
                payload,
                jwtSecret,
                {
                    expiresIn: '1d'
                }, (error, token) => {
                    if(error) reject(error);
                    resolve(token);
                }
            );
        }
    );
};
exports.generateToken = generateToken;

// JWT 디코딩
// jwtSecret을 통해 토큰을 디코딩, 유효성 검사 뒤 토큰에 담긴 데이터 반환
function decodeToken(token) {
    return new Promise(
        (resolve, reject) => {
            jwt.verify(token, jwtSecret, (error, decoded) => {
                if(error) reject(error);
                resolve(decoded);
            });
        }
    );
}

// JWT 처리 미들웨어
exports.jwtMiddleware = async (ctx, next) => {
    const token = ctx.cookies.get('access_token'); // ctx 에서 access_token 읽어옴
    if(!token) return next(); // 토큰 없으면 바로 다음 작업 진생

    try {
        const decoded = await decodeToken(token); // 토큰디코딩
        console.log("decoded = "+decoded.user_id);
        // 토큰 만료일이 12시간밖에 안남으면 토큰 재발급
        if(Date.now() / 1000 - decoded.iat > 60 * 60 * 12) {
            // 12시간 지나면 갱신
            const { _id, profile } = decoded;
            const freshToken = await generateToken({ _id, profile }, 'account');

            // 쿠키에 설정
            ctx.cookies.set('access_token', freshToken, {
                maxAge: 1000 * 60 * 60 * 24, // 1days
                httpOnly: true
            });
        }

        // ctx.request.user 에 디코딩된 값을 넣음
        ctx.request.user = decoded;
    } catch (e) {
        // token validate 실패
        console.log("e "+e);
        ctx.request.user = null;
    }
    return next();
};