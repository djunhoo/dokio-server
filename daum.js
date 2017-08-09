var daum = require('daum-map-api')

daum.mapImage('서울역', function(res) {
  console.log(res);
});