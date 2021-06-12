// miniprogram/pages/bgInfo/bgInfo.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    medicineInfo: {},
    tmpUrlArr: [],
    delMedicineId: "",
    cardNum: 1,
    files: [],
    time:0,
    manageList:[], //管理页面信息列表
    OTC:0,
    isOTC:true,

    // 上传的信息
    medicineID:null, //药品编号
    name:null,    //药品名称
    price:null,   //价格
    theClass:null,    //类别
    theDetail:"",    //描述
    symptom:null, //症状
    onShow:true,  //上架

    isOTC_Arr:[
      "是",
      "否"
    ],
    reFresh:null
  },

  //------------------------!!! 获取信息 !!!------------------------
  // 获取药品编号
  getMedicineID: function (e) {
    this.setData({
      medicineID: parseInt(e.detail.value)
    })
  },

  // 获取药品名称
  getName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 获取价格
  getPrice: function (e) {
    this.setData({
      price: e.detail.value
    })
  },

  // 获取分类
  getClass: function (e) {
    this.setData({
      theClass: e.detail.value
    })
  },

  
  // 获取症状
  getSymptom: function (e) {
    this.setData({
      symptom: e.detail.value
    })
  },

  //获取OTC
  getOTC:function(e){
    // console.log(e.detail.value)
      this.setData({
        isOTC:e.detail.value == '0'?true:false,
        OTC:e.detail.value
      })
      console.log(this.data.OTC)
  },

  //药品详细信息
  getInfoText: function (e) {
    this.setData({
      theDetail: e.detail.value
    })
    console.log(this.data.theDetail)
  },

  //选择照片并预览（预览地址在files，上传后的地址在tmpUrlArr）
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
        
        app.upToClound("res", that.data.name + Math.random().toString(), 
        res.tempFilePaths["0"], tmpUrl => {
          // console.log(tmpUrl)
          that.data.tmpUrlArr.push(tmpUrl)
          // console.log(getCurrentPages())
        })
      }
    })
    // console.log(getCurrentPages())
  },

  //预览图片
  previewImage: function (e) {
    var that = this
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: that.data.tmpUrlArr // 需要预览的图片http链接列表
    })
  },

  // --------------------!!!  选项卡切换  !!!----------------------
  tapTo1: function() {  //添加
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

  // ----------------------!!!  提交操作  !!!---------------------
  // 添加药品信息表单
  addMedicineInfo: function(e){
    const that = this
    if (that.data.name && that.data.price){
      new Promise((resolve, reject) => {
        const { medicineID, name, price, symptom, isOTC, onShow } = that.data
        const theInfo = { medicineID, name, price, symptom, isOTC,onShow }
        console.log(theInfo)
        theInfo['imgArr'] = that.data.tmpUrlArr
        theInfo['imgUrl'] = that.data.tmpUrlArr[0]
        theInfo['class'] = that.data.theClass
        theInfo['detail'] = that.data.theDetail
        theInfo['sales'] = 0
        resolve(theInfo)
      }).then(theInfo => {
        // 上传所有信息
        app.addRowToSet('medicine_stock', theInfo, e => {
          console.log(e)
          wx.showToast({
            title: '添加成功',
          })
        })
        app.getInfoByOrder('medicine_stock', 'time', 'desc',
          e => {
            that.setData({
              manageList: e.data
            })
          }
        )
      })
    }
    else{
      wx.showToast({
        title: '信息不完全',
      })
    }
    
  },

  // ----------------------!!!  修改药品参数  !!!----------------------
  // 上架药品
  upToLine:function(e){
    var that = this
    // console.log(e.currentTarget.id)
    app.updateInfo('medicine_stock', e.currentTarget.id,{
      onShow: true
    },e=>{
      that.getManageList()
      wx.showToast({
        title: '已上架',
      })
    })
  },
  
  // 下架药品
  downFromLine: function (e) {
    var that = this
    console.log(e.currentTarget.id)
    app.updateInfo('medicine_stock', e.currentTarget.id, {
      onShow: false
    }, e => {
      console.log(e)
      that.getManageList()
      wx.showToast({
        title: '已下架',
      })
    })
  },

  // 绑定删除药品名称参数
  getDelMedicineId: function(e) {
    var that = this
    app.getInfoWhere('medicine_stock',{
      name: e.detail.value
    },res=>{
      that.setData({
        delMedicineId: res.data["0"]._id
      })
    })
  },

  // 删除药品
  deleteMedicine: function() {
    // app.deleteInfoFromSet('medicine_stock',"葡萄")
    var that = this
    console.log(that.data.delMedicineId)
    new Promise((resolve,reject)=>{
      app.deleteInfoFromSet('medicine_stock', that.data.delMedicineId)
    })
    .then(that.getManageList())
  },

  // 程序下线打烊
  offLine: function () {
    var that = this
    app.getInfoWhere('setting', {
      option: "offLine"
    }, res => {
      console.log(res)
      const ch = !res.data["0"].offLine
      console.log(res.data["0"])
      app.updateInfo('setting', res.data["0"]._id,{
        offLine: ch
      },e=>{
        console.log(e)
        wx.showToast({
          title: '操作成功',
        })
      })
    })
  },


  /**
   * ----------------------!!!  生命周期函数--监听页面加载  !!!----------------------
   */
  getManageList:function(){
    var that = this
    app.getInfoByOrder('medicine_stock', 'time', 'desc',
      e => {
        that.setData({
          manageList: e.data
        })
      }
    )
  },

  onLoad: function (options) {
    this.getManageList()
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
    this.getManageList()
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
    (timer = setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 500));

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