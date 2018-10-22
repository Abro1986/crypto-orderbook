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

app.get('/api/bittrex', function(req, res) {
	request('https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-ETH&type=both')
	.then((response) => {
		let dataTrex = JSON.parse(response)
		buydataTrex = dataTrex.result.buy
		
		
		return dataTrex
	}).then((dataTrex) => {
		request('https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH&depth=100')
		.then((response) => {
			let dataPolo = JSON.parse(response)
			trexPrice = dataTrex.result
			poloPrice = dataPolo.bids
//			console.log(dataPolo.asks)
//			console.log(dataTrex.result.sell)
			data = {
				trex: dataTrex.result.buy,
				polo: dataPolo.bids
			};
//			console.log(data.polo.length);
			sellOrderBook= []
			buyOrderBook = []
			for (i = 0; i < dataTrex.result.buy.length; i++) {
				data.trex[i].Rate = trexPrice.buy[i].Rate.toString().split('').splice(0, 8).join('')
				trexPrice.sell[i].Rate = trexPrice.sell[i].Rate.toString().split('').splice(0, 8).join('')
			}

			for (i = 0; i < data.polo.length; i++) {
				data.polo[i][0] = data.polo[i][0].toString().split('').splice(0, 8).join('')
				dataPolo.asks[i][0] = dataPolo.asks[i][0].toString().split('').splice(0, 8).join('')
			}
			for (i = 0; i < dataTrex.result.buy.length; i++) {
				// console.log(trexPrice.buy[i].Rate)
				for (j = 0; j < poloPrice.length; j++) {
						combinedAskVolume = dataPolo.asks[j][1] + dataTrex.result.sell[i].Quantity
						combinedBidVolume = data.polo[j][1] + data.trex[i].Quantity
					if (data.polo[j][0] === data.trex[i].Rate) {
						// console.log(data.polo[j][1])
						// console.log(data.trex[i].Quantity)
						// console.log(combinedVolume)
						bidData = {
							Rate: data.polo[j][0],
							Quantity: combinedBidVolume,
							key: i
						}
//						console.log(bidData)
						buyOrderBook.push(bidData) 
//						console.log(myOrderBook)
					} else if (dataPolo.asks[j][0] === dataTrex.result.sell[i].Rate) {
						askData = {
							Rate: dataPolo.asks[j][0],
							Quantity: combinedAskVolume,
							key: i
						}
						sellOrderBook.push(askData)
					}
				}
			};

			// console.log(sellOrderBook)
			// console.log(buyOrderBook)
			combinedOrderBook = {
				asks: sellOrderBook,
				bids: buyOrderBook
			}
			console.log(combinedOrderBook)
			return combinedOrderBook
		}).then((combinedOrderBook) => {
			res.json(combinedOrderBook)
		})
		.catch((err) => {
			res.send(err)	
		})
	})	
});

	


app.get('/api/poloniex', function(req, res) {
	request('https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH&depth=10').then((response) => {
		let data = response
		console.log(data)
		console.log(data[1])
		return data
	}).then((data) => {

	res.send(data)
	})
	.catch((err) => {
		res.send(err)
	});
	
});

let port = process.env.PORT || 3001;

app.listen(port, function(){
	console.log(`listening on port ${ port }`);
});