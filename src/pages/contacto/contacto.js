module.exports = function(options, config, context) {
	return {
		name: context.lang.CONTACTO,
		context: {
			init: function init() {
				window.vues = window.vues || {}
				window.vues['main'] = new Vue({
					el: 'form',
					name: 'contact',
					data() {
						return {
							sending: false,
							form: {
								name: '',
								email: '',
								message: ''
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
							var payloadData = Object.assign({}, this.form);
							var payload = JSON.stringify(payloadData);

							try {
								fetch('https://cms.misitioba.com/api/forms/submit/ecoaldeaContactForm?token=e420e46dfc002280d5ffee7be5e9e0', {
										method: 'post',
										headers: {
											'Content-Type': 'application/json'
										},
										body: JSON.stringify({
											form: payloadData
										})
									})
									//.then(entry => entry.json())
									.then(entry => console.log(entry));
							} catch (err) {

							}

							$.ajax({
								url: `${SERVER.API_URL}/api/formularioContacto/save`,
								data: payload,
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

							/*
							e.stopPropagation();
							if(!this.name){
								return;
							}
							$.ajax({
								url: `${SERVER.API_URL}/api/email/send`,
								data: JSON.stringify({
									subject:`${this.name} completo el formulario de contacto`,
									html:`
									<ul>
										<li>
											Nombre y apellido: ${this.name}
										</li>
										<li>
											Email: ${this.email}
										</li>
										<li>
											<p>
											Message:<br><br>
											${this.message}
											</p>
										</li>
										
									</ul>
									`
								}),
								contentType: "application/json; charset=utf-8",
								type: 'POST',
								error: () => {
									
								},
								success: (data) => {
									console.info('RES',data);
								}

							});
								*/
						}
					}
				});
			}
		}
	}
}