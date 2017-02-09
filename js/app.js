var Tetris;
(function (Tetris) {
    var Colour = (function () {
        function Colour() {
        }
        return Colour;
    }());
    var Shape = (function () {
        function Shape() {
        }
        Shape.prototype.render = function (drawer) { };
        return Shape;
    }());
    var Grid = (function () {
        function Grid() {
        }
        Grid.prototype.render = function (drawer) { };
        return Grid;
    }());
    var GameController = (function () {
        function GameController() {
        }
        GameController.prototype.render = function (drawer) { };
        return GameController;
    }());
    var GameMain = (function () {
        function GameMain(canvasID) {
            var c = document.getElementById("myCanvas");
            this._ctx = c.getContext("2d");
            // register events
            document.onkeydown = this.onkeydown;
        }
        GameMain.prototype.onkeydown = function (key) {
            console.log(key.keyCode);
        };
        GameMain.prototype.drawBlock = function () {
            this._ctx;
        };
        return GameMain;
    }());
    Tetris.GameMain = GameMain;
})(Tetris || (Tetris = {}));
(function () {
    var data = new Tetris.GameMain("myCanvas");
})();
//# sourceMappingURL=app.js.map