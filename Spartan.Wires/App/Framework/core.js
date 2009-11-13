(function () {
    var Framework = window.Framework = {
        Application: function Application() {
            this.name = "Application";
            Application.prototype.run = undefined;
        },

        Controller: function Controller() {
            // Undefined event handlers to be replaced by user when needed
            this.init = undefined;
            this.name = undefined;
        },

        View: function View() {

        }
    }
})();
