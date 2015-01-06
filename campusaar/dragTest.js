
// <div style="display: block; padding: 40px;">
//     <p style="position: absolute; top: 0; left: 40px; width: 60px;"></p>
// </div>


// p { background: lime; height: 200px; width: 300px; }
// p.resizable { background: cyan; position: relative; }
// p .resizer { width: 10px; height: 100%; background: blue; position:absolute; right: 0; cursor: e-resize; }
// p .resizer_left { width: 10px; height: 100%; background: blue; position:absolute; left: 0; cursor: w-resize;  }





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
       p.style.left = right - width + 'px';
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
