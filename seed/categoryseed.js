// category.js
var request = require('request');
var cheerio = require('cheerio');
var iconv   = require('iconv-lite');
var options = {
    uri: "http://terms.naver.com/entry.nhn?docId=1057497&cid=40942&categoryId=32624",
    encoding: 'binary'
};

var PetCategory = require('../models/petcategory').petcategorySchema;


request(options, function(err, response, body) {
    if(err) return console.log('err', err);
    var strContents = iconv.decode(body, 'utf-8');
    var $ = cheerio.load(strContents);
    for(var i=0; i<187; i++) {
    	var strArea = $('.box_tbl tbody tr').find('a')[i].children;
        console.log(strArea[0].data);
        
        var petca = new PetCategory();
        petca.category_name = strArea[0].data;
        petca.save(function(err, doc) {
            if(err) console.log(err);
            console.log('doc=', doc);
        });
    }


        /*var strPm10 = $(this).find('a').eq(1).text().trim();
        var strPm20 = $(this).find('td').eq(2).text().trim();
        var strStatus = $(this).find('td').eq(7).text().trim();
        var strLevel = $(this).find('td').eq(8).text().trim();
        var strFactor = $(this).find('td').eq(9).text().trim();
        console.log(strArea +" " + strPm10 + " " + strPm20 + " " + strStatus + " " + strLevel + " " + strFactor);
        var cleanairInfo = new CleanairInfoModel({
            area: strArea,
            pm10: strPm10,
            pm25: strPm20,
            status: strStatus,
            grade: strLevel,
            material: strFactor,
            date: getToday()
        });

        cleanairInfo.save(function(err) {
            if(err) console.log(err);
        });*/


});


/*var categories = [
	new petcategory({
		category_name: "고든 세터"
	}),
	new petcategory({
		category_name: "골든 리트리버"
	})
];

var done = 0;
for (var i=0; i<categories.length; i++) {
	categories[i].save(function(err, result){
		done++;
		if(done == categories.length) {
			exit();
		}
	});
}

function exit() {
	mongoose.disconnect();
}*/
