import {
  defaultConfig,
  defaultMaxWidth,
  defaultQuality,
  qualityMap,
  supportedWidths,
  weakNetworkQuality,
} from './constant';

// 判断是否支持webp
const getWebpSupport = info => {
  const { platform, system } = info;
  // 默认不支持webp
  let webpSupport = false;
  // 根据系统/版本号判断webp支持程度
  if (platform === 'ios') {
    // 如果是ios则判断主版本号是否大于13
    try {
      const version = system.match(/(\d|\.)+/g);
      if (version) {
        const majorVersion = version[0].split('.')[0];
        webpSupport = majorVersion > 13;
      }
    } catch (err) {
      console.error(err);
    }
  } else if (platform === 'android') {
    // 安卓默认支持webp
    webpSupport = true;
  }
  return webpSupport;
};

// 计算图片最大宽度
const getMaxWidth = info => {
  const { windowWidth = 375, pixelRatio = 2 } = info;
  const maxWidth = windowWidth * pixelRatio;
  if (maxWidth > 1200) {
    // 图片处理服务限制宽度不能超过1200
    return 1200;
  }
  if (maxWidth < 600) {
    // 最小不得小于600
    return 600;
  }
  return supportedWidths.find(width => width >= maxWidth) || defaultMaxWidth;
};

// 获取网络状况
const getQuality = () => {
  return new Promise(resolve => {
    wx.getNetworkType({
      success: info => {
        const { networkType } = info;
        resolve(qualityMap[networkType]);
      },
      fail: () => {
        resolve(defaultQuality);
      },
    });
  });
};

// 创建图片配置信息
export function setImageConfig() {
  return new Promise(resolve => {
    // 获取系统信息
    wx.getSystemInfo({
      success: async info => {
        const maxWidth = getMaxWidth(info);
        const webpSupport = getWebpSupport(info);
        const quality = await getQuality();
        // 更新全局的图片设置
        this.globalData.imageConfig = {
          webpSupport,
          maxWidth,
          quality,
        };
        resolve(true);
      },
      fail: () => {
        // 无法获取系统信息则返回默认配置
        this.globalData.imageConfig = defaultConfig;
        resolve(false);
      },
    });
  });
}

// 网络监听
export function addNetworkListener() {
  const config = this.globalData.imageConfig;
  if (!config) return;
  // 监听弱网变化
  if (wx.canIUse('onNetworkWeakChange')) {
    // 基础库 2.21.0 开始支持
    wx.onNetworkWeakChange(res => {
      const { weakNet, networkType } = res;
      // 如果处于弱网状态，降低质量
      this.globalData.imageConfig.quality = weakNet ? weakNetworkQuality : qualityMap[networkType];
    });
  }
  // 监听网络变化
  if (wx.canIUse('onNetworkStatusChange')) {
    wx.onNetworkStatusChange(res => {
      this.globalData.imageConfig.quality = qualityMap[res.networkType];
    });
  }
}

// 取消网络监听
export function offNetworkListener() {
  // 基础库 2.21.0 开始支持
  if (wx.canIUse('offNetworkWeakChange')) {
    wx.offNetworkWeakChange();
  }
  // 基础库 2.9.3 开始支持
  if (wx.canIUse('offNetworkStatusChange')) {
    wx.offNetworkStatusChange();
  }
}
