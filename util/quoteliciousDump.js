function quoteliciousDump () {
    var request = require('request');
    var cheerio = require('cheerio');
    for (var page = 1; page <= 9; ++page) {
        var pageParam = (page == 1 ? '' : '/page/' + page);
        request('http://quotelicious.com/quotes/motivational-quotes' + pageParam, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                var quotes = $('div#content-quotespage div.post');
                if (quotes.length <= 0) {
                    throw('no quotes');
                }

                for (var i = 0; i < quotes.length; ++ i) {
                    var rawQuote = quotes[i];
                    var quote = $('a', rawQuote).text();
                    var author = $('em', rawQuote).text().substring(2).trim();
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

quoteliciousDump();

// then do something like `grep 'q: ' filename | awk -F'q: ' '{print $2 }' | head`
