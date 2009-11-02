/// <reference path="/Scripts/jwires.core-tests.js" />

function unitTests(jW, canvas) {
    test("jWires name", function () {
        equals(jW.name, "jWires Instance", "The name property was set properly")
    });
    test("jWires size", function () {
        equals(jW.width, canvas.width, "The width is the same");
        equals(jW.height, canvas.height, "The width is the same");
    });
};