
var Pjax = require('./pjax.js');


var GAS_PJAX = new Pjax();
var contentIndicator;
var imageIndicator;

$(document).ready(function() {

  var pjaxContainer = "pjax-container";
  var pjaxContents = "contents";
  var transitionEnd = getTransitionEndType();
  var nextPageURL = "";
  var pjaxPush = false;
  var wd = ScrollProperties.wd;
  var kd = ScrollProperties.kd;
  var t = document.getElementById("images"); // Target
  var p = t.getElementsByTagName("ul")[0];   // Parent
  var c = p.getElementsByTagName("li");      // Children
  var IndImgW, IndImgK;

  IndImgW = new Image();
  IndImgK = new Image();
  IndImgW.src = "/common/images/indicator_w.png";
  IndImgK.src = "/common/images/indicator_k.png";

  // Pjax callback
  var onloadStart = function() {
    if (contentScroller) {
      contentScroller.reset();
      contentScroller.stop();
    }
    GAS_PJAX.push("", nextPageURL, pjaxPush);
    document.getElementById("global-footer").style.opacity = 0;

    $("#gnav").removeClass("show");
  }

  var onloadAjaxContent = function(data) {
    replaceSideImages.build(data, sideImageOnLoadComplete);
  }

  var onReady = function(data) {
    var $anchor = $("#" + pjaxContents + " a[target!='_blank']");
    $anchor.not("a[href*='#']").click(onClickHandler);
    document.getElementById(pjaxContainer).style.height = "auto";
    currentPageHighlight("#gnav-main", 1);
    currentPageHighlight("#gnav-main ul", 2);
  }

  var onloadComplete = function() {
    if (imageScroller) imageScroller.resize();
    if (contentScroller) {
      contentScroller.start();
    } else {
      window.scrollTo(0,0);
    }

    document.getElementById(pjaxContainer).style.opacity = 1;
    document.getElementById("global-footer").style.opacity = 1;
    contentIndicator.hide();
    $("a[href*='/en/']").click(pageFadeOut);

  }

  var onPopstate = function(url) {
    pjaxPush = false;
    nextPageURL = url;
    document.getElementById(pjaxContainer).style.height = document.getElementById(pjaxContainer).offsetHeight  + "px";
    document.getElementById(pjaxContainer).style.opacity = 0;

    if (GAS_PJAX.isLoading()) {
      GAS_PJAX.cancel();
      replaceSideImages.cancel();
    }
  }

  var onCancel = function() {
    onloadStart();
  }

  var sideImageOnLoadComplete = function() {
    imageIndicator.hide();
    if (imageScroller) {
      imageScroller.resize();
      // 前回も今回も通常シリーズなら初期化しない
      if (replaceSideImages.getNextImagesType() === "default" && replaceSideImages.getPrevImagesType() === "default") {
        // タイトルがあるならフェードアウト
        if (document.getElementById("catch")) {
          // Nothing here.
        }
      } else {
        imageScroller.init();
      }
    }
  }



  // Pjax trigger
  function onClickHandler(e) {
    pjaxPush = true;
    nextPageURL = this.getAttribute("href");
    document.getElementById(pjaxContainer).style.height = document.getElementById(pjaxContainer).offsetHeight  + "px";
    document.getElementById(pjaxContainer).style.opacity = 0;
    if (e.preventDefault) e.preventDefault();
  }

  function onResize() {
    var wh = document.documentElement.clientHeight || document.body.clientHeight;
    var images = document.getElementById("images");
    if (imageScroller) imageScroller.resize();
    if (UA.device === "other") {
      images.style.height = wh + document.getElementsByTagName("body")[0].offsetHeight + "px";
    } else {
      images.style.height = $("#contents-wrapper").height()  + "px";
    }
  }

  function pageFadeOut(e) {
    var t = this;
    e.preventDefault();
    $("body").fadeOut(300, function() {
      window.location.href = $(t).attr("href");
    });
  }



  // Global navigation
  (function() {
    var $uls = $(".nav-ul");

    if ($(window).width() > 980) {
      $uls.find("ul").css({visibility: "hidden", opacity: 0});
    }

    $uls.children("li").on({
      "mouseover" : function() {
        $ul = $(this).find("ul");
        if ($ul) {
          var y = $(this).children("a").height();
          $ul.css({
            visibility: "visible",
            left: ($(this).width() >> 1) - ($ul.width() >> 1) + "px",
            top: y + "px"
          }).stop().animate({ opacity: 1 }, 100, "linear");
        }
      },
      "mouseout" : function() {
        $ul = $(this).find("ul");
        if ($ul) {
          $ul.stop().animate({ opacity: 0 }, 100, "linear", function() {
            $ul.css("visibility","hidden");
          });
        }
      }
    });

    $("#wrapper").mousewheel(function(e, delta, dx, dy) {
      var flag;
      dy > 0 ? flag = "show" : flag = "hide";
      return false;
    });

    // menu button
    $(document).ready(function() {

      if (UA.os === "win") {
        $("body").eq(0).addClass("windows");
      }

      if (UA.browser === "msie") {
        $("body").eq(0).addClass("msie");
      }

      $("#gnav").addClass("hide");

      $(".menu-button a").on("touchend click", function (e) {
        e.preventDefault();
        menuToggle($(this.getAttribute("href")));
      });

      var transitionEnd = getTransitionEndType();

      $("#gnav .wrap").eq(0).on("webkitTransitionEnd transitionend", function(e) {
        var $menu = $("#gnav");
        if (parseInt($(this).css("opacity")) === 0) {
          $menu.addClass("hide");
        }
      });


      $("#gnav .wrap").click(function(e) {
        e.stopPropagation();
        menuToggle($("#gnav"));
      });

      $("#gnav .move-anchor").click(function(e) {
        e.stopPropagation();
        menuToggle($("#gnav"));
      });

      $("#gnav a").click(function(e) {
        e.stopPropagation();
      });


      function menuToggle($menu) {

        if ($menu.hasClass("show")) {
          $menu.removeClass("show");

        } else {
          $menu.removeClass("hide").addClass("show");
        }
      }
    });
  })();

  // Reserve window
  (function() {
    var d = new Date();

    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var nextYear = year + 1;

    $("#yearSelect").val(year);
    $("#monthSelect").val(month);
    $("#daySelect").val(day);
    $("#yearSelect").append("<option>" + year +"</option><option>" + nextYear +"</option>");

    $("#search-button").click(function() {

      var ys = $("#yearSelect").val();
      var ms = $("#monthSelect").val();
      var ds = $("#daySelect").val();
      var ss = $("#staySelect").val();
      var ps = $("#personSelect").val();

      if (ss === "-") ss = 1;
      if (ps === "-") ps = 2;

      $(this).find("a").attr({
        href: "https://asp.hotel-story.ne.jp/ver3d/planlist.asp?hcod1=61190&hcod2=001&hidmode=select&mode=seek&hidSELECTARRYMD=" + ys + "/" + ms + "/" + ds + "&hidSELECTHAKSU=" + ss + "&hidSELECTadult=" + ps + ""
      });
    });



    // Select elements.
    var reserveBox = document.getElementById("reserve-box");
    var selectbuttons = reserveBox.getElementsByTagName("select");
    var duplicateSelectBtns = new Array();
    var l = selectbuttons.length;

    var DuplicateSelectValue = function(selectElm) {
      var t, change;
      t = this;
      t.select = typeof selectElm === "string" ? document.getElementById(selectElm) : selectElm;
      t.txtContainer = (function(selectElm, elementType) {
        var select, parent, elm;
        select = selectElm;
        parent = select.parentNode;
        elm = document.createElement("p");
        elm.setAttribute("class", "pseudo-selectbox");
        select.style.filter = "alpha(opacity=0)";
        select.style.opacity = 0;
        parent.insertBefore(elm, select);
        return elm;
      })(t.select);

      t.txtNode = document.createTextNode("");
      t.txtNode.nodeValue = t.select.value;
      t.txtContainer.appendChild(t.txtNode);

      change = function(e) {
        t.txtNode.nodeValue = e.target.value;
      };

      if (t.select.addEventListener) {
        t.select.addEventListener("change", change, false);

      } else if (t.select.attachEvent) {
        t.select.attachEvent("onchange", change);
      } else {
        t.select.onchange = change;
      }
      return t.txtContainer;
    };

    for (var i = 0; i < l; i++) {
      duplicateSelectBtns[i] = new DuplicateSelectValue(selectbuttons[i].getAttribute("id"));
    }

  })();



  $(window).load(function() {

    if (history.pushState) {

      imageIndicator = new Indicator("indW", IndImgW.src, "#images");
      imageIndicator.init();

      contentIndicator = new Indicator("indK", IndImgK.src, "#wrapper", "#pjax-container");
      contentIndicator.init();

      document.getElementById(pjaxContainer).addEventListener(transitionEnd, function(e) {
        if (e.propertyName === "opacity" && parseInt($(this).css("opacity")) === 0) {
          contentIndicator.show();
          onloadStart();
        }
      }, false);

      $("#global-footer a, a[target!='_blank']").not("#gnav-lang a, a[href*='#'], a.no-pjax").click(onClickHandler);
      GAS_PJAX.init(pjaxContainer, pjaxContents, onloadComplete, onReady, onloadAjaxContent, onPopstate, onCancel);
    }

    $("a[href*='/en/']").click(pageFadeOut);

    replaceSideImages = new ReplaceSideImages(t, p);

    imageScroller = new ImageScroller(p, c, [wd, kd]);
    imageScroller.init();
    imageScroller.start();

    if (UA.device === "other") {

      contentScroller = new ContentScroller([wd, kd]);
      contentScroller.start();

      $(window).scroll(function(e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        return false;
      });

      $("#wrapper").mousewheel(function(e, delta, dx, dy) {
        var d = delta / 5;
        contentScroller.onMouseWheel(wd, d);
        imageScroller.onMouseWheel(wd, d);

        e.preventDefault ? e.preventDefault() : e.returnValue = false;
        e.stopPropagation();
        return false;
      });

    } else {
      document.getElementsByTagName("body")[0].setAttribute("class", "multi-touch-device");
    }

    if (document.getElementById("catch")) {
      var def = $("#catch").css("-moz-transition");
      $("#catch").css({
        webkitTransition: "none",
        transition: "none",
      })
      $("#catch").css("opacity", 0).delay(1000).animate({opacity: 1}, 2000, function(){
        $("#catch").css({
          webkitTransition: "none",
          transition: "none",
        })
      });
    }
    onResize();
  });

  onResize();
  $(window).resize(onResize);
  currentPageHighlight("#gnav-main", 1);
  currentPageHighlight("#gnav-main ul", 2);
})


if (GAS_PJAX.isTransition() === false) {
  $(document).ready(function () {
    GAS_pjaxDOMContentLoaded();
  });
}

function GAS_pjaxOnLoadComplete() {
  imageScroller.y(1);
}

function GAS_pjaxDOMContentLoaded() {

  $("#navigation ul").parent().append("<span class='arrow'></span>");
  $("#navigation ul, #navigation .arrow").hide();

  $("#navigation > li").on({
    "mouseover": function() {
      $ul = $(this).find("ul");
      $ar = $(this).find(".arrow");

      if ($ul) {
        var offset = $(this).offset();
        var x = offset.left - $(this).parent().offset().left;
        var y = offset.top + $(this).children("a").height();
        var margin = 15;
        $ul.css({
          display: "block",
          left: 0 /* x + ($(this).width() / 2) - ($ul.width() / 2) + "px"*/ ,
          top: y + margin + "px"
        }).stop().animate({ opacity: 1 }, 100, "linear");

        $ar.css({
          display: "block",
          left: x + ($(this).width() / 2) - ($ul.width() / 2) + "px",
          top: y + margin + "px"
        }).stop().animate({ opacity: 1 }, 100, "linear");
      }
    },
    "mouseout": function() {
      $ul = $(this).find("ul");
      $ar = $(this).find(".arrow");
      if ($ul) {
        $ul.stop().animate({ opacity: 0 }, 200, "linear", function () {
          $ul.css("display","none");
        });

        $ar.stop().animate({ opacity: 0 }, 200, "linear", function () {
          $ar.css("display","none");
        });
      }
    }
  });
}

function GAS_pjaxDestroyJS() {
  GAS_pjaxOnLoadComplete = null;
  GAS_pjaxDOMContentLoaded = null;
  GAS_pjaxDestroyJS = null;
};
