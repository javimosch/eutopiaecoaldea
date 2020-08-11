const moment = require('moment-timezone');

module.exports = {
    loadHandlebarHelpers
}

function loadHandlebarHelpers() {
    const Handlebars = require('handlebars');

    var H = require('just-handlebars-helpers');
    H.registerHelpers(Handlebars);



    Handlebars.registerHelper('bold', function (options) {
        return new Handlebars.SafeString(
            '<div class="mybold">' +
            options.fn(this) +
            '</div>');
    });
    Handlebars.registerHelper('capitalize', function (options) {
        var result = options.fn(this);
        result = result.charAt(0).toUpperCase() + result.substring(1);
        return new Handlebars.SafeString(result);
    });

    Handlebars.registerHelper('date', function (dateString, inputFormat, outputFormat, options) {
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
    Handlebars.registerHelper('hasProgramations', function (obj, options) {
        return filtrarProgramaciones(obj, options).length > 0;
    })
    Handlebars.registerHelper('filtrarProgramacion', function (obj, options) {
        return filtrarProgramaciones(obj, options);
    })
    Handlebars.registerHelper('filtrarEventosProgramacion', function (eventos, options) {
        if (!eventos) {
            console.error('filtrarProgramaciones: no events provided', options.data.root.currentPage)
            return [];
        }
        eventos = eventos.filter(evt => !evt.draft);
        if (options.data.root.programacionOcultarEventosPasados === true) {
            eventos = eventos.filter(evt => {
                return moment(evt.fechaDesde, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day');
            })
        }
        eventos = eventos.sort(function (a, b) {
            return moment(a.fechaDesde, 'DD-MM-YYYY').isBefore(moment(b.fechaDesde, 'DD-MM-YYYY'), 'day') ? 1 : -1;
        });
        /*
        console.log('filter',{
            eventos: eventos.map(e=>e.title)
        })*/

        return eventos;
    })

    Handlebars.registerHelper('filterArrByKey', function (obj, key, options) {
        return obj.filter(evt => evt[key] === undefined ? true : evt[key]);
    })
    Handlebars.registerHelper('emptyIf', function (str, emptyIf, options) {
        if ((eval(emptyIf)).includes(str)) {
            return '';
        } else {
            return str;
        }
    });
    Handlebars.registerHelper('pagePath', function (langPath, name, options) {
        name = name.split(' ').join('-')
        name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        name = name.toLowerCase();
        return `/${langPath}${name}`;
    });

    Handlebars.registerHelper('stringify', function (obj, options) {
        function escape(key, val) {
            if (typeof (val) != "string") return val;
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

    Handlebars.registerHelper('typeIs', function (obj, value, options) {
        if (typeof obj == value) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('toString', function (result, options) {
        result = result.toString('utf-8');
        return new Handlebars.SafeString(result);
    });
    Handlebars.registerHelper('ifNotEmpty', function (conditional, options) {
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