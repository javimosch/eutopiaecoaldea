
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
					this.editor.setValue(this.value);
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
			setValue(data){
				this.editor.setValue(data,-1);
			},
			activate() {
				if (this.activated) return;
				this.activated = true;
				var editor = ace.edit(this.$refs.editor);
				editor.setTheme("ace/theme/monokai");
				editor.session.setMode("ace/mode/javascript");
				this.editor = editor;
				this.editor.on('change', () => {
					var value = this.editor.getValue();
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