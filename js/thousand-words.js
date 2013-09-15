function ThousandWords() {

}

ThousandWords.prototype = {

	targetWidth : 0,
	targetHeight : 0,
	minWidth : 0,
	minHeight : 0,

	image : false,

	crop : false,

	preview: false,

	reader : false,

	mouse : {
		x : 0,
		y : 0,
		state : false,
		grab: false
	},

	rect : false,

	down : false,

	init : function(targetWidth, targetHeight, pixelRatio) {
		this.targetWidth = targetWidth;
		this.targetHeight = targetHeight;

		this.minWidth = targetWidth / pixelRatio;
		this.minHeight = targetHeight / pixelRatio;

		this.file = document.createElement('input');
		this.file.type = "file";
		document.body.appendChild(this.file);

		this.crop = document.createElement('canvas');

		this.preview = document.createElement('canvas');
		this.preview.width = targetWidth;
		this.preview.height = targetHeight;

		document.body.appendChild(this.crop);
		document.body.appendChild(this.preview);

		this.rect = {
			x1 : 0,
			y1 : 0,
			x2 : this.minWidth,
			y2 : this.minHeight,
			width : this.minWidth,
			height: this.minHeight,
			ratio : this.minWidth/this.minHeight
		};

		this.file.addEventListener('change', this, false);
	},

	handleEvent : function(event) {
		if(event.type === "change") {
			this.change(event)
		}
		if(event.type === "mousedown") {
			this.mouse_down(event);
		}
		if(event.type === "mouseup") {
			this.mouse_up(event);
		}
		if(event.type === "mousemove") {
			this.mouse_move(event);
		}
	},

	change : function(event) {

		var file = event.target.files[0];
		var self = this;
		if (file.type.match(/image.*/)) {
			this.reader = new FileReader();
			this.reader.readAsDataURL(file);
			this.reader.onload = function (readerEvent) {

				self.image = new Image();
				self.image.src = readerEvent.target.result;

				self.image.onload = function (imageEvent) {
					var width = self.image.width;
					var height = self.image.height;

					if(width < self.minWidth || height < self.minHeight) {
						alert('The image you selected is too small to upload. Please choose an image at least ' + self.minWidth + ' by ' + self.minHeight);
						return false;
					}

					if (width > height) {
						if (width > self.targetWidth) {
							height *= self.targetWidth / width;
							width = self.targetWidth;
						}
					} else {
						if (height > self.targetWidth) {
							width *= self.targetWidth / height;
							height = self.targetWidth;
						}
					}
					self.crop.width = width;
					self.crop.height = height;

					self.render;

					self.crop.addEventListener('mousedown', self, false);
					self.crop.addEventListener('mouseup', self, false);
					self.crop.addEventListener('mousemove', self, false);
				}
			}
		}
	},

	render: function() {
		this.crop.getContext('2d').drawImage(this.image, 0, 0, this.crop.width, this.crop.height );
		this.crop.getContext('2d').fillStyle = 'rgba( 0,0,0,0.7)';
		this.crop.getContext('2d').fillRect( 0, 0, this.rect.x1, this.crop.height );
		//this.crop.getContext('2d').fillStyle = 'rgba( 0,0,255,0.8)';
		this.crop.getContext('2d').fillRect( this.rect.x2, 0, this.crop.width-this.rect.width, this.crop.height );
		//this.crop.getContext('2d').fillStyle = 'rgba( 0,255,0,0.8)';
		this.crop.getContext('2d').fillRect( this.rect.x1, 0, this.rect.width, this.rect.y1 );
		//this.crop.getContext('2d').fillStyle = 'rgba( 255,0,0,0.8)';
		this.crop.getContext('2d').fillRect( this.rect.x1, this.rect.y2, this.rect.width, (this.crop.height-this.rect.height)*2 );

		this.crop.getContext('2d').fillStyle = 'rgba(255,255,255,0.5)';
		this.crop.getContext('2d').strokeStyle = 'rgba(0,0,0,0.5)';
		this.crop.getContext('2d').lineWidth   = 1;

		this.crop.getContext('2d').beginPath();
		this.crop.getContext('2d').moveTo((this.rect.x2 - 25), (this.rect.y2)); // give the (x,y) coordinates
		this.crop.getContext('2d').lineTo((this.rect.x2), (this.rect.y2));
		this.crop.getContext('2d').lineTo((this.rect.x2), (this.rect.y2 - 25));
		this.crop.getContext('2d').lineTo((this.rect.x2 - 25), (this.rect.y2));

		this.crop.getContext('2d').fill();
		this.crop.getContext('2d').stroke();

		this.crop.getContext('2d').closePath();
	},

	preview_crop: function() {
		con = this.image.width/this.crop.width;
		this.preview.getContext('2d').drawImage(this.image, (this.rect.x1*con), (this.rect.y1*con), (this.rect.width*con), (this.rect.height*con), 0, 0, this.targetWidth, this.targetHeight);
	},

	dragger : function() {
		x1 = this.mouse.x - this.mouse.grab.x;
		y1 = this.mouse.y - this.mouse.grab.y;
		width = this.rect.width;
		height = this.rect.height;

		this.rect = this.validator(x1, y1, width, height);
	},

	cropper : function() {
		x1 = this.rect.x1;
		y1 = this.rect.y1;
		width = this.mouse.x - this.rect.x1 + (this.rect.width - this.mouse.grab.x);
		height = width / this.rect.ratio;

		delta = this.rect.width;

		this.rect = this.validator(x1, y1, width, height);

		this.mouse.grab.x = this.mouse.grab.x + this.rect.width - delta;
	},

	upload : function() {

	},

	validator: function(x1, y1, width, height) {
		if(width + this.rect.x1  > this.crop.width) {
			width = this.crop.width - this.rect.x1;
			height = this.rect.height;
		}
		if(height + this.rect.y1 > this.crop.height) {
			width = this.rect.width;
			height = this.crop.height;
		}
		if(width < this.minWidth) {
			width = this.rect.width;
			height = this.rect.height;
		}

		if(height < this.minHeight) {
			width = this.rect.width;
			height = this.rect.height;
		}
		if(x1 + this.rect.width > this.crop.width) {
			x1 = this.crop.width - this.rect.width;
		}
		if(x1 < 0) {
			x1 = 0;
		}
		if(y1 < 0) {
			y1 = 0;
		}
		if(y1 + this.rect.height > this.crop.height) {
			y1 = this.crop.height - this.rect.height;
		}
		return {
			x1: x1,
			y1: y1,
			x2: x1 + width,
			y2: y1 + height,
			width: width,
			height: height,
			ratio: this.minWidth / this.minHeight
		};
	},

	build_mouse : function(event) {
		offsetX = this.crop.offsetLeft - document.body.scrollLeft;
		offsetY = this.crop.offsetTop - document.body.scrollTop;

		x = event.clientX - offsetX;
		y = event.clientY - offsetY;
		grab = this.mouse.grab;

		state = this.mouse.state;
		if(this.mouse.state === 0) {
			state = this.get_mouse_state(x,y);
		}
		if(this.mouse.grab === false) {
			grab = this.get_mouse_grab(x,y);
		}
		this.mouse = {
			x : x,
			y : y,
			grab : grab,
			state : state
		};
	},

	get_mouse_state: function(x, y) {
		x1 = this.rect.x1;
		x2 = this.rect.x2;
		y1 = this.rect.y1;
		y2 = this.rect.y2;
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

	get_mouse_grab: function(x, y) {
		x1 = this.rect.x1;
		y1 = this.rect.y1;
		return {
			x : x - x1,
			y : y - y1
		}
	},

	mouse_move : function(event) {
		if(this.mouse.state !== false) {
			this.build_mouse(event);
			if(this.mouse.state == 1) {
				this.dragger();
			}
			if(this.mouse.state == 2) {
				this.cropper();
			}
		}
		this.render();
		this.preview_crop();
	},

	mouse_down : function(event) {
		this.build_mouse(event);
		this.down = true;
		this.mouse.grab = false;
		this.mouse.state = 0;
	},

	mouse_up : function() {
		this.mouse.state = false;
		this.mouse.grab = false;
		this.down = false;
	}

}
