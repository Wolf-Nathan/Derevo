var express = require('express');
var app = express();
var port = 8080;

app.listen(port, function() {
    console.log('la machine est en route sur le port ' + port);
})

app.use('/images', express.static('./assets/images/'));
app.use('/css', express.static('./dev/css/'));
app.use('/js', express.static('./dev/js/'));

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./index.html', {
        root: __dirname
    });
}).get('/add', function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/addPerson.html', {
        root: __dirname
    });
}).get('/edit', function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/editPerson.html', {
        root: __dirname,
    });

}).get('/infos', function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/infos.html', {
        root: __dirname
    });
})

.get('/delete', function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/deletePerson.html', {
        root: __dirname
    });
})

.get('/year', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/byYear.html', {root: __dirname});

})

.get('/about', function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200);
    res.sendFile('./views/about.html', {
        root: __dirname
    });
})

.get('/Kamila', function(req, res) {
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    res.status(200);
    res.sendFile('./assets/font/Kamila-DEMO-Regular.otf', { root: __dirname });
});