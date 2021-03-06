﻿(function (app) {
    app.WireController = function WireController(view) {
        var _view = view,
            _self = this;

        function Jack(x, y) {
            var _self = this,
                _radius = 5;

            this.mouseIn = false;
            this.x = x;
            this.y = y;
            this.radius = _radius;

            this.draw = function draw() {
                _view.lineWidth = 1;
                if (!this.mouseIn) {
                    _view.fill("#ffffff");
                }
                else {
                    _view.fill("#0066BB");
                }
                _view.stroke("#000000");
                _view.arc(_self.x, _self.y, _radius, 0, 2 * Math.PI);
            }

            _view.mouseMoved = function () {
                if (Math.sqrt(Math.pow((this.mouseX - _self.x), 2) + Math.pow((this.mouseY - _self.y), 2)) < _self.radius) {
                    if (!_self.mouseIn) {
                        _self.mouseIn = true;
                        _self.draw();
                    }
                } else {
                    if (_self.mouseIn) {
                        _self.mouseIn = false;
                        _self.draw();
                    }
                }
            }
        }

        var _jack1 = new Jack(100, 100);
        var _jack2 = new Jack(300, 300);

        this.draw = function draw() {
            _view.fill("#ffffff");
            _view.stroke("#000000");
            _view.ctx.lineWidth = 8;
            _view.bezier(_jack1.x, _jack1.y,
                     _jack1.x + (_jack2.x - _jack1.x) / 2, _jack1.y,
                     _jack2.x, _jack2.y,
                     _jack2.x - (_jack2.x - _jack1.x) / 2, _jack2.y);
            _view.stroke("#ffffff");
            _view.ctx.lineWidth = 6;
            _view.bezier(_jack1.x, _jack1.y,
                     _jack1.x + (_jack2.x - _jack1.x) / 2, _jack1.y,
                     _jack2.x, _jack2.y,
                     _jack2.x - (_jack2.x - _jack1.x) / 2, _jack2.y);
            _view.stroke("#000000");
            _view.ctx.lineWidth = 1;

            _jack1.draw();
            _jack2.draw();
        }

        _view.mouseDragged = function () {
            if (Math.sqrt(Math.pow((this.mouseX - _jack2.x), 2) + Math.pow((this.mouseY - _jack2.y), 2)) < _jack2.radius) {
                _jack2.x = this.mouseX;
                _jack2.y = this.mouseY;
                _self.draw();
            }
        }

        _self.draw();
    }
})(application);