module.exports = function() {
	return {
		name: 'images',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {

				new Vue({
					el: '.admin',
					name: 'admin_images',
					data() {
						return {
							single_image: null,
							images: [],
							loaders: {
								imageUpload: false,
							}
						}
					},
					created() {

					},
					mounted() {
						this.browseImages();

						$(".adminImageItemUrl").on("click", function() {
							$(this).select();
						});
					},
					methods: {

						uploadImage,
						browseImages,

					}
				})

				function browseImages() {
					fetch(`${SERVER.API_URL}/api/images/browse`).then(r => r.json().then(response => {
						this.images = response.images;
					}));
				}

				function uploadImage() {
					var data = new FormData();
					var file = $('#image')[0].files[0];
					data.append('image', file);
					this.loaders.imageUpload = true;
					$.ajax({
						url: `${SERVER.API_URL}/api/upload/images/single`,
						data: data,
						cache: false,
						contentType: false,
						processData: false,
						type: 'POST',
						error: () => {
							this.loaders.imageUpload = false;
							$('#image').val('');
						},
						success: (data) => {
							this.loaders.imageUpload = false;
							$('#image').val('');
							alert('Image uploaded!')
						}
					});
				}
			}
		}
	}
}