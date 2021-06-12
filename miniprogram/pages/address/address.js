Page({
  data: {
    address: {
    name: '',
    phone: '',
    detail: "",
    region: ['浙江省', '杭州市', '西湖区'],
    },
  },

  onLoad() {
    var self = this;
    wx.getStorage({
      key: 'address',
      success: function (res) {
        self.setData({
          address: res.data
        })
      }
    })

  },



  getRegion: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },

  formSubmit(e) {
    const value = e.detail.value;
    value.region = this.data.address.region
    console.log(value)
    if (value.name && value.phone.length === 11 && value.detail) {
      console.log(value)
      wx.setStorage({
        key: 'address',
        data: value,
        success() {
          wx.navigateBack();
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请填写完整资料',
        showCancel: false
      })
    }
  }
})