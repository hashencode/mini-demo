module.exports = Behavior({
  properties: {
    pageSize: {
      type: Number,
      value: 10,
    },
  },
  data: {
    listData: [],
  },
  methods: {
    fetchNextPage(ev) {
      const { pageSize } = this.data;
      const { pageNum } = ev.detail;
      const arr = Array(pageSize)
        .fill("")
        .map(() => {
          return { id: Math.floor(Math.random() * 100) };
        });
      this.setData({
        [`listData[${pageNum}]`]: arr,
      });
    },
  },
});
