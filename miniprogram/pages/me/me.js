// page/component/new-pages/user/user.js
const app = getApp();

Page({
  data: {
    orders: [],
    hasAddress: false,
    address: {},
    isAdmin: 0,
    openid: '',
    adiminArr: [
      //实际发布后，绑定后台管理人员的openid
      //访问后台只需令isAdmin强制为0
      //现在已设置为强制为0
      ''
    ]
  },

  onLoad() {
    var that = this;
    that.getOpenidAndOrders();
    // console.log(that.data)
  },

  onShow() {
    var self = this;
    // console.log(self.data)
    /**
     * 获取本地缓存 地址信息
     */
    wx.getStorage({
      key: 'address',
      success: function (res) {
        self.setData({
          hasAddress: true,
          address: res.data
        })
      }
    })
  },

  onPullDownRefresh: function () {
    var that = this
    that.getOpenidAndOrders()
    var timer

    (timer = setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 500));

  },

  // 获取用户openid与订单
  getOpenidAndOrders() {
    var that = this;
    wx.cloud.callFunction({
      name: 'add',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openId)
        var openid = res.result.openId;
        var isAdmin = null;
        that.setData({
          openid: openid,
          //isAdmin: that.data.adiminArr.indexOf(openid)
          isAdmin:0
        })
        app.getInfoWhere('order_master',{
          openid: openid
        },e=>{
          console.log(e.data)
          var tmp = []
          var len = e.data.length
          for (var i = 0; i < len;i++){
            tmp.push(e.data.pop())
          }
          that.setData({
            orders: tmp
          })
        })
      }
    })
    console.log(that.data)
  },

  goToBgInfo: function() {
    wx.navigateTo({
      url: '/pages/bgInfo/bgInfo',
    })
  },

  goToBgManage: function () {
    wx.navigateTo({
      url: '/pages/bgManage/bgManage',
    })
  },

  toPay: function(e) {
    const that = this
    const id = e.currentTarget.dataset._id
    console.log(id)
    wx.showModal({
      title: '支付确认',
      content: '确定要支付吗',
      success(res) {
        if (res.confirm) {
          that._pay(id)
        } else if (res.cancel) {
          that._notpay(id)
        }
      }
    })
  },

  _notpay(id) {
    console.log("取消支付")
      app.updateInfo('order_master', id, {
        'paySuccess': false
      }, e => {
        console.log("【取消支付】" + e)
        app.clearCart()
        wx.showToast({
          title: '取消支付',
          duration: 1000,
        })
      })
  },

  _pay(id) {
    console.log("确定支付")
    // 发送支付请求，默认成功
      app.updateInfo('order_master', id, {
        'paySuccess': true,
        'payTime': app.CurrentTime_show()
      }, e => {
        console.log("订单状态已修改：【支付成功】" + e)
        app.clearCart()
        wx.showToast({
          title: '支付成功',
          duration: 1000,
          success: this.getOpenidAndOrders()
        })
      })
  },

})