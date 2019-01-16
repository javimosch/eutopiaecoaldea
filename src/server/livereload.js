const config = require('../../config');

module.exports = {
	cache:{
		es:{}
	},
	didHeadSectionChanged(name, lang, data){
		this.cache[lang] = this.cache[lang] ||{};
		if(!this.cache[lang][name]){
			this.cache[lang][name] = data;
			return true;
		}
		if(this.cache[lang][name]!=data){
			this.cache[lang][name] = data;
			return true;
		}

		return false;
	},
	activePages: {},
	data: {
		es: {},
		en: {}
	},
	getClientScript(port){
return `
var socket = io.connect('http://localhost:${port}');
socket.on('connect', function() {
    console.log('connect')
    socket.emit("reportPage",{
    	page: window.SERVER.currentPage,
    	lang: window.SERVER.currentLanguage
    });
});
socket.on('reload',(data)=>{
    
    if(Object.keys(window.vues||{}).length>0 && window.pageInit){
    	Object.keys(window.vues||{}).forEach((k)=>{
    		window.vues[k].$destroy();
    	})
    }

    document.querySelector('.app').innerHTML = data.app;
    if(data.head){
    	document.querySelector('head').innerHTML = data.head;
    }
    console.log('Hot change received',{
    	head: !!data.head
    });


    if(Object.keys(window.vues).length>0 && window.pageInit){

    	if(data.pageInit){
    		window.eval("window.pageInit = "+data.pageInit)
    	}

    	window.pageInit();
    }

    if(window.bootstrapScripts){
    	window.bootstrapScripts.forEach(fn=> fn());
    }

    
});
console.info('LIVERELOAD');
            `;
	},
	addActivePage(name, language) {
		this.activePages = {};
		language = language || config.defaultLanguage;
		this.activePages[name] = this.activePages[name] || {}
		this.activePages[name][language] = true;
		console.log('addActivePage',name,language)
	},
	addPage(name, data, language, ctx) {
		language = language || config.defaultLanguage;
		this.data[name] = this.data[name] || {};
		this.data[name][language] = data;
		this.data[name].pageInit = ctx.init||null;
		//console.log('addPage',name,language)
	},
	trigger() {
		Object.keys(this.data).forEach(pageName => {
			Object.keys(this.data[pageName]).forEach(langKey => {
				var data = this.data[pageName];
				if(data && data[langKey] && this.activePages[pageName] && this.activePages[pageName][langKey]===true){
					var result = data[langKey];
					var head = result.head;
					if(!this.didHeadSectionChanged(pageName, langKey,head)){
						head = '';
					}
					process.io && process.io.emit('reload', {
						app: result.app,
						head: head,
						pageInit: data.pageInit&&data.pageInit.toString()
					});
					console.log('livereload at ', pageName, langKey);
				}
			});
		});
		this.clear();
		console.log('livereload was triggered')
	},
	clear() {
		this.data = {};
	}
};