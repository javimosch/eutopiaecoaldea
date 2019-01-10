module.exports = function() {
	return {
		name: 'programacion',
		path: 'admin',
		context: {
			type: 'admin',
			pageLinks: ['https://cdn.quilljs.com/1.3.6/quill.snow.css'],
			pageScripts: [ 'https://cdn.quilljs.com/1.3.6/quill.js'],
			init: function init() {


				new Vue({
					el: '.admin',
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
							this.programacion = this.normalize(response.result);
						}));
					},
					mounted() {

					},
					methods: {
						addEvent() {
							this.programacion = this.programacion || [];
							var pr = this.programacion.find(pr => pr.fecha.toString() == this.form.fecha.toString())
							if (!pr) {
								pr = {
									fecha: this.form.fecha,
									eventos: []
								}
								this.programacion.push(pr);
							}
							pr.eventos = pr.eventos || [];
							pr.eventos.push({
								id: window.generateId(),
								title: this.form.title,
								image: '',
								message: '',
								time: '',
								show: false
							});
							this.form.fecha = '';
							this.form.title = '';
							this.showForm = false;

						},
						showProgramacion(pr) {
							return pr.eventos && pr.eventos.length > 0
						},
						normalize(items) {
							return items.map(v => {
								v._expand = false;
								v.eventos = v.eventos || []
								v.eventos.forEach(evt => {
									if (!evt.id) {
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

				function remove(id) {
					if (!window.confirm('Seguro ?')) {
						return;
					}
					this.programacion.forEach(pr => {
						if (pr.eventos) {
							var indexToRemove;
							pr.eventos.forEach((evt, index) => {
								if (evt.id == id) {
									indexToRemove = index;
								}
							})
							if (indexToRemove !== undefined) {
								var removed = pr.eventos.splice(indexToRemove, 1);
								this.$forceUpdate();
							}
						}
					})
				}

				function save() {
					this.saving = true;

					this.programacion = this.programacion.filter(p=>p.eventos.length>0);

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