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
							this.programacion = this.normalize(response.result)
							this.programacion[0].eventos.push(this.programacion[1].eventos[0])
						}));
					},
					mounted() {

					},
					methods: {
						normalize(items) {
							return items.map(v => {
								v._expand = false;
								v.show = v.show === undefined ? true : v.show;
								return v;
							})
						},
						save: save
					}
				});

				function save() {
					this.saving=true;
					apiPost('/api/programacion/save', this.programacion).then(res => {
						this.saving=false
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
								timeout:500,
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