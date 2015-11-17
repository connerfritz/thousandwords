define("vendor/thousandwords", ['exports'], function(exports) {
  function ThousandWords(element, options) {
    this.canvas =          null;
    this.options =         null;
    this.element =         null;
    this.canvasWidth =     800;
    this.canvasHeight =    800;
    this.minWidth =        null;
    this.minHeight =       null;
    this.down =            false;
    this.imageY =          0;

    this.original = {
      width:      0,
      height:     0,
      scale:      0
    };

    this.mouse = {
      x:      0,
      y:      0,
      state:  false,
      grab:   false
    };

    this.cropper = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      x2: function() {
        return this.x + this.width;
      },
      y2: function() {
        return this.y + this.height;
      }
    };
    this.errors = [];

    this.init(element, options);
  }

  ThousandWords.prototype.init = function(element, options) {
    if (typeof element === "string") {
      this.element = document.querySelector(element);
    }
    this.options = options;
    this.create();
    this.loadImage();
  };

  ThousandWords.prototype.reset = function() {
    this.canvas.parentElement.removeChild(this.canvas);
    this.options = options;
    this.init();
  };

  ThousandWords.prototype.handleEvent = function(event) {
    if(event.type === "mousemove") {
      this.mouseMove(event);
    }
    if(event.type === "mousedown") {
      this.mouseDown(event);
    }
    if(event.type === "mouseup") {
      this.mouseUp(event);
    }
    if(event.type === "touchstart") {
      this.mouseDown(event.touches[0]);
    }
    if(event.type === "touchend") {
      this.mouseUp(event);
    }
    if(event.type === "touchmove") {
      event.preventDefault();
      this.mouseMove(event.touches[0]);
    }
  };

  ThousandWords.prototype.create = function() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "thousandwords-cropper";
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.element.appendChild(this.canvas);

    document.addEventListener('mousedown', this, false);
    document.addEventListener('mouseup', this, false);
    document.addEventListener('mousemove', this, false);
    document.addEventListener('touchstart', this, false);
    document.addEventListener('touchend', this, false);
    this.canvas.addEventListener('touchmove', this, false);
  };

  ThousandWords.prototype.loadImage = function() {
    var self = this;
    this.image = new Image();
    this.image.src = this.options["src"];
    this.image.onload = function() {
      if (self.image.width < self.options.width || self.image.height < self.options.height) {
        errors.push('The image you selected is too small to upload. Please choose an image at least ' + self.options.width + ' by ' + self.options.height);
        return false;
      }

      self.resizeImage();
      self.render();
    }
    return this.image;
  };

  ThousandWords.prototype.resizeImage = function() {
    var width = this.image.width;
    var height = this.image.height;
    this.original.width = width;
    this.original.height = height;

    if (width > height) {
      if (width > this.canvasWidth) {
        this.original.scale = this.canvasWidth / this.image.width;
      }
    } else {
      if (height >= this.canvasHeight) {
        this.original.scale = this.canvasHeight / this.image.height;
      }
    }

    this.minWidth = Math.round(this.options.width * this.original.scale);
    this.minHeight = Math.round(this.options.height * this.original.scale);

    upperWidth = (height / this.minHeight) * this.minWidth
    upperHeight = (width / this.minWidth) * this.minHeight

    this.defaultCropperSetting(width, height, upperWidth, upperHeight)

    if(!isNaN(this.options.crop_width) && !isNaN(this.options.crop_height) && !isNaN(this.options.crop_x) && !isNaN(this.options.crop_y)) {
      this.cropper.width = this.options.crop_width;
      this.cropper.height = this.options.crop_height;
      this.cropper.x = this.options.crop_x;
      this.cropper.y = this.options.crop_y;
      if(this.options.crop_width + this.options.crop_x > width || this.options.crop_height + this.options.crop_y > height) {
        this.defaultCropperSetting(width, height, upperWidth, upperHeight);
      }
    }
  };

  ThousandWords.prototype.defaultCropperSetting = function(width, height, upperWidth, upperHeight) {
    if (upperHeight <= height) {
      this.cropper.x = 0;
      this.cropper.y = 0;
      this.cropper.width = width;
      this.cropper.height = upperHeight;
    } else {
      this.cropper.x = 0;
      this.cropper.y = 0;
      this.cropper.width = upperWidth;
      this.cropper.height = height;
    }
  };

  //IMAGE RENDERING

  ThousandWords.prototype.render = function() {
    this.renderPicture();
    this.renderBlackspace();
    this.renderTriangle();
  };

  ThousandWords.prototype.renderPicture = function() {
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;
    this.canvas.getContext('2d').drawImage(this.image, 0, this.imageY, this.image.width, this.image.height );
  };

  ThousandWords.prototype.renderBlackspace = function() {
    this.canvas.getContext('2d').fillStyle = 'rgba( 0,0,0,0.7)';
    this.canvas.getContext('2d').fillRect( 0, this.imageY, this.cropper.x, this.image.height );
    this.canvas.getContext('2d').fillRect( this.cropper.x2(), this.imageY, this.canvas.width-this.cropper.width, this.image.height );
    this.canvas.getContext('2d').fillRect( this.cropper.x, this.imageY, this.cropper.width, this.cropper.y - this.imageY );
    this.canvas.getContext('2d').fillRect( this.cropper.x, this.cropper.y2(), this.cropper.width, (this.imageY + this.image.height - this.cropper.y - this.cropper.height));

    this.canvas.getContext('2d').strokeStyle = 'rgba(255,255,255,1)';
    this.canvas.getContext('2d').lineWidth   = 3;
    this.canvas.getContext('2d').setLineDash([20]);
    this.canvas.getContext('2d').strokeRect (this.cropper.x, this.cropper.y, this.cropper.width, this.cropper.height);
  };

  ThousandWords.prototype.renderTriangle = function() {
    corner = 50

    this.canvas.getContext('2d').fillStyle = 'rgba(255,255,255,1)';
    this.canvas.getContext('2d').strokeStyle = 'rgba(0,0,0,0.8)';
    this.canvas.getContext('2d').lineWidth   = 5;
    this.canvas.getContext('2d').setLineDash([null]);

    this.canvas.getContext('2d').beginPath();
    this.canvas.getContext('2d').moveTo((this.cropper.x2() - corner), (this.cropper.y2())); // give the (x,y) coordinates
    this.canvas.getContext('2d').lineTo((this.cropper.x2()), (this.cropper.y2()));
    this.canvas.getContext('2d').lineTo((this.cropper.x2()), (this.cropper.y2() - corner));
    this.canvas.getContext('2d').lineTo((this.cropper.x2() - corner), (this.cropper.y2()));

    this.canvas.getContext('2d').fill();
    this.canvas.getContext('2d').stroke();
    this.canvas.getContext('2d').closePath();
  };

  // MOUSE MOVEMENT

  ThousandWords.prototype.buildMouse = function(event) {
    offset = this.canvas.getBoundingClientRect();

    x = Math.round((event.clientX - offset.left) * (this.canvas.width / offset.width));
    y = Math.round((event.clientY - offset.top) * (this.canvas.height / offset.height));

    grab = this.mouse.grab;
    state = this.mouse.state;

    if(this.mouse.state === 0) {
      state = this.getMouseState(x,y);
    }
    if(this.mouse.grab === false) {
      grab = this.getMouseGrab(x,y);
    }

    this.mouse = {
      x : x,
      y : y,
      grab : grab,
      state : state
    };
  };

  ThousandWords.prototype.mouseDown = function(event) {
    this.buildMouse(event);
    this.down = true;
    this.mouse.grab = false;
    this.mouse.state = 0;
  };

  ThousandWords.prototype.mouseUp = function() {
    this.mouse.state = false;
    this.mouse.grab = false;
    this.down = false;
  };

  ThousandWords.prototype.mouseMove = function(ev) {
    if(this.mouse.state !== false) {
      this.buildMouse(ev);
      if(this.mouse.state == 1) {
        this.drag();
      }
      if(this.mouse.state == 2) {
        this.scale();
      }
    }
    this.render();
  };

  ThousandWords.prototype.getMouseState = function(x, y) {
    x1 = this.cropper.x;
    x2 = this.cropper.x2();
    y1 = this.cropper.y;
    y2 = this.cropper.y2();
    corner = 50;

    state = this.mouse.state;
    if(state == 0) {
      if((x1 < x && x < x2) && (y1 < y && y < y2)) {
        if((x2 - corner) < x && (y2 - corner) < y) {
          return 2;
        }
        return 1;
      }
    }
    if(state > 0) {
      return state;
    }
    return 0;
  };

  ThousandWords.prototype.getMouseGrab = function(x, y) {
    x1 = this.cropper.x;
    y1 = this.cropper.y;
    return {
      x : x - x1,
      y : y - y1
    }
  };

  ThousandWords.prototype.drag = function() {
    x1 = this.mouse.x - this.mouse.grab.x;
    y1 = this.mouse.y - this.mouse.grab.y;
    width = this.cropper.width;
    height = this.cropper.height;

    this.validator(x1, y1, width, height);
  };

  ThousandWords.prototype.scale = function() {
    x1 = this.cropper.x;
    y1 = this.cropper.y;
    width = this.mouse.x - this.cropper.x + (this.cropper.width - this.mouse.grab.x);
    height = width / (this.options.width/this.options.height)

    delta = this.cropper.width;

    this.rect = this.validator(x1, y1, width, height);

    this.mouse.grab.x = this.mouse.grab.x + this.cropper.width - delta;
  };

  ThousandWords.prototype.validator = function(x1, y1, width, height) {
    if(this.mouse.state == 2) {
      if(this.image.width <= (width + x1)) { //TOO WIDE
        width = this.image.width - x1;
        height = width / (this.options.width/this.options.height)
      }
      if((this.image.height + this.imageY) <= (height + y1)) { //TOO TALL
        height = this.image.height + this.imageY - y1;
        width = height * (this.options.width/this.options.height);
      }
      if(width <= this.minWidth) {
        width = this.minWidth;
        height = this.minHeight;
      }
    }
    if(this.mouse.state == 1) {
      if(this.image.width <= (width + x1)) { //TOO WIDE
        x1 = this.image.width - this.cropper.width
      }
      if((this.image.height + this.imageY) <= (height + y1)) { //TOO TALL
        y1 = this.image.height - this.cropper.height + this.imageY
      }
      if(x1 < 0) {
        x1 = 0;
      }
      if(y1 < this.imageY) {
        y1 = this.imageY;
      }
    }
    this.setCropper(x1, y1, width, height);
  };

  ThousandWords.prototype.setCropper = function(x, y, w, h) {
    this.cropper.x = x;
    this.cropper.y = y;
    this.cropper.width = w;
    this.cropper.height = h;
  };

  ThousandWords.prototype.getImage = function() {
    return {
      xOffset:  Math.round(this.cropper.x),
      yOffset:  Math.round(this.cropper.y),
      width:    Math.round(this.cropper.width),
      height:   Math.round(this.cropper.height)
    }
  };

  exports['default'] = ThousandWords;
});
