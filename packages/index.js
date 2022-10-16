import * as echarts from 'echarts';

import  BingMapCoordSys from './BingMapCoordSys';

import './BingMapModel';

import './BingMapView';

echarts.registerCoordinateSystem('bingmap', BingMapCoordSys);

echarts.registerAction({
  type: 'bingmapRoam',
  event: 'bingmapRoam',
  update: 'updateLayout',
}, function (payload, ecModel) {
  ecModel.eachComponent('bingmap', function (bingMapModel) {
    const bingmap = bingMapModel.getBingMap();
    const center = bingmap.getCenter();
    bingMapModel.setCenterAndZoom([center.longitude, center.latitude], bingmap.getZoom());
  });
});
