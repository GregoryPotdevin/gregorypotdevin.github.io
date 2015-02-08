

var VideoTimeline = VideoTimeline || {};

VideoTimeline.canvas = function(){
  var TEXT_SPACING = 40;
  var SCALE = 1;

  var pad = function(num, length) {
    var r = "" + num;
    while (r.length < length) {
      r = "0" + r;
    }
    return r;
  }

  var formatTime = function(seconds) {
    var t = Math.round(seconds*100)/100; // Realign centiseconds
    seconds = Math.floor(t);
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
    return pad(min, 2) + ":" + pad(sec, 2);
  }

  var drawLine = function(ctx, x, height, color){
    x = Math.round(x);
    height = Math.round(height);
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.moveTo(x/SCALE,0);
    ctx.lineTo(x/SCALE,height/SCALE);
    ctx.stroke();
  }

  var drawText = function(ctx, txt, x, y, color){
    ctx.font = "10px";
    ctx.textAlign = "center";
    x = Math.round(x);
    y = Math.round(y);
    ctx.fillText(txt, x/SCALE, y/SCALE);
  }

  var rgb = function(r, g, b){
    return "rgb("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")";
  }

  var lerp = function(t, t0, t1, v0, v1){
    if (t0 == t1){
      return v0;
    }
    return v0 + (v1-v0) * (t-t0) / (t1-t0);
  }

  var colorFor = function(width){
    if (width > 30){
      return "#000";
    } else if (width > 15){
      return "#666";
    } else if (width >= 5) {
      var v = lerp(width, 5, 15, 0xff, 0x66);
      //console.log(rgb(v, v, v));
      return rgb(v, v, v);
    } else {
      return rgb(255, 255, 255);
    }
  }

  var heightFor = function(width){
    // if (width > 30){
    //   return 8;
    // } else if (width > 10){
    //   return 6;
    // } else if (width > 5){
    //   return 4;
    // }
    // return 2; 
    if (width > 30){
      return 0.7;
    } else if (width > 10){
      return 0.5;
    } else if (width > 5){
      return 0.3;
    }
    return 0.1; 
  }

  var drawLines = function(ctx, begin, end, duration, height, canShowText){
    var w = ctx.canvas.width;
    var minW = w / ((end-begin)/duration);
    if ((minW < 5) || isNaN(minW)){
      return;
    }
    var color = colorFor(minW);
    var height = ctx.canvas.height*height;//heightFor(minW);
    // console.log(minW);
    var start = (Math.floor(begin/duration)*duration);
    var showText = minW >= TEXT_SPACING*SCALE;
    for(var m=start; m<=end; m+=duration){
      var x = (m-begin) * w / (end-begin);
      drawLine(ctx, x, height, color);
      if (showText && canShowText && (m != 0)){
        drawText(ctx, formatTime(m), x, ctx.canvas.height*0.97, color);
      }
    }
    return showText;
  }

  // var getContext = function(canvas){
  //   // Output to Canvas, taking into account devices such as iPhone 4 with Retina Display
  //   var canvas = $('#hidef')[0];
  //   var ctx = canvas.getContext('2d');

  //   if (window.devicePixelRatio) {
  //       var hidefCanvasWidth = $(canvas).attr('width');
  //       var hidefCanvasHeight = $(canvas).attr('height');
  //       var hidefCanvasCssWidth = hidefCanvasWidth;
  //       var hidefCanvasCssHeight = hidefCanvasHeight;

  //       $(canvas).attr('width', hidefCanvasWidth * window.devicePixelRatio);
  //       $(canvas).attr('height', hidefCanvasHeight * window.devicePixelRatio);
  //       $(canvas).css('width', hidefCanvasCssWidth);
  //       $(canvas).css('height', hidefCanvasCssHeight);
  //       ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  //   }       
  //   return ctx;    
  // }

  var draw = function(canvas, begin, end){
    // console.log("draw");
    var ctx = ctx = canvas.getContext('2d');
    var style = window.getComputedStyle(canvas);
    SCALE = (window.devicePixelRatio) || 1;
    canvas.width = Math.round(parseFloat(style.width))*SCALE;
    canvas.height = Math.round(parseFloat(style.height))*SCALE;
    console.log(canvas.width, canvas.height);
    // checkHdpi();
    ctx.clearRect( 0, 0, canvas.width, canvas.height);
    ctx.translate(0.5, 0.5);
    ctx.scale(SCALE, SCALE);
    var canShowText = true;
    canShowText &= !drawLines(ctx, begin, end, 1, 0.15, canShowText);
    canShowText &= !drawLines(ctx, begin, end, 5, 0.25, canShowText);
    canShowText &= !drawLines(ctx, begin, end, 10, 0.35, canShowText);
    canShowText &= !drawLines(ctx, begin, end, 30, 0.45, canShowText);
    canShowText &= !drawLines(ctx, begin, end, 60, 0.6, canShowText);
    canShowText &= !drawLines(ctx, begin, end, 300, 0.75, canShowText);
    // ctx.fillStyle = "#fff";
    // ctx.fillRect(0, 0, canvas.);
  }

  return {
    draw: draw,
  };
}();

VideoTimeline.timeline = function(){
  var root;
  var tracks, trackList;
  var viewport;
  var miniTracks = [];
  var trackView = {};
  var timeMarker;
  var preventClick = false;
  var animationTime = 0;
  var DEFAULT_EVENT_WIDTH = 1/20;//0.125; // 1/4th of viewport size
  var keyBegin = "begin";
  var keyEnd = "end";
  var _timeRatio = 0;
  var dispatcher;
  var videoTimes;
  var progressBars;
  var progressContainer;


  var pad = function(num, length) {
    var r = "" + num;
    while (r.length < length) {
      r = "0" + r;
    }
    return r;
  }

  var formatTime = function(seconds) {
    var t = Math.round(seconds*100)/100; // Realign centiseconds
    seconds = Math.floor(t);
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
    var csec = Math.floor(t*100)%100;
    return pad(min, 2) + ":" + pad(sec, 2) + "." + pad(csec, 2);
  }

  var createMiniTracks = function(parentSelector){
    var tracks = {};
    var parent = $(parentSelector);
    var onEventClick;
    var trackContainer = $('<div class="vt-mini-scrollbar-tracks"></div>');
    var timeMarker = $('<span class="vt-timeline-marker" style="left: 0%;"></span>');
    var isClickable = false;
    trackContainer.appendTo(parent);
    timeMarker.appendTo(parent);

    var addTrack = function(id, name){
      var track = '\
      <div class="vt-mini-scrollbar-track" style="display:none;">\
      </div>';
      var el = $(track);
      el.appendTo(trackContainer).slideDown(animationTime);
      tracks[id] = {
        "line": el,
        "events": {}
      };
      return tracks[id];
    };

    var deleteTrack = function(id){
      if (id in tracks){
        tracks[id].line.remove();
        delete tracks[id];
      } else {
        console.log("Failed to find track " + id);
      }
    }

    var addEvent = function(trackId, eventId, left, width){
      console.log("addEvent", trackId, eventId);
      var miniTop = (trackId-1)*4;
      var miniTrackEvent = $('\
        <div class="vt-mini-scrollbar-trackevent" \
          style="left: ' + left + '; width: ' + width + '; display: none;"></div>\
        ');
      miniTrackEvent.appendTo(tracks[trackId].line).fadeIn(animationTime);
      miniTrackEvent.click(function(){
        if (isClickable && dispatcher){
          dispatcher.dispatch({actionType: 'onEventClick', trackId: trackId, eventId: eventId});
        }
        if (onEventClick){
          onEventClick(trackId, eventId);
        }
      });
      tracks[trackId].events[eventId] = miniTrackEvent;

      var setPos = function(left, width){
          miniTrackEvent.css({left: left, width: width});
      };
      return {
        setPos: setPos,
      };
    }

    var deleteEvent = function(trackId, eventId){
      if (eventId in tracks[trackId].events){
        tracks[trackId].events[eventId].remove();
        delete tracks[trackId].events[eventId];
      }
    }

    var getEvent = function(trackId, eventId){
      return tracks[trackId].events[eventId];
    }

    var setTimeRatio = function(ratio){
      timeMarker[0].style.left = (ratio*100) + '%';
    }

    var miniT = {
      setTimeRatio: setTimeRatio,
      addTrack: addTrack,
      deleteTrack: deleteTrack,
      addEvent: addEvent,
      getEvent: getEvent,
      deleteEvent: deleteEvent,
      setOnEventClick: function(f) {onEventClick = f;},
      setClickable: function(b) {isClickable = b;},
    };
    miniTracks.push(miniT);

    return miniT;
  };

  var setTimecodeKeys = function(begin, end){
    keyBegin = begin;
    keyEnd = end;
  }

  var setViewport = function(v){
    viewport = v;
  }

  var setViewportRatio = function(leftRatio, widthRatio){
    if (viewport){
      viewport.viewport.left = leftRatio;
      viewport.viewport.width = widthRatio;
      tracks[0].style.left = -(leftRatio*100) + '%';
      tracks[0].style.width = (100/widthRatio) + '%';
      if (progressContainer && progressContainer.size() > 0){
        progressContainer[0].style.left = -(leftRatio*100) + '%';
        progressContainer[0].style.width = (100/widthRatio) + '%';
      }
      drawCanvas();
    }
  }

  var scrollViewport = function(parent, el, dx){
    var x = parseInt(document.defaultView.getComputedStyle(el).left, 10);
    var w = parseInt(document.defaultView.getComputedStyle(el).width, 10);
    var parentW = parseInt(document.defaultView.getComputedStyle(parent).width, 10);
    x -= dx;
    if (x > 0){
      x = 0;
    } else if (-x + parentW > w){
      x = -(w - parentW);
    }
    var leftRatio = x/parentW;
    console.log("ok");
    setViewportRatio(-leftRatio, viewport.viewport.width);
    viewport.refreshHandlePosition();
  }

  var drawCanvas = function(){
    if (canvas){
      var begin = viewport.viewport.left * viewport.viewport.width * videoDuration;
      var duration = viewport.viewport.width * videoDuration;
      VideoTimeline.canvas.draw(canvas, begin, begin+duration);
    }
  }

  var init = function(timeline, videoDispatcher){
    root = $(timeline);
    tracks = root.find(".vt-tracks");
    trackList = root.find(".vt-track-list");
    dispatcher = videoDispatcher;
    createMiniTracks(root.find(".vt-mini-scrollbar-shadow"));//root.find(".vt-mini-scrollbar-tracks");

    timeMarker = $('<span class="vt-timeline-marker" style="left: 0%;"></span>');
    timeMarker.appendTo(tracks);

    videoTimes = root.find(".vt-video-time");
    progressBars = root.find(".progress-bar");
    progressContainer = root.find(".vt-timeline-progress");

    canvas = root.find("canvas")[0];

    var outerElement = root.find(".vt-tracks-shadow")[0];
    var scrollable = tracks[0];
    var onScroll = function(e, dx){
      // console.log(e, dx);
      console.log(viewport);
      if (viewport && dx) {
        scrollViewport(outerElement, scrollable, -dx);
        e.preventDefault();
      }
    }
    outerElement.addEventListener("mousewheel", function(e) {
      onScroll(e, e.wheelDeltaX);
    });

    // For Firefox
    outerElement.addEventListener("DOMMouseScroll", function(e) {
        if (e.axis === e.HORIZONTAL_AXIS || (e.axis === e.VERTICAL_AXIS && e.shiftKey)) {
          onScroll(e, -e.e.detail*2);
        }
    });

    timeRatio(0);

    if (dispatcher){
      dispatcher.register(function(obj){
        switch(obj.actionType){
          case "currentTime": {
            videoDuration = obj.duration;
            if (videoTimes){
              videoTimes.text(formatTime(obj.time));
            }
            if (progressBars){
              progressBars.css("width", ((obj.time/obj.duration)*100) + "%");
            }
            drawCanvas();
            timeRatio(obj.time/obj.duration); 
            break;
          }  
          case "onEventAdded": addTrackEvent(obj.trackId, obj.eventId, obj.title, obj.begin/videoDuration, obj.end/videoDuration); break;
          case "updateEventTitle": setTrackEventTitle(obj.trackId, obj.eventId, obj.title); break;
          case "updateEventTimecodes": if (obj.sender != "timeline") setTrackEventBeginEnd(obj.trackId, obj.eventId, obj.begin, obj.end);break;
          default: break;
        }
      });
    }

    // initViewport();
  }

  var onEventClick = function(trackId, eventId){
    if (preventClick){
      preventClick = false;
      return;
    }
    if (dispatcher){
      dispatcher.dispatch({actionType: 'onEventClick', trackId: trackId, eventId: eventId});
    }
    if (VideoTimeline.timeline.onEventClick){
      VideoTimeline.timeline.onEventClick(trackId, eventId);
    }
  }

  var addTrackLabel = function(id, html){
    var label = $('\
      <div class="vt-track-info" style="display: none;">\
        ' + html + '\
      </div>');
    label.appendTo(trackList).slideDown(animationTime);
    trackView[id]['label'] = label;
  }

  var addTrackLine = function(id, name){
    var track = '\
    <div class="vt-track" style="display: none;">\
    </div>';
    var el = $(track);
    // el.appendTo(tracks).slideDown(animationTime);
    el.insertBefore(timeMarker).slideDown(animationTime);
    //console.log(trackView, id);
    trackView[id] = {
      "line": el,
      "events": {}
    }
  }

  var addTrack = function(id, name){
    addTrackLine(id, name);
    addTrackLabel(id, name);
    miniTracks.forEach(function(mini){mini.addTrack(id, name);});
  }

  var deleteTrack = function(id){
    if (id in trackView){
      trackView[id].line.remove();
      trackView[id]['label'].remove();
      delete trackView[id];
    } else {
      console.log("Failed to find track " + id);
    }
    miniTracks.forEach(function(mini){mini.deleteTrack(id);});
  }

  var getTypeClass = function(type){
    var cls = "vt-type-default";
    if (type){
      cls = "vt-type-" + type;
    }
    return cls;
  }

  var addTrackEvent = function(trackId, eventId, name, begin, end, options){
    var track = trackView[trackId];
    //console.log(viewport);
    if (begin === undefined){
      begin = viewport.viewport.left*viewport.viewport.width;
      begin = _timeRatio;
    }
    if (end === undefined){
      end = begin + viewport.viewport.width*DEFAULT_EVENT_WIDTH;
      end = begin + DEFAULT_EVENT_WIDTH;//viewport.viewport.width*DEFAULT_EVENT_WIDTH;
    }
    //console.log("pos: ", begin, end);
    if (end > 1){
      // begin -= end-1;
      end = 1;
      // if (begin < 0){
      //   begin = 0;
      // }
    }

    var left = (begin*100) + '%';
    var width = ((end-begin)*100) + '%';
    var cls = "vt-type-default";
    if (options && ("type" in options)){
      cls = "vt-type-" + options["type"];
    }
    var trackEvent = $('\
      <div class="vt-track-event vt-handle-parent vt-type ' + cls + '" \
        style="display: none; top: 0px; left: ' + left + '; width: ' + width + '; z-index:auto;">\
        <div class="vt-track-event-info ">\
          <div class="vt-track-event-icon"><span class="glyphicon glyphicon-file"></span></div>\
          <div class="title">' + name + '</div>\
        </div>\
        <div class="vt-handle vt-left-handle"></div>\
        <div class="vt-handle vt-right-handle"></div>\
      </div>');
    track.events[eventId] = trackEvent;
    trackEvent.appendTo(track.line).fadeIn(animationTime);

//    console.log(left, width);

    var miniTrackEvents = miniTracks.map(function(mt){return mt.addEvent(trackId, eventId, left, width);});

    var updateMiniTrack = function(){
      var te = trackEvent[0];
      miniTrackEvents.forEach(function(mte){mte.setPos(te.style.left, te.style.width);});
      var begin = parseFloat(te.style.left)/100;
      var width = parseFloat(te.style.width)/100;
      if (dispatcher){
        // Round milliseconds to limit precision errors
        var beginTime = Math.round(begin*videoDuration*1000)/1000;
        var endTime = Math.round((begin+width)*videoDuration*1000)/1000;
        dispatcher.dispatch({actionType: "updateEventTimecodes", trackId: trackId, eventId: eventId, begin: beginTime, end: endTime, sender: "timeline"});
      }
      if (VideoTimeline.timeline.onEventUpdated){
        VideoTimeline.timeline.onEventUpdated(trackId, eventId, begin, begin+width);
      }
    }

    ArmaTools.Resizer.makeMovableAndResizable(trackEvent[0],{
      usePercentage: true,
      minWidth: 24,
      addClasses: false,
      leftHandle: trackEvent.find(".vt-left-handle")[0],
      rightHandle: trackEvent.find(".vt-right-handle")[0],
      onFirstMove: function(){preventClick = true;},
      onMoved: updateMiniTrack,
      onResized: updateMiniTrack,
      onFinished: function(elem){
        updateMiniTrack();
        // console.log('Finished moving', elem);
        // update(elem);
      }
    });
    trackEvent.click(function(){
      onEventClick(trackId, eventId);
    });
  }

  var deleteTrackEvent = function(trackId, eventId){
    if (eventId in trackView[trackId].events){
      trackView[trackId].events[eventId].remove();
      delete trackView[trackId].events[eventId];
    }
    miniTracks.forEach(function(mte){mte.deleteEvent(trackId, eventId);});
  }

  var addTrackEvents = function(trackId, events){
    events.forEach(function(evt){
      addTrackEvent(trackId, evt.id, evt.title, evt[keyBegin], evt[keyEnd], evt);
    });
  }

  var setTrackEventTitle = function(trackId, eventId, title){
    trackView[trackId].events[eventId].find(".title").text(title);
  }

  var setTrackEventBeginEnd = function(trackId, eventId, begin, end){
    var el = trackView[trackId].events[eventId][0];
    el.style.left = (begin*100/videoDuration) + "%";
    el.style.width = ((end-begin)*100/videoDuration) + "%";
  }

  var setTrackEventType = function(trackId, eventId, type){
    var track = trackView[trackId][eventId];
    track.removeClass("vt-type-default");
    track.removeClass("vt-type-info");
    track.removeClass("vt-type-alert");
    track.addClass(getTypeClass(type));
  }

  var timeRatio = function(ratio){
    if (ratio === undefined){
      return _timeRatio;
    } else {
      _timeRatio = ratio;
      timeMarker[0].style.left = (ratio*100) + '%';
      miniTracks.forEach(function(mt){mt.setTimeRatio(ratio);});

      var marker = progressContainer.find(".timeline-marker");
      if (marker.size() > 0){
        marker[0].style.left = (ratio*100) + '%';
      }
    }
  }

  return {
    init: init,
    createMiniTracks : createMiniTracks,
    addTrack: addTrack,
    deleteTrack: deleteTrack,
    addTrackEvent: addTrackEvent,
    addTrackEvents: addTrackEvents,
    deleteTrackEvent: deleteTrackEvent,
    setAnimationTime: function(animTime){animationTime = animTime;},
    setTrackEventTitle: setTrackEventTitle,
    setTrackEventBeginEnd: setTrackEventBeginEnd,
    setTrackEventType: setTrackEventType,
    setTimecodeKeys: setTimecodeKeys,
    timeRatio : timeRatio,
    setViewport: setViewport,
    setViewportRatio: setViewportRatio,
  }

}();



VideoTimeline.viewport = function(){

  var VIEWPORT_PADDING = 4; // Viewport border size

  var createViewport = function(selector){
    var viewport = {
      left: 0,
      width: 1
    }


    var root = $(selector);
    var viewportRoot = $('\
      <div class="vt-viewport">\
        <div class="vt-viewport-inner">\
          <div class="vt-viewport-border vt-handle-parent" style="left: 0%; width: 100%;">\
            <div class="vt-handle vt-left-handle"></div>\
            <div class="vt-handle vt-right-handle"></div>\
          </div>\
        </div>\
      </div>');
    viewportRoot.appendTo(root);

    var vp = viewportRoot.find(".vt-handle-parent");
    var viewportHandle = vp[0];
    var viewportParent = vp.parent()[0];
    var leftHandle = vp.find(".vt-left-handle")[0];
    var rightHandle = vp.find(".vt-right-handle")[0];

    var updateFunction = function(){
      var left = parseInt(document.defaultView.getComputedStyle(viewportHandle).left, 10);
      var width = parseInt(document.defaultView.getComputedStyle(viewportHandle).width, 10)-VIEWPORT_PADDING*2;
      var parentW = parseInt(document.defaultView.getComputedStyle(viewportParent).width, 10)-VIEWPORT_PADDING*2;
      var leftRatio = left/width;
      var widthRatio = width/parentW;
      // console.log(leftRatio, widthRatio);
      VideoTimeline.timeline.setViewportRatio(leftRatio, widthRatio);
      // this.onChangedViewport(leftRatio, widthRatio);
    }

    var refreshHandlePosition = function(){
      var parentW = parseInt(document.defaultView.getComputedStyle(viewportParent).width, 10)-VIEWPORT_PADDING*2;

      //   var leftRatio = left/width;

      var width = parseInt(document.defaultView.getComputedStyle(viewportHandle).width, 10)-VIEWPORT_PADDING*2;
      var left = viewport.left * width;
      viewportHandle.style.left = (left*100/parentW) + '%';
      // viewportHandle.style.left = (viewport.left*viewport.width*100) + '%';
    }


    ArmaTools.Resizer.makeMovableAndResizable(viewportHandle,{
      usePercentage: true,
      minWidth: 24,
      addClasses: false,
      leftHandle: leftHandle,
      rightHandle: rightHandle,
      // onFirstMove: function(){preventClick = true;},
      onMoved: updateFunction,
      onResized: updateFunction,
      onFinished: function(elem){
        updateFunction();
        // console.log('Finished moving', elem);
        // update(elem);
      }
    });

    var _this = {
      refreshHandlePosition: refreshHandlePosition,
      viewport: viewport,
    };
    VideoTimeline.timeline.setViewport(_this);

    return _this;
  }

  return {
    createViewport: createViewport,
  };
}();



console.log("ok");
