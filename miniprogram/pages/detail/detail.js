const app = getApp()

Page({
  data: {
    medicineDetail: {},
    popUpHidden: true,
    popCartCount: 1,
    curIndex: 0,
    articleID: ""
  },

  // 跳转至购物车
  goToCart: function () {
    wx.switchTab({
      url: '/pages/cart/cart'
    })
  },

  // 弹出购物车选项
  addToCart: function () {
    var that = this
    that.setData({
      popUpHidden: false
    })
  },

  // 关闭购物车选项
  popCancel: function () {
    var that = this
    that.setData({
      popUpHidden: true
    })
  },

  // 数量加减
  plusCount: function () {
    var that = this
    var tmp = that.data.popCartCount + 1
    that.setData({
      popCartCount: tmp
    })
  },

  minusCount: function () {
    var that = this
    var tmp = that.data.popCartCount - 1
    if (tmp === 0)
      tmp = 1
    that.setData({
      popCartCount: tmp
    })
  },

  // 添加购物车
  toCart: function () {
    var that = this
    var newCartItem = that.data.medicineDetail
    newCartItem.num = that.data.popCartCount
    app.isNotRepeteToCart(newCartItem)
    wx.showToast({
      title: '已添加至购物车'
    })
    that.setData({
      popUpHidden: true
    })
  },

  // 详细信息切换
  bindTap(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      curIndex: index
    })
  },

  onLoad: function (e) {
    console.log(e._id)
    var that = this
    that.setData({
      articleID: e._id
    })
    app.getInfoWhere('medicine_stock', { _id: e._id },
      e => {
        console.log(e.data)
        console.log(e.data["0"])
        that.setData({
          medicineDetail: e.data["0"]
        })
      }
    )
  },

  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})