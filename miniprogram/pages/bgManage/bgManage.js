const app = getApp()

Page({
  data: {
    orderList:{},
    sendingList:{},
    finishedList:{},
    cardNum: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllList()
  },

  // --------------------!!!  选项卡切换  !!!----------------------
  tapTo1: function () {  //添加
    var that = this
    that.setData({
      cardNum: 1
    })
  },
  tapTo2: function () { //修改和删除
    var that = this
    that.setData({
      cardNum: 2
    })
    // console.log(getCurrentPages())
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

  // ----------------------!!!  订单管理  !!!----------------------
  // 已支付-发货
  boxMedicine: function(e) {
    var that = this
    console.log(e.currentTarget.id)
    app.updateInfo('order_master', e.currentTarget.id, {
      sending: true,
      sendingTime: app.CurrentTime_show()
    }, e => {
      that.getAllList()
      wx.showToast({
        title: '【已发货】',
      })
    })
  },

  // 已发货-送达
  sendingMedicine: function(e) {
    var that = this
    console.log(e.currentTarget.id)
    const id = e.currentTarget.id
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
  
  // 获取所有订单信息
  getAllList:function(){
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})