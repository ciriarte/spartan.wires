/// <reference path="../controllers/application.js" />

(function (app) {
    app.CanvasView = function CanvasView(elem) {

        var view = {};

        view.ctx = elem.getContext("2d");
        view.width = elem.width - 0;
        view.height = elem.height - 0;
        view.stroke = function strokeStyle(style) {
            view.ctx.strokeStyle = style;
        };
        view.fill = function fillStyle(style) {
            view.ctx.fillStyle = style;
        };
        view.lineWidth = function lineWidth(size) {
            view.ctx.lineWidth = size;
        };
        view.line = function line(x1, y1, x2, y2) {
            view.ctx.beginPath();
            view.ctx.moveTo(x1 || 0, y1 || 0);
            view.ctx.lineTo(x2 || 0, y2 || 0);
            view.ctx.stroke();
        };
        view.rect = function rect(x, y, width, height) {
            view.ctx.beginPath();
            view.ctx.fillRect(x, y, width, height);
        }
        view.arc = function arc(x, y, radius, startAngle, endAngle) {
            view.ctx.beginPath();
            view.ctx.arc(x, y, radius, startAngle, endAngle, false);
            view.ctx.fill();
            view.ctx.stroke();
        }
        view.bezier = function bezier(x1, y1, cp1x, cp1y, x2, y2, cp2x, cp2y) {
            view.ctx.beginPath();
            view.ctx.moveTo(x1, y1);
            view.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
            view.ctx.stroke();
        }

        view.cursor = function (mode) { document.body.style.cursor = mode; }

        // KeyCode table  
        view.CENTER = 88888880;
        view.CODED = 88888888;
        view.UP = 88888870;
        view.RIGHT = 88888871;
        view.DOWN = 88888872;
        view.LEFT = 88888869;

        //! // Description required...
        view.codedKeys = [69, 70, 71, 72];

        // Global vars for tracking mouse position
        view.pmouseX = 0;
        view.pmouseY = 0;
        view.mouseX = 0;
        view.mouseY = 0;
        view.mouseButton = 0;
        view.mouseDown = false;

        // Undefined event handlers to be replaced by user when needed
        view.mouseClicked = undefined;
        view.mouseDragged = undefined;
        view.mouseMoved = undefined;
        view.mousePressed = undefined;
        view.mouseReleased = undefined;
        view.keyPressed = undefined;
        view.keyReleased = undefined;

        //////////////////////////////////////////////////////////////////////////
        // Event handling
        //////////////////////////////////////////////////////////////////////////

        attach(elem, "mousemove", function (e) {

            var scrollX = window.scrollX != null ? window.scrollX : window.pageXOffset;
            var scrollY = window.scrollY != null ? window.scrollY : window.pageYOffset;

            view.pmouseX = view.mouseX;
            view.pmouseY = view.mouseY;
            view.mouseX = e.clientX - elem.offsetLeft + scrollX;
            view.mouseY = e.clientY - elem.offsetTop + scrollY;

            if (view.mouseMoved) { view.mouseMoved(); }
            if (view.mousePressed && view.mouseDragged) { view.mouseDragged(); }

        });

        attach(elem, "mouseout", function (e) { view.cursor("auto"); });

        attach(elem, "mousedown", function (e) {
            mousePressed = true;
            switch (e.which) {
                case 1: view.mouseButton = view.LEFT; break;
                case 2: view.mouseButton = view.CENTER; break;
                case 3: view.mouseButton = view.RIGHT; break;
            }
            view.mouseDown = true;
            if (typeof view.mousePressed == "function") { view.mousePressed(); }
            else { view.mousePressed = true; }
        });

        attach(elem, "contextmenu", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        attach(elem, "mouseup", function (e) {
            mousePressed = false;
            if (view.mouseClicked) { view.mouseClicked(); }
            if (typeof view.mousePressed != "function") { view.mousePressed = false; }
            if (view.mouseReleased) { view.mouseReleased(); }
        });

        attach(document, "keydown", function (e) {
            keyPressed = true;
            view.key = e.keyCode + 32;
            var i, len = view.codedKeys.length;
            for (i = 0; i < len; i++) {
                if (view.key == view.codedKeys[i]) {
                    switch (view.key) {
                        case 70: view.keyCode = view.UP; break;
                        case 71: view.keyCode = view.RIGHT; break;
                        case 72: view.keyCode = view.DOWN; break;
                        case 69: view.keyCode = view.LEFT; break;
                    }
                    view.key = view.CODED;
                }
            }
            if (e.shiftKey) { view.key = String.fromCharCode(view.key).toUpperCase().charCodeAt(0); }
            if (typeof view.keyPressed == "function") { view.keyPressed(); }
            else { view.keyPressed = true; }
        });

        attach(document, "keyup", function (e) {
            keyPressed = false;
            if (typeof view.keyPressed != "function") { view.keyPressed = false; }
            if (view.keyReleased) { view.keyReleased(); }
        });

        function attach(elem, type, fn) {
            if (elem.addEventListener) { elem.addEventListener(type, fn, false); }
            else { elem.attachEvent("on" + type, fn); }
        }

        return view;
    }
})(application);