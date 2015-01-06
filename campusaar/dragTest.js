var p = document.querySelector('p');

p.addEventListener('click', function init() {
    p.removeEventListener('click', init, false);
    p.className = p.className + ' resizable';
    
    var resizer2 = document.createElement('div');
    resizer2.className = 'resizer_left';
    p.appendChild(resizer2);
    resizer2.addEventListener('mousedown', initDragLeft, false);
    
    var resizer = document.createElement('div');
    resizer.className = 'resizer';
    p.appendChild(resizer);
    resizer.addEventListener('mousedown', initDragRight, false);
    
}, false);

var startX, startY, startWidth, startHeight;
var doDrag = function(){};

function initDragLeft(e) {
   startX = e.clientX;
   startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10);
    var right = startX + startWidth;
    doDrag = function(e) {
       var width =  (startWidth + startX - e.clientX);
       console.log('width: ' + width);
        var left = right - width
       p.style.left = left + 'px';
       p.style.width = right - left + 'px';
    };
   document.documentElement.addEventListener('mousemove', doDrag, false);
   document.documentElement.addEventListener('mouseup', stopDrag, false);
}

function initDragRight(e) {
   startX = e.clientX;
   startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10);
    doDrag = function(e) {
       p.style.width = (startWidth + e.clientX - startX) + 'px';
    };
   document.documentElement.addEventListener('mousemove', doDrag, false);
   document.documentElement.addEventListener('mouseup', stopDrag, false);
}
/*
function doDrag(e) {
   p.style.width = (startWidth + e.clientX - startX) + 'px';
   p.style.height = (startHeight + e.clientY - startY) + 'px';
}*/

function stopDrag(e) {
    console.log("stop");
    document.documentElement.removeEventListener('mousemove', doDrag, false);    document.documentElement.removeEventListener('mouseup', stopDrag, false);
}
