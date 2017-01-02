// Copyright 2016 Desmond Vehar.

'use strict';

// Env Variables:
// FLICKR_KEY - the public key for the flickr api

var request = require('request');
var cheerio = require('cheerio');
var RSVP = require('rsvp');

var APP_NAME = 'Motivate Me Test';
var PROD_APP_ID = 'amzn1.ask.skill.bd846ccf-84a7-4340-9249-5da185dfc1f7';
var TEST_APP_ID = 'amzn1.ask.skill.2bad9158-37e8-4b41-b534-2af458246d16';
var APP_ID_WHITELIST = [PROD_APP_ID, TEST_APP_ID];
var UNKNOWN = 'Unknown';

var QUOTES = [
    // From https://www.brainyquote.com/quotes/topics/topic_motivational.html
    'Life is 10% what happens to you and 90% how you react to it',
    // From http://quotelicious.com/quotes/motivational-quotes
    'If you can’t stop thinking about it, don’t stop working for it',
    // From http://www.quotationspage.com/random.php3
    'Never regret. If it\'s good, it\'s wonderful. If it\'s bad, it\'s experience',
    'Life is 10% what happens to you and 90% how you react to it 4',
    'Life is 10% what happens to you and 90% how you react to it 5',
    'Life is 10% what happens to you and 90% how you react to it 6',
    'Life is 10% what happens to you and 90% how you react to it 7',
    'Life is 10% what happens to you and 90% how you react to it 8',
    'Life is 10% what happens to you and 90% how you react to it 9',
    'Life is 10% what happens to you and 90% how you react to it 10',
    'Life is 10% what happens to you and 90% how you react to it 11',
    'Life is 10% what happens to you and 90% how you react to it 12',
    'Life is 10% what happens to you and 90% how you react to it 13',
    'Life is 10% what happens to you and 90% how you react to it 14',
    'Life is 10% what happens to you and 90% how you react to it 15',
    'Life is 10% what happens to you and 90% how you react to it 16',
    'Life is 10% what happens to you and 90% how you react to it 17',
    'Life is 10% what happens to you and 90% how you react to it 18',
    'Life is 10% what happens to you and 90% how you react to it 19',
    'Life is 10% what happens to you and 90% how you react to it 20',
    'Life is 10% what happens to you and 90% how you react to it 21',
    'Life is 10% what happens to you and 90% how you react to it 22',
    'Life is 10% what happens to you and 90% how you react to it 23',
    'Life is 10% what happens to you and 90% how you react to it 24',
    'Life is 10% what happens to you and 90% how you react to it 25',
    'Life is 10% what happens to you and 90% how you react to it 26',
    'Life is 10% what happens to you and 90% how you react to it 27',
    'Life is 10% what happens to you and 90% how you react to it 28',
    'Life is 10% what happens to you and 90% how you react to it 29',
    'Life is 10% what happens to you and 90% how you react to it 30',
    'Life is 10% what happens to you and 90% how you react to it 31',
    'Life is 10% what happens to you and 90% how you react to it 32',
    'Life is 10% what happens to you and 90% how you react to it 33',
    'Life is 10% what happens to you and 90% how you react to it 34',
    'Life is 10% what happens to you and 90% how you react to it 35',
    'Life is 10% what happens to you and 90% how you react to it 36',
    'Life is 10% what happens to you and 90% how you react to it 37',
    'Life is 10% what happens to you and 90% how you react to it 38',
    'Life is 10% what happens to you and 90% how you react to it 39',
    'Life is 10% what happens to you and 90% how you react to it 40',
    'Life is 10% what happens to you and 90% how you react to it 41',
    'Life is 10% what happens to you and 90% how you react to it 42',
    'Life is 10% what happens to you and 90% how you react to it 43',
    'Life is 10% what happens to you and 90% how you react to it 44',
    'Life is 10% what happens to you and 90% how you react to it 45',
    'Life is 10% what happens to you and 90% how you react to it 46',
    'Life is 10% what happens to you and 90% how you react to it 47',
    'Life is 10% what happens to you and 90% how you react to it 48',
    'Life is 10% what happens to you and 90% how you react to it 49',
    'Life is 10% what happens to you and 90% how you react to it 50',
    'Life is 10% what happens to you and 90% how you react to it 51',
    'Life is 10% what happens to you and 90% how you react to it 52',
    'Life is 10% what happens to you and 90% how you react to it 53',
    'Life is 10% what happens to you and 90% how you react to it 54',
    'Life is 10% what happens to you and 90% how you react to it 55',
    'Life is 10% what happens to you and 90% how you react to it 56',
    'Life is 10% what happens to you and 90% how you react to it 57',
    'Life is 10% what happens to you and 90% how you react to it 58',
    'Life is 10% what happens to you and 90% how you react to it 59',
    'Life is 10% what happens to you and 90% how you react to it 60',
    'Life is 10% what happens to you and 90% how you react to it 61',
    'Life is 10% what happens to you and 90% how you react to it 62',
    'Life is 10% what happens to you and 90% how you react to it 63',
    'Life is 10% what happens to you and 90% how you react to it 64',
    'Life is 10% what happens to you and 90% how you react to it 65',
    'Life is 10% what happens to you and 90% how you react to it 66',
    'Life is 10% what happens to you and 90% how you react to it 67',
    'Life is 10% what happens to you and 90% how you react to it 68',
    'Life is 10% what happens to you and 90% how you react to it 69',
    'Life is 10% what happens to you and 90% how you react to it 70',
    'Life is 10% what happens to you and 90% how you react to it 71',
    'Life is 10% what happens to you and 90% how you react to it 72',
    'Life is 10% what happens to you and 90% how you react to it 73',
    'Life is 10% what happens to you and 90% how you react to it 74',
    'Life is 10% what happens to you and 90% how you react to it 75',
    'Life is 10% what happens to you and 90% how you react to it 76',
    'Life is 10% what happens to you and 90% how you react to it 77',
    'Life is 10% what happens to you and 90% how you react to it 78',
    'Life is 10% what happens to you and 90% how you react to it 79',
    'Life is 10% what happens to you and 90% how you react to it 80',
    'Life is 10% what happens to you and 90% how you react to it 81',
    'Life is 10% what happens to you and 90% how you react to it 82',
    'Life is 10% what happens to you and 90% how you react to it 83',
    'Life is 10% what happens to you and 90% how you react to it 84',
    'Life is 10% what happens to you and 90% how you react to it 85',
    'Life is 10% what happens to you and 90% how you react to it 86',
    'Life is 10% what happens to you and 90% how you react to it 87',
    'Life is 10% what happens to you and 90% how you react to it 88',
    'Life is 10% what happens to you and 90% how you react to it 89',
    'Life is 10% what happens to you and 90% how you react to it 90',
    'Life is 10% what happens to you and 90% how you react to it 91',
    'Life is 10% what happens to you and 90% how you react to it 92',
    'Life is 10% what happens to you and 90% how you react to it 93',
    'Life is 10% what happens to you and 90% how you react to it 94',
    'Life is 10% what happens to you and 90% how you react to it 95',
    'Life is 10% what happens to you and 90% how you react to it 96',
    'Life is 10% what happens to you and 90% how you react to it 97',
    'Life is 10% what happens to you and 90% how you react to it 98',
    'Life is 10% what happens to you and 90% how you react to it 99',
    'Life is 10% what happens to you and 90% how you react to it 100'
];

var AUTHORS = [
    // From https://www.brainyquote.com/quotes/topics/topic_motivational.html
    'Charles R. Swindoll',
    // From http://quotelicious.com/quotes/motivational-quotes
    UNKNOWN,
    // From http://www.quotationspage.com/random.php3
    'Victoria Holt',
    'Charles R. Swindoll 4',
    'Charles R. Swindoll 5',
    'Charles R. Swindoll 6',
    'Charles R. Swindoll 7',
    'Charles R. Swindoll 8',
    'Charles R. Swindoll 9',
    'Charles R. Swindoll 10',
    'Charles R. Swindoll 11',
    'Charles R. Swindoll 12',
    'Charles R. Swindoll 13',
    'Charles R. Swindoll 14',
    'Charles R. Swindoll 15',
    'Charles R. Swindoll 16',
    'Charles R. Swindoll 17',
    'Charles R. Swindoll 18',
    'Charles R. Swindoll 19',
    'Charles R. Swindoll 20',
    'Charles R. Swindoll 21',
    'Charles R. Swindoll 22',
    'Charles R. Swindoll 23',
    'Charles R. Swindoll 24',
    'Charles R. Swindoll 25',
    'Charles R. Swindoll 26',
    'Charles R. Swindoll 27',
    'Charles R. Swindoll 28',
    'Charles R. Swindoll 29',
    'Charles R. Swindoll 30',
    'Charles R. Swindoll 31',
    'Charles R. Swindoll 32',
    'Charles R. Swindoll 33',
    'Charles R. Swindoll 34',
    'Charles R. Swindoll 35',
    'Charles R. Swindoll 36',
    'Charles R. Swindoll 37',
    'Charles R. Swindoll 38',
    'Charles R. Swindoll 39',
    'Charles R. Swindoll 40',
    'Charles R. Swindoll 41',
    'Charles R. Swindoll 42',
    'Charles R. Swindoll 43',
    'Charles R. Swindoll 44',
    'Charles R. Swindoll 45',
    'Charles R. Swindoll 46',
    'Charles R. Swindoll 47',
    'Charles R. Swindoll 48',
    'Charles R. Swindoll 49',
    'Charles R. Swindoll 50',
    'Charles R. Swindoll 51',
    'Charles R. Swindoll 52',
    'Charles R. Swindoll 53',
    'Charles R. Swindoll 54',
    'Charles R. Swindoll 55',
    'Charles R. Swindoll 56',
    'Charles R. Swindoll 57',
    'Charles R. Swindoll 58',
    'Charles R. Swindoll 59',
    'Charles R. Swindoll 60',
    'Charles R. Swindoll 61',
    'Charles R. Swindoll 62',
    'Charles R. Swindoll 63',
    'Charles R. Swindoll 64',
    'Charles R. Swindoll 65',
    'Charles R. Swindoll 66',
    'Charles R. Swindoll 67',
    'Charles R. Swindoll 68',
    'Charles R. Swindoll 69',
    'Charles R. Swindoll 70',
    'Charles R. Swindoll 71',
    'Charles R. Swindoll 72',
    'Charles R. Swindoll 73',
    'Charles R. Swindoll 74',
    'Charles R. Swindoll 75',
    'Charles R. Swindoll 76',
    'Charles R. Swindoll 77',
    'Charles R. Swindoll 78',
    'Charles R. Swindoll 79',
    'Charles R. Swindoll 80',
    'Charles R. Swindoll 81',
    'Charles R. Swindoll 82',
    'Charles R. Swindoll 83',
    'Charles R. Swindoll 84',
    'Charles R. Swindoll 85',
    'Charles R. Swindoll 86',
    'Charles R. Swindoll 87',
    'Charles R. Swindoll 88',
    'Charles R. Swindoll 89',
    'Charles R. Swindoll 90',
    'Charles R. Swindoll 91',
    'Charles R. Swindoll 92',
    'Charles R. Swindoll 93',
    'Charles R. Swindoll 94',
    'Charles R. Swindoll 95',
    'Charles R. Swindoll 96',
    'Charles R. Swindoll 97',
    'Charles R. Swindoll 98',
    'Charles R. Swindoll 99',
    'Charles R. Swindoll 100'
];

// From a Flick API call to get the favorites from my account:
// https://api.flickr.com/services/rest/?&method=flickr.favorites.getList&per_page=500&page=1&api_key={process.env.FLICKR_KEY}&user_id=48889646@N07
var IMAGES = [
    // farm id, server id, photo id, photo secret
    [3, 2045, 2867425266, '6baac16b44'],
    [6, 5121, 5260847546, '0451eb4fb1'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44'],
    [3, 2045, 2867425266, '6baac16b44']
];

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        // Prevent someone else from configuring a skill that sends request to this lambda
        if (APP_ID_WHITELIST.indexOf(event.session.application.applicationId) == -1) {
            context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            var responseValues = onLaunch(event.request, event.session);
            context.succeed(buildResponse(responseValues));
        } else if (event.request.type === "IntentRequest") {
            var responseValues = onIntent(event.request, event.session);
            context.succeed(buildResponse(responseValues));
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var quote = getRandomMotivationalQuote();
    var cardSsml = new SSML();
    cardSsml
        .openSpeakTag()
        .openParagraphTag()
        .addPlainText(quote.quote)
        .closeParagraphTag()
        .addPlainText(quote.author)
        .closeSpeakTag();
    var cardText = getCardText(quote);
    var photoUrl = getRandomImageUrl();
    var cardTitle = APP_NAME + "!";
    return {
        sessionAttributes: session.attributes,
        speechletResponse: buildSpeechletResponseWithImage(cardTitle, cardSsml.toString(), cardText, photoUrl, "", "true")
    };
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId
        + ", intentName=" + intentRequest.intent.name);

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == 'GetRandomMotivationQuote') {
        return handleIntentGetRandomMotivationQuote(intent, session);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

function handleIntentGetRandomMotivationQuote(intent, session) {
    var quote = getRandomMotivationalQuote();
    var cardSsml = new SSML();
    cardSsml
        .openSpeakTag()
        .openParagraphTag()
        .addPlainText(quote.quote)
        .closeParagraphTag()
        .addPlainText(quote.author)
        .closeSpeakTag();
    var cardText = getCardText(quote);
    var photoUrl = getRandomImageUrl();
    var cardTitle = APP_NAME + "!";
    return {
        sessionAttributes: session.attributes,
        speechletResponse: buildSpeechletResponseWithImage(cardTitle, cardSsml.toString(), cardText, photoUrl, "", "true")
    };
}

// ------- Helper functions to fetch quotes -------

function getRandomMotivationalQuote () {
    var randomIdx = Math.floor(Math.random() * QUOTES.length);
    var quote = QUOTES[randomIdx] + '.';
    var author = AUTHORS[randomIdx];

    return {
        quote: quote,
        author: author
    };
}

// ------- FLICKR Helper -------

function getFlickrUrl (farmId, serverId, photoId, photoSecret) {
    return 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + photoSecret + '.jpg';
}

// fetch a random picture from https://www.flickr.com/photos/48889646@N07/favorites via the Flickr API
function getRandomImageUrl () {
    var randomIdx = Math.floor(Math.random() * IMAGES.length);
    var imageData = IMAGES[randomIdx];

    return getFlickrUrl(imageData[0], imageData[1], imageData[2], imageData[3]);
}

// ------- SSML Helper -------

function SSML() {
    this.text = '';
}
SSML.prototype.openSpeakTag = function () { this.text += '<speak>'; return this; };
SSML.prototype.closeSpeakTag = function () { this.text += '</speak>'; return this; };
SSML.prototype.openParagraphTag = function () { this.text += '<p>'; return this; };
SSML.prototype.closeParagraphTag = function () { this.text += '</p>'; return this; };
SSML.prototype.addPlainText = function (text) { this.text += text; return this; };
SSML.prototype.addStrongBreak = function () { this.text += '<break strength="strong"/>'; return this; };
SSML.prototype.toString = function () { return this.text; };

// ------- Card Text Helper -------

function getCardText(quote) {
    return '"' + quote.quote + '"\n - ' + quote.author;
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, cardText, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Simple",
            title: title,
            content: cardText
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithImage(title, output, cardText, cardImageUrl, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Standard",
            title: title,
            text: cardText,
            image: {
                smallImageUrl: cardImageUrl,
                largeImageUrl: cardImageUrl
            }
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(responseValues) {
    return {
        version: "1.0",
        sessionAttributes: responseValues.sessionAttributes,
        response: responseValues.speechletResponse
    };
}
