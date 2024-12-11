const hx = require('hbuilderx');
const shell = require('shelljs');
const path = require('path');
const {
	output
} = require('../utils/output')
const iconv = require('iconv-lite');
const fsExtra = require('fs-extra');

const rimraf = require('rimraf')
const fs = require('fs');


const dirname = (filePath) => path.join(__dirname, filePath);

// 生成本地APP资源
function index(param) {
	return new Promise(async (resolve, reject) => {
		try {
			const resources = param.fsPath + '/unpackage/resources'
			if (await fsExtra.existsSync(resources)) {
				await rimraf.rimrafSync(resources)
			}
			//  --host HBuilderX-extension
			const publish =
				`${ hx.env.appRoot}/cli publish --platform APP --type appResource --project ${param.projectName}` + (param
					.isExtension ? ' --host HBuilderX-extension' : '')
			const result = shell.cd(param.fsPath)
			if (result.code === 0) {
				const result3 = result.exec(publish, {
					encoding: 'base64',
					fatal: true
				}, (code, stdout, stderr) => {
					if (code == 0) {
						try {
							const value = iconv.decode(iconv.encode(stdout, 'base64'), 'gb2312')
							// output.info(value)
							output.success("正在生成本地资源")
							checkAppResource(param.fsPath, async () => {
								await copyAppResource(param.fsPath).catch(err => {
									reject(err)
								})
								resolve()
							})
						} catch (err) {
							output.error(err)
							reject(err)
						}
					} else {
						reject(`命令执行失败，错误码：${code}错误信息：${stderr}`)
					}
				})
			} else {
				reject(`命令执行失败，错误码：${result.code}错误信息：${result.stderr}`)
			}
		} catch (err) {
			reject(err)
		}
	})


}
// 判断app资源是否创建
async function checkAppResource(fsPath, clallBack) {
	try {
		const resources = fsPath + '/unpackage/resources'
		output.success(resources)
		// if (fsExtra.existsSync(resources)) {
		// 	rimraf.rimrafSync(resources)
		// }
		// do{
		// 	output.success("okok")
		// }while(!fsExtra.existsSync(resources))
		if (await fsExtra.existsSync(resources)) {
			clallBack()
			return
		}
		const id = setInterval(async () => {
			if (await fsExtra.existsSync(resources)) {
				clearInterval(id)
				clallBack()
			}else{
				output.info('资源包生成中...')
			}
		}, 2000)
		// fs.watch(resources, (eventType, filename) => {
		//    output.success("创建成功")
		// });
	} catch (err) {
		output.error(err)
	}
}

// app资源复制到项目
function copyAppResource(fsPath) {
	return new Promise(async (resolve, reject) => {
		try {

			const projectPath = dirname('../../project/HBuilder-Integrate-AS')
			const baseProjectPath = dirname('../../baseproject/HBuilder-Integrate-AS')
			if (await fsExtra.existsSync(projectPath)) {
				await rimraf.rimrafSync(projectPath)
			}
			await fsExtra.copySync(baseProjectPath, projectPath);
			
			const result = shell.ls(fsPath + '/unpackage/resources')
			// shell.rm
			if (result.code === 0) {
				const filePath = dirname('../../project/HBuilder-Integrate-AS/simpleDemo/src/main/assets/apps')
				if (await fsExtra.existsSync(filePath)) {
					await rimraf.rimrafSync(filePath)
				} else {
					await fsExtra.mkdirSync(filePath);
				}
				await copyFolder(fsPath + '/unpackage/resources', filePath).catch((err) => {
					reject(err)
				})
				resolve()
			} else {
				reject(result.stderr)
			}
		} catch (err) {
			reject(result.stderr)
		}
	})

}
// 拷贝本地APP资源
function copyFolder(sourceFolderPath, destinationFolderPath) {
	return new Promise(async (resolve, reject) => {
		try {
			await fsExtra.copySync(sourceFolderPath, destinationFolderPath);
			output.success("拷贝本地APP资源完成")
			resolve()
		} catch (err) {
			reject(err)
		}
	})

}



module.exports = index;