// castseed.js
// serviceseed.js
var db = require('../models/db');
var CastModel = require('../models/cast').CastModel;
var mongoose = require('mongoose');

var casts = [
	new CastModel({
		title: "미국에서는 어떻게 강아지를 입양할까",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_1.PNG",
		url: "https://blog.naver.com/animalandhuman/221075307813"
	}),
	new CastModel({
		title: "초대형견 미니는 소심해",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_2.PNG",
		url: "http://www.ebs.co.kr/tv/show?courseId=10016245&stepId=10027901&lectId=10734643"
	}),
	new CastModel({
		title: "세상의 나쁜 개는 없다.",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_3.PNG",
		url: "http://home.ebs.co.kr/baddog/main"
	}),
	new CastModel({
		title: "강아지들이 싫어하는 행동 6가지",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_4.PNG",
		url: "https://blog.naver.com/dogmate123/220797354206"
	}),
	new CastModel({
		title: "일부 동물병원 위생상태 엉망",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_5.PNG",
		url: "http://news.naver.com/main/read.nhn?mode=LSD&mid=sec&sid1=102&oid=448&aid=0000220854&viewType=pc&rc=N"
	}),
	new CastModel({
		title: "온 몸에 구타와 화상 흉터가 가득해도 사람이 좋은 개",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_6.PNG",
		url: "http://blog.naver.com/animalandhuman"
	}),
	new CastModel({
		title: "동그람이를 소개합니다.",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_7.PNG",
		url: "http://blog.naver.com/animalandhuman/221053131212"
	}),
	new CastModel({
		title: "개를 밖에서 키워도 될까",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_8.PNG",
		url: "http://blog.naver.com/animalandhuman"
	}),
	new CastModel({
		title: "사라져도 찾지 않아요. 제주 유기견 급증하는 이유",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_9.PNG",
		url: "http://blog.naver.com/animalandhuman"
	}),
	new CastModel({
		title: "넌 체험!? 난 추행!",
		castimg: "https://s3.ap-northeast-2.amazonaws.com/dokio2/%EC%BA%90%EC%8A%A4%ED%8A%B8_10.PNG",
		url: "http://post.naver.com/viewer/postView.nhn?volumeNo=9348869&memberNo=38419283&mainMenu=ANIMAL"
	}),
];
console.log('services=', casts)
var done = 0;
for (var i=0; i<casts.length; i++) {
	casts[i].save(function(err, result){
		console.log('result=', result);
		done++;
		if(done == casts.length) {
			exit();
		}
	});
}

function exit() {
	mongoose.disconnect();
}
