/**
 * @jdd
 * @update 2013-11-6 11:52:21; 2014-4-12 22:30; 2014-4-24 11:18:47
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
var indexFileName = "index.md";
var styleFileName = "style.css";
var styleFilePath = path.join(__dirname, "/template/"+styleFileName);
var configObj;

/**
 * @init
 */
exports.init = function(){
	var argv = process.argv;
	var cmd2 = argv[2];
	
	if ( cmd2 == 'build' ){
		buildInit();
	}else if(cmd2 == '-v' || cmd2 == '-version'){
		var package = require(path.join(__dirname, "package.json"));
		console.log(package.version);
	}else{
		var content = [];
		content = content.concat([
		    '',
		    '  Command:',
		    '',
		  	'    build  	build project',		
		    '    -v      	jdd version',
			''
		]);
		console.log(content.join('\n'));
	}
}

/**
 * @build init
 */
var buildInit = function (){
	var demosource,docsource,favicon, target='output', apisource;
	
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
	if (configObj.docsource)  docsource = configObj.docsource;
	if (configObj.favicon)  favicon = configObj.favicon;

	if (configObj.target) target = configObj.target;

	target = path.join(fs.realpathSync('.'), target);		
	if (!fs.existsSync(target)) fs.mkdirSync(target, '0777');
	
	if (fs.existsSync(docsource)) configObj.hasmd = true;
	if (fs.existsSync(fs.realpathSync('.')+'/'+indexFileName))  configObj.hasIndex = true;
	if (fs.existsSync(fs.realpathSync('.')+'/'+changelogFileName)) configObj.hasChangelog = true;
	if (fs.existsSync(apisource)) configObj.hasApi = true; 
	if (fs.existsSync(demosource)) configObj.hasDemo = true;

	styleFileWrite(target);
	buildMd(indexFileName, target);
	buildMd(changelogFileName, target);

	if (fs.existsSync(apisource)) buildApi(apisource, target);
	if (fs.existsSync(demosource)) buildDemo(demosource, target);
	if (fs.existsSync(docsource)) mdDir(docsource, target); 
}

/**
 * @style file write
 */
var styleFileWrite = function(target){
	var source = fs.readFileSync( styleFilePath, 'utf8');
	fs.writeFileSync(target+styleFileName, source, 'utf8');
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
 * @build Api
 */
function buildApi(source, target){
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
 * @build md
 */
var buildMd = function (filename, target, prefix, mdlist){
	var filename = filename.replace('.md', '');
	var realSource = fs.realpathSync('.')+'/'+filename+'.md';
	filename = path.basename(filename);
	if (fs.existsSync(realSource)) {
		var data = fs.readFileSync(realSource, 'utf8');
		var obj = configObj;
		obj.md =  markdown(data);
		obj.menu = filename;
		obj.prefix = prefix;
		obj.mdlist = mdlist;
		var target = path.normalize( target+filename+'.html');
		var tpl  =  '/template/md.html';
		ejsFileWrite(tpl, target, obj);
	}
};

/**
 * @md dir 
 */
var mdDir = function(source, targetOrigin){
	var target = targetOrigin + source;
	if (!fs.existsSync(target)) fs.mkdirSync(target, '0777');

	console.log();

	var mdlist = [];
	fs.readdirSync(source).forEach(function(filename){
		if (/md$/.test(filename)) {
			mdlist.push( filename.replace('.md', '') );
		}
	});

	fs.readdirSync(source).forEach(function(filename){
		buildMd(source+filename, target, '../', mdlist);
	});
}