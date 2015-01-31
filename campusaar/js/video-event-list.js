var ArmaTools = ArmaTools || {};
var ArmaVideo = ArmaVideo || {};

ArmaVideo.EventList = function(){
  var events = {};
  var view = {};
  var onClickCallback;
  var videoTime = 0; 
  var shouldSort = false;
  var dispatcher;


  var sortItems = function(parent, children){
    var parent = $(parent);
    var items = parent.children(children);
    items.sort(function(a,b){
      var an = events[$(a).attr('data-event-id')].begin;
      var bn = events[$(b).attr('data-event-id')].begin;
      if(an > bn)  return 1;
      if(an < bn)  return -1;
      return 0;
    });
    items.detach().appendTo(parent);
  }

  var sort = function(p){
    // TODO : lazy sort
    sortItems(view.list, 'a.sequence-item');
  }

  var onClick = function(eventId){
    if (onClickCallback){
      onClickCallback(eventId);
    }
  }

  var setOnClick = function(callback){
    onClickCallback=callback;
  }

  var addEvent = function(eventId, title, begin, end){
    var seq = {
      id: eventId,
      title: title,
      begin: begin,
      end: end,
      active: false,
      ratio: -1,
    };
    events[eventId] = seq;

    var sequence = $(templates.sequence(seq));
    view.events[eventId] = sequence;
    urlHash = $.param({ start: seq.start });
    sequence.fragment( urlHash, 2 );

    sequence.click(function(){onClick(eventId);});

    view.list.append(sequence);

    updateEventProgress(eventId);
    postSort();
  }

  var postSort = function(){
    if (shouldSort){
      return;
    }
    shouldSort = true;
    setTimeout(function(){
      shouldSort = false;
      sort();
    }, 0);
  }

  var setEventTitle = function(eventId, title){
    console.log(eventId, events, events[eventId]);
    events[eventId].title = title;
    view.events[eventId].find("h5").text(title);
  }

  var updateEventProgress = function(eventId){
    var seq = events[eventId];
    var ratio = (videoTime - seq.begin)/(seq.end - seq.begin);
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    var v = view.events[eventId];
    if (ratio != seq.ratio){ // Only update if needed...
      v.find(".progress-bar")[0].style.width = (ratio*100) + "%";
      seq.ratio = ratio;
    }
    var isActive = ((videoTime >= seq.begin) && (videoTime < seq.end));
    if (isActive != seq.active){
      seq.active = isActive;
      v.toggleClass("active", isActive);
    }
  }

  var setEventBeginEnd = function(eventId, begin, end){
    events[eventId].begin = begin;
    events[eventId].end = end;
    var v = view.events[eventId];
    v.find("[data-timecode-type=begin]").text(formatTime(begin));
    v.find("[data-timecode-type=end]").text(formatTime(end));
    updateEventProgress(eventId, begin, end);
    // TODO : check if requires a sort ? check if requires an update on active states ?
    postSort();
  }

  var setVideoTime = function(curTime){
    videoTime = curTime;
    for(eventId in events){
      if (events.hasOwnProperty(eventId)){
        updateEventProgress(eventId);
      }
    }
  }

  var onDispatch = function(obj){
    switch(obj.actionType){
      case "currentTime": setVideoTime(obj.time); break;
      case "onEventAdded": addEvent(obj.eventId, obj.title, obj.begin, obj.end); break;
      case "updateEventTitle": setEventTitle(obj.eventId, obj.title); break;
      case "updateEventTimecodes": setEventBeginEnd(obj.eventId, obj.begin, obj.end);break;
      default: break;
    }
  }

  var initNotifications = function(){
    var notif = ArmaTools.Notifications;
    var names = ArmaVideo.Notifications.names;
    notif.register(names.currentTime, function(obj){
      setVideoTime(obj.time);
    });
    notif.register(names.eventAdd, function(obj){
      addEvent(obj.eventId, obj.title, obj.begin, obj.end);
    });
    notif.register(names.eventSetTitle, function(obj){
      setEventTitle(obj.eventId, obj.title);
    });
    notif.register(names.eventUpdateTime, function(obj){
      setEventBeginEnd(obj.eventId, obj.begin, obj.end);
    });
    setOnClick(function(eventId){
      notif.post(names.onEventClick, {eventId: eventId});
    });
  }

  var init = function(listSelector, videoDispatcher){
    view.list = $(listSelector);
    view.events = {};
    videoTime = 0;

    if (videoDispatcher){
      videoDispatcher.register(onDispatch);
      dispatcher = videoDispatcher;
      setOnClick(function(eventId){
        dispatcher.dispatch({actionType: "onEventClick", eventId: eventId});
      });
      // initNotifications();
    }
  }

  return {
    init: init,
    addEvent: addEvent,
    setEventTitle: setEventTitle,
    setEventBeginEnd: setEventBeginEnd,
    setVideoTime: setVideoTime,
    setOnClick: setOnClick,
  }


}();
