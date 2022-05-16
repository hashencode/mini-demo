import {
  defaultConfig,
  defaultMaxWidth,
  defaultObserveOption,
  defaultPixelRatio,
  defaultWidth,
  imageServerDomain,
  networkChecker,
  suffixStart,
  thumbnailQuality,
} from './constant';

const app = getApp();

Component({
  externalClasses: ['class', 'style'],
  options: {
    addGlobalClass: true, // page样式影响组件内样式
  },
  properties: {
    // 图片地址
    src: String,
    // 图片裁剪、缩放的模式
    mode: {
      type: String,
      value: 'widthFix',
    },
    // 容器的宽度，单位rpx
    width: {
      type: Number,
      value: defaultWidth,
    },
    // 图片容器类名
    containerClass: String,
    // 图片容器行内样式
    containerStyle: String,
    // 图片类名
    imageClass: String,
    // 图片行内样式
    imageStyle: String,
    // 懒加载
    lazyLoad: {
      type: Boolean,
      value: true,
    },
    // 渐进加载
    interlace: {
      type: Boolean,
      value: false,
    },
    // 增设视口监听，图片进入视口时再加载
    enterObserve: {
      type: Boolean,
      value: false,
    },
    // 增设视口监听，离开视口时销毁图片
    leaveObserve: {
      type: Boolean,
      value: false,
    },
    // 占位元素，解决外层容器没有设置高度时无法触发视口监听回调的问题
    placeholder: Boolean,
    // 长按操作
    showMenuByLongPress: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    prevSrc: '', // 图片路径缓存
    imageSrc: '', // 带格式后缀的图片路径
    thumbnailSrc: '', // 渐进缩略图片路径
    isImageLoaded: false, // 主图片是否加载完成
    isThumbnailLoaded: false, // 缩略图片是否加载完成
    intersectionObserver: null, // 视口监听对象
    isImageVisible: true, // 是否显示主图，用于视口监听
    retryCount: 0, // 加载重试次数统计
    networkCheckTimer: null, // 网络状况检查定时器
    networkCheckCount: 0, // 网络状况检查次数统计
  },
  async created() {
    this.init();
  },
  detached() {
    // 取消管理视口监听
    this.removeViewportObserve();
    // 移除错误处理定时器
    this.removeNetworkCheckTimer();
  },
  observers: {
    src(link) {
      // 图片路径变化时重新初始化
      this.init(link);
    },
    'enterObserve,leaveObserve': function (enterObserve, leaveObserve) {
      // 如果设置了视口监听，则先不显示主图片
      // 1.9.3 开始支持createIntersectionObserver
      if ((enterObserve || leaveObserve) && wx.canIUse('createIntersectionObserver')) {
        this.setData({
          isImageVisible: false,
        });
      }
    },
  },
  methods: {
    init(originSrc) {
      const { prevSrc } = this.data;
      const src = originSrc || this.data.src;
      // 如果不存在路径或者重复调用该函数，不予处理
      if (!src || src === prevSrc) return;
      // 无法追加后缀的图片直接显示
      if (!this.couldAddSuffix(src)) return;
      // 组合图片路径和后缀
      this.combinePathAndSuffix(src);
      // 设置视口监听，因为初始化会被重复调用，所以需要先移除原有的监听
      this.removeViewportObserve();
      this.addViewportObserve();
    },
    // 检查图片是否是可追加后缀
    couldAddSuffix(src) {
      const isFromImageServer = !!imageServerDomain.find(domain => src.indexOf(domain) > -1);
      if (isFromImageServer) return true;
      this.setData({
        prevSrc: src,
        imageSrc: src,
      });
      return false;
    },
    // 组合图片地址和后缀
    combinePathAndSuffix(src) {
      const { interlace } = this.data;
      // 获取全局图片配置信息
      const config = app.globalData.imageConfig || defaultConfig;
      // 获取后缀
      const suffix = this.generateFormatSuffix({ config });
      const data = {
        prevSrc: src,
        imageSrc: `${src}${suffix}`,
      };
      // 如果要求渐进加载，则设置缩略图路劲
      if (interlace) {
        const thumbnailSuffix = this.generateFormatSuffix({ config, thumbnail: true });
        data.thumbnailSrc = `${src}${thumbnailSuffix}`;
        data.isThumbnailExist = true;
      }
      this.setData(data);
    },
    // 生成格式后缀
    generateFormatSuffix({ config, thumbnail = false }) {
      const { src, width } = this.data;
      if (!src) return;
      let suffix = '?x-oss-process=image';
      const { webpSupport, quality } = config;
      // 找到图片服务支持的最合适的尺寸
      const imageWidth = this.calcImageWidth({ config, width });
      if (thumbnail) {
        // 如果是缩略图，减半图片宽度并设定低质量
        const thumbnailWidth = this.calcImageWidth({ config, width, thumbnail: true });
        suffix += `/resize,w_${thumbnailWidth},m_lfit/quality,q_${thumbnailQuality}`;
      } else {
        suffix += `/resize,w_${imageWidth},m_lfit`;
        if (quality < 100) {
          suffix += `/quality,q_${quality}`;
        }
      }
      // 格式转换操作放在最后
      if (webpSupport) {
        suffix += '/format,webp';
      }
      return suffix;
    },
    // 计算图片宽度
    calcImageWidth({ config, width, thumbnail = false }) {
      const { maxWidth = defaultMaxWidth, pixelRatio = defaultPixelRatio } = config;
      // 处理传入错误的宽度数值的情况
      let widthClone = !width || !+width ? defaultWidth : width;
      // 如果是缩略图，则只取一半宽度
      widthClone = thumbnail ? widthClone / 2 : widthClone;
      // 加入DPR因素
      widthClone *= pixelRatio;
      // 图片的虚拟像素不得超过设备的实际像素
      if (widthClone > maxWidth) {
        return maxWidth;
      }
      return Math.floor(widthClone);
    },
    // 设置视口监听
    addViewportObserve() {
      const { enterObserve, leaveObserve } = this.data;
      if (enterObserve || leaveObserve) {
        // 创建监听对象
        const intersectionObserver =
          this.createIntersectionObserver().relativeToViewport(defaultObserveOption);
        // 开始监听
        intersectionObserver.observe('.mini-image', res => {
          const { intersectionRect, intersectionRatio } = res;
          if (intersectionRect.height > 0) {
            // 进入视口
            // 显示图片
            this.setData({
              isImageVisible: true,
            });
          } else if (intersectionRatio <= 0 && leaveObserve) {
            // 退出视口
            // 停止图片加载错误唤起的网络请求检查
            this.removeNetworkCheckTimer();
            // 隐藏图片
            this.setData({
              isImageVisible: false,
            });
          }
        });
      }
    },
    // 移除视口监听
    removeViewportObserve() {
      const { intersectionObserver } = this.data;
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        this.setData({
          intersectionObserver: null,
        });
      }
    },
    // 缩略图加载完成
    handleThumbnailLoad(ev) {
      this.triggerEvent('onThumbnailLoad', ev);
      // 先加载缩略图，再加载主图
      this.setData({
        isThumbnailLoaded: true,
      });
    },
    // 缩略图加载错误
    handleThumbnailError(ev) {
      this.triggerEvent('onThumbnailError', ev);
      // 如果缩略图加载出错，则直接加载原图
      this.setData({
        isThumbnailLoaded: true,
      });
    },
    // 主图加载完成
    handleImageLoad(ev) {
      this.triggerEvent('onLoad', ev);
      this.setData({
        isImageLoaded: true,
      });
    },
    // 处理图片加载错误
    handleImageError(ev) {
      this.triggerEvent('onError', ev);
      this.fixImageLoadError();
    },
    // 错误处理
    fixImageLoadError() {
      // 如果检查次数大于2次时，不再检查网络
      const { networkCheckCount } = this.data;
      if (networkCheckCount >= 2) return this.removeNetworkCheckTimer();
      this.setData({
        networkCheckCount: networkCheckCount + 1,
      });
      // 检查网络连接情况
      wx.request({
        url: networkChecker,
        method: 'head',
        timeout: 3000,
        success: () => {
          // 如果请求成功，则网络连接正常
          this.removeNetworkCheckTimer();
          this.handleRetry();
        },
        fail: () => {
          // 如果请求失败，则无网络
          this.addNetworkCheckTimer();
        },
      });
    },
    // 处理图片重试
    handleRetry() {
      const { retryCount } = this.data;
      if (retryCount === 0) {
        // 首次不改变图片路径重新加载
        this.setData(
          {
            isImageVisible: false,
            retryCount: 1,
          },
          () => {
            this.setData({
              isImageVisible: true,
            });
          },
        );
      } else {
        // 有网络且再次加载无效时，逐步删除后缀
        const { src, imageSrc } = this.data;
        const strIndex = imageSrc.indexOf(suffixStart);
        // 如果存在格式化后缀
        if (strIndex < 0) return;
        const suffix = imageSrc.substr(strIndex + suffixStart.length);
        let srcStr = src;
        if (suffix) {
          // 如果有后缀，从右往左依次删除
          const suffixArray = suffix.split('/');
          if (suffixArray.length > 0) {
            suffixArray.splice(-1, 1);
          }
          // 拼凑后缀字符串
          const suffixStr = suffixArray.join('/');
          srcStr = `${src}${suffixStart}${suffixStr}`;
        }
        this.setData({
          imageSrc: srcStr,
        });
      }
    },
    // 设置错误处理定时器
    addNetworkCheckTimer() {
      if (this.data.networkCheckTimer) return;
      const networkCheckTimer = setInterval(() => {
        this.fixImageLoadError();
      }, 2000);
      this.setData({ networkCheckTimer });
    },
    // 移除错误处理定时器
    removeNetworkCheckTimer() {
      const { networkCheckTimer } = this.data;
      if (networkCheckTimer) {
        clearInterval(networkCheckTimer);
        this.setData({
          networkCheckTimer: null,
        });
      }
    },
  },
});
