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
			console.log('this is the trex' + dataTrex.result.buy);
			console.log('this is the polo' + dataPolo.bids);
			console.log(dataTrex.result.buy.length);
			for (i = 0; i < dataTrex.result.buy.length; i++) {
				console.log(dataTrex.result.buy[i])
			};
			data = {
				trex: dataTrex.result.buy,
				polo: dataPolo.bids
			};
			return data
	}).then((data) => {
		res.send(data)
	})
	
	})
	.catch((err) => {
		res.send(err)
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

let port = process.env.PORT || 3000;

app.listen(port, function(){
	console.log(`listening on port ${ port }`);
});