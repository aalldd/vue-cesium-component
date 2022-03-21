<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <div v-show="displayTable">
        <div class="pipe-item">
          <span style="flex: 1;margin-left: 10px">{{ statisticText }}</span>
          <a-button style="margin-right: 15px" @click="seeCharts">
            <a-icon type="bar-chart"/>
            统计图
          </a-button>
          <a-button @click="onExport">
            <a-icon type="export"/>
            导出
          </a-button>
        </div>
        <div class="table-area">
          <a-table class="table"
                   :data-source="dataSource"
                   :bordered="true"
                   ref="tableRef"
                   :scroll="scrollStyle"
                   :pagination="false"
                   size="small"
                   :columns="tableColumn">
          </a-table>
        </div>
      </div>
      <div v-show="!displayTable">
        <div class="pipe-item">
          <span style="flex: 1;margin-left: 10px">{{ statisticText }}</span>
          <a-button @click="seeTable">
            <a-icon type="table"/>
            表格
          </a-button>
        </div>
        <div id="pie-chart" style="width:450px;height: 300px"></div>
        <div id="line-chart" style="width:450px;height: 360px"></div>
      </div>
    </template>
  </municipal-panel>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import exportXLSX from "@/util/operators/exportExcel";
import panelOptions from "@/util/options/panelOptions";
//因为组件库中只有这里使用到了echarts，所以按需引入，节省体积
const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/pie');
require('echarts/lib/chart/line');
require('echarts/lib/chart/bar');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/legend');
require('echarts/lib/component/toolbox');

export default {
  name: "municipal-statistic-chart",
  mixins: [loadingM3ds],
  data() {
    return {
      statisticText: '',
      //数据展示形式，默认是表格形式
      displayTable: true,
      dataSource: [],
      scrollStyle: {y: 600}
    };
  },
  props: {
    ...panelOptions,
    panelStyle: {
      type: Object,
      default: () => {
        return {
          width: '500px',
          position: 'absolute',
          left: '2em',
          top: '2em'
        };
      }
    },
    //直接获取服务返回的数据格式
    statistic: {
      type: Array,
      default: () => {
        return [];
      }
    },
    layerType: {
      type: String
    },
    colors: {
      type: Array,
      default: () => {
        return ['#0082fc', '#fdd845', '#05f8d6', '#22ed7c', '#09b0d3', '#ff4600', '#f9e264', '#f47a75', '#009db2', '#024b51', '#0780cf', '#765005'];
      }
    }
  },
  watch: {
    statistic: {
      handler() {
        if (this.statistic?.length) {
          this.formatStatistics();
        }
      },
      immediate: true
    }
  },
  computed: {
    tableColumn() {
      let fieldTitle = "", totalTitle = "";
      if (this.layerType && _.endsWith(this.layerType, 'line')) {
        fieldTitle = "长度(米)";
        totalTitle = "总长度(米)";
      } else {
        fieldTitle = "数量(个)";
        totalTitle = "总数量(个)";
      }
      const columns = [
        {
          title: '所属管网',
          dataIndex: 'pipeName',
          key: 'pipeName',
          width: "90px",
          align: "center",
          ellipsis: true,
          customRender: (text, record, index) => this.renderName(text, record, index, "所属管网")
        },
        {
          title: '字段',
          dataIndex: 'fieldName',
          key: 'fieldName',
          width: "90px",
          align: "center",
          ellipsis: true,
          customRender: (text, record, index) => this.renderName(text, record, index, "字段")
        },
        {
          title: totalTitle,
          dataIndex: 'total',
          key: 'total',
          width: "90px",
          align: "center",
          ellipsis: true,
          customRender: (text, record, index) => this.renderName(text, record, index, "总长")
        },
        {
          title: '字段值',
          dataIndex: 'fieldValue',
          key: 'fieldValue',
          width: "90px",
          align: "center",
          ellipsis: true,
        },
        {
          title: fieldTitle,
          dataIndex: 'count',
          key: 'count',
          width: "90px",
          align: "center",
          ellipsis: true,
        }
      ];
      return columns;
    },
  },
  methods: {
    formatStatistics() {
      //判断是点还是线统计并取对应的数据
      let fieldName = "", fieldValuesName = "", countFieldName = "", labelText = "";
      if (this.layerType && _.endsWith(this.layerType, 'line')) {
        fieldName = "lineInfos";
        fieldValuesName = "lineFldVues";
        countFieldName = "nlen";
        labelText = "总长: $(米)";
      } else {
        fieldName = "pntInfos";
        fieldValuesName = "pntFldVues";
        countFieldName = "nNum";
        labelText = "总计: $(个)";
      }
      let dataSource = [], rowkey = 0, totalSum = 0;
      this.statistic.map(data => {
        data[fieldName].map((items, fieldIndex) => {
          items[fieldValuesName].map((item, valIndex) => {
            let pipeSpan = 0, fieldSpan = 0, tlen = 0;
            if (valIndex === 0) {
              fieldSpan = items[fieldValuesName].length;
              items[fieldValuesName].forEach(element => {
                tlen += element[countFieldName];
              });
              if (fieldIndex === 0) {
                totalSum += tlen;
                data[fieldName].forEach(element => {
                  pipeSpan += element[fieldValuesName].length;
                });
              }
            }
            dataSource.push({
              key: rowkey,
              pipeSpan: pipeSpan,
              fieldSpan: fieldSpan,
              pipeName: data.pipeNetName,
              fieldName: items.field,
              fieldValue: item.fldVue,
              count: item[countFieldName],
              total: parseFloat(tlen.toFixed(2))
            });
            rowkey++;
          });
        });
      });
      this.dataSource = dataSource;
      this.statisticText = labelText.replace("$", parseFloat(totalSum.toFixed(2)));
    },
    renderName(text, record, index, title) {
      let span = 0;
      if (title == "所属管网") {
        span = record.pipeSpan;
      } else {
        span = record.fieldSpan;
      }
      return {
        children: text,
        attrs: {
          rowSpan: span
        }
      };
    },
    onExport() {
      const exportData = this.dataSource.map(item => {
        let result = {};
        for (let key in item) {
          const target = this.tableColumn.find(col => col.dataIndex === key);
          if (target) {
            result[target.title] = item[key];
          }
        }
        return result;
      });
      exportXLSX([exportData], ['管网统计'], `${this.title}结果`);
    },
    drawPie() {
      let pieChart = echarts.init(document.getElementById('pie-chart'), {}, {width: 'auto', height: 'auto'});
      const option = this.getPieOption();
      pieChart.setOption(option);
      pieChart.resize();
    },
    drawLine() {
      let lineChart = echarts.init(document.getElementById('line-chart'), {}, {width: 'auto', height: 'auto'});
      const option = this.getLineOption();
      lineChart.setOption(option);
    },
    seeCharts() {
      this.displayTable = false;
      this.drawPie();
      this.drawLine();
    },
    getPieOption() {
      let legendData = [], data = [], unit = "";
      this.dataSource.map(item => {
        if (item.pipeSpan !== 0) {
          legendData.push(item.pipeName);
          data.push({name: item.pipeName, value: item.total});
        }
      });
      if (_.endsWith(this.layerType, 'line')) {
        unit = "(米)";
      } else {
        unit = "(个)";
      }
      return {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            let res = params.name;
            res += ':' + params.value + unit;
            return res;
          }
        },
        legend: {
          left: 'center',
          data: legendData,
          textStyle: {
            color: this.colors[this.colors.length - 1]
          }
        },
        grid: {
          bottom: 80,
          top: 60,
          right: 60,
          left: 50
        },
        series: [
          {
            name: '总长',
            type: 'pie',
            radius: '60%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              color: (params) => {
                let colorList = this.colors;
                return colorList[params.dataIndex];
              }
            }
          }
        ]
      };
    },
    getLineOption() {
      let data = [];
      this.dataSource.map(item => {
        if (item.pipeSpan !== 0) {
          data.push({name: item.pipeName, value: item.total});
        }
      });
      let xData = data.map(item => item.name);
      let yData = data.map(item => item.value);
      let unit = "";
      if (_.endsWith(this.layerType, 'line')) {
        unit = "(米)";
      } else {
        unit = "(个)";
      }
      return {
        grid: {
          left: '5px',
          right: '25px',
          bottom: '5px',
          top: '25px',
          containLabel: true
        },
        toolbox: {
          feature: {
            magicType: {type: ['line', 'bar']},//图表类型切换
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: function (params) {
            let res = params[0].name;
            res += ':' + params[0].value + unit;
            return res;
          }
        },
        xAxis: {
          data: xData,
          splitLine: {
            show: false,
            lineStyle: {
              type: 'dotted',
            }
          },
          axisLabel: {
            show: true,
            textStyle: {
              fontSize: 12
            },
            rotate: 40,
            color: this.colors[this.colors.length - 1]
          },
          axisLine: {
            lineStyle: {
              color: this.colors[this.colors.length - 1]
            },
          }
        },
        yAxis: {
          type: 'value',
          data: yData,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: 'rgba(255,255,255,.7)'
            }
          },
          axisLabel: {
            show: true,
            textStyle: {
              fontSize: 12
            },
            color: this.colors[this.colors.length - 1]
          },
          axisLine: {
            lineStyle: {
              color: this.colors[this.colors.length - 1]
            },
          }
        },
        series: [
          {
            type: 'bar',
            data: yData,
            barMaxWidth: 50,
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'top',
                  textStyle: {
                    fontSize: 12,
                  }
                },
                color: (params) => {
                  let colorList = this.colors;
                  return colorList[params.dataIndex];
                }
              },
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
          }],
      };
    },
    seeTable() {
      this.displayTable = true;
    }
  }
};
</script>

<style lang="scss">
@import "../var";

.pipe-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.table-area {
  width: 100%;
}

.table {
  border: 1px solid $border-color-base;
  border-radius: 4px;
  background-color: $panel-background;

  .ant-table table {
    text-align: center;
  }

  .ant-table-row-cell-break-word {
    text-align: center;
  }

  .ant-table {
    font-size: 10px;
    line-height: 1.3;
  }

  .ant-table-small > .ant-table-content > .ant-table-header > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-body > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-scroll > .ant-table-header > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-scroll > .ant-table-body > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-fixed-left > .ant-table-header > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-fixed-right > .ant-table-header > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-fixed-left > .ant-table-body-outer > .ant-table-body-inner > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-fixed-right > .ant-table-body-outer > .ant-table-body-inner > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-header > table > .ant-table-tbody > tr > td,
  .ant-table-small > .ant-table-content > .ant-table-body > table > .ant-table-tbody > tr > td,
  .ant-table-small > .ant-table-content > .ant-table-scroll > .ant-table-header > table > .ant-table-tbody > tr > td,
  .ant-table-small > .ant-table-content > .ant-table-scroll > .ant-table-body > table > .ant-table-tbody > tr > td,
  .ant-table-small > .ant-table-content > .ant-table-fixed-left > .ant-table-header > table > .ant-table-tbody > tr > td,
  .ant-table-small > .ant-table-content > .ant-table-fixed-right > .ant-table-header > table > .ant-table-tbody > tr > td,
  .ant-table-small > .ant-table-content > .ant-table-fixed-left > .ant-table-body-outer > .ant-table-body-inner > table > .ant-table-tbody > tr > td,
  .ant-table-small > .ant-table-content > .ant-table-fixed-right > .ant-table-body-outer > .ant-table-body-inner > table > .ant-table-tbody > tr > td {
    padding: 4px;
  }
}
</style>
