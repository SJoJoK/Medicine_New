const app = getApp()

Page({
  data: {
    orderList: {},
    sendingList: {},
    finishedList: {},
    cardNum: 1
  },

  onLoad: function (options) {
    this.getAllList()
  },

  tapTo1: function () {
    var that = this
    that.setData({
      cardNum: 1
    })
  },

  tapTo2: function () {
    var that = this
    that.setData({
      cardNum: 2
    })
  },

  tapTo3: function () {
    var that = this
    that.setData({
      cardNum: 3
    })
  },

  tapTo4: function () {
    var that = this
    that.setData({
      cardNum: 4
    })
  },

  // 已支付-发货
  boxMedicine: function (e) {
    var that = this
    console.log(e.currentTarget.id)
    app.updateInfo('order_master', e.currentTarget.id, {
      sending: true,
      sendingTime: app.CurrentTime_show()
    }, e => {
      that.getAllList()
      wx.showToast({
        title: '已发货'
      })
    })
  },

  // 已发货-送达
  sendingMedicine: function (e) {
    var that = this
    console.log(e.currentTarget.id)
    const id = e.currentTarget.id
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
        console.log("订单状态已修改：已确认收货" + e)

        that.getAllList()
        wx.showToast({
          title: '已确认收货'
        })

      })
    })
  },

  // 获取所有订单信息
  getAllList: function () {
    var that = this
    app.getInfoByOrder('order_master', 'orderTime', 'desc', e => {
      that.setData({
        orderList: e.data
      })
      console.log(e.data)
    })
    app.getInfoByOrder('order_master', 'sendingTime', 'desc', e => {
      that.setData({
        sendingList: e.data
      })
    })
    app.getInfoByOrder('order_master', 'finishedTime', 'desc', e => {
      that.setData({
        finishedList: e.data
      })
    })
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