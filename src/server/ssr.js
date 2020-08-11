const express = require('express');
const path = require('path');
const { option } = require('yargs');

module.exports = async (app, server, config) => {
    await config.init()

    console.log('Exposing static folder at /')
    app.use('/', express.static(path.join(process.cwd(), `src/static`)));

    app.use(async (req, res, next) => {
        let options = {}
        let lang = config.languages.find(l=>req.url.indexOf(`/${l}`)===0)
        if(lang){
            options.language= lang
        }
        await configureHandlebars(options)
        console.log('config',req.url, lang)
        next()
    })

    config.languages.forEach(lang => {
        lang = lang == config.defaultLanguage ? '' : lang

        app.get(`/${lang}/*`, createRender({
            language: lang || undefined,
            parseUrl: url => lang ? url.split(`/${lang}/`).join('/') : url
        }))

        app.get(`/${lang}`, createRender({
            fallbackPageToDefault: true,
            language: lang
        }))

        console.log("Render created for", lang || '(default)')
    })

    app.get(`/*`, createRender({
        language: config.defaultLanguage
    }))

    function createRender(options = {}) {
        return async (req, res, next) => {
            let url = req.url

            if (options.parseUrl) {
                url = options.parseUrl(url)
            }

            if (url.indexOf('.') !== -1) return next()
            if (url.indexOf('/api/') !== -1) return next()

            const language = options.language || config.defaultLanguage

            if (options.fallbackPageToDefault) {
                var context = await config.getContext(options.language);
                options.fallbackPage = context.defaultCurrentPage  + '_' + language
            }

            console.log('Testing url', url, options)

            if (server.pages.getPage(url, options.fallbackPage)) {
                res.send(await server.pages.getPageAsHtml(url, {
                    fallbackPage: options.fallbackPage,
                    language,
                    config
                }))
            } else {
                next()
            }
        }
    }


    async function configureHandlebars(options = {}) {
        if(Object.keys(options).length===0){
            options.default=true
        }

        let id = Object.keys(options).join('_') + '_' + Object.values(options).join('_')

        if (app.__configureHandlebars && app.__configureHandlebars[id]) {
            return;
        }

        console.log('Configure handlebars', id)
        await server.partials.compile(config);
        await server.pages.compile(options, config);
        server.hbs.loadHandlebarHelpers()
        app.__configureHandlebars = app.__configureHandlebars || {}
        app.__configureHandlebars[id] = true
    }
}