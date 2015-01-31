var ArmaTools = ArmaTools || {};

ArmaTools.Dispatcher = function(){
  this._nextId = 0;
  this._observers = {};
}

ArmaTools.Dispatcher.prototype.unregister = function(key){
  delete this._observers[key];
};

ArmaTools.Dispatcher.prototype.register = function(callback){
  var id = "" + (this._nextId++);
  this._observers[id] = callback;
  return id;
}

ArmaTools.Dispatcher.prototype.dispatch = function(obj){
  for(key in this._observers){
    if (this._observers.hasOwnProperty(key)){
      this._observers[key](obj);
    }
  }
}

ArmaTools.Dispatcher.prototype.dispatchAsync = function(obj){
  setTimeout(function(){
    dispatch(obj);
  }, 0);
}

