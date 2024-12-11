const os = require('os');
const fs = require('fs');
const path = require('path');
const hx = require('hbuilderx');
const JSONC = require('json-comments');
const Html = require('./html.js');
const {
	output
} = require('./utils/output');
const getApplicationId = require('./utils/getApplicationId.js');
const Handlebars = require('handlebars');

const buildtemplate = require('./buildtemplate/index.js');
const buildappresource = require('./buildappresource/index.js');
const buildapp = require('./buildapp/index.js');
const checkjava = require('./checkjava/index.js');
const {
	log
} = require('util');
const shell = require('shelljs');

const iconv = require('iconv-lite');

let startParams = null
let isExtension = false //是否开发模式
const fsExtra = require('fs-extra');
const dirname = (filePath) => path.join(__dirname, filePath);

/**
 * @description 打开视图
 * @param {Object} projectInfo 项目管理器选中的项目信息
 */
async function showView(param) {

	if (hx.env.appData.includes(('extensions_development'))) {
		isExtension = true
	}
	startParams = param

	// // 获取项目信息，并读取manifest.json
	let projectData = getProjectInfo(param);
	// 创建webviewDialog, 并设置对话框基本属性，包括标题、按钮等
	let webviewDialog = hx.window.createWebViewDialog({
		modal: true,
		title: "BuildApp",
		description: "",
		dialogButtons: ["开始", "关闭"],
		size: {
			width: 700,
			height: 600
		}
	}, {
		enableScripts: true
	});
	projectData.packageName = getApplicationId(projectData.appid)
	// projectData.keyAlias = 'key0'
	// projectData.storeFile = 'C:/D/code/BuildApp/project/HBuilder-Integrate-AS/simpleDemo/test.jks'
	// projectData.appKey = '2ab542f3f1ea7a25148d28ca7c7e50be'
	// projectData.keyPassword = 'aa111111'
	// 	projectData.keyAlias = 'imeshcloud'
	// 	projectData.keyPassword = 'Imeshcloud@321.'
	// 	projectData.storeFile = 'D:/code/git/weiqiao/bgos-app/imeshcloud-jdk8.keystore'
	// 	projectData.appKey = '62f34ca8cf7a136aa2df1b4b1a1f15ba'
	const projectInfoPath = dirname('project_info.json');
	if (await fsExtra.existsSync(projectInfoPath)) {
		let projectInfo = JSON.parse(fs.readFileSync(projectInfoPath, 'utf-8'))
		if (projectInfo[projectData.name]) {
			projectData.appKey = projectInfo[projectData.name].appKey
			projectData.keyPassword = projectInfo[projectData.name].keyPassword
			projectData.storeFile = projectInfo[projectData.name].storeFile
			projectData.keyAlias = projectInfo[projectData.name].keyAlias
			projectData.packageName =  projectInfo[projectData.name].packageName
		}

	}



	// 用于渲染对话框主要内容
	let webview = webviewDialog.webView;
	webview.html = Html(projectData);

	webview.onDidReceiveMessage((msg) => {
		let action = msg.command;
		console.log('action', action);
		switch (action) {
			case 'closed':
				// 关闭对话框
				webviewDialog.close();
				break;
			case 'submitApp':
				let data = msg.data;
				// 设置对话框指定按钮状态
				webviewDialog.setButtonStatus("开始提交", ["loading", "disable"]);
				submitApp(data, webviewDialog, webview);
				break;
			case 'uploadImg':
				let imgType = msg.data;
				selectImg(imgType, webviewDialog, webview);
				break;
			default:
				break;
		};
	});

	// 显示对话框，返回显示成功或者失败的信息，主要包含内置浏览器相关状态。
	let promi = webviewDialog.show();
	promi.then(function(data) {
		console.log(data)
	}).catch(err => {
		console.log(err);
	})
};


async function saveProjectInfo(params) {
	const projectInfoPath = dirname('project_info.json');
	let projectInfo = {}
	if (await fsExtra.existsSync(projectInfoPath)) {
		projectInfo = JSON.parse(fs.readFileSync(projectInfoPath, 'utf-8'))
	}
	await fsExtra.writeJsonSync(projectInfoPath, {
		...projectInfo,
		[params.name]: params
	})
}

/**
 * @description 提交应用
 * @param {Object} appInfo
 * @param {Object} webviewDialog
 * @param {Object} webview
 */
async function submitApp(appInfo, webviewDialog, webview) {
	try {
		let {
			appKey,
			keyAlias,
			keyPassword,
			name,
			packageName,
			storeFile,
			versionCode,
			versionName
		} = appInfo;

		if (!appKey || !keyAlias || !keyPassword || !name || !packageName || !storeFile || !versionCode || !versionName) {
			webviewDialog.setButtonStatus("开始提交", []);
			let emsg = '所有信息必填，不能为空';
			webviewDialog.displayError(emsg);
			return
		}
		saveProjectInfo({
			appKey,
			keyAlias,
			keyPassword,
			name,
			packageName,
			storeFile,
			versionCode,
			versionName
		})
		if (startParams == null) return
		webviewDialog.close();
		setTimeout(() => {

			let projectData = getProjectInfo(startParams);
			projectData.dcloud_appkey = appKey
			projectData.keyPassword = keyPassword
			projectData.storeFile = storeFile
			projectData.keyAlias = keyAlias
			projectData.packageName = packageName
			new Promise(async (resolve, reject) => {
				// 检查环境
				output.success("检查环境...")
				await checkjava().catch(err => {
					output.error(err)
					throw new Error(err)
				})
				output.success("环境通过")


				// 生成本地打包APP资源
				output.success("生成本地APP资源: " + startParams.workspaceFolder.name)
				await buildappresource({
					fsPath: startParams.fsPath,
					projectName: startParams.workspaceFolder.name,
					isExtension: isExtension
				}).catch(err => {
					output.error(err)
					throw new Error(err)
				})
				output.success("生成本地APP资源完成")


				// 构建模板
				output.success("开始构建模板数据...")
				await buildtemplate(projectData, startParams).catch((err) => {
					output.error(err)
					throw new Error(err)
				})
				output.success("构建模板数据完成")


				output.success("正在编译中...")
				// // 开始构建
				await buildapp({
					fsPath: startParams.fsPath,
					projectName: startParams.workspaceFolder.name
				}).catch(err => {
					output.error(err)
					throw new Error(err)
				})
				output.success("APP打包完成")
			})

		},1000)
	} catch (err) {
		output.error(err)
	}
};


/**
 * @description 获取项目信息，并读取manifest.json
 * @param {Object} projectInfo
 */
function getProjectInfo(projectInfo) {
	let data = {};

	data.projectName = projectInfo.workspaceFolder.name;
	data.projectType = projectInfo.workspaceFolder.nature;
	data.projectPath = projectInfo.workspaceFolder.uri.fsPath;
	let manifestFilePath = path.join(data.projectPath, "manifest.json");
	if (!fs.existsSync(manifestFilePath)) manifestFilePath = path.join(data.projectPath + '/src', "manifest.json");

	if (["App", 'UniApp_Vue', "Wap2App"].includes(data.projectType) && fs.existsSync(manifestFilePath)) {
		let manifest = fs.readFileSync(manifestFilePath, 'utf-8');

		try {
			// let {
			// 	name,
			// 	description,
			// 	versionName,
			// 	versionCode,
			// 	appid
			// } = JSONC.parse(manifest);
			// data.name = name;
			// data.description = description;
			// data.versionName = versionName;
			// data.versionCode = versionCode;
			// data.appid = appid;
			// console.log(JSONC.parse(manifest));
			data = JSONC.parse(manifest)
		} catch (e) {
			console.error(e);
		}
	};
	return data;
};


/**
 * @description 选择图片
 * @param {Object} webviewDialog
 * @param {Object} webview
 */
function selectImg(imgType, webviewDialog, webview) {
	let files = hx.request("window.showFileDialog", {
		title: '请选择需要上传的图片',
		filter: "Images (*.jks *.keystore)",
		supportMulti: false
	})
	files.then(selections => {
		if (selections.length) {
			console.log('imgType', imgType, selections[0]);
			webview.postMessage({
				"command": "img",
				"imgType": imgType,
				"data": selections[0]
			})
		}
	});
};

module.exports = showView;