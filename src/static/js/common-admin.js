function generateId() {
	return '_' + Math.random().toString(36).substr(2, 9);
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

	Vue.component('codemirror', {
		props: ['value', 'enabled'],
		template: `<div  class="codemirror-component">
						<div ref="editor" style="width: -webkit-fill-available;height: 300px;"></div>
					</div>`,
		data() {
			return {
				editor: null,
				init: false,
				activated: false
			}
		},
		watch: {
			value() {
				if (!!this.editor && !this.init) {
					this.editor.setValue(this.value, -1);
					this.init = true;
				}
			},
			enabled() {
				if (this.enabled === true && !this.activated) {
					this.activate();
				}
			}
		},
		methods: {
			activate() {
				if (this.activated) return;
				this.activated = true;
				var editor = ace.edit(this.$refs.editor);
				editor.setTheme("ace/theme/monokai");
				editor.session.setMode("ace/mode/javascript");
				this.editor = editor;
				this.editor.on('change', () => {
					var value = this.editor.getValue();
					console.log('change', value);
					this.$emit('input', value);
				});
				if (!!this.value) {
					this.editor.setValue(this.value, -1);
				}
			}
		},
		mounted() {
			if (this.enabled || this.enabled === undefined) {
				this.activate();
			}
		}
	});
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