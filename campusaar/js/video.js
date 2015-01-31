// url hash plugin : http://benalman.com/projects/jquery-bbq-plugin/
var ArmaTools = ArmaTools || {};
var ArmaVideo = ArmaVideo || {};

var Notif = ArmaTools.Notifications;
var NotifNames = ArmaVideo.Notifications.names;

var videoDispatcher = new ArmaTools.Dispatcher();

var Resizer = ArmaTools.Resizer;

var currentDoc;
var noop = function(){};
var endMovable = noop;

var globalSequences = {};

var sequenceCnt = function(){
  return Object.keys(globalSequences).length;
}

$.fn.editable.defaults.mode = 'inline';
var isNumeric = function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var formatTime = function(seconds) {
  var t = Math.round(seconds*1000)/1000; // Realign milliseconds
  seconds = Math.floor(seconds);
  var min = Math.floor(seconds / 60);
  var sec = seconds % 60;
  return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}
var timecodeString = function(seq){
  return formatTime(seq.start) + ' - ' + formatTime(seq.end);
}

var forwardHover = function(source, dest){
  source.hover(function(){
    dest.addClass('hover');
  }, function(){
    dest.removeClass('hover');
  });
}

var seqColors = [
  "#e6550d",
  "#fd8d3c",
  "#fdae6b",
  "#fdd0a2"
];


var Seeker = Seeker || {};

Seeker.popcorn = function() {


  setTime = function(start){
    var video = $('#video-frame');
    video[0].currentTime = start;
    video[0].play();
  }

  return {
    setTime: setTime,
  }
}();

Seeker.videojs = function(){
  var init = function(seq){

  }

  return {
    init: init
  }
}();

var seeker = Seeker.popcorn;

var summernoteOptions = {
    focus: true,                 // set focus to editable area after initializing summernote);
    fontNames: [
      'Arial', 'Courier New',
      'Helvetica Neue', 'Lucida Grande',
      'Tahoma', 'Times New Roman', 'Verdana'
    ],

    toolbar: [
      ['style', ['style']],
      ['font', ['bold', 'italic', 'underline', 'clear']],
      // ['fontname', ['fontname']],
      ['color', ['color']],
      // ['para', ['ul', 'ol', 'paragraph']],
      ['para', ['ul', 'ol', 'paragraph']],
      // ['height', ['height']],
      // ['table', ['table']],
      // ['insert', ['link', 'picture', 'hr']],
      // ['view', ['fullscreen', 'codeview']],
      ['view', ['codeview']],
      // ['help', ['help']]
    ],
}

var dataType = {
  'text': {
    'name': 'text', 
    'data_type': 'text', 
    'icon': 'glyphicon-pencil',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){return '';}
  },
  'html': {
    'name': 'html', 
    'data_type': 'summernote', 
    'icon': 'glyphicon-pencil',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){return '';}
  },
  'number': {
    'name': 'number', 
    'data_type': 'text', 
    'icon': 'glyphicon-pencil',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){
      return ((v == '') || isNumeric(v)) ? '' : 'Veuillez entrer un nombre valide';
    }
  },
  'timecode': {
    'name': 'timecode', 
    // 'data_type': 'text', 
    'icon': 'glyphicon-resize-vertical',
    'display':   function(v){return formatTime(v);},
    'extract':   function(v){return parseInt(v.substring(0, 2))*60 + parseInt(v.substring(3, 5));},
    'validator': function(v){return '';}
  }, 
  'list': {
    'name': 'list', 
    'data_type': 'select2', 
    'icon': 'glyphicon-pencil',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){return '';}
  }
}
// glyphicon-search


var templates = function(){
  var sequence, sequence_info, sequence_info_field;

  Handlebars.registerHelper('timecode', function(seq) {
    return formatTime(seq);
  });
  Handlebars.registerHelper('content', function(seq, field) {
    return dataType[field.type].display(seq[field.id]);
  });
  Handlebars.registerHelper('debug', function(obj) {
    return console.log(obj);
  });
  Handlebars.registerPartial('field', $("#sequence-info-field-template").html());
  Handlebars.registerHelper('renderField', function(field, seq){
    var res = sequence_info_field({
      'seq': seq, 
      'field': field, 
      'type': field.dtype
    });
    return new Handlebars.SafeString(res);
  });
  // Handlebars.registerHelper('renderFields', function(fields, seq){
  //   var inDiv = false;
  //   var res = "";
  //   fields.forEach(function(field){

  //   var res += sequence_info_field({
  //     'seq': seq, 
  //     'field': field, 
  //     'type': field.dtype
  //   });
  //   });
  //   return new Handlebars.SafeString(res);
  // });

  sequence = Handlebars.compile($("#sequence-item-template").html());
  sequence_info_field = Handlebars.compile($("#sequence-info-field-template").html());
  sequence_info = Handlebars.compile($("#sequence-info-template").html());
  
  return {
    sequence: sequence,
    sequence_info: sequence_info
  }
}();

var isEditable = false;


function mkEditable(id, field, seq, callback){
  if (field.hasOwnProperty('editable') && !field.editable){
    return;
  }
  var type = dataType[field.type];
  var p_id = '#'+id+'-'+field.id;
  var edit_id = '#'+id+'-'+field.id+'-btn';
  var data_type = type['data_type'];
  var success = function(response, newValue){
    console.log("success");
    seq[field.id] = type.extract(newValue);
    if (callback) callback(id, field, seq);
  }
  if (type.name == "timecode"){
    $(edit_id).click(function(e){    
      e.stopPropagation();
      var video = $('#video-frame');
      $(p_id).text(formatTime(video[0].currentTime));
      seq[field.id] = video[0].currentTime;
      if (callback) callback(id, field, seq);
    });
  } else if ((data_type == "text") || (data_type == "select2") || (data_type == "summernote")){
    if (data_type == "select2"){
      if (!dataLists.hasOwnProperty(field.list_type)){
        console.error("ERROR - unknown list type " + field.list_type);
        return;
      }
      $(p_id).editable({
        'validate': type.validator,
        'disabled': true,
        'unsavedclass': null,
        'mode': 'popup',
        'onblur': 'submit',
        'source': dataLists[field.list_type].map(function(v){return {id: v, text: v};}),
        'select2': {
           multiple: field.multi_value
        },
        'success': success
      });
    } else if (data_type == "summernote") {
      $(p_id).editable({
        'validate': function(v) {
          console.log("validate " + v);
          if (field.required && (!v || !v.length)){
            return 'Ce champ est obligatoire';
          }
          return type.validator(v);
        },
        'disabled': true,
        'onblur': 'submit',
        'unsavedclass': null,
        // 'mode': 'popup',
        'success': success,
        "summernote": summernoteOptions,
      });
    } else {
      $(p_id).editable({
        'validate': function(v) {
          if (field.required && (!v || !v.length)){
            return 'Ce champ est obligatoire';
          }
          return type.validator(v);
        },
        'disabled': true,
        'onblur': 'submit',
        'unsavedclass': null,
        'success': success
      });
    }
  /*  $(p_id).editable({
      type: 'text',
      url: '/post',    
      pk: 1,    
      placement: 'top',
      title: 'Enter ' + id    
    });*/
    $(edit_id).click(function(e){    
      console.log("click");
      e.stopPropagation();
      $(p_id).editable('toggle');
      // $(edit_id).hide();
      var parent = $(p_id).parent();
      parent.find(".editable-submit").click(function(){
        $(edit_id).show();
      });
      parent.find(".editable-cancel").click(function(){
        $(edit_id).show();
      });
    });
  }
  $(edit_id).hide();
}


var videoDuration = 2486; // TODO : fixme
var nextId = 1;



var sortItems = function(parent, children){
  var parent = $(parent);
  var items = parent.children(children);
  items.sort(function(a,b){
    var an = $(a).data('seq').start;
    var bn = $(b).data('seq').start;
    if(an > bn)  return 1;
    if(an < bn)  return -1;
    return 0;
  });
  items.detach().appendTo(parent);
}

var showDocument = function(seq){
  currentDoc = seq;
  $(".info-item").removeClass("selected");
  $("#info-" + seq.id).addClass("selected");
  // if (isEditable){
  //   endMovable();
  //   startMovable();
  // }
}

var showDocumentById = function(seqId){
  showDocument(globalSequences[seqId]);
}

var addDocument = function(seq, model){
  var video = $("#video-frame");
  var pop = Popcorn("#video-frame");

  var info = $("#info");

  var seq_id = "seq-" + seq.id;
  globalSequences[seq.id] = seq;
  //console.log(seq_id);
  // var url = $.param.fragment( "#", {start: seq.start} );

  var info_id = "info-" + seq.id;

  var fieldsByTab = {};
  model.tabs.forEach(function(tab){
    fieldsByTab[tab['id']] = [];
  });
  model.fields.forEach(function(field){
    fieldsByTab[field.tab].push(field);
    if (!field.hasOwnProperty('editable')){
      field.editable = true;
      // console.log('patch');
    }
    field.dtype = dataType[field.type];
  });

  var info_entry_str = '\
    <div id="' + info_id + '" class="info-item manual-tab-pane" role="tabpanel">\
      <ul id="tabs-' + info_id + '" class="nav nav-tabs" role="tablist">';

  model.tabs.forEach(function(tab, idx){
    var ref = info_id + '-' + tab.id;
    info_entry_str += '\
    <li role="presentation"' + (idx == 0 ? 'class="active"' : '') + '>\
      <a href="#' + ref + '" aria-controls="' + ref + '" role="tab" data-toggle="tab">' + tab.label + '</a>\
    </li>';
  });
  info_entry_str += '</ul>\
      <div class="tab-content">';
  model.tabs.forEach(function(tab, idx){
    info_entry_str += templates.sequence_info({
      'tab': tab,
      'isActive': idx == 0,
      'fields': fieldsByTab[tab.id], 
      'seq': seq, 
      // 'type': dataType[field.type],
      // 'editable': field.editable
    });
      // info_entry_str += mkCol(seq_id, field, seq);
  });
  info_entry_str += '</div>';

  var info_entry = $(info_entry_str);

  info.append(info_entry);

  var updateTitle = function(id, field, seq){
    videoDispatcher.dispatch({actionType: "updateEventTitle", trackId: 1, eventId: seq.id, title: seq.title});
    Notif.post(NotifNames.eventSetTitle, {trackId: 1, eventId: seq.id, title: seq.title});
    VideoTimeline.timeline.setTrackEventTitle(1, seq.id, seq.title);
    // TODO : update timeline title
  }

  var updateTimecode = function(id, field, seq){
    if (seq.start > seq.end){
      if (field.id == "start"){
        seq.end = seq.start;
      } else {
        seq.start = seq.end
      }
      $("#seq-" + seq.id + "-start").text(formatTime(seq.start));
      $("#seq-" + seq.id + "-end").text(formatTime(seq.end));
    }    
    videoDispatcher.dispatch({actionType: "updateEventTimecodes", trackId: 1, eventId: seq.id, begin: seq.start, end: seq.end});
    Notif.post(NotifNames.eventUpdateTime, {trackId: 1, eventId: seq.id, begin: seq.start, end: seq.end});
    // TODO : update time...// VideoTimeline.timeline.
  }

  model.fields.forEach(function(field){
    if (field.id == 'title'){
      mkEditable(seq_id, field, seq, updateTitle);
    } else if ((field.id == 'start') || (field.id == 'end')){
      mkEditable(seq_id, field, seq, updateTimecode);
    } else {
      mkEditable(seq_id, field, seq);
    }
  });

  var evt = {
    id: seq.id,
    title: seq.title,
    begin: seq.start / videoDuration,//video[0].duration,
    end: seq.end / videoDuration,//video[0].duration,
  };
//  console.log(evt);

  videoDispatcher.dispatch({
    actionType: "onEventAdded",
    trackId: seq.trackId ? seq.trackId : 1,
    eventId: seq.id,
    title: seq.title,
    begin: seq.start,
    end: seq.end,
  });
  // Notif.post(NotifNames.eventAdd, {
  //   trackId: seq.trackId ? seq.trackId : 1,
  //   eventId: seq.id,
  //   title: seq.title,
  //   begin: seq.start,
  //   end: seq.end,
  // });
  // ArmaVideo.EventList.addEvent(seq.id, seq.title, seq.start, seq.end);
  // VideoTimeline.timeline.addTrackEvents(seq.trackId ? seq.trackId : 1, [evt]);
}


var newDocument = function(trackId, model){
  nextId++;
  var video = $("#video-frame");
  var start = Math.round(video[0].currentTime);
  var seq = {
    'trackId': trackId, 
    'id': nextId, 
    'start': start, 
    'end': start+videoDuration/10, 
    'title': "Segment " + nextId,
    'filename': "video.seq." + nextId + ".mp4",
  };
  addDocument(seq, model);
  showDocument(seq);

  // Edit title by default
  setTimeout(function () {
   $("#seq-" + seq.id + "-title-btn").trigger("click");
  }, 200);
}

var updateSequenceCount = function(cnt){
  var seqCnt = $("#sequence-cnt");
  if (cnt === undefined){
    seqCnt.hide();
    return;
  }
  var total = sequenceCnt();
  seqCnt.show();
  if (cnt == total){
    seqCnt.html(cnt);
    seqCnt.unbind('click');
  } else {
    seqCnt.html(cnt + '/' + total + ' <span class="glyphicon glyphicon-remove"></span>');
    seqCnt.click(Filter.clear);
  }
}

function loadSequences(sequences) {

  // React.render(
  //   // <VideoEventList />,
  //   React.createElement(VideoEventList, null),
  //   document.getElementById('react-sequences')
  // );

  var onEventClick = function(obj){
    var seq = globalSequences[obj.eventId];
    seeker.setTime(seq.start);
    ArmaVideo.Notifications.setVideoTime(seq.start);
    showDocument(seq);
    $.bbq.pushState({start: seq.start});
  };
  // Notif.register(NotifNames.onEventClick, onEventClick);

  var updateMetadataEventTimecodes = function(eventId, begin, end){
    var seq = globalSequences[eventId];
    seq.start = begin;
    seq.end = end;
    $("#seq-" + seq.id + "-start").text(formatTime(seq.start));
    $("#seq-" + seq.id + "-end").text(formatTime(seq.end));
    // Notif.post(NotifNames.eventUpdateTime, {trackId: 1, eventId: seq.id, begin: seq.start, end: seq.end});
  };


  videoDispatcher.register(function(obj){
    switch(obj.actionType){
      case "onEventClick": onEventClick(obj); break;
      case "updateEventTimecodes": updateMetadataEventTimecodes(obj.eventId, obj.begin, obj.end);
      default: break;
    }

  })

  ArmaVideo.EventList.init("#sequences", videoDispatcher);

  sequences = sequences.slice(0);
  sequences.sort(function(s1, s2) {
      return s1.start - s2.start;
  });

  var video = $("#video-frame");
  var pop = Popcorn("#video-frame");

  // Create your plugin
  Popcorn.plugin( "sequences", {
    _setup: function( options ) {
      // console.log("Popcorn.sequence setup");
      // var target = Popcorn.dom.find( options.target );

      // options._list_container = document.createElement( "div" );
      // options._list_container.style.display = "none";
      // options._list_container.innerHTML  = options.text;

      // target.appendChild( options._container );
    },

    start: function(event, options) {
      // console.log("Start " + options);
    },
    end:   function(event, options) {
      // console.log("End " + options);
    }
  });

  var videoStartTime = 0;
  var params = $.deparam.fragment();
  if ("start" in params){
    videoStartTime = parseInt(params.start);
    console.log("videoStartTime", videoStartTime);
  }

  $.each(sequences, function (idx, seq) {
    nextId = Math.max(seq.id, nextId);
    addDocument(seq, models.segment);
    if ((seq.start <= videoStartTime) && (videoStartTime < seq.end)) {
      showDocument(seq);
    }
  });
  console.log(currentDoc);
  if ((currentDoc === undefined) && (sequences.length > 0)){
    showDocument(sequences[0]);
  }

  var marker = $("#video-timeline-marker");
  // video[0].addEventListener( "timeupdate", function( e ) {
  //     ArmaVideo.Notifications.setVideoTime(video[0].currentTime);
  //     VideoTimeline.timeline.timeRatio(video[0].currentTime/video[0].duration);
  // }, false );
  var autoUpdateTime = function(){
    videoDispatcher.dispatch({actionType: "currentTime", time: video[0].currentTime, duration: video[0].duration});
    ArmaVideo.Notifications.setVideoTime(video[0].currentTime);
    VideoTimeline.timeline.timeRatio(video[0].currentTime/video[0].duration);
    setTimeout(autoUpdateTime, 50);
  }
  autoUpdateTime();

  // $(function () {
  //   $('[data-toggle="tooltip"]').tooltip()
  // })

  pop.play();
  var params = $.deparam.fragment();
  if ("start" in params){
    seeker.setTime(params.start);
  }

  updateSequenceCount(sequenceCnt());
}


// var onChangeTime = function(seq, start, end){
//   seq.start =start;
//   seq.end = end;
//   var seqEl = $("#seq-" + seq.id);
//   seqEl.find("[data-timecode-type=begin]").text(formatTime(seq.start));
//   seqEl.find("[data-timecode-type=end]").text(formatTime(seq.end));
//   $("#info-" + seq.id + "-start").text(formatTime(seq.start));
//   $("#info-" + seq.id + "-end").text(formatTime(seq.end));
//   // refreshPopcorn(seq);

//   // var duration = seq.end - seq.start;
//   // var start = seq.start*100/videoDuration;
//   // var width = duration*100/videoDuration;
//   // timeline_entry.css("left", start + '%').css("width", width + '%');
//   onOrderChanged();
// }

// var startMovable = function(){
//   var seq = currentDoc;
//   var elem = $('#timeline-' + seq.id).get()[0];
//   console.log(elem);
//   var update = function(elem){
//     var start = parseFloat(elem.style.left) / 100.0;
//     var length = parseFloat(elem.style.width) / 100.0;
//     onChangeTime(seq, Math.round(start*videoDuration), Math.round((start+length)*videoDuration));
//   }
//   movableInfo = Resizer.makeMovableAndResizable(elem, {
//     usePercentage: true,
//     onMoved: update,
//     onResized: update,
//     onFinished: function(elem){
//       update(elem);
//     }
//   });
//   endMovable = function(){
//     movableInfo.end();
//   }
// }

var nextField = function(el, usePrev){
  if(usePrev) { 
    // prevAll(":has(.editable:visible):first").find(".editable:last");
    return el.parents().prevAll(":has(.editable):first") // find the parent of the editable before this one in the markup
                      .find(".editable:last");           // grab the editable and display it
  } else {                                                      // when just tab
    return el.parents().nextAll(":has(.editable):first") // find the parent of the editable after this one in the markup
        .find(".editable:first");          // grab the editable and display it
  }
}

var gotoNextField = function(el, usePrev){
  var next = nextField(el, usePrev);
  //if(next.paren)
  return function(){
    // Check if parent is expanded
    var parent = next.closest("table").parent(".collapse");
    console.log("aria-expanded", parent.attr("aria-expanded"));
    if (parent.attr("aria-expanded") == "false"){
      // expand if needed and show the field when finished
      parent.one('shown.bs.collapse', function () {
        next.editable('show');
      });
      console.log("open");
      parent.collapse('show');
    } else {
      next.editable('show');
    }
  }
}

var setEditable = function(editable){
    isEditable = editable;

//     if (editable){
//       var myPlayer = videojs('video-frame');
//       console.log(myPlayer);
//       // videojs("video-frame").ready(function(){
//       //   var myPlayer = this;
//       //   myPlayer.on("pause", function () {
//         myPlayer.on("play", function () { myPlayer.load (); myPlayer.off("play"); });
//       // });
// myPlayer.load ();
// myPlayer.off("play");
//     }

    var editables = $(".editable").editable('option', 'disabled', !isEditable);
    if (isEditable) {
      $("#document-save").show();
      $("#document-edit").hide();
      $("#document-new").hide();

      // startMovable();
      // Make timeline item resizable
      $(".edit-btn").show();
      editables.on('shown', function(e, editable) {
        if(editable) { // if you're not using popovers, this check is unnecessary
          editable.input.$input.on('keydown', function(e) {
            if(e.which == 9) {                                              // when tab key is pressed
              e.preventDefault();
              console.log('this', this);
              var next = gotoNextField($(this), e.shiftKey);
              var form = $(this).closest("td").find("form");
              form.submit();
              if (form.has("div.has-error").length > 0){
                console.log("Found error, cancel !");
              } else {
                next();
              }
            }
          });
        }
      });

    } else {
      $("#document-save").hide();
      $("#document-edit").show();
      $("#document-new").show();

      // Make timeline item resizable
      endMovable();
      endMovable = noop;
      $(".edit-btn").hide();
    }
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}  


var Filter = function(){

  var filterBuilder = function(val){
    // TODO : change regexp filter, 
    val = removeDiacritics(val);
    val = val.toLowerCase();
    val = ('' + val).split(' ');
    // val = val && val.replace(new RegExp("[({[^.$*+?\\\]})]","g"),'');
    return $.grep(val, function(v){return v != '';});
  }

  var seqContains = function(seq, val){
    if (val == ''){
      return true;
    }
    for (var k in seq){
      if (seq.hasOwnProperty(k)) {
        var seqVal = '' + seq[k];
        seqVal = seqVal.toLowerCase();
        seqVal = removeDiacritics(seqVal);
        if (seqVal.indexOf(val) > -1){
          return true;
        }
      }
    }
    return false;
  }

  var itemFilter = function(item, val){
    //val = val.replace(new RegExp("^[.]$|[\[\]|()*]",'g'),'');
    //val = val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    if (val == ''){
      return true;
    }
    var regSearch = new RegExp(val,'i');
    var seq = globalSequences[$(item).attr("data-seq-id")];

    for(var v in val){
      if (!seqContains(seq, val[v])){
        return false;
      }
    }
    return true;
  };

  var options = {
    'delay':150,
    'filterBuilder': filterBuilder,
    'itemFilter': itemFilter, 
    'onFilter': updateSequenceCount,
    'resetOnBlur': false,
    'itemEl': '.sequence-item,.timeline-item'
  };

  var init = function(){
    $('#sequences').btsListFilter('#sequence-filter', options);
    // $('#video-timeline-items').btsListFilter('#sequence-filter', options);
  };

  var clear = function(e){
      e.stopPropagation();
      $("#sequence-filter").val('').trigger('keyup');
      return false;
    }

  return {
    init: init,
    clear: clear,
  }

}();

$(document).ready(function(){
  setEditable(false);
  $("#document-edit").click(function(e){ setEditable(true); });
  $("#document-save").click(function(e){ setEditable(false); });
  $("#document-new").click(function(e){
    newDocument(1, models.segment);
    setEditable(true);
  });

  Mousetrap.bind(['command+e', 'ctrl+e'], function() {
      setEditable(true);
      return false;
  });

  Mousetrap.bind(['command+s', 'ctrl+s'], function() {
      setEditable(false);
      return false;
  });

  $('#sidebar-video').width($('#affix-container').width());

  $("a[data-action='style']").click(function(e){
    var el = $(e.target);
    var stylesheet = el.data('style');
    $("#stylesheet-bootstrap").attr("href", 'css/' + stylesheet);
    var navbar = $("nav.navbar");
    $("a[data-action='style']").parent().removeClass("active");
    el.parent().addClass("active");
    if (stylesheet == "bootstrap-theme.min.css"){
      navbar.addClass('navbar-default');
      navbar.removeClass('navbar-inverse');
    } else {
      navbar.removeClass('navbar-default');
      navbar.addClass('navbar-inverse');
    }
  });

  if (getUrlParameter('edit') == "true"){
    setTimeout(function(){
      setEditable(true);
    }, 500);
  }

  $(".has-clear").keyup(function () {
    var t = $(this);
    t.next('span').toggle(Boolean(t.val()));
  });

  $(".clearer").hide($(this).prev('input').val());

  $(".clearer").click(function () {
    var el = $(this);
    el.prev('input').val('').focus();
    el.hide();
  });

  $(".metadata-pane-btn").click(function(){
    var el = $(this);
    $(".metadata-pane").removeClass("selected");
    $('#' + el.attr('aria-controls')).addClass("selected");
  })

  Filter.init();

  // TODO : optimize
  $('[data-toggle="tooltip"]').tooltip();

  $('#collapseOne').on('show.bs.collapse', function () {    
    $('.panel-heading').animate({
        backgroundColor: "#515151"
    }, 500);   
  });

  $('#collapseOne').on('hide.bs.collapse', function () {    
      $('.panel-heading').animate({
          backgroundColor: "#00B4FF"
      }, 500);   
  });


});

$(window).resize(function () {
    $('#sidebar-video').width($('#affix-container').width());
});


function generateThumbnail() {     
    //generate thumbnail URL data
    var thecanvas = $("canvas")[0];
    var context = thecanvas.getContext('2d');
    context.drawImage($("video")[0], 0, 0, 220, 150);
    var dataURL = thecanvas.toDataURL();

    //create img
    var img = document.createElement('img');
    img.setAttribute('src', dataURL);

    //append img in container div
    document.getElementById('thumbnails').appendChild(img);
}
  Mousetrap.bind(['command+p', 'alt+p'], function() {
      generateThumbnail();
      return true;
  });

function parse(str){
  var lexer = parser.lexer;
  var terminals = parser.terminals_;
  var tokens = [];
  var texts = [];
  do {
    tokens.push(lexer.lex());
    texts.push(lexer.match);
  } while(tokens[tokens.length-1] != 'EOF');
  console.log(parse("foo et (author: stephanie)"));
}

