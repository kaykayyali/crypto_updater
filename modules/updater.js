"use strict"
const request = require('request');
const async_request = require('async-request');
const request_url = 'https://api.coinmarketcap.com/v1/ticker/';

class Updater {
	constructor (options) {
		options = options || {};
		this.last_ticker_data = {};
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
		}, process.env.TIMER || 20000);
		setInterval(() => {
			console.log("High Alert Tick");
			this.do_hr_update();
		}, process.env.HR_TIMER || 10000);
	}

	async do_update() {
		for (var ticker in this.options.ticker_map){
			var response = await async_request(request_url + ticker)
			var json = JSON.parse(response.body)[0];
			this.last_ticker_data[ticker] = json;
		}
		this.prepare_update();
		this.send_updates();
	}

	async do_hr_update() {
		for (var ticker in this.options.ticker_map){
			let ticker_data = this.translate_ticker(ticker);
			if (!ticker_data.high_alert) {continue};
			var response = await async_request(request_url + ticker);
			var json = JSON.parse(response.body)[0];
			this.last_ticker_data[ticker] = json;
		}
		this.prepare_update(true);
		this.send_updates();
	}

	prepare_update (high_alert) { 
		this.payload = {
			icon: "http://tinyurl.com/pn46fgp",
			activity: "Price Update",
			title: "",
			body: "",
			attachments:[]
		}
		for (var ticker in this.options.ticker_map){
			let ticker_data = this.translate_ticker(ticker);
			if (high_alert && !ticker_data.high_alert) {continue};
			console.log("Checking", ticker);
			var new_attachment = {
				"color": "#F35A00",
				"author_name": ticker_data.identifier,
				"footer": "Coin Marketcap Api",
				"footer_icon": "https://www.ringcentral.com/blog/wp-content/uploads/2015/11/glip-logo-300x300.png",
				"thumb_url": ticker_data.logo_url,
				"title": "Latest Data",
				"title_link": "https://coinmarketcap.com/currencies/" + ticker,
				"fields": [
					{
						"title": 'Price USD',
						"value": "**" + this.last_ticker_data[ticker].price_usd + "**",
						"short": true
					},
					{
						"title": 'Price BTC',
						"value": "**" + this.last_ticker_data[ticker].price_btc + "**",
						"short": true
					},
					{
						"title": '% Change 1hr',
						"value": "**" + this.last_ticker_data[ticker].percent_change_1h + "**",
						"short": true
					},
					{
						"title": '% Change 24hr',
						"value": "**" + this.last_ticker_data[ticker].percent_change_24h + "**",
						"short": true
					},
					{
						"title": '% Change 7d',
						"value": "**" + this.last_ticker_data[ticker].percent_change_7d + "**",
						"short": true
					}
				],
				"ts": Date.now()
			}
			this.payload.attachments.push(new_attachment);
		}
	}
	send_updates() {
		this.send_update();
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
		});
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