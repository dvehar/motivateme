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
            onLaunch(event.request, event.session).then(function (responseValues) {
                context.succeed(buildResponse(responseValues));
            });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request, event.session).then(function (responseValues) {
                context.succeed(buildResponse(responseValues));
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

    var promises = {
        quoteAndCardText: getRandomMotivationalQuote().then(function (result) {
            var response = new SSML();
            response
                .openSpeakTag()
                .openParagraphTag()
                .addPlainText(result.quote)
                .closeParagraphTag()
                .addPlainText(result.author)
                .closeSpeakTag();
            return {
                quote: response.toString(),
                cardText: getCardText(result)
            };
        }),
        photoUrl: getRandomLandscapePhotoUrl()
    };

    return RSVP.hash(promises).then(function (results) {
        var cardTitle = APP_NAME + "!";
        return {
            sessionAttributes: session.attributes,
            speechletResponse: buildSpeechletResponseWithImage(cardTitle, results.quoteAndCardText.quote, results.quoteAndCardText.cardText, results.photoUrl, "", "true")
        };
    });
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
        return handleIntentGetRandomMotivationQuote(intent, session).then(function (results) {
            var cardTitle = APP_NAME + "!";
            return {
                sessionAttributes: session.attributes,
                speechletResponse: buildSpeechletResponseWithImage(cardTitle, results.quoteAndCardText.quote, results.quoteAndCardText.cardText, results.photoUrl, "", "true")
            };
        });
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

function handleIntentGetRandomMotivationQuote(intent, session, callback) {
    var promises = {
      quoteAndCardText: getRandomMotivationalQuote().then(function (result) {
        var response = new SSML();
        response
            .openSpeakTag()
            .openParagraphTag()
            .addPlainText(result.quote)
            .closeParagraphTag()
            .addPlainText(result.author)
            .closeSpeakTag();
        return {
            quote: response.toString(),
            cardText: getCardText(result)
        }
      }),
      photoUrl: getRandomLandscapePhotoUrl()
    };

    return RSVP.hash(promises);
}

// ------- Helper functions to fetch quotes -------

function getRandomMotivationalQuote () {
    var sources = [
        getRandomMotivationalQuoteSoure1,
        getRandomMotivationalQuoteSoure2/*,
        getRandomMotivationalQuoteSoure3*/
    ];
    var sourceToUse = sources[Math.floor(Math.random() * sources.length)];

    return sourceToUse();
}

// Go to a random page (0-9 inclusive) and pick a random quote
function getRandomMotivationalQuoteSoure1 () {
    console.log('getRandomMotivationalQuoteSoure1');
    var min = 0;
    var max = 9;
    var pageNum = Math.floor(Math.random() * (max - min + 1)) + min;
    var page = (pageNum == min ? '': pageNum);
    var quote = new RSVP.Promise(function(resolve, reject) {
        request('https://www.brainyquote.com/quotes/topics/topic_motivational' + page + '.html', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                var quotes = $('div#quotesList div.bqQt');
                if (quotes.length > 0) {
                    var randomIdx = Math.floor(Math.random() * quotes.length);
                    var rawQuote = quotes[randomIdx];
                    var quote = $('a[title="view quote"]', rawQuote).text();
                    var author = $('a[title="view author"]', rawQuote).text();
                    resolve({
                        quote: quote,
                        author: author
                    });
                } else {
                    reject('getRandomMotivationalQuoteSoure1 call failed: no quotes');
                }
            } else {
                reject('getRandomMotivationalQuoteSoure1 call failed: ' + error);
            }
        });
    });

    return quote;   
}

// Go to a random page (1-9 inclusive) and pick a random quote
function getRandomMotivationalQuoteSoure2 () {
    console.log('getRandomMotivationalQuoteSoure2');
    var min = 1;
    var max = 9;
    var pageNum = Math.floor(Math.random() * (max - min + 1)) + min;
    var page = (pageNum == min ? '': '/page/' + pageNum);
    var quote = new RSVP.Promise(function(resolve, reject) {
        request('http://quotelicious.com/quotes/motivational-quotes' + page, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var quotes = $('div#content-quotespage div.post');
            if (quotes.length > 0) {
                var randomIdx = Math.floor(Math.random() * quotes.length);
                var rawQuote = quotes[randomIdx];
                var quote = $('a', rawQuote).text();
                var author = $('em', rawQuote).text().substring(2).trim();
                resolve({
                    quote: quote,
                    author: author
                });
            } else {
                reject('getRandomMotivationalQuoteSoure2 call failed: no quotes');
            }
          } else {
            reject('getRandomMotivationalQuoteSoure2 call failed: ' + error);
          }
        });
    });

    return quote;
}

// Hit an API for a random quote
function getRandomMotivationalQuoteSoure3 (callback) {
    console.log('getRandomMotivationalQuoteSoure3');
    var quote = new RSVP.Promise(function(resolve, reject) {
        request.post('http://www.quotationspage.com/random.php3', {"form": {"number":4, "collection[]": "motivate"}}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                var quotes = $('dt.quote a[href *= "/quote/"]');
                var authors = $('dd.author a[href *= "/quotes/"]');
                if (quotes.length > 0) {
                    var randomIdx = Math.floor(Math.random() * quotes.length);
                    var quote = quotes[randomIdx].children[0].data.trim();
                    var author = authors[randomIdx].children[0].data.trim();
                    resolve({
                        quote: quote,
                        author: author
                    });
                } else {
                    reject('getRandomMotivationalQuote3 call failed: no quotes');
                }
            } else {
                reject('getRandomMotivationalQuote3 call failed: ' + error);
            }
        });
    });

    return quote;
}

function getRandomDesignQuote () {
    console.log('getRandomDesignQuote');
    var quote = new RSVP.Promise(function(resolve, reject) {
        request('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var cleanBody = JSON.parse(body)[0];
                var author = cleanBody.title;
                var rawQuote = cleanBody.content; // '<p>.....</p>\n'
                var cleanQuoteHtml = rawQuote.substring(0, rawQuote.length-1); // remove the newline
                var $ = cheerio.load(cleanQuoteHtml);
                var quote = $('p').text().trim();
                resolve({
                    quote: quote,
                    author: author
                });
              } else {
                reject('getRandomDesignQuote call failed: ' + error);
              }
        });
    });

    return quote;
}

// ------- FLICKR Helper -------

function getFlickrUrl (farmId, serverId, photoId, photoSecret) {
    return 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + photoSecret + '.jpg';
}

function _getRandomLandscapePhotoUrlCount () {
    var photoCount = new RSVP.Promise(function(resolve, reject) {
        request('https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + process.env.FLICKR_KEY + '&text=landscape&license=7&sort=relevance&per_page=1', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                resolve($('photos').attr('total'));
            } else {
                reject('getRandomLandscapePhotoUrl call failed: ' + error);
            }
        });
    });

    return photoCount;
}

function _getPageAndPhoto (photosPerPage, photoNumber) {
    return {
        page: Math.floor(photoNumber / photosPerPage),
        photoIdx: (photoNumber % photosPerPage || photosPerPage) - 1
    };
}

function getRandomLandscapePhotoUrl () {
    var photosPerPage = 100;
    var randomPhoto = Math.floor(Math.random() * 300); // There are 500 results per page. Since we sort by relevence let's pick the top 300 to consider.
    var randomPageAndPhoto = _getPageAndPhoto(photosPerPage, randomPhoto);
    var quote = new RSVP.Promise(function(resolve, reject) {
        request('https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + process.env.FLICKR_KEY + '&text=landscape&license=7&sort=relevance&per_page=' + photosPerPage + '&page=' + randomPageAndPhoto.page, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                var photo = $('photo')[randomPageAndPhoto.photoIdx];
                var farmId = photo.attribs.farm;
                var serverId = photo.attribs.server;
                var photoId = photo.attribs.id;
                var photoSecret = photo.attribs.secret;
                resolve(getFlickrUrl(farmId, serverId, photoId, photoSecret));
            } else {
                reject('getRandomLandscapePhotoUrl call failed: ' + error);
            }
        });
    });

    return quote;
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
