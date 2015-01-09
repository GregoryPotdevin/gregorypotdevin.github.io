var ArmaTools = ArmaTools || {};

ArmaTools.Resizer = function()
{
  // options: {
  //   min: left bound
  //   max: right bound
  //   usePercentage: percentage instead of pixels
  // }

  var clamp = function(v, min, max){
    if (v < min){
      return min;
    } else if (v > max){
      return max;
    } else {
      return v;
    }
  }

  var clone = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  var expandOptions = function(options){
    var options = clone(options);
    if (!('usePercentage' in options)){
      options.usePercentage = false;
    }

    return options;
  }

  var outerWidth = function(elem){
      var style = document.defaultView.getComputedStyle(elem);
      var w = parseInt(style.width, 10);
      console.log("Inner width: " + w);
      var padding = parseInt(style['padding-left'], 10) + parseInt(style['padding-right'], 10);
      return w + padding;
  }

  var setupDrag = function(elem, options, dragFn){
    // Return a function to setup the drag events
    return function(e){
      e.stopPropagation();
      var parentWidth = parseInt(document.defaultView.getComputedStyle(elem.parentNode).width, 10);
      var parentOuterWidth = outerWidth(elem.parentNode);
      // console.log("parentWidth: " + parentWidth);
      // console.log("parentOuterWidth: " + parentOuterWidth);

      options.cMin = options.min ? (options.usePercentage ? (options.min*parentWidth/100) : options.min) : 0;
      options.cMax = options.max ? (options.usePercentage ? (options.max*parentWidth/100) : options.max) : parentWidth;

      console.log(options);
      var info = {
        startX: e.clientX,
        left: parseInt(document.defaultView.getComputedStyle(elem).left, 10),
        startWidth: parseInt(document.defaultView.getComputedStyle(elem).width, 10),
        size: function(size){
          if (options.usePercentage){
            return (size * 100 / parentWidth) + '%';
          } else {
            return size + 'px';
          }
        }
      };
      var drag = function(e){
        dragFn(e, info);
      }
      // console.log(info.left + " vs " + (parentWidth*parseFloat(elem.style.left)/100) + " (" + elem.style.left + ")");
      document.documentElement.addEventListener('mousemove', drag, false);
      document.documentElement.addEventListener('mouseup', function stopDrag(){
        document.documentElement.removeEventListener('mousemove', drag, false);
        document.documentElement.removeEventListener('mouseup', stopDrag, false);
      }, false);
    }
  }

  var initDragLeft = function(elem, options) {
    return setupDrag(elem, options, function(e, info) {
      var prev = elem.style.left;
      var newLeft = clamp((info.left + e.clientX - info.startX), options.cMin, info.left+info.startWidth);
      elem.style.left = info.size(newLeft);
      //console.log(info.size(info.left) + " : " + prev + " => " + elem.style.left);
      elem.style.width = info.size(info.startWidth + info.left - newLeft);
    });
  }

  var initDragRight = function(elem, options) {
    return setupDrag(elem, options, function(e, info) {
      var width = clamp((info.startWidth + e.clientX - info.startX), 0, options.cMax-info.left);
      elem.style.width = info.size(width);
    });
  }

  var initMove = function(elem, options) {
    return setupDrag(elem, options, function(e, info) {
      var newLeft = clamp((info.left + e.clientX - info.startX), options.cMin, options.cMax-info.startWidth);
      elem.style.left = info.size(newLeft);
    });
  }

  var makeMovable = function(elem, options){
    var options = expandOptions(options);
    elem.className = elem.className + ' movable';
    var listener = initMove(elem, options);
    elem.addEventListener('mousedown', listener, false);
    return {
      elem: elem,
      end: function(){
        elem.removeEventListener('mousedown', listener);
        elem.classList.remove('movable');
      }
    };
  }

  var makeResizable = function(elem, options){
    var options = expandOptions(options);
    elem.classList.add('resizable');

    var noClick = function(e){e.stopPropagation();};

    var handleLeft = document.createElement('div');
    handleLeft.className = 'resizer handle handle_left';
    elem.appendChild(handleLeft);
    handleLeft.addEventListener('mousedown', initDragLeft(elem, options), false);
    handleLeft.addEventListener('click', noClick, false);
    
    var handleRight = document.createElement('div');
    handleRight.className = 'resizer handle handle_right';
    elem.appendChild(handleRight);
    handleRight.addEventListener('mousedown', initDragRight(elem, options), false);
    handleRight.addEventListener('click', noClick, false);

    return {
      elem: elem,
      handleLeft: handleLeft,
      handleRight: handleRight,
      end: function(){
        // TODO : Delete everything...
        elem.classList.remove('resizable');
        elem.removeChild(handleLeft);
        elem.removeChild(handleRight);
      }
    };
  }


  var oPublic =
  {
    makeResizable: makeResizable,
    makeMovable: makeMovable,
  };
  return oPublic;
}();