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
			gitClone = `git clone ${process.env.REPO_URL_HTTP} --branch master --single-branch .`;
		} else {
			//ssh key method
			gitClone = `git clone ${repoUrl} .`;
			var keyPath = path.join(process.cwd(), 'deploy.key');
			var sshAgent = `ssh-agent bash -c 'ssh-add ${keyPath}'`;
			console.log('ssh set-up',sshAgent)
			gitClone = `${sshAgent};${gitClone}`;
		}

		await exec(`rm -rf ${basePath}; echo 1`);

		await exec(`mkdir ${basePath}; cd ${basePath}; ${gitClone}`);
		cache.basePath = basePath;
	}
}

async function exec(command, options = {}){
	console.log('Exec: ',command)
	let sub = execa.command(command, {
		shell: true
	});
	sub.stdout.pipe(process.stdout)
	sub.stderr.pipe(process.stderr)
	try{
		return await sub
	}catch(err){
		console.log("CATCH", options)
		if(options.ignoreErrors){
			return null
		}
		throw err
	}
	
}

async function gitExecIgnoreErrors(command){
	return gitExec(command,{
		ignoreErrors:true
	})
}

async function gitExec(cmd, options = {}) {
	await prepare();
	var userSet = `cd ${cache.basePath}; git config user.name 'robot'; git config user.email 'noreply@robot.com'`;
	await exec(`cd ${cache.basePath};${userSet};${cmd}`, options);
}

async function deploy(options = {}) {
	await gitExec(`rm node_modules; ln -s ${path.join(process.cwd(), 'node_modules')} node_modules;`)
	await gitExec(`git reset HEAD --hard`);
	await gitExec('git fetch');
	await gitExecIgnoreErrors(`git branch -D master`);
	await gitExecIgnoreErrors(`git checkout -b  master origin/dev`);
	await gitExec('git checkout master');
	await gitExec('git pull origin dev');
	await exec(`cd ${cache.basePath}/docs; cp -R ${process.cwd()}/docs/* .`);
	await gitExec(`git add --force docs/.; git commit -m 'docs updated'`);
	await gitExec(`git push origin master:master --force`);
}
