// url hash plugin : http://benalman.com/projects/jquery-bbq-plugin/

$.fn.editable.defaults.mode = 'inline';
var isNumeric = function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var formatTime = function(seconds) {
  seconds = Math.floor(seconds);
  var min = Math.floor(seconds / 60);
  var sec = seconds % 60;
  return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}
var timecodeString = function(seq){
  console.log(seq);
  return formatTime(seq.start) + ' - ' + formatTime(seq.end);
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
    'data_type': 'text', 
    'icon': 'glyphicon-pencil',
    'display':   function(v){return v;},
    'extract':   function(v){return v;},
    'validator': function(v){return '';}
  },
  'html': {
    'name': 'html', 
    'data_type': 'text', 
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

  sequence = Handlebars.compile($("#sequence-item-template").html());
  sequence_info_field = Handlebars.compile($("#sequence-info-field-template").html());
  sequence_info = Handlebars.compile($("#sequence-info-template").html());
  
  return {
    sequence: sequence,
    sequence_info: sequence_info
  }
}();

var isEditable = false;


function videoSetTime(start){
  var video = $('#video-frame');
  video[0].currentTime = start;
  video[0].play();
}

function mkEditable(id, field, seq, callback){
  if (field.hasOwnProperty('editable') && !field.editable){
    return;
  }
  var type = dataType[field.type];
  var p_id = '#'+id+'-'+field.id;
  var edit_id = '#'+id+'-'+field.id+'-btn';
  var data_type = type['data_type'];
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


var videoDuration = 370;
var nextId = 1;


var sortItems = function(parent, children){
  console.log("sort " + children + " in " + parent);
  var parent = $(parent);
  var items = parent.children(children);
  items.sort(function(a,b){
    var an = $(a).data('seq').start;//getAttribute('data-order');
    var bn = $(b).data('seq').start;//getAttribute('data-order');
    console.log(an + ' vs ' + bn);
    if(an > bn)  return 1;
    if(an < bn)  return -1;
    return 0;
  });
  items.detach().appendTo(parent);
/*  console.log('parent: ' + parent);
  console.log('items: ' + items);

  items.sort(function(a,b){
  var an = a.data('seq').start;//getAttribute('data-order');
  var bn = b.data('seq').start;//getAttribute('data-order');
  if(an > bn)  return 1;
  if(an < bn)  return -1;
  return 0;
  });

  items.detach().appendTo(parent);*/
}

var onOrderChanged = function(){
  sortItems('#video-timeline-items', 'span.timeline-item');
  sortItems('#sequences', 'a.sequence-item');
}

var addFiche = function(seq){
  var video = $("#video-frame");
  var pop = Popcorn("#video-frame");

  var timeline = $("#video-timeline-items");
  var list = $("#sequences");
  var info = $("#info");

  var seq_id = "seq-" + seq.id;
  console.log(seq_id);
  // var url = $.param.fragment( "#", {start: seq.start} );
  var sequence = $(templates.sequence(seq));
  urlHash = $.param({ start: seq.start });
  sequence.fragment( urlHash, 2 );
  sequence.data("seq", seq);
  list.append(sequence);
  $("#header ul").append('<li ><a href="/user/messages"><span class="tab">Message Center</span></a></li>');

  var info_id = "info-" + seq.id;

  var fieldsByTab = {};
  model.tabs.forEach(function(tab){
    fieldsByTab[tab['id']] = [];
  });
  model.fields.forEach(function(field){
    fieldsByTab[field.tab].push(field);
    if (!field.hasOwnProperty('editable')){
      field.editable = true;
      console.log('patch');
    }
    field.dtype = dataType[field.type];
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

  var selectSelected = function(){
    videoSetTime(seq.start);
    $(".info-item").removeClass("selected");
    info_entry.addClass("selected");
    $.bbq.pushState({start: seq.start});
  }

  // pop.footnote({
  //   start: seq.start,
  //   end: seq.end,
  //   text: '',
  //   target: info_id,
  //   effect: "applyclass",
  //   applyclass: "selected"
  // });

  var timeline_id = "timeline-" + seq.id;
  var duration = seq.end - seq.start;
  var start = seq.start*100/videoDuration;
  var width = duration*100/videoDuration;
  var timeline_entry = $('\
    <span id="' + timeline_id + '" class="timeline-item" \
      style="position: absolute; top: 0; left: ' + start + '%; width: ' + width + '%;" \
    data-toggle="tooltip" data-placement="bottom" title="' + seq.title + '"/>\
      ');
  timeline_entry.data("seq", seq);
  timeline_entry.tooltip();
  timeline.append(timeline_entry);

  var refreshPopcorn = function(seq_id, seq){
    pop.sequences(seq_id, {
      start: seq.start,
      end: seq.end,
      data: seq,
      target: seq_id,
      effect: "applyclass",
      applyclass: "active"
    });
    pop.footnote("timeline-" + seq_id, {
      start: seq.start,
      end: seq.end,
      text: '',
      target: timeline_id,
      effect: "applyclass",
      applyclass: "selected"
    });
  }
  refreshPopcorn(seq_id, seq);

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
    refreshPopcorn(seq_id, seq);
    onOrderChanged();
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
}


var newDocument = function(){
  nextId++;
  var video = $("#video-frame");
  var start = Math.round(video[0].currentTime);
  var seq = {'id': nextId, 'start': start, 'end': start+60}
  addFiche(seq);
  $(".info-item").removeClass("selected");
  $("#info-" + seq.id).addClass("selected");

  // Edit title by default
  setTimeout(function () {
   $("#seq-" + seq.id + "-title-btn").trigger("click");
  }, 200);
  onOrderChanged();
}


function loadSequences(sequences) {
  sequences = sequences.slice(0);
  sequences.sort(function(s1, s2) {
      return s1.start - s2.start;
  });

  var video = $("#video-frame");
  var pop = Popcorn("#video-frame");

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

  var videoStartTime = 0;
  var params = $.deparam.fragment();
  if ("start" in params){
    videoStartTime = parseInt(params.start);
  }

  $.each(sequences, function (idx, seq) {
    nextId = Math.max(seq.id, nextId);
    addFiche(seq);
    if ((seq.start <= videoStartTime) && (seq.end > videoStartTime)) {
      $("#info-" + seq.id).addClass("selected");
    }
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

var setEditable = function(editable){
    isEditable = editable;
    $(".editable").editable('option', 'disabled', !isEditable);
    if (isEditable) {
      $(".edit-btn").show();
    } else {
      $(".edit-btn").hide();
    }
}



$(document).ready(function(){
  $("#document-edit").click(function(e){
    setEditable(!isEditable);
  });
  $("#document-new").click(function(e){
    newDocument();
    setEditable(true);
  });
  $('#sidebar-video').width($('#affix-container').width());
});

$(window).resize(function () {
    $('#sidebar-video').width($('#affix-container').width());
});



