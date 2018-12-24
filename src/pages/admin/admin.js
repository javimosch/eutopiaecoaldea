module.exports = function() {
	return {
		name: 'admin',
		path: '',
		context: {
			type: 'admin',
			init: function init() {

				new Vue({
					el: '.admin_login',
					name: 'admin_login',
					data(){
						return {
							password:''
						}
					},
					created() {
						var encoded = window.localStorage.getItem('adminToken');
						if(!!encoded){
							this.password = window.atob(encoded);
							this.login();
						}
					},
					methods: {
						login
					}
				})

				function login() {
					var password = this.password;
					var encoded = window.btoa(password);
					fetch(`${SERVER.API_URL}/api/login/validate?code=${encoded}`).then(r => r.json().then(response => {
						if (response.result) {
							window.localStorage.setItem('adminToken', encoded);
							window.location.href="/admin/dashboard";
						} else {
							this.$refs.pwd.focus();
						}
					}));
				}
			}
		}
	};
}