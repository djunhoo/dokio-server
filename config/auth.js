// cofing/auth.js

module.exports = {

    'facebookAuth' : {
        'clientID'      : '133161083958817',
        'clientSecret'  : '472deedc4a30805ed210f5e797a741fc', // your App Secret
        'callbackURL'   : 'http://keonho.xyz:3000/users/auth/facebook/callback'
    },

    'naverAuth' : {
        'clientID'       : 'BE0l52f9aEfCBb1pX_kH',
        'clientSecret'    : '1P2WHA7qjT',
        'callbackURL'       : 'http://keonho.xyz:3000/users/auth/naver/callback'
    },

    'kakaoAuth' : {
        'clientID'      : 'cb93079bd2fbf2779ebef70596627ab5',
        'callbackURL'   : 'http://keonho.xyz:3000/users/auth/kakao/callback'
    },
    'jwt_secret' : 'keonho'
};