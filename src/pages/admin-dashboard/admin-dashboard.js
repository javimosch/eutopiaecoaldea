module.exports = function(){
	return {
		name:'dashboard',
		path:'admin',
		context:{
			type:'admin',
			init:function init(){
				new Vue({
					el: '.admin',
					name: 'admin_dashboard',
					data(){
						return {
							
						}
					},
					created() {
						console.log('admin_dashboard')
					},
					methods: {

					}
				})
			}
		}
	}
}