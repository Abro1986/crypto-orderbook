require('dotenv').config();
let request    = require('request-promise-native')
let bodyParser = require('body-parser')
let express    = require('express');
let app        = express();
let cors       = require('cors');
let router     = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({
	extended: false
}));



app.get('/api/all', function(req, res) {
	res.send('hello')
})

//the main api end point for the node application
app.post('/api/orderbook', function(req, res) {
	//request orderbook data from bittrex's public api for the BTC-ETH market and return a promise to pass the response
	request(`https://bittrex.com/api/v1.1/public/getorderbook?market=${req.body.first}-${req.body.second}&type=both`)
	.then((response) => {
		//parses XML to JSON
		let dataTrex = JSON.parse(response);		
		return dataTrex
	}).then((dataTrex) => {
		//request orderbook data from poloniex's public api for the BTC_ETH market and return a promise to pass the response
		request(`https://poloniex.com/public?command=returnOrderBook&currencyPair=${req.body.first}_${req.body.second}&depth=100`)
		.then((response) => {
			//parses XML to JSON
			let dataPolo = JSON.parse(response);
			//sets variables for the bids and asks arrays for both orderbooks based on JSON names using dot notation
			let poloBids = dataPolo.bids;
			let poloAsks = dataPolo.asks;
			let trexBids = dataTrex.result.buy;
			let trexAsks = dataTrex.result.sell;
			//create empty arrays to house the combined order books
			let sellOrderBook= [];
			let buyOrderBook = [];			
			//lopps through both the bids and asks of the bittrex array and sets the price point to only have six decimal places.
			//I feel unsure about this step as it means that the total price will not be as accurate, but with the market
			//everchanging and being so specific in respects to either orderbook it was hard to find specific similarities 
			//between price points. being less specific started to yield matches though so I went with it
			for (i = 0; i < trexBids.length; i++) {
				trexBids[i].Rate = trexBids[i].Rate.toString().split('').splice(0, 8).join('');
				trexAsks[i].Rate = trexAsks[i].Rate.toString().split('').splice(0, 8).join('');
			}
			//same as above but with the poloniex array
			for (i = 0; i < poloBids.length; i++) {
				poloBids[i][0] = poloBids[i][0].toString().split('').splice(0, 8).join('');
				poloAsks[i][0] = poloAsks[i][0].toString().split('').splice(0, 8).join('');
			}
			// loops through the bittrex and poloniex arrays and compares each rate between the rates of the others
			for (i = 0; i < trexBids.length; i++) {
				for (j = 0; j < poloBids.length; j++) {
						combinedAskVolume = poloAsks[j][1] + trexAsks[i].Quantity;
						combinedBidVolume = poloBids[j][1] + trexBids[i].Quantity;
					//if there is a match in price point it will create an object that has the matching rate, the combined volume
					//that is calculated from the variable in the interation of the loop from above for the combined bids order book
					//and adds a key that corresponds to the iteration of the loop. It is then pushed into the buyOrderBook	
					if (poloBids[j][0] === trexBids[i].Rate) {
						bidData = {
							Rate: poloBids[j][0],
							Quantity: combinedBidVolume,
							key: i
						};
						buyOrderBook.push(bidData); 
					//same as the conditional statement above but for the asks and sellOrderBook
					} else if (poloAsks[j][0] === trexAsks[i].Rate) {
						askData = {
							Rate: poloAsks[j][0],
							Quantity: combinedAskVolume,
							key: i
						};
						sellOrderBook.push(askData);
					}
				}
			}
			//create a combined order book with the two arrays from the sell and buy arrays that were being filled in the loops above
			combinedOrderBook = {
				asks: sellOrderBook,
				bids: buyOrderBook
			};
			return combinedOrderBook;
		//promise resolution then pass the returned combined orderbook to be served up as JSON data	
		})
		.then((combinedOrderBook) => {
			res.json(combinedOrderBook);
		})
		.catch((err) => {
			res.send(err);	
		});
	});	
});


let port = process.env.PORT || 3001;

app.listen(port, function(){
	console.log(`listening on port ${ port }`);
});