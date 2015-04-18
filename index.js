var Q = require('q');
var koa = require('koa');
var router = require('koa-router')();
var app = koa();
var request = Q.denodeify(require('request'));
var config = require('./config');
require('koa-qs')(app, 'first');
app.use(router.routes()).use(router.allowedMethods());

const SLACK_API_ENDPOINT = 'https://slack.com/api/chat.postMessage';
const GOOGLE_MAPS_API_ENDPOINT = 'http://maps.googleapis.com/maps/api/staticmap';

router.get('/', function *(next) {
	var text = generateTextFromYoQuery(this.query);
	var params = generateSlackPayload(this.query.username, text);
	var url = SLACK_API_ENDPOINT + generateUrlParam(params);
	var posts = yield doHttpRequest(url);

	this.body = 'Yo';
});

var doHttpRequest = function(uri) {
	return request(uri).then(function(responseParams){
		if (!responseParams[0] && responseParams[1].statusCode == 200) {
			return 'Yo';
		} else {
			return 'error: ' + responseParams[1].statusCode;
		}
	});
};

var generateTextFromYoQuery = function(query) {
	if (query.location) { // Yo location
		var coordinate = query.location.replace(';', ',');
		var params = {
			center: coordinate,
			zoom: 16,
			format: 'png',
			sensor: 'false',
			size: '640x480',
			maptype: 'roadmap',
			markers: coordinate
		};
		return GOOGLE_MAPS_API_ENDPOINT + generateUrlParam(params);
	} else if (query.link) { // Yo link
		return query.link;
	} else { // Ordinary Yo
		return 'Yo';
	}
};

var generateSlackPayload = function(username, text) {
	return {
		token: config.slackToken,
		channel: config.channel,
		username: username,
		text: text,
		unfurl_media: 'true',
		pretty: '1'
	};
};

var generateUrlParam = function(params) {
	var paramsStr = Object.keys(params).map(function(key) {
		return key + '=' + params[key];
	}).join('&');
	return '?' + paramsStr;
};

app.listen(3000);
