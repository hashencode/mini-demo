/**
 * 页面上拉加载配置（兼容无数据页）
 * 页面配置里需要有返回列表数据的 fetchListData 方法
 */

const LOADING = "(ง •̀_•́)ง 努力加载中 ...";
const LOADED = "(..•˘_˘•..) 已经滑到底啦";

const virtualListExtend = {
  data: {
    /**
     * 列表数据
     */
    items: [],
    /**
     * 列表页码数据
     */
    pageBean: {},
    /**
     * 加载提示文案
     */
    loadTips: LOADING,
    /**
     * 是否加载中，防止重复请求
     */
    listLoading: false,
    /**
     * 是否有下一页
     */
    hasNextPage: true,
    /**
     * 首次加载是否完成
     */
    loaded: false,
    /**
     * 是否显示底部按钮
     */
    showLoadTips: false,
  },
  /**
   * 存储上一页传入的参数（不包括 pageNo）
   */
  currParam: null,

  /**
   * 是否有下一页
   * @param pageBean
   * @returns {boolean}
   */
  hasNextPage({ pageNo = 1, pageSize = 10, totalCount = 0 } = {}) {
    const bool = Math.ceil(totalCount / pageSize) > pageNo;
    this.setData({
      hasNextPage: bool,
    });
    return bool;
  },

  /**
   * 获取列表，供页面调用的方法
   * @param pageNo
   * @param param
   */
  async getPageData({ pageNo = 1, ...param } = {}) {
    if (this.data.listLoading) {
      return;
    }
    this.currParam = param;
    this.setData({
      listLoading: true,
    });

    const res = await this.fetchListData({
      ...param,
      pageNo,
      pageSize: param.pageSize || 10,
    });
    const { isGroup, items, pageBean, item } = res;
    const hasNextPage = this.hasNextPage(pageBean);

    this.setData({
      listLoading: false,
    });

    if (!items.length && hasNextPage) {
      await this.getPageData({
        ...param,
        pageNo: pageNo + 1,
      });
    } else {
      this.setData({
        isGroup,
        items: pageNo > 1 ? this.data.items.concat(items) : items,
        item,
        pageBean,
        loadTips: hasNextPage ? LOADING : LOADED,
        hasNextPage,
        loaded: true,
        showLoadTips: false,
      });
    }
    // 分页数据不够，前端来凑
    if (
      pageBean &&
      this.data.items.length < pageBean.pageSize &&
      this.data.hasNextPage
    ) {
      this.onReachBottom();
    }
  },

  /**
   * 页面滑到底了
   */
  onReachBottom() {
    const { pageBean, hasNextPage } = this.data;
    if (hasNextPage) {
      if (!this.data.showLoadTips) {
        this.setData({
          showLoadTips: true,
        });
      }
      this.getPageData({
        ...this.currParam,
        pageNo: pageBean ? pageBean.pageNo + 1 : 1,
      });
    }
  },
};

export default virtualListExtend;
