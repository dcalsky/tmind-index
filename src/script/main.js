import '../static/init.css';
var imageScroller = null;
$(document).ready(function() {
  var wd = ScrollProperties.wd;
  var kd = ScrollProperties.kd;
  var t = document.getElementById("images"); // Target
  var p = t.getElementsByTagName("ul")[0];   // Parent
  var c = p.getElementsByTagName("li");      // Children

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

  $(window).load(function() {
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
    onResize();
  });
});

