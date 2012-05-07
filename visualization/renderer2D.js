/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.renderer2D');

// requires
goog.require('X.renderer');


/**
 * Create a 2D renderer inside a given DOM Element.
 * 
 * @constructor
 * @param {!Element} container The container (DOM Element) to place the renderer
 *          inside.
 * @extends X.renderer
 */
X.renderer2D = function(container, orientation) {

  //
  // call the standard constructor of X.renderer
  goog.base(this, container);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'renderer2D';
  
  this['orientation'] = orientation;
  
};
// inherit from X.base
goog.inherits(X.renderer2D, X.renderer);


/**
 * @inheritDoc
 */
X.renderer2D.prototype.init = function() {

  // call the superclass' init method
  X.renderer2D.superClass_.init.call(this, "2d");
  
};



X.renderer2D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  X.renderer2D.superClass_.update_.call(this, object);
  
  window.console.log('updating..');
  
  var id = object['_id'];
  var texture = object._texture;
  var file = object._file;
  
  if (goog.isDefAndNotNull(file) && file._dirty) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this.loader.loadFile(object);
    
    return;
    
  }
  
  this.objects.add(object);
  
  window.console.log('updating done', object);
  
};

X.renderer2D.prototype.render_ = function(picking, invoked) {

  // call the update_ method of the superclass
  X.renderer2D.superClass_.render_.call(this, picking, invoked);
  
  // only proceed if there are actually objects to render
  var _objects = this.objects.values();
  var _numberOfObjects = _objects.length;
  if (_numberOfObjects == 0) {
    // there is nothing to render
    // get outta here
    return;
  }
  
  var _pixels = this.context.getImageData(0, 0, this['width'], this['height']);
  
  var _currentSlice = 0;
  var _volume = this.topLevelObjects[0];
  
  var _children = null;
  
  if (this['orientation'] == 'X') {
    
    _children = _volume._slicesX.children();
    _currentSlice = _volume['_indexX'];
    
  } else if (this['orientation'] == 'Y') {
    
    _children = _volume._slicesY.children();
    _currentSlice = _volume['_indexY'];
    
  } else if (this['orientation'] == 'Z') {
    
    _children = _volume._slicesZ.children();
    _currentSlice = _volume['_indexZ'];
    
  }
  
  var _slice = _children[parseInt(_currentSlice)];
  var _sliceData = _slice._texture._rawData;
  
  var _width = this['width'];
  var _height = this['height'];
  var _sliceWidth = _slice._width + 1;
  var _sliceHeight = _slice._height + 1;
  

  var _paddingX = ((_width - _sliceWidth) / 2);
  var _paddingY = ((_height - _sliceHeight) / 2);
  var _x, _y = 0;
  var _i = 0; // this is the pointer to the current slice data byte
  
  if (this['orientation'] == 'X') {
    
    // the X oriented texture is twisted ..
    _paddingX = ((_width - _sliceHeight) / 2);
    _paddingY = ((_height - _sliceWidth) / 2);
    
  }
  
  for (_y = _height; _y >= 0; _y--) {
    for (_x = _width; _x >= 0; _x--) {
      
      // the pixel index
      var _pxIndex = _x + _y * _width;
      
      // the r-index is the pixel index * 4 since we have RGBA components
      var _rIndex = _pxIndex * 4;
      
      // check if we are in area to draw slice data
      if ((_x >= _paddingX && _y >= _paddingY) &&
          (_x < (_width - _paddingX) && _y < (_height - _paddingY))) {
        
        //
        // thresholding
        // console.log(_sliceData[_i]);
        var _currentPixelValue = _sliceData[_i] / 255 *
            _volume.scalarRange()[1];
        var _lowerThreshold = _volume['_lowerThreshold'];
        var _upperThreshold = _volume['_upperThreshold'];
        


        if (_currentPixelValue >= _lowerThreshold &&
            _currentPixelValue <= _upperThreshold) {
          
          // yes we are..! draw slice data
          _pixels.data[_rIndex] = _sliceData[_i];
          _pixels.data[++_rIndex] = _sliceData[_i + 1];
          _pixels.data[++_rIndex] = _sliceData[_i + 2];
          _pixels.data[++_rIndex] = _sliceData[_i + 3];
          
          _i = _i + 4; // increase the slice data byte pointer
          
          continue;
          
        }
        
        _i = _i + 4; // increase the slice data byte pointer
        
      }
      
      // draw background since we are either outside a threshold or outside
      // the
      // pixel region
      _pixels.data[_rIndex] = 0;
      _pixels.data[++_rIndex] = 0;
      _pixels.data[++_rIndex] = 0;
      _pixels.data[++_rIndex] = 255;
      
    }
  }
  
  // propagate new image data
  this.context.putImageData(_pixels, 0, 0);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer2D', X.renderer2D);
goog.exportSymbol('X.renderer2D.prototype.init', X.renderer2D.prototype.init);
goog.exportSymbol('X.renderer2D.prototype.add', X.renderer2D.prototype.add);
goog.exportSymbol('X.renderer2D.prototype.onShowtime',
    X.renderer2D.prototype.onShowtime);
goog.exportSymbol('X.renderer2D.prototype.get', X.renderer2D.prototype.get);
goog.exportSymbol('X.renderer2D.prototype.render',
    X.renderer2D.prototype.render);
goog.exportSymbol('X.renderer2D.prototype.destroy',
    X.renderer2D.prototype.destroy);
