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
    getRandomMotivationalQuote(function (result) {
        var response = new SSML();
        response
            .openSpeakTag()
            .openParagraphTag()
            .addPlainText(result.quote)
            .closeParagraphTag()
            .addPlainText(result.author)
            .closeSpeakTag();
        callback(session.attributes,
            buildSpeechletResponse(cardTitle, response.toString(), "", "true"));
    });
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId
        + ", intentName=" + intentRequest.intent.name);

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
    getRandomMotivationalQuote(function (result) {
        var response = new SSML();
        response
            .openSpeakTag()
            .openParagraphTag()
            .addPlainText(result.quote)
            .closeParagraphTag()
            .addPlainText(result.author)
            .closeSpeakTag();
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(response.toString(), "", "true"));
    });
}

function handleIntentGetRandomDesignQuote(intent, session, callback) {
    getRandomDesignQuote(function (result) {
        var response = new SSML();
        response
            .openSpeakTag()
            .openParagraphTag()
            .addPlainText(result.quote)
            .closeParagraphTag()
            .addPlainText(result.author)
            .closeSpeakTag();
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(response.toString(), "", "true"));
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
    console.log('getRandomMotivationalQuoteSoure1');
    var min = 0;
    var max = 9;
    var pageNum = Math.floor(Math.random() * (max - min + 1)) + min;
    var page = (pageNum == min ? '': pageNum);
    request('https://www.brainyquote.com/quotes/topics/topic_motivational' + page + '.html', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        var quotes = $('div#quotesList div.bqQt');
        if (quotes.length > 0) {
            var randomIdx = Math.floor(Math.random() * quotes.length);
            var rawQuote = quotes[randomIdx];
            var quote = $('a[title="view quote"]', rawQuote).text();
            var author = $('a[title="view author"]', rawQuote).text();
            callback({
                quote: quote,
                author: author
            });
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
    console.log('getRandomMotivationalQuoteSoure2');
    var min = 1;
    var max = 9;
    var pageNum = Math.floor(Math.random() * (max - min + 1)) + min;
    var page = (pageNum == min ? '': '/page/' + pageNum);
    request('http://quotelicious.com/quotes/motivational-quotes' + page, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        var quotes = $('div#content-quotespage div.post');
        if (quotes.length > 0) {
            var randomIdx = Math.floor(Math.random() * quotes.length);
            var rawQuote = quotes[randomIdx];
            var quote = $('a', rawQuote).text();
            var author = $('em', rawQuote).text().substring(2).trim();
            callback({
                quote: quote,
                author: author
            });
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
    console.log('getRandomMotivationalQuoteSoure3');
    request.post('http://www.quotationspage.com/random.php3', {"form": {"number":4, "collection[]": "motivate"}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var quotes = $('dt.quote a[href *= "/quote/"]');
            var authors = $('dd.author a[href *= "/quotes/"]');
            if (quotes.length > 0) {
                var randomIdx = Math.floor(Math.random() * quotes.length);
                var quote = quotes[randomIdx].children[0].data.trim();
                var author = authors[randomIdx].children[0].data.trim();
                callback({
                    quote: quote,
                    author: author
                });
            } else {
                throw('getRandomMotivationalQuote3 call failed: no quotes');
            }
        } else {
            throw('getRandomMotivationalQuote3 call failed: ' + error);
        }
    });
}

function getRandomDesignQuote (callback) {
    console.log('getRandomDesignQuote');
    request('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var cleanBody = JSON.parse(body)[0];
            var author = cleanBody.title;
            var rawQuote = cleanBody.content; // '<p>.....</p>\n'
            var cleanQuoteHtml = rawQuote.substring(0, rawQuote.length-1); // remove the newline
            var $ = cheerio.load(cleanQuoteHtml);
            var quote = $('p').text().trim();
            callback({
                quote: quote,
                author: author
            });
          } else {
            throw('getRandomDesignQuote call failed: ' + error);
          }
    });
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

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
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

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
