var express = require('express');
var app = express();
var port = 8080;

app.listen(port, function () {
    console.log('la machine est en route sur le port ' + port);
})

app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./index.html', {
        root: __dirname
    });
}).get('/add', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./addUser.html', {
        root: __dirname
    });
}).get('/edit:id', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./editUser.html?userId=' + req.params.id, {
        root: __dirname
    });
}).get('/infos:id', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./infos.html?userId=' + req.params.id, {
        root: __dirname
    });
});