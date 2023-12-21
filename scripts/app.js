const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config()
// const config = require('./config');
// const { resolveProperties } = require('ethers/lib/utils');
const cors = require('cors');
// const { ContractFactory } = require('ethers');
const CoinGecko = require('coingecko-api');


const app = express();
const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());

app.get('/nftPriceforCreation', async (request, response) => {
    try {

        let privateKey = request.query.Private_Key;
        let URI = request.query.URI;
        let address = request.query.address;

        let gas = await getNFTMintingGasPrice(privateKey, URI, address);

        let nftPrice = {
            priceInDollor: `$${gas}`
        }

        response.send(nftPrice);
    }
    catch {
        result = {
            "message": "error"
        }
        response.send(result)
    }
});

app.get('/getGasPrice', async (request, response) => {
    try {

        gasPrice = await GasPrice();

        response.send(gasPrice);
    }
    catch {
        result = {
            "message": "error"
        }
        response.send(result)
    }
});

async function getNFTMintingGasPrice(privateKey, uriLink, address) {

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    let signer = new ethers.Wallet(privateKey, provider);

    // Estimate the gas amount needed to call a smart contract function
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, process.env.CONTRACT_ABI, signer);
    // call the contract function you want with the params you want
    const gasAmount = await contract.estimateGas.safeMint(address, uriLink);

    if (gasAmount._isBigNumber) {
        // Get the current gas price
        const gasPrice = await provider.getGasPrice();

        // Calculate the gas fee
        const gasFeeInWei = gasPrice.mul(gasAmount)
        const gasFeeInETH = ethers.utils.formatEther(gasFeeInWei)


        // using CoinGecko API to fetch real time Matic price in dollor
        const CoinGeckoClient = new CoinGecko();
        let data = await CoinGeckoClient.exchanges.fetchTickers('bitfinex', {
            coin_ids: ['matic']
        });
        var _coinList = {};
        var _datacc = data.data.tickers.filter(t => t.target == 'USD');
        [
            'MATIC'
        ].forEach((i) => {
            var _temp = _datacc.filter(t => t.base == i);
            var _res = _temp.length == 0 ? [] : _temp[0];
            _coinList[i] = _res.last;
        })

        let FeesInDollor = gasFeeInETH * _coinList.MATIC;
        return FeesInDollor
    }

    else {
        return ("price estimation failed, must be due to an error: try again later");
    }
}


async function GasPrice() {
    console.log("here")
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const gasPrice = await provider.getGasPrice();
    const gasPriceInMatic = ethers.utils.formatEther(gasPrice);

    console.log(gasPriceInMatic)

    // using CoinGecko API to fetch real time Matic price in dollor
    const CoinGeckoClient = new CoinGecko();
    let data = await CoinGeckoClient.exchanges.fetchTickers('bitfinex', {
        coin_ids: ['matic']
    });
    var _coinList = {};
    var _datacc = data.data.tickers.filter(t => t.target == 'USD');
    [
        'MATIC'
    ].forEach((i) => {
        var _temp = _datacc.filter(t => t.base == i);
        var _res = _temp.length == 0 ? [] : _temp[0];
        _coinList[i] = _res.last;
    })

    console.log(_coinList.MATIC);

    let gasPriceInDollors = (gasPriceInMatic * _coinList.MATIC).toFixed(20);

    let result = {
        gasPriceInMatic: `${gasPriceInMatic} MATIC`,
        gasPriceInDollors: `$${gasPriceInDollors}`
    }

    return result;

}

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});
