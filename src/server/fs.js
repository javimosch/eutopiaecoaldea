
module.exports = {
	execSync,
	rimraf
};
function rimraf(p, warningPath) {
	const sander = require('sander');
	if (p.indexOf(warningPath) !== -1) {
		sander.rimrafSync(p);
	} else {
		console.error('WARN: check rimraf', p);
	}
}
function execSync(cmd) {
	if (!cmd) return console.error('exec: cmd required');
	var out = require('child_process').execSync(cmd, {
		cwd: process.cwd(),
		env: process.env,
		encoding: 'utf-8'
	});
	console.log(JSON.stringify({
		cmd,
		out
	}, null, 2));
}
