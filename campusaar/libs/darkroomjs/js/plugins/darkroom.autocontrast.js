;(function(window, document, Darkroom, fabric) {
  'use strict';

  Darkroom.plugins['autocontrast'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomBrightnessPlugin() {
      console.log('initialize');
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();
      var contrastButton = buttonGroup.createButton({
        image: 'glyphicon glyphicon-adjust'
      });

      fabric.Image.filters.AutoContrast = this.createFilter();
      fabric.Image.filters.AutoContrast.fromObject = function(object) {
        return new fabric.Image.filters.AutoContrast(object);
      };

      var darkroom = this.darkroom;
      var canvas = darkroom.canvas;
      var image = darkroom.image;

      this.filter = new fabric.Image.filters.AutoContrast({enabled: false});
      image.filters.push(this.filter);

      // var el = $(brightnessButton.element);
      // el.popover({
      //     html: true,
      //     placement: 'bottom',
      //     content: function(){return '<input type="range" id="bright-value" value="' + this.brightness + '" min="0" max="255" step="1">'}.bind(this),
      //     trigger: 'click',
      //   });

      // var isFirst = true;
      // el.on('shown.bs.popover', function(){
      //   if (isFirst){
      //     this.init();
      //   }
      //   var input = el.parent().find(".popover-content input");
      //   input.unbind("change");
      //   input.change(function(e){
      //     this.applyBrightness(e.target.value);
      //   }.bind(this));
      // }.bind(this));
      // el.on('hidden.bs.popover', function () {
      //   // do something…
      // })
      contrastButton.addEventListener('click', function(e){
        this.applyAutocontrast();
      }.bind(this));
    },

    applyAutocontrast: function(){
      var darkroom = this.darkroom;
      var canvas = darkroom.canvas;
      var image = darkroom.image;

      this.filter.enabled = !this.filter.enabled;
      console.log(this.filter.enabled);

      image.applyFilters(canvas.renderAll.bind(canvas));
      darkroom.dispatchEvent('image:change');
    },

    createFilter: function(){
      return fabric.util.createClass(fabric.Image.filters.BaseFilter, {

        type: 'AutoContrast',

        initialize: function(options) {
          options = options || { };
          this.minWhite = options.minWhite || 240;
          this.maxBlack = options.maxBlack || 30;
          this.enabled = options.hasOwnProperty('enabled') ? options.enabled : true;
        },

        applyTo: function(canvasEl) {
          var context = canvasEl.getContext('2d'),
              imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
              data = imageData.data;

          if (this.enabled){
            this.autocontrast(imageData);
          }

          context.putImageData(imageData, 0, 0);
        },

        /**
         * Returns object representation of an instance
         * @return {Object} Object representation of an instance
         */
        toObject: function() {
          return extend(this.callSuper('toObject'), {
            minWhite: this.minWhite,
            maxBlack: this.maxBlack,
            enabled:  this.enabled,
          });
        },

        autocontrast: function(img){
          //settings
          var white = this.minWhite;    //white color min
          var black = this.maxBlack;     //black color max
          var target_white = 1;   //how much % white colors should take
          var target_black = 0.5; //how much % black colors should take
          var modify = 1.1;   //color modify strength

          // var img = context.getImageData(0, 0, W, H);
          var imgData = img.data;
          var n = 0;  //pixels count without transparent

          //make sure we have white
          var n_valid = 0;
          for(var i = 0; i < imgData.length; i += 4){
                  if(imgData[i+3] == 0) continue; //transparent
                  if((imgData[i] + imgData[i+1] + imgData[i+2]) / 3 > white) n_valid++;
                  n++;
              }
          var target = target_white;
          var n_fix_white = 0;
          var done = false;
          for(var j=0; j < 30; j++){
              if(n_valid * 100 / n >= target) done = true;
              if(done == true) break;
              n_fix_white++;

              //adjust
              for(var i = 0; i < imgData.length; i += 4){
                  if(imgData[i+3] == 0) continue; //transparent
                  for(var c = 0; c < 3; c++){
                      var x = i + c;
                      if(imgData[x] < 10) continue;
                      //increase white
                      imgData[x] *= modify;
                      imgData[x] = Math.round(imgData[x]);
                      if(imgData[x] > 255) imgData[x] = 255;
                      }
                  }

              //recheck
              n_valid = 0;
              for(var i = 0; i < imgData.length; i += 4){
                  if(imgData[i+3] == 0) continue; //transparent
                      if((imgData[i] + imgData[i+1] + imgData[i+2]) / 3 > white) n_valid++;
                  }
              }

          //make sure we have black
          n_valid = 0;
          for(var i = 0; i < imgData.length; i += 4){
              if(imgData[i+3] == 0) continue; //transparent
                  if((imgData[i] + imgData[i+1] + imgData[i+2]) / 3 < black) n_valid++;       
              }
          var target = target_black;
          var n_fix_black = 0;
          var done = false;
          for(var j=0; j < 30; j++){
              if(n_valid * 100 / n >= target) done = true;
              if(done == true) break;
              n_fix_black++;

              //adjust
              for(var i = 0; i < imgData.length; i += 4){
                  if(imgData[i+3] == 0) continue; //transparent
                  for(var c = 0; c < 3; c++){
                      var x = i + c;
                      if(imgData[x] > 240) continue;
                      //increase black
                      imgData[x] -= (255-imgData[x]) * modify - (255-imgData[x]);
                      imgData[x] = Math.round(imgData[x]);
                      }
                  }

              //recheck
              n_valid = 0;
              for(var i = 0; i < imgData.length; i += 4){
                  if(imgData[i+3] == 0) continue; //transparent
                      if((imgData[i] + imgData[i+1] + imgData[i+2]) / 3 < black) n_valid++;
                  }
              }

          //save  
          // context.putImageData(img, 0, 0);
          //log('Iterations: brighten='+n_fix_white+", darken="+n_fix_black);
        }
      });
    }
  });
})(window, document, Darkroom, fabric);
