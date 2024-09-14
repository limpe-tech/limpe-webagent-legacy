/*
ICQ WebAPI Javascript Library. (c) InceptionTime - 2024. All rights reserved.
*/

// -------------------------------------------------
// Configuration
var APIHost = "https://u.myteam.vmailru.net/api/v125";


// -------------------------------------------------





// -------------------------------------------------
// Internal Variables
// WARNING! DO NOT MODIFY!

// Login Info
var login;
var aToken;
var sessionSecret;
var pwd;

// session Key
var sessionKey;

// AIM session ID
var aimsid;

// Status, etc.
var AIMstatus;
var displayName;

// Events
var currentEventsURL;
var prevEvN;

// Buddies List
var buddiesList;

var buddies;

// Integration with WebAgent (TM)
var currentConversation;



// Etc.
var lastFetch = 0;
// -------------------------------------------------




function initialRequest(){
	var data = "f=JSON&k=ic1zmlWFTdkiTnkL&s=".concat(login).concat("&pwd=1").concat("&clientVersion=VKTeams Web  ic1zmlWFTdkiTnkL 24.5.9(2024/09/03 15:00 release/24.5c) unknown desktop&clientName=webVKTeams&tokenType=otp_via_email");
	var xhr = new XMLHttpRequest();
	xhr.open('POST', APIHost.concat("wim/auth/clientLogin?f=JSON"), false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
	if (xhr.status === 200) {
		return 1;
	} else {
		throw new Error('Request failed: ' + xhr.statusText);
		return 0;
	}	
}
function login(){
	var data = "f=JSON&k=ic1zmlWFTdkiTnkL&s=".concat(login).concat("&pwd=").concat(pwd).concat("&clientVersion=VKTeams Web  ic1zmlWFTdkiTnkL 24.5.9(2024/09/03 15:00 release/24.5c) unknown desktop&clientName=webVKTeams&tokenType=longterm");
	var xhr = new XMLHttpRequest();
	xhr.open('POST', APIHost.concat("wim/auth/clientLogin?f=JSON"), false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
	if (xhr.status === 200) {
		var respObj = JSON.parse(xhr.responseText);
		aToken = respObj.response.data.token.a;
		sessionSecret = respObj.response.data.sessionSecret;
		return 1;
	} else {
		throw new Error('Request failed: ' + xhr.statusText);
		return 0;
	}	
}

function makeSessionKey(){
	sessionKey = btoa(_HMAC(pwd,sessionSecret));
}

function startSession(){
	var data = "f=JSON&k=n1n4FcOouKVTJf11&a=".concat(aToken).concat("&events=im&clientName=webVKTeams");
	var xhr = new XMLHttpRequest();
	xhr.open('GET', screennameAPI.concat("wim/aim/startSession").concat("?").concat(data), false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(null);
	if (xhr.status === 200) {
		var respObj = JSON.parse(xhr.responseText);
		aimsid = respObj.response.data.aimsid;
		AIMstatus = respObj.response.data.myInfo.state;
		displayName = respObj.response.data.myInfo.displayId;
		currentEventsURL = respObj.response.data.fetchBaseURL;
		return 1;
	} else {
		throw new Error('Request failed: ' + xhr.statusText);
		return 0;
	}
}

function fetchEvents(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', currentEventsURL.concat("&f=JSON"), false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(null);
	if (xhr.status === 200) {
		//console.log(xhr.responseText);
		var respObj = JSON.parse(xhr.responseText);
		currentEventsURL = respObj.response.data.fetchBaseURL;
		respObj.response.data.events.forEach(function (eventItem) {
			if (eventItem.type === "buddylist"){
				if (lastFetch === 0){
					getPresence();
					lastFetch = 1;
				}
			}
			if (eventItem.type === "im"){
				if (eventItem.eventData.source.aimId === currentConversation.toString()){
					appendConvo(currentConversation, eventItem.eventData.message);
				}
				else{
					gotMessage();
				}
			}
			prevEvN = eventItem.seqNum;
			
		});
		return 1;
	} else {
		throw new Error('Request failed: ' + xhr.statusText);
		return 0;
	}
}
async function afetchEvents(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', currentEventsURL.concat("&f=JSON"), true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 
	xhr.onload = function() {
	   if (xhr.status === 200) {
		  console.log(xhr.responseText);
		  var respObj = JSON.parse(xhr.responseText);
		  currentEventsURL = respObj.response.data.fetchBaseURL;
		  respObj.response.data.events.forEach(function (eventItem) {
			 if (eventItem.type === "buddylist"){
				if (lastFetch === 0){
				   buddiesList = eventItem.eventData.groups[0].buddies;
				   lastFetch = 1;
				}
			 }
			 else if (eventItem.type === "im"){
				if (eventItem.eventData.source.aimId === currentConversation.toString()){
				   appendConvo(currentConversation, eventItem.eventData.message);
				}
				else{
				   gotMessage();
				}
			 }
			 prevEvN = eventItem.seqNum;
		  });
		  return 1;
	   } else {
		  throw new Error('Request failed: ' + xhr.statusText);
		  return 0;
	   }
	};
 
	xhr.send(null);
 }
function getConsent(){
	var data = "f=JSON&devId=n1n4FcOouKVTJf11&enc=".concat(sessionKey);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', screennameAPI.concat("/auth/getConsent"), false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
	if (xhr.status === 200) {
		console.log(xhr.responseText);
		return 1;
	} else {
		throw new Error('Request failed: ' + xhr.statusText);
		return 0;
	}	
}


function sendIM(destination, message){
	var data = "f=JSON&k=n1n4FcOouKVTJf11".concat("&ts=").concat(new Date().getTime() / 1000).concat("&sig_sha256=").concat(sessionKey).concat("&t=").concat(destination).concat("&message=").concat(message).concat("&a=").concat(aToken).concat("&aimsid=").concat(aimsid);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', oscarAPI.concat("/im/sendIM").concat("?").concat(data), false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(null);
	if (xhr.status === 200) {
		if (JSON.parse(xhr.responseText).response.statusCode === 200){
			appendConvo(login, message);
		}
		return 1;
	} else {
		throw new Error('Request failed: ' + xhr.statusText);
		return 0;
	}	
}

function deleteEvent(){
	var data = "f=JSON&aimsid=".concat(aimsid).concat("&eventNumber=").concat(prevEvN);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', screennameAPI.concat("/aim/deleteEvents").concat("?").concat(data), false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(null);
	if (xhr.status === 200) {
		console.log(xhr.responseText);
		return 1;
	} else {
		throw new Error('Request failed: ' + xhr.statusText);
		return 0;
	}	
}

function getPresence(){
	var data = "f=JSON&aimsid=".concat(aimsid).concat("&bl=true")
	var xhr = new XMLHttpRequest();
	xhr.open('GET', oscarAPI.concat("/presence/get").concat("?").concat(data), false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(null);
	if (xhr.status === 200) {
		var respObj = JSON.parse(xhr.responseText);
		buddiesList = respObj.response.data.groups;
		return 1;
	} else {
		throw new Error('Request failed: ' + xhr.statusText);
		return 0;
	}
}

function gotMessage(){
	var audio = new Audio('res/music/icq.mp3');
	audio.play();
}
