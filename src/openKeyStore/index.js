const shell = require('shelljs');
const path = require('path');
const dirname = (filePath) => path.join(__dirname, filePath);
const iconv = require('iconv-lite');
const hx = require('hbuilderx');
const {
	output
} = require('../utils/output')

function index(path, storepass) {
	return new Promise((resolve, reject) => {
		try {
			const javaPath = dirname('../../java17/jbr-17.0.12')
			const gradlePath = dirname('../../gradle/gradle-8.5/bin')
			shell.env.JAVA_HOME = javaPath //'C:\\Program Files\\Java\\jdk-11.0.8+10';

			// 设置CLASSPATH环境变量
			shell.env.CLASSPATH = '.;' + shell.env.JAVA_HOME + '\\lib\\dt.jar;' + shell.env.JAVA_HOME +
				'\\lib\\tools.jar;';

			// 设置PATH环境变量（添加Java的bin目录到PATH）
			shell.env.PATH = shell.env.JAVA_HOME + '\\bin;' + shell.env.PATH;
			const str = `keytool -list -v -keystore ${path} -storepass ${storepass}`
			const result = shell.exec(str, {
				encoding: 'base64'
			}, (code, stdout, stderr) => {
				if (code == 0) {
					const cleanValue = iconv.decode(iconv.encode(stdout, 'base64'), 'gb2312')
					// hx.env.clipboard.writeText(cleanValue);
					// hx.window.showInformationMessage('证书信息已复制到剪切板');
					showView(cleanValue,path)
				} else {
					// hx.window.showInformationMessage('请检查证书密钥是否正确!');
					reject('请检查证书及密钥是否正确!')
				}
			})
		} catch (e) {
			output.error(e)
			reject(e)
		}
	})

}

function showView(text,path) {
	hx.window.showFormDialog({
		formItems: [{
			type: "textEditor",
			name: "paramsInput",
			title: "内容",
			languageId: "text",
			text: text
		}],
		title: "证书信息",
		subtitle: '\n'+path,
		width: 1200,
		height: 700,
		hideFooter:true,
		submitButtonText: "提交(&S)",
		cancelButtonText: "关闭(&C)",
		onOpened: function() {},
		onChanged: function(field, value) {}
	}).then((res) => {
		console.log("返回结果：", JSON.stringify(res));
	});

}

module.exports = index;