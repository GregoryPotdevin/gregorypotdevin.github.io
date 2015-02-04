// url hash plugin : http://benalman.com/projects/jquery-bbq-plugin/
var ArmaTools = ArmaTools || {};
var ArmaVideo = ArmaVideo || {};

var videoDispatcher = new ArmaTools.Dispatcher();

var Resizer = ArmaTools.Resizer;

var currentDoc;
var currentDocEditor;
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


var setVideoTime = function(start){
  var video = $('#video-frame');
  video[0].currentTime = start;
  video[0].play();
}




var templates = function(){
  var sequence, sequence_info, sequence_info_field;

  Handlebars.registerHelper('timecode', function(seq) {
    return formatTime(seq);
  });
  Handlebars.registerHelper('content', function(seq, field) {
    return DocumentEditor.dataType[field.type].display(seq[field.id]);
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


var videoDuration = 2486; // TODO : fixme
var nextId = 1;



var showDocument = function(seq){
  currentDoc = seq;
  var infoDiv = $("#info");
  setEditable(false);
  var documentEditor = DocumentEditor.createDocumentEditor(seq, models.segment);
  infoDiv.empty().append(documentEditor);
  currentDocEditor = documentEditor;
  return documentEditor;
  // $(".info-item").removeClass("selected");
  // $("#info-" + seq.id).addClass("selected");
}

var showDocumentById = function(seqId){
  return showDocument(globalSequences[seqId]);
}

var addDocument = function(seq, model){
  var video = $("#video-frame");

  var info = $("#info");

  var seq_id = "seq-" + seq.id;
  globalSequences[seq.id] = seq;
  //console.log(seq_id);
  // var url = $.param.fragment( "#", {start: seq.start} );

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
  var docEditor = showDocument(seq);

  // Edit title by default
  setTimeout(function () {
   docEditor.find("[data-field-id=title] .edit-btn").trigger("click");
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
    setVideoTime(seq.start);
    showDocument(seq);
    $.bbq.pushState({start: seq.start});
  };

  var updateMetadataEventTimecodes = function(eventId, begin, end){
    var seq = globalSequences[eventId];
    seq.start = begin;
    seq.end = end;
    if (currentDocEditor && (eventId == currentDoc.id)){
      currentDocEditor.find("[data-field-id=start] .document-field").text(formatTime(seq.start));
      currentDocEditor.find("[data-field-id=end] .document-field").text(formatTime(seq.end));
    }
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
  if ((currentDoc === undefined) && (sequences.length > 0)){
    showDocument(sequences[0]);
  }

  var marker = $("#video-timeline-marker");
  // video[0].addEventListener( "timeupdate", function( e ) {
  //     VideoTimeline.timeline.timeRatio(video[0].currentTime/video[0].duration);
  // }, false );
  var autoUpdateTime = function(){
    videoDispatcher.dispatch({actionType: "currentTime", time: video[0].currentTime, duration: video[0].duration});
    VideoTimeline.timeline.timeRatio(video[0].currentTime/video[0].duration);
    setTimeout(autoUpdateTime, 50);
  }
  autoUpdateTime();

  // $(function () {
  //   $('[data-toggle="tooltip"]').tooltip()
  // })

  // pop.play();
  var params = $.deparam.fragment();
  if ("start" in params){
    setVideoTime(params.start);
  }

  updateSequenceCount(sequenceCnt());
}

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
    var seq = globalSequences[$(item).attr("data-event-id")];

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

    $(".has-clear").keyup(function () {
      var t = $(this);
      t.next('.clearer').toggle(Boolean(t.val()));
    });

    $(".clearer").hide($(this).prev('input').val());

    $(".clearer").click(clear);
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

