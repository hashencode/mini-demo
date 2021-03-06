// 高德应用KEY
export const mapKey = "2SBBZ-2TFC3-TVZ3Q-YZL5O-EBZIF-5TB2R";

// 标记默认配置
export const markerConfig = {
  width: 20,
  height: 20,
  anchor: { x: 0.5, y: 0.5 },
  iconPath: "./point-image/point.png",
  customCallout: {
    display: "ALWAYS",
    anchorX: 45,
    anchorY: 25,
  },
};

// 货车标记配置
export const carMarkerConfig = {
  width: 45,
  height: 45,
  anchor: { x: 0.5, y: 0.5 },
  iconPath: "./point-image/car.png",
};

// 货车标记ID
export const carMarkerId = 999;

// 动画持续时间
export const animationDuration = 2500;

// 首次展示的路径长度，数值越大，展示的路径越长
export const visiblePathRange = 10;
