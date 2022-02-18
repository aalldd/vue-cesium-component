export default {
  /**
   * @type Boolean
   * @description 控制面板是否可拖动
   */
  draggable: {typs: Boolean, default: true},
  /**
   * @type Boolean
   * @description 控制面板是否可收缩
   */
  expandable: {typs: Boolean, default: true},
  closable: {typs: Boolean, default: true},
  title: {typs: String, default: ''},
  panelClassName: {
    typs: String
  },
  panelStyle: {
    typs: Object,
    default: () => {
      return {
        width: '400px',
        position:'absolute',
        right:'4em',
        top:'4em'
      };
    }
  }
};
