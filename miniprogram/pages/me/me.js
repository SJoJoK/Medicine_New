// page/component/new-pages/user/user.js
const app = getApp();

Page({
  data: {
    orders: [],
    hasAddress: false,
    address: {},
    isAdmin: 0,
    openid: '',
    adminArr: [
      //实际发布后，绑定后台管理人员的openid
      //访问后台只需令isAdmin强制为0
      //现在已设置为强制为0
      //具体看getOpenidAndOrders()中的描述
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
        // console.log('云函数获取到的openid: ', res.result.openId)
        var openid = res.result.openId;
        var isAdmin = null;
        that.setData({
          openid: openid,
          //正常情况下，应该将管理员的openid放入that.data.adminArr中
          //为方便调试，此处提供了三种方式
          //正常情况：
          //isAdmin: that.data.adminArr.indexOf(openid)
          //强制显示后台：
          isAdmin: 0
          //强制不显示后台：
          // isAdmin:-1
        })
        app.getInfoWhere('order_master', {
          openid: openid
        }, e => {
          // console.log(e.data)
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
    // console.log(that.data)
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
    console.log("取消支付")
    app.updateInfo('order_master', id, {
      'paySuccess': false
    }, e => {
      console.log("【取消支付】" + e)
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
    console.log("确定收货")
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
              console.log(e)
              console.log("销量已增加" + e)
            })
          })
        }
      )
      app.updateInfo('order_master', id, {
        finished: true,
        finishedTime: app.CurrentTime_show()
      }, e => {
        console.log("订单状态已修改：【已确认收货】" + e)
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
    console.log("取消订单")
    app.deleteInfoFromSet('order_master', id, e => {
      console.log("订单状态已修改：【已取消订单】" + e)
      wx.showToast({
        title: '取消订单',
        duration: 1000,
        success: this.getOpenidAndOrders()
      })
    })
  },
})

