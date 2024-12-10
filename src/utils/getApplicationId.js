function index(appid){
	const arr = appid.split('__');
	return `uni.UNI${arr[arr.length-1]}`
}
module.exports = index;