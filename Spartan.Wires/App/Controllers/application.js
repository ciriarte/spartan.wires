/// <reference path="../framework/core.js" />

(function () {
    var application = window.application = new Framework.Application();
    application.name = "Wires - Logic Gates";

    application.run = function () {
    application.controllers =
        {
            canvas: new application.CanvasController(document.getElementById("com-spartanprogramming-wires"))
        };

    application.repositories = {
        grid: {
            color: "#888888",
            width: 20,
            heigth: 20
        },
        wire: {
            jack: [
                { x: 100, y: 100, angle: Math.PI / 2 },
                { x: 300, y: 300, angle: 3 * Math.PI / 2 }
            ]
        }
    };
}
})();