/// <reference path="../framework/qunit.js" />
/// <reference path="../controllers/application.js" />
/// <reference path="../controllers/canvas.js" />

(function (app) {
    module("application");
    test("Application name has been set", function () {
        equals(app.name, "Wires - Logic Gates", "Application name is");
    });
})(application);