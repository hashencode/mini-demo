const amap = require("./amap");
import {
  markerConfig,
  mapKey,
  carMarkerConfig,
  carMarkerId,
  animationDuration,
  visiblePathRange,
} from "./constant";

// 将路径分为两部分，便于染色处理
// 第一部分是 起始点-途经点-当前位置
// 第二部分是 当前位置-终点
const points = {
  // 起始点
  start: "120.11031,30.360453",
  // 终点
  end: "120.160779,30.161771",
  // 途经点
  waypoints: "120.164898,30.33527;120.203004,30.246653",
  // 当前位置
  current: "120.207353,30.240225",
};

Component({
  properties: {},
  data: {
    // 地图中心点
    centerPoint: { longitude: 120.207353, latitude: 30.240225 },
    // 当前在地图中需要被展示的点
    animationPath: [],
    // 标注
    markers: [],
    // 路径图形
    polyline: [],
  },
  lifetimes: {
    attached() {
      this.renderPath().then();
      this.renderMarker();
    },
  },
  methods: {
    handleMapUpdate() {
      if (this.data.animationPath.length > 0) {
        // 防止绘制的同时运行动画造成卡顿
        setTimeout(() => {
          this.renderCarMarker();
        }, 1500);
      }
    },
    // 获取路径点
    getPath({ start, end, waypoints }) {
      return new Promise((resolve, reject) => {
        const mapObj = new amap.AMapWX({ key: mapKey });
        mapObj.getDrivingRoute({
          origin: start,
          destination: end,
          waypoints,
          success: function (data) {
            const points = [];
            if (data.paths && data.paths[0] && data.paths[0].steps) {
              const steps = data.paths[0].steps;
              for (let i = 0; i < steps.length; i++) {
                const poLen = steps[i].polyline.split(";");
                for (let j = 0; j < poLen.length; j++) {
                  points.push({
                    longitude: parseFloat(poLen[j].split(",")[0]),
                    latitude: parseFloat(poLen[j].split(",")[1]),
                  });
                }
              }
            }
            resolve(points);
          },
          fail: function () {
            reject([]);
          },
        });
      });
    },
    // 绘制路径
    async renderPath() {
      const pointTraveled = await this.getPath({
        start: points.start,
        end: points.current,
        waypoints: points.waypoints,
      });
      const pointNotTraveled = await this.getPath({
        start: points.current,
        end: points.end,
      });
      const polyline = [
        {
          points: pointTraveled,
          color: "#3FA55A",
          width: 6,
        },
        {
          points: pointNotTraveled,
          color: "#0091ff",
          width: 6,
        },
      ];
      this.setData({
        polyline,
        animationPath: pointTraveled.slice(-10),
        visiblePath: [
          ...pointTraveled.slice(-visiblePathRange),
          ...pointNotTraveled.slice(0, visiblePathRange),
        ],
      });
    },
    // 渲染图标
    renderMarker() {
      const startPoint = points.start.split(",");
      const endPoint = points.end.split(",");
      const currentPint = points.current.split(",");
      const markers = [
        {
          ...markerConfig,
          id: 1,
          latitude: startPoint[1],
          longitude: startPoint[0],
        },
        {
          ...markerConfig,
          id: 2,
          latitude: currentPint[1],
          longitude: currentPint[0],
        },
        {
          ...markerConfig,
          id: 3,
          latitude: endPoint[1],
          longitude: endPoint[0],
        },
      ];
      this.setData({ markers });
    },
    // 绘制货车图标
    renderCarMarker() {
      const { markers, animationPath } = this.data;
      if (markers.find((item) => item.id === carMarkerId)) return;
      const startPoint = animationPath[0];
      const currentPint = points.current.split(",");
      // 如果支持moveAlong则播放动画，如果不支持则直接在当前位置处显示货车标记
      if (wx.canIUse("MapContext.moveAlong")) {
        const { longitude, latitude } = startPoint;
        this.setData(
          {
            markers: [
              ...markers,
              {
                id: carMarkerId,
                ...carMarkerConfig,
                latitude,
                longitude,
              },
            ],
          },
          () => this.startAnimation()
        );
      } else {
        this.setData({
          markers: [
            ...markers,
            {
              id: carMarkerId,
              ...carMarkerConfig,
              latitude: currentPint[1],
              longitude: currentPint[0],
            },
          ],
        });
      }
    },
    // 开始路径动画
    startAnimation() {
      wx.createMapContext("map-element", this).moveAlong({
        markerId: carMarkerId,
        path: this.data.animationPath,
        duration: animationDuration,
      });
    },
  },
});
