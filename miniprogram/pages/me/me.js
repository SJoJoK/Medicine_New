const app = getApp();

Page({
  data: {
    orders: [],
    hasAddress: false,
    address: {},
    isAdmin: 0,
    openid: '',
    adminArr: ['']
  },

  onLoad() {
    var that = this;
    that.getOpenidAndOrders();
  },

  onShow() {
    var self = this;
    wx.getStorage({
      key: 'address',
      success: function (res) {
        self.setData({
          hasAddress: true,
          address: res.data
        })
      }
    })
    const that = this
    that.getOpenidAndOrders()
  },

  onPullDownRefresh: function () {
    const that = this
    that.getOpenidAndOrders()
    var timer
    timer = setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 500);
  },

  // 获取用户openid与订单
  getOpenidAndOrders() {
    var that = this;
    wx.cloud.callFunction({
      name: 'add',
      complete: res => {
        var openid = res.result.openId;
        var isAdmin = null;
        that.setData({
          openid: openid,
          //强制显示后台：
          isAdmin: 0
        })
        app.getInfoWhere('order_master', {
          openid: openid
        }, e => {
          var tmp = []
          var len = e.data.length
          for (var i = 0; i < len; i++) {
            tmp.push(e.data.pop())
          }
          that.setData({
            orders: tmp
          })
        })
      }
    })
  },

  goToBgInfo: function () {
    wx.navigateTo({
      url: '/pages/bgInfo/bgInfo',
    })
  },

  goToBgManage: function () {
    wx.navigateTo({
      url: '/pages/bgManage/bgManage',
    })
  },

  goToHealthDoc: function () {
    wx.navigateTo({
      url: '/pages/healthdoc/healthdoc',
    })
  },

  toPay: function (e) {
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
    app.updateInfo('order_master', id, {
      'paySuccess': false
    }, e => {
      console.log("订单状态已修改：取消支付" + e)
      wx.showToast({
        title: '取消支付',
        duration: 1000
      })
    })
  },

  _pay(id) {
    app.updateInfo('order_master', id, {
      'paySuccess': true,
      'payTime': app.CurrentTime_show()
    }, e => {
      console.log("订单状态已修改：支付成功" + e)
      wx.showToast({
        title: '支付成功',
        duration: 1000,
        success: this.getOpenidAndOrders()
      })
    })
  },

  toConfirm(e) {
    const that = this
    const id = e.currentTarget.dataset._id
    console.log(id)
    wx.showModal({
      title: '收货确认',
      content: '确定已收货吗',
      success(res) {
        if (res.confirm) {
          that._confirm(id)
        } else if (res.cancel) {
          wx.showToast({
            title: '取消确认',
            duration: 1000
          })
        }
      }
    })
  },

  _confirm(id) {
    const db = wx.cloud.database()
    app.getInfoWhere('order_master', {
      _id: id
    }, e => {
      console.log(e.data[0].medicineList)
      const tmp = e.data[0].medicineList
      tmp.forEach(
        function (item) {
          app.getInfoWhere('medicine_stock', {
            name: item[0]
          }, e => {
            console.log(e)
            const mid = e.data[0]._id
            const delta = item[1]
            app.updateInfo('medicine_stock', mid, {
              sales: db.command.inc(delta)
            }, e => {
              console.log("销量已增加" + e)
            })
          })
        }
      )
      app.updateInfo('order_master', id, {
        finished: true,
        finishedTime: app.CurrentTime_show()
      }, e => {
        console.log("订单状态已修改：确认收货" + e)
        wx.showToast({
          title: '确认收货',
          duration: 1000,
          success: this.getOpenidAndOrders()
        })
      })
    })
  },

  toCancel: function (e) {
    const that = this
    const id = e.currentTarget.dataset._id
    console.log(id)
    wx.showModal({
      title: '取消订单',
      content: '确定要取消吗',
      success(res) {
        if (res.confirm) {
          that._cancel(id)
        }
      }
    })
  },

  _cancel(id) {
    app.deleteInfoFromSet('order_master', id, e => {
      console.log("订单状态已修改：取消订单" + e)
      wx.showToast({
        title: '取消订单',
        duration: 1000,
        success: this.getOpenidAndOrders()
      })
    })
  }
})

