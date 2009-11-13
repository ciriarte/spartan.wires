(function (app) {
    app.CanvasController = function CanvasController(elem) {
        var view = new app.CanvasView(elem),
            grid = new app.GridController(view)
            wire = new app.WireController(view);
    }
})(application);