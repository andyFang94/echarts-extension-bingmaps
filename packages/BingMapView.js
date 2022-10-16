import * as echarts from 'echarts';

const BingMapView = echarts.extendComponentView({
  type: 'bingmap',
  render: function (bingMapModel, ecModel, api) {
    let rendering = true;
    const bingmap = bingMapModel.getBingMap();
    const viewportRoot = api.getZr().painter.getViewportRoot();
    const coordSys = bingMapModel.coordinateSystem;

    const viewChangeHandler = function (arg) {
      if (rendering) {
        return;
      }

      const offsetEl = viewportRoot.parentNode.parentNode.parentNode;
      const mapOffset = [-parseInt(offsetEl.style.left, 10) || 0, -parseInt(offsetEl.style.top, 10) || 0];
      viewportRoot.style.left = mapOffset[0] + 'px';
      viewportRoot.style.top = mapOffset[1] + 'px';
      coordSys.setMapOffset(mapOffset);
      bingMapModel.__mapOffset = mapOffset;
      api.dispatchAction({
        type: 'bingmapRoam',
      });
    };
    Microsoft.Maps.Events.removeHandler(this._oldViewChangeHandler);
    this._oldViewChangeHandler = Microsoft.Maps.Events.addHandler(bingmap, 'viewchange', viewChangeHandler);
    Microsoft.Maps.Events.removeHandler(this._oldmapresize);
    this._oldmapresize = Microsoft.Maps.Events.addHandler(bingmap, 'mapresize', viewChangeHandler);
    rendering = false;
  },
  dispose() {
    const component = this.__model
    if (component) {
      component.getBingMap().destroy()
      component.setBingMap(null)
      component.setEChartsLayer(null)
      if (component.coordinateSystem) {
        component.coordinateSystem.setBingMap(null)
        component.coordinateSystem = null
      }
      delete this._oldViewChangeHandler
      delete this._oldmapresize
    }
  },
});

export default BingMapView;
