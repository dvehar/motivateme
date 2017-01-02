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
    'Never regret. If it\'s good, it\'s wonderful. If it\'s bad, it\'s experience'
];

var AUTHORS = [
    // From https://www.brainyquote.com/quotes/topics/topic_motivational.html
    'Charles R. Swindoll',
    // From http://quotelicious.com/quotes/motivational-quotes
    UNKNOWN,
    // From http://www.quotationspage.com/random.php3
    'Victoria Holt'
];

// From a Flick API call to get the favorites from my account:
// https://api.flickr.com/services/rest/?&method=flickr.favorites.getList&per_page=500&page=1&api_key={process.env.FLICKR_KEY}&user_id=48889646@N07
var IMAGES = [
    // farm id, server id, photo id, photo secret
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
