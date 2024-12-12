const shell = require('shelljs');
const path = require('path');
const iconv = require('iconv-lite');
const fsExtra = require('fs-extra');
const dirname = (filePath) => path.join(__dirname, filePath);
const {
	output
} = require('../utils/output')
const projectPath = dirname('../../project/HBuilder-Integrate-AS')
const gradlePath = dirname('../../gradle/gradle-8.5/bin')

function index(params) {
	return new Promise((resolve, reject) => {
		const result = shell.cd(projectPath)
		if (result.code === 0) {
			output.success("gradle clean...")
			shell.exec(`${gradlePath}/gradle clean`, {
				encoding: 'base64'
			}, (code, stdout, stderr) => {
				const cleanValue = iconv.decode(iconv.encode(stdout, 'base64'), 'gb2312')
				// output.info(cleanValue)
				output.success("gradle assembleRelease...")
				output.info("如果集成了第三方原生插件需要安装依赖，可能较慢")
				try {
					shell.exec(`${gradlePath}/gradle assembleRelease`, {
						encoding: 'base64',
					}, async (code, stdout, stderr) => {
						if (code == 0) {
							const value = iconv.decode(iconv.encode(stdout, 'base64'), 'gb2312')
							const appPath = dirname(
								'../../project/HBuilder-Integrate-AS/simpleDemo/build/outputs/apk/release/simpleDemo-release.apk'
							)
							await copyFolder(appPath, params.fsPath + '/unpackage/release', params).catch(err => {
								reject(err)
							})
							resolve()
						} else {
							const value = iconv.decode(iconv.encode(stderr, 'base64'), 'gb2312')
							// output.info(`cd: ${shell.exec('cd').stdout}`)
							output.error(`命令执行失败，错误码：${code}错误信息：${value}`)
							reject(value)
						}
					})
				} catch (error) {
					output.error(error)
					reject(error)
				}
			})

		} else {
			console.error('命令执行失败，错误码：', result.code, '，错误信息：', result.stderr);
			reject(result.stderr)
		}

	})



}

function copyFolder(sourceFolderPath, destinationFolderPath, params) {
	return new Promise(async (resolve, reject) => {
		try {
			if (await fsExtra.existsSync(destinationFolderPath)) {
				await fsExtra.removeSync(destinationFolderPath);
			}
			await fsExtra.mkdirSync(destinationFolderPath);
			setTimeout( _=>{
				fsExtra.copySync(sourceFolderPath, destinationFolderPath + '/' + params.projectName + '.apk');
				output.success("导出完成: " + destinationFolderPath + '/' + params.projectName + '.apk')
				shell.exec(`${gradlePath}/gradle clean`)
				resolve()
			},500)
		} catch (err) {
			output.error('导出: ' + err)
			reject('导出: ' + err)
		}
	})

}
module.exports = index;