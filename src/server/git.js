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
			gitClone = `git clone ${process.env.AUTH_REPO_URL} .`;
		}
		exec(`rm -rf ${basePath}; echo 1`)
		exec(`mkdir ${basePath}; cd ${basePath}; ${gitClone}`);
		cache.basePath = basePath;
	}
}

function pushPath(gitPath, options = {}) {
	if (!gitPath) {
		return console.error('pushPath: gitPath required')
	}
	prepare();
	var basePath = cache.basePath;
	var userSet = `cd ${basePath}; git config user.name 'robot'; git config user.email 'noreply@robot.com'`;
	exec(`cd ${basePath}; git reset HEAD --hard; ${userSet};git pull origin master`);
	exec(`cd ${basePath}; git checkout master;`);
	console.log('git pushPath',{
		options
	});
	if (options.files && options.files.length>0) {
		options.files.forEach(file => {
			var writePath = path.join(basePath, file.path);
			console.log('git pushPath: write file', writePath, file.contents);
			//exec(`rm ${writePath}; echo 1`)
			sander.writeFileSync(writePath, file.contents,{encoding:'utf8',flag:'w'});
		});
	}
	exec(`cd ${basePath}; git add ${gitPath}`);
	exec(`cd ${basePath}; git commit -m 'pushPath commit'; ${userSet};git push origin master:heroku --force`);
	//if (process.env.NODE_ENV === 'production') {
	//	pullCurrent();
	//}
}

function deploy() {
	prepare();
	var basePath = cache.basePath;
	var userSet = `cd ${basePath}; git config user.name 'robot'; git config user.email 'noreply@robot.com'`;
	console.log('git deploy: reset and pull')
	exec(`cd ${basePath}; git reset HEAD --hard; ${userSet}; git checkout heroku;git pull origin heroku`);
	exec(`cd ${basePath}; rm node_modules; ln -s ${path.join(process.cwd(),'node_modules')} node_modules;`)
	console.log('git deploy: deploying...')
	exec(`${userSet}; cd ${basePath}; yarn deploy`)
}