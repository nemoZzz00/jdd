/**
 * @js doc
 * @update 2013-11-6 11:52:21; 2014-4-12 22:30
 */

/**
 * @依赖
 */
//origin
var path = require('path');
var fs = require('fs');
//outer
var ejs = require('ejs');
var markdown = require('github-flavored-markdown').parse;
//lib
var dox = require('./lib/dox.js');
var f = require('./lib/file.js');

/**
 * @定义
 */
var configFileName = "package.json";
var changelogFileName = "changelog.md";
var readmeFileName = "readme.md";
var configObj;


exports.init = function(){
	var argv = process.argv;
	var demosource, target='output', apisource;
	
	var configFile = fs.realpathSync('.')+'/'+configFileName;
	if (fs.existsSync(configFileName)) {
		try {
			configObj = require(configFile, 'utf8');
		} catch (e) {
			console.log(e);
		}
	}else {
		console.log('jdd error '+configFileName+' not extist');
		return;
	}
	
	//读取配置文件
	if (configObj.apisource) apisource = configObj.apisource;
	if (configObj.demosource)  demosource = configObj.demosource;
	if (configObj.target) target = configObj.target;

	if (fs.existsSync(demosource) || fs.existsSync(apisource)) {
		//apisource = path.join(fs.realpathSync('.'), apisource);
		target = path.join(fs.realpathSync('.'), target);		
		if (!fs.existsSync(target)) fs.mkdirSync(target, '0777');
		
		buildReadme(target);
		createJsDoc(apisource, target);
		buildDemo(demosource, target);
		buildChangelog(target);
	}else {
		if(!fs.existsSync(demosource)) console.log( 'demo source is not exists');
		if(!fs.existsSync(apisource)) console.log( 'api source is not exists');
	}
}

/**
 * @ejs file write
 */
var ejsFileWrite = function(source, target, data){
	//ejs include需要设置 filename
	var filename = path.join(__dirname, source);
	data.filename = filename;

	var demoTemplate = fs.readFileSync( filename, 'utf8');
	var demoHtml = ejs.render(demoTemplate, data);
	
	var targetfilename = path.normalize(target);
	fs.writeFileSync(targetfilename, demoHtml, 'utf8');
	console.log('Create ['+targetfilename+'] done!');
}

/**
 * @get js api data
 */
var getApiData = function(source){
	 var result = {};

	//获取单独个文件的注释
	var getFileComment = function(item){
		var apis = {};
		var basename = path.basename(item, '.js');

		var buf = fs.readFileSync(item, 'utf8');
		var obj = dox.parseComments(buf, {});
		obj.parseTag = dox.parseTag(buf, {});
		apis[basename] = {
			comments: obj,
			basename: basename
		};
		return apis;
	}

	 // ['./a.js'] 文件数组格式
	source.forEach(function(item){
		//console.log(item);
		var dirItem = getFileComment(item);
		for ( var i in dirItem ){
			result[i] = dirItem[i];
		}
	});
	return result;
}

/**
 * @生成JS文档
 */
function createJsDoc(source, target){
	var source = f.getdirlist(source,'js$');

	var obj = configObj;
	//description markdown转换成html
	if (obj.api.description) {
		obj.api.description = markdown(obj.api.description);
	}

	obj.date = new Date();
	obj.apis = getApiData(source, null);

	ejsFileWrite('/template/api.html', target+'/api.html', obj);
	//fs.writeFileSync(target +'/api.json', JSON.stringify(obj, null, 2), 'utf8');
}


/**
 * @build demo
 */
var buildDemo = function (source, target){
	var source = f.getdirlist(source,'html$');
	var menuData = '';
	var obj = {};

	source.forEach(function(item){
	 	var basename = path.basename(item);
	 	var dirname = path.dirname(item);
		if (!obj[dirname]) {
			obj[dirname] = [];
		}
		obj[dirname].push(item);
	});

	//console.log(obj);

	for (var i in obj  ){
		var li = '<li>';

		obj[i].forEach(function(item){
			var basename = path.basename(item);
			var data_url = basename.replace('.html','');
			
			var c = fs.readFileSync(item, 'utf8');
			var reg = new RegExp('<title>(.*?)</title>','gm');
			if ( c.match(reg) ){
				c = c.match(reg)[0];
				c = c.replace(/<\/?[^>]*>/g,'');
			}else{
				c="";
			}
			
			//链接前缀
			item = typeof configObj.demopathprefix == 'undefined' ? '' : configObj.demopathprefix + item;
			var url = path.normalize(item);
			//url = url.replace(/jdj\\/g,''); 
			url = url.replace(/\\/g,'/'); 
			
			li += '<a class="demo" href="'+url+'" data-name="'+c+'" data-url="'+data_url+'">'+c+'</a>';
		});

		if (li != '<li>') {
			li +='</li>';
		}else {
			li = '';
		}
		menuData+=li;
	}

	//console.log(html); menuData
	menuData = "var menuData='"+menuData+"';";
	
	var obj = configObj;
	obj.menuData = menuData;
	obj.menu = 'demo';
	ejsFileWrite('/template/demo.html', target+'/demo.html', obj);
}

/**
 * @build changelog
 */
var buildChangelog = function (target){
	var changelog = fs.realpathSync('.')+'/'+changelogFileName;
	if (fs.existsSync(changelog)) {
		var data = fs.readFileSync(changelog, 'utf8');
		var obj = configObj;
		obj.changelog =  markdown(data);
		obj.menu = 'changelog';
		ejsFileWrite('/template/changelog.html', target+'/changelog.html', obj);
	}
};

/**
 * @build readme
 */
var buildReadme = function (target){
	var readme = fs.realpathSync('.')+'/'+readmeFileName;
	if (fs.existsSync(readme)) {
		var data = fs.readFileSync(readme, 'utf8');
		var obj = configObj;
		obj.readme =  markdown(data);
		obj.menu = 'readme';
		ejsFileWrite('/template/readme.html', target+'/index.html', obj);
	}
};
