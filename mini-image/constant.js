/**
 * 图片处理配置
 * */
// 图片和网络质量映射表
export const qualityMap = {
  wifi: 100,
  '5g': 90,
  '4g': 85,
  '3g': 70,
  '2g': 60,
  unknown: 60,
  none: 60,
};
// 默认质量
export const defaultQuality = qualityMap['4g'];
// 弱网图片质量
export const weakNetworkQuality = qualityMap['2g'];
// 缩略图质量
export const thumbnailQuality = 20;
// 默认容器宽度（rpx）
export const defaultWidth = 375;
// 默认图片最大宽度
export const defaultMaxWidth = 750;
// 默认DPR
export const defaultPixelRatio = 2;
// 默认配置
export const defaultConfig = {
  webpSupport: false,
  maxWidth: defaultMaxWidth,
  quality: defaultQuality,
  pixelRatio: defaultPixelRatio,
};
// 默认视口监听配置
export const defaultObserveOption = { top: 100, bottom: 100 };

/**
 * 图片服务器配置
 * */
// 图床格式化字符串的前缀
export const suffixStart = '?x-oss-process=image/';
// 图床链接特征
export const imageServerDomain = ['YOUR_OSS_DOMAIN'];
// 用于测试网络是否断连的图片
export const networkChecker = 'YOUR_OSS_IMAGE?x-oss-process=image/info';
