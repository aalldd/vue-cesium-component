export const measureTool = (view, unit, type) => {
  let activeTool;
  switch (type) {
    case 'length':
      activeTool = new Cesium.MeasureLengthTool(view.viewer, {unit});
      break;
    case 'area':
      activeTool = new Cesium.MeasureAreaTool(view.viewer, {unit});
      break;
    case 'triangle':
      activeTool = new Cesium.TriangulationTool(view.viewer);
      break;
    case 'slope':
      activeTool = new Cesium.MeasureSlopeTool(view.viewer);
      break;
    case 'distance':
      activeTool = new Cesium.MeasureLengthTool(view.viewer, {unit});
      break;
  }
  return activeTool;
};
