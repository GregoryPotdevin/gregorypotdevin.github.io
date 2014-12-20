

function formatTime(seconds) {
  var min = Math.floor(seconds / 60);
  var sec = seconds % 60;
  return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}

function loadSequences(sequences) {
  var pop = Popcorn("#video-frame");

  var list = $("#sequences");
  var info = $("#info");

  $.each(sequences, function (idx, seq) {
    var seq_id = "seq-" + idx;
    var sequence = $('\
      <a href="#" id="' + seq_id + '" class="list-group-item sequence-item">\
        <h4>' + seq.text + '</h4>\
        <p>' + formatTime(seq.start) + ' - ' + formatTime(seq.end) + '</p>\
      </a>');
    //urlHash = $.param({ start: seq.start });
    //sequence.fragment( urlHash, 2 );
    list.append(sequence);
    sequence.click(function () {
      var video = $('#video-frame');
      video[0].currentTime = seq.start;
      video[0].play();
        //var href = sequence.attr( "href" );
        //$.bbq.pushState({ url: href });
      });
    $("#header ul").append('<li ><a href="/user/messages"><span class="tab">Message Center</span></a></li>');
    pop.footnote({
      start: seq.start,
      end: seq.end,
      text: '',
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
            <form class="form-horizontal form-compact" role="form">\
              <div class="form-group">\
                <label class="col-sm-2 control-label">Id: </label>\
                <div class="col-sm-10"> <p class="form-control-static">' + seq_id + '</p>  </div>\
              </div>\
              <div class="form-group">\
                <label class="col-sm-2 control-label">Description: </label>\
                <div class="col-sm-10"> <p class="form-control-static">' + seq.text + '</p>  </div>\
              </div>\
            </form>\
          </div>\
          <div role="tabpanel" class="tab-pane" id="' + info_id + '-time">\
            <form class="form-horizontal form-compact" role="form">\
              <div class="form-group">\
                <label class="col-sm-2 control-label">Start: </label>\
                <div class="col-sm-10"> <p class="form-control-static">' + formatTime(seq.start) + '</p></div>\
              </div>\
              <div class="form-group">\
                <label class="col-sm-2 control-label">End: </label>\
                <div class="col-sm-10"> <p class="form-control-static">' + formatTime(seq.end) + '</p></div>\
              </div>\
            </form>\
          </div>\
        </div>\
        ');
    info.append(info_entry);
    pop.footnote({
      start: seq.start,
      end: seq.end,
      text: '',
      target: info_id,
      effect: "applyclass",
      applyclass: "selected"
    });
  });


  pop.play();
}