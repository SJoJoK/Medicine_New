const app = getApp()
const md5 = require("../../utils/md5.js")

Page({
  data: {
    address: {},
    hasAddress: false,
    total: 0,
    orders: [],
    myList: [],
    openid: '',
    nonce_str: '',
    trade_no: null,
    totalcnt: 0
  },

  onReady() {
    const self = this;
    // 32位随机字符串
    var nonce_str = app.RndNum()
    // 获取总价和openid
    self.setData({
      orders: app.globalData.carts,
      nonce_str: nonce_str
    })
    this.getOpenid();
    this.getTotalPrice();
  },

  // 取消事件
  _notpay() {
    const tmpOutNum = this.data.trade_no;
    app.getInfoWhere('order_master', {
      'out_trade_no': tmpOutNum
    }, e => {
      const orderId = e.data["0"]._id;
      app.updateInfo('order_master', orderId, {
        'paySuccess': false,
      }, e => {
        console.log("订单状态已修改：取消支付" + e);
        app.clearCart()
        wx.showToast({
          title: '取消支付',
          duration: 1000,
          success: function() {
            setTimeout(function() {
              wx.switchTab({
                url: '../cart/cart',
              })
            }, 1000)
          }
        })
      })
    })
  },

  // 确认事件
  _pay() {
    this.buildHealthDoc();
    const tmpOutNum = this.data.trade_no
    app.getInfoWhere('order_master', {
      'out_trade_no': tmpOutNum
    }, e => {
      const orderId = e.data["0"]._id
      app.updateInfo('order_master', orderId, {
        'paySuccess': true,
        'payTime': app.CurrentTime_show()
      }, e => {
        console.log("订单状态已修改：支付成功" + e)
        app.clearCart()
        wx.showToast({
          title: '支付成功',
          duration: 1000,
          success: function() {
            setTimeout(function() {
              wx.switchTab({
                url: '../cart/cart',
              })
            }, 1000)
          }
        })
      })
    })
  },

  // 建立健康档案
  buildHealthDoc: function() {
    var month = (new Date()).getMonth() + 1;
    for (let i = 0; i < 12; i++) {
      app.addRowToSet("time_hinfo", {
          count: i != month ? 0 : this.data.totalcnt,
          month: i + 1,
          openid: this.data.openid
        },
        () => {
          console.log("success write time info")
        });
    }
    var orders = this.data.orders;
    var analysis = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6]
    ];
    for (let i = 0; i < orders.length; i++) {
      var n = Math.random();
      n = Math.floor(n * 5 + 1);
      analysis[n][0] += orders[i].num;
    }
    for (let i = 0; i < 6; i++) {
      app.addRowToSet("cata_hinfo", {
          count: analysis[i][0],
          catalog: analysis[i][1],
          openid: this.data.openid
        },
        () => {
          console.log("success write cata info")
        });
    }
  },

  onShow: function() {
    const self = this;
    wx.getStorage({
      key: 'address',
      success(res) {
        self.setData({
          address: res.data,
          hasAddress: true
        })
      }
    })
  },

  // 计算总价
  getTotalPrice() {
    let orders = this.data.orders;
    let total = 0;
    let totalcnt = 0;
    for (let i = 0; i < orders.length; i++) {
      total += orders[i].num * orders[i].price;
      totalcnt += orders[i].num;
    }
    this.setData({
      total: total.toFixed(2),
      totalcnt: totalcnt
    })
  },

  // 获取用户openid
  getOpenid() {
    var that = this;
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

  // 去支付
  toPay_new: function() {
    var that = this
    if (that.data.hasAddress) {
      // 生成订单号
      var out_trade_no = (new Date().getTime() + app.RndNum(6)).toString()
      // 生成字符串
      var stringA =
        "appid=" + app.globalData.appid +
        "&attach=test" +
        "&body=JSAPItest" +
        "&device_info=WEB" +
        "&mch_id=" + app.globalData.mch_id +
        "&nonce_str=" + that.data.nonce_str +
        "&notify_url=http://www.weixin.qq.com/wxpay/pay.php" +
        "&openid=" + that.data.openid +
        "&out_trade_no=" + out_trade_no +
        "&time_expire=" + app.beforeNowtimeByMin(-15) +
        "&time_start=" + app.CurrentTime() +
        "&total_fee=" + parseInt(that.data.total * 100) +
        "&trade_type=JSAPI";
      var stringSignTemp = stringA + "&key=" + app.globalData.apikey
      // 签名MD5加密
      var sign = md5.md5(stringSignTemp).toUpperCase()
      var openid = that.data.openid
      // 生成订单信息
      let tmp = that.data.address
      tmp['orderTime'] = app.CurrentTime_show()
      tmp['orderSuccess'] = true
      tmp['payTime'] = ''
      tmp['paySuccess'] = false
      tmp['sending'] = false
      tmp['finished'] = false
      const order_master = tmp
      var tmpList = []
      that.data.orders.forEach((val, idx, obj) => {
        tmpList.push([val.name, val.num, val.price])
      })
      order_master['medicineList'] = tmpList
      order_master['total'] = that.data.total
      order_master['openid'] = that.data.openid
      order_master['out_trade_no'] = out_trade_no
      console.log(order_master)
      that.setData({
        address: order_master,
        trade_no: out_trade_no
      })
      // 上传数据库
      app.addRowToSet('order_master', order_master, e => {
        console.log("订单状态已修改：订单生成" + e)
      })
      wx.showModal({
        title: '支付确认',
        content: '确定要支付吗',
        success(res) {
          if (res.confirm) {
            that._pay()
          } else if (res.cancel) {
            that._notpay()
          }
        }
      })
    } else {
      wx.showModal({
        title: '支付失败',
        content: '请填写收货地址'
      })
    }
  },

  // 支付后的订单信息
  getListAfterPay: function(that) {
    var p = new Promise((resolve, reject) => {
      let theList = []
      that.data.orders.forEach((val, idx, obj) => {
        var {
          name,
          num,
          price
        } = val
        var tmpInfo = {
          name,
          num,
          price
        }
        theList.push(tmpInfo)
      })
      resolve(theList)
    }).then(res => {
      that.setData({
        myList: res
      })
    })
  }
})