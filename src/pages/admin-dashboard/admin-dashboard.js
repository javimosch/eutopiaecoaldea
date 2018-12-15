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

						}
					},
					created() {
						console.log('admin_dashboard')
					},
					methods: {
						uploadImage
					}
				})

				function uploadImage() {
					var data = new FormData();
					var file = $('#image')[0].files[0];
					data.append('image', file);
					$.ajax({
						url: `${SERVER.API_URL}/api/upload/images/single`,
						data: data,
						cache: false,
						contentType: false,
						processData: false,
						type: 'POST',
						success: function(data) {
							console.info('RES', data)
						}
					});
				}
			}
		}
	}
}