const app = getApp()

Page({
  data: {
    carts: [],
    hasList: false,
    totalPrice: 0,
    obj: { name: "" }
  },

  onLoad(e) {

  },

  onShow() {
    var self = this
    this.setData({ carts: app.globalData.carts })
    console.log(self.data.carts)
    if (app.globalData.carts.length != 0) {
      self.setData({
        hasList: true
      });
    }
    else {
      self.setData({
        hasList: false
      });
    }
    self.selectAll();
    self.getTotalPrice();
  },

  onHide: function () {
    var self = this
    self.getTotalPrice();
    self.selectAll();
  },

  // 当前商品选中事件
  selectList(e) {
    var self = this
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    const selected = carts[index].selected;
    carts[index].selected = !selected;
    this.setData({
      carts: carts
    });
    app.globalData.carts = carts
    this.getTotalPrice();
  },

  // 全选
  selectAll(e) {
    let selectAllStatus = this.data.selectAllStatus;
    selectAllStatus = !selectAllStatus;
    let carts = this.data.carts;
    for (let i = 0; i < carts.length; i++) {
      carts[i].selected = selectAllStatus;
    }
    this.setData({
      selectAllStatus: selectAllStatus,
      carts: carts
    });
    app.globalData.carts = carts
    this.getTotalPrice();
  },

  // 删除购物车当前商品
  deleteList(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    carts.splice(index, 1);
    this.setData({
      carts: carts
    });
    app.globalData.carts = carts
    if (!carts.length) {
      this.setData({
        hasList: false
      });
    } else {
      this.getTotalPrice();
    }
  },

  // 绑定加数量事件
  addCount(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    let num = carts[index].num;
    num = num + 1;
    carts[index].num = num;
    this.setData({
      carts: carts
    });
    app.globalData.carts = carts
    this.getTotalPrice();
  },

  // 绑定减数量事件
  minusCount(e) {
    const index = e.currentTarget.dataset.index;
    const obj = e.currentTarget.dataset.obj;
    let carts = this.data.carts;
    let num = carts[index].num;
    if (num <= 1) {
      return false;
    }
    num = num - 1;
    carts[index].num = num;
    this.setData({
      carts: carts
    });
    app.globalData.carts = carts
    this.getTotalPrice();
  },

  // 计算总价
  getTotalPrice() {
    let carts = this.data.carts;
    let total = 0;
    for (let i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        total += carts[i].num * carts[i].price;
      }
    }
    this.setData({
      carts: carts,
      totalPrice: total.toFixed(2)
    });
    app.globalData.carts = carts
  }
})