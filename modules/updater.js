"use strict"
const request = require('request');
const async_request = require('async-request');
const request_url = 'https://api.coinmarketcap.com/v1/ticker/';

class Updater {
	constructor (options) {
		options = options || {};
		this.secondary_webhook_url = process.env.SECONDARY_WEBHOOK_URL;
		this.last_ticker_price = {};
		this.options = options;
	}
	// Primary functions
	start () {
		console.log("Booting up.");
		if (!this.options.ticker_map || typeof this.options.ticker_map !== 'object') {
			throw new Error("No Tickers defined");
		}
		setInterval(() => {
			console.log("Tick");
			this.do_update();
		}, process.env.TIMER);
	}

	async do_update() {
		for (var ticker in this.options.ticker_map){
			var response = await async_request(request_url + ticker)
			var json = JSON.parse(response.body)[0];
			this.last_ticker_price[ticker] = json.price_usd;
		}
		this.prepare_update();
		this.send_updates();
	}

	prepare_update () { 
		this.payload = {
			icon: "http://tinyurl.com/pn46fgp",
			activity: "Price Update",
			title: "",
			body: "",
			attachments:[]
		}
		for (var ticker in this.options.ticker_map){
			let ticker_data = this.translate_ticker(ticker);
			var new_attachment = {
				"color": "#F35A00",
				"author_name": ticker_data.identifier,
				"footer": "Coin Marketcap Api",
				"footer_icon": "https://www.ringcentral.com/blog/wp-content/uploads/2015/11/glip-logo-300x300.png",
				"thumb_url": ticker_data.logo_url,
				"title": "Latest Price",
				"title_url": "https://coinmarketcap.com/currencies/" + ticker,
				"text": "**" + this.last_ticker_price[ticker] + "**",
				"ts": Date.now()
			}
			this.payload.attachments.push(new_attachment);
		}
	}
	send_updates() {
		this.send_update();
		if (this.secondary_webhook_url) {
			this.send_update(this.secondary_webhook_url);
		}
	}
	send_update(url) {
		request.post({
			url: url || this.options.webhook_url,
			json: true,
			body: this.payload
		}, 
		(error, response, body) => {
			if(error){
		    	return console.error('WEBHOOK ERROR', err);
			}
			return console.log('WEBHOOK SUCCESS', body);
		})
	}

	// Utilities
	translate_ticker (ticker) {
		if (this.options.ticker_map[ticker]) {
			return this.options.ticker_map[ticker];
		}
		else {
			throw new Error("Ticker is not in map!");
		}
	}

	random_num_between (min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}
}

module.exports = Updater;