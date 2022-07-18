import { sectionIdPrefix } from "./constant";

Component({
  options: {
    pureDataPattern: /^_/, // 指定所有 _ 开头的数据字段为纯数据字段
    addGlobalClass: true, // page样式影响组件内样式
  },
  properties: {
    // 列表数据
    listData: {
      type: Array,
      value: [],
    },
    // 触底距离
    reachBottomDistance: {
      type: Number,
      value: 100,
    },
  },
  data: {
    _latestPageIndex: 0, // 最新页码
    listItemHeight: 0, // 列表项的高度
    pagesInViewport: [0], // 视口内可见页码
    pageHeightArray: [], // 存放每个分页的高度
  },
  observers: {
    listData(value) {
      // 获取列表项高度
      this.getItemHeight();
      // 设置分页高度
      this.setPageHeight();
      // 设置分页监听
      this.setPageObserve(this.data._latestPageIndex);
    },
  },
  lifetimes: {
    ready() {
      // 重置数据
      this.reset();
      // 设置触底监听
      this.setBottomObserver();
    },
  },
  methods: {
    // 初始化
    reset() {
      this.setData({
        _latestPageIndex: 0,
        pagesInViewport: [0],
        pageHeightArray: [],
      });
    },
    // 获取列表项高度
    getItemHeight() {
      const { listData, listItemHeight } = this.data;
      console.log("list", listData);
      // 如果已计算列表项高度 或 列表数据为空
      if (listItemHeight || listData.length <= 0) return;
      // 获取列表项DOM
      const query = this.createSelectorQuery();
      query.select(".virtual-list-item").boundingClientRect();
      query.exec((res) => {
        if (res && res[0]) {
          const height = res[0] && res[0].height;
          this.setData({ listItemHeight: height });
        }
      });
    },
    // 获取每页列表的高度
    setPageHeight() {
      const { pageHeightArray, _latestPageIndex } = this.data;
      // 获取分页DOM
      const query = this.createSelectorQuery();
      query
        .select(`#${sectionIdPrefix}${_latestPageIndex}`)
        .boundingClientRect();
      query.exec((res) => {
        if (res && res[0]) {
          console.log(pageHeightArray);
          pageHeightArray[_latestPageIndex] = res[0] && res[0].height;
          this.setData({ pageHeightArray });
        }
      });
    },
    // 设置触底监听
    setBottomObserver() {
      const { reachBottomDistance } = this.data;
      const observer = this.createIntersectionObserver().relativeToViewport({
        top: 0,
        bottom: reachBottomDistance,
      });
      observer.observe(".virtual-list-loading", (res) => {
        if (res.intersectionRatio > 0) {
          this.onReachBottom();
        }
      });
    },
    // 触底时调用
    onReachBottom: function () {
      wx.nextTick(() => {
        console.log("reach bottom");
        const { _latestPageIndex } = this.data;
        this.triggerEvent("onReachBottom", { pageNum: _latestPageIndex });
        this.setData({
          _latestPageIndex: _latestPageIndex + 1,
        });
      });
    },
    //视图监听
    setPageObserve: function (pageNum) {
      const that = this;
      const observerView = this.createIntersectionObserver().relativeToViewport(
        { top: 0, bottom: 0 }
      );
      observerView.observe(`#${sectionIdPrefix}${pageNum}`, (res) => {
        if (res.intersectionRatio > 0) {
          that.setData({
            pagesInViewport: [pageNum - 1, pageNum, pageNum + 1],
          });
        }
      });
    },
  },
});
