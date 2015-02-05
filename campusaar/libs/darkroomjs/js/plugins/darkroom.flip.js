;(function(window, document, Darkroom, fabric) {
  'use strict';

  Darkroom.plugins['flip'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomRotatePlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.leftButton = buttonGroup.createButton({
        image: 'glyphicon glyphicon-resize-horizontal'
      });

      this.rightButton = buttonGroup.createButton({
        image: 'glyphicon glyphicon-resize-vertical'
      });

      this.leftButton.addEventListener('click', this.hflip.bind(this));
      this.rightButton.addEventListener('click', this.vflip.bind(this));
    },

    hflip: function hflip() {
      var _this = this;

      var darkroom = this.darkroom;
      var canvas = darkroom.canvas;
      var image = darkroom.image;
      image.setFlipX(!image.getFlipX());
      canvas.renderAll();
      darkroom.dispatchEvent('image:change');
    },

    vflip: function vflip() {
      var _this = this;

      var darkroom = this.darkroom;
      var canvas = darkroom.canvas;
      var image = darkroom.image;
      image.setFlipY(!image.getFlipY());
      canvas.renderAll();
      darkroom.dispatchEvent('image:change');
    },
  });
})(window, document, Darkroom, fabric);
