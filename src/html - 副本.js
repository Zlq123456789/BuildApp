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
                        <label for="repo-type" class="col-sm-2 col-form-label">发布类型</label>
                        <div class="col-sm-10 pt-2">
                            <input name="ptype" type="radio" class="mr-2" v-model="appInfo.publishType" value="AppStore"/>应用商店
                            <input name="ptype" type="radio" class="mr-2" v-model="appInfo.publishType" value="test"/>内测托管平台
                        </div>
                    </div>
                    <div class="form-group row m-0 mt-3">
                        <label for="repo-type" class="col-sm-2 col-form-label">发布平台</label>
                        <div class="col-sm-10 d-inline pt-2">
                            <div class="d-inline mr-1" v-for="(item,idx) in publishPlatforms" :index="idx" >
                                <input :id="item.id" name="plam" type="checkbox" class="pt-2 pr-2" :value="item.name" @change="selectPlatforms(item.id);"/> {{ item.name}}
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
                        <label for="repo-type" class="col-sm-2 col-form-label">应用名称</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control outline-none" v-model="appInfo.name" placeholder="应用名称"/>
                        </div>
                    </div>
                    <div class="form-group row m-0 mt-3">
                        <label for="git-url" class="col-sm-2 col-form-label">应用版本</label>
                        <div class="col-sm-10">
                            <div class="row">
                                <div class="col">
                                    <input type="text" class="form-control outline-none" v-model="appInfo.versionName" placeholder="versionName"/>
                                </div>
                                <div class="col">
                                    <input type="text" class="form-control outline-none" v-model="appInfo.versionCode" placeholder="versionCode"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="app-icon" class="form-group row m-0 mt-3">
                        <label for="repo-type" class="col-sm-2 col-form-label">app图标</label>
                        <div class="col-sm-10">
                            <div id="preview" class="preview" v-if="appInfo.icon">
                                <img :src="appInfo.icon" class="p-img-icon"/>
                            </div>
                            <div class="file app-icon" @click="uploadImg('icon')">
                                <svg t="1620805001511" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1184" width="45" height="45">
                                    <path
                                        d="M931.3 484.2h-382c-5.5 0-10-4.5-10-10v-382c0-15.5-12.5-28-28-28s-28 12.5-28 28v382c0 5.5-4.5 10-10 10h-382c-15.5 0-28 12.5-28 28s12.5 28 28 28h382c5.5 0 10 4.5 10 10v382c0 15.5 12.5 28 28 28s28-12.5 28-28v-382c0-5.5 4.5-10 10-10h382c15.5 0 28-12.5 28-28 0-15.4-12.5-28-28-28z"
                                        fill="#eee" p-id="1185"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="form-group row m-0 mt-3">
                        <label for="repo-type" class="col-sm-2 col-form-label">应用描述</label>
                        <div class="col-sm-10">
                            <textarea type="text" v-model="appInfo.description" placeholder="应用描述"></textarea>
                        </div>
                    </div>
                    <div id="app-screenshot" class="form-group row m-0 mt-3">
                        <label for="repo-type" class="col-sm-2 col-form-label">应用截图</label>
                        <div class="col-sm-10">
                            <div id="preview" class="preview" v-if="appInfo.screenshot">
                                <img :src="appInfo.screenshot" class="p-img-screenshot"/>
                            </div>
                            <div class="file app-screenshot" @click="uploadImg('screenshot')">
                                <svg t="1620805001511" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1184" width="45" height="45">
                                    <path
                                        d="M931.3 484.2h-382c-5.5 0-10-4.5-10-10v-382c0-15.5-12.5-28-28-28s-28 12.5-28 28v382c0 5.5-4.5 10-10 10h-382c-15.5 0-28 12.5-28 28s12.5 28 28 28h382c5.5 0 10 4.5 10 10v382c0 15.5 12.5 28 28 28s28-12.5 28-28v-382c0-5.5 4.5-10 10-10h382c15.5 0 28-12.5 28-28 0-15.4-12.5-28-28-28z"
                                        fill="#eee" p-id="1185"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="form-group row m-0 mt-3">
                        <label for="repo-type" class="col-sm-2 col-form-label">更新日志</label>
                        <div class="col-sm-10">
                            <textarea type="text" v-model="appInfo.changelog" placeholder="更新日志"></textarea>
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
                            publishType: "AppStore",
                            platforms: [],
                            name: "",
                            packageName: "",
                            versionName: "",
                            versionCode: "",
                            description: "",
                            changelog: "",
                            icon: "",
                            screenshot: ""
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
                        let {name,versionName,versionCode, description, appid } = projectData;
                        this.appInfo.name = name;
                        this.appInfo.versionName = versionName;
                        this.appInfo.versionCode = versionCode;
                        this.appInfo.description = description;
                        this.appInfo.packageName = appid;
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
                                        this.appInfo.icon = msg.data;
                                    };
                                    if (msg.imgType == 'screenshot' ) {
                                        this.appInfo.screenshot = msg.data;
                                    };
                                };
                            });
                        },
                        btnClick() {
                            hbuilderx.onDidReceiveMessage((msg)=>{
                                if(msg.type == 'DialogButtonEvent'){
                                    let button = msg.button;
                                    if(button == '开始提交'){
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
