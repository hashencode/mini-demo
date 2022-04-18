<h1 align="center">Mini Image</h1>

<div align="center">适用于微信小程序的图片优化方案</div>

## 🎉 特性

- 结合网络状况、设备条件获取图片质量最优解

- 支持图片渐进加载

- 支持进入视口时加载，移出视口时销毁

## 🔨 使用

1. 将库中`component/mini-image`路径下的 mini-image 组件拷贝至你的项目中

2. 替换`YOUR_OSS_DOMAIN`成你的OSS域名，将`YOUR_OSS_IMAGE`替换成一张可访问的存储在OSS内的图片地址

3. 在 app.json 文件中全局引入 mini-image：
   
   ```json
   {
     "usingComponents": {
       "mini-image": "{{your_path}}/mini-image/index"
     }
   }
   ```

4. 在 wxml 中使用 mini-image：
   
   ```html
   <mini-image src={{imageSrc}}></mini-image>
   ```

## ⚙️ 配置项

*以下配置项均为非必填项

| 属性                  | 说明                              | 类型      | 默认值      |
| ------------------- | ------------------------------- | ------- | -------- |
| mode                | 同官方图片裁剪、缩放的模式                   | String  | widthFix |
| width               | 图片容器的宽度，单位rpx                   | String  | 300      |
| class               | 图片组件类名                          | String  | -        |
| style               | 图片组件行内样式                        | String  | -        |
| containerClass      | 图片容器类名                          | String  | -        |
| containerStyle      | 图片容器行内样式                        | String  | -        |
| imageClass          | 图片类名                            | String  | -        |
| imageStyle          | 图片行内样式                          | String  | -        |
| lazyLoad            | 同官方懒加载                          | Booelan | true     |
| interlace           | 渐进加载，优先加载一张低质量的图片，原图载入完成后进行替换   | Boolean | false    |
| enterObserve        | 增设视口监听，图片进入视口时再加载               | Boolean | false    |
| leaveObserve        | 增设视口监听，离开视口时销毁图片，当外层容器无高度时，请勿使用 | Boolean | false    |
| placeholder         | 占位元素，解决外层容器没有设置高度时无法触发视口监听回调的问题 | Boolean | false    |
| showMenuByLongPress | 同官方长按操作                         | Boolean | false    |

| 事件名              | 事件描述      |
| ---------------- | --------- |
| onError          | 图片加载完成回调  |
| onLoad           | 图片加载失败回调  |
| onThumbnailLoad  | 缩略图加载完成回调 |
| onThumbnailError | 缩略图加载失败回调 |
