module.exports = function() {
	return {
		name: 'files',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				new Vue({
					el: '.admin',
					name: 'adminFiles',
					data() {
						return {
							single_file: null,
							files: [],
							loaders: {
								imageUpload: false,
							}
						}
					},
					created() {

					},
					mounted() {
						this.browse();

						$(".fileUrl").on("click", function() {
							$(this).select();
						});
					},
					methods: {

						upload,
						browse,

					}
				})

				function browse() {
					fetch(`${SERVER.API_URL}/api/files/browse`).then(r => r.json().then(response => {
						this.files = response.items;
					}));
				}

				function upload() {
					var data = new FormData();
					var file = $('#file')[0].files[0];
					data.append('singleFile', file);
					data.append('type', 'files');
					this.loaders.imageUpload = true;
					$.ajax({
						url: `${SERVER.API_URL}/api/upload/single`,
						data: data,
						cache: false,
						contentType: false,
						processData: false,
						type: 'POST',
						error: () => {
							this.loaders.imageUpload = false;
							$('#file').val('');
						},
						success: (data) => {
							this.loaders.imageUpload = false;
							$('#file').val('');
							showInfo("Archivo subido !");
						}
					});
				}


			}
		}
	}
}