/// <reference path="/Scripts/jquery-1.3.2-vsdoc.js" />
/// <reference path="/Scripts/jwires.core.js" />

(function () {
    jWires.drawGrid = function (cellWidth, cellHeight) {
        strokeStyle = "rgb(205,205,205)";
        fillStyle = "rgb(220,220,220)";
        fillRect(0, 0, width, height);
        for (var i = 0; i < width; i = i + cellWidth) {
            line(i, 0, i, height);
        }
        for (var j = 0; j < height; j = j + cellHeight) {
            line(0, j, width, j);
        }
    }
})();