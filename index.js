const outputFolder = require('path').join(process.cwd(), 'docs');
const moment = require('moment-timezone');
const argv = require('yargs').argv;
const server = require('./src/server');
var exec = server.fs.execSync;
var rimraf = server.fs.rimraf;
const sander = require('sander');
const path = require('path');

if (argv.gitd) {
    console.log('Deploy from temp...')
    server.git.deploy()
    process.exit(0);
}

if (argv.s || argv.server) {
    runLocalServer().then(() => {
        build();
    });
}
if (argv.b || argv.build) {
    build();
}
if (argv.w || argv.watch) {
    if (!(argv.s || argv.server)) {
        console.log('Only watching for changes this time...');
        build();
    }
    var chokidar = require('chokidar');
    chokidar.watch([`${__dirname}/src`, `${__dirname}/config`], {
        ignored: /(^|[\/\\])\../,
        ignoreInitial: true
    }).on('change', (path, stats) => {
        console.log('WATCH CHANGE', path);
        build();
        server.livereload.trigger();
    }).on('add', (path, stats) => {
        console.log('WATCH ADD', path);
        build();
        server.livereload.trigger();
    });
}

function build() {
    var outputFiles = sander.readdirSync(outputFolder);
    outputFiles.filter(n => !['CNAME', 'styles.css', 'js', 'libs', 'img', 'uploads'].includes(n)).forEach(n => {
        rimraf(path.join(outputFolder, n), '/docs/');
    });
    console.log('BUILD 1')
    exec(`cd ${outputFolder}; cp -R ../src/static/* .`);

    //Helpers
    loadHandlebarHelpers()
    console.log('BUILD 2')
    //Styles
    if (process.env.NODE_ENV === 'production') {
        //compileStyles();
    } else {
        if (!sander.existsSync(path.join(outputFolder, 'styles.css'))) {
            //compileStyles();
        }
    }
    console.log('BUILD 3')
    //Javascript
    //server.webpack.compile();
    //Generate site
    compileSiteOnce({
        language: 'es'
    });

    if (process.env.DISABLE_I18N !== '1') {
        console.log('BUILD 4')
        compileSiteOnce({
            language: 'en',
            outputFolder: 'docs/en'
        });
        compileSiteOnce({
            language: 'fr',
            outputFolder: 'docs/fr'
        });
        compileSiteOnce({
            language: 'de',
            outputFolder: 'docs/de'
        });
        compileSiteOnce({
            language: 'pr',
            outputFolder: 'docs/pr'
        });
        compileSiteOnce({
            language: 'it',
            outputFolder: 'docs/it'
        });
    } else {
        console.log('WARN: i18N Disabled')
    }
    sander.writeFileSync(path.join(outputFolder, 'manifest.json'), JSON.stringify({
        created_at: Date.now()
    }, null, 4))
    console.log('BUILD DONE');
}

function compileStyles() {
    const config = require('./config');
    var outputFolder = config.defaultOutputFolder;
    var basePath = path.join(process.cwd(), outputFolder);
    var srcPath = path.join(process.cwd(), 'src');
    var srcFile = name => path.join(srcPath, name);
    var fileName = name => path.join(basePath, name);
    var sass = require('node-sass');
    //var css = sass.renderSync({file: srcFile('styles/main.scss')}).css.toString('utf-8')
    var css = sander.readFileSync(srcFile('styles/main.scss')).toString('utf-8');
    sander.writeFileSync(fileName('styles.css'), css);
    return css.length + ' characters written.'
}

function loadHandlebarHelpers() {
    const Handlebars = require('handlebars');

    var H = require('just-handlebars-helpers');
    H.registerHelpers(Handlebars);



    Handlebars.registerHelper('bold', function(options) {
        return new Handlebars.SafeString(
            '<div class="mybold">' +
            options.fn(this) +
            '</div>');
    });
    Handlebars.registerHelper('capitalize', function(options) {
        var result = options.fn(this);
        result = result.charAt(0).toUpperCase() + result.substring(1);
        return new Handlebars.SafeString(result);
    });

    Handlebars.registerHelper('date', function(dateString, inputFormat, outputFormat, options) {
        //var inputFormat = "DD-MM-YYYY HH:mm"
        var moment = require('moment-timezone');
        moment.locale('es');
        output = moment(dateString, inputFormat).format(outputFormat);
        return output.charAt(0).toUpperCase() + output.substring(1);
    });

    function filtrarProgramaciones(eventos, options) {
        if (!eventos) {
            console.error('filtrarProgramaciones: no events provided', options.data.root.currentPage)
            return [];
        }
        if (options.data.root.programacionOcultarEventosPasados === true) {
            eventos = eventos.filter(evt => {
                return moment(evt.fecha, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day');
            });
        }
        eventos = eventos && eventos.filter(evt => evt.show === undefined ? true : evt.show) || [];
        return eventos;
    }
    Handlebars.registerHelper('hasProgramations', function(obj, options) {
        return filtrarProgramaciones(obj, options).length > 0;
    })
    Handlebars.registerHelper('filtrarProgramacion', function(obj, options) {
        return filtrarProgramaciones(obj, options);
    })
    Handlebars.registerHelper('filtrarEventosProgramacion', function(eventos, options) {
        if (!eventos) {
            console.error('filtrarProgramaciones: no events provided', options.data.root.currentPage)
            return [];
        }
        eventos = eventos.filter(evt => evt.show === undefined ? true : evt.show);
        if (options.data.root.programacionOcultarEventosPasados === true) {
            eventos = eventos.filter(evt => {
                return moment(evt.fechaDesde, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day');
            })
        }
        eventos = eventos.sort(function(a, b) {
            return moment(a.fechaDesde, 'DD-MM-YYYY').isBefore(moment(b.fechaDesde, 'DD-MM-YYYY'), 'day') ? 1 : -1;
        });
        /*
        console.log('filter',{
            eventos: eventos.map(e=>e.title)
        })*/

        return eventos;
    })

    Handlebars.registerHelper('filterArrByKey', function(obj, key, options) {
        return obj.filter(evt => evt[key] === undefined ? true : evt[key]);
    })
    Handlebars.registerHelper('emptyIf', function(str, emptyIf, options) {
        if ((eval(emptyIf)).includes(str)) {
            return '';
        } else {
            return str;
        }
    });
    Handlebars.registerHelper('pagePath', function(langPath, name, options) {
        name = name.split(' ').join('-')
        name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        name = name.toLowerCase();
        return `/${langPath}${name}`;
    });

    Handlebars.registerHelper('stringify', function(obj, options) {
        function escape(key, val) {
            if (typeof(val) != "string") return val;
            return val
                .replace(/[\\]/g, '\\\\')
                .replace(/[\/]/g, '\\/')
                .replace(/[\b]/g, '\\b')
                .replace(/[\f]/g, '\\f')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r')
                .replace(/[\t]/g, '\\t')
                .replace(/[\"]/g, '\\"')
                .replace(/\\'/g, "\\'");
        }
        return JSON.stringify(obj || {}, escape);
    });

    Handlebars.registerHelper('typeIs', function(obj, value, options) {
        if (typeof obj == value) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('toString', function(result, options) {
        result = result.toString('utf-8');
        return new Handlebars.SafeString(result);
    });
    Handlebars.registerHelper('ifNotEmpty', function(conditional, options) {
        if (!!conditional) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    /*
    Handlebars.registerHelper('if', function(conditional, options) {
      if(conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    */
}


function compileSiteOnce(options = {}) {

    //Partials and Pages
    const config = require('./config');
    server.partials.compile(options, config);
    server.pages.compile(options, config);

    //Index (Home page)
    const Handlebars = require('handlebars');

    const path = require('path');
    const sander = require('sander');
    var outputFolder = options.outputFolder || config.defaultOutputFolder;
    var basePath = path.join(process.cwd(), outputFolder);
    var srcPath = path.join(process.cwd(), 'src');
    var fileName = name => path.join(basePath, name);
    var srcFile = name => path.join(srcPath, name);

    var source = sander.readFileSync(srcFile('index.html')).toString('utf-8');
    var template = Handlebars.compile(source);
    var context = config.getContext(options.language);
    context.currentLanguage = context.lang[options.language];
    context.currentPage = context.defaultCurrentPage;
    context.langPath = options.language != config.defaultLanguage ? `${options.language}/` : ``;
    var html = template(context);
    let result = server.pages.injectHtml(html);
    server.livereload.addPage(context.currentPage, result, context.currentLanguage, context);
    sander.writeFileSync(fileName('index.html'), result.html);
}

function runLocalServer() {
    return new Promise((resolve, reject) => {
        const express = require('express');
        const app = express();
        var cors = require('cors');
        var appServer = require('http').Server(app);

        if (argv.w || argv.watch) {
            var io = require('socket.io')(appServer);
            io.on('connection', function(socket) {
                console.log('socket connected')
                socket.on('reportPage', data => {
                    server.livereload.addActivePage(data.page, data.lang);
                });
            });
            process.io = io;
            console.log('socket.io waiting')
        }

        app.use(cors());
        var bodyParser = require('body-parser')

        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({
            extended: true
        }))

        // parse application/json
        app.use(bodyParser.json())

        const port = process.env.PORT || 3000;

        if (argv.a || argv.api) {
            app.get('/', function(req, res) {
                return res.send('API OK');
            });
            createApiRoutes(app);
        } else {
            app.use('/', express.static(outputFolder));
            createApiRoutes(app);
        }

        if (process.env.NODE_ENV !== 'production') {
            app.get('/livereload.js', (req, res) => {
                server.livereload.addActivePage(req.query.page, req.query.language);
                res.send(server.livereload.getClientScript(port));
            })
        }

        appServer.listen(port, () => {
            console.log(`Local server listening on port ${port}!`);
            resolve();
        });

    });
}

function createApiRoutes(app) {
    require('./api')(app);
}