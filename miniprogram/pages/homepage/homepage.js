// miniprogram/pages/homepage/homepage.js


const app = getApp()

Page({
  data: {
    swiperImgNo: 1,
    imgSwiperUrl: '',
    medicineInfo: [],
    typeCat: [
      { id: 0, name: "全部展示" },
      { id: 1, name: "子分类0" },
      { id: 2, name: "子分类1" },
      { id: 3, name: "子分类2" },
    ],
    activeTypeId: 0,
    isShow:true, 
    openid: '',   
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
      activeTypeId: parseInt(e.currentTarget.id)
    })
    switch (e.currentTarget.id) {
      // 全部展示
      case '0':
        app.getInfoByOrder('medicine_stock', 'price', 'desc',
          e => {
            getCurrentPages()["0"].setData({
              medicineInfo: e.data
            })
          }
        )
        break;
      // 子分类1
      case '1':
        app.getInfoWhere('medicine_stock', {myClass:'1'},
          e => {
            getCurrentPages()["0"].setData({
              medicineInfo: e.data
            })
          }
        )
        break;
      // 子分类2
      case '2':
        app.getInfoByOrder('medicine_stock',{myClass:'2'},
          e => {
            getCurrentPages()["0"].setData({
              medicineInfo: e.data
            })
          }
        )
        break;
      // 子分类3
      case '3':
        app.getInfoWhere('medicine_stock', {myClass:'3'},
          e => {
            getCurrentPages()["0"].setData({
              medicineInfo: e.data
            })
          }
        )
        break;
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
    app.getInfoByOrder('medicine_stock', 'price', 'desc',
      e => {
        console.log(e.data)
        getCurrentPages()["0"].setData({
          medicineInfo: e.data,
          isShow: true
        })
        wx.hideLoading()
      }
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