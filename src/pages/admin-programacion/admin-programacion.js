module.exports = function() {
	return {
		name: 'programacion',
		path: 'admin',
		context: {
			type: 'admin',
			pageLinks: ['https://cdn.quilljs.com/1.3.6/quill.snow.css'],
			pageScripts: ['https://cdn.quilljs.com/1.3.6/quill.js'],
			init: function init() {


				new Vue({
					el: '.appScope',
					name: 'adminProgramacion',
					data() {
						return {
							showForm: false,
							form: {
								fecha: '',
								title: ''
							},
							saving: false,
							programacion: this.normalize(window.programacion)
						}
					},
					created() {
						fetch(`${SERVER.API_URL}/api/programacion/fetch`).then(r => r.json().then(response => {
							//this.programacion = this.normalize(response.result);
						}));
					},
					mounted() {
						this.sort();
					},
					methods: {
						sort(){
							this.programacion = this.programacion.sort(function(a,b){
								return moment(a.fechaDesde,'DD-MM-YYYY').isBefore(moment(b.fechaDesde,'DD-MM-YYYY'),'day') ? 1 : -1;
							});
						},
						addEvent() {
							this.programacion = this.programacion || [];
							if(!this.form.fechaDesde || !this.form.title){
								return;
							}
							this.programacion.push({
								fechaDesde: this.form.fechaDesde,
								fechaHasta: this.form.fechaHasta || '',
								id: window.generateId(),
								title: this.form.title,
								image: '',
								message: '',
								time: '',
								show: false
							});
							this.form.fechaDesde = this.form.fechaHasta = '';
							this.form.title = '';
							this.showForm = false;
							this.sort();
							this.save()
						},
						showProgramacion(pr) {
							return this.programacion.length>0
						},
						normalize(items) {
							return items.map(v => {
								v.id = v.id || window.generateId();
								v.show = typeof v.show === 'undefined' ? false : v.show;
								v.showInfo = typeof v.showInfo === 'undefined' ? false : v.showInfo;
								return v;
							})
						},
						remove,
						save: save
					}
				});

				function remove(id) {
					if (!window.confirm('Seguro ?')) {
						return;
					}
					var indexToRemove = null;
					this.programacion.forEach((evt, index) => {
						if (evt.id == id) {
							indexToRemove = index;
						}
					});
					if (indexToRemove!==null) {
						var removed = this.programacion.splice(indexToRemove, 1);
						this.save()
					}

				}

				function save() {
					this.saving = true;
					var dataToSave = this.programacion.map(pr=>{
						var r = {};
						Object.assign(r,pr);
						delete r.showInfo;
						return r;
					})
					apiPost('/api/programacion/save', dataToSave).then(res => {
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