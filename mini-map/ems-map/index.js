const amap = require("../ems-map/amap");
const { markerConfig, mapKey } = require("./constant");

// 将路径分为两部分，便于染色处理
// 第一部分是 起始点-途经点-当前位置
// 第二部分是 当前位置-终点
const points = {
  // 起始点
  start: "120.177359,36.963235",
  // 终点
  end: "120.255002,30.198588",
  // 途经点
  waypoints: "117.387227,31.922465",
  // 当前位置
  current: "117.638941,31.699471",
};

Component({
  properties: {},
  data: {
    // 地图中心点
    centerPoint: { longitude: 117.638941, latitude: 31.699471 },
    // 当前在地图中需要被展示的点
    includePoints: [],
    // 标注
    markers: [],
    // 路径图形
    polyline: [],
  },
  lifetimes: {
    attached() {
      this.renderMarker();
      this.renderPath().then();
    },
  },
  methods: {
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
    getPoint({ start, end, waypoints }) {
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
    async renderPath() {
      const pointTraveled = await this.getPoint({
        start: points.start,
        end: points.current,
        waypoints: points.waypoints,
      });
      const pointNotTraveled = await this.getPoint({
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
      this.setData({ polyline, includePoints: pointNotTraveled });
    },
  },
});
