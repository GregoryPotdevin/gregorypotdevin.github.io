

var VideoTimeline = VideoTimeline || {};

VideoTimeline.timeline = function(){
  var root;
  var tracks, trackList;
  var viewportHandle;
  var viewportParent;
  var viewport = {
    left: 0,
    width: 1
  }
  var miniTracks;
  var trackView = {};
  var preventClick = false;
  var animationTime = 0;
  var DEFAULT_EVENT_WIDTH = 0.25; // 1/4th of viewport size
  var VIEWPORT_PADDING = 4; // Viewport border size
  var keyBegin = "begin";
  var keyEnd = "end";

  var setTimecodeKeys = function(begin, end){
    keyBegin = begin;
    keyEnd = end;
  }

  var onChangedViewport = function(leftRatio, widthRatio){
    viewport.left = leftRatio;
    viewport.width = widthRatio;
    tracks[0].style.left = -(leftRatio*100) + '%';
    tracks[0].style.width = (100/widthRatio) + '%';
  }

  var refreshHandlePosition = function(){
    var parentW = parseInt(document.defaultView.getComputedStyle(viewportParent).width, 10)-VIEWPORT_PADDING*2;

    //   var leftRatio = left/width;

      var width = parseInt(document.defaultView.getComputedStyle(viewportHandle).width, 10)-VIEWPORT_PADDING*2;
      var left = viewport.left * width;
    viewportHandle.style.left = (left*100/parentW) + '%';
    // viewportHandle.style.left = (viewport.left*viewport.width*100) + '%';
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
    onChangedViewport(-leftRatio, viewport.width);
    refreshHandlePosition();
  }

  var initViewport = function(){
    var vp = $("#vt-viewport-resizer");
    viewportHandle = vp[0];
    viewportParent = vp.parent()[0];
    var leftHandle = vp.find(".vt-left-handle")[0];
    var rightHandle = vp.find(".vt-right-handle")[0];
    var updateFunction = function(){
      var left = parseInt(document.defaultView.getComputedStyle(viewportHandle).left, 10);
      var width = parseInt(document.defaultView.getComputedStyle(viewportHandle).width, 10)-VIEWPORT_PADDING*2;
      var parentW = parseInt(document.defaultView.getComputedStyle(viewportParent).width, 10)-VIEWPORT_PADDING*2;
      var leftRatio = left/width;
      var widthRatio = width/parentW;
      // console.log(leftRatio, widthRatio);
      onChangedViewport(leftRatio, widthRatio);
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
  }

  var init = function(timeline){
    root = $(timeline);
    tracks = root.find(".vt-tracks");
    trackList = root.find(".vt-track-list");
    miniTracks = root.find(".vt-mini-scrollbar-tracks");
    var outerElement = root.find(".vt-tracks-shadow")[0];
    var scrollable = tracks[0];
    outerElement.addEventListener("mousewheel", function(e) {
        if (e.wheelDeltaX) {
            scrollViewport(outerElement, scrollable, -e.wheelDeltaX);
            e.preventDefault();
        }
    });

    // For Firefox
    outerElement.addEventListener("DOMMouseScroll", function(e) {
        if (e.axis === e.HORIZONTAL_AXIS || (e.axis === e.VERTICAL_AXIS && e.shiftKey)) {
            scrollViewport(outerElement, scrollable, e.detail*2);
            e.preventDefault();
        }
    });

    initViewport();
  }

  var onEventClick = function(trackId, eventId){
    if (preventClick){
      preventClick = false;
      return;
    }
    if (VideoTimeline.timeline.onEventClick){
      VideoTimeline.timeline.onEventClick(trackId, eventId);
    }
  }

  var addTrackLabel = function(id, html){
    var label = '\
      <div class="vt-track-info" style="display: none;">\
        ' + html + '\
      </div>';
    $(label).appendTo(trackList).slideDown(animationTime);
  }

  var addTrackLine = function(id, name){
    var track = '\
      <div class="vt-track" style="display: none;">\
    </div>';
    var el = $(track);
    el.appendTo(tracks).slideDown(animationTime);
    console.log(trackView, id);
    trackView[id] = {
      "line": el,
      "events": {}
    }
  }

  var addTrack = function(id, name){
    addTrackLabel(id, name);
    addTrackLine(id, name);
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
    if (begin === undefined){
      begin = viewport.left*viewport.width;
    }
    if (end === undefined){
      end = begin + viewport.width*DEFAULT_EVENT_WIDTH;
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

    var miniTop = (trackId-1)*4;
    var miniTrack = $('\
      <div class="vt-mini-scrollbar-trackevent" \
        style="left: ' + left + '; width: ' + width + '; top: ' + miniTop + 'px;"></div>\
      ');
    miniTrack.appendTo(miniTracks).fadeIn(animationTime);

    var updateMiniTrack = function(){
      var te = trackEvent[0];
      miniTrack.css({left: te.style.left, width: te.style.width});
    };

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

  var addTrackEvents = function(trackId, events){
    events.forEach(function(evt){
      addTrackEvent(trackId, evt.id, evt.title, evt[keyBegin], evt[keyEnd], evt);
    });
  }

  var setTrackEventType = function(trackId, eventId, type){
    var track = trackView[trackId][eventId];
    track.removeClass("vt-type-default");
    track.removeClass("vt-type-info");
    track.removeClass("vt-type-alert");
    track.addClass(getTypeClass(type));
  }

  return {
    init: init,
    addTrack: addTrack,
    addTrackEvent: addTrackEvent,
    addTrackEvents: addTrackEvents,
    setAnimationTime: function(animTime){animationTime = animTime;},
    setTrackEventType: setTrackEventType,
    setTimecodeKeys: setTimecodeKeys,
  }

}();

console.log("ok");
