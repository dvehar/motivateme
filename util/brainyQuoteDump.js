function brainyQuoteDump () {
	var request = require('request');
	var cheerio = require('cheerio');
	for (var page = 0; page <= 9; ++page) {
		request('https://www.brainyquote.com/quotes/topics/topic_motivational' + page + '.html', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				var quotes = $('div#quotesList div.bqQt');
				if (quotes.length <= 0) {
					throw('no quotes');
				}
				for (var i=0; i < quotes.length; ++i) {
					var rawQuote = quotes[i];
					var quote = $('a[title="view quote"]', rawQuote).text();
					var author = $('a[title="view author"]', rawQuote).text();

					// Print the data inside of single quotes with a comma at the end so we can drop this into
					// an array. Also escape all single quotes
					console.log('q: ' + "'" + quote.replace(/'/g, '\\\'') + "',");
					console.log('a: ' + "'" + author.replace(/'/g, '\\\'') + "',");
				}
			} else {
				throw('call failed: ' + error);
			}
		});
	}
}

brainyQuoteDump();

// then do something like `grep 'q: ' filename | awk -F'q: ' '{print $2 }' | head`
