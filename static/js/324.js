// FIXME can we just wipe this entire thing and scrap the mover-updating code for free?
//       see: http://bl.ocks.org/monfera/11100987
var SVGOverlay = L.Class.extend({

  initialize: function (options) {
    // save position of the layer or any options from the constructor
    // this._latlng = latlng;
    L.setOptions(this, options);
  },

  onAdd: function (map) {
    this._map = map;

    // initialize the map SVG layer if it doesn't exist
    if (!map._svgLayer) {
      map._initPathRoot();
      map._svgLayer = d3.select(map._container).select('svg');
    }

    this._defs = map._svgLayer.append('defs');

    // create a DOM element and put it into one of the map panes
    // this._el = L.DomUtil.create('svg', 'my-custom-layer leaflet-zoom-hide');
    this.el = map._svgLayer.append('g')
      .datum(this.options)
      .classed('leaflet-zoom-hide', true);
    // map.getPanes().overlayPane.appendChild(this._el);


    // add a viewreset event listener for updating layer's position, do the latter
    map.on('viewreset', this._reset, this);
    this._reset();
  },

  onRemove: function (map) {
    // remove layer's DOM elements and listeners
    // map.getPanes().overlayPane.removeChild(this._el);
    this.el.remove();
    map.off('viewreset', this._reset, this);
  },

  _reset: function () {
    // update layer's position
    var pos = this._map.latLngToLayerPoint(this.options.center);
    L.DomUtil.setPosition(this.el, pos);
  }
});

// map.addLayer(new MyCustomLayer(latlng));

/*
 Generic  Canvas Overlay for leaflet,
 Stanislav Sumbera, April , 2014

 - added userDrawFunc that is called when Canvas need to be redrawn
 - added few useful params fro userDrawFunc callback
  - fixed resize map bug
  inspired & portions taken from  :   https://github.com/Leaflet/Leaflet.heat


*/


L.CanvasOverlay = L.Class.extend({

    initialize: function (userDrawFunc, options) {
        this._userDrawFunc = userDrawFunc;
        L.setOptions(this, options);
    },

    drawing: function (userDrawFunc) {
        this._userDrawFunc = userDrawFunc;
        return this;
    },

    params:function(options){
        L.setOptions(this, options);
        return this;
    },

    canvas: function () {
        return this._canvas;
    },

    context: function () {
        return this._context;
    },

    redraw: function () {
        if (!this._frame) {
            this._frame = L.Util.requestAnimFrame(this._redraw, this);
        }
        return this;
    },



    onAdd: function (map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
        this._context = this._canvas.getContext('2d');

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


        map._panes.overlayPane.appendChild(this._canvas);

        map.on('moveend', this._reset, this);
        map.on('resize',  this._resize, this);

        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

        this._reset();
    },

    onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._canvas);

        map.off('moveend', this._reset, this);
        map.off('resize', this._resize, this);

        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
        this_canvas = null;

    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    _resize: function (resizeEvent) {
        this._canvas.width  = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
    },
    _reset: function () {
        // var pos = L.DomUtil.getPosition(this._map.getPanes().mapPane);
        // if (pos) {
        //   L.DomUtil.setPosition(this._canvas, { x: -pos.x, y: -pos.y });
        // }

        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);

        this._redraw();
    },

    _redraw: function () {
        var size     = this._map.getSize();
        var bounds   = this._map.getBounds();
        // var zoomScale = (size.x * 180) / (20037508.34  * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
        var zoom = this._map.getZoom();

        // console.time('process');

        if (this._userDrawFunc) {
            this._userDrawFunc(this,
                                {
                                    canvas   :this._canvas,
                                    context: this._context,
                                    bounds   : bounds,
                                    size     : size,
                                    // zoomScale: zoomScale,
                                    zoom : zoom,
                                    options: this.options
                               });
        }


        // console.timeEnd('process');

        this._frame = null;
    },

    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom),
            offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';

    }
});

L.canvasOverlay = function (userDrawFunc, options) {
    return new L.CanvasOverlay(userDrawFunc, options);
};

L.FXOverlay = L.Class.extend({

    initialize: function (userDrawFunc, bounds, options) {
        this._userDrawFunc = userDrawFunc;
        this._bounds = L.latLngBounds(bounds);
        L.setOptions(this, options);
    },

    drawing: function (userDrawFunc) {
        this._userDrawFunc = userDrawFunc;
        return this;
    },

    params:function(options){
        L.setOptions(this, options);
        return this;
    },

    canvas: function () {
        return this._canvas;
    },

    context: function () {
        return this._context;
    },

    redraw: function () {
        if (!this._frame) {
            this._frame = L.Util.requestAnimFrame(this._redraw, this);
        }
        return this;
    },



    onAdd: function (map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
        this._context = this._canvas.getContext('2d');

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


        map._panes.overlayPane.appendChild(this._canvas);

        map.on('moveend', this._reset, this);
        map.on('resize',  this._resize, this);

        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

        this._reset();
    },

    onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._canvas);

        map.off('moveend', this._reset, this);
        map.off('resize', this._resize, this);

        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
        this_canvas = null;

    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    _resize: function (resizeEvent) {
        this._canvas.width  = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
    },
    // _reset: function () {
    //     // var pos = L.DomUtil.getPosition(this._map.getPanes().mapPane);
    //     // if (pos) {
    //     //   L.DomUtil.setPosition(this._canvas, { x: -pos.x, y: -pos.y });
    //     // }

    //     // var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    //     // L.DomUtil.setPosition(this._canvas, topLeft);

    //     this._redraw();
    // },

    _redraw: function () {
        var size     = this._map.getSize();
        var bounds   = this._map.getBounds();
        // var zoomScale = (size.x * 180) / (20037508.34  * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
        var zoom = this._map.getZoom();

        // console.time('process');

        if (this._userDrawFunc) {
            this._userDrawFunc(this,
                                {
                                    canvas   :this._canvas,
                                    context: this._context,
                                    bounds   : bounds,
                                    size     : size,
                                    // zoomScale: zoomScale,
                                    zoom : zoom,
                                    options: this.options
                               });
        }


        // console.timeEnd('process');

        this._frame = null;
    },

      _animateZoom: function (e) {
        var bounds = new L.Bounds(
          this._map._latLngToNewLayerPoint(this._bounds.getNorthWest(), e.zoom, e.center),
          this._map._latLngToNewLayerPoint(this._bounds.getSouthEast(), e.zoom, e.center));

        var offset = bounds.min.add(bounds.getSize()._multiplyBy((1 - 1 / e.scale) / 2));

        L.DomUtil.setTransform(this._canvas, offset, e.scale);
        // this._canvas.scale(e.scale);
      },

      _reset: function () {
        var image = this._canvas,
            bounds = new L.Bounds(
                this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
                this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
            size = bounds.getSize();

        L.DomUtil.setPosition(image, bounds.min);

        image.style.width  = size.x + 'px';
        image.style.height = size.y + 'px';
      },

    // _animateZoom: function (e) {
    //     var scale = this._map.getZoomScale(e.zoom),
    //         offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

    //     this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';

    // }
});

L.fxOverlay = function (userDrawFunc, bounds, options) {
    return new L.FXOverlay(userDrawFunc, bounds, options);
};

// IPVIKING v2.0
var ipv = {
  version: '0'
};



// ensure css/javascript zero-value compatibility (javascript does exponential notation, css does not)
var ZERO = 1e-6;
var TWO_PI = Math.PI * 2;

var ipv_helpers = {
  // SORTING
  // sort descending by count and ascending by alphabet
  sort_descCountAscCountry: function (a, b) {
    return b.count > a.count ? 1 : b.count < a.count ? -1 : a.country < b.country ? 1 : b.country < a.country ? -1 : 0;
  },
  sort_descCountAscService: function (a, b) {
    return b.count > a.count ? 1 : b.count < a.count ? -1 : a.service < b.service ? 1 : b.service < a.service ? -1 : 0;
  },
  // COMMON FUNCTION RETURNS
  return_cx: function (d) { return d.cx; },
  return_cy: function (d) { return d.cy; },
  return_data: function (d) { return d.data; },

  //
  d3_identity: function (d) { return d; },
};
var PI = Math.PI,
    PI_HALF  = PI / 2,      // PI / 2 = 90 degrees
    PI_3HALF = PI_HALF * 3; // PI * 3/2 = 270 degrees

/*
** optimized calculation functions for animation loops
*/

// euclidian distance between two points in [x, y] format
function euclidianDistance (p1, p2) {
  var dx = p2[0] - p1[0],
      dy = p2[1] - p1[0];
  return Math.sqrt(dx*dx+dy*dy);
}

// euclidian distance squared (no function call)
function euclidianDistanceSq (p1, p2) {
  var dx = p2[0] - p1[0],
      dy = p2[1] - p1[1];
  return dx*dx+dy*dy;
}

// get the midpoint/origin
// FIXME optimize me
function midpoint (p1, p2) {
  return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}
// parse the URL querystring
ipv.hash = {
  args: {},
  parse: function (hash) {
    // parse a querystring
    hash = (hash || window.location.search).replace(/^\?/, '');
    var args = {};
    hash.split('&').forEach(function(arg) {
      arg = arg.split('=');
      args[arg[0]] = arg[1];
    });
    this.args = args;
    return args;
  },
  set: function (args) {
    // @param args {}
    // FIXME should urlencode or just rely on the browser doing it correctly?
    //
  }
};

(function (ipv) {
// will take either a timestamp of format '%Y-%m-%d %H:%M:%S.%L', or as ms since epoch (unix time)
ipv.stream = {
  timestamp: d3.time.format('%Y-%m-%d %H:%M:%S.%L'),
  active: null,
  backlog: [],
  timeout: 2000,
  paused: false
};

ipv.stream.socket = function (config, onStreamMessage) {
  onStreamMessage = onStreamMessage || function(evt) {};
  // var socket = this.sock = new WebSocket(config.host);
  var socket = this.sock = socketCluster.connect();
  socket.on('connect', function () {
    // Maybe do something here
  });
  // Get path, if any, and subscribe to the right channel
  // Possible have to get rid of that substr(8) - depending on proxy - don't think we need this now
  // var where = window.location.pathname.substr(8);
  var where = window.location.pathname;
  // Set the name of the channel to subscribe to - moved to config
  var channelName = config.stream;

  // Right now we only have the primary channel, no secondary channel - maybe later
  var primaryAttackChannel = socket.subscribe(channelName);
  primaryAttackChannel.watch(function (data) {
    if (ipv.stream.paused === false) {
      onStreamMessage(data);
    } else {
      if (ipv.stream.backlog.length >= 5000) ipv.stream.backlog.shift();
      ipv.stream.backlog.push(data);
    }
  });

  var timeoutInterval = null;

  socket.onopen = function () {
    if (timeoutInterval) clearInterval(timeoutInterval);
    socket.send(config.psk);
  };
  socket.onmessage = onStreamMessage;
  socket.onclose = function (code, reconnect) {
    // TODO InvalidAccessError WRT the close code ???
    if (reconnect) {
      // attempt to reconnect
      var that = this;
      // FIXME setTimeout instead of setInterval?
      timeoutInterval = setInterval(function () {
        socket = that.sock = ipv.stream.socket(config, onStreamMessage);
        that.timeout *= 2;
        clearInterval(timeoutInterval);
        timeoutInterval = null;
      }, this.timeout);
    }
  };
  socket.onerror = function () {
    socket.close(1000, true);
  };
  ipv.stream.active = socket;
  return socket;
};

// stream a timestamped JSON file
// currently only accepts timestamps that are in ms since epoch (unix time) or strings as described in ipv.stream.timestamp
// TODO need to turn this into its own module or s/t where we can micromanage playback (for FF/RW/play/pause/stop/etc)
ipv.stream.json = function (fileUrl, onStreamMessage, loop) {
  var interval = 100;

  if (typeof fileUrl === 'object') {
    console.log(fileUrl);
    var timeline = processTimeline(fileUrl);
    player(timeline);
  } else {
    d3.json(fileUrl, function (err, timeline) {
      if (err) throw err;
      var timeline = processTimeline(timeline);
      player(timeline);
    });
  }

  function processTimeline (timeline) {
    // more performant than checking if (evt.data) in the map
    // TODO just export data so it's in this format to begin with
    timeline = timeline.map(function (d) {
      return {data: JSON.stringify(d), timestamp: d.timestamp};
    });
    // TODO make this its own function (playTimeline) and use it in ipv.stream.csv
    var sortedByDate = d3.nest()
      .key(function (d) {
        // grouped into bins of 1/10th of a second (it'll be too complicated otherwise)
        if (typeof d.timestamp === 'string') {
          d.timestamp = +ipv.stream.timestamp(d.timestamp);
        }
        return Math.round(d.timestamp / interval) * interval;
      })
      .map(timeline);

    var times = d3.keys(sortedByDate).map(Number);
    times.sort(d3.ascending);

    return {
      sortedByDate: sortedByDate,
      times: times
    };
  }

  function player (timeline) {
    // TODO this is messy and probably not the best way to do it
    var times = timeline.times,
        curTime = times[0];

    var play = setInterval(function () {
      if (times.length) {
        if (times[0] === curTime) {
          timeline.sortedByDate[''+times.shift()].forEach(onStreamMessage);
        }
        curTime += interval;
      } else {
        clearInterval(play);
        // FIXME need to accomodate switching back to a regular stream (where does this go?)
        // loop
        if (loop) {
          ipv.stream.json(fileUrl, onStreamMessage);
        }
      }
    }, interval);
  }
};

ipv.stream.pause = function (shouldStoreBacklog) {
  if (!ipv.stream.active) return;
  var strm = ipv.stream;
  strm.paused = true;
  strm.backlog.length = 0;
  strm.msgHandler = strm.active.onmessage.bind({});
  strm.active.onmessage = function (msg) {
    // FIXME the backlog length should be configurable for appliance maps
    if (strm.backlog.length >= 5000) strm.backlog.shift();
    strm.backlog.push(msg);
  };
};

ipv.stream.play = function () {
  if (!ipv.stream.active) return;
  var strm = ipv.stream;
  strm.paused = false;
  strm.active.onmessage = strm.msgHandler.bind(strm.active);
  strm.backlog.forEach(function (msg) {
    strm.active.onmessage(msg);
  });
  strm.backlog.length = 0;
};

/* appliance-specific stream with fast-forward/rewind functionality
** @param config : an object containing a host and psk for connecting to a websocket data source
** @param onStreamMessage : a function that takes a JSON string "msg" and brings it into the map
** @param controller : the UI element that serves as the control for the appliance stream
**
** frontend command -> appliance command : description
** pause -> STOP : map stops, appliance stops sending data through socket, but appliance continues to record
** play -> RESUME : map resumes, appliance resumes recording, sends data starting at current time
** rewind/ff/jump -> START:<timestamp> : map jumps, appliance stops recording, appliance sends data starting at <timestamp>
*/
ipv.stream.appliance = function (config, onStreamMessage, controller) {
  var socket = ipv.stream.socket(config, onStreamMessage),
      currentTime = Date.now();

  // socket.onmessage = function (msg) {
  //   onStreamMessage(msg);
  //   // TODO send the timestamp to the frontend
  // };

  ipv.stream.play = function () {
    socket.send('RESUME');
    ipv.stream.paused = false;
  };

  ipv.stream.pause = function () {
    socket.send('STOP');
    ipv.stream.paused = true;
  };

  ipv.stream.jump = function (timestamp) {
    socket.send('START:' + timestamp);
    ipv.stream.paused = false;
  };

  return {
    socket: socket
  };

};




})(ipv || {});

ipv.map = function(config) {
  var map = L.map(config.container, config.options);

  // TODO enable this when you're ready to support more than points
  // var transform = d3.geo.transform({point: projectPoint}),
  //     path = d3.geo.path().projection(transform);

  map._proj = function projectPoint (x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    // TODO disable this when you move to streaming
    // this.stream.point(point.x, point.y);
    return [point.x, point.y];
  };

  return map;
};


// FIXME needs to scale to map zoom and window size
var trail = (function () {
  // the trail is an isosceles triangle with the top facing 0deg to facilitate atan2/transforms
  var radius = 2,
      base = radius * 2,
      height = base * 40,
      detail = 6,
      head = {x: radius, y: radius};

  var angle1 = Math.PI/2,
      angle2 = Math.PI*3/2,
      points = [];

  for (var i = 0; i <= detail; ++i) {
    var a = angle1 + (angle2-angle1) * (i/detail);
    var x = head.x + radius * Math.cos(a),
        y = head.y + radius * Math.sin(a);
    points.push([x-radius, y-radius]);
  }
  points.push([height, base/2], points[0]); // for a polygon

  return {
    points: points,
    base: base,
    height: radius + height,
    radius: radius,
    center: {x: height/2, y: base/2}
  };

}());

// slight speedup from caching these
var moverOptions = {
  clipRect: {x: -trail.radius, y: -trail.radius, width: trail.height, height: trail.base}
};

var HALFPI = Math.PI/2,
    TODEGREES = 180/Math.PI;

function Mover (options, svgLayer) {
  this.created = options.created;

  this.x = options.x;
  this.y = options.y;
  // FIXME offset should scale with the map
  this.offset = options.offset;

  this.destination = options.destination;
  this.layer = svgLayer.el;

  this.zerg = options.zerg;

  this.color = options.color;
  this.speed = options.speed;

  this.hit = options.onMoverHit;

  // same location so showing the particle animation would be confusing,
  // just bail and show the shockwave
  if (this.x === this.destination.x && this.y === this.destination.y) {
    this.hit();
    return;
  }

  this.randValue = Math.random();

  // FIXME better way to assign a unique id? can we do it without the unique id?
  var clipId = 'clippath-' + this.randValue;
  this.clipPath = svgLayer._defs
    .append('clipPath')
      .attr('id', clipId);

  this.cliprect = this.clipPath.append('rect')
    .attr(moverOptions.clipRect);

  this.obj = this.layer.append('polygon')
    .datum(this)
    .classed('animating', true)
    .attr('points', trail.points)
    .attr('clip-path', 'url(#' + clipId + ')')
    .attr('fill', this.color);

  var dest = this.destination;
  this.dx = dest.lx - this.x;
  this.dy = dest.ly - this.y;
  this.distance = Math.sqrt(this.dx*this.dx+this.dy*this.dy);

  this.time = ~~(this.distance / options.distanceAcrossMap * this.speed);

  // FIXME only need update() for the non-curves since a start pos is already calculated?
  this.update();
  if (options.zerg && (this.distance > trail.height*3)) {
    this.startCurve();
  } else {
    this.start();
  }

  return this;
}

Mover.prototype.startCurve = function () {

  var dest = this.destination,
      dlx = dest.lx,
      dly = dest.ly,
      tx = this.x,
      ty = this.y,

      dx = this.dx
      dy = this.dy
      distance = this.distance,
      // TODO scale the radius by zoom level and distance
      radius = distance/2 * (this.randValue - 0.5),
      height = trail.height;

  // FIXME speed should be a function of map zoom & distance
  // Math.pow(2, tile.zoom - 11) * Math.sqrt(mean.size);

  var pos = height / distance,
      size = height,
      // time = 750,
      that = this;

  var time = this.time;

  var angle = Math.atan2(ty-dly, tx-dlx),
      offsetAngle = angle + HALFPI,
      control = {
          x: (tx + dlx)/2 + radius * Math.cos(offsetAngle),
          y: (ty + dly)/2 + radius * Math.sin(offsetAngle)
        };


  // FIXME THIS IS THE SOURCE OF A MEMORY LEAK, CACHE THE CURVE FUNCTION
  // for atan2
  var lastPoint = [tx, ty];

  function curve (d, i, a) {
    return function (t) {
      // calculate a point on a quadratic bezier curve
      // TODO should try skewed curves
      // (1 - t) * (1 - t) * c0 + 2 * (1 - t) * t * c1 + t * t * c2;

      var _1mt = (1 - t),
          _1mt_sq = _1mt * _1mt,
          _2_1mt_t = 2 * _1mt * t,
          _tt = t * t,

          x = _1mt_sq * tx + _2_1mt_t * control.x + _tt * dlx,
          y = _1mt_sq * ty + _2_1mt_t * control.y + _tt * dly;

      var angle = Math.atan2(lastPoint[1]-y, lastPoint[0]-x);
      lastPoint[0] = x;
      lastPoint[1] = y;

      // PERFORMANCE BOTTLENECK transforming svg elements is slow
      return 'translate(' + [x, y] + ') rotate(' + (angle*TODEGREES) + ', 0, 0)';
    };
  }

  var growthTime = ~~(time * pos);

  this.cliprect
    .attr('width', 0)
  .transition().duration(growthTime)
    .ease('linear')
    .attr('width', size);

  // FIXME to cache the easing function:
  // ...prototype.ease = function (pos) { var _1mpos = ...; return function (t) { return t >= 1 ? 1 : (t * _1mpos + pos); } }

  this.obj
  .transition().duration(growthTime)
    .ease('linear')
    .attr('transform', curve()(pos))
    .each('end', function () {

      pos = pos === 1 ? 0 : pos;
      _1mpos = 1 - pos;
      var ease = function (t) {
        return t >= 1 ? 1 : (t * _1mpos + pos);
      };

      that.obj
      .transition().duration(time)
        .ease(ease)
        .attrTween('transform', curve)
        .each('end', function () {
          that.cliprect.transition().duration(growthTime)
            .ease('linear')
            .attr('width', 0)
            .each('end', function () {
              that.animating = false;
              that.x = dlx;
              that.y = dly;
              that.die();
            });
        });
    });

};


Mover.prototype.start = function () {

  var dest = this.destination,
      distance = this.distance,
      height = trail.height,
      target = 'translate(' + [dest.lx+this.offset.x, dest.ly+this.offset.y] + ') rotate(' + this.svgRotation() + ')';

  if (distance < height*1.2) {
    var pos = 1,
        size = distance;
  } else {
    var pos = height / distance,
        size = height;
  }
  var time = this.time;

  var vec = [
        this.dx * pos + this.x,
        this.dy * pos + this.y
      ];

  var that = this;

  var growthTime = ~~(time * pos);

  this.cliprect
    .attr('width', 0)
  .transition().duration(growthTime)
    .ease('linear')
    .attr('width', size);

  // FIXME this is ugly
  this.obj
  .transition().duration(growthTime)
    .ease('linear')
    .attr('transform', 'translate(' + vec + ') rotate(' + this.svgRotation() + ')')
    .each('end', function () {
      that.obj
      .transition().duration(time)
        .ease('linear')
        .attr('transform', target)
        .each('end', function () {
          that.cliprect.transition().duration(growthTime)
            .ease('linear')
            .attr('width', 0)
            .each('end', function () {
              that.animating = false;
              that.x = dest.lx;
              that.y = dest.ly;
              that.die();
            });
        });
    });

};



Mover.prototype.theta = function (target) {
  // get the angle from this position vector to a target vector
  return Math.atan2(this.y-target.ly, this.x-target.lx) * 180 / Math.PI;
};

Mover.prototype.svgRotation = function () {
  return [this.theta(this.destination), 0, 0];
};

Mover.prototype.update = function () {
  this.obj.attr('transform', 'translate(' + [this.x, this.y] + ') rotate(' + this.svgRotation() + ')');
};

Mover.prototype.setPosition = function (position, target) {
  this.destination = target;
  this.obj.attr('transform', 'translate(' + [this.x = position.x, this.y = position.y] + ') rotate(' + this.svgRotation() + ')');
};

Mover.prototype.die = function () {

  this.obj.remove();
  this.clipPath.remove();

  this.hit();

  var that = this;

  this.layer.append('circle')
    .classed('animating', true)
    .attr({
      cx: this.x+this.offset.x,
      cy: this.y+this.offset.y,
      stroke: this.color,
      fill: 'none',
      'stroke-width': 5,
      r: 1e-6
    })
    .style('stroke-opacity', 1)
    .transition().duration(2600)
      .ease('cubic-out')
      .style('stroke-opacity', 1e-6)
      .attr('r', 100)
      .remove();

  return false;
};


ipv.ui = function () {
  "use strict";

  var layout,
      widgets = {
        datatables: {},
        minibar: {}
      },
      cellfmt = ipv.ui.cellfmt;

  // the selection is the UI container, the data is layout.json with these attibutes:
  // data[] for the data you'll be displaying in rows
  function interfaceModule (selection) {

      // FIXME d3 standard for handling complex hierarchies? does that apply when we're updating this often?
      var module = selection.selectAll('.module')
        .data(d3.values(layout), function (d) {
          return d.key;
        });

      var moduleInit = module.enter().append('div')
        .classed('module', true)
        .attr('id', function (d) {
          return 'ui-datatable-' + d.key;
        })
        .style('width', function (d) {
          return d.width;
        });

      var title = moduleInit.append('div').classed('title', true)
        .text(function (d) { return d.name.toUpperCase(); });

      // FIXME this should be split off into a "datatable" widget,
      //       and interface() should only handle registered data->UI events/routing
      var tableAppend = moduleInit.append('table').classed('table', true);

      // FIXME OVERHAUL should start here, give this a key function, then enter only the necessary data
      // when updating
      var table = module.select('table')
        .datum(function (d) {
          return d;
        });

      tableAppend.append('thead').append('tr').classed('header', true).selectAll('td')
        .data(function (d) {
          return d.columns;
        })
      .enter().append('td')
        .attr('class', function (d) {
          return (d.attr === 'count' || d.attr === 'timestamp') ? 'number' : '';
        })
        .style('width', function (d) {
          return d.width;
        })
        .text(function (d) {
          return d.display;
        });

      tableAppend.append('tbody');

      // FIXME there has to be a better way to do this
      table.each(function (tbl) {
        widgets.datatables[tbl.key] = d3.select(this);
      });


      widgets.minibar = module.select('.title').append('div')
        .classed('minibar', true);
      widgets.minibar
        .each(function (d) {
          // FIXME
          if (!d.viz) {
            this.parentNode.removeChild(this);
          }
        });


      var clock = ipv.ui.widgets.clock();
      widgets.clock = {
        update: clock,
        el: selection.append('div')
              .datum([])
              .attr({id: 'ui-clock', class: 'module'})
      };
      widgets.clock.el.call(clock);

      widgets.minimizebutton = selection.call(ipv.ui.widgets.minimizebutton);

  }

  interfaceModule.layout = function (layoutConfig) {
    if (!arguments.length) return layout;
    layout = {};
    layoutConfig.forEach(function (module) {
      layout[module.key] = module;
    });
    return interfaceModule;
  };

  interfaceModule.widgets = function (widget) {
    if (!widget) return widgets;

    // dot notation to access nested widgets because you came up with a terrible data format
    function findWidget (hierarchy, level) {
      level = level || widgets;
      if (!hierarchy.length) {
        return level;
      }
      var found = level[hierarchy.shift()];
      if (!found) {
        return level;
      }
      level = found;
      return findWidget(hierarchy, level);
    }

    if (typeof widget === 'string') {
      return findWidget(widget.split('.'));
    }
    return widgets;
  };
  // FIXME hacky
  interfaceModule.center = null;

  // FIXME glued on; better way to do this
  // cache commonly-used functions
  var cachedFunctions = {
    returnType: function (d) {
      return d.type;
    },
    returnData: function (d) {
      return d.data;
    },
    minibarHeight: function (d, total) {
      return ~~(d.count / total * 100) + '%';
    },
    minibarBackground: function (d) {
      if (d.type === 'service')
        d3.select(this).style('background-color', d.color);
    }
  };

  // CUSTOMIZE
  interfaceModule.update = function (data) {

    // FIXME is this binding the wrong data to the charts?
    var mini = widgets.minibar
      .data(data.datatables, cachedFunctions.returnType);

    mini.each(function (d) {
      var data = d.data,
          frag = document.createDocumentFragment(),
          div = document.createElement('div'),
          countRow = this.__data__.data[0],
          total = countRow ? countRow.count : 0;

      div.className = 'bars-container';

      data.forEach(function (b) {
        var bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = cachedFunctions.minibarHeight(b, total);
        if (b.type === 'service') {
          bar.style['background-color'] = b.color;
        }
        div.appendChild(bar);
      });
      frag.appendChild(div);
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
      this.appendChild(frag);
    });

    data.datatables.forEach(function (d) {
      var existing = widgets.datatables[d.type].select('tbody').node(),
          header = existing.previousSibling.firstChild,
          tableFrag = document.createDocumentFragment(),
          tbody = document.createElement('tbody');

      d.data.forEach(function (rowData) {
        var row = document.createElement('tr');
        row.className = 'row';
        row.__data__ = rowData;

        cellfmt[d.type](rowData).forEach(function (cellData, i) {

          var td = document.createElement('td');
          td.className = 'cell ' + header.children[i].className;

          if (cellData instanceof Element) {
            td.appendChild(cellData);
          } else {
            td.innerHTML = cellData;
          }
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      existing.parentNode.replaceChild(tbody, existing);
    });

    widgets.clock.el
      .datum(data.clock)
      .call(widgets.clock.update);

  };

  return interfaceModule;

};

// FIXME this doesn't seem like it's in a very good place
ipv.ui.dispatch = d3.dispatch('toggleMinimize');

// FIXME should define a datatable as a type of widget and just pick stuff
//       for the UI from here
// add these by doing a selection.call(ipv.ui.widgets.<widgetname>)
ipv.ui.widgets = {

  minibar: function () {

    // selection is three minibars for the datatables
    function bar (selection) {
      // FIXME why is this even here?
    }
    return bar;
  },

  clock: function () {
    var rotation,
        time = 30000,
        timePlusExpire = time + time * 0.01,
        size,
        radius,
        center,
        tickHeight,
        halfTick,
        g,
        tick,
        initialized = false;

    function updateDimensions (self) {
      size = 500;
      radius = size / 1.6;
      center = {x: size/2, y: size/2};
      tickHeight = size/12;
      halfTick = tickHeight / 2;

      var containerSize = Math.min(self.clientWidth, 160);

      d3.select(self).select('svg')
        .attr({width: containerSize, height: containerSize})
        .attr('viewBox', '-200 150 900 200')
        .attr('preserveAspectRatio', 'xMidYMid meet');

      tick = {
        x1: 0,
        y1: halfTick,
        x2: tickHeight,
        y2: halfTick
      };

      return true;
    }

    function ticker (selection) {
      selection.each(function (data) {

        // FIXME this fires every time an event gets added to the data, which is terrible for performance
        //       just hack this up and manually add/remove lines

        if (!initialized) {
          updateDimensions(this);
          initialized = true;

          // FIXME serious hack
          var svg = d3.select(this).selectAll('svg').data([data]);
          var gEnter = svg.enter().append('svg').append('g');
          // FIXME here's our problem. we need to reset the cycle when something changes, not just when g enters
          gEnter.each(cycle);
          g = svg.select('g');
        }

        var that = this,
            now = Date.now();

        // PERFORMANCE BOTTLENECK
        if (data.length < 10) {
          if (updateDimensions(this)) {
            data = [];
          }
        }

        window.addEventListener('resize', function () {
          updateDimensions(that);
        });


        var lines = g.selectAll('line')
          .data(data, function (d) {
            // expects a list of timeline events from loki
            return d.$loki;
          });

        lines
          .style('stroke-opacity', function (d) {
            // FIXME PERFORMANCE try to figure out how to do a transparent svg mask instead of this mess
            return 1 - ((now - d.meta.created) / timePlusExpire);
          });

        var toRadians = Math.PI/180;

        lines.enter().append('line')
          .classed('ticker-line', true)
          .attr(tick)
          .style('stroke', function (d) {
            return d.service.color;
          })
          .style('stroke-width', 3)
          .attr('transform', function () {
            var angle = -rotation*toRadians,
                x = center.x + radius * Math.cos(angle),
                y = center.y + radius * Math.sin(angle);
            return 'translate(' + [x - halfTick, y - halfTick] + ') rotate(' + [-rotation, halfTick, halfTick] + ')';
          });

        lines.exit().remove();

      });
    }

    ticker.center = function (centerPt) {
      if (!arguments.length) return center;
      center = centerPt;
      return ticker;
    }

    function tween (d, i, a) {
      return function (t) {
        rotation = 360 * t;
        return 'rotate(' + [rotation, center.x, center.y] + ')';
      };
    }

    function cycle (d) {
      // cancel any current animation (FIXME this doesn't work when you update the time, see the FIXME in ticker())
      var obj = d3.select(this);
      obj
        .interrupt().transition();
      obj
        .attr('transform', 'rotate(0,' + [center.x, center.y] + ')')
        .transition().duration(time)
          .ease('linear')
          .attrTween('transform', tween)
          .each('end', cycle);
    }

    return ticker;
  },

  minimizebutton: function () {
    // init this by doing a selection.call(ipv.ui.widgets.minimizebutton)
    var ismin = false,
        display = ['+', '_'],
        containerHeight;

    var minimize = this.append('div')
      .classed('minimize-button maximized', true)
      .text('_');

    // FIXME rewrite the whole module to take advantage of d3.dispatch
    function toggleMinimize (callback, duration) {
      duration = +duration || 1000;

      var minButtonSize = minimize.node().clientHeight + 'px',
          height = ismin ? '' : minButtonSize,
          parentNode = d3.select(this.parentNode);

      minimize
        .classed('maximized', ismin)
        .text(display[+ismin]);

      parentNode.transition().duration(duration)
        .style('height', height);
        // .each('end', function () {
        //   callback(ismin);
        //   ismin = !ismin;
        // });

      // FIXME this needs to be inside the callback, but doing so messes with the animation chain
      if (callback) {
        callback(ismin);
      }
      ismin = !ismin;
    }

    ipv.ui.dispatch.on('toggleMinimize', toggleMinimize);
    return minimize;
  }
};

// CUSTOMIZATION: format rows of data for the UI
// TODO expand this with some other helper functions
ipv.ui.cellfmt = {
  source: function (row) {
    return [row.count || '&nbsp;', row.display || '&nbsp;'];
  },
  target: function (row) {
    return [row.count, row.display];
  },
  service: function (row) {
    return [row.count || '&nbsp;', row.port || '&nbsp;', row.display || '&nbsp;'];
  },
  events: function (row) {
    // FIXME violating DRY, plus this is a lot of string concatenation per second
    var svc = row.service;
    var span = document.createElement('span');
    span.style.color = svc.color;
    // FIXME causes a repaint
    span.innerText = svc.service;
    return [row.timestamp, row.org, row.ip, row.source, row.target, span, svc.port];
  },
  empty: function (row) {
    // create an empty row
    return ['&nbsp;', '&nbsp;', '&nbsp;'];
  }
};


var DEBUG = {};

(function () {

  // Getting the right config file
  // This substr(8) is just to deal with the proxy route. - Don't think we need this now
  // var where = window.location.pathname.substr(8);
  var where = window.location;
  // We'll use this to build the location of the config file
  var whichConfig = 'config/';
  // We match the config files depending on what map they're on. However, it might be something.norsecorp.com or norsecorp.com/something
  // This sucks that this if is so long, but it could be maps.norsecorp.com/something. In that case the config comes from /something
  if (where.hostname.match(/\./) && where.hostname.match(/\./g).length === 2 && where.hostname.substr(0,3).toLowerCase() != 'map') {
    whichConfig = whichConfig + where.hostname.split('.')[0].toLowerCase() + 'config.json';
  } else if (where.pathname.substr(1).length > 0)
    whichConfig = whichConfig + where.pathname.substr(1).toLowerCase() + 'config.json';
  else {
    whichConfig = whichConfig + 'defaultconfig.json';
  }

  var args = ipv.hash.parse();

  // if (args.pew) {
  //   // <audio src='assets/pew.mp3' preload='auto'></audio>
  //   var audio = d3.select('body').append('audio')
  //     .attr({src: 'assets/pew.mp3', preload: 'auto'})
  //     .text('');
  //   var pew = document.getElementsByTagName('audio')[0];
  // }

  // FIXME clean up these globals

  var socket,
      map,
      svgLayer,
      layer,
      distanceAcrossMap,
      PSPEED = +(args.speed || 40) * 1000,
      canvasOverlay,
      updateCanvas,
      canvasIsUpdating = false,
      effectsOverlay,
      moverHit,
      particleSprite,
      particleSize = 16,
      halfParticleSize = particleSize/2,
      lastParticleColor = null,
      lastZoom,
      qt = d3.geom.quadtree()
        .x(ipv_helpers.return_cx)
        .y(ipv_helpers.return_cy),
      quadtree,
      countryCodes,
      interfaceModule,
      ui,
      uiClock,
      // scales for computing various sizes of on-screen elements
      scales = {
        // domains will be [1, maxCount] for each type
        counts: {
          source: 0,
          target: 0,
          service: 0
        },
        source: d3.scale.sqrt().domain([0, 1]).range([2, 16]),
        target: d3.scale.sqrt().domain([0, 1]).range([2, 16]),
        service: d3.scale.sqrt().domain([0, 1]).range([2, 16]),

        // anchorsDomain: {min: 0, max: 1},
        anchors: d3.scale.sqrt().domain([0, 1]).range([2, 20])
      },
      // FIXME state machines are not Good
      minWidth = 600,
      minHeight = 450,
      showUI = true;

  function windowFitsUI () {
    return (showUI = (args.embed ? false : ((window.innerWidth >= minWidth && window.innerHeight >= minHeight) ? true : false)));
  }
  window.addEventListener('resize', windowFitsUI);
  windowFitsUI();


  // "database" to hold attack info
  var db = new loki('attacks'),
      db_timeline  = db.addCollection('timeline', {indices: ['source', 'target', 'service']}),
      db_anchors   = db.addCollection('anchors', {indices: ['key', 'country', 'type', 'count']}),
      db_services  = db.addCollection('services', {indices: ['port']}),
      db_countries = db.addCollection('countries', {indices: ['country', 'type']});

  // var db_timeline_last30sec = db_timeline.addDynamicView('')

  var db_sorted_sources = db_countries.addDynamicView('source_countries');
  db_sorted_sources.applyFind({'type': 'source'});
  db_sorted_sources.applySort(ipv_helpers.sort_descCountAscCountry);

  var db_sorted_targets = db_countries.addDynamicView('target_countries');
  db_sorted_targets.applyFind({'type': 'target'});
  db_sorted_targets.applySort(ipv_helpers.sort_descCountAscCountry);

  var db_sorted_services = db_services.addDynamicView('sorted_services');
  db_sorted_services.applyFind({'count': {'$gt': 0}});
  db_sorted_services.applySort(ipv_helpers.sort_descCountAscService);


  var db_anchor_sources = db_anchors.addDynamicView('anchor_sources');
  db_anchor_sources.applyFind({'type': 'source'});
  db_anchor_sources.applySimpleSort('count', true);

  var db_anchor_targets = db_anchors.addDynamicView('anchor_targets');
  db_anchor_targets.applyFind({'type': 'target'});
  db_anchor_targets.applySimpleSort('count', true);


  function rescale (counts) {
    // FIXME this kind of procedural listing happens everywhere (see also expire()); need to clean this up
    // FIXME need to rescale based on anchor, not country (ALSO FIXME db_sorted_<x> refers to source COUNTRIES, not anchors)
    // FIXME should have a sync() function where "one source of truth" gets updated across the app (see also: React)
    var shouldRedraw = false;
    counts.forEach(function (d) {
      var potential = d.data[0].count;
      if (potential > scales[d.type].domain()[1]) {
        scales[d.type].domain([1, potential]);
        shouldRedraw = true;
      }
    });
    return shouldRedraw;
  }


  // view logic for finding links when hovering on UI elements (countries, services)
  // takes a db query and creates a list of source->target frequency mappings + some overall metadata
  function getLinks (query) {
    var results = db_timeline.find(query),
        connected = {
          // only use one of these in your calculations
          meta: {
            // total number of links in the query results
            totalLinks: results.length,
            // number of links for the source with the most links to the destination
            maxFreq: 0
          },
          data: {}
        };

    // results.forEach(function (obj) {
    //   var key = obj.sourceObj.key + obj.targetObj.key;
    //   if (!connections[key]) {
    //     connections[key] = {
    //       source: obj.sourceObj,
    //       target: obj.targetObj,
    //       count:
    //     };
    //   }
    // });

    // FIXME this is convoluted and hard to understand
    results.forEach(function (obj) {
      var source = obj.sourceObj,
          target = obj.targetObj,
          key = source.key+target.key,
          service = obj.service,
          port = service.port;

      var conn = connected.data[key] || (connected.data[key] = {
        count: 0,
        max: {port: 'unknown', count: 0},
        source: [source.lx, source.ly],
        target: [target.lx, target.ly],
        ports: {}
      });

      // keep track of the highest number of links for the source with the most links to the destination
      // FIXME why?
      if (++conn.count > connected.meta.maxFreq) {
        connected.meta.maxFreq = conn.count;
      }

      // keep track of which port has the most connections (for coloring links later)
      // (aka which port was used most in attacks from source->target)
      var portCount = conn.ports[port] = (conn.ports[port] || 0) + 1;
      if (portCount > conn.max.count) {
        conn.max.color = service.color;
        conn.max.port = port;
        conn.max.count = portCount;
      }
    });

    connected.data = d3.values(connected.data);
    return connected;
  }

  // construct SVG paths between links
  // FIXME should just do this on a canvas layer instead
  function constructLinks (connected) {

    // link opacity = (# attacks from the source to the destination) / (total # attacks to the destination)
    // link width = (# attacks from the source to the destination) / (the max # of attacks from a single source to the destination)
    // link color = the color mapping for the port most commonly used in attacks from source->target

    var links = layer.selectAll('.links')
      .data(connected.data);

    links.enter().append('path')
      .classed('links', true);

    links
      .attr('d', function (d) {
        return 'M' + [d.source] + 'L' + [d.target];
      })
      .style('stroke', function (d) {
        return d.max.color;
      })
      .style('stroke-width', function (d) {
        return Math.max(1, d.count / connected.meta.maxFreq * 5);
      })
      .style('stroke-opacity', function (d) {
        return d.count / connected.meta.totalLinks + 0.5;
      });

    links.exit().remove();
  }

  function destroyLinks () {
    layer.selectAll('.links')
      .remove();
  }

  // a "moving window" of data
  // every minute, remove any data before the current time minus x mins
  function expire (dataWindow) {
    // remove data before the current time minus the window
    var now = Date.now(),
        expiration = now - dataWindow;

    db_timeline.removeWhere(function expiredDocs (obj) {
      var remove = obj.meta.created <= expiration;
      if (remove) {
        // TODO if the anchor count is <= 0, remove it (this is why we write tests)
        [obj.sourceObj, obj.targetObj].forEach(function (anchorObj) {
          anchorObj.count--;
          anchorObj.countryObj.count--;
        });
        obj.serviceObj.count--;
      }
      return remove;
    });
  }
  var dataWindow = 8 * 60 * 1000; // mins * 60 seconds per min * 1000 ms per sec
  setTimeout(function () {
    setInterval(function () {
      expire(dataWindow);
    }, 60 * 1000); // 60 seconds * 1000 ms per sec
  }, dataWindow);

  queue()
	  // files necessary for initialization and data collection
    .defer(d3.json, whichConfig)
    .defer(d3.csv, 'data/nmap-services-1500.csv')
    // files that are only necessary to the display
    .defer(d3.json, 'data/country_codes.json')
    .defer(d3.json, 'layout.json')
    .defer(function loadParticleImage (imgUrl, callback) {
      var img = new Image();
      img.onload = function () {
        callback(null, this);
      };
      img.onerror = function () {
        callback('error loading particle image');
      };
      img.src = imgUrl;
      }, 'assets/particle-16px.png')
    .await(ready);
  // }

  function ready (err, config, services, cc, layout, particleImg) {
    if (err) throw err;

    particleSprite = particleImg;

    // load the port -> service mappings into the database
    // FIXME there should just be a single function for adding objects to the DB, instead of doing this same thing twice
    services.forEach(function (port) {
      port.count = 0;
      port.port = +port.port;
      port.type = 'service';
      port.color = 'hsl(' + (+port.port%360) + ', 100%, 70%)';
      port.display = '<span style="color: ' + port.color + '">&bigcirc;</span> ' + port.service;
      db_services.insert(port);
    });
    // db_services.insert({service: 'other', port: 0, count: 0});

    // create a country code -> full name mapping
    countryCodes = cc;

    // create the map
    initMap(config.map);


    if (!args.embed) {
      interfaceModule = ipv.ui().layout(layout);

      var uiContainer = d3.select('body').append('div');
      ui = uiContainer.attr('id', 'ui')
        .call(interfaceModule);

      // pad the leader boards with empty rows so UI height is already at its max when the page loads
      updateUserInterface([{type: 'service', data: Array.apply(null, Array(10)).map(function () { return {}; }) }]);

      // show relevant links on map when you mouseover the leaderboards
      ui.selectAll('table')
        .on('mouseover', function (d) {

          var target = d3.event.target;
          if (target.parentNode.className !== 'row') {
            return;
          }

          var row   = target.parentNode.__data__,
              query = {};

          if (row.country) {
            query[row.type + 'Country'] = row.country;
          } else {
            return;
            // FIXME this needs to work with ports too but aggregation in getLinks() is country-specific
            // query.port = row.port;
          }
          constructLinks(getLinks(query));
        })
        .on('mouseout', destroyLinks);


      // the map chevron that has zoom, toggle play/pause, and toggle info buttons
      if (isInline) {
        var chev = d3.select(document.getElementById("chevronHiddenDiv")).select('g').node();
        act_on_chevron(chev);
      } else {
        // the Norse logo in the top-right and customer logo on top-left of the screen (can also be a custom logo)
        d3.select('#controls #logo1').attr('src', config.ui.logo1);
        // I would rather use a pure logo, but we don't have one for 'Powered by Norse'
        if (config.ui.logo2) {
          d3.select('#controls #divlogo2 span').text('Powered by');
          d3.select('#controls #divlogo2 #logo2').attr('src', config.ui.logo2);
        } else {
          d3.select('#controls #divlogo2').style({display: "none"});
        }

        d3.xml('assets/controls-500-classed.svg', 'image/svg+xml', function(xml) {

        // FIXME integrate this into widgets
        var chev = d3.select(xml.documentElement).select('g').node();
        act_on_chevron(chev);
      });
      }

      // add the shield (formerly known as "chevron") to the map
      // FIXME currently adds the shield TWICE-- one for the outer container and one for the inner. this is adding to
      //       page bloat with more elements + event listeners, but it's just a lot easier than swapping the
      //       shield container every single time
      function act_on_chevron(chev) {

        var innerShieldContainer = d3.select('#ui-clock svg');
        var outerShieldContainer = d3.select('#chevron-container').append('svg')
          .attr('viewBox', '0 0 700 500');

        innerShieldContainer.node().appendChild(chev);
        // hacky copy
        outerShieldContainer.node().innerHTML = innerShieldContainer.node().innerHTML;

        var shields = [innerShieldContainer, outerShieldContainer];

        var ui = document.getElementById('ui');
        var minimizeButton = d3.select('.minimize-button');

        // widgets underneath the shield
        var tinyWidgets = {
          miniClock: function () {
            var me = d3.select(this).select('#time'),
                time = moment();
            function minute () {
              me.text(time.format('h:mm A'));
              time.add(1, 'm');
            }
            minute();
            setInterval(minute, 60 * 1000);
          },
          miniCal: function () {
            var me = d3.select(this),
                date = moment();
            function hour () {
              me.select('#month').text(date.format('MMM'));
              me.select('#day').text(date.format('DD'));
              me.select('#year').text(date.format('YYYY'));
              date.add(1, 'h');
            }
            hour();
            setInterval(hour, 60 * 60 * 1000);
          },
          riskButton: function (doSomething) {
            d3.select(this)
              .on('click', doSomething.bind(this));
          }
        };

        d3.xml('assets/tiny-buttons-small.svg', 'image/svg+xml', function (xml) {

          var clockContainer = d3.select('#ui-clock').append('div')
            .attr('id', 'tiny-widget-container');

          var tinyButtonsSvg = clockContainer.node().appendChild(xml.documentElement);
          tinyButtonsSvg = d3.select(tinyButtonsSvg)
            .attr('viewBox', '-19 10 290 130');

          tinyButtonsSvg.selectAll('g')
            .each(function () {
              var me = d3.select(this),
                  widget = me.attr('id'),
                  fn = tinyWidgets[widget].bind(this);
              if (widget === 'riskButton') {
                fn(function () {
                  toggleInfobox(false, '#infobox-marketing');
                });
              } else {
                fn();
              }
            });

          // FIXME hacked-in on 06/08/2015, do this as css and fix the transforms in the svg
          var tbt = tinyButtonsSvg.selectAll('text')
            .style('font-family', 'Oswald');
          // tinyButtonsSvg.select('text#year').attr('transform', 'matrix(1 0 0 1 111 107.9097)');
          // tinyButtonsSvg.select('text#month').attr('transform', 'matrix(1 0 0 1 117 40.9097)');
          // tinyButtonsSvg.select('text#day').attr('transform', 'matrix(1 0 0 1 110 86.0796)')
          // tinyButtonsSvg.select('text#time').attr('transform', 'matrix(1 0 0 1 7 85.9399)');
          // tinyButtonsSvg.selectAll('#riskButton text').style('font-weight', 'bold');
        });

        var infoButtonContainer = outerShieldContainer.append('g')
          .attr('id', 'infobutton-container');

        infoButtonContainer.append('circle')
          .classed('infobutton', true)
          .attr({id: 'svg-toggle-info-600', r: 100, cx: 250, cy: 250})
          .style({fill: '#4bffff', cursor: 'pointer'});

        // TODO just copy/paste the "i" from the shield here to be consistent
        infoButtonContainer.append('text')
          .attr('transform', 'translate(' + [235, 290] + ')')
          .text('i');


        var infoboxMapLegend = d3.select('#infobox-map-legend'),
            infoBoxMapLegendContent = d3.selectAll('#infobox-map-legend > div:not(.close)');



        // swap the shield
        function swapShields (isMinimized, duration, callback) {
          duration = +duration || 1000;

          var loser = shields[+isMinimized],
              winner = shields[+!isMinimized];

          // FIXME behavior needs to be consistent. maximizing toggles whole UI's opacity, but minimizing only toggles svg's opacity
          loser.style('fill-opacity', 1)
            .transition().duration(duration)
              .style('fill-opacity', 1e-6)
              .each('end', function () {

                loser.style('visibility', 'hidden');
                winner
                  .style('visibility', 'visible')
                  .style('fill-opacity', 1e-6)
                  .transition().duration(duration/2)
                    .style('fill-opacity', 1);
              });

        }

        // toggle the UI modules fading in and out
        // `this` is the UI container
        function fadeUI (isMinimized, duration, callback) {
          duration = +duration || 1000;
          var modules = d3.select(this).selectAll('.module');
          modules.style('opacity', isMinimized ? 1e-6 : 1)
            .transition().duration(duration)
              .style('opacity', isMinimized ? 1 : 1e-6);
        }

        // swap the positions of the shield (inner vs outer) and toggle UI fade
        function toggleUI (isMinimized, duration) {
          duration = +duration || 1000;
          swapShields.call(this, isMinimized, duration);
          fadeUI.call(this, isMinimized, duration);
        }

        function getUIHeight () {
          // FIXME there has to be a better way to do this
          return showUI ? {height: ui.clientHeight, units: 'px'} : {height: 100, units: '%'};
        }

        // FIXME terrible, terrible hack. no idea why this works, but it does.
        function hackInfoboxLayout () {
          windowFitsUI();
          var dim = getUIHeight();

          if (showUI) {
            infoboxMapLegend.style('display', 'table');
            infoBoxMapLegendContent
              .style('display', 'table-row')
              .style('display', 'table-cell')
              .style('height', dim.height + dim.units);
          } else {
            infoboxMapLegend.style('display', 'block');
            infoBoxMapLegendContent
              .style('height', '');
            d3.select('#svg-toggle-info-600').style({'fill-opacity': 1, visibility: 'visible'});
          }
          d3.selectAll('#infobox-map-legend, #infobox-marketing').style('height', dim.height + dim.units);
        }

        function toggleInfobox (isOpen, id) {
          id = id || '#infobox-map-legend';
          if (!isOpen) {
            d3.select(id)
              // FIXME when coming up from a minimized state,
              .transition().duration(1).delay(1000)
                .ease('linear')
                .styleTween('height', function (d, i, a) {
                  var future = getUIHeight();
                  return function (t) {
                    return t * future.height + future.units;
                  }
                })
              .each('end', function () {
                d3.select(this)
                  .style('display', 'block')
                  .each(function () {
                    if (showUI) hackInfoboxLayout();
                  })
                  .transition().duration(500)
                    .ease('linear')
                    .style('left', '0%');
              });
          } else {
            var future = getUIHeight();
            d3.select(id).transition().duration(500)
              .ease('linear')
              .style({left: '100%'})
              // FIXME superfluous?
              .each('end', function () {
                d3.select(this).style('height', future.height + future.units);
              });
          }
        }

        window.addEventListener('resize', hackInfoboxLayout);
        hackInfoboxLayout();

        var glyphs = d3.selectAll('.shield-glyphs');
        glyphs.selectAll('.play-text').style('visibility', 'hidden');

        // FIXME need to check if the map is inside the appliance also
        if (isInline) {
          d3.selectAll('.svg-toggle-view, #switch-text').style('visibility', 'hidden');
        } else {
          // FIXME needs to be a qs argument like "/?oldmap=yes"
          d3.selectAll('.svg-toggle-view').on('click', function () {
            window.location.href = window.location.origin + '/v1/';
          });
        }

        minimizeButton.on('mousedown.toggle', function () {
          ipv.ui.dispatch.toggleMinimize.call(this, toggleUI.bind(this.parentNode));
        });

        d3.select('#svg-toggle-info-600').on('click', function () {
          toggleInfobox();
        });

        // FIXME would be a lot cleaner to just have one event listener on the parent that trickles down to the event target
        var shieldEvents = {
          'svg-toggle-info': function () {
            if (!minimizeButton.classed('maximized')) {

              var minBtn = minimizeButton.node();
              ipv.ui.dispatch.toggleMinimize.call(minBtn, function (isMinimized) {

                toggleUI.call(minBtn.parentNode, isMinimized, 500);
                toggleInfobox();

              }, 500);

            } else {
              toggleInfobox();
            }
          },
          'svg-toggle-play': function () {
            var wasPaused = ipv.stream.paused;

            if (wasPaused) {
              ipv.stream.play();
            } else {
              ipv.stream.pause();
            }

            glyphs.selectAll('.play-text').style('visibility', wasPaused ? 'hidden' : 'visible');
            glyphs.selectAll('.pause-text').style('visibility', wasPaused ? 'visible' : 'hidden');
          },
          'svg-zoom-in': function () {
            map.zoomIn();
          },
          'svg-zoom-out': function () {
            map.zoomOut();
          }
        };

        // FIXME WARNING: can get dangerous if the shield elements have multiple class names that do different things
        d3.selectAll('#ui-clock svg, #chevron-container svg').on('click.shieldevents', function () {
          d3.select(d3.event.target).attr('class').split(' ').forEach(function (className) {
            if (shieldEvents[className]) {
              shieldEvents[className]();
            }
          })
        });

        // FIXME match id to `.close` click event targets
        d3.select('#infobox-map-legend .close').on('click', function () {
          if (!minimizeButton.classed('maximized') || !showUI) {
            d3.select('#svg-toggle-info-600').style({'fill-opacity': 1, visibility: 'visible'});
          }
          toggleInfobox(true);
        });

        d3.select('#infobox-marketing .close').on('click', function () {
          toggleInfobox(true, '#infobox-marketing');
        });

        if (args.hasOwnProperty('about')) {
          toggleInfobox(false, '#infobox-marketing');
        }

      }
    }

    // initialize the data stream
    if (!inlineAttacks) {
      socket = ipv.stream.socket(config.stream, msg);
    } else {
      // FIXME the json stream should be usable outside of inline attacks, but this only allows its use in the single-pager app,
      //       basically creating a requested feature and not allowing users to utilize it
      // FIXME on loop, the DB & UI keeps building without clearing out, leading to incorrect data
      socket = ipv.stream.json(inlineAttacks, msg, true);
    }
  }

  // FIXME refactor candidate
  function updateUserInterface (newData, now) {
    var timelineData = db_timeline.data;

    var clockData = [],
        idx = timelineData.length;
    while (idx--) {
      if ((now - timelineData[idx].meta.created) > 30000) {
        break;
      }
      clockData.push(timelineData[idx]);
    }

    newData.push({type: 'events', data: timelineData.slice(-10)});

    interfaceModule.update({
      datatables: newData,
      clock: clockData
    });
  }

  function initMap (config) {
    // features
    var options = {
      tiles: {
        toner: 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png',
        watercolor: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
        mars: 'https://{s}.tiles.mapbox.com/v3/herwig.map-tly29w1z/{z}/{x}/{y}.png',
        dm: 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
        positron: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'
      }
    };
    config.tileUrl = args.tiles ? options.tiles[args.tiles.replace('/', '')] : (config.tileUrl ? config.tileUrl : null);

    map = ipv.map(config);

    // FIXME hacked-together mess
    if (!(isInline || config.jsonBasemap)) {
      map = ipv.map(config);

      if (config.tileUrl) {
          // basemap
          map.addLayer(new L.TileLayer(config.tileUrl, {noWrap: true}));
      } else {
        map.addLayer(new L.TileLayer('norse-basemap-v1_1/{z}/{x}/{y}.png', {noWrap: true}));
      }

    } else if (isInline) {
      // for the appliance frankenstein version
      L.geoJson(topojson.feature(world_map, world_map.objects.countries).features, {
        style: {
          fillColor: '#000',
          weight: 1.5,
          color: '#4bffff'
        }
      }).addTo(map);

    } else {
      // apparently we can do fractional zooms with a json layer
      // NOTE: we're not getting the external topojson in the above else-if because Alfred is inlining it with an outside script
      d3.json('assets/world_map.json', function (err, world_map) {
        L.geoJson(topojson.feature(world_map, world_map.objects.countries).features, {
          style: {
            fillColor: '#000',
            weight: 1.5,
            color: '#4bffff'
          }
        }).addTo(map);
      });
    }

    // pockmark map
    // FIXME instead of calling this (via redraw()) every time a new anchor is added, just access the
    //       context directly and add a point, then only call this on mapmove and viewreset
    var lastAnchorCount = 0,
        dbAnchorsData = db_anchors.data;
    updateCanvas = function (overlay, params) {

      // FIXME not performant at all
      var currentMax = scales.anchors.domain()[1],
          newMax = d3.max(dbAnchorsData, function (obj) { return obj.count; });

      // if (newMax - currentMax < 10) {
      //   return;
      // }
      currentMax = newMax;
      scales.anchors.domain([1, newMax]);

      // var maxCount = -Infinity,
      //     minCount = Infinity;

      // var domain = scales.anchorsDomain;

      var ctx = params.context;
      ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

      // anchorData.forEach(function (data, idx) {
      [db_anchor_sources.data(), db_anchor_targets.data()].forEach(function (data, idx) {
        ctx.fillStyle = idx ? '#ffffff' : 'hsl(0, 100%, 70%)';
        ctx.beginPath();
        for (var i = 0, len = data.length; i < len; i++) {
          var d = data[i];
          if (!params.bounds.contains(d.latLng)) {
            continue;
          }
          // var count = d.count;
          // if (count < domain.min) domain.min = count;
          // if (count > domain.max) domain.max = count;
          var x = d.cx|0,
              y = d.cy|0;
          ctx.moveTo(x, y);
          // ctx.arc(x, y, d.displayRadius = scales[d.type](d.count), 0, TWO_PI);
          ctx.arc(x, y, d.displayRadius = scales.anchors(d.count), 0, TWO_PI);
        }
        ctx.fill();
        ctx.closePath();
      });

      // FIXME should just qt.add(<new points>) instead of adding all the data
      if (dbAnchorsData.length > lastAnchorCount) {
        lastAnchorCount = dbAnchorsData.length;
        quadtree = qt(dbAnchorsData);
      }
    };

    canvasOverlay = L.canvasOverlay()
      .drawing(updateCanvas)
      .addTo(map);

    canvasOverlay._context.globalAlpha = 0.5;
    canvasOverlay._context.globalCompositeOperation = 'lighter';

    d3.select(canvasOverlay._canvas).classed('anchor-layer', true);

    // FIXME this is ugly and in the wrong place
    // FIXME collapse this into canvasOverlay and call moverHit after anyplace calling canvasOverlay.redraw()?
    var bufCanvas = document.createElement('canvas'),
        bufCtx = bufCanvas.getContext('2d');

    bufCanvas.width = bufCanvas.height = particleSize;


    effectsOverlay = L.canvasOverlay()
      .drawing(function (effectsOverlay, params) {
        params.context.clearRect(0, 0, params.canvas.width, params.canvas.height);
      })
      .addTo(map);

    // hack to satisfy customers-- just make the anchor layer invisible instead of not drawing onto it
    if (config.hideAnchors && config.hideAnchors === true) {
      d3.select('.anchor-layer').style('visibility', 'hidden');
    }

    var fxCtx = effectsOverlay._context;
    fxCtx.globalCompositeOperation = 'lighter';

    // callback: flying particle reaches the target
    // FIXME this is way too expensive
    // FIXME most of the particle creation/placement in moverHit() should be delegated to Ping/Anchor etc

    moverHit = function () {

      if (!particleSprite) {
        return;
      }

      var actOnRandom = Math.random() > 0.7;

      if (this.zerg && actOnRandom) {
        return;
      }

      var color = this.color,
          dest = this.destination,
          diam = (dest.displayRadius|0) * (this.zerg ? 5 : 2),
          offsetX = (Math.random() - 0.5) * diam - halfParticleSize,
          offsetY = (Math.random() - 0.5) * diam - halfParticleSize;

      // FIXME cache these
      if (color !== lastParticleColor) {
        bufCtx.clearRect(0, 0, particleSize, particleSize);
        bufCtx.save();
        bufCtx.drawImage(particleSprite, 0, 0);
        bufCtx.fillStyle = color;
        bufCtx.globalCompositeOperation = 'source-atop';
        // FIXME fillRect slow?
        bufCtx.fillRect(0, 0, particleSize, particleSize);
        bufCtx.restore();
        lastParticleColor = color;
      }

      fxCtx.drawImage(bufCanvas, dest.cx+offsetX|0, dest.cy+offsetY|0);

      // FIXME per Jeff H's request:
      //       keep particles on screen during map zoom, so keep track of the canvas overwriting alpha strength
      //       (`0.1` here), and every time we do one of these, note the `Date.now()` in a lookup table.
      //       then on viewreset only db_timeline.findWhere:
      //       the obj is <above a calculated threshold that considers the amount of alpha since the obj.meta.created>
      if (actOnRandom) {
        fxCtx.save();
        fxCtx.globalCompositeOperation = 'destination-out';
        fxCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        fxCtx.fillRect(0, 0, fxCtx.canvas.width , fxCtx.canvas.height);
        fxCtx.restore();
        // fxCtx.globalCompositeOperation = 'lighter';
      }
    };

    initQuadtree(canvasOverlay._canvas);

    // svg animation layer
    svgLayer = new SVGOverlay(config.options);
    map.addLayer(svgLayer);
    layer = svgLayer.el;


    var initial = true;
    map.on('viewreset', viewreset);
    viewreset();
    map.on('zoomstart', zoomstart);
    map.on('moveend', viewreset);


    function zoomstart (e) {
      // store all the current lat/lngs of moving nodes
      // after zoom is done, we'll reproject the node latlngs to the new post-zoom projection
      // TODO uncomment this to resync mover nodes (commented because i have to implement d3.transition interruptions)
      // movers.forEach(function (mover, i) {
      //   mover.lastLatLng = map.layerPointToLatLng([mover.x, mover.y]);
      // });
      destroyLinks();
      lastZoom = map.getZoom();
    }

    function viewreset (e) {
      // reposition everything on the map by recalculating the screen coordinates based on the last latlng position
      // (should probably just have the layers do this on their own)
      var anchors = db_anchors.data;
      for (var i = 0, len = anchors.length; i < len; i++) {
        var anchor = anchors[i],
            newContainerPos = map.latLngToContainerPoint(anchor.latLng),
            newLayerPos = map.latLngToLayerPoint(anchor.latLng);
        anchor.cx = newContainerPos.x;
        anchor.cy = newContainerPos.y;
        anchor.lx = newLayerPos.x;
        anchor.ly = newLayerPos.y;
      }

      // calculate maximum distance across the map bounds, to be used when calculating how quickly
      // movers should cross from origin to destination
      var pixDist = map.getPixelBounds().getSize();
      distanceAcrossMap = Math.sqrt(pixDist.x+pixDist.x*pixDist.y*pixDist.y);

      // scale marker radius range to map zoom (is this right?)
      // FIXME can just do this when drawing the circles, instead of keeping track of all this:
      //       `Math.pow(2, tile.zoom - 11) * Math.sqrt(mean.size))`
      var range = [2, map.getScaleZoom(map.getZoom()) * map.getZoom()+2];
      ['source', 'target', 'service', 'anchors'].forEach(function (type) {
        scales[type].range(range);
      });

      canvasOverlay.redraw();
      if (!initial) {
        layer.selectAll('.animating')
          .style('visibility', 'hidden')
          .interrupt().transition()
            .remove();

        // TODO uncomment this to resync mover nodes
        // movers.forEach(function (mover) {
        //   if (!mover.lastLatLng) {
        //     // created mid-zoom?
        //     return;
        //     // mover.lastLatLng = ;
        //   }
        //   mover.setPosition(map.latLngToLayerPoint(mover.lastLatLng), db_anchors.get(mover.destination.$loki));
        //   // mover.setPosition(map.latLngToContainerPoint(mover.lastLatLng), db_anchors.get(mover.destination.$loki));
        // });
      }
      // if (!initial) {
      //   // get rid of the pings on zoom (set visibility to hidden and let the animation expire)
      //   layer.el.selectAll('.fixed-animation').style('visibility', 'hidden');
      //   // reposition all other moving nodes
      //   nodes.forEach(function (node, i) {
      //     node.attractor = anchors[node.destKey].pixelCoordinates;
      //     node.reposition(calculateNewXYPos(lastLatLng));
      //   });
      // }
      initial = false;
    }
  }

  // quadtree for the canvas layer mouseover events
  function initQuadtree (canvasNode) {

    var prevSelected = null,
        // FIXME this never changes, but it should for a more accurate quadtree (can anyone really tell?)
        quadRadiusSquared = 20 * 20;

    // FIXME PERFORMANCE BOTTLENECK
    // try implementing the quadtree layer as svg with mouseover events (this could be problematic with thousands of nodes, though)
    document.getElementById('map').addEventListener('mousemove', function (e) {

      if (!quadtree) return;

      var mx = e.pageX,
          my = e.pageY,
          selected;

      // FIXME pretty sure this is really messed up
      quadtree.visit(function (node, x1, y1, x2, y2) {
        // FIXME should return the largest node, not the first one
        if (selected) return true;
        if (mx >= x1 && mx <= x2 && my >= y1 && my <= y2) {
          var p = node.point;
          if (p) {
            var dx = mx - p.cx,
                dy = my - p.cy,
                // FIXME do `dsq <= (p.r * p.r)` instead of a Math.sqrt every time
                distance = Math.sqrt(dx*dx+dy*dy);
            if (distance <= p.r) {
              selected = p;
              return true;
            }
          }
        }
      });

      if (selected) {
        prevSelected = selected.key;
        var query = {},
            countryKey = selected.type + 'Key';
        query[countryKey] = selected.key;
        constructLinks(getLinks(query));
      } else {
        destroyLinks();
      }
    });
  }

  /* TODO refactor everything that's touched by the following code.
  ** 1. pop attacks off a queue instead of adding them as they come
  ** 2. selectively update parts of the UI (redo ui.js)
  ** 3. redraw the canvas only when there's a (mathematically-relative) lull in attacks
  ** 4. cut down on the amount of data being stored in the DB
  */
  function msg (d) {
    // got a message
    // Don't need this now
    // d = JSON.parse(d.data);

    // military/govt attacks
    // if (d.country === 'O1') d.country = 'milgov';
    // if (d.country2 === 'O1') d.country2 = 'milgov';

    // taking this out for now-- one less if-check in a loop
    // if (pew) pew.play();

    //Beginning of loop. It's so long I needed to comment the beginning and end
    // We're doing this loop because it's how I'm going to deal with zerg events.
    // Rather than send them individually as objects, I'm going to send them as an array and let the browser loop through it
    // It used to be msg(d), and d was an object. Now msg takes an array, and d is defined in the first line of the for loop

    // New: As of Dec 7, taking out this for loop for now. It seems like it was killing browser performance.
    // So either we improve the frontend (all the bottlenecks in this code), or we solve the zerg problem on the back end.
    // Plus I'm getting complaints from the sales folks that the demo maps are broken.
    // for (var i=0; i<d_array.length; i++) {
    //   var d = d_array[i];
      var lat,
          lng,
          locs = {
            source: {
              key: (lat = d.latitude) + '_' + (lng = d.longitude),
              latLng: [+lat, +lng],
              country: d.country,
              locString: (d.city&&d.city+', '||'')+d.country
            },
            target: {
              key: (lat = d.latitude2) + '_' + (lng = d.longitude2),
              latLng: [+lat, +lng],
              country: d.country2,
              locString: (d.city2&&d.city2+', '||'')+d.country2
            }
          };

      // FIXME PERFORMANCE BOTTLENECK just do a hash table
      var port = +d.dport,
          color = 'hsl(' + (+port%360) + ', 100%, 70%)';
      var service = db_services.findOne({port: port})
                 || db_services.insert({type: 'service', port: port, color: color, service: 'unknown', count: 0, display: '<span style="color: ' + color + '">&bigcirc;</span> unknown'});
      ++service.count;

      db_services.update(service);

      // FIXME too many source/target references that refer to diff types of objects
      // eg source anchor, source country, source ...
      ['target', 'source'].forEach(function (actor, i) {
        var loc = locs[actor],
            anchor,
            cc = loc.country,
            fullCountryName = countryCodes[cc] || 'Mil/Gov',
            country;

        // FIXME why isn't this working?
        // var anchorCandidate = dbViews.anchor[actor].resultset.find({key: loc.key}).data();
        // if (!anchorCandidate.length) {
        if (!(anchor = db_anchors.findOne({'$and': [{key: loc.key}, {type: actor}]}))) {
          var containerPoint = map.latLngToContainerPoint(loc.latLng),
              layerPoint = map.latLngToLayerPoint(loc.latLng);

          anchor = db_anchors.insert({
            key: loc.key,
            cx: containerPoint.x,
            cy: containerPoint.y,
            lx: layerPoint.x,
            ly: layerPoint.y,
            latLng: loc.latLng,
            // location: loc.locString,
            country: loc.country,
            type: actor,
            count: 0,
            r: 10
          });
          // console.log('anchor', anchor);
          // db_anchors.update(anchor);
        }
        // } else {
        // //   // anchor = db_anchors.get(anchorCandidate[0]['$loki']);
        //   anchor = anchorCandidate[0];
        //   ++anchor.count;
        // //   // db_anchors.update(anchor);
        // }
        // // db_anchors.update(anchor);
        locs[actor].document = anchor;
        ++anchor.count;


        if (!(country = db_countries.findOne({'$and': [{type: actor}, {country: cc}]}))) {
          country = db_countries.insert({
            type: actor,
            country: cc,
            countryName: fullCountryName,
            display: '<img class="flag" src="img/flags/' + cc + '.png"> ' + fullCountryName,
            count: 0
          });
        }

        ++country.count;
        anchor.countryObj = country;
        db_countries.update(country);

      });

      // create a particle to move from the source -> destination
      var source = locs.source,
          target = locs.target,
          sourceDoc = source.document,
          targetDoc = target.document;

      var ts = moment().format('HH:mm:ss.SSS');


      var timestamped = {
        timestamp: ts,
        org: d.org,
        ip: d.md5,
        // source/target by full location string
        source: source.locString,
        target: target.locString,
        // source/target by anchor key
        sourceKey: source.key,
        targetKey: target.key,
        // source/target by country name
        sourceCountry: d.country,
        targetCountry: d.country2,
        // the actual objects (FIXME can we phase out the indices above?)
        sourceObj: sourceDoc,
        targetObj: targetDoc,
        serviceObj: service,
        service: service,
        type: 'events'
      };

      db_timeline.insert(timestamped);

      // FIXME offset should scale with map size/zoom
      var offset = d.zerg ? {x: ((Math.random()-0.5) * 20), y: ((Math.random()-0.5) * 20)} : {x: 0, y: 0};
      // ping at source
      layer.append('circle')
        .classed('animating', true)
        .attr({
            cx: sourceDoc.lx + offset.x,
            cy: sourceDoc.ly + offset.y,
            fill: 'none',
            stroke: service.color,
            'stroke-width': 5,
            r: 1e-6
          })
        .style('stroke-opacity', 1)
        .transition().duration(4000)
          .ease('cubic-out')
          .style('stroke-opacity', 1e-6)
          .attr('r', 80)
          .remove();

      // FIXME combine timestamped + mover?
      var mover = new Mover({
        zerg: d.zerg,
        x: sourceDoc.lx,
        y: sourceDoc.ly,
        destination: targetDoc,
        latLng: sourceDoc.latLng,
        lastLatLng: sourceDoc.latLng,
        fixed: false,
        port: port,
        color: color,
        speed: PSPEED,
        offset: offset,
        onMoverHit: moverHit,
        distanceAcrossMap: distanceAcrossMap
      }, svgLayer);

      // PERFORMANCE BOTTLENECK zerg attacks make us do array operations hundreds of times per second
      var newData = [
        {type: 'source', data: db_sorted_sources.data().slice(0, 10)},
        {type: 'service', data: db_sorted_services.data().slice(0, 10)},
        {type: 'target', data: db_sorted_targets.data().slice(0, 10)},
      ];

      // PERFORMANCE BOTTLENECK creating new arrays, instantiating empty objects, function calls
      var svc_data = newData[1].data;
      // FIXME svc_data may be undefined
      if (svc_data.length < 10) {
        Array.prototype.push.apply(svc_data, Array.apply(null, Array(10-svc_data.length)).map(function () { return {}; }));
      }

      if (!d.zerg) {
        canvasOverlay.redraw();
      }

      // update the UI if this isn't an embed and the device dimensions fit the minimum dims defined in minWidth & minHeight
      ((!args.embed) && showUI) && updateUserInterface(newData, timestamped.meta.created);
    // }
    // End of loop
  }
  if (args['%E2%99%9B'] && args['%E2%99%9B'] === '%E2%98%82') {
    d3.selectAll('#map').classed('tripping', true);
  }
})();
