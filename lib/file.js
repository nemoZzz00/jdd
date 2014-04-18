/**
 * @file
 */
var fs = require('fs');

var f = module.exports = {
	exists:fs.existsSync || pth.existsSync,
	isFile : function(path){
		return this.exists(path) && fs.statSync(path).isFile();
	},
	isDir : function(path){
		return this.exists(path) && fs.statSync(path).isDirectory();
	},
	isWin : process.platform.indexOf('win') === 0,
	realpath : function(path){
		if(path && f.exists(path)){
			path = fs.realpathSync(path);
			if(this.isWin){
				path = path.replace(/\\/g, '/');
			}
			if(path !== '/'){
				path = path.replace(/\/$/, '');
			}
			return path;
		} else {
			return false;
		}
	},
	filter:function(source, include, exclude){
		var filterTag = true;
		if (include) {
			var reg = new RegExp(include+'$', 'gm');
			var regResult = reg.exec(source);
			if (!regResult) {
				filterTag = false;
			}
		}

		if (exclude) {
			var reg = new RegExp(exclude+'$', 'gm');
			var regResult = reg.exec(source);
			if (regResult) {
				filterTag = false;
			}
		}

		return filterTag;
	}
}

f.getdirlist = function(source, include, exclude){
	var _this = this;
	var result = [];
	//var source = f.realpath(source);
	if(source){
		if(f.isDir(source)){
			fs.readdirSync(source).forEach(function(name){
				result = result.concat( _this.getdirlist(source + '/' + name, include, exclude) );
			});
		} else if(f.isFile(source) && f.filter(source, include, exclude)){
			result.push(source.replace("//","/"));
		}
	}
	return result;
}