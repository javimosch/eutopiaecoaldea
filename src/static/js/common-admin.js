(function init() {
	var el = document.querySelector('body');
	if (!el || typeof window.Vue === 'undefined') return setTimeout(() => init(), 100);
	var div = document.createElement('div')
	div.id = 'common-admin';
	el.appendChild(div);
	new Vue({
		el: '#common-admin',
		name: 'common-admin',
		data() {
			return {

			}
		},
		created() {
			if (!!document.querySelector('section.admin.protected')) {
				var encoded = window.localStorage.getItem('adminToken');
				if (!!encoded) {
					fetch(`${SERVER.API_URL}/api/login/validate?code=${encoded}`).then(r => r.json().then(response => {
						if (response.result) {
							console.info('authSuccess');
							try{
								document.querySelector('section.admin.protected').style.display = "block";
							}catch(err){}
						} else {
							this.authFail();
						}
					}));
				} else {
					this.authFail();
				}
			}else{
				console.log('authSkip');
			}

			window.logout = function(){
				window.localStorage.setItem('adminToken','');
				window.location.href="/admin";
			}
		},
		methods: {
			authFail() {
				console.warn('authFail');
				setTimeout(() => {
					window.location.href = "/admin"
				}, 2000);
			}
		}
	})
})();