;(function(window, document, Darkroom, fabric) {
  'use strict';

  Darkroom.plugins['brightness'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomBrightnessPlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();
      var brightnessButton = buttonGroup.createButton({
        image: 'glyphicon glyphicon-certificate'
      });

      var el = $(brightnessButton.element);
      el.popover({
          html: true,
          placement: 'bottom',
          content: '<input type="range" id="bright-value" value="0" min="0" max="255" step="1">',
          trigger: 'click',
        });

      var isFirst = true;
      el.on('shown.bs.popover', function(){
        this.init();
        var input = el.parent().find(".popover-content input");
        input.unbind("change");
        input.change(function(e){
          console.log(e.target.value);
          this.brightness(e.target.value);
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
      console.log("init brightness");
      var f = fabric.Image.filters;
      var darkroom = this.darkroom;
      var image = darkroom.image;
      image.filters[0] = new fabric.Image.filters.Brightness({brightness: 0});
    },

    brightness: function brightness(value){
      var darkroom = this.darkroom;
      var canvas = darkroom.canvas;
      var image = darkroom.image;
      image.filters[0]['brightness'] = parseInt(value, 10);
      image.applyFilters(canvas.renderAll.bind(canvas));
      // canvas.renderAll();
      darkroom.dispatchEvent('image:change');
    }
  });
})(window, document, Darkroom, fabric);
