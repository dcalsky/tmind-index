
var imageScroller;
var contentScroller;
var replaceSideImages;
var initIndicator;

var SCROLLWHEEL_DISTANCE = 100;
var KEYPRESS_DISTANCE = 100;
var SPEED_DISTANCE = 2;


// @ v 1.2 @ 2013-09-27

var UserAgent = function(userAgent) {
  ua: userAgent
}

UserAgent.prototype.ua = navigator.userAgent.toLowerCase();

UserAgent.prototype = {

  os: (function(a) {
    var o;
    if (a.ua.indexOf("win") > -1) {
      o = "win";
    } else if (a.ua.indexOf("mac") > -1) {
      o = "mac";
    } else if (a.ua.indexOf("linux") > -1) {
      o = "linux";
    } else {
      o = "other";
    }
    return o;
  })(UserAgent.prototype),

  browser: (function(a) {
    var b;
    if (a.ua.indexOf("msie") > -1 || a.ua.indexOf("trident") > -1) {
      b = "msie";
    } else if (a.ua.indexOf("firefox") > -1) {
      b = "firefox";
    } else if (a.ua.indexOf("safari") > -1 && a.ua.indexOf("chrome") == -1) {
      b = "safari";
    } else if (a.ua.indexOf("chrome") > -1) {
      b = "chrome";
    } else {
      b = "other";
    }
    return b;
  })(UserAgent.prototype),

  version: (function(a) {
    var v;
    if (a.ua.indexOf("msie") > -1) {
      v = parseInt(a.ua.substring(a.ua.indexOf("msie") + 5));
    } else if (a.ua.indexOf("trident") > -1) {
      v = parseInt(a.ua.substring(a.ua.indexOf("rv") + 3));
    } else if (a.ua.indexOf("firefox") > -1) {
      v = parseInt(a.ua.substring(a.ua.indexOf("firefox") + 8));
    } else if (a.ua.indexOf("safari") > -1 && a.ua.indexOf("chrome") == -1) {
      v = parseInt(a.ua.substring(a.ua.indexOf("version") + 8));
    } else if (a.ua.indexOf("chrome") > -1) {
      v = parseInt(a.ua.substring(a.ua.indexOf("chrome") + 7));
    } else {
      v = undefined;
    }
    return v;
  })(UserAgent.prototype),

  device: (function(a) {
    var d;
    if (a.ua.indexOf("iphone") > -1) {
      d = "iphone";
    } else if (a.ua.indexOf("ipod") > -1) {
      d = "ipod";
    } else if (a.ua.indexOf("ipad") > -1) {
      d = "ipad";
    } else if (a.ua.indexOf("android") > -1) {
      d = a.ua.indexOf("mobile") > -1 ? "android_mobile" : "android_tablet";
    } else {
      d = "other";
    }
    return d;
  })(UserAgent.prototype)
};

var UA = new UserAgent(navigator.userAgent.toLowerCase());





var Indicator = function(id, src, parent, target) {

  var _t = this;

  this.id = id;
  this.ap = parent;
  this.target = target ? target : parent;
  this.src = src;
  this.indctr;

  return {
    init: function() {

      var te = getTransitionEndType();
      var c = document.createElement("div");
      var indicator = document.createElement("span");
      c.style.width = $(_t.target).width() + "px";
      c.style.height = "30px";
      c.id = _t.id;
      c.appendChild(indicator);
      c.setAttribute("class", "indicator");

      if (c.addEventListener) {
        c.addEventListener(te, function(e) {
          if (e.propertyName === "opacity") {
            _t.indctr.style.display = "none";
          }
        }, false);
      }

      indicator.style.background = "url(" + _t.src + ") no-repeat left top";

      if (_t.ap.indexOf("#") > -1) {
        document.getElementById(_t.ap.substring(1)).appendChild(c);
      } else {
        document.getElementsByTagName(_t.ap)[0].appendChild(c);
      }
      _t.indctr = c;
    },
    show: function() {
      var ind = $(_t.indctr);
      var ins = _t.indctr.style;
      ins.opacity = 1;
      ins.display = "block";
      ins.top = ($(window).height() >> 1) - (ind.height() >> 1) + "px";
      ins.left = $(_t.ap).offset().left + "px";
      ins.width = $(_t.target).width() + "px";
    },
    hide: function() {
      _t.indctr.style.opacity = 0;
    }
  }
}



var ScrollProperties = new function() {

  var _t = this;

  // Scroll wheel
  this.wd = (function(distance) {
    var d = distance;
    var b = UA.browser;
    if (b !== "msie") {
      d = 4;
    }
    if (UA.os === "win") {
      if (b === "msie") {
        d = 136;
      } else {
        d = (d << 4) + (d << 3) + d; // * 25
      }
    }
    return d;
  })(SCROLLWHEEL_DISTANCE);

  // Keyboard
  this.kd = (function(distance) {
    var d = distance;
    var b = UA.browser;
    if (b === "safari" || b === "chrome" || b === "opera") {
      d = 40;
    } else if (b === "firefox") {
      d = _t.wd >> 1; // *2
    }
    if (b === "msie") {
      d = 114;
    }
    return d;
  })(KEYPRESS_DISTANCE);

  this.sp = (function(n) {
    return UA.os === "win" ? n * 4 : n * 3;
  })(SPEED_DISTANCE);
};

var ContentScroller = function(d) {

  var _this = this;
  var _dis = d[0];
  var _dlt = 0;
  var _s = ScrollProperties.sp;
  var _enterYp = 0;

  var antiExtrusion = function(yp) {
    var y = yp;
    var doc = document;
    var dh = doc.documentElement.scrollHeight || doc.body.scrollHeight;
    var wh = doc.documentElement.clientHeight || doc.body.clientHeight;

    if (y < 0) {
      y = 0;
    } else if (y >= dh - wh) {
      y = dh - wh;
    }
    return y;
  };

  this.stopped = true;
  this.yp = 0;
  this.id = 0;
  this.onEnterframe = function() {
    var s = document.documentElement.scrollTop || document.body.scrollTop;
    _enterYp += (_this.yp - s) / _s;
    window.scrollTo(0,  parseInt(_enterYp));
    _this.id = requestAnimationFrame(_this.onEnterframe);
  };

  return {
    reset: function() {
      _this.yp = 0;
      _enterYp = 0;
      window.scrollTo(0, 0);
    },
    onMouseWheel: function(d, dlt) {
      _this.yp = antiExtrusion(_this.yp - d * parseInt(dlt));
    },
    start: function() {
      if (_this.stopped) {
        _this.id = requestAnimationFrame(_this.onEnterframe);
        _this.stopped = false;
      }
    },
    stop: function() {
      _this.stopped = true;
      cancelAnimationFrame(_this.id);
    },
    y: function(yp) {
      if (yp) _this.yp = antiExtrusion(yp);
      return _this.yp;
    }
  }
}



var ImageScroller = function(p, c, d) {

  var doc = document;
  var _dh = doc.documentElement.scrollHeight || doc.body.scrollHeight;
  var _wh = doc.documentElement.clientHeight || doc.body.clientHeight;
  var _this = this;
  var _parent = p;
  var _children = c;
  var _dis = d[0];
  var _dlt = 0;
  var _s = ScrollProperties.sp;
  var _enterYp = 0;

  this.dis = d[0];
  this.stopped = true;
  this.parentHeight = _parent.offsetHeight;
  this.id = 0;
  this.yp = 0;
  this.onEnterframe = function() {
    _enterYp += (_this.yp - parseInt($(_parent).css("top"))) / _s;
    _parent.style.top = parseInt(_enterYp) + "px";
    _this.id = requestAnimationFrame(_this.onEnterframe);
  }

  return {
    init : function() {
      _this.yp = _enterYp = 0;
      _parent.style.top = _this.yp + "px";
      this.parentHeight = _parent.offsetHeight;
      this.onMouseWheel(0,0);
    },
    onMouseWheel : function(dis, dlt) {
      var t = this;
      var y = parseInt(_parent.style.top);
      var d = 0;
      var n = 0;
      var ch = 0;
      var cld;

      if (!_this.stopped) {
        d = dis * parseInt(dlt);
        n = _this.yp + d;

        if (dlt < 0 && n < _wh - _this.parentHeight) {
          while (n < _wh - _this.parentHeight + d) {
            cld = _children[0];
            ch = cld.offsetHeight;
            _parent.appendChild(cld);
            _this.yp = _this.yp + ch - d;
            _enterYp += ch;
            _parent.style.top = _enterYp + "px";
            n = _this.yp;
          }
        }

        if (_this.yp + d > 0) {
          var cl = _children.length;
          while (n > 0) {
            cld = _children[cl - 1] || _children[0];
            ch = cld.offsetHeight;
            _parent.insertBefore(cld, _children[0]);
            _this.yp = _this.yp - ch + d;
            _enterYp -= ch;
            _parent.style.top = _enterYp + "px";
            n = _this.yp;
            if (n > cld.offsetHeight) {
              n = cld.offsetHeight;
              break;
            }
          }
        } else {
          _this.yp += d;
        }
      }
    },
    resize: function() {
      var doc = document;
      var title = document.getElementById("catch");
      _this.parentHeight = _parent.offsetHeight;
      _dh = doc.documentElement.scrollHeight || doc.body.scrollHeight;
      _wh = doc.documentElement.clientHeight || doc.body.clientHeight;

      if (title) {
        title.style.top = ($(window).height() >> 1) - ($("#catch img").height() >> 1) + "px";
      }
    },
    start: function() {
      if (_this.stopped) {
        _this.id = requestAnimationFrame(_this.onEnterframe);
        _this.stopped = false;
      }
    },
    stop: function() {
      _this.stopped = true;
      cancelAnimationFrame(_this.id);
    },
    y: function(yp) {
      if (yp) {
        var st = doc.documentElement.scrollTop || doc.body.scrollTop;
        var d = -parseInt(yp);
        var dlt = -(_this.dis / (d - st));

        console.log((d - st) + " / " + dlt);
        _this._yp = 0;
      }
      return _this._yp;
    }
  }
}

var getTransitionEndType = function() {

  var e = document.createElement("div"); // Dummy element
  var t = {
    "WebkitTransition" : "webkitTransitionEnd",
    "transition" : "transitionend"
  }
  for (var i in t) {
    if (typeof e.style[i] !== "undefined") {
      e = null;
      return t[i];
    }
  }
}

var windowHasLoaded = false;

(function () {

  $(window).load(function() {
    windowHasLoaded = true;
  });


  window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  })();

  window.cancelAnimationFrame = (function() {
    return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
  })();

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (cb) {
      var id = window.setTimeout(cb, 1000 / 60);
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      window.clearTimeout(id);
    }
  }

})();
