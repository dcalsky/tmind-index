
/*
 * pjax.js
 *
 * Copyright (C) 2013 GLIDE ARTS STUDIO.
 * @ version 0.4
 * @ 2013-06-21
 * @ 2013-09-07
 * @ 2014-07-09 last
 *
 * Registering and using callbacks.
 *
 * GAS_pjaxDOMContentLoaded
 * GAS_pjaxOnLoadComplete
 * GAS_pjaxDestroyJS
 */

var Pjax = function () {

  "use strict";

  var _t = this;
  var _contentID;
  var _containerID;
  var _content;
  var _container;
  var _stateObj = new Object();
  var _onloadCallbackFunc;
  var _DOMCallbackFunc;
  var _onloadAjaxContentCallbackFunc
  var _popstateCallbackFunc;
  var _cancelCallbackFunc;
  var _httpReq;

  this.ismoved = false;
  this.isloading = false;
  this.isquit = false;

  return {
    init: function (container, target, onloadCallback, DOMcontentLoadedCallback, onloadAjaxContentCallback, popstateCallback, cancelCallback) {

      var t = this;

      _contentID = target;
      _containerID = container;
      _onloadCallbackFunc = onloadCallback;
      _DOMCallbackFunc = DOMcontentLoadedCallback;
      _onloadAjaxContentCallbackFunc = onloadAjaxContentCallback;
      _popstateCallbackFunc = popstateCallback;
      _cancelCallbackFunc = cancelCallback;
      _content = document.getElementById(_contentID);
      _container = document.getElementById(_containerID);

      function popStateHandler(e) {
        if (!e || !e.state) return;

        if (_popstateCallbackFunc) {
          _popstateCallbackFunc(history.state.path);
        } else {
          t.update(window.location);
        }
      }
      window.addEventListener("popstate", popStateHandler, false);
    },
    push: function (title, url, pushstate) {
      if (pushstate) {
        if (_gaq) _gaq.push(["_trackPageview", url]); // Google Analytics
        _stateObj = {path: url};
        history.pushState(_stateObj, title, url);
      }
      _t.ismoved = true;
      this.update(url);
    },
    update: function (url) {

      _t.isquit = false;
      _t.isloading = true;
      if (typeof GAS_pjaxDestroyJS === "function") {
        GAS_pjaxDestroyJS();
      }

      if (document.getElementById(_contentID) && document.getElementById(_containerID)) {
        var c = document.getElementById(_contentID);
        document.getElementById(_containerID).removeChild(c);
      }

      if (window.XMLHttpRequest) {
        _httpReq = new XMLHttpRequest();
        if (_httpReq.overrideMimeType) {
          _httpReq.overrideMimeType("text/xml");
        }
      }
      _httpReq.open("GET", url, true);
      _httpReq.send(null);
      _httpReq.onreadystatechange = function () {
        if (_t.isquit) {
          if (_cancelCallbackFunc) {
            _cancelCallbackFunc();
          }
          return false;
        }
        if (_httpReq.readyState === 4) {
          if (_httpReq.status === 200) {
            onloadAjaxContent(_httpReq.responseText);
            if (_onloadAjaxContentCallbackFunc) {
              _onloadAjaxContentCallbackFunc(_httpReq.responseText);
            }
          } else {
            _httpReq.abort();
          }
        }
      }

      function onloadAjaxContent(data) {
        var container = document.getElementById(_containerID);
        var clone;
        var doc = data.replaceAll(/[\n\r]/," ").replaceAll(/\t/,"");
        var head = new String(doc.match(/<head>.+?<\/head>/));
        var title = doc.replace(/<!DOCTYPE(.+)((<title+?>)|(<title.+?>))/, "").replace(/<\/title>.*<\/html>/, "");
        var body = doc.replace(/<!DOCTYPE(.+)((<body+?>)|(<body.+?>))/, "").replace(/<\/body><\/html>/, "");
        var newCSSElements = new Array();
        var newCSSLoadedElements = new Array();
        var newScriptElements = new Array();
        var newScriptLoadedElements = new Array();
        var query = "";

        if (_t.isquit) {
          if (_cancelCallbackFunc) {
            _cancelCallbackFunc();
          }
          return false;
        }

        // 1. 鐙嚜link瑕佺礌(stylesheet)銆佺嫭鑷猻cript瑕佺礌銇墛闄�
        function deleteElement(tagName) {
          if (_t.isquit) {
            if (_cancelCallbackFunc) {
              _cancelCallbackFunc();
            }
            return false;
          }

          var elements = document.getElementsByTagName(tagName);
          var l = elements.length;
          // 鏃ink瑕佺礌銈掕銇瑰墛闄ゃ仐銇︺亜銇忋仧銈併€侀厤鍒椼伄寰屻倣銇嬨倝銉併偋銉冦偗
          for (var i = l; i > 0; i--) {
            var e = elements[i-1];
            var parent = e.parentNode;
            var data = e.getAttribute("data-type");

            if(data === "unique") {
              parent.removeChild(e);
            }
          }

        }

        deleteElement("link");
        deleteElement("script");

        //  2. link瑕佺礌(stylesheet)銇蛋鏌汇仺閰嶇疆 - 3. 2銇儹銉笺儔鐩ｈ
        (function() {
          if (_t.isquit) {
            if (_cancelCallbackFunc) {
              _cancelCallbackFunc();
            }
            return false;
          }

          while (head.match(/<link.+?>/)) {
            var c = getPathString(/<link.+?>/ , /href=".+?"/);
            var e = new String(head.match(/<link.+?>/));
            var q = "";
            if (navigator.userAgent.toLowerCase().indexOf("msie") > 0 === "msie") {
              q = "?date=" + new Date().getTime();
            }
            try {
              if (e.indexOf("stylesheet") > -1) {
                var es = document.getElementsByTagName("link");
                var l = es.length;
                var f = false;
                for (var i = 0; i < l; i++) {
                  if (es[i].getAttribute("href") === c) {
                    f = true;
                    break;
                  }
                }
                if (!f) {
                  var elm = document.createElement("link");
                  elm.setAttribute("rel", "stylesheet");
                  elm.setAttribute("type", "text/css");
                  elm.setAttribute("media", "all");
                  elm.setAttribute("href", c + query);
                  elm.setAttribute("data-type", "unique");
                  document.getElementsByTagName("head")[0].appendChild(elm)
                  newCSSElements[newCSSElements.length] = elm;

                  /*
                   elm.addEventListener("load", function (e) {
                   elm.removeEventListener("load", arguments.callee, false);
                   CSSElementOnloadComplete(e);
                   }, false);
                   */

                  // Safari5, IE10銇俱仹銇痩ink銈裤偘銇畂nload銇屽彇銈屻仾銇勩伄銇�
                  // 銉€銉熴兗瑕佺礌銇偍銉┿兗寰呫仭銇у彇寰椼倰琛屻亞銆�
                  var dummy = document.createElement("img");
                  dummy.onerror = function (e) {
                    CSSElementOnloadComplete(e);
                  }
                  dummy.src = c + query;
                }
              }
            } catch (e) {
              alert(e);
            }

            // 銈姐兗銈广亱銈夊墛闄�
            head = head.replace(/<link.+?>/,"");
          }

          // Next
          if (newCSSElements.length === 0) {
            addScriptElements();
          }

          function CSSElementOnloadComplete(e) {
            newCSSLoadedElements.push(e);
            // 鍏ㄣ仸銇偆銉欍兂銉堛亴绲備簡銇椼仧銈�
            if (newCSSElements.length === newCSSLoadedElements.length) {
              addScriptElements();
            }
          }
        })();

        //  4. script瑕佺礌銇蛋鏌汇仺閰嶇疆 - 5. 4銇儹銉笺儔鐩ｈ
        function addScriptElements() {

          if (_t.isquit) {
            if (_cancelCallbackFunc) {
              _cancelCallbackFunc();
            }
            return false;
          }

          while (head.match(/<script.+?>/)) {

            // 銈炽兂銉囥偅銈枫儳銉娿儷銈炽儭銉炽儓銇洸銇俱倢銇︺亜銈媠cript銈裤偘銇�
            // 鍙栧緱銇с亶銇亜銇仹銈裤偘銇嫭鑷猟ata灞炴€с伀unique銇屻仱銇勩仸銇勩倠銇嬨仼銇嗐亱銇у垽鍒�

            var script = head.match(/<script.+?>/);
            var c = getPathString(/<script.+?>/ , /src=".+?"/);

            // 銇撱伄銉氥兗銈哥嫭鑷伄銈裤偘銇嬬⒑瑾嶃€傜劇銇戙倢銇伴厤缃倰琛屻亞
            if (new String(script).indexOf("unique") > -1) {
              var elm = document.createElement("script");
              elm.setAttribute("src", c + "?date=" + new Date().getTime());
              elm.setAttribute("data-type", "unique");
              elm.addEventListener("load", onloadScriptElement, false);
              document.getElementsByTagName("head")[0].appendChild(elm)
              newScriptElements[newScriptElements.length] = elm;
            }

            head = head.replace(/<script.+?>/,"");
          }

          // Next
          if (newScriptElements.length === 0) {
            end();
          }

          function onloadScriptElement(e) {
            ScriptElementOnloadComplete(e);
            e.target.removeEventListener("load", onloadScriptElement, false);
          }

          function ScriptElementOnloadComplete(e) {
            newScriptLoadedElements.push(e);
            if (newScriptElements.length === newScriptLoadedElements.length) {
              end();
            }
          }
        }

        //  6. container瑕佺礌銇厤缃� - 7. DOMContentLoaded
        function end() {

          if (_t.isquit) {
            if (_cancelCallbackFunc) {
              _cancelCallbackFunc();
            }
            return false;
          }

          // open graph銇鏇�
          var meta = document.getElementsByTagName("meta");

          for (var i = 0; i < meta.length; i++) {
            if (meta[i].getAttribute("property")) {
              var prop = meta[i].getAttribute("property");

              if(prop.indexOf("og:title") > -1){
                meta[i].setAttribute("content", title);
              }
              if(prop.indexOf("og:url") > -1){
                meta[i].setAttribute("content", location.href);
              }
            }
          }

          _container.innerHTML = body;
          clone = document.getElementById(_contentID).cloneNode(true);
          document.getElementById(_containerID).innerHTML = "";
          // HTML銈ㄣ兂銉嗐偅銉嗐偅銇蹇溿仹銇嶃仾銇勩仧銈乨ocument.title銇с伄浠ｅ叆銇銈忋仾銇勩€�
          document.getElementsByTagName("title")[0].innerHTML = title;
          _container.appendChild(clone); // DOMContentLoaded銇浉褰�


          if (_DOMCallbackFunc) {
            _DOMCallbackFunc(data);
          }

          if (typeof GAS_pjaxDOMContentLoaded === "function") {
            GAS_pjaxDOMContentLoaded();
          }

          PreloadImages(_contentID, finish);
        }

        //  8. 鎸囧畾銈炽兂銉嗐儕鍐呫伄鐢诲儚銇蛋鏌� - 9. 8銇儹銉笺儔鐩ｈ
        function PreloadImages(targetNode, callback) {

          if (_t.isquit) {
            if (_cancelCallbackFunc) {
              _cancelCallbackFunc();
            }
            return false;
          }

          var id;
          var imgSrcs      = new Array();
          var loadedImages = new Array();
          var loadedCount  = 0;
          var area         = typeof targetNode === "string" ? document.getElementById(targetNode) : targetNode;
          var images       = area.getElementsByTagName("img");
          var l            = images.length;

          //this.target = targetNode;

          for (var i = 0; i < l; i++) {
            var date = new Date();
            var img = new Image();
            var query = "";
            imgSrcs[i] = images[i].getAttribute("src");
            if (navigator.userAgent.toLowerCase().indexOf("msie") > 0 === "msie") {
              query = "?date=" + date.getTime();
            }
            img.onload = img.onerror = function () {onloadItem(this.number);}
            img.src = imgSrcs[i] + query;
            img.number = i;
          }

          function onloadItem(num) {
            if (_t.isquit) {
              if (_cancelCallbackFunc) {
                _cancelCallbackFunc();
              }
              return false;
            }

            loadedCount++;
            loadedImages[num] = num;

            if (loadedCount === l && callback) callback();
          }

          function getChildNodes(element) {
            var childNodes;
            for (var i = 0; i < 10; i++) {
              if (element.childNodes[i].tagName != undefined) {
                childNodes = element.childNodes[i];
                break;
              }
            }
            return childNodes;
          }
        }

        function finish() {
          // 10. onload
          _t.isloading = false;

          if (typeof GAS_pjaxOnLoadComplete === "function") {
            GAS_pjaxOnLoadComplete();
          }
          if (_onloadCallbackFunc) {
            _onloadCallbackFunc();
          }
        }

        function getPathString(regexp, attr) {
          var e = new String(head.match(regexp));
          var a = new String(e.match(attr));
          var b = new String(a.match(/".+?"/,""));
          return b.replaceAll(/"/,"");
        }
      }
    },
    cancel: function () {
      _t.isquit = true;
      _httpReq.abort();
    },
    isLoading: function () {
      return _t.isloading;
    },
    isTransition: function () {
      return _t.ismoved;
    }
  }
}

String.prototype.replaceAll = function (org, dest) {
  return this.split(org).join(dest);
}

module.exports = Pjax;
