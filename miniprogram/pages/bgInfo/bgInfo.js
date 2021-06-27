const app = getApp()

Page({
  data: {
    medicineInfo: {},
    tmpUrlArr: [],
    delMedicineId: "",
    cardNum: 1,
    files: [],
    time: 0,
    manageList: [],
    OTC: 0,
    isOTC: true,
    medicineID: null,  // 药品编号
    name: null,  // 药品名称
    price: null,  // 价格
    theClass: null,  // 类别
    theDetail: "",  // 描述
    symptom: null,  // 症状
    onShow: true,  // 上架
    isOTC_Arr: [
      "是",
      "否"
    ],
    reFresh: null
  },

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

  // 获取药品价格
  getPrice: function (e) {
    this.setData({
      price: e.detail.value
    })
  },

  // 获取药品分类
  getClass: function (e) {
    this.setData({
      theClass: e.detail.value
    })
  },

  // 获取药品症状
  getSymptom: function (e) {
    this.setData({
      symptom: e.detail.value
    })
  },

  // 获取是否OTC
  getOTC: function (e) {
    this.setData({
      isOTC: e.detail.value == '0' ? true : false,
      OTC: e.detail.value
    })
    console.log(this.data.OTC)
  },

  // 药品详细信息
  getInfoText: function (e) {
    this.setData({
      theDetail: e.detail.value
    })
    console.log(this.data.theDetail)
  },

  // 选择照片并预览
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
        app.upToClound("res", that.data.name + Math.random().toString(),
          res.tempFilePaths["0"], tmpUrl => {
            that.data.tmpUrlArr.push(tmpUrl)
          })
      }
    })
  },

  // 预览图片
  previewImage: function (e) {
    var that = this
    wx.previewImage({
      current: e.currentTarget.id,
      urls: that.data.tmpUrlArr
    })
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

  // 添加药品信息表单
  addMedicineInfo: function (e) {
    const that = this
    if (that.data.name && that.data.price && that.data.medicineID) {
      new Promise((resolve, reject) => {
        const { medicineID, name, price, symptom, isOTC, onShow } = that.data
        const theInfo = { medicineID, name, price, symptom, isOTC, onShow }
        console.log(theInfo)
        theInfo['imgArr'] = that.data.tmpUrlArr
        theInfo['imgUrl'] = that.data.tmpUrlArr[0]
        theInfo['class'] = that.data.theClass
        theInfo['detail'] = that.data.theDetail
        theInfo['sales'] = 0
        app.getInfoWhere('medicine_stock', {
          medicineID: medicineID
        }, e => {
          console.log(e.data)
          if (e.data) {
            reject(theInfo)
          }
          else {
            resolve(theInfo)
          }
        })
      }).then(theInfo => {
        app.addRowToSet('medicine_stock', theInfo, e => {
          console.log(e)
          wx.showToast({
            title: '添加成功'
          })
        })
        app.getInfoByOrder('medicine_stock', 'time', 'desc',
          e => {
            that.setData({
              manageList: e.data
            })
          }
        )
      }).catch(theInfo => {
        wx.showToast({
          title: '药品编号重复'
        })
      })
    }
    else {
      wx.showToast({
        title: '信息不完全'
      })
    }

  },

  // 上架药品
  upToLine: function (e) {
    var that = this
    app.updateInfo('medicine_stock', e.currentTarget.id, {
      onShow: true
    }, e => {
      that.getManageList()
      wx.showToast({
        title: '已上架'
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
        title: '已下架'
      })
    })
  },

  // 绑定删除药品名称参数
  getDelMedicineId: function (e) {
    var that = this
    app.getInfoWhere('medicine_stock', {
      name: e.detail.value
    }, res => {
      that.setData({
        delMedicineId: res.data["0"]._id
      })
    })
  },

  // 删除药品
  deleteMedicine: function () {
    var that = this
    console.log(that.data.delMedicineId)
    new Promise((resolve, reject) => {
      app.deleteInfoFromSet('medicine_stock', that.data.delMedicineId)
    })
      .then(that.getManageList())
  },

  // 关店
  offLine: function () {
    var that = this
    app.getInfoWhere('setting', {
      option: "offLine"
    }, res => {
      console.log(res)
      const ch = !res.data["0"].offLine
      console.log(res.data["0"])
      app.updateInfo('setting', res.data["0"]._id, {
        offLine: ch
      }, e => {
        console.log(e)
        wx.showToast({
          title: '操作成功'
        })
      })
    })
  },

  getManageList: function () {
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

  onReady: function () {

  },

  onShow: function () {
    this.getManageList()
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