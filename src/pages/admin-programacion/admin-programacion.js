module.exports = function () {
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
					components: {
						vuejsDatepicker
					},
					data() {
						return {
							dtp_language: vdp_translation_es.js, //datepicker
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
						//fetch(`${SERVER.API_URL}/api/programacion/fetch`).then(r => r.json().then(response => {
						//this.programacion = this.normalize(response.result);
						//}));
					},
					mounted() {
						this.sort();
					},
					methods: {
						dtp_format(date) {
							return moment(date).format('DD-MM-YYYY');
						},
						showDetails(item) {
							this.programacion.forEach(item => {
								item.showInfo = false
							})
							Vue.set(item, 'showInfo', true)
							//item.showInfo=true
						},
						sort() {
							this.programacion = this.programacion.sort(function (a, b) {
								return moment(a.fechaDesde, 'DD-MM-YYYY').isBefore(moment(b.fechaDesde, 'DD-MM-YYYY'), 'day') ? 1 : -1;
							});
						},
						canAddEvent(){
							if (!this.form.fechaDesde || !this.form.title) {
								return false;
							}
							return true
						},
						addEvent() {
							this.programacion = this.programacion || [];
							if (!this.form.fechaDesde || !this.form.title) {
								return;
							}

							const formatDate = d => moment(d).format('DD-MM-YYYY')

							let newEvent = {
								fechaDesde: formatDate(this.form.fechaDesde),
								fechaHasta: this.form.fechaHasta ? formatDate(this.form.fechaHasta) : '',
								id: window.generateId(),
								title: this.form.title,
								image: '',
								message: '',
								time: '',
								show: false,
								showInfo: false
							}
							this.programacion.push(newEvent);
							this.form.fechaDesde = this.form.fechaHasta = '';
							this.form.title = '';
							this.showForm = false;
							this.sort();
							this.save(newEvent)
						},
						showProgramacion(pr) {
							return this.programacion.length > 0
						},
						normalize(items) {
							return items.map(v => {
								v.id = v.id || window.generateId();
								v.draft = typeof v.show === 'undefined' ? true : v.draft;
								v.showInfo = typeof v.showInfo === 'undefined' ? false : v.showInfo;
								v.fechaDesde = v.fechaDesde ? moment(v.fechaDesde, "DD-MM-YYYY")._d : null
								v.fechaHasta = v.fechaHasta ? moment(v.fechaHasta, "DD-MM-YYYY")._d : null
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
					if (indexToRemove !== null) {
						var removed = this.programacion.splice(indexToRemove, 1);
						this.save({
							id,
							isRemove: true
						})
					}

				}

				function save(item) {
					this.saving = true;
					var dataToSave =
					{
						...Object.assign({}, item),
						showInfo: undefined
					}

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