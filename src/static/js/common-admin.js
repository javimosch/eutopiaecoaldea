function generateId() {
	return '_' + Math.random().toString(36).substr(2, 9);
}

function showInfo(text, timeout, killer) {
	showNoty(text, timeout, killer, 'info');
}
function showWarn(text, timeout, killer) {
	showNoty(text, timeout, killer, 'warning');
}
function showError(text, timeout, killer) {
	showNoty(text, timeout, killer, 'error');
}
function showSuccess(text, timeout, killer) {
	showNoty(text, timeout, killer, 'success');
}

function showNoty(text, timeout, killer, type) {
	var opts = {
		layout: 'bottomCenter',
		text: text,
		type: type,
		killer: killer === undefined ? false : killer,
	}
	if (timeout == false) {
		opts.delay = false
	} else {
		opts.timeout = opts.timeout || 2500;
	}
	new Noty(opts).show();
}

function apiGet(uri) {
	return new Promise((resolve, reject) => {
		fetch(`${SERVER.API_URL}${uri}`).then(r => r.json().then(response => {
			resolve(response);
		})).catch(err => {
			resolve({
				err,
				result: null
			});
		});
	});
}

function apiPost(uri, data) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${SERVER.API_URL}${uri}`,
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			type: 'POST',
			error: () => {
				return resolve({
					err: true,
					result: null
				})
			},
			success: (data) => {
				return resolve(data)
			}
		});
	})
}

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
							try {
								document.querySelector('section.admin.protected').style.display = "block";
							} catch (err) {}
						} else {
							this.authFail();
						}
					}));
				} else {
					this.authFail();
				}
			} else {
				console.log('authSkip');
			}

			window.logout = function() {
				window.localStorage.setItem('adminToken', '');
				window.location.href = "/admin";
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