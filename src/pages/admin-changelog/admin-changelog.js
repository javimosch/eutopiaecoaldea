module.exports = function() {
	return {
		name: 'changelog',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				window.vues=window.vues||{};
				window.vues['main']=new Vue({
					el: '.appScope',
					name: 'adminChangelog',
					data() {
						return {
							items: []
						}
					},
					created() {
						var newArr = {};
						window.items.forEach(item => {
							newArr[item.date] = newArr[item.date] || {
								list: []
							};
							if (!!item.text) {
								newArr[item.date].list.push(item.text);
							}
							if (item.list) {
								newArr[item.date].list = newArr[item.date].list.concat(item.list);
							}
						});
						this.items = Object.keys(newArr).map(k => {
							return {
								date: k,
								list: newArr[k].list
							};
						});
					},
					mounted() {},
					methods: {

					}
				});



			}
		}
	}
}