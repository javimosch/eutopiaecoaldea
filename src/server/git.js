const tempDir = require('temp-dir');
const sander = require('sander');
const fs = require('./fs');
const exec = fs.execSync;
const rimraf = fs.rimraf;
const path = require('path');
const shortid = require('shortid');

var cache = {
	basePath: '',
	syncedBranch: 'latest'
}

module.exports = {
	gitFilePath,
	sync,
	deployAll,
	deploy,
	pushPath,
	getPath
}

function getPath() {
	prepare();
	sync();
	return cache.basePath;
}

function gitFilePath(p) {
	var gitPath = getPath();
	return path.join(gitPath, p)
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
		var gitClone = '';

		if (process.env.AUTH_REPO_URL) {
			//user and password in http url method
			gitClone = `git clone ${process.env.AUTH_REPO_URL} .`;
		} else {
			//ssh key method
			gitClone = `git clone git@github.com:javimosch/utopia-ecoaldea.git .`;
			var keyPath = path.join(process.cwd(), 'deploy.key');
			var sshAgent = `ssh-agent bash -c 'ssh-add ${keyPath}'`;
			gitClone = `${sshAgent};${gitClone}`;
		}

		exec(`rm -rf ${basePath}; echo 1`)
		exec(`mkdir ${basePath}; cd ${basePath}; ${gitClone}`);
		cache.basePath = basePath;
	}
}

function gitExec(cmd) {
	prepare();
	var userSet = `cd ${cache.basePath}; git config user.name 'robot'; git config user.email 'noreply@robot.com'`;
	return exec(`cd ${cache.basePath};${userSet};${cmd}`);
}



function writeFiles(files) {
	prepare();
	if (files && files.length > 0) {
		files.forEach(file => {
			var writePath = path.join(cache.basePath, file.path);
			console.log('git writeFile', writePath);
			sander.writeFileSync(writePath, file.contents, {
				encoding: 'utf8',
				flag: 'w'
			});
		});
	}
}
function unlinkFiles(filePaths) {
	if (filePaths && filePaths.length > 0) {
		prepare();
		filePaths.forEach(filePath => {
			var unlinkPath = path.join(cache.basePath, filePath);
			console.log('git unlinkFile', unlinkPath);
			sander.unlinkSync(unlinkPath);
		});
	}
}

function sync() {
	console.log('git sync');
	console.log('git sync: checkout latest');
	gitExec(`git reset HEAD --hard; git rebase --abort; echo 1`);
	gitExec('git fetch');
	gitExec(`git branch -D temp;git branch -m temp; git branch -D latest;git checkout ${cache.syncedBranch}; git branch -D temp`);
	report();
}

function pushPath(gitPaths, options = {}) {
	if (!gitPaths) {
		return console.error('pushPath: gitPaths required')
	}

	console.log('git pushPath: sync')
	sync();
	unlinkFiles(options.unlink);
	writeFiles(options.files);
	var adds = '';
	if (!(gitPaths instanceof Array)) {
		gitPaths = [gitPaths];
	}
	console.log('git pushPath: adds...')
	adds = gitPaths.map(singlePath => `git add ${singlePath}`).join(';')
	gitExec(`${adds}`);

	var branch = options.branch || 'latest';
	console.log('git pushPath: commit and push')
	gitExec(`git commit -m 'pushPath commit'; git push origin ${cache.syncedBranch}:${branch} --force`);
	report();
}

function deployAll() {
	//This will deploy to production (github) and heroku.
	//WARNING: run deployAll using API to avoid overflow
	deploy({
		branches: ['master']
	});
}

function deploy(options = {}) {

	gitExec(`rm node_modules; ln -s ${path.join(process.cwd(),'node_modules')} node_modules;`)

	sync();

	console.log('git deploy: build, add, commit..');
	gitExec(`yarn build; git add docs/*; git commit -m 'build'`)

	console.log('git deploy: deploying...')
	var branches = options.branches || ['master'];
	var pushCmd = branches.map(branch => `git push origin ${cache.syncedBranch}:${branch} --force`).join(';');
	gitExec(`${pushCmd}`);
	report();
}

function report() {
	gitExec('git status');
	console.log('git waiting !');
}