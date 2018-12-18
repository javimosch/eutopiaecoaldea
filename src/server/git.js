const tempDir = require('temp-dir');
const sander = require('sander');
const fs = require('./fs');
const exec = fs.execSync;
const rimraf = fs.rimraf;
const path = require('path');
const shortid = require('shortid');

var cache = {
	basePath: ''
}

module.exports = {
	deployAll,
	deploy,
	pushPath,
	getPath: () => {
		prepare();
		return cache.basePath;
	}
}

function pullCurrent() {
	console.log('git pullCurrent: pull and rebase working directory with latest changes...');
	var basePath = process.cwd();
	exec(`cd ${basePath}; git stash; git pull --rebase origin master; git stash pop`);
}

function unlinkUnusedGitDirs() {
	var folders = sander.readdirSync(tempDir);
	folders = folders.filter(folder => folder.indexOf('git_') !== -1);
	if (folders.length > 0) {
		folders.forEach(folder => {
			var removePath = path.join(tempDir, folder);
			rimraf(removePath, tempDir);
		});
		console.log('unlinkUnusedGitDirs: ', {
			dirs: folders
		});
	}
}

function prepare() {
	if (!cache.basePath) {
		if (false && process.env.NODE_ENV === 'production') {
			unlinkUnusedGitDirs();
		} else {
			var folders = sander.readdirSync(tempDir);
			folders = folders.filter(folder => folder.indexOf('git_') !== -1);
			if (folders.length > 0) {
				cache.basePath = path.join(tempDir, folders[0]);
				return; // to speed up things
			}
		}
		var basePath = path.join(tempDir, 'git_' + shortid.generate());
		var gitClone = `git clone git@github.com:javimosch/utopia-ecoaldea.git .`;
		//exec(`mkdir ~/.ssh; cd ~/.ssh; cp ${path.join(process.cwd(),'deploy.pub')} .; cp ${path.join(process.cwd(),'deploy.key')} deploy; echo 1`)
		var keyPath = path.join(process.cwd(), 'deploy.key');
		var sshAgent = `ssh-agent bash -c 'ssh-add ${keyPath}'`;
		gitClone = `${sshAgent};${gitClone}`;
		if (process.env.AUTH_REPO_URL) {
			gitClone = `git clone ${process.env.AUTH_REPO_URL} .; git checkout heroku`;
		}
		exec(`rm -rf ${basePath}; echo 1`)
		exec(`mkdir ${basePath}; cd ${basePath}; ${gitClone}`);
		cache.basePath = basePath;
	}
}

function writeFiles(files) {
	if (files && files.length > 0) {
		files.forEach(file => {
			var writePath = path.join(cache.basePath, file.path);
			console.log('git writeFile',writePath);
			sander.writeFileSync(writePath, file.contents, {
				encoding: 'utf8',
				flag: 'w'
			});
		});
	}
}

function pushPath(gitPaths, options = {}) {
	prepare();

	if (!gitPaths) {
		return console.error('pushPath: gitPaths required')
	}
	var basePath = cache.basePath;
	
	var userSet = `cd ${basePath}; git config user.name 'robot'; git config user.email 'noreply@robot.com'`;
	
	exec(`cd ${basePath}; git checkout heroku;`);
	console.log('git pushPath: reset, checkout and pull')
	exec(`cd ${basePath}; ${userSet}; git reset HEAD --hard; git checkout .;git pull --rebase origin heroku; git pull --rebase origin latest`);
	writeFiles(options.files);
	var adds = '';
	if(!(gitPaths instanceof Array)){
		gitPaths = [gitPaths];
	}
	console.log('git pushPath: adds...')
	adds = gitPaths.map(singlePath=>`git add ${singlePath}`).join(';')
	exec(`cd ${basePath}; ${adds}`);
	var branch = options.branch || 'latest';
	console.log('git pushPath: commit and push')
	exec(`cd ${basePath}; git commit -m 'pushPath commit'; ${userSet};git push origin heroku:${branch} --force`);
}

function deployAll(){
	//This will deploy to production (github) and heroku.
	//WARNING: run deployAll using API to avoid overflow
	deploy({
		branches:['master','heroku']
	});
}
function deploy(options = {}) {
	prepare();
	var basePath = cache.basePath;
	var userSet = `cd ${basePath}; git config user.name 'robot'; git config user.email 'noreply@robot.com'`;
	
	exec(`cd ${basePath}; rm node_modules; ln -s ${path.join(process.cwd(),'node_modules')} node_modules;`)

	console.log('git deploy: reset, checkout and pull')
	exec(`cd ${basePath}; ${userSet}; git reset HEAD --hard; git checkout .;git pull --rebase origin heroku; git pull --rebase origin latest`);
	
	console.log('git deploy: build, add, commit..');
	exec(`cd ${basePath}; yarn build; ${userSet}; git add docs/*; git commit -m 'build'`)
	
	console.log('git deploy: deploying...')
	var branches = options.branches || ['master'];
	var pushCmd = branches.map(branch=>`git push origin heroku:${branch} --force`).join(';');
	exec(`${userSet}; cd ${basePath}; ${pushCmd}`);
}