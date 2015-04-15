var Q = require('q');
var koa = require('koa');
var router = require('koa-router')();
var app = koa();
var request = Q.denodeify(require('request'));
require('koa-qs')(app,'first');
app.use(router.routes()).use(router.allowedMethods())


var slacToken = "";
var channel = "";

router.get('/', function *(next) {
	var text;
	if(this.query.location){
		text = "http://maps.googleapis.com/maps/api/staticmap" + encodeURIComponent("?center=" + this.query.location.replace(';',',') + "&zoom=18&format=png&sensor=false&size=640x480&maptype=roadmap&markers=" + this.query.location.replace(';',','));
		console.log(text);
	}else if(this.query.link){
		text = this.query.link;
	}else{
		text = 'Yo';
	}
	var posts = yield doHttpRequest('https://slack.com/api/chat.postMessage?token='+slacToken+'&channel='+channel+'&username='+ this.query.username +'&text='+ text +'&unfurl_media=true&pretty=1');
	this.body = 'Yo';
});

function doHttpRequest(uri) {
	return request(uri).then(function(responseParams){
		if (!responseParams[0] && responseParams[1].statusCode == 200) {
			return 'Yo';
		} else {
			return 'error: ' + responseParams[1].statusCode;
		}
	});
}

app.listen(3000);

