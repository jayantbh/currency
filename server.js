var Hapi = require('hapi');
var Inert = require('inert');
var Path = require('path');
var Hoek = require('hoek');
var Vision = require('vision');
var Handlebars = require('handlebars');
var Good = require('good');
var GoodConsole = require('good-console');

var port = parseInt(process.env.PORT) || 3000;
var server = new Hapi.Server({
    debug: { request: ['error'] },
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});
server.connection({port: port});

var defaultContext = {
    title: 'Currency Conversion'
};

server.register(Vision, function (err) {

    Hoek.assert(!err, err);

    server.views({
        engines: {
            html: Handlebars
        },
        relativeTo: __dirname,
        path: './views',
        layoutPath: './views/layout',
        //helpersPath: './views/helpers',
        partialsPath: './views/partials',
        context: defaultContext
    });
});

server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: GoodConsole,
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
},
    function (err) {
        if(err){throw err;}
    }
);

server.register(Inert, function (err) {
    if(err){throw err;}
    server.route({
        method: 'GET',
        path: '/{filename*}',
        handler: {
            directory: {
                path: Path.join(__dirname,'public'),
                index: false
            }
        }

    });
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (req, res) {
        res.view('index');
    }
});

server.start(function () {
    server.log('info','Server running at: '+server.info.uri);
});