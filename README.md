#jdd
js文档和demo快速生成

#快速入门

cmd命令行窗口下执行

	jdd

会生成首页,demo页,changelog页,api页

#建议目录结构

		demo/
		js/
		changelog.md
		package.json
		readme.md

#package.json配置详解

		{
			"name": "myjs",  //工程名
			"version": "1.0.0", //版本号
			"author": "fe", //作者
			"api": {
				"name": "jds api", //js api工程名,会显示api首页
				"description": "" //js api工程描述,同样会显示在api首页
			},
			"apisource":"js/", //js目录
			"demosource":"demo/", //demo目录
			"target":"docs/", //生成到目录
			"demopathprefix":"../" //demo页导航url前缀
		}

#package.json建议源文件

可直接复制后生成package.json

		{
			"name": "myjs",
			"version": "1.0.0",
			"author": "fe",
			"api": {
				"name": "jds api",
				"description": ""
			},
			"apisource":"js/",
			"demosource":"demo/",
			"target":"docs/",
			"demopathprefix":"../"
		}
		