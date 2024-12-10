const shell = require('shelljs');
const path = require('path');
const dirname = (filePath) => path.join(__dirname, filePath);
const iconv = require('iconv-lite');
const {
	output
} = require('../utils/output')

function index() {
	return new Promise((resolve, reject) => {
		try {
			const javaPath = dirname('../../java8/jdk1.8.0_171')
			const gradlePath = dirname('../../gradle/gradle-8.5/bin')
			const shell = require('shelljs');

			// 设置JAVA_HOME环境变量
			shell.env.JAVA_HOME = javaPath //'C:\\Program Files\\Java\\jdk-11.0.8+10';

			// 设置CLASSPATH环境变量
			shell.env.CLASSPATH = '.;' + shell.env.JAVA_HOME + '\\lib\\dt.jar;' + shell.env.JAVA_HOME +
				'\\lib\\tools.jar;';

			// 设置PATH环境变量（添加Java的bin目录到PATH）
			shell.env.PATH = shell.env.JAVA_HOME + '\\bin;' + shell.env.PATH;
			// shell.config.execOptions = {
			// 	silent: false,
			// 	async: true
			// };

			// output.info(JSON.stringify(shell.config))
			// 执行java -version命令
			const result = shell.exec('java -version', {
				silent: false
			});

			if (result.code !== 0) {
				console.error('执行java -version命令失败，错误码:', result.code);
				console.error('错误输出:', result.stderr);
				reject(result.stderr)
			} else {
				// 接着执行gradle -v命令，注意这里路径的写法，要按照Windows的路径格式来准确书写C:\\D\\code\\BuildApp\\gradle\\gradle-8.5\\bin
				const resultGradle = shell.exec(gradlePath + '\\gradle -v', {
					silent: false
				});
				if (resultGradle.code !== 0) {
					console.error('执行gradle -v命令失败，错误码:', resultGradle.code);
					console.error('错误输出:', resultGradle.stderr);
					reject(resultGradle.stderr)
				} else {
					console.log('Gradle版本命令执行成功，输出:', resultGradle.stdout);
					output.success(resultGradle.stdout)
					resolve('ok')
				}
			}
		} catch (e) {
			output.error(e)
			reject(e)
		}
	})

}

module.exports = index;