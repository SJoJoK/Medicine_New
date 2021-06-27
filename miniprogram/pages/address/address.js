Page({
  data: {
    address: {
      name: '',
      phone: '',
      detail: "",
      region: ['浙江省', '杭州市', '西湖区']
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
    this.setData({
      region: e.detail.value
    })
  },

  formSubmit(e) {
    const value = e.detail.value;
    value.region = this.data.address.region
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
        title: '保存失败',
        content: '请填写完整资料',
        showCancel: false
      })
    }
  }
})