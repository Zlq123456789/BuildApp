
1、android 要在dcloud_uniplugins.json注册
2、缺少ndk 配置模板
```groovy
ndk {
		abiFilters 'x86'
```
3、android原生插件  android ->libs 缺少
}



#### 更新说明
访问github地址，拉取到编辑器插件目录，==HBuilderX/plugins== 后续有更新可以直接拉去最新版本即可

地址: [Github](https://github.com/Zlq123456789/BuildApp)

欢迎 Star


---
#### 使用说明 

1、将插件放置到编辑器插件目录 ==HBuilderX/plugins==

2、重启编辑器

3、项目上右键 找到 **本地构建APP**，点击

4、去配置 APP Key 信息，拿到appKey，填写上证书信息即可开始打包



截图见 [README](https://github.com/Zlq123456789/BuildApp/blob/main/README.md) 

*如果gitHub访问不了，推荐 [Watt Toolkit](https://steampp.net/) 可免费加速GitHub*



---

#### 常见问题
运行报错： **未配置appkey或者配置错误**


    1、配置appKey时，填写的包名与打包时填写的包名不一致导致
    2、打包时，使用的证书与appKey使用的证书不一致
    3、检查appKey是否正确

---

#### 需求和bug

请提 [issues](https://github.com/Zlq123456789/BuildApp)

