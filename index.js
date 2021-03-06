'use strict';
const express = require('express');
const app = express();
let fetch = require('node-fetch');
var	Updater = require('./modules/updater');
require('dotenv').config();
 
var options = {
	webhook_url: process.env.WEBHOOK_URL,
	ticker_map: {
		'bitcoin': {
			logo_url: "https://i.pinimg.com/originals/ef/da/8b/efda8b6316786f2ff349f3065974249b.jpg",
			identifier: "Bitcoin"
		},
		'ark': {
			logo_url: "https://files.coinmarketcap.com/static/img/coins/32x32/ark.png",
			identifier: "Ark"
                },
		'florincoin': {
			logo_url: "https://files.coinmarketcap.com/static/img/coins/32x32/florincoin.png",
			identifier: "FlorinCoin"
		},
		'litecoin': {
			logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Official_Litecoin_Logo.png",
			identifier: "Litecoin"
		},
		'ethereum': {
			logo_url: "https://www.ethereum.org/images/logos/ETHEREUM-ICON_Black.png",
			identifier: "Ethereum"
		},
		'golem-network-tokens': {
			logo_url: "https://www.coingecko.com/assets/coin-250/golem-48555b0c9a0d0272875dfb577895096d.png",
			identifier: "Golem"
		},
		'monaco': {
			logo_url: "https://files.coinmarketcap.com/static/img/coins/32x32/monaco.png",
			identifier: "Monaco",
			high_alert: true
		},
		'neo': {
			logo_url: "http://igaming.org/images/cryptocurrencies/crypto_news/image_large_662.jpg",
			identifier: "NEO"
		},
		'monero': {
			logo_url: "https://pbs.twimg.com/profile_images/473825289630257152/PzHu2yli_200x200.png",
			identifier: "Monero"
		}

	}
}

const updater = new Updater(options);

updater.start();




app.get('/status', function (req, res) {
  res.send('Running');
});
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server Online');
});
