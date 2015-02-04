


var DocumentEditor = function(){

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


  var isEditable = false;


  function mkEditable(el, field, seq, callback){
    if (field.hasOwnProperty('editable') && !field.editable){
      return;
    }
    // var id = 'document-' + seq.id;
    var type = dataType[field.type];
    var data_type = type['data_type'];
    var success = function(response, newValue){
      console.log("success");
      seq[field.id] = type.extract(newValue);
      if (callback) callback(field, seq);
    }
    var editBtn = el.find(".edit-btn");
    var documentField = el.find(".document-field");
    if (type.name == "timecode"){
      editBtn.click(function(e){    
        e.stopPropagation();
        var video = $('#video-frame');
        documentField.text(formatTime(video[0].currentTime));
        seq[field.id] = video[0].currentTime;
        if (callback) callback(field, seq);
      });
    } else if ((data_type == "text") || (data_type == "select2") || (data_type == "summernote")){
      if (data_type == "select2"){
        if (!dataLists.hasOwnProperty(field.list_type)){
          console.error("ERROR - unknown list type " + field.list_type);
          return;
        }
        documentField.editable({
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
        documentField.editable({
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
        documentField.editable({
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
      editBtn.click(function(e){    
        console.log("click");
        e.stopPropagation();
        documentField.editable('toggle');
        // $(edit_id).hide();
        var parent = documentField.parent();
        parent.find(".editable-submit").click(function(){
          editBtn.show();
        });
        parent.find(".editable-cancel").click(function(){
          editBtn.show();
        });
      });
    }
    editBtn.hide();
  }

  var addTabSupport = function(el){
    var editables = el.find(".editable");
    editables.on('shown', function(e, editable) {
      console.log('on show');
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
  }

  var createDocumentEditor = function(seq, model){

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

    var el = $('<div></div>');

    var header_str = '\
    <ul class="nav nav-tabs" role="tablist">';

    model.tabs.forEach(function(tab, idx){
      var ref = 'info-' + tab.id;
      header_str += '\
      <li role="presentation"' + (idx == 0 ? 'class="active"' : '') + '>\
        <a href="#' + ref + '" aria-controls="' + ref + '" role="tab" data-toggle="tab">' + tab.label + '</a>\
      </li>';
    });
    header_str += '</ul>';

    el.append($(header_str));

    var info_entry_str = '\
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
    var fieldEls = $(info_entry_str);

    el.append(fieldEls);


    var updateTitle = function(field, seq){
      videoDispatcher.dispatch({actionType: "updateEventTitle", trackId: 1, eventId: seq.id, title: seq.title});
      VideoTimeline.timeline.setTrackEventTitle(1, seq.id, seq.title);
      // TODO : update timeline title
    }

    var updateTimecode = function(field, seq){
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
      // TODO : update time...// VideoTimeline.timeline.
    }

    model.fields.forEach(function(field){
      var fieldEl = fieldEls.find('tr[data-field-id=' + field.id + ']');
      if (field.id == 'title'){
        mkEditable(fieldEl, field, seq, updateTitle);
      } else if ((field.id == 'start') || (field.id == 'end')){
        mkEditable(fieldEl, field, seq, updateTimecode);
      } else {
        mkEditable(fieldEl, field, seq);
      }
    });

    addTabSupport(fieldEls);

    return el;
  }


  return {
    dataType: dataType,
    createDocumentEditor: createDocumentEditor,
  }

}();
