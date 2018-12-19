module.exports = function() {
	return {
		name: 'programacion',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				new Vue({
					el: '.admin',
					name: 'adminProgramacion',
					data() {
						return Object.assign({
							saving: false,
							programacion: this.normalize(window.programacion)
						}, {});
					},
					created() {
						fetch(`${SERVER.API_URL}/api/programacion/fetch`).then(r => r.json().then(response => {
							this.programacion = this.normalize(response.result);
						}));
					},
					mounted() {

					},
					methods: {
						showProgramacion(pr){
							return pr.eventos && pr.eventos.length>0
						},
						normalize(items) {
							return items.map(v => {
								v._expand = false;
								v.eventos = v.eventos || []
								v.eventos.forEach(evt => {
									if(!evt.id){
										evt.id = window.generateId();
									}
									evt.show = typeof evt.show === 'undefined' ? true : evt.show;
								})
								return v;
							})
						},
						remove,
						save: save
					}
				});

				function remove(id){
					if(!window.confirm('Seguro ?')){
						return;
					}
					this.programacion.forEach(pr=>{
						if(pr.eventos){
							var indexToRemove;
							pr.eventos.forEach((evt, index)=>{
								if(evt.id == id){
									indexToRemove = index;
								}
							})
							if(indexToRemove!==undefined){
								var removed = pr.eventos.splice(indexToRemove,1);
								this.$forceUpdate();
							}
						}
					})
				}

				function save() {
					this.saving = true;
					apiPost('/api/programacion/save', this.programacion).then(res => {
						this.saving = false
						if (!res.result) {
							new Noty({
								layout: 'bottomRight',
								text: "Problema al guardar",
								type: 'error',
								killer: true,
								delay: false
							}).show();
						} else {
							new Noty({
								timeout: 500,
								layout: 'bottomRight',
								text: "Guardado !",
								type: 'success'
							}).show();
						}
					});
				}
			}
		}
	};
};