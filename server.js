var express = require('express');
var app = express();
var port = 8080;

app.listen(port, function () {
    console.log('la machine est en route sur le port ' + port);
})

app.use('/images', express.static('./assets/images/'));

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
}).get('/edit', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/editPerson.html', {
        root: __dirname,
    });
}).get('/infos', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/infos.html', {
        root: __dirname
    });
})

.get('/delete', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/deletePerson.html', {
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

.get('/arbreCss', function(req, res) {
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/css/style_arbre.css', {root: __dirname});
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

.get('/addPerson', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/addPerson.js', {root: __dirname });
})

.get('/editPerson', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/editPerson.js', {root: __dirname });
})

.get('/deletePerson', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/deletePerson.js', {root: __dirname});
})

.get('/infosPerson', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/infos.js', {root: __dirname});
})

.get('/pagination', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/pagination.js', {root: __dirname });
})

.get('/genereDonnees', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/genereDonnees.js', {root: __dirname});
})

.get('/genereArbre', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200);
    res.sendFile('./dev/js/genereArbre.js', {root: __dirname});
});

