// url hash plugin : http://benalman.com/projects/jquery-bbq-plugin/

$.fn.editable.defaults.mode = 'inline';
var isNumeric = function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function formatTime(seconds) {
  seconds = Math.floor(seconds);
  var min = Math.floor(seconds / 60);
  var sec = seconds % 60;
  return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}

var seqColors = [
  "#e6550d",
  "#fd8d3c",
  "#fdae6b",
  "#fdd0a2"
];

var dataType = {
  'text': {
    'name': 'text', 
    'data-type': 'text', 
    'icon': 'glyphicon-pencil',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){return '';}
  },
  'html': {
    'name': 'html', 
    'data-type': 'text', 
    'icon': 'glyphicon-pencil',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){return '';}
  },
  'number': {
    'name': 'number', 
    'data-type': 'text', 
    'icon': 'glyphicon-pencil',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){
      return ((v == '') || isNumeric(v)) ? '' : 'Veuillez entrer un nombre valide';
    }
  },
  'timecode': {
    'name': 'timecode', 
    // 'data-type': 'text', 
    'icon': 'glyphicon-resize-vertical',
    'display':   function(v){return formatTime(v);},
    'extract':   function(v){return parseInt(v.substring(0, 2))*60 + parseInt(v.substring(3, 5));},
    'validator': function(v){return '';}
  }, 
  'list': {
    'name': 'list', 
    'data-type': 'select2', 
    'icon': 'glyphicon-search',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){return '';}
  }
}

var isEditable = false;


function videoSetTime(start){
  var video = $('#video-frame');
  video[0].currentTime = start;
  video[0].play();
}

function mkCol(id, field, seq){
  var label = field.label;
  var type = dataType[field.type];
  var content = seq.hasOwnProperty(field.id) ? type.display(seq[field.id]) : "";

  var str = '\
  <tr>\
    <td width="15%">' + label + '</td>\
    <td width="85%">\
      <p id="' + id+'-'+field.id+'" style="float: left;" \
      data-type="' + type['data-type'] + '" \
      data-title="' + label + '">' + content + '</p>\
  ';
  if(!field.hasOwnProperty('editable') || field.editable){
    str += '<span id="' + id+'-'+field.id+'-btn" class="edit edit-btn glyphicon ' + type.icon + '" aria-hidden="true"></span>';
  }
  str += '\
    </td>\
  </tr>';
  return str;
}

function mkEditable(id, field, seq, callback){
  if (field.hasOwnProperty('editable') && !field.editable){
    return;
  }
  var type = dataType[field.type];
  var p_id = '#'+id+'-'+field.id;
  var edit_id = '#'+id+'-'+field.id+'-btn';
  var data_type = type['data-type'];
  var success = function(response, newValue){
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
  } else if ((data_type == "text") || (data_type == "select2")){
    if (data_type == "select2"){
      if (!dataLists.hasOwnProperty(field.list_type)){
        console.error("ERROR - unknown list type " + field.list_type);
        return;
      }
      $(p_id).editable({
        'validate': function(v){return '';},
        'disabled': true,
        'unsavedclass': null,
        'mode': 'popup',
        'onblur': 'ignore',
        'source': dataLists[field.list_type].map(function(v){return {id: v, text: v};}),
        'select2': {
           multiple: field.multi_value
        },
        'success': success
      });
    } else {
      $(p_id).editable({
        'validate': type.validator,
        'disabled': true,
        'onblur': 'ignore',
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
      e.stopPropagation();
      $(p_id).editable('toggle');
      $(edit_id).hide();
      var parent = $(p_id).parent();
      parent.find(".editable-submit").click(function(){
        $(edit_id).show();
      });
      parent.find(".editable-cancel").click(function(){
        console.log("click");
        $(edit_id).show();
      });
    });
  }
  $(edit_id).hide();
}
var timecodeString = function(seq){
  return formatTime(seq.start) + ' - ' + formatTime(seq.end);
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
    seq.id = idx; // TODO : fix and remove
    // var url = $.param.fragment( "#", {start: seq.start} );
    var sequence = $('\
      <a href="#" id="' + seq_id + '" class="list-group-item sequence-item">\
        <h5 class="list-group-item-heading">' + seq.title + '</h5>\
        <p class="list-group-item-text">' + timecodeString(seq) + '</p>\
      </a>');
    urlHash = $.param({ start: seq.start });
    sequence.fragment( urlHash, 2 );
    list.append(sequence);
    $("#header ul").append('<li ><a href="/user/messages"><span class="tab">Message Center</span></a></li>');
    pop.sequences(seq_id, {
      start: seq.start,
      end: seq.end,
      data: seq,
      target: seq_id,
      effect: "applyclass",
      applyclass: "active"
    });
    var info_id = "info-" + idx;

    var fieldsByTab = {};
    model.tabs.forEach(function(tab){
      fieldsByTab[tab['id']] = [];
    });
    model.fields.forEach(function(field){
      fieldsByTab[field.tab].push(field);
    });

    var info_entry_str = '\
      <div id="' + info_id + '" class="info-item" role="tabpanel">\
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
      info_entry_str += '\
      <div role="tabpanel" class="tab-pane ' + (idx == 0 ? 'active' : '') + '" id="' + info_id + '-' + tab.id + '">\
        <table class="table table-bordered table-striped table-info" style="clear: both">\
          <tbody>';
      fieldsByTab[tab.id].forEach(function(field){
        info_entry_str += mkCol(seq_id, field, seq);
      });
      info_entry_str += '\
          </tbody>\
        </table>\
      </div>';
    });
    info_entry_str += '</div>';

    var info_entry = $(info_entry_str);

    info.append(info_entry);

    var selectSelected = function(){
      videoSetTime(seq.start);
      $(".info-item").removeClass("selected");
      info_entry.addClass("selected");
      $.bbq.pushState({start: seq.start});
    }


    if (idx == 0){
      info_entry.addClass("selected");
    }

    // pop.footnote({
    //   start: seq.start,
    //   end: seq.end,
    //   text: '',
    //   target: info_id,
    //   effect: "applyclass",
    //   applyclass: "selected"
    // });

    var timeline_id = "timeline-" + idx;
    var duration = seq.end - seq.start;
    var start = seq.start*100/videoDuration;
    var width = duration*100/videoDuration;
    var timeline_entry = $('\
      <span id="' + timeline_id + '" class="timeline-item" \
        style="position: absolute; top: 0; left: ' + start + '%; width: ' + width + '%;" \
      data-toggle="tooltip" data-placement="bottom" title="' + seq.title + '"/>\
        ');
    timeline_entry.tooltip();
    timeline.append(timeline_entry);
    pop.footnote("timeline-" + seq_id, {
      start: seq.start,
      end: seq.end,
      text: '',
      target: timeline_id,
      effect: "applyclass",
      applyclass: "selected"
    });

    sequence.click(selectSelected);
    timeline_entry.click(selectSelected);

    var updateTitle = function(id, field, seq){
      sequence.find("h5").text(seq.title);
      timeline_entry.attr("title", seq.title);
      timeline_entry.attr('data-original-title', seq.title)
          .tooltip('fixTitle');
    }
    var updateTimecode = function(id, field, seq){
      sequence.find("p").text(timecodeString(seq));
      var duration = seq.end - seq.start;
      var start = seq.start*100/videoDuration;
      var width = duration*100/videoDuration;
      timeline_entry.css("left", start + '%').css("width", width + '%');
      pop.sequences(seq_id, {
        start: seq.start,
        end: seq.end
      });
      pop.footnote("timeline-" + seq_id, {
        start: seq.start,
        end: seq.end
      });
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