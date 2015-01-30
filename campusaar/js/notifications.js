var ArmaTools = ArmaTools || {};

ArmaTools.Notifications = function(){

  var observers = {
  };

  var arr = function(evt){
    if (!(evt in observers)){
      observers[evt] = [];
    }
    return observers[evt];
  }

  var unregister = function(name, callback){
    if (!name){
      console.log("WARNING - invalid notification name");
      return;
    }
    var a = arr(name);
    for(var i = 0; i < a.length; i++){
      if (a[i] === callback) {
        a.split(i, 1);
        return;
      }
    }
  }

  var register = function(name, callback){
    if (!name){
      console.log("WARNING - invalid notification name");
      return;
    }
    var a = arr(name);
    for(var i = 0; i < a.length; i++){
      if (a[i] === callback) {
        // Already there !
        return;
      }
    }
    a.push(callback);
  }

  var post = function(name, obj){
    if (!name){
      console.log("WARNING - invalid notification name");
      return;
    }
    var a = arr(name);
    for(var i=0; i<a.length; i++){
      a[i](obj);
    }
  }

  var postAsync = function(name, obj){
    if (!name){
      console.log("WARNING - invalid notification name");
      return;
    }
    setTimeout(function(){
      dispatch(name, obj);
    }, 0);
  }

  return {
    register: register,
    unregister : unregister,
    post: post,
    postAsync: postAsync,
  };

}();