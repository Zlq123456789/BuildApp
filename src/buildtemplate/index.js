const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const fsExtra = require('fs-extra');
const xml2js = require('xml2js')
const getApplicationId = require('../utils/getApplicationId.js');
const {
	output
} = require('../utils/output');

const appBuildGradleDefault = {
	minSdkVersion: 21,
	targetSdkVersion: 28
}
const dirname = (filePath) => path.join(__dirname, filePath);

function index(params, workspaceFolder) {
	return new Promise(async (resolve, reject) => {
		// params.dcloud_appkey = '2ab542f3f1ea7a25148d28ca7c7e50be'
		try {
			Promise.all([
				appBuildGradle(params, workspaceFolder),
				buildSettingsGradle(params, workspaceFolder),
				buildAndroidManifest(params, workspaceFolder),
				buildDcloudControl(params),
				buildGradleProperties(),
				buildLocalProperties(),
				buildStringXml(params),
				buildIcons(params, workspaceFolder),
				buildAARLibs(params, workspaceFolder)
			]).then(() => {
				resolve()
			}).catch(err => {
				reject('构建模板数据失败')
			})
		} catch (err) {
			reject('构建模板数据失败: ' + err)
		}
	})
}

// app.build.gradle
function appBuildGradle(params, workspaceFolder) {
	return new Promise(async (resolve, reject) => {
		try {
			const {
				dependencies,
				nativePlugins
			} = getNativePluginsDependencies(params, workspaceFolder)


			const androidParams = params['app-plus'].distribute.android
			const appBuildGradle = Handlebars.compile(fs.readFileSync(dirname('../handlebars/app.build.gradle.hbs'),
				'utf-8'));
			let data = {
				applicationId: getApplicationId(params.appid),
				minSdkVersion: androidParams.minSdkVersion,
				targetSdkVersion: androidParams.targetSdkVersion,
				versionCode: params.versionCode,
				versionName: params.versionName,

				keyPassword: params.keyPassword,
				storeFile: params.storeFile.replace(/\\/g, '\\\\'),
				dcloud_appkey: params.dcloud_appkey,
				keyAlias: params.keyAlias,

				dependencies: dependencies,
				nativePlugins: nativePlugins

			}
			if (!data.minSdkVersion) data.minSdkVersion = appBuildGradleDefault.minSdkVersion
			if (!data.targetSdkVersion) data.targetSdkVersion = appBuildGradleDefault.targetSdkVersion
			const templateAppBuildGradle = appBuildGradle(data)

			const filePath = dirname('../../project/HBuilder-Integrate-AS/simpleDemo/build.gradle')
			if (await fsExtra.existsSync(filePath)) {
				await fsExtra.rmSync(filePath);
			}
			await fsExtra.writeFileSync(filePath, templateAppBuildGradle)
			resolve()
		} catch (err) {
			reject(' app.build.gradle 失败: ' + err)
		}
	})
}

// settings.gradle
function buildSettingsGradle(params, workspaceFolder) {
	return new Promise(async (resolve, reject) => {
		try {
			const settingsGradlePath = dirname('../../project/HBuilder-Integrate-AS/settings.gradle')
			const {
				dependencies,
				nativePlugins
			} = getNativePluginsDependencies(params, workspaceFolder)
			const settingsGradleHbs = Handlebars.compile(fs.readFileSync(dirname('../handlebars/settings.gradle.hbs'),
				'utf-8'));

			const content = settingsGradleHbs({
				nativePlugins
			})
			if (await fsExtra.existsSync(settingsGradlePath)) {
				await fsExtra.rmSync(settingsGradlePath);
			}
			await fsExtra.writeFileSync(settingsGradlePath, content)
			resolve()
		} catch (err) {
			reject(err)
		}
	})
}
//AndroidManifest.xml
function buildAndroidManifest(params, workspaceFolder) {
	return new Promise(async (resolve, reject) => {
		try {
			if (!params.dcloud_appkey) {
				throw "未配置离线AppKey"
			}
			// 获取插件的 permissions
			let nativePluginsPermissions = getNativePluginsPermissions(params, workspaceFolder)

			nativePluginsPermissions = nativePluginsPermissions.map(getNameFromPermission).filter(it => it != null);
			let permissions = params['app-plus'].distribute.android.permissions
			permissions = permissions.map(getNameFromPermission).filter(it => it != null);
			const appBuildGradle = Handlebars.compile(fs.readFileSync(dirname('../handlebars/AndroidManifest.xml.hbs'),
				'utf-8'));
			const androidManifest = appBuildGradle({
				dcloud_appkey: params.dcloud_appkey ?? '',
				permissions: await Promise.all(permissions),
				nativePluginsPermissions: await Promise.all(nativePluginsPermissions),
			})
			const filePath = dirname('../../project/HBuilder-Integrate-AS/simpleDemo/src/main/AndroidManifest.xml')
			if (await fsExtra.existsSync(filePath)) {
				await fsExtra.rmSync(filePath);
			}
			await fsExtra.writeFileSync(filePath, androidManifest, 'utf8')
			resolve()
		} catch (err) {
			output.error('AndroidManifest.xml 失败: ' + err)
			resolve('AndroidManifest.xml 失败: ' + err)
		}
	})

}

async function getNameFromPermission(permission) {
	const item = (new Promise(async (resolve, reject) => {

		const parser = new xml2js.Parser({
			explicitArray: false
		});
		parser.parseString(permission, (err, result) => {
			if (err == null) {
				const key = Object.keys(result)[0]
				resolve({
					tag: key,

					attrs: result[key]['$']
				})
			}
		})
	}))
	return item

	// TODO 
	// console.log('permission',permission);
	const regex = /android:name="([^"]+)"/;
	const match = permission.match(regex);
	return match ? match[1] : null;
}
// dcloud_control.xml
function buildDcloudControl(params) {
	return new Promise(async (resolve, reject) => {
		try {
			const appBuildGradle = Handlebars.compile(fs.readFileSync(dirname('../handlebars/dcloud_control.xml.hbs'),
				'utf-8'));
			const androidManifest = appBuildGradle({
				appid: params.appid
			})
			const filePath = dirname(
				'../../project/HBuilder-Integrate-AS/simpleDemo/src/main/assets/data/dcloud_control.xml')
			if (await fsExtra.existsSync(filePath)) {
				await fsExtra.rmSync(filePath);
			}
			await fsExtra.writeFileSync(filePath, androidManifest)
			resolve()
		} catch (err) {
			reject('dcloud_control.xml 失败: ' + err)
		}
	})
}

// jvm 路径
function buildGradleProperties() {
	return new Promise(async (resolve, reject) => {
		try {
			const jbr17Path = dirname('../../java17/jbr-17.0.12')
			const gradlePropertiesPath = dirname('../../project/HBuilder-Integrate-AS/gradle.properties')
			const appBuildGradle = Handlebars.compile(fs.readFileSync(dirname('../handlebars/gradle.properties.hbs'),
				'utf-8'));
			const appBuildGradleBhs = appBuildGradle({
				orgGradleJavaHome: `${jbr17Path.replace(/\\/g, '\\\\')}`
			})
			if (await fsExtra.existsSync(gradlePropertiesPath)) {
				await fsExtra.rmSync(gradlePropertiesPath);
			}
			await fsExtra.writeFileSync(gradlePropertiesPath, appBuildGradleBhs)
			resolve()
		} catch (err) {
			output.error(err)
			reject('jvm 路径 失败:' + err)
		}
	})

}
// android sdk
function buildLocalProperties() {
	return new Promise(async (resolve, reject) => {

		try {
			const androidSdkPath = dirname('../../androidsdk')
			const localPropertiesPath = dirname('../../project/HBuilder-Integrate-AS/local.properties')
			const localPropertiesHbs = Handlebars.compile(fs.readFileSync(dirname('../handlebars/local.properties.hbs'),
				'utf-8'));
			const content = localPropertiesHbs({
				sdkDir: `${androidSdkPath.replace(/\\/g, '\\\\')}`
			})
			if (fsExtra.existsSync(localPropertiesPath)) {
				fsExtra.rmSync(localPropertiesPath);
			}
			fsExtra.writeFileSync(localPropertiesPath, content)
			resolve()
		} catch (error) {
			output.error(error)
			reject('android sdk 失败: ' + error)
		}
	})

}

// string.xml
function buildStringXml(parmas) {
	return new Promise(async (resolve, reject) => {

		try {
			const stringPath = dirname('../../project/HBuilder-Integrate-AS/simpleDemo/src/main/res/values/strings.xml')
			const stringHbs = Handlebars.compile(fs.readFileSync(dirname('../handlebars/strings.xml.hbs'),
				'utf-8'));

			const content = stringHbs({
				appName: parmas.name
			})
			if (await fsExtra.existsSync(stringPath)) {
				await fsExtra.rmSync(stringPath);
			}
			await fsExtra.writeFileSync(stringPath, content)
			resolve()
		} catch (err) {
			output.error(err)
			reject('string.xml 失败: ' + err)
		}
	})
}
// icon
function buildIcons(params, workspaceFolder) {
	return new Promise(async (resolve, reject) => {

		try {
			let icons = JSON.parse(JSON.stringify(params['app-plus'].distribute.icons.android))
			if (icons && Object.keys(icons).length) {
				// params.fsPath+'/unpackage'
				// /HBuilder-Integrate-AS/simpleDemo/src/main/res/drawable/icon.png


				const projectIcon = {
					drawableIcon: dirname('../../project/HBuilder-Integrate-AS/simpleDemo/src/main/res/drawable'),
					drawableHdpiIcon: dirname(
						'../../project/HBuilder-Integrate-AS/simpleDemo/src/main/res/drawable-hdpi'), //72x72
					drawableXhdpiIcon: dirname(
						'../../project/HBuilder-Integrate-AS/simpleDemo/src/main/res/drawable-xhdpi'), //96x96
					drawableXXhdpiIcon: dirname(
						'../../project/HBuilder-Integrate-AS/simpleDemo/src/main/res/drawable-xxhdpi'), //144x144
					drawableXXXhdpiIcon: dirname(
						'../../project/HBuilder-Integrate-AS/simpleDemo/src/main/res/drawable-xxxhdpi') //192x192
				}


				for (let key in projectIcon) {
					if (await fsExtra.existsSync(projectIcon[key])) {
						await fsExtra.removeSync(projectIcon[key]);
					}
					await fsExtra.mkdirSync(projectIcon[key]);
				}
				const fsPath = workspaceFolder.fsPath + '/'
				let isExist = true
				for (let key in icons) {
					icons[key] = fsPath + icons[key]
					if (!fsExtra.existsSync(icons[key])) {
						isExist = false
					}
				}
				if (!isExist) {
					icons = {
						"hdpi": dirname('../handlebars/default/icons/72x72.png'),
						"xhdpi": dirname("../handlebars/default/icons/96x96.png"),
						"xxhdpi": dirname("../handlebars/default/icons/144x144.png"),
						"xxxhdpi": dirname("../handlebars/default/icons/192x192.png")
					}
					output.warn('未配置APP图标,使用默认图标')
				}

				Promise.all([
					copyFolder(icons.xxhdpi, projectIcon.drawableIcon + '/push.png'),
					copyFolder(icons.xxhdpi, projectIcon.drawableIcon + '/icon.png'),
					copyFolder(icons.hdpi, projectIcon.drawableHdpiIcon + '/icon.png'),
					copyFolder(icons.xhdpi, projectIcon.drawableXhdpiIcon + '/icon.png'),
					copyFolder(icons.xxhdpi, projectIcon.drawableXXhdpiIcon + '/icon.png'),
					copyFolder(icons.xxxhdpi, projectIcon.drawableXXXhdpiIcon + '/icon.png'),
				]).then(() => {
					resolve()
				}).catch(err => {
					reject('icon 失败: ' + err)
				})
				output.success("icons创建完成")
			}
		} catch (err) {
			output.error(err)
			reject('icon 失败: ' + err)

		}
	})
}



function buildAARLibs(params, workspaceFolder) {
	return new Promise(async (resolve, reject) => {
		try {
			const nativePluginsPath = `${workspaceFolder.fsPath}/nativePlugins`
			if (fsExtra.existsSync(nativePluginsPath)) {
				const libsPath = dirname('../../project/HBuilder-Integrate-AS/simpleDemo/libs')
				const nativePlugins = JSON.parse(JSON.stringify(params['app-plus'].nativePlugins))
				const list = Object.keys(nativePlugins)
				if (list.length) {
					for (var i = 0; i < list.length; i++) {
						const name = list[i]
						const path = `${workspaceFolder.fsPath}/nativePlugins/${name}/android`
						const aars = fsExtra.readdirSync(path)
						for (var k = 0; k < aars.length; k++) {
							const aarName = aars[k]
							const aarPath = `${path}/${aarName}`
							await copyFolder(aarPath, `${libsPath}/${aarName}`).catch(err => {
								reject(err)
							})
						}
						output.success(`安装插件: ${aars}`)
					}
				}
			}
			resolve()
		} catch (err) {
			console.log(err);
			reject(err)
		}
	})
}

function getNativePluginsPermissions(params, workspaceFolder) {
	try {
		const nativePluginsPath = `${workspaceFolder.fsPath}/nativePlugins`
		if (fsExtra.existsSync(nativePluginsPath)) {
			const nativePlugins = JSON.parse(JSON.stringify(params['app-plus'].nativePlugins))
			const list = Object.keys(nativePlugins)
			let permissions = []
			if (list.length) {
				for (var i = 0; i < list.length; i++) {
					const name = list[i]
					const packagePath = `${workspaceFolder.fsPath}/nativePlugins/${name}/package.json`
					const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
					permissions = permissions.concat(package['_dp_nativeplugin'].android.permissions)
				}
			}
			permissions = permissions.filter((element, index, self) => {
				return self.indexOf(element) === index;
			});
			return permissions
		}
		return []
	} catch (err) {
		console.log(err);
	}
}

function getNativePluginsDependencies(params, workspaceFolder) {
	try {
		const nativePluginsPath = `${workspaceFolder.fsPath}/nativePlugins`
		if (fsExtra.existsSync(nativePluginsPath)) {
			const nativePlugins = JSON.parse(JSON.stringify(params['app-plus'].nativePlugins))
			const list = Object.keys(nativePlugins)
			let dependencies = []
			if (list.length) {
				for (var i = 0; i < list.length; i++) {
					const name = list[i]
					const packagePath = `${workspaceFolder.fsPath}/nativePlugins/${name}/package.json`
					const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
					dependencies = dependencies.concat(package['_dp_nativeplugin'].android.dependencies)
				}
			}
			dependencies = dependencies.filter((element, index, self) => {
				return self.indexOf(element) === index;
			});
			return {
				dependencies,
				nativePlugins: list
			}
		}
		return []
	} catch (err) {
		console.log(err);
	}

}

async function copyFolder(sourceFolderPath, destinationFolderPath) {
	return new Promise(async (resolve, reject) => {
		try {
			await fsExtra.copySync(sourceFolderPath, destinationFolderPath);
			resolve()
		} catch (err) {
			output.error(err)
			reject(err)
		}
	})

}

module.exports = index;