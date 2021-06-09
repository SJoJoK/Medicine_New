// components/search/search.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    searchWord:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取搜索词
    listenerSearchInput: function (e) {
      // console.log(e.detail.value)
      getCurrentPages()["0"].setData({
        searchWord: e.detail.value
      })
    },

    btnCancel() {
      this.setData({
        inputValue: ""
      })
    },

    // 点击查找按钮
    toSearch: function(e){
      const db = wx.cloud.database()
      const _ = db.command
      const myWord = getCurrentPages()["0"].data.searchWord

      console.log(myWord)

    if(myWord == "" || myWord == undefined)
    return;
      else{
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
            regexp:myWord,
            options:'i'})
        },
        {
          symptom: db.RegExp({
            regexp: myWord,
            options: 'i'
          })
        }
      ]),
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
