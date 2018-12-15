const path = require('path');
const webpack = require("webpack");

module.exports = {
	compile: () => {
		webpack(getConfig(), (err, stats) => {
			if (err || stats.hasErrors()) {
				if(err){
				console.error('webpack:', err.stack || err);
				if (err.details) {
					console.error('webpack:', err.details);
				}
				}
				const info = stats.toJson();
				console.error('webpack:',{
					warnings: info.warnings||'',
					errors: info.errors||''
				})
			}
			// Done processing
			console.log('webpack: done', (stats.endTime - stats.startTime)+'ms')
		});
	}
}

function getConfig() {
	return {
		mode: process.env.NODE_ENV || 'development',
		entry: "./src/js/main", // string | object | array  // defaults to './src'
		output: {
			path: path.join(process.cwd(), "docs"), // string
			filename: "bundle.js", // string    // the filename template for entry chunks
			//publicPath: "/assets/", // string    // the url to the output directory resolved relative to the HTML page
		},
		module: {
			rules: [{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}]
		},
		resolve: {
			// options for resolving module requests
			// (does not apply to resolving to loaders)
			modules: [
				"node_modules",
				//path.resolve(__dirname, "app")
			],
			// directories where to look for modules
			extensions: [".js", ".json", ".jsx", ".css"],
			// extensions that are used
			alias: {
				// a list of module name aliases
				"module": "new-module",
				// alias "module" -> "new-module" and "module/path/file" -> "new-module/path/file"
			}
		},
		watch:false,
		devtool: "source-map",
		target: "web",
		//externals: ["vue"],
		stats: "errors-only", // lets you precisely control what bundle information gets displayed
		plugins: [
			
		]
	};
}