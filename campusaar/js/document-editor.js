


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
    }, 
    'thumbnail': {
      'name': 'thumbnail', 
      // 'data_type': 'select2', 
      'icon': 'glyphicon-film',
      'display':   function(v){return v;},
      'extract':   function(v){return v;},
      'validator': function(v){return '';}
    }
  }


  var isEditable = false;

  function generateThumbnail(video) {     
      //generate thumbnail URL data
      console.log("generateThumbnail");
      var w = video.videoWidth;
      var h = video.videoHeight;
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, w, h);
      var dataURL = canvas.toDataURL();
      console.log(dataURL);
      return dataURL;

      // //create img
      // var img = document.createElement('img');
      // img.setAttribute('src', dataURL);

      // //append img in container div
      // document.getElementById('thumbnails').appendChild(img);
  }

  function createDarkroom(ratio){
    return new Darkroom('#img-modal figure img', {
      save: false,
      crop: {
        minHeight: 50,
        maxHeight: 50,
        ratio: ratio,
      },
      buttonFactory: function(options){
        var button = document.createElement('button');
        // console.log(options.type);
        switch(options.type){
          case "default": button.className = 'btn btn-info'; break;
          case "success": button.className = 'btn btn-success'; break;
          case "danger": button.className = 'btn btn-danger'; break;
        }
        //options.type
        var clazz = (options.image.indexOf("glyphicon") >= 0) ? options.image : ('darkroom-icon-' + options.image);
        button.innerHTML = '<i class="' + clazz + '"></i>'; 
        return button;
      },
      buttonGroupFactory: function(options){
        var buttonGroup = document.createElement('div');
        buttonGroup.className = 'btn-group btn-group-lg';
        return buttonGroup;
      },
      toolbarFactory: function(options){
        var toolbar = document.createElement('div');
        // toolbar.className = 'btn-toolbar';
        toolbar.innerHTML = '<div class="btn-toolbar darkroom-toolbar-actions"></div>';
        return toolbar;
      }
    });
  }

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
    var editBtns = el.find('.edit-btn');
    var editBtn = editBtns.filter('[data-btn-type="edit"]');
    var documentField = el.find(".document-field");
    if (type.name == "timecode"){
      editBtn.click(function(e){    
        e.stopPropagation();
        var video = $('#video-frame');
        documentField.text(formatTime(video[0].currentTime));
        seq[field.id] = video[0].currentTime;
        if (callback) callback(field, seq);
      });
    } else if (type.name == "thumbnail"){
      var video = $('#video-frame')[0];
      var snapshotBtn = editBtns.filter('[data-btn-type="snapshot"]');
      var darkroom;
      console.log(snapshotBtn);
      snapshotBtn.click(function(e){    
        e.stopPropagation();
        var img = generateThumbnail(video);
        documentField.attr('src', img);
        seq[field.id] = img;
        if (callback) callback(field, seq);
      });
      editBtn.click(function(e){    
        e.stopPropagation();
        var img = $('#img-modal figure img');
        img.attr('src', seq[field.id]);
        var darkroom;
        var modal = $('#img-modal');
        var load_darkroom = function()
        {
          console.log(img[0].complete);
          if(!img[0].complete){
            setTimeout(load_darkroom,50); 
          } else {
            img.attr("crossorigin", "anonymous"); // Firefox fails to load base64 data if crossorigin is set by default...
            darkroom = createDarkroom();//video.videoWidth/video.videoHeight); 
            $("#modal-btn").unbind("click").click(function(e){
              e.stopPropagation();
              // var canvas = $("#img-modal").find("canvas").first()[0];
              var dataURL = darkroom.snapshotImage();//canvas.toDataURL();
              documentField.attr('src', dataURL);
              seq[field.id] = dataURL;
              $("#img-modal").modal('hide');
            });
            modal.unbind('hidden.bs.modal');
            modal.on('hidden.bs.modal', function (e) {
              if (darkroom){
                // darkroom.selfDestroy();
                $("#img-modal figure").html("<img>");
                darkroom = null;
              }
            });
          }
        }
        setTimeout(load_darkroom,100); 
        modal.modal('show');
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
    editBtns.hide();
  }

  var addTabSupport = function(el){
    var editables = el.find(".editable");
    editables.on('shown', function(e, editable) {
      // console.log('on show');
      if(editable) { // if you're not using popovers, this check is unnecessary
        editable.input.$input.on('keydown', function(e) {
          if(e.which == 9) {                                              // when tab key is pressed
            e.preventDefault();
            // console.log('this', this);
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
      videoDispatcher.dispatch({actionType: "updateEventTitle", trackId: seq.trackId, eventId: seq.id, title: seq.title});
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
      videoDispatcher.dispatch({actionType: "updateEventTimecodes", trackId: seq.trackId, eventId: seq.id, begin: seq.start, end: seq.end});
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
