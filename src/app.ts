import http = require("http");
import express = require("express");
import Q = require("q");
import fs = require('fs');
import path = require('path');
import strCU = require("./StringUtility");

const request = Q.denodeify(require("request"));
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

let listener: http.Server;
let clientId: string;
let secret: string;

const config  = path.resolve(__dirname, '../config/app.json');

Q.nfcall(fs.readFile, config, 'utf-8').then(function (text: string)
{
    let obj = JSON.parse(text);
    clientId = obj[ 'clientId' ];
    secret = obj[ 'secret' ];
    listener = app.listen(22222);
})
.catch(function (err)
{
    console.log(err);
});

app.get('/login', (req, res) =>
{
    let localUrl = req.protocol + '://' + req.hostname + ':' + listener.address().port;
    let redUrl = localUrl + '/oauth';

    res.redirect('https://www.yammer.com/oauth2/authorize?client_id=' + clientId
        + '&response_type=code&redirect_uri=' + encodeURIComponent(redUrl))
});

app.get('/oauth', (req, res) =>
{
    let code = req.query[ 'code' ];
    PostCode(code).then(function (text)
    {
        res.send(text);
    })
    .catch(function (err)
    {
        console.log(err);
        res.send(err);
    })
})


function PostCode(code: string)
{
    let deferred = Q.defer();

    let url = 'https://www.yammer.com/oauth2/access_token.json?client_id=' + clientId
        + '&client_secret=' + secret + '&code=' + code;

    request(url).spread(function (res, body)
    {
        deferred.resolve(body);
    }).catch(function (err)
    {
        deferred.reject(err);
    })

    return deferred.promise;
}


