import * as h from "echarts";
const { util: d, graphic: M, matrix: _ } = h;
function w(t, n) {
  return n = n || [0, 0], d.map(
    [0, 1],
    function(e) {
      const o = n[e], i = t[e] / 2, p = [], s = [];
      return p[e] = o - i, s[e] = o + i, p[1 - e] = s[1 - e] = n[1 - e], Math.abs(
        this.dataToPoint(p)[e] - this.dataToPoint(s)[e]
      );
    },
    this
  );
}
function g(t, n) {
  this._bingmap = t, this._mapOffset = [0, 0], this._api = n;
}
const r = g.prototype;
r.setZoom = function(t) {
  this._zoom = t;
};
r.setCenter = function(t) {
  this._center = this._bingmap.tryLocationToPixel(
    new Microsoft.Maps.Location(t[1], t[0])
  );
};
r.setMapOffset = function(t) {
  this._mapOffset = t;
};
r.setBingMap = function(t) {
  this._bingmap = t;
};
r.getBingMap = function() {
  return this._bingmap;
};
r.dataToPoint = function(t) {
  const n = new Microsoft.Maps.Location(t[1], t[0]), e = this._bingmap.tryLocationToPixel(
    n,
    Microsoft.Maps.PixelReference.control
  ), o = this._mapOffset;
  return [e.x - o[0], e.y - o[1]];
};
r.pointToData = function(t) {
  const n = this._mapOffset, e = this._bingmap.tryPixelToLocation(
    {
      x: t[0] + n[0],
      y: t[1] + n[1]
    },
    Microsoft.Maps.PixelReference.control
  );
  return [e.longitude, e.latitude];
};
r.getViewRect = function() {
  const t = this._api;
  return new M.BoundingRect(0, 0, t.getWidth(), t.getHeight());
};
r.getRoamTransform = function() {
  return _.create();
};
r.prepareCustoms = function() {
  const t = this.getViewRect();
  return {
    coordSys: {
      type: "bingmap",
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height
    },
    api: {
      coord: d.bind(this.dataToPoint, this),
      size: d.bind(w, this)
    }
  };
};
r.convertToPixel = function(t, n, e) {
  return this.dataToPoint(e);
};
r.convertFromPixel = function(t, n, e) {
  return this.pointToData(e);
};
g.create = function(t, n) {
  let e;
  t.eachComponent("bingmap", function(o) {
    if (typeof Microsoft > "u" || typeof Microsoft.Maps > "u" || typeof Microsoft.Maps.Map > "u")
      throw new Error("Bing Map API has not been loaded completely yet.");
    if (e)
      throw new Error("Only one bingmap component is allowed");
    let i = o.getBingMap();
    if (!i) {
      const c = n.getDom(), f = n.getZr().painter, l = f.getViewportRoot();
      l.className = "ms-composite", l.style.visibility = "hidden";
      let a = c.querySelector(".ec-extension-bing-map");
      a && (l.style.left = "0px", l.style.top = "0px", c.removeChild(a)), a = document.createElement("div"), a.className = "ec-extension-bing-map", a.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;", c.appendChild(a), i = new Microsoft.Maps.Map(a);
      const y = o.get("mapOption") || {};
      i.setOptions(y), a.querySelector(".MicrosoftMap").appendChild(l), l.style.visibility = "", o.setBingMap(i), o.setEChartsLayer(l), f.getViewportRootOffset = function() {
        return {
          offsetLeft: 0,
          offsetTop: 0
        };
      };
    }
    let p = o.get("viewOption"), { center: s, zoom: m } = p;
    const u = [
      s.lng != null ? s.lng : s[0],
      s.lat != null ? s.lat : s[1]
    ];
    if (s && m) {
      const c = i.getCenter(), f = i.getZoom();
      if (o.centerOrZoomChanged(
        [c.longitude, c.latitude],
        f
      )) {
        const a = new Microsoft.Maps.Location(
          u[1],
          u[0]
        );
        i.setView({
          center: a,
          zoom: m
        });
      }
    }
    e = new g(i, n), e.setMapOffset(o.__mapOffset || [0, 0]), e.setZoom(m), e.setCenter(s), o.coordinateSystem = e;
  }), t.eachSeries(function(o) {
    o.get("coordinateSystem") === "bingmap" && (o.coordinateSystem = e);
  });
};
r.dimensions = g.dimensions = ["lng", "lat"];
r.type = "bingmap";
function C(t, n) {
  return t && n && t[0] === n[0] && t[1] === n[1];
}
h.extendComponentModel({
  type: "bingmap",
  setBingMap: function(t) {
    this.__bingmap = t;
  },
  getBingMap: function() {
    return this.__bingmap;
  },
  setEChartsLayer: function(t) {
    this.__echartsLayer = t;
  },
  getEChartsLayer: function() {
    return this.__echartsLayer;
  },
  setCenterAndZoom: function(t, n) {
    this.option.viewOption.center = t, this.option.viewOption.zoom = n;
  },
  centerOrZoomChanged: function(t, n) {
    const e = this.option.viewOption;
    return !(C(t, e.center) && n === e.zoom);
  },
  defaultOption: {
    viewOption: {
      center: [113.493471, 23.169598],
      zoom: 5
    },
    mapOption: {
      customMapStyle: {}
    }
  }
});
h.extendComponentView({
  type: "bingmap",
  render: function(t, n, e) {
    let o = !0;
    const i = t.getBingMap(), p = e.getZr().painter.getViewportRoot(), s = t.coordinateSystem, m = function(u) {
      if (o)
        return;
      const c = p.parentNode.parentNode.parentNode, f = [-parseInt(c.style.left, 10) || 0, -parseInt(c.style.top, 10) || 0];
      p.style.left = f[0] + "px", p.style.top = f[1] + "px", s.setMapOffset(f), t.__mapOffset = f, e.dispatchAction({
        type: "bingmapRoam"
      });
    };
    Microsoft.Maps.Events.removeHandler(this._oldViewChangeHandler), this._oldViewChangeHandler = Microsoft.Maps.Events.addHandler(i, "viewchange", m), Microsoft.Maps.Events.removeHandler(this._oldmapresize), this._oldmapresize = Microsoft.Maps.Events.addHandler(i, "mapresize", m), o = !1;
  },
  dispose() {
    const t = this.__model;
    t && (t.getBingMap().destroy(), t.setBingMap(null), t.setEChartsLayer(null), t.coordinateSystem && (t.coordinateSystem.setBingMap(null), t.coordinateSystem = null), delete this._oldViewChangeHandler, delete this._oldmapresize);
  }
});
h.registerCoordinateSystem("bingmap", g);
h.registerAction({
  type: "bingmapRoam",
  event: "bingmapRoam",
  update: "updateLayout"
}, function(t, n) {
  n.eachComponent("bingmap", function(e) {
    const o = e.getBingMap(), i = o.getCenter();
    e.setCenterAndZoom([i.longitude, i.latitude], o.getZoom());
  });
});
//# sourceMappingURL=echarts-extension-bingmaps.mjs.map
