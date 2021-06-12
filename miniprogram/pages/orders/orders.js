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
    trade_no: null
  },

  onReady() {
    const self = this;
    // console.log(app.globalData.carts)
    // 32位随机字符串
    var nonce_str = app.RndNum()
    // this.popup = this.selectComponent("#popup");
    // 获取ip地址
    // wx.cloud.callFunction({
    //   name: 'getIP'
    // }).then(e => {
    //   if (e) {
    //     // console.log(e.result.body)
    //     let spbill_create_ip = e.result.body
    //       .split("query\"\:\"")[1]
    //       .split("\"\}")[0]
    //     console.log(spbill_create_ip)
    //     self.setData({
    //       spbill_create_ip: spbill_create_ip
    //     })
    //   }
    // }).catch(err => {
    //   if (err) {
    //     wx.showModal({
    //       title: '错误',
    //       content: '出错了'
    //     })
    //     console.log(err)
    //   }
    // })

    // 获取总价和openid
    self.setData({
      orders: app.globalData.carts,
      nonce_str: nonce_str
    })
    this.getOpenid();
    this.getTotalPrice();
    // this.popup = this.selectComponent("#popup");
  },

  //取消事件
  _notpay() {
    console.log('取消');
    const tmpOutNum = this.data.trade_no
    // 发送支付请求，默认成功
    app.getInfoWhere('order_master', {
      'out_trade_no': tmpOutNum
    }, e => {
      const orderId = e.data["0"]._id
      app.updateInfo('order_master', orderId, {
        'paySuccess': false,
      }, e => {
        console.log("订单状态已修改：【取消支付】" + e)
        app.clearCart()
        // this.popup.hidePopup()
        wx.showToast({
          title: '取消支付',
          duration: 1000,
          success: function () {
            setTimeout(function () {
              wx.switchTab({
                url: '../cart/cart',
              })
            }, 1000)
          }
        })
      })
    })
  },

  //确认事件
  _pay() {
    console.log("确定支付")
    const tmpOutNum = this.data.trade_no
    // 发送支付请求，默认成功
    app.getInfoWhere('order_master', {
      'out_trade_no': tmpOutNum
    }, e => {
      const orderId = e.data["0"]._id
      app.updateInfo('order_master', orderId, {
        'paySuccess': true,
        'payTime': app.CurrentTime_show()
      }, e => {
        console.log("订单状态已修改：【支付成功】" + e)
        app.clearCart()
        // this.popup.hidePopup()
        wx.showToast({
          title: '支付成功',
          duration: 1000,
          success: function () {
            setTimeout(function () {
              wx.switchTab({
                url: '../cart/cart',
              })
            }, 1000)
          }
        })
      })
    })
  },

  onShow: function () {
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

  //计算总价
  getTotalPrice() {
    let orders = this.data.orders;
    let total = 0;
    for (let i = 0; i < orders.length; i++) {
      total += orders[i].num * orders[i].price;
    }
    this.setData({
      total: total.toFixed(2)
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
          openid: openid,
        })
      }
    })
  },

  //去支付
  toPay_new: function () {
    var that = this
    // ------获取prepay_id，所需的签名字符串------
    // 生成订单号
    var out_trade_no = (new Date().getTime() + app.RndNum(6)).toString()
    // -----生成字符串------
    var stringA =
      "appid=" + app.globalData.appid
      + "&attach=test"
      + "&body=JSAPItest"
      + "&device_info=WEB"
      + "&mch_id=" + app.globalData.mch_id
      + "&nonce_str=" + that.data.nonce_str
      + "&notify_url=http://www.weixin.qq.com/wxpay/pay.php"
      + "&openid=" + that.data.openid
      + "&out_trade_no=" + out_trade_no
      // + "&spbill_create_ip=" + that.data.spbill_create_ip
      + "&time_expire=" + app.beforeNowtimeByMin(-15)
      + "&time_start=" + app.CurrentTime()
      + "&total_fee=" + parseInt(that.data.total * 100)
      + "&trade_type=JSAPI";
    var stringSignTemp = stringA + "&key=" + app.globalData.apikey
    // 签名MD5加密
    var sign = md5.md5(stringSignTemp).toUpperCase()
    // console.log("签名：" + stringSignTemp)
    var openid = that.data.openid
    // ------生成订单信息-------
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
      console.log("订单状态已修改：【订单生成】" + e)
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
  },

  // 支付后的订单信息
  getListAfterPay: function (that) {
    var p = new Promise((resolve, reject) => {
      let theList = []
      that.data.orders.forEach((val, idx, obj) => {
        var { name, num, price } = val
        var tmpInfo = { name, num, price }
        theList.push(tmpInfo)
      })
      resolve(theList)
    }).then(res => {
      // console.log(res)
      that.setData({
        myList: res
      })
    })
  },
})

// -------------!! 支付！！------------------
  // toPay() {
  //   var that = this
  //   if (that.data.hasAddress) {

  //     // ------获取prepay_id，所需的签名字符串------
  //     var p = new Promise((resolve, reject) => {
  //       // 生成订单号
  //       var out_trade_no = (new Date().getTime() + app.RndNum(6)).toString()

  //       // -----生成字符串------
  //       var stringA =
  //         "appid=" + app.globalData.appid
  //         + "&attach=test"
  //         + "&body=JSAPItest"
  //         + "&device_info=WEB"
  //         + "&mch_id=" + app.globalData.mch_id
  //         + "&nonce_str=" + that.data.nonce_str
  //         + "&notify_url=http://www.weixin.qq.com/wxpay/pay.php"
  //         + "&openid=" + that.data.openid
  //         + "&out_trade_no=" + out_trade_no
  //         + "&spbill_create_ip=" + that.data.spbill_create_ip
  //         + "&time_expire=" + app.beforeNowtimeByMin(-15)
  //         + "&time_start=" + app.CurrentTime()
  //         + "&total_fee=" + parseInt(that.data.total * 100)
  //         + "&trade_type=JSAPI";

  //       var stringSignTemp = stringA + "&key=" + app.globalData.apikey
  //       // 签名MD5加密
  //       var sign = md5.md5(stringSignTemp).toUpperCase()
  //       // console.log("签名：" + stringSignTemp)

  //       // openid
  //       var openid = that.data.openid

  //       resolve([sign, openid, out_trade_no])

  //       // ------生成订单信息-------
  //       let tmp = that.data.address
  //       tmp['orderTime'] = app.CurrentTime_show()
  //       tmp['orderSuccess'] = true
  //       tmp['payTime'] = ''
  //       tmp['paySuccess'] = false
  //       tmp['sending'] = false
  //       tmp['finished'] = false

  //       const order_master = tmp

  //       var tmpList = []
  //       that.data.orders.forEach((val, idx, obj) => {
  //         tmpList.push([val.name, val.num, val.price])
  //       })
  //       order_master['medicineList'] = tmpList
  //       order_master['total'] = that.data.total
  //       order_master['openid'] = that.data.openid
  //       order_master['out_trade_no'] = out_trade_no


  //       console.log(order_master)
  //       that.setData({
  //         address: order_master
  //       })

  //       // 上传数据库
  //       app.addRowToSet('order_master', order_master, e => {
  //         console.log("订单状态已修改：【订单生成】" + e)
  //       })

  //     })


  //     p.then(e => {
  //       // 生成获取prepay_id请求的xml参数
  //       var xmlData = '<xml>' +
  //         '<appid>' + app.globalData.appid + '</appid>' +
  //         '<attach>test</attach>' +
  //         '<body>JSAPItest</body>' +
  //         '<device_info>WEB</device_info>' +
  //         '<mch_id>' + app.globalData.mch_id + '</mch_id>' +
  //         '<nonce_str>' + that.data.nonce_str + '</nonce_str>' +
  //         '<notify_url>http://www.weixin.qq.com/wxpay/pay.php</notify_url>' +
  //         '<openid>' + that.data.openid + '</openid>' +
  //         '<out_trade_no>' + e[2] + '</out_trade_no>' +
  //         '<spbill_create_ip>' + that.data.spbill_create_ip + '</spbill_create_ip>' +
  //         '<time_expire>' + app.beforeNowtimeByMin(-15) + '</time_expire>' +
  //         '<time_start>' + app.CurrentTime() + '</time_start>' +
  //         '<total_fee>' + parseInt(that.data.total * 100) + '</total_fee>' +
  //         '<trade_type>JSAPI</trade_type>' +
  //         '<sign>' + e[0] + '</sign>' +
  //         '</xml>'

  //       var tmpOutNum = e[2]
  //       // console.log(xmlData)

  //       // 获取prepay_id,发送支付请求，默认成功
  //       // wx.cloud.callFunction({
  //       //   name:'pay',
  //       //   data:{
  //       //     xmlData:xmlData
  //       //   }
  //       // })
  //       // .then(res=>{
  //       // if(res){
  //       // var prepay_id = res.result.body.split("<prepay_id><![CDATA[")[1].split("]]></prepay_id>")[0];
  //       var timeStamp = Math.round((Date.now() / 1000)).toString()
  //       var nonceStr = app.RndNum()
  //       var stringB =
  //         "appId=" + app.globalData.appid
  //         + "&nonceStr=" + nonceStr
  //         // + "&package=" + 'prepay_id=' + prepay_id
  //         + "&package=" + 'prepay_id=' + 0
  //         + "&signType=MD5"
  //         + "&timeStamp=" + timeStamp
  //       var paySignTemp = stringB + "&key=" + app.globalData.apikey
  //       // 签名MD5加密
  //       var paySign = md5.md5(paySignTemp).toUpperCase()
  //       // 调起请求
  //       // wx.requestPayment({
  //       //   appId: app.globalData.appid,
  //       //   timeStamp: timeStamp,
  //       //   nonceStr: nonceStr,
  //       //   package: 'prepay_id=' + prepay_id,
  //       //   signType: 'MD5',
  //       //   paySign: paySign,
  //       // success: function (e) {
  //       // console.log(e)
  //       // console.log(tmpOutNum)
  //       app.getInfoWhere('order_master', {
  //         'out_trade_no': tmpOutNum
  //       }, e => {
  //         var orderId = e.data["0"]._id
  //         app.updateInfo('order_master', orderId, {
  //           'paySuccess': true,
  //           'payTime': app.CurrentTime_show()
  //         }, e => {
  //           console.log("订单状态已修改：【支付成功】" + e)
  //           wx.showToast({
  //             title: '支付成功',
  //           })
  //           // wx.switchTab({
  //           //   url: '../me/me',
  //           // })
  //         })
  //       })
  //         // }
  //         // })
  //         // }
  //         // })
  //         // .catch(err => {
  //         //   if (err) {
  //         //     wx.showModal({
  //         //       title: '错误',
  //         //       content: '请重新点击支付~',
  //         //     })
  //         //   }
  //         // })
  //       // end获取openid
  //     })
  //     // end if 地址  
  //   }
  //   else {
  //     wx.showModal({
  //       title: 'Oh No',
  //       content: '请填写收货地址~',
  //     })
  //   }
  // },