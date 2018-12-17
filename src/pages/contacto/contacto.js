module.exports = function(options, config, context) {
	return {
		name: context.lang.CONTACTO,
		context: {
			init: function init() {
				new Vue({
					el: 'form',
					name: 'contact',
					data(){
						return {
							name:'',
							email:'',
							message:''
						}
					},
					methods:{
						send(e){
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
						}
					}
				});
			}
		}
	}
}