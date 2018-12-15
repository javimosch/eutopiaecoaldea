module.exports = function() {
	return {
		name: 'dashboard',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				new Vue({
					el: '.admin',
					name: 'admin_dashboard',
					data() {
						return {
							uploading:false,
							single_image:null,
							images:[]
						}
					},
					created() {
						console.log('admin_dashboard')
					},
					mounted(){
						this.browseImages();
					},
					methods: {
						uploadImage,
						browseImages
					}
				})

				function browseImages(){
					fetch(`${SERVER.API_URL}/api/images/browse`).then(r => r.json().then(response => {
						this.images = response.images;
					}));
				}

				function uploadImage() {
					var data = new FormData();
					var file = $('#image')[0].files[0];
					data.append('image', file);
					this.uploading=true;
					$.ajax({
						url: `${SERVER.API_URL}/api/upload/images/single`,
						data: data,
						cache: false,
						contentType: false,
						processData: false,
						type: 'POST',
						error:()=>{
							this.uploading=false;
							$('#image').val('');
						},
						success: (data)=>{
							this.uploading=false;
							$('#image').val('');
							alert('Image uploaded!')
						}
					});
				}
			}
		}
	}
}