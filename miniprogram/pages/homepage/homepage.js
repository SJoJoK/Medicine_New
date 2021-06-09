// miniprogram/pages/homepage/homepage.js


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
    isShow:true, 
    openid: '',
    rules:{},
    offLine:null  //是否维护
  },

  // 获取用户openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'add',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openId)
        var openid = res.result.openId;
        that.setData({
          openid: openid
        })
      }
    })
  },

  // ------------加入购物车------------
  addCartByHome: function(e) {
    var self = this
    let newItem = {}
    app.getInfoWhere('medicine_stock', { _id: e.currentTarget.dataset._id },
      e => {
        var newCartItem = e.data["0"]
        newCartItem.num = 1
        app.isNotRepeteToCart(newCartItem)
        wx.showToast({
          title: '已添加至购物车',
        })
      }
    )
  },


  // ------------分类展示切换---------
  typeSwitch: function(e) {
    getCurrentPages()["0"].setData({
      activeTypeId: parseInt(e.currentTarget.id),
      rules: e.currentTarget.id == 0 ? {} : { class: e.currentTarget.id}
    })
    this.showMedicine();
  },

  orderSwitch: function (e) {
    getCurrentPages()["0"].setData({
      activeOrderId: parseInt(e.currentTarget.id)
    })

  this.showMedicine();
  },

  showMedicine: function()
  {
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


  // ---------点击跳转至详情页面-------------
  tapToDetail: function(e) {
    wx.navigateTo({
      //Dataset是currentTarget的一个项，可参考https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000846df9a03909b0086a50025180a&highline=event
      url: '../detail/detail?_id=' + e.currentTarget.dataset.fid,
    })
  },


  // ------------生命周期函数------------
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    that.setData({
      isShow: true
    })
    // 获取openId
    this.getOpenid();
  },

  onReady: function () {
    // console.log(getCurrentPages()["0"].data)
  },

  onShow: function () {
    var that = this
    // 药品信息
    app.getInfoByOrder('medicine_stock', 'id', 'asc',
      e => {
        console.log(e.data)
        getCurrentPages()["0"].setData({
          medicineInfo: e.data,
          isShow: true,
          activeTypeId: 0,
          activeOrderId: 0
        })
        wx.hideLoading()
      },
    )
    // console.log(app.globalData.offLine)
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
      imageUrl: '../../images/icon/medicine.jpg',
      path: '/pages/homepage/homepage'
    }
  }

})