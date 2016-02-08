
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
}

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
}





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
  }

  this.stopped = true;
  this.yp = 0;
  this.id = 0;
  this.onEnterframe = function() {
    var s = document.documentElement.scrollTop || document.body.scrollTop;
    _enterYp += (_this.yp - s) / _s;
    window.scrollTo(0,  parseInt(_enterYp));
    _this.id = requestAnimationFrame(_this.onEnterframe);
  }

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
  var _children = c
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

            // 鐩鍊ゃ亴娆°伄瀛愯绱犮伄楂樸仌銈掕秴銇堛仧銈�
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



var ReplaceSideImages = function(target, parent) {

  var _t = this;
  var _target = target;
  var _parent = parent;
  var _transitionEnd = getTransitionEndType();

  this.nextImageType = "default";
  this.prevImageType = "default";
  this.isquit = false;

  return {
    init: (function() {
      var ul = _target.getElementsByTagName("ul")[0];
      _t.nextImageType = ul.getAttribute("data-type") ? "unique" : "default";
    })(),
    build: function(responseText, callback) {

      var t = this;
      var doc = responseText.replaceAll(/[\n\r]/," ").replaceAll(/\t/,"");
      var body = doc.replace(/<!DOCTYPE(.+)((<body+?>)|(<body.+?>))/, "").replace(/<\/body><\/html>/, "");
      var images = doc.match(/<div id="images">.+?<\/div>/);
      var loadedImageElements = new Array();
      var count = 0;
      var query = "";

      _t.isquit = false;

      if (document.getElementById("catch")) {
        document.getElementById("images").removeChild(document.getElementById("catch"));
      }

      var div = document.createElement("div");
      document.getElementsByTagName("body")[0].appendChild(div);
      div.innerHTML = images;
      div.id = "dummyContainer";

      var imgTags = new Array();
      var ul = div.getElementsByTagName("ul")[0];
      var img = ul.getElementsByTagName("img");
      var p = div.getElementsByTagName("p")[0];
      var len = img.length;
      var titleElm = new Object();

      if (navigator.userAgent.toLowerCase().indexOf("msie") > 0 === "msie") {
        query = "?date=" + new Date().getTime();
      }

      for (var n = 0; n < len; n++) {
        imgTags[n] = ul.getElementsByTagName("img")[n].getAttribute("src") + query;
      }

      if (p && p.getAttribute("id") === "catch") {
        titleElm.src = p.getElementsByTagName("img")[0].getAttribute("src");
        titleElm.alt = p.getElementsByTagName("img")[0].getAttribute("alt");
      }

      document.getElementsByTagName("body")[0].removeChild(div);
      div = null;

      _t.prevImageType = _t.nextImageType;
      _t.nextImageType = ul.getAttribute("data-type") ? "unique" : "default";

      if (_t.nextImageType === "unique" || _t.nextImageType !== _t.prevImageType) {

        _parent.addEventListener(_transitionEnd, function(e) {
          if (_t.isquit) {
            imageScroller.stop();
            t.show();
            this.removeEventListener(_transitionEnd, arguments.callee, false);
            return false;
          }

          if (e.propertyName === "opacity" && parseInt($(this).css("opacity")) === 0) {
            if (imageScroller) {
              imageScroller.stop();
            }

            for (var i = 0; i < len; i++) {
              var imgobj = new Image();
              imgobj.src = imgTags[i] + query;
              imgobj.name = i;
              imgobj.addEventListener("load", function(e) {
                addImage(this.name, len, this.width, this.height);
                this.removeEventListener("load", arguments.callee);
              }, false);
            }
            this.removeEventListener(_transitionEnd, arguments.callee, false);
          }

        }, false);

        t.hide();
      }

      function addImage(num, len) {

        if (_t.isquit) {
          t.show();
          return false;
        }

        var img = document.createElement("img");
        img.src = imgTags[num];
        img.setAttribute("class", "loading");
        img.setAttribute("id", "img" + num);
        loadedImageElements[num] = img;
        count++;

        if (count >= len) {
          $("#images li").remove();

          for (var i = 0; i < len; i++) {
            var li = document.createElement("li");
            li.appendChild(loadedImageElements[i]);
            _parent.appendChild(li);
          }

          if (imageScroller) {
            imageScroller.resize();
            imageScroller.start();
          }

          t.show();

          if (typeof titleElm.src != "undefined") {
            if (document.getElementById("catch")) {
              $("#catch").remove();
            }
            addTitle();
          } else {
            if (callback) callback();
          }
        }
      }

      function addTitle() {
        var titleimg = new Image();
        titleimg.src = titleElm.src + query;
        titleimg.onload = function() {
          var images = document.getElementById("images");
          images.insertBefore((function(obj) {
            var p = document.createElement("p");
            var img = document.createElement("img");
            img.src = obj.src + query;
            img.alt = obj.alt || "";
            p.id = "catch";
            p.appendChild(img);
            return p;
          })(titleElm), images.getElementsByTagName("ul")[0]);
          $("#catch").css("opacity", 0).delay(500).animate({opacity: 1}, 2000);
          if (callback) callback();
        }
      }
    },
    getNextImagesType: function() {
      return _t.nextImageType;
    },
    getPrevImagesType: function() {
      return _t.prevImageType;
    },
    show: function() {
      _parent.style.opacity = 1;
    },
    hide: function() {
      imageIndicator.show();
      _parent.style.opacity = 0;
    },
    cancel: function() {
      $("#images li").remove();
      _parent.style.opacity = 1;
      _t.isquit = true;
      _t.nextImageType = "unique";
    }
  }
}



var currentPageHighlight = function(element, dirLevel) {

  var len = 0;
  var dirLv = 0;
  var URL = document.URL;
  var dirName = URL.match(".+/(.+?)$")[1];
  var currentURL = URL.substring(0, URL.length - dirName.length);
  var dirAry = URL.split("/");
  dirAry.shift();
  dirAry.shift();
  len = dirAry.length;

  if (typeof dirLevel === "undefined" || dirLevel === null) {
    dirLv = 0;
  } else {
    dirLv = dirLevel;
    len = dirLv;
  }

  $(element).find("a").parent().removeClass("current");

  for (var j = dirLv; j <= len; j++) {
    $(element).find("a[href*='/" + dirAry[j] + "/']").parent().addClass("current");
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



var ElementUntil = function(name, callback) {

  var _t = this;

  this.callback = callback;
  this.name = name;

  this.found = function() {
    if (_t.callback) _t.callback(_t.name);
  }
  this.search = function() {
    if (document.getElementById(_t.name)) {
      _t.found();
    } else {
      setTimeout(_t.search, 1);
    }
  }
  this.search();
};

var windowHasLoaded = false;

(function () {

  $(window).load(function() {
    windowHasLoaded = true;
    if (initIndicator && document.getElementById("indR")) {
      showContent();
    }
  });

  var indSrcExt = (UA.browser === "msie" && UA.version < 10) ? ".gif" : ".png";

  if (UA.browser === "msie" && UA.version < 9) {
    console.log("You are using an outdated browser.");

  } else {
    var indicatorImage = new Image();
    var eUntil1 = new ElementUntil("wrapper", hideContent);
    var eUntil2 = new ElementUntil("header-wrapper", hideContent);
    indicatorImage.src = "/common/images/indicator_k" + indSrcExt;
    initIndicator = new Indicator("indR", indicatorImage.src, "body");
  }

  function hideContent(name) {
    document.getElementById(name).style.visibility = "hidden";
    document.getElementById(name).style.opacity = 0;
    if (!document.getElementById("indR")) {
      initIndicator.init();
      initIndicator.show();
    }
    if (windowHasLoaded) {
      showContent();
    }
  }

  function showContent() {
    initIndicator.hide();
    $("#wrapper, #header-wrapper").css("visibility", "visible").animate({opacity: 1}, 500);
  }


  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

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



var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-44503239-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript';
  ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' :
      'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
//*/


console.log("Welcome to Ryokan Sanga :)");