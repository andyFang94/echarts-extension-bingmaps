import * as echarts from "echarts";
const { util: zrUtil, graphic, matrix } = echarts;

function dataToCoordSize(dataSize, dataItem) {
  dataItem = dataItem || [0, 0];
  return zrUtil.map(
    [0, 1],
    function (dimIdx) {
      const val = dataItem[dimIdx];
      const halfSize = dataSize[dimIdx] / 2;
      const p1 = [];
      const p2 = [];
      p1[dimIdx] = val - halfSize;
      p2[dimIdx] = val + halfSize;
      p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
      return Math.abs(
        this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]
      );
    },
    this
  );
}

function BingMapCoordSys(bingmap, api) {
  this._bingmap = bingmap;
  // this.dimensions = ['lng', 'lat'];
  this._mapOffset = [0, 0];
  this._api = api;
}

const BingMapCoordSysProto = BingMapCoordSys.prototype;

// BingMapCoordSysProto.dimensions = ['lng', 'lat'];

BingMapCoordSysProto.setZoom = function (zoom) {
  this._zoom = zoom;
};

BingMapCoordSysProto.setCenter = function (center) {
  this._center = this._bingmap.tryLocationToPixel(
    new Microsoft.Maps.Location(center[1], center[0])
  );
};

BingMapCoordSysProto.setMapOffset = function (mapOffset) {
  this._mapOffset = mapOffset;
};

BingMapCoordSysProto.setBingMap = function (bingmap) {
  this._bingmap = bingmap;
};

BingMapCoordSysProto.getBingMap = function () {
  return this._bingmap;
};

BingMapCoordSysProto.dataToPoint = function (data) {
  const lnglat = new Microsoft.Maps.Location(data[1], data[0]);
  const px = this._bingmap.tryLocationToPixel(
    lnglat,
    Microsoft.Maps.PixelReference.control
  );
  const mapOffset = this._mapOffset;
  return [px.x - mapOffset[0], px.y - mapOffset[1]];
};

BingMapCoordSysProto.pointToData = function (pt) {
  const mapOffset = this._mapOffset;
  const lnglat = this._bingmap.tryPixelToLocation(
    {
      x: pt[0] + mapOffset[0],
      y: pt[1] + mapOffset[1],
    },
    Microsoft.Maps.PixelReference.control
  );

  return [lnglat.longitude, lnglat.latitude];
};

BingMapCoordSysProto.getViewRect = function () {
  const api = this._api;
  return new graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
};

BingMapCoordSysProto.getRoamTransform = function () {
  return matrix.create();
};

BingMapCoordSysProto.prepareCustoms = function () {
  const rect = this.getViewRect();
  return {
    coordSys: {
      // The name exposed to user is always 'cartesian2d' but not 'grid'.
      type: "bingmap",
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
    api: {
      coord: zrUtil.bind(this.dataToPoint, this),
      size: zrUtil.bind(dataToCoordSize, this),
    },
  };
};

BingMapCoordSysProto.convertToPixel = function (ecModel, finder, value) {
  return this.dataToPoint(value);
};

BingMapCoordSysProto.convertFromPixel = function (ecModel, finder, value) {
  return this.pointToData(value);
};

BingMapCoordSys.create = function (ecModel, api) {
  let bingmapCoordSys;
  ecModel.eachComponent("bingmap", function (bingmapModel) {
    if (
      typeof Microsoft === "undefined" ||
      typeof Microsoft.Maps === "undefined" ||
      typeof Microsoft.Maps.Map === "undefined"
    ) {
      throw new Error("Bing Map API has not been loaded completely yet.");
    }
    if (bingmapCoordSys) {
      throw new Error("Only one bingmap component is allowed");
    }
    let bingmap = bingmapModel.getBingMap();
    if (!bingmap) {
      const root = api.getDom();
      const painter = api.getZr().painter;
      const viewportRoot = painter.getViewportRoot();
      viewportRoot.className = "ms-composite";
      viewportRoot.style.visibility = "hidden";

      let bingmapRoot = root.querySelector(".ec-extension-bing-map");
      if (bingmapRoot) {
        // Reset viewport left and top, which will be changed
        // in moving handler in BingMapView
        viewportRoot.style.left = "0px";
        viewportRoot.style.top = "0px";
        root.removeChild(bingmapRoot);
      }

      bingmapRoot = document.createElement("div");
      bingmapRoot.className = "ec-extension-bing-map";
      bingmapRoot.style.cssText =
        "position:absolute;top:0;left:0;right:0;bottom:0;";
      root.appendChild(bingmapRoot);

      bingmap = new Microsoft.Maps.Map(bingmapRoot);
      const mapOption = bingmapModel.get("mapOption") || {};
      bingmap.setOptions(mapOption);

      bingmapRoot.querySelector(".MicrosoftMap").appendChild(viewportRoot);
      viewportRoot.style.visibility = "";

      bingmapModel.setBingMap(bingmap)
      bingmapModel.setEChartsLayer(viewportRoot)

      painter.getViewportRootOffset = function () {
        return {
          offsetLeft: 0,
          offsetTop: 0,
        };
      };
    }
    let viewOption = bingmapModel.get("viewOption");
    let { center, zoom } = viewOption;
    const normalizedCenter = [
      center.lng != undefined ? center.lng : center[0],
      center.lat != undefined ? center.lat : center[1],
    ];

    if (center && zoom) {
      const bingmapCenter = bingmap.getCenter();
      const bingmapZoom = bingmap.getZoom();
      const centerOrZoomChanged = bingmapModel.centerOrZoomChanged(
        [bingmapCenter.longitude, bingmapCenter.latitude],
        bingmapZoom
      );
      if (centerOrZoomChanged) {
        const pt = new Microsoft.Maps.Location(
          normalizedCenter[1],
          normalizedCenter[0]
        );
        bingmap.setView({
          center: pt,
          zoom: zoom,
        });
      }
    }

    bingmapCoordSys = new BingMapCoordSys(bingmap, api);
    bingmapCoordSys.setMapOffset(bingmapModel.__mapOffset || [0, 0]);
    bingmapCoordSys.setZoom(zoom);
    bingmapCoordSys.setCenter(center);
    bingmapModel.coordinateSystem = bingmapCoordSys;
  });
  ecModel.eachSeries(function (seriesModel) {
    if (seriesModel.get("coordinateSystem") === "bingmap") {
      seriesModel.coordinateSystem = bingmapCoordSys;
    }
  });
};

BingMapCoordSysProto.dimensions = BingMapCoordSys.dimensions = ["lng", "lat"];

BingMapCoordSysProto.type = "bingmap";

export default BingMapCoordSys;
