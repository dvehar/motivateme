// From http://www.quotationspage.com/mqotd/archive.html

var request = require('request');
var cheerio = require('cheerio');
var MILLI_PER_DAY = 86400000;
var yesterday = new Date((new Date()).getTime() - MILLI_PER_DAY);
// First quotes are on http://www.quotationspage.com/mqotd/2004-01-01.html
var current = new Date(Date.parse("01/01/2014"));

function quoteliciousPageDump () {
	for (; current < yesterday; current = new Date(current.getTime() + MILLI_PER_DAY)) {
		var pageDate = current.toISOString().substring(0, 10); // trim "2014-01-01T08:00:00.000Z" to "2014-01-01"
		request('http://www.quotationspage.com/mqotd/' + pageDate + '.html', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				var quotes = $('dt.quote a[href *= "/quote/"]');
				var authors = $('dd.author a[href *= "/quotes/"]');
				if (quotes.length <= 0) {
					throw('no quotes');
				}

				for (var i = 0; i < quotes.length; ++i) {
					// Print the data inside of single quotes with a comma at the end so we can drop this into
					// an array. Also escape all single quotes
					var rawQuote = quotes[i];
					if (rawQuote != null && rawQuote.children[0] != null) {
						var quote = rawQuote.children[0].data.trim();
						var rawAuthor = authors[i];
						var author = (rawAuthor != null && rawAuthor.children[0] != null)? rawAuthor.children[0].data.trim() : 'Unknown'
						console.log('q: ' + "'" + quote.replace(/'/g, '\\\'') + "'," + 'DESMONDV' + 'a: ' + "'" + author.replace(/'/g, '\\\'') + "',");
					}
				}
			} else {
				throw('call failed: ' + error);
			}
		});
	}
}

quoteliciousPageDump();

// then do something like `sort filename | uniq | awk -F'DESMONDV' '{print $1}' | grep q: ' filename | awk -F'q: ' '{print $2 }' | head`
// will have to remove things that begin with '...'
// remove things with '[]'
