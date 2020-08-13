const moment = require('moment-timezone');
const argv = require('yargs').argv;
const server = require('./src/server');
const execa = require('execa');
const sander = require('sander');
const path = require('path');
const config = require('./config')

init().catch(console.error)

async function init() {

    await config.init();

    console.log("YARGS", {
        argv
    })

    if (argv.gitd) {
        console.log('Deploy current version (dirty)')
        await build()
        await server.git.deploy()
        process.exit(0);
    }

    if (argv.s || argv.server) {
        runLocalServer().then(async () => {
            await build();
        });
    }

    if (argv.b || argv.build) {
        await build();
    }

    if (argv.w || argv.watch) {

        if (!(argv.s || argv.server)) {
            console.log('Only watching for changes this time...');
            await build();
        }

        var chokidar = require('chokidar');
        chokidar.watch([`${__dirname}/src`, `${__dirname}/config`], {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: true
        }).on('change', async (path, stats) => {
            //console.log('WATCH CHANGE', path);
            await buildDispatch();
            //server.livereload.trigger();
        }).on('add', async (path, stats) => {
            //console.log('WATCH ADD', path);
            await buildDispatch();
            //server.livereload.trigger();
        });
    }
}

async function buildDispatch() {
    if (server._buildTimeout) {
        clearTimeout(server._buildTimeout)
    }
    server._buildTimeout = setTimeout(() => {
        server._buildTimeout = null;
        console.log(`${moment().tz('Europe/Paris').format('DD-MM-YYY HH:mm:ss')}`, 'Build dispatch')
        buildFast()
    }, 500)
}

async function buildFast() {
    return build({
        removeAssets: false
    })
}

async function build(options = {}) {
    const outputFolder = require('path').join(process.cwd(), 'docs');

    var outputFiles = await sander.readdir(outputFolder);

    if (options.removeAssets !== false) {
        console.log('Cleaning dist folder')
        await Promise.all(outputFiles.filter(n => !['CNAME', '.gitkeep'].includes(n)).map(n => {
            //console.log('rimraf',outputFolder,n)
            return sander.rimraf(path.join(outputFolder, n));
        }));
    }


    return console.log("Generate disabled")

    /*
        console.log('Build: Copying static assets')
    await execa.command(`cd ${outputFolder} && cp -R ../src/static/* .`, {
        shell: true,
        stdout: process.stdout
    });
    */

    //Helpers
    server.hbs.loadHandlebarHelpers()
    console.log('Build: Compiling styles')
    //Styles
    if (process.env.NODE_ENV === 'production') {
        //compileStyles();
    } else {
        if (! await sander.exists(path.join(outputFolder, 'styles.css'))) {
            //compileStyles();
        }
    }
    console.log('Build: Bundling javascript')
    //Javascript
    //server.webpack.compile();
    console.log(`Build: Compiling website in spanish`)
    await compileSiteOnce({
        language: 'es'
    });

    if (process.env.DISABLE_I18N !== '1') {
        console.log(`Build: Compiling website in other languages`)
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
    await sander.writeFile(path.join(outputFolder, 'manifest.json'), JSON.stringify({
        created_at: Date.now()
    }, null, 4))
    console.log('Build: Complete');
}

function compileStyles() {
    const config = require('./config');
    var outputFolder = config.defaultOutputFolder;
    var basePath = path.join(process.cwd(), outputFolder);
    var srcPath = path.join(process.cwd(), 'src');
    var srcFile = name => path.join(srcPath, name);
    var fileName = name => path.join(basePath, name);
    //var sass = require('node-sass');
    //var css = sass.renderSync({file: srcFile('styles/main.scss')}).css.toString('utf-8')
    var css = sander.readFileSync(srcFile('styles/main.scss')).toString('utf-8');
    sander.writeFileSync(fileName('styles.css'), css);
    return css.length + ' characters written.'
}




async function compileSiteOnce(options = {}) {

    //Partials and Pages
    const config = require('./config');
    server.partials.compile(config);
    await server.pages.compile(options, config);

    //Index (Home page)
    const Handlebars = require('handlebars');


    var outputFolder = options.outputFolder || config.defaultOutputFolder;
    var basePath = path.join(process.cwd(), outputFolder);
    var srcPath = path.join(process.cwd(), 'src');
    var fileName = name => path.join(basePath, name);
    var srcFile = name => path.join(srcPath, name);

    var source = (await sander.readFile(srcFile('index.html'))).toString('utf-8');
    var template = Handlebars.compile(source);
    var context = await config.getContext(options.language);
    context.currentLanguage = context.lang[options.language];
    context.currentPage = context.defaultCurrentPage;
    context.langPath = options.language != config.defaultLanguage ? `${options.language}/` : ``;
    var html = template(context);
    let result = server.pages.injectHtml(html);
    //server.livereload.addPage(context.currentPage, result, context.currentLanguage, context);
    await sander.writeFile(fileName('index.html'), result.html);
}

function runLocalServer() {
    return new Promise((resolve, reject) => {
        
        const express = require('express');
        const app = express();
        app.config = config

        server.ssr(app, server, config)

        var cors = require('cors');
        
        var appServer = require('http').Server(app);

        /*
        if (argv.w || argv.watch) {
            var io = require('socket.io')(appServer);
            io.on('connection', function (socket) {
                console.log('socket connected')
                socket.on('reportPage', data => {
                    server.livereload.addActivePage(data.page, data.lang);
                });
            });
            process.io = io;
            console.log('socket.io waiting')
        }*/

        app.use(cors());
        var bodyParser = require('body-parser')

        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({
            extended: true
        }))

        // parse application/json
        app.use(bodyParser.json())

        

        createApiRoutes(app);

        const outputFolder = require('path').join(process.cwd(), 'docs');
        app.use('/', express.static(outputFolder));
        


        /*
        if (process.env.NODE_ENV !== 'production') {
            app.get('/livereload.js', (req, res) => {
                server.livereload.addActivePage(req.query.page, req.query.language);
                res.send(server.livereload.getClientScript(port));
            })
        }*/

        const port = process.env.PORT || 3000;
        appServer.listen(port, () => {
            console.log(`Server: Listening on ${port}!`);
            resolve();
        });

    });
}

function createApiRoutes(app) {
    require('./api')(app);
}