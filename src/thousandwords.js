(function() {
  var ThousandWords;
  ThousandWords = (function(_super){

    ThousandWords.prototype = {
      canvas:           null,
      options:          null,
      element:          null,

      canvasWidth:      800,
      canvasHeight:     800,

      minWidth:         null,
      minHeight:        null,

      down:             false,
      imageY:           0,

      original:         {
        width:      0,
        height:     0,
        scale:      0
      },

      mouse: {
        x:      0,
        y:      0,
        state:  false,
        grab:   false
      },

      cropper: {
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
      },
      errors: [],


      init: function() {
        this.create();
        this.loadImage();
      },

      reset: function(options) {
        this.canvas.parentElement.removeChild(this.canvas);
        this.options = options;
        this.init();
      },

      handleEvent : function(event) {
        if(event.type === "mousemove") {
          this.mouseMove(event);
        }
        if(event.type === "mousedown") {
          this.mouseDown(event);
        }
        if(event.type === "mouseup") {
          this.mouseUp(event);
        }
      },

      create: function() {
        this.canvas = document.createElement("canvas");
        this.canvas.className = "thousandwords-cropper";
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.element.appendChild(this.canvas);

        document.addEventListener('mousedown', this, false);
        document.addEventListener('mouseup', this, false);
        document.addEventListener('mousemove', this, false);
      },

      loadImage: function() {
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
          self.cropper.y = self.imageY;
        }
        return this.image;
      },

      resizeImage: function() {
        var width = this.image.width;
        var height = this.image.height;
        this.original.width = width;
        this.original.height = height;
        if (width > height) {
          if (width > this.canvasWidth) {
            width = this.canvasWidth;
            this.original.scale = this.canvasWidth / this.image.width;
            height *= this.original.scale;
          }
        } else {
          if (height > this.canvasHeight) {
            this.original.scale = this.canvasHeight / this.image.height;
            width *= this.original.scale;
            height = this.canvasHeight;
          }
        }
        this.minWidth = Math.round(this.options.width * this.original.scale);
        this.minHeight = Math.round(this.options.height * this.original.scale);
        this.cropper.width = this.minWidth;
        this.cropper.height = this.minHeight;
        this.image.width = width;
        this.image.height = height;
      },

      //IMAGE RENDERING

      render: function() {
        this.renderPicture();
        this.renderBlackspace();
        this.renderTriangle();
        // this.renderText();
      },

      // renderText: function() {
      //   this.canvas.getContext('2d').font="20px Helvetica";
      //   this.canvas.getContext('2d').fillStyle = 'black'
      //   this.canvas.getContext('2d').textAlign = 'center';
      //   this.canvas.getContext('2d').fillText("Crop Your Image",this.canvas.width/2,this.imageY/2);
      // },

      renderPicture: function() {
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        // this.canvas.getContext('2d').clearRect(0,0,this.canvas.width,this.canvas.height);
        this.canvas.getContext('2d').drawImage(this.image, 0, this.imageY, this.image.width, this.image.height );
      },

      renderBlackspace: function() {
        this.canvas.getContext('2d').fillStyle = 'rgba( 0,0,0,0.7)';
        this.canvas.getContext('2d').fillRect( 0, this.imageY, this.cropper.x, this.image.height );
        //this.canvas.getContext('2d').fillStyle = 'rgba( 0,0,255,0.8)';
        this.canvas.getContext('2d').fillRect( this.cropper.x2(), this.imageY, this.canvas.width-this.cropper.width, this.image.height );
        //this.canvas.getContext('2d').fillStyle = 'rgba( 0,255,0,0.8)';
        this.canvas.getContext('2d').fillRect( this.cropper.x, this.imageY, this.cropper.width, this.cropper.y - this.imageY );
        //this.canvas.getContext('2d').fillStyle = 'rgba( 255,0,0,0.8)';
        this.canvas.getContext('2d').fillRect( this.cropper.x, this.cropper.y2(), this.cropper.width, (this.imageY + this.image.height - this.cropper.y - this.cropper.height));
      },

      renderTriangle: function() {
        this.canvas.getContext('2d').fillStyle = 'rgba(0,0,255,0.5)';
        this.canvas.getContext('2d').strokeStyle = 'rgba(130,130,255,0.9)';
        this.canvas.getContext('2d').lineWidth   = 1;

        this.canvas.getContext('2d').beginPath();
        this.canvas.getContext('2d').moveTo((this.cropper.x2() - 25), (this.cropper.y2())); // give the (x,y) coordinates
        this.canvas.getContext('2d').lineTo((this.cropper.x2()), (this.cropper.y2()));
        this.canvas.getContext('2d').lineTo((this.cropper.x2()), (this.cropper.y2() - 25));
        this.canvas.getContext('2d').lineTo((this.cropper.x2() - 25), (this.cropper.y2()));

        this.canvas.getContext('2d').fill();
        this.canvas.getContext('2d').stroke();
        this.canvas.getContext('2d').closePath();
      },

      // MOUSE MOVEMENT

      buildMouse : function(event) {
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
      },

      mouseDown : function(event) {
        this.buildMouse(event);
        this.down = true;
        this.mouse.grab = false;
        this.mouse.state = 0;
      },

      mouseUp : function() {
        this.mouse.state = false;
        this.mouse.grab = false;
        this.down = false;
      },

      mouseMove: function(ev) {
        if(this.mouse.state !== false) {
          this.buildMouse(event);
          if(this.mouse.state == 1) {
            this.drag();
          }
          if(this.mouse.state == 2) {
            this.scale();
          }
        }
        this.render();
      },

      getMouseState: function(x, y) {
        x1 = this.cropper.x;
        x2 = this.cropper.x2();
        y1 = this.cropper.y;
        y2 = this.cropper.y2();
        corner = 25;

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
      },

      getMouseGrab: function(x, y) {
        x1 = this.cropper.x;
        y1 = this.cropper.y;
        return {
          x : x - x1,
          y : y - y1
        }
      },

      drag: function() {
        x1 = this.mouse.x - this.mouse.grab.x;
        y1 = this.mouse.y - this.mouse.grab.y;
        width = this.cropper.width;
        height = this.cropper.height;

        this.validator(x1, y1, width, height);
      },

      scale: function() {
        x1 = this.cropper.x;
        y1 = this.cropper.y;
        width = this.mouse.x - this.cropper.x + (this.cropper.width - this.mouse.grab.x);
        height = width / (this.options.width/this.options.height)

        delta = this.cropper.width;

        this.rect = this.validator(x1, y1, width, height);

        this.mouse.grab.x = this.mouse.grab.x + this.cropper.width - delta;
      },

      validator: function(x1, y1, width, height) {
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
      },

      setCropper: function(x, y, w, h) {
        this.cropper.x = x;
        this.cropper.y = y;
        this.cropper.width = w;
        this.cropper.height = h;
      },

      getImage: function() {
        scale = this.original.scale;
        this.result = document.createElement('canvas');
        this.result.width = this.options.width;
        this.result.height = this.options.height;
        this.result.getContext('2d').drawImage(this.image, (this.cropper.x/scale), ((this.cropper.y/scale)-(this.imageY/scale)), (this.cropper.width/scale), (this.cropper.height/scale), 0, 0, this.options.width, this.options.height);
        // data = this.result.toDataURL();

        return {
          // width: this.options.width,
          // height: this.options.height,
          // xOffset: this.options.x,
          // yOffset: this.options.y,
          // originalWidth: this.original.width,
          // originalHeight: this.original.height,
          // xOriginOffset: this.cropper.x/scale,
          // yOriginOffset: this.cropper.y/scale,
          xOffset:  Math.round(this.cropper.x/scale),
          yOffset:  Math.round(this.cropper.y/scale),
          width:    Math.round(this.cropper.width/scale),
          height:   Math.round(this.cropper.height/scale)

          // image: data
        }
      }
    }

    function ThousandWords(element, options) {
      if (typeof element === "string") {
        this.element = document.querySelector(element);
      }
      this.options = options;
      this.init();
      return this;
    }

    ThousandWords.prototype.init = function() {
      this.create();
      this.loadImage();
    };

    return ThousandWords;

  })(Em);

  if (typeof module !== 'undefined' && module !== null) {
    module.exports = ThousandWords;
  } else {
    window.ThousandWords = ThousandWords;
  }
}).call(this);
