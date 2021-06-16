// miniprogram/pages/healthdoc.js
import * as echarts from '../../components/ec-canvas/echarts';
const app=getApp();

Page({
  data: {
    //图表
    line:{
      lazyLoad:true
    },
    pie: {
      lazyLoad:true//懒加载（有加载动画）
    }
  },

  onLoad: function () {
      this.echarCanve = this.selectComponent("#mychart-dom-bar-bt");
      this.initbt();
      this.echarCanve_line = this.selectComponent("#mychart-dom-line");
      this.initbt_line();

  },
  initbt:function(){
      this.echarCanve.init((canvas, width, height)=> {
          this.chart = echarts.init(canvas, null, {
            width: width,
            height: height
          });

          this.chart.setOption(
          {
            backgroundColor: '#fff',
            title: {
                text: '购买药品种类',
                left: 'center',
                textStyle: {
                    color: '#000',
                    fontSize: 15
                }        
            },
        
            tooltip: {
                trigger: 'item'
            },
        
            visualMap: {
                show: false,
                min: 80,
                max: 600,
                inRange: {
                    colorLightness: [0, 1]
                }
            },
            series: [
                {
                    name: '药品种类',
                    type: 'pie',
                    radius: '80%',
                    center: ['50%', '57%'],
                    data: [
                      {value: 300, name: '头疼脑热'}
            ].sort(function (a, b) { return a.value - b.value; }),
                    // roseType: 'radius',
                    label: {
                        color: '#fff',
                        show:true,
                        position:'inner'
                    },
                    labelLine: {
                        lineStyle: {
                            color: '#fff'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    },
                    itemStyle: {
                        color: '#c23531',
                        shadowBlur: 200,
                        shadowColor: 'rgba(0, 0, 0, 0)'
                    },
        
                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay: function (idx) {
                        return Math.random() * 200;
                    }
                }
            ]
          }
          
          );

          return this.chart;//一定要返回！不然影响事件回调！
          });

          app.getInfoByOrder('cata_hinfo','catalog','asc',
          e=>{
              e=e.data;
              var cntlist=[];
              e.forEach(element => {
                cntlist.push(element.count);
              });
              
              this.chart.setOption({
                visualMap:{
                  min:Math.min(...cntlist)/2,
                  max:Math.max(...cntlist)*2,
                  inRange: {
                    colorLightness: [1,0]
                }
                },
                series:[
                  {
                    data:[
                        {value: e[0].count, name: '头疼脑热'},
                        {value: e[1].count, name: '跌打损伤'},
                        {value: e[2].count, name: '内分泌调节'},
                        {value: e[3].count, name: '抗菌消炎'},
                        {value: e[4].count, name: '保健养生'},
                        {value: e[5].count, name: '特殊药品'}
                    ]
                  }
                ]
              });
              }
          );

  },

  initbt_line:function(){
    this.echarCanve_line.init((canvas, width, height)=> {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });
      app.getInfoByOrder('time_hinfo','month','asc',
          e=>{
              e=e.data;
              var option = {
                  title: {
                      text: '过去一年购药量',
                      left: 'center',
                      textStyle: {
                          color: '#000',
                          fontSize: 15
                      }        
                  },
                  xAxis: {
                      type: "category",
                      data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月","八月","九月","十月","十一月","十二月"]
                  },
                  yAxis: {},
                  series: [{
                      data: [ e[0].count,
                              e[1].count,
                              e[2].count,
                              e[3].count,
                              e[4].count,
                              e[5].count,
                              e[6].count,
                              e[7].count,
                              e[8].count,
                              e[9].count,
                              e[10].count,
                              e[11].count,
                             ],
                      type: "line"
                  }],
                          dataZoom: [{
                      startValue: '一月'
                  }, { 
                      type: 'inside'
                  }],
                  };
              chart.setOption(option);
              return option;
          }
    );
    return chart;
  })    
  }

});