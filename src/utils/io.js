const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { logger } = require('../../log/logger')
const { rimrafSync } = require('rimraf')

/**
 * 复制文件
 * @param sourceDir 源目录
 * @param targetDir 目标目录
 * @param pattern 匹配模式
 * @returns {Promise<void>}
 */
async function copyFilesWithGlob(sourceDir, targetDir, pattern) {
    // const files = glob.sync(path.join(sourceDir, pattern));
	const files = glob.sync(glob.escape(sourceDir) + '/' + pattern);
    if (files.length === 0) {
        logger.warn(`No files found with pattern ${pattern} in ${sourceDir}`);
        return;
    }
    // 判断目标目录是否存在，不存在则创建
    if (!fsExtra.pathExistsSync(targetDir)) {
        fsExtra.mkdirsSync(targetDir, { recursive: true })
    }
    // 清空目标目录
    // await fsExtra.emptyDir(targetDir);
    // 复制文件
    for (const file of files) {
        const targetFile = path.join(targetDir, path.basename(file));
        // await fs.copyFile(file, targetFile);
        fsExtra.copySync(file, targetFile);
    }
}

async function deleteFile (path) {
	return new Promise((resolve, reject) => {
		rimrafSync(path)
		resolve()
	})
}

module.exports = {
    copyFilesWithGlob,
	deleteFile
}
