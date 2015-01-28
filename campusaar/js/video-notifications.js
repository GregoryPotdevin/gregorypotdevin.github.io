var ArmaVideo = ArmaVideo || {};
var ArmaTools = ArmaTools || {};

if (ArmaTools.Notifications){
  ArmaVideo.Notifications = function(){
    var notif = ArmaTools.Notifications;
    var names = {
      currentTime: "video.currentTime",           // time
      eventAdd: "video.event.add",                // trackId, eventId, title, begin, end
      onEventClick: "video.event.onClick",        // trackId, eventId
      eventSetTitle: "video.event.setTitle",      // trackId, eventId, title
      eventUpdateTime: "video.event.updateTime",  // trackId, eventId, begin, end
    };

    var setVideoTime = function(time){
      notif.post(names.currentTime, {time: time});
    }

    var onEventClick = function(trackId, eventId){
      notif.post(names.onEventClick, {trackId: trackId, eventId: eventId});
    }

    return {
      names: names,
      setVideoTime: setVideoTime,
      onEventClick: onEventClick,
    }
  }();
}
