// url hash plugin : http://benalman.com/projects/jquery-bbq-plugin/

$.fn.editable.defaults.mode = 'inline';
var dataType = {
  "id": {"name": "id"},
  "text": {"name": "text", "icon": "glyphicon-pencil"},
  "timecode": {"name": "timecode", "icon": "glyphicon-resize-vertical"}, 
}

var isEditable = false;

function formatTime(seconds) {
  seconds = Math.floor(seconds);
  var min = Math.floor(seconds / 60);
  var sec = seconds % 60;
  return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}

function videoSetTime(start){
  var video = $('#video-frame');
  video[0].currentTime = start;
  video[0].play();
}


/*function mkCol_old(id, label, content, type){
  return '\
  <div class="form-group">\
    <label class="col-sm-2 control-label">' + label + ': </label>\
    <div class="col-sm-10"> \
      <p id="' + id+'-'+label+'" class="form-control-static">' + content + '\
      <span id="' + id+'-'+label+'-btn" class="edit glyphicon ' + type.icon + '" aria-hidden="true"></span>\
      </p>\
    </div>\
  </div>';
}*/

function mkCol(id, label, content, type){
  var str = '\
  <tr>\
    <td width="25%">' + label + '</td>\
    <td width="75%">\
      <p id="' + id+'-'+label+'" style="float: left;">' + content + '</p>\
  ';
  if(type.name != 'id'){
    str += '<span id="' + id+'-'+label+'-btn" class="edit edit-btn glyphicon ' + type.icon + '" aria-hidden="true"></span>';
  }
  str += '\
    </td>\
  </tr>';
  return str;
}

function mkEditable(id, label, type){
  var p_id = '#'+id+'-'+label;
  var edit_id = '#'+id+'-'+label+'-btn';
  if (type.name == "text"){
    $(p_id).editable({
      'validate': function(v){return '';},
      'disabled': true,
      'unsavedclass': null
    });
  /*  $(p_id).editable({
      type: 'text',
      url: '/post',    
      pk: 1,    
      placement: 'top',
      title: 'Enter ' + id    
    });*/
    $(edit_id).click(function(e){    
      e.stopPropagation();
      $(p_id).editable('toggle');
      $(edit_id).hide();
    });
    $(p_id).parent().on('click', '.editable-cancel, .editable-submit', function(){
      console.log("pop");
      $(edit_id).show();
    });
  } else if (type.name == "timecode"){
    $(edit_id).click(function(e){    
      e.stopPropagation();
      var video = $('#video-frame');
      $(p_id).text(formatTime(video[0].currentTime));
    });
  }
  $(edit_id).hide();
}

function loadSequences(sequences) {
  sequences = sequences.slice(0);
  sequences.sort(function(s1, s2) {
      return s1.start - s2.start;
  });

  var video = $("#video-frame");
  var pop = Popcorn("#video-frame");

  var timeline = $("#video-timeline-items");
  var list = $("#sequences");
  var info = $("#info");

  // Create your plugin
  Popcorn.plugin( "sequences", {
    _setup: function( options ) {
      // var target = Popcorn.dom.find( options.target );

      // options._list_container = document.createElement( "div" );
      // options._list_container.style.display = "none";
      // options._list_container.innerHTML  = options.text;

      // target.appendChild( options._container );
    },

    start: function(event, options) {
      console.log(options);
    },
    end:   function() {

    }
  });
  
  var videoDuration = 370;
  
  $.each(sequences, function (idx, seq) {
    var seq_id = "seq-" + idx;
    // var url = $.param.fragment( "#", {start: seq.start} );
    var sequence = $('\
      <a href="#" id="' + seq_id + '" class="list-group-item sequence-item">\
        <h4 class="list-group-item-heading">' + seq.text + '</h4>\
        <p class="list-group-item-text">' + formatTime(seq.start) + ' - ' + formatTime(seq.end) + '</p>\
      </a>');
    urlHash = $.param({ start: seq.start });
    sequence.fragment( urlHash, 2 );
    list.append(sequence);
    sequence.click(function () {
      videoSetTime(seq.start);
        // var href = sequence.attr( "href" );
        // $.bbq.pushState({ url: href });
    });
    $("#header ul").append('<li ><a href="/user/messages"><span class="tab">Message Center</span></a></li>');
    pop.sequences({
      start: seq.start,
      end: seq.end,
      data: seq,
      target: seq_id,
      effect: "applyclass",
      applyclass: "active"
    });
    var info_id = "info-" + idx;

    var info_entry = $('\
      <div id="' + info_id + '" class="info-item" role="tabpanel">\
        <ul id="tabs-' + info_id + '" class="nav nav-tabs" role="tablist">\
          <li role="presentation" class="active"><a href="#' + info_id + '-info" aria-controls="' + info_id + '-info" role="tab" data-toggle="tab">Info</a></li>\
          <li role="presentation"><a href="#' + info_id + '-time" aria-controls="' + info_id + '-time" role="tab" data-toggle="tab">Time</a></li>\
        </ul>\
        <div class="tab-content">\
          <div role="tabpanel" class="tab-pane active" id="' + info_id + '-info">\
            <table class="table table-bordered table-striped table-info" style="clear: both">\
              <tbody>'
              + mkCol(seq_id, 'Id', seq_id, dataType.id)
              + mkCol(seq_id, 'Description', seq.text, dataType.text) + '\
              </tbody>\
            </table>\
          </div>\
          <div role="tabpanel" class="tab-pane" id="' + info_id + '-time">\
            <table class="table table-bordered table-striped table-info" style="clear: both">\
              <tbody>'
              + mkCol(seq_id, 'Start', formatTime(seq.start), dataType.timecode)
              + mkCol(seq_id, 'End', formatTime(seq.end), dataType.timecode) + '\
              </tbody>\
            </table>\
          </div>\
        </div>\
        ');
        /*        <form class="form-horizontal form-compact" role="form">'
              + mkCol(seq_id, 'Id', seq_id, dataType.text)
              + mkCol(seq_id, 'Description', seq.text, dataType.text) + '\
            </form>\*/

      /*          <form class="form-horizontal form-compact" role="form">'
              + mkCol(seq_id, 'Start', formatTime(seq.start), dataType.timecode)
              + mkCol(seq_id, 'End', formatTime(seq.end), dataType.timecode) + '\
            </form>\*/
    info.append(info_entry);

    //mkEditable(seq_id, 'Id', dataType.id);
    mkEditable(seq_id, 'Description', dataType.text);
    mkEditable(seq_id, 'Start', dataType.timecode);
    mkEditable(seq_id, 'End', dataType.timecode);

    pop.footnote({
      start: seq.start,
      end: seq.end,
      text: '',
      target: info_id,
      effect: "applyclass",
      applyclass: "selected"
    });

    var timeline_id = "tiemline-" + idx;
    var duration = seq.end - seq.start;
    var start = seq.start*100/videoDuration;
    var width = duration*100/videoDuration;
    var timeline_entry = $('\
      <span id="' + timeline_id + '" class="timeline-item" style="position: absolute; top: 0; left: ' + start + '%; width: ' + width + '%;" \
      data-toggle="tooltip" data-placement="bottom" title="' + seq.text + '"/>\
        ');
    timeline_entry.click(function () {
      videoSetTime(seq.start);
    });
    timeline_entry.tooltip();
    timeline.append(timeline_entry);
    pop.footnote({
      start: seq.start,
      end: seq.end,
      text: '',
      target: timeline_id,
      effect: "applyclass",
      applyclass: "selected"
    });
  });

  var marker = $("#video-timeline-marker");
  video[0].addEventListener( "timeupdate", function( e ) {
      marker.css('left', (video[0].currentTime*100/videoDuration) + '%');
  }, false );

  // $(function () {
  //   $('[data-toggle="tooltip"]').tooltip()
  // })

  pop.play();
  var params = $.deparam.fragment();
  if ("start" in params){
    videoSetTime(params.start)
  }
}
$(document).ready(function(){
  console.log($("#document-edit"));
  $("#document-edit").click(function(e){
    isEditable = !isEditable;
    console.log("Toggle editable: " + isEditable);
    $(".editable").editable('option', 'disabled', !isEditable);
    if (isEditable) {
      $(".edit-btn").show();
    } else {
      $(".edit-btn").hide();
    }
  });
});