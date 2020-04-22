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
    res.sendFile('./views/addPerson.html', {
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
})

.get('/about', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/about.html', {
        root: __dirname
    });
})

.get('/css', function(req, res) {
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/css/style.css', {root: __dirname});
})

.get('/font', function(req, res) {
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/css/font.css', {root: __dirname });
})

.get('/Kamila', function(req, res) {
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    res.status(200);
    res.sendFile('./assets/font/Kamila-DEMO-Regular.otf', {root: __dirname });
})

.get('/vue', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/vue.js', {root: __dirname });
})

.get('/pagination', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/pagination.js', {root: __dirname });
})

//Il faudrait faire un truc qui permette de charger l'image voulue dynamiquement
.get('/image1', function(req, res) {
    res.setHeader('Content-Type', "image/jpg");
    res.status(200);
    res.sendFile('./assets/images/balzac.jpg',
        {root: __dirname });
});

