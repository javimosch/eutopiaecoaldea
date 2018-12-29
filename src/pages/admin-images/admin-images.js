module.exports = function() {
	return {
		name: 'images',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {

				new Vue({
					el: '.admin',
					name: 'adminImages',
					data() {
						return {
							images: [],
							loaders: {
								imageUpload: false,
								removingImage: false
							}
						}
					},
					created() {

					},
					mounted() {
						this.browseImages();


					},
					methods: {
						removeImage,
						uploadImage,
						browseImages,
					}
				})

				function removeImage(name) {
					if (window.confirm('Seguro ?')) {
						this.loaders.removingImage = true;
						apiPost('/api/images/remove', {
							name: name
						}).then(res => {
							this.loaders.removingImage = false;
							if (!res.err) {
								showInfo("Imagen removida !");
								this.browseImages()
							}
						});
					}
				}

				const imagesCheck = (function() {
					const images = {};
					const self = (url, cache = true) => {
						return new Promise((resolve, reject) => {
							if (images[url]) return resolve(images[url]);

							const image = new Image();
							image.src = url;
							image.onload = () => {
								const data = {
									url,
									width: image.width,
									height: image.height
								};
								if (cache) images[url] = data;
								return resolve(data);
							};
							image.onerror = (err) => {
								return reject(err);
							};
						});
					};
					return self;
				})();

				function browseImages() {
					fetch(`${SERVER.API_URL}/api/images/browse`).then(r => r.json().then(async response => {
						
						this.images = await Promise.all(response.images.map(image => {
							return new Promise((resolve,reject)=>{
								return imagesCheck(`/uploads/images/${image.name}`).then(()=>{
									image.link = `/uploads/images/${image.name}`
									image.pending = false;
									resolve(image)
								}).catch(err=>{
									image.pending = true;
									resolve(image)
								})
							})
						}));

						setTimeout(() => {
							$(".adminImageItemUrl").off('click').on("click", function() {
								$(this).select();
							});
						}, 1000);
					}));
				}

				function uploadImage() {
					var data = new FormData();
					var file = $('#image')[0].files[0];
					data.append('singleFile', file);
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
							$('#image').val('');
						},
						success: (data) => {
							this.loaders.imageUpload = false;
							$('#image').val('');
							this.browseImages();
							showInfo("Imagen subida !");
						}
					});
				}
			}
		}
	}
}