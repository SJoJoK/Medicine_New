const app = getApp()

Component({
  properties: {

  },

  data: {
    searchWord: ''
  },

  methods: {
    // 获取搜索词
    listenerSearchInput: function (e) {
      getCurrentPages()["0"].setData({
        searchWord: e.detail.value
      })
    },

    // 清除搜索词
    btnCancel() {
      this.setData({
        inputValue: ""
      })
    },

    // 点击搜索按钮
    toSearch: function (e) {
      const db = wx.cloud.database()
      const _ = db.command
      const myWord = getCurrentPages()["0"].data.searchWord

      if (myWord == "" || myWord == undefined)
        return;
      else {
        getCurrentPages()["0"].setData({
          rules: _.or([
            {
              name: db.RegExp({
                regexp: myWord,
                options: 'i'
              })
            },
            {
              symptom: db.RegExp({
                regexp: myWord,
                options: 'i'
              })
            }])
        })

        app.getInfoWhere('medicine_stock', _.or([
          {
            name: db.RegExp({
              regexp: myWord,
              options: 'i'
            })
          },
          {
            symptom: db.RegExp({
              regexp: myWord,
              options: 'i'
            })
          }]),
          e => {
            console.log(e.data)
            getCurrentPages()["0"].setData({
              medicineInfo: e.data,
              activeTypeId: -1,
              activeOrderId: 0
            })
          }
        )
      }
    }
  }
})
