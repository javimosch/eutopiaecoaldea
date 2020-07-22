const tempDir = require('temp-dir');
const sander = require('sander');
const execa = require('execa');
const path = require('path');
const shortid = require('shortid');

var cache = {
	basePath: ''
}

module.exports = {
	deploy
}

async function prepare() {
	if (!cache.basePath) {
		var folders = await sander.readdir(tempDir);
		folders = folders.filter(folder => folder.indexOf('git_') !== -1);
		if (folders.length > 0) {
			cache.basePath = path.join(tempDir, folders[0]);
			return; // to speed up things
		}
		var basePath = path.join(tempDir, 'git_' + shortid.generate());
		var gitClone = '';

		let repoUrl = process.env.REPO_URL || 'git@github.com:misitioba/eutopiaecoaldea.git'
		if (process.env.REPO_URL_HTTP) {
			//user and password in http url method
			gitClone = `git clone ${process.env.REPO_URL_HTTP} .`;
		} else {
			//ssh key method
			gitClone = `git clone ${repoUrl} .`;
			var keyPath = path.join(process.cwd(), 'deploy.key');
			var sshAgent = `ssh-agent bash -c 'ssh-add ${keyPath}'`;
			gitClone = `${sshAgent};${gitClone}`;
		}

		await execa.command(`rm -rf ${basePath}; echo 1`, {
			shell: true,
			stdout: process.stdout
		});

		await execa.command(`mkdir ${basePath}; cd ${basePath}; ${gitClone}`, {
			shell: true,
			stdout: process.stdout
		});
		cache.basePath = basePath;
	}
}

async function gitExec(cmd) {
	await prepare();
	var userSet = `cd ${cache.basePath}; git config user.name 'robot'; git config user.email 'noreply@robot.com'`;

	await execa.command(`cd ${cache.basePath};${userSet};${cmd}`, {
		shell: true,
		stdout: process.stdout
	});
}

async function deploy(options = {}) {
	await gitExec(`rm node_modules; ln -s ${path.join(process.cwd(), 'node_modules')} node_modules;`)
	await gitExec(`git reset HEAD --hard`);
	await gitExec('git fetch');
	await gitExec(`git branch -D master; git checkout -b  master origin/dev`);

	await execa.command(`cd ${cache.basePath}/docs; cp -R ${process.cwd()}/docs/* .`, {
		shell: true,
		stdout: process.stdout
	});

	await gitExec(`git add docs/.; git commit -m 'docs updated'`);

	await gitExec(`git push origin master:master --force`);
}
