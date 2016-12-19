// Copyright 2016 Desmond Vehar.

'use strict';

var request = require('request');
var cheerio = require('cheerio');

var APP_NAME = 'Motivate Me';
var APP_ID_WHITELIST = ['amzn1.ask.skill.bd846ccf-84a7-4340-9249-5da185dfc1f7'];

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
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
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
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var cardTitle = APP_NAME + "!";
    getRandomMotivationalQuote(function (quote) {
        callback(session.attributes, buildSpeechletResponse(cardTitle, quote, "", true));
    });
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == 'TestIntent') {
        // TODO(desmondv): remove
        handleTestRequest(intent, session, callback);
    } else if (intentName == 'GetRandomMotivationQuote') {
        handleIntentGetRandomMotivationQuote(intent, session, callback);
    } else if (intentName == 'GetRandomDesignQuote') {
        handleIntentGetRandomDesignQuote(intent, session, callback);
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

function handleTestRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Hello, Desmond!", "", "true"));
}

function handleIntentGetRandomMotivationQuote(intent, session, callback) {
    getRandomMotivationalQuote(function (quote) {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(quote, "", "true"));
    });
}

function handleIntentGetRandomDesignQuote(intent, session, callback) {
    getRandomDesignQuote(function (quote) {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(quote, "", "true"));
    });
}

// ------- Helper functions to fetch quotes -------

function getRandomMotivationalQuote (callback) {
    var sources = [
        getRandomMotivationalQuoteSoure1,
        getRandomMotivationalQuoteSoure2/*,
        getRandomMotivationalQuoteSoure3*/
    ];
    var sourceToUse = sources[Math.floor(Math.random() * sources.length)];
    sourceToUse(callback);
}

// Go to a random page (0-9 inclusive) and pick a random quote
function getRandomMotivationalQuoteSoure1 (callback) {
    var min = 0;
    var max = 9;
    var pageNum = Math.floor(Math.random() * (max - min + 1)) + min;
    var page = (pageNum == min ? '': pageNum);
    request('https://www.brainyquote.com/quotes/topics/topic_motivational' + page + '.html', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        var quotes = $('a[title="view quote"]');
        if (quotes.length > 0) {
            var randomIdx = Math.floor(Math.random() * quotes.length);
            var rawQuote = quotes[randomIdx];
            callback(rawQuote.children[0].data);
        } else {
            throw('getRandomMotivationalQuoteSoure1 call failed: no quotes');
        }
      } else {
        throw('getRandomMotivationalQuoteSoure1 call failed: ' + error);
      }
    });
}

// Go to a random page (1-9 inclusive) and pick a random quote
function getRandomMotivationalQuoteSoure2 (callback) {
    var min = 1;
    var max = 9;
    var pageNum = Math.floor(Math.random() * (max - min + 1)) + min;
    var page = (pageNum == min ? '': '/page/' + pageNum);
    request('http://quotelicious.com/quotes/motivational-quotes' + page, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        var quotes = $('div#content-quotespage div.post a');
        if (quotes.length > 0) {
            var randomIdx = Math.floor(Math.random() * quotes.length);
            var rawQuote = quotes[randomIdx];
            callback(rawQuote.children[0].data);
        } else {
            throw('getRandomMotivationalQuoteSoure2 call failed: no quotes');
        }
      } else {
        throw('getRandomMotivationalQuoteSoure2 call failed: ' + error);
      }
    });
}

// Hit an API for a random quote
function getRandomMotivationalQuoteSoure3 (callback) {
    request.post('http://www.quotationspage.com/random.php3', {"form": {"number":4, "collection[]": "motivate"}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var quotes = $('dt.quote a[href *= "/quote/"]');
            if (quotes.length > 0) {
                var randomIdx = Math.floor(Math.random() * quotes.length);
                var rawQuote = quotes[randomIdx];
                callback(rawQuote.children[0].data.trim());
            } else {
                throw('getRandomMotivationalQuote3 call failed: no quotes');
            }
        } else {
            throw('getRandomMotivationalQuote3 call failed: ' + error);
        }
    });
}

function getRandomDesignQuote (callback) {
    request('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var cleanBody = JSON.parse(body)[0];
            var rawQuote = cleanBody.content; // '<p>.....</p>\n'
            var cleanQuoteHtml = rawQuote.substring(0, rawQuote.length-1); // remove the newline
            var $ = cheerio.load(cleanQuoteHtml);
            callback($('p').text().trim());
          } else {
            throw('getRandomDesignQuote call failed: ' + error);
          }
    });
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
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
            type: "PlainText",
            text: output
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

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
