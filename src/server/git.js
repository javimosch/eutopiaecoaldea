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
	pushPath,
	getPath: ()=>{
		prepare();
		return cache.basePath;
	}
}

function pullCurrent(){
	console.log('git pullCurrent: pull and rebase working directory with latest changes...');
	var basePath = process.cwd();
	exec(`cd ${basePath}; git stash; git pull --rebase origin master; git stash pop`);
}

function unlinkUnusedGitDirs(){
	var folders = sander.readdirSync(tempDir);
	folders = folders.filter(folder=>folder.indexOf('git_')!==-1);
	if(folders.length>0){
		folders.forEach(folder=>{
			var removePath = path.join(tempDir,folder);
			rimraf(removePath,tempDir);
		});
		console.log('unlinkUnusedGitDirs: ',{
			dirs: folders
		});
	}
}

function prepare() {
	if (!cache.basePath) {
		unlinkUnusedGitDirs();
		var basePath = path.join(tempDir, 'git_'+shortid.generate());
		var gitClone = `git clone git@github.com:javimosch/utopia-ecoaldea.git .`;
		exec(`mkdir ~/.ssh; cd ~/.ssh; cp ${path.join(process.cwd(),'deploy.pub')} .; echo 1`)
		exec(`rm -rf ${basePath}; echo 1`)
		exec(`mkdir ${basePath}; cd ${basePath}; ${gitClone}`)
		cache.basePath = basePath;
	}
}

function pushPath(gitPath) {
	if (!gitPath) {
		return console.error('pushPath: gitPath required')
	}
	prepare();
	var basePath = cache.basePath;
	exec(`cd ${basePath}; git reset HEAD --hard; git pull origin master`);
	exec(`cd ${basePath}; git checkout master; git add ${gitPath}`);
	exec(`cd ${basePath}; git commit -m 'pushPath commit'; git push origin master`);
	if(process.env.NODE_ENV==='production'){
		pullCurrent();
	}
}