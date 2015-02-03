
var formatTime = function(seconds) {
  seconds = Math.floor(seconds);
  var min = Math.floor(seconds / 60);
  var sec = seconds % 60;
  return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}

var VideoEvent = React.createClass({
  handleClick: function(){
    this.props.onClick(this.props.data);
  },
  shouldComponentUpdate: function(nextProps, nextState){
    return JSON.stringify(this.props) !== JSON.stringify(nextProps) ;
  },
  render: function() {
    var data = this.props.data;
    var cx = React.addons.classSet;
    var classes = cx({
      'list-group-item': true,
      'sequence-item': true,
      'active': this.props.isActive
    });
    var onChange = function(){console.log("ok");};
    var commands = 
      !this.props.isActive ? 
      null : 
      (
        <div className="mini-commands">
          <div className="btn-group-xs pull-left" data-toggle="buttons">
            <label className="btn btn-warning active" style={{marginRight: "4px" }}>
              <input type="checkbox" autoComplete="off" checked onChange={onChange} /><span className="glyphicon glyphicon-repeat"></span>
            </label>
          </div>
          <div className="progress" style={{verticalAlign: "middle", marginBottom: "4px"}} >
            <div className="progress-bar progress-bar-info" role="progressbar" style={{width: (this.props.progress*100) + "0%" }} >
            </div>
          </div>
        </div>
      );
    return (
      <a href="#" className={classes} onClick={this.handleClick}>
        <h5 className="list-group-item-heading">{data.title}</h5>
        <div className="clearfix">
          <span className="badge pull-left"  data-timecode-type="begin" style={{marginRight: "4px" }} >{formatTime(data.begin)}</span>
          <span className="badge pull-right" data-timecode-type="end"   style={{marginLeft: "4px" }}  >{formatTime(data.end)}</span>
          {commands}
        </div>
      </a>
    );
  }
});
var VideoEventList = function(){

  var onClick = function(evt){
      if (videoDispatcher){
        videoDispatcher.dispatch({actionType: "onEventClick", eventId: evt.eventId});
      }
  }
  return React.createClass({

    sortData: function(){
      this.state.data.sort(function(a,b){
        return a.begin - b.begin;
      });
    },
    ratio: function(v, min, max){
      if (min == max){
        return 0;
      }
      var r = (v - min)/(max - min);
      if (r < 0) return 0;
      if (r > 1) return 1;
      return r;
    },
    initDispatcher: function(){
      var refresh = function(){
        this.setState({data: this.state.data});
      }.bind(this);
      videoDispatcher.register(function(obj){
        switch(obj.actionType){
          case "currentTime": this.setState({time: obj.time}); break;
          case "onEventAdded": 
            var evt = {trackId: obj.trackId, eventId: obj.eventId, title: obj.title, begin: obj.begin, end: obj.end};
            this.state.data.push(evt);
            this.state.events[obj.eventId] = evt;
            this.sortData();
            this.setState({data: this.state.data, events: this.state.events});
            break;
          case "updateEventTitle": 
            this.state.events[obj.eventId].title = obj.title;
            refresh();
            break;
          case "updateEventTimecodes": 
            var evt = this.state.events[obj.eventId];
            evt.begin = obj.begin;
            evt.end = obj.end;
            this.sortData();
            refresh();
            break;
          default: break;
        }
      }.bind(this));
    },
    getInitialState: function() {
      return {data: [], events: {}, time: 0};
    },
    componentDidMount: function() {
      // var this = this;
      if (videoDispatcher){
        this.initDispatcher();
      }
      // $.ajax({
      //   url: this.props.url,
      //   dataType: 'json',
      //   success: function(data) {
      //     this.setState({data: data});
      //   }.bind(this),
      //   error: function(xhr, status, err) {
      //     console.error(this.props.url, status, err.toString());
      //   }.bind(this)
      // });
    },
    render: function() {
      var state = this.state;
      var videoNodes = this.state.data.map(function (evt) {
        return (
          <VideoEvent  key={evt.eventId}
                      data={evt} 
                  isActive={(evt.begin <= state.time) && (state.time < evt.end)} 
                  progress={this.ratio(state.time, evt.begin, evt.end)}
                   onClick={onClick}/>
        );
      }.bind(this));
      return (
        <div id="react-sequences" className="list-group collapse in">
          {videoNodes}
        </div>
      );
    }
  });
}();



