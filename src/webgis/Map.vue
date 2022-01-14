<template>
  <mapgis-web-map>
    <mapgis-rastertile-layer :layerId="layerId" :url="url" />
    <mapgis-draw
        position="top-left"
        :styles="styles"
        :controls="controls"
        v-on:added="handleDrawAdded"
        v-on:drawcreate="handleDrawCreate"
        ref="draw"
        class="mapgisDrawStyle"
    >
      <mapgis-ui-button-group class="mapgis-2d-draw-wrapper">
        <mapgis-ui-tooltip
            v-for="(item, i) in draws"
            :key="i"
            placement="bottom"
        >
          <template slot="title">
            <span>{{ item.tip }}</span>
          </template>
          <mapgis-ui-button
              circle
              size="small"
              :type="item.type"
              @click="item.click"
          >
            <mapgis-ui-iconfont :type="item.icon" />
          </mapgis-ui-button>
        </mapgis-ui-tooltip>
      </mapgis-ui-button-group>
    </mapgis-draw>
  </mapgis-web-map>
</template>

<script>
export default {
  name: 'DrawExample',
  data() {
    return {
      layerId: 'igsLayer_layerId',
      url:
          'http://t0.tianditu.com/DataServer?T=vec_w&L={z}&Y={y}&X={x}&tk=9c157e9585486c02edf817d2ecbc7752',
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false,
        combine_features: false,
        uncombine_features: false
      },
      styles: [
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#FF0000',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        }
      ],
      drawer: undefined,
      draws: [
        {
          icon: 'mapgis-huizhidian2',
          type: 'default',
          tip: '点选几何,按住shift可以框选',
          click: this.toggleSimple
        },
        {
          icon: 'mapgis-huizhidian2',
          type: 'primary',
          tip: '画点',
          click: this.togglePoint
        },
        {
          icon: 'mapgis-huizhixian1',
          type: 'primary',
          tip: '画线',
          click: this.togglePolyline
        },
        {
          icon: 'mapgis-huizhijuxing',
          type: 'primary',
          tip: '画矩形',
          click: this.toggleRect
        },
        {
          icon: 'mapgis-draw-polygon',
          type: 'primary',
          tip: '画多边形',
          click: this.togglePolygon
        },
        {
          icon: 'mapgis-huizhiyuan1',
          type: 'primary',
          tip: '画圆',
          click: this.toggleCircle
        },
        {
          icon: 'mapgis-icon_huizhiyuanxing',
          type: 'primary',
          tip: '画半径',
          click: this.toggleRadius
        },
        {
          icon: 'mapgis-clear',
          type: 'primary',
          tip: '删除选中图元',
          click: this.toggleDelete
        },
        {
          icon: 'mapgis-shanchu_dianji',
          type: 'primary',
          tip: '删除全部',
          click: this.toggleDeleteAll
        },
        {
          icon: 'mapgis-huizhijuxing',
          type: 'default',
          tip: '矩形查询',
          click: this.toggleQueryByRect
        },
        {
          icon: 'mapgis-draw-polygon',
          type: 'default',
          tip: '多边形查询',
          click: this.toggleQueryByPolygon
        }
      ]
    }
  },
  created() {},
  methods: {
    handleDrawAdded(e) {
      const { drawer } = e
      this.drawer = drawer
    },
    enableDrawer() {
      const component = this.$refs.draw
      if (component) {
        component.enableDrawer()
      }
    },
    toggleSimple() {
      this.enableDrawer()
      this.drawer && this.drawer.changeMode('simple_select')
    },
    togglePoint() {
      this.enableDrawer()
      this.drawer && this.drawer.changeMode('draw_point')
    },
    togglePolyline() {
      this.enableDrawer()
      this.drawer && this.drawer.changeMode('draw_line_string')
    },
    togglePolygon() {
      this.enableDrawer()
      this.drawer && this.drawer.changeMode('draw_polygon')
    },
    toggleRect() {
      this.enableDrawer()
      this.drawer && this.drawer.changeMode('draw_rectangle')
    },
    toggleCircle() {
      this.enableDrawer()
      this.drawer && this.drawer.changeMode('draw_circle')
    },
    toggleRadius() {
      this.enableDrawer()
      this.drawer && this.drawer.changeMode('draw_radius')
    },
    toggleDelete() {
      this.enableDrawer()
      this.drawer && this.drawer.delete()
    },
    toggleDeleteAll() {
      this.enableDrawer()
      this.drawer && this.drawer.deleteAll()
    },
    toggleQueryByRect() {},
    toggleQueryByPolygon() {},
    handleDrawCreate() {}
  }
}
</script>
<style>
.mapgisDrawStyle{
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3000;
}
</style>