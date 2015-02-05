;(function(window, document, Darkroom, fabric) {
  'use strict';

  Darkroom.plugins['brightness'] = Darkroom.Plugin.extend({
    brightness: 0,

    initialize: function InitDarkroomBrightnessPlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();
      var brightnessButton = buttonGroup.createButton({
        image: 'glyphicon glyphicon-certificate'
      });

      var el = $(brightnessButton.element);
      el.popover({
          html: true,
          placement: 'bottom',
          content: function(){return '<input type="range" id="bright-value" value="' + this.brightness + '" min="0" max="255" step="1">'}.bind(this),
          trigger: 'click',
        });

      var isFirst = true;
      el.on('shown.bs.popover', function(){
        if (isFirst){
          this.init();
        }
        var input = el.parent().find(".popover-content input");
        input.unbind("change");
        input.change(function(e){
          this.applyBrightness(e.target.value);
        }.bind(this));
      }.bind(this));
      // el.on('hidden.bs.popover', function () {
      //   // do something…
      // })
      // brightnessButton.addEventListener('click', function(e){
      //   el.popover('show');
      // }.bind(this));
    },

    init: function init(){
      var f = fabric.Image.filters;
      var darkroom = this.darkroom;
      var image = darkroom.image;
      image.filters[0] = new fabric.Image.filters.Brightness({brightness: this.brightness});
    },

    applyBrightness: function brightness(value){
      this.brightness = parseInt(value, 10);
      var darkroom = this.darkroom;
      var canvas = darkroom.canvas;
      var image = darkroom.image;
      image.filters[0]['brightness'] = this.brightness;
      image.applyFilters(canvas.renderAll.bind(canvas));
      // canvas.renderAll();
      darkroom.dispatchEvent('image:change');
    }
  });
})(window, document, Darkroom, fabric);
