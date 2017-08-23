"use strict"
const Bitfinex = require('bitfinex-promise');
const bitfinex = new Bitfinex(process.env.BITFINEX_KEY, process.env.BITFINEX_SECRET);
const request = require('request');

class Updater {
	constructor (options) {
		options = options || {};
		this.last_ticker_price = {};
		this.options = options;
	}
	// Primary functions
	start () {
		if (!this.options.tickers || typeof this.options.tickers !== 'object') {
			throw new Error("No Tickers defined");
		}
		setInterval(() => {
			this.do_update();
		}, process.env.TIMER);
	}

	async do_update() {
		for (var i = 0; i < this.options.tickers.length; i++) {
			var ticker = this.options.tickers[i];
			await bitfinex.ticker(ticker).then((data, error) => {
				if (error) {
					throw new Error(error);
				}
				this.last_ticker_price[ticker] = data.last_price;
			}).catch(function (error) {
				console.log(ticker + " Failed to load");
			});
		}
		this.prepare_update();
		this.send_update();
	}

	prepare_update () { 
		this.payload = {
			icon: "http://tinyurl.com/pn46fgp",
			activity: "Price Update",
			title: "",
			body: "",
			attachments:[]
		}
		for (var i = 0; i < this.options.tickers.length; i++) {
			let ticker = this.options.tickers[i];
			let ticker_data = this.translate_ticker(ticker);
			var new_attachment = {
				"color": "#F35A00",
				"author_name": ticker_data.identifier,
				"footer": "Bitfinex Api",
				"footer_icon": "https://www.ringcentral.com/blog/wp-content/uploads/2015/11/glip-logo-300x300.png",
				"thumb_url": ticker_data.logo_url,
				"title": "Latest Price",
				"title_url": "https://api.bitfinex.com/v1/pubticker/" + ticker,
				"text": "**" + this.last_ticker_price[ticker] + "**",
				"ts": Date.now()
			}
			console.log(this.payload);
			this.payload.attachments.push(new_attachment);
		}
	}
	send_update() {

		request.post({
			url: this.options.webhook_url,
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