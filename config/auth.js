// cofing/auth.js

module.exports = {

    'facebookAuth' : {
        'clientID'      : '133161083958817',
        'clientSecret'  : '472deedc4a30805ed210f5e797a741fc', // your App Secret
        'callbackURL'   : 'http://localhost:3000/users/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};
