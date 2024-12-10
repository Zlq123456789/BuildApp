const path = require('path');

const vueFile = path.join(path.resolve(__dirname), 'static', 'vue.min.js');
const bootstrapCssFile = path.join(path.resolve(__dirname), 'static', 'bootstrap.min.css');
const customCssFile = path.join(path.resolve(__dirname), 'static', 'custom.css');


function Html(projectData) {
    projectData = JSON.stringify(projectData)
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="${bootstrapCssFile}">
            <link rel="stylesheet" href="${customCssFile}">
            <script src="${vueFile}"></script>
        </head>
        <body>
            <div id="app" v-cloak>
                <form>
										<div class="form-group row m-0 mt-3">
												<label for="repo-type" class="col-sm-2 col-form-label">应用名称</label>
												<div class="col-sm-10">
														<input type="text" style="opacity: 0.6;" disabled class="form-control outline-none" v-model="appInfo.name" placeholder="应用名称"/>
												</div>
										</div>
                    <div class="form-group row m-0 mt-3">
                        <label for="git-url" class="col-sm-2 col-form-label">应用版本</label>
                        <div class="col-sm-10">
                            <div class="row">
                                <div class="col">
                                    <input disabled style="opacity: 0.6;" type="text" class="form-control outline-none" v-model="appInfo.versionName" placeholder="versionName"/>
                                </div>
                                <div class="col">
                                    <input disabled style="opacity: 0.6;" type="text" class="form-control outline-none" v-model="appInfo.versionCode" placeholder="versionCode"/>
                                </div>
                            </div>
                        </div>
                    </div>
										<div class="form-group row m-0 mt-3">
										    <label for="repo-type" class="col-sm-2 col-form-label">应用包名</label>
										    <div class="col-sm-10">
										        <input type="text" class="form-control outline-none" v-model="appInfo.packageName" placeholder="应用包名"/>
										    </div>
										</div>
										<div class="form-group row m-0 mt-3">
										    <label for="repo-type" class="col-sm-2 col-form-label">证书别名</label>
										    <div class="col-sm-10">
										        <input type="text"  class="form-control outline-none" v-model="appInfo.keyAlias" placeholder="证书别名"/>
										    </div>
										</div>
										<div class="form-group row m-0 mt-3">
										    <label for="repo-type" class="col-sm-2 col-form-label">私钥密码</label>
										    <div class="col-sm-10">
										        <input type="password"  class="form-control outline-none" v-model="appInfo.keyPassword" placeholder="证书私钥密码"/>
										    </div>
										</div>
										<div class="form-group row m-0 mt-3">
										    <label for="repo-type" class="col-sm-2 col-form-label">证书文件</label>
										    <div class="col-sm-10" style="display: flex;flex-direction: row;flex-wrap: nowrap;">
										        <input type="text"  class="form-control outline-none" v-model="appInfo.storeFile" placeholder="证书文件"/>
										    	<div style="flex-shrink: 0;" @click="uploadImg('icon')">选择</div>
										    </div>
										</div>
										<div class="form-group row m-0 mt-3">
										    <label for="repo-type" class="col-sm-2 col-form-label">App Key</label>
										    <div class="col-sm-10">
										        <input type="text"  class="form-control outline-none" v-model="appInfo.appKey" placeholder="离线打包配置中的AppKey"/>
										    </div>
										</div>
                </form>
            </div>
            <script>
                Vue.directive('focus', {
                    inserted: function(el) {
                        el.focus()
                    }
                });
                var app = new Vue({
                    el: '#app',
                    data: {
                        appInfo: {
                            name: "",
                            packageName: "",
                            versionName: "",
                            versionCode: "",
                        }
                    },
                    computed: {
                        publishPlatforms() {
                            let publishType = this.appInfo.publishType;
                            this.appInfo.platforms = [];
                            if (publishType == 'AppStore') {
                                return [
                                    {"id":"huawei","name": "华为"}, {"id":"yyb","name": "应用宝"}, {"id":"xiaomi","name": "小米"}, 
                                    {"id":"360","name": "360"}, {"id":"vivo","name": "vivo"}, {"id":"oppo","name": "oppo"}
                                ];
                            } else {
                                return [{"id":"fir","name": "fir.im"}, {"id":"pgyer","name": "蒲公英"}];
                            }
                        }
                    },
                    created() {
                        let projectData = ${projectData};
                        let {name,versionName,versionCode, description, appid ,packageName,keyAlias,storeFile,appKey,keyPassword} = projectData;
                        this.appInfo.name = name;
                        this.appInfo.versionName = versionName;
                        this.appInfo.versionCode = versionCode;
                        this.appInfo.description = description;
                        this.appInfo.packageName = packageName;
												this.appInfo.keyAlias = keyAlias||''
												this.appInfo.storeFile = storeFile||''
												this.appInfo.appKey = appKey||''
												this.appInfo.keyPassword = keyPassword||''
                    },
                    mounted() {
                        this.$nextTick(() => {
                            window.addEventListener('hbuilderxReady', () => {
                                this.getResult();
                                this.btnClick();
                            })
                        });
                    },
                    methods: {
                        selectPlatforms(data) {
                            let tmp = this.appInfo.platforms;
                            if (tmp.includes(data)) {
                                this.appInfo.platforms = tmp.filter(item => item != data );
                            } else {
                                this.appInfo.platforms.push(data);
                            };
                        },
                        uploadImg(imgType) {
                            hbuilderx.postMessage({
                                command: 'uploadImg',
                                data: imgType
                            });
                        },
                        getResult() {
                            hbuilderx.onDidReceiveMessage((msg) => {
                                if (msg.command == 'img') {
                                    if (msg.imgType == 'icon' ) {
                                        this.appInfo.storeFile = msg.data;
										this.$forceUpdate()
                                    };
                                    if (msg.imgType == 'screenshot' ) {
                                        this.appInfo.screenshot = msg.data;
                                    };
                                };
                            });
                        },
                        btnClick() {
                            hbuilderx.onDidReceiveMessage((msg)=>{
															console.log('msg',msg);
                                if(msg.type == 'DialogButtonEvent'){
                                    let button = msg.button;
                                    if(button == '开始'){
                                        hbuilderx.postMessage({
                                            command: 'submitApp',
                                            data: this.appInfo
                                        });
                                    } else if(button == '关闭'){
                                        hbuilderx.postMessage({
                                            command: 'closed'
                                        });
                                    };
                                };
                            });
                        }
                    }
                });
            </script>
        </body>
    </html>
`
};

module.exports = Html;
