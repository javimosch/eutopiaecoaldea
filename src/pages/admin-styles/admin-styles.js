module.exports = function () {
	return {
		name: 'styles',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				window.vues = window.vues || [];
				window.vues['main'] = new Vue({
					el: '.appScope',
					name: 'adminStyles',
					data() {
						return {
							item: {
								htmlData: ''
							},
							saving: false
						}
					},
					created() {
						apiGet('/api/styles').then(r => {
							this.item = r.result;
						});
						let self = this
						this.onSaveKey = function (e) {
							if ((e.which == '115' || e.which == '83') && (e.ctrlKey || e.metaKey) && !(e.altKey)) {
								e.preventDefault();
								if(Object.keys(self.item).length>1){
									self.save()
								}
								return false;
							}
							return true;
						}
						$(document).on('keydown',this.onSaveKey);

					},
					destroyed(){
						$(document).off('keydown',this.onSaveKey);
					},
					mounted() { },
					methods: {
						save() {
							this.saving = true;
							apiPost('/api/styles/save', {
								...this.item
							}).then(r => {
								this.saving = false;
								if (!r.result) {
									new Noty({
										layout: 'bottomCenter',
										text: "Error",
										type: 'error',
										killer: true,
										delay: false
									}).show();
								} else {
									new Noty({
										timeout: 2500,
										layout: 'bottomCenter',
										text: "Cambios guardados!",
										type: 'info',
										killer: true
									}).show();
								}
							});
						}
					}

				});
			}
		}
	}
}