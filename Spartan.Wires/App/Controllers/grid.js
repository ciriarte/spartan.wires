(function (app) {
    app.GridController = function GridController(view) {
        function Cell(width, height) {
            this.width = width;
            this.height = height;
        }

        var _cell = new Cell(20, 20);
        var _view = view;

        _view.fill("#CCCCCC");
        _view.rect(0, 0, _view.width, _view.height);
        _view.stroke("#666666");
        _view.lineWidth(0.1);
        for (var i = _cell.height; i < _view.height; i = i + _cell.height) {
            _view.line(0, i, _view.width, i);
        }
        for (var j = _cell.width; j < _view.width; j = j + _cell.width) {
            _view.line(j, 0, j, _view.height);
        }
    }
})(application);