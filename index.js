'use strict';
var	Updater = require('./modules/updater');
require('dotenv').config();
 
var options = {
	webhook_url: process.env.WEBHOOK_URL,
	tickers: ['btcusd', 'ethusd', 'ltcusd'],
	ticker_map: {
		'btcusd': {
			logo_url: "https://i.pinimg.com/originals/ef/da/8b/efda8b6316786f2ff349f3065974249b.jpg",
			identifier: "Bitcoin"
		},
		'ltcusd': {
			logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Official_Litecoin_Logo.png",
			identifier: "Litecoin"
		},
		'ethusd': {
			logo_url: "https://www.ethereum.org/images/logos/ETHEREUM-ICON_Black.png",
			identifier: "Ethereum"
		}
	}
}

const updater = new Updater(options);

updater.start();