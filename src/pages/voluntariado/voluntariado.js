module.exports = function(options, config, context) {
	return {
		name: context.lang.VOLUNTARIADO,
		context: {
			init: function init() {
				new Vue({
					el: 'form',
					name: 'voluntariado',
					data() {
						return {
							sending: false,
							form: {
								name: '',
								email: '',
								whyMessage: '',
								helpMessage: '',
								dateMessage: ''
							}
						}
					},
					methods: {
						send(e) {
							e.stopPropagation();
							if (!this.form.name || !this.form.email) {
								if (!this.form.name) {
									this.$refs.name.focus()
								}
								if (!this.form.email) {
									this.$refs.email.focus()
								}
								return;
							}
							this.sending = true;

							try {
								fetch('https://cms.misitioba.com/api/forms/submit/ecoaldeaVolunteerForm?token=e420e46dfc002280d5ffee7be5e9e0', {
									method: 'post',
									headers: {
										'Content-Type': 'application/json'
									},
									body: JSON.stringify({
										form: Object.assign({}, this.form)
									})
								});
							} catch (err) {

							}


							$.ajax({
								url: `${SERVER.API_URL}/api/voluntariado/save`,
								data: JSON.stringify(Object.assign({}, this.form)),
								contentType: "application/json; charset=utf-8",
								type: 'POST',
								error: () => {
									this.sending = false;
								},
								success: (data) => {
									this.sending = false;
									if (!data.result) {
										new Noty({
											layout: 'bottomRight',
											text: window.SERVER.lang.VOLUNTARIADO_ENVIAR_SOLICITUD_ERROR,
											type: 'error',
											killer: true,
											delay: false
										}).show();
									} else {
										new Noty({
											layout: 'bottomRight',
											text: window.SERVER.lang.VOLUNTARIADO_ENVIAR_SOLICITUD_SUCCESS,
											type: 'success',
											killer: true
										}).show();
									}
								}
							});
						}
					}
				});
			}
		}
	}
}