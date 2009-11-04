/// <reference path="/Scripts/jquery-1.3.2-vsdoc.js" />

(function () {
    var jWires = window.jWires = function (canvas) {
        jWires = buildjWires(canvas);

        var gDrawn = 0;
        function Grid(cellWidth, cellHeight) {
            var width = cellWidth;
            var height = cellWidth;
            this.draw = function (ctx) {
                ctx.strokeStyle = "rgb(205,205,205)";
                ctx.fillStyle = "rgb(220,220,220)";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                for (var i = 0; i < ctx.canvas.width; i = i + cellWidth) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, ctx.canvas.height);
                    ctx.stroke();
                }
                for (var j = 0; j < ctx.canvas.height; j = j + cellHeight) {
                    ctx.beginPath();
                    ctx.moveTo(0, j);
                    ctx.lineTo(ctx.canvas.width, j);
                    ctx.stroke();
                }
                console.log("Grid drawn:" + gDrawn++);
            };
        }

        function Jack(x, y) {
            this.x = x;
            this.y = y;
            this.draw = function (ctx) {
                console.log("Starting to draw jack @ (x: " + x + ", y: " + y + ")");
                ctx.strokeStyle = "rgb(0,0,0)";
                ctx.fillStyle = "rgb(255,255,255)";
                ctx.beginPath();
                ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, true);
                ctx.fill();
                ctx.stroke();
            };
        }

        function Wire(x, y, x2, y2) {
            var _jack1 = new Jack(x, y);
            var _jack2 = new Jack(x2, y2);

            this.Jack1 = function () { return _jack1; };
            this.Jack2 = function () { return _jack2; };
            this.draw = function (ctx) {
                ctx.strokeStyle = "rgb(0,0,0)";
                ctx.fillStyle = "rgb(255,255,255)";
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(_jack1.x, _jack1.y);
                ctx.bezierCurveTo(_jack1.x + 100, _jack1.y, _jack2.x - 100, _jack2.y, _jack2.x, _jack2.y);
                ctx.stroke();
                ctx.strokeStyle = "rgb(255,255,255)";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(_jack1.x, _jack1.y);
                ctx.bezierCurveTo(_jack1.x + 100, _jack1.y, _jack2.x - 100, _jack2.y, _jack2.x, _jack2.y);
                ctx.stroke();
                ctx.strokeStyle = "rgb(0,0,0)";
                ctx.lineWidth = 1;
                _jack1.draw(ctx);
                _jack2.draw(ctx);
            };
        }

        jWires.add(new Grid(20, 20));
        jWires.add(new Wire(100, 100, 300, 300));

        for (var control in jWires.controls) {
            jWires.controls[control].draw(jWires.ctx);
        }

        return jWires;
    };

    function buildjWires(canvas) {
        var w = {};

        if (!canvas) { canvas = document.getElementsByTagName("canvas")[0]; }

        var ctx = canvas.getContext("2d");

        w.ctx = canvas.getContext("2d");
        w.name = "jWires Instance";
        w.controls = [];
        w.width = canvas.width - 0;
        w.height = canvas.height - 0;
        w.stroke = function strokeStyle(style) {
            ctx.strokeStyle = style;
        };
        w.fill = function fillStyle(style) {
            ctx.fillStyle = style;
        };
        w.line = function line(x1, y1, x2, y2) {
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(x1 || 0, y1 || 0);
            ctx.lineTo(x2 || 0, y2 || 0);
            ctx.stroke();
            ctx.closePath();
        };

        w.add = function add(control) {
            w.controls.push(control);
        };

        w.cursor = function (mode) { document.body.style.cursor = mode; };

        w.dirty = 0;

        // KeyCode table  
        w.CENTER = 88888880;
        w.CODED = 88888888;
        w.UP = 88888870;
        w.RIGHT = 88888871;
        w.DOWN = 88888872;
        w.LEFT = 88888869;

        //! // Description required...
        w.codedKeys = [69, 70, 71, 72];

        // Global vars for tracking mouse position
        w.pmouseX = 0;
        w.pmouseY = 0;
        w.mouseX = 0;
        w.mouseY = 0;
        w.mouseButton = 0;
        w.mouseDown = false;

        // Undefined event handlers to be replaced by user when needed
        w.mouseClicked = undefined;
        w.mouseDragged = function (e) {
            console.log("Mouse is dragged (x: " + w.mouseX + ", y: " + w.mouseY + ")");
            w.controls[1].Jack2().x = w.mouseX;
            w.controls[1].Jack2().y = w.mouseY;
            for (var control in jWires.controls) {
                w.controls[control].draw(jWires.ctx);
            }
        };
        w.mouseMoved = undefined;
        w.mousePressed = undefined;
        w.mouseReleased = undefined;
        w.keyPressed = undefined;
        w.keyReleased = undefined;

        //////////////////////////////////////////////////////////////////////////
        // Event handling
        //////////////////////////////////////////////////////////////////////////

        attach(canvas, "mousemove", function (e) {

            var scrollX = window.scrollX !== null ? window.scrollX : window.pageXOffset;
            var scrollY = window.scrollY !== null ? window.scrollY : window.pageYOffset;

            w.pmouseX = w.mouseX;
            w.pmouseY = w.mouseY;
            w.mouseX = e.clientX - canvas.offsetLeft + scrollX;
            w.mouseY = e.clientY - canvas.offsetTop + scrollY;

            if (w.mouseMoved) { w.mouseMoved(); }
            if (w.mousePressed && w.mouseDragged) { w.mouseDragged(); }

        });

        attach(canvas, "mouseout", function (e) { w.cursor("auto"); });

        attach(canvas, "mousedown", function (e) {
            mousePressed = true;
            switch (e.which) {
                case 1: w.mouseButton = w.LEFT; break;
                case 2: w.mouseButton = w.CENTER; break;
                case 3: w.mouseButton = w.RIGHT; break;
            }
            w.mouseDown = true;
            if (typeof w.mousePressed == "function") { w.mousePressed(); }
            else { w.mousePressed = true; }
        });

        attach(canvas, "contextmenu", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        attach(canvas, "mouseup", function (e) {
            mousePressed = false;
            if (w.mouseClicked) { w.mouseClicked(); }
            if (typeof w.mousePressed != "function") { w.mousePressed = false; }
            if (w.mouseReleased) { w.mouseReleased(); }
        });

        attach(document, "keydown", function (e) {
            keyPressed = true;
            w.key = e.keyCode + 32;
            var i, len = w.codedKeys.length;
            for (i = 0; i < len; i++) {
                if (w.key == w.codedKeys[i]) {
                    switch (w.key) {
                        case 70: w.keyCode = w.UP; break;
                        case 71: w.keyCode = w.RIGHT; break;
                        case 72: w.keyCode = w.DOWN; break;
                        case 69: w.keyCode = w.LEFT; break;
                    }
                    w.key = w.CODED;
                }
            }
            if (e.shiftKey) { w.key = String.fromCharCode(w.key).toUpperCase().charCodeAt(0); }
            if (typeof w.keyPressed == "function") { w.keyPressed(); }
            else { w.keyPressed = true; }
        });

        attach(document, "keyup", function (e) {
            keyPressed = false;
            if (typeof w.keyPressed != "function") { w.keyPressed = false; }
            if (w.keyReleased) { w.keyReleased(); }
        });

        function attach(elem, type, fn) {
            if (elem.addEventListener) { elem.addEventListener(type, fn, false); }
            else { elem.attachEvent("on" + type, fn); }
        }

        return w;
    }
})();