const app = getApp()

Page({
  data: {
    swiperImgNo: 1,
    imgSwiperUrl: '',
    medicineInfo: [],
    typeCat: [
      { id: 0, name: "全部药品" },
      { id: 1, name: "生活用药" },
      { id: 2, name: "感冒发烧" },
      { id: 3, name: "抗菌消炎" },
      { id: 4, name: "跌打损伤" },
      { id: 5, name: "呼吸系统" },
      { id: 6, name: "心脑血管" },
      { id: 7, name: "安神助眠" },
      { id: 8, name: "滋补养生" },
      { id: 9, name: "胃肠道" },
      { id: 10, name: "眼科" },
      { id: 11, name: "皮肤" },
      { id: 12, name: "其他" }
    ],
    activeTypeId: 0,
    orderCat: [
      { id: 0, name: "默认" },
      { id: 1, name: "销量" },
      { id: 2, name: "价格" }
    ],
    activeOrderId: 0,
    isShow: true,
    openid: '',
    rules: {},
    offLine: null
  },

  // 获取用户openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'add',
      complete: res => {
        var openid = res.result.openId;
        that.setData({
          openid: openid
        })
      }
    })
  },

  // 加入购物车
  addCartByHome: function (e) {
    var self = this
    let newItem = {}
    app.getInfoWhere('medicine_stock', { _id: e.currentTarget.dataset._id },
      e => {
        var newCartItem = e.data["0"]
        newCartItem.num = 1
        app.isNotRepeteToCart(newCartItem)
        wx.showToast({
          title: '已添加至购物车'
        })
      }
    )
  },

  // 分类展示切换
  typeSwitch: function (e) {
    getCurrentPages()["0"].setData({
      activeTypeId: parseInt(e.currentTarget.id),
      rules: e.currentTarget.id == 0 ? {} : { class: e.currentTarget.id }
    })
    this.showMedicine();
  },

  // 排序展示切换
  orderSwitch: function (e) {
    getCurrentPages()["0"].setData({
      activeOrderId: parseInt(e.currentTarget.id)
    })
    this.showMedicine();
  },

  // 显示药品
  showMedicine: function () {
    if (this.data.activeOrderId == '0') {
      app.getInfo('medicine_stock', this.data.rules, 'id', 'asc',
        e => {
          getCurrentPages()["0"].setData({
            medicineInfo: e.data
          })
        },
      )
    }
    else if (this.data.activeOrderId == '1') {
      app.getInfo('medicine_stock', this.data.rules, 'sales', 'desc',
        e => {
          getCurrentPages()["0"].setData({
            medicineInfo: e.data
          })
        },
      )
    }
    else if (this.data.activeOrderId == '2') {
      app.getInfo('medicine_stock', this.data.rules, 'price', 'asc',
        e => {
          getCurrentPages()["0"].setData({
            medicineInfo: e.data
          })
        },
      )
    }
  },

  // 点击跳转至详情页面
  tapToDetail: function (e) {
    wx.navigateTo({
      url: '../detail/detail?_id=' + e.currentTarget.dataset.fid,
    })
  },

  // 生命周期函数
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    that.setData({
      isShow: true
    })
    this.getOpenid();
  },

  onReady: function () {

  },

  onShow: function () {
    var that = this
    // 药品信息
    app.getInfoByOrder('medicine_stock', 'id', 'asc',
      e => {
        getCurrentPages()["0"].setData({
          medicineInfo: e.data,
          isShow: true,
          activeTypeId: 0,
          activeOrderId: 0
        })
        wx.hideLoading()
      },
    )
    // 是否下线
    app.getInfoWhere('setting', { "option": "offLine" },
      e => {
        that.setData({
          offLine: e.data["0"].offLine
        })
      }
    )
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
    return {
      title: '网上药房',
      imageUrl: '../../images/tabBar/homepage.png',
      path: '/pages/homepage/homepage'
    }
  }
})