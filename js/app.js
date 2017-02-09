var Tetris;
(function (Tetris) {
    Tetris.FrameRate = 60;
    var Commands;
    (function (Commands) {
        Commands[Commands["MoveDown"] = 0] = "MoveDown";
        Commands[Commands["MoveLeft"] = 1] = "MoveLeft";
        Commands[Commands["MoveRight"] = 2] = "MoveRight";
        Commands[Commands["Drop"] = 3] = "Drop";
        Commands[Commands["Rotate"] = 4] = "Rotate";
        Commands[Commands["Start"] = 5] = "Start";
        Commands[Commands["End"] = 6] = "End";
        Commands[Commands["Nothing"] = 7] = "Nothing";
    })(Commands || (Commands = {}));
    var Shape = (function () {
        function Shape(posx) {
            this._pos = [0, 0];
            this._rotation = 0;
            this._shape = Shape.nextType();
            this._pos[0] = posx;
            this._pos[1] = Shape.InitialYPosition;
        }
        Shape.nextType = function () { return Math.floor(Math.random() * Shape.NumberOfTypes); };
        Object.defineProperty(Shape.prototype, "coordinates", {
            get: function () { return Shape.ShapeCoords[this._shape][this._rotation]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "nextCoordinates", {
            get: function () {
                return Shape.ShapeCoords[this._shape][(this._rotation + 1) % 4];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "position", {
            get: function () { return this._pos; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "positionX", {
            get: function () { return this._pos[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "positionY", {
            get: function () { return this._pos[1]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "colour", {
            get: function () { return Shape.Colours[this._shape]; },
            enumerable: true,
            configurable: true
        });
        Shape.prototype.moveLeft = function () { this._pos[0] -= 1; };
        Shape.prototype.moveRight = function () { this._pos[0] += 1; };
        Shape.prototype.moveDown = function (amount) {
            if (amount === void 0) { amount = 1; }
            this._pos[1] += amount;
        };
        Shape.prototype.rotate = function () { this._rotation = (++this._rotation) % 4; };
        Shape.prototype.render = function (drawer) {
            for (var i = 0; i < 4; ++i) {
                drawer.drawBlock(Shape.ShapeCoords[this._shape][this._rotation][i * 2] + this._pos[0], Shape.ShapeCoords[this._shape][this._rotation][i * 2 + 1] + this._pos[1], this.colour);
            }
        };
        return Shape;
    }());
    /** static members */
    Shape.NumberOfTypes = 7;
    Shape.InitialYPosition = 1;
    Shape.Colours = ['#00ffff',
        '#0000ff',
        '#ffa500',
        '#ffff00',
        '#00ff00',
        '#800080',
        '#ff0000'];
    Shape.ShapeCoords = [
        [[0, 0, 2, 0, 1, 0, -1, 0], [0, 0, 0, 1, 0, -1, 0, 2], [0, 0, 2, 0, 1, 0, -1, 0], [0, 0, 0, 1, 0, -1, 0, 2]],
        [[0, 0, -1, 0, 1, 0, -1, -1], [0, 0, 0, -1, 0, 1, -1, 1], [0, 0, -1, 0, 1, 0, 1, 1], [0, 0, 0, -1, 0, 1, 1, -1]],
        [[0, 0, 1, 0, -1, 0, 1, -1], [0, 0, 0, 1, 0, -1, -1, -1], [0, 0, 1, 0, -1, 0, -1, 1], [0, 0, 0, -1, 0, 1, 1, 1]],
        [[0, 0, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1]],
        [[0, 0, -1, 0, 0, -1, 1, -1], [0, 0, 0, 1, -1, 0, -1, -1], [0, 0, -1, 0, 0, -1, 1, -1], [0, 0, 0, 1, -1, 0, -1, -1]],
        [[0, 0, -1, 0, 1, 0, 0, 1], [0, 0, 0, -1, 0, 1, 1, 0], [0, 0, -1, 0, 1, 0, 0, -1], [0, 0, -1, 0, 0, -1, 0, 1]],
        [[0, 0, -1, -1, 0, -1, 1, 0], [0, 0, -1, 0, -1, 1, 0, -1], [0, 0, -1, -1, 0, -1, 1, 0], [0, 0, -1, 0, -1, 1, 0, -1]] //Z
    ];
    var GridBoard = (function () {
        function GridBoard() {
            this._blockSize = [0, 0];
        }
        GridBoard.prototype.initialize = function (w, h) {
            this._grid = new Array(h + 2);
            for (var i = 0; i < h + 2; ++i)
                this._grid[i] = new Array(w + 2);
            this._blockSize[0] = w;
            this._blockSize[1] = h;
            this.reset();
        };
        Object.defineProperty(GridBoard.prototype, "width", {
            get: function () { return this._blockSize[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GridBoard.prototype, "height", {
            get: function () { return this._blockSize[1]; },
            enumerable: true,
            configurable: true
        });
        GridBoard.prototype.freezeShape = function (coords, pos, colour) {
            var i, cx, cy, t;
            for (i = 0; i < 4; ++i)
                this._grid[coords[i * 2 + 1] + pos[1] + 1][coords[i * 2] + pos[0] + 1] = colour;
            // check rows
            for (cy = 1; cy < this._blockSize[1] + 1; ++cy) {
                for (cx = 1; cx < this._blockSize[0] + 1; ++cx)
                    if (this._grid[cy][cx] == ' ')
                        break; // if empty then break
                if (cx == this._blockSize[0] + 1) {
                    for (t = cy; t > 1; --t)
                        for (cx = 1; cx < this._blockSize[0] + 1; ++cx)
                            this._grid[t][cx] = this._grid[t - 1][cx];
                }
            }
        };
        GridBoard.prototype.isBlocked = function (coords, pos) {
            var retval = false;
            var px, py;
            for (var i = 0; i < 4; ++i) {
                px = coords[i * 2] + pos[0] + 1;
                py = coords[i * 2 + 1] + pos[1] + 1;
                if (px < 1 || px >= (this._blockSize[0] + 1) ||
                    py < 1 || py >= (this._blockSize[1] + 1) ||
                    (this._grid && this._grid[py][px] != ' ')) {
                    retval = true;
                    break;
                }
            }
            return retval;
        };
        GridBoard.prototype.reset = function () {
            var i = 0;
            var w = this._blockSize[0] + 2;
            var h = this._blockSize[1] + 2;
            for (i = 0; i < h; ++i)
                for (var j = 0; j < w; ++j)
                    this._grid[i][j] = GridBoard.EMPTY;
            for (i = 0; i < w; ++i)
                this._grid[h - 1][i] = GridBoard.WALL;
            for (i = 0; i < h; ++i)
                this._grid[i][0] = this._grid[i][w - 1] = GridBoard.WALL;
        };
        GridBoard.prototype.render = function (drawer) {
            for (var i = 0; i < this._blockSize[1]; ++i)
                for (var j = 0; j < this._blockSize[0]; ++j)
                    drawer.drawBlock(j, i, (this._grid[i + 1][j + 1] != ' ') ? this._grid[i + 1][j + 1] : '#888888');
        };
        return GridBoard;
    }());
    GridBoard.EMPTY = ' ';
    GridBoard.WALL = '#';
    var GameState;
    (function (GameState) {
        GameState[GameState["Playing"] = 0] = "Playing";
        GameState[GameState["Stopped"] = 1] = "Stopped";
    })(GameState || (GameState = {}));
    var GameController = (function () {
        function GameController(width, height) {
            this._gameState = GameState.Stopped;
            this._commands = [];
            this._board = new GridBoard();
            this._board.initialize(width, height);
            this._shape = null;
        }
        Object.defineProperty(GameController.prototype, "isPlaying", {
            /** getter */
            get: function () { return (this._gameState == GameState.Playing); },
            enumerable: true,
            configurable: true
        });
        GameController.prototype.reset = function () {
            this._board.reset();
            this.newShape();
            this._commands = [];
        };
        GameController.prototype.start = function () {
            this.reset();
            this._gameState = GameState.Playing;
        };
        GameController.prototype.stop = function () {
            this._gameState = GameState.Stopped;
        };
        GameController.prototype.newShape = function () {
            this._shape = new Shape(this._board.width / 2);
            return !this._board.isBlocked(this._shape.coordinates, this._shape.position);
        };
        GameController.prototype.update = function () {
            while (this._commands.length != 0) {
                var c = this._commands;
                this._commands = [];
                c.forEach(this.keyCommand, this);
            }
        };
        GameController.prototype.render = function (drawer) {
            this._board.render(drawer);
            this._shape.render(drawer);
        };
        GameController.prototype.pushCommand = function (cmd) {
            this._commands.push(cmd);
        };
        GameController.prototype.keyCommand = function (cmd) {
            switch (cmd) {
                case Commands.MoveDown:
                    this.moveDown();
                    break;
                case Commands.MoveLeft:
                    if (!this._board.isBlocked(this._shape.coordinates, [this._shape.positionX - 1, this._shape.positionY]))
                        this._shape.moveLeft();
                    break;
                case Commands.MoveRight:
                    if (!this._board.isBlocked(this._shape.coordinates, [this._shape.positionX + 1, this._shape.positionY]))
                        this._shape.moveRight();
                    break;
                case Commands.Drop:
                    var dy = 1;
                    while (!this._board.isBlocked(this._shape.coordinates, [this._shape.positionX, this._shape.positionY + (dy++)])) { }
                    dy -= 2;
                    this._shape.moveDown(dy);
                    this.freezeShape();
                    break;
                case Commands.Rotate:
                    if (!this._board.isBlocked(this._shape.nextCoordinates, this._shape.position))
                        this._shape.rotate();
                    break;
            }
        };
        GameController.prototype.freezeShape = function () {
            this._board.freezeShape(this._shape.coordinates, this._shape.position, this._shape.colour);
            // this.newShape()
            if (!this.newShape())
                this.stop();
        };
        GameController.prototype.moveDown = function () {
            if (this._board.isBlocked(this._shape.coordinates, this._shape.position))
                this.freezeShape();
            else
                this._shape.moveDown();
        };
        return GameController;
    }());
    var GameMain = (function () {
        function GameMain(canvasID) {
            this._dropInterval = Math.floor(1000 / 1.5);
            var c = document.getElementById("myCanvas");
            var that = this;
            this._ctx = c.getContext("2d");
            // register events
            document.onkeydown = function (key) {
                that.onkeydown(key);
            };
        }
        GameMain.prototype.initWith = function (size) {
            this._ctx.canvas.width = size[0];
            this._ctx.canvas.height = size[1];
            this._game = new GameController(GameMain.BlockCount[0], GameMain.BlockCount[1]);
            this._eachSize = size[1] / GameMain.BlockCount[1];
            this._xoffset = (size[0] - (GameMain.BlockCount[0] * this._eachSize)) / 2;
        };
        GameMain.prototype.render = function () {
            this._ctx.fillStyle = '#ffffff';
            this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
            this._game.render(this);
        };
        GameMain.prototype.stopScreen = function () {
            this._ctx.fillStyle = '#000000';
            this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
            this._ctx.fillStyle = '#AAAAAA';
            this._ctx.font = 'italic 40pt Calibri';
            var size = this._ctx.measureText(GameMain._startTxt);
            this._ctx.fillText(GameMain._startTxt, (this._ctx.canvas.width - size.width) / 2, this._ctx.canvas.height * 1 / 3);
        };
        GameMain.prototype.draw = function () {
            if (!this._game.isPlaying) {
                this.stopScreen();
                return;
            }
            var now = this.currentMilliseconds();
            if ((now - this._lastTime) >= this._dropInterval) {
                this._game.moveDown();
                this._lastTime += this._dropInterval;
            }
            this._game.update(); //commands
            this.render();
        };
        GameMain.prototype.drawBlock = function (posx, posy, color) {
            this._ctx.fillStyle = color;
            this._ctx.fillRect(this._xoffset + posx * this._eachSize, posy * this._eachSize, this._eachSize, this._eachSize);
            this._ctx.strokeStyle = 'black';
            this._ctx.strokeRect(this._xoffset + posx * this._eachSize, posy * this._eachSize, this._eachSize, this._eachSize);
        };
        GameMain.prototype.currentMilliseconds = function () { return Date.now(); };
        GameMain.prototype.onkeydown = function (key) {
            var cmd = Commands.Nothing;
            switch (key.keyCode) {
                case 81:
                    this._game.stop();
                    break;
                case 32:
                    if (this._game.isPlaying)
                        cmd = Commands.Drop;
                    break;
                case 13:
                    if (!this._game.isPlaying) {
                        this._lastTime = this.currentMilliseconds();
                        this._game.start();
                    }
                    break;
                case 39:
                    if (this._game.isPlaying)
                        cmd = Commands.MoveRight;
                    break;
                case 37:
                    if (this._game.isPlaying)
                        cmd = Commands.MoveLeft;
                    break;
                case 38:
                    if (this._game.isPlaying)
                        cmd = Commands.Rotate;
                    break;
                case 40:
                    if (this._game.isPlaying)
                        cmd = Commands.MoveDown;
                    break;
            }
            if (cmd != Commands.Nothing)
                this._game.pushCommand(cmd);
        };
        return GameMain;
    }());
    GameMain.BlockCount = [10, 20];
    GameMain._startTxt = 'Start : Enter';
    Tetris.GameMain = GameMain;
})(Tetris || (Tetris = {})); /**module Tetris*/
(function () {
    var game = new Tetris.GameMain("myCanvas");
    window.onload = function () {
        var v = Math.floor(Math.min(window.innerWidth, window.innerHeight)) - 20;
        game.initWith([v, v]);
        var __last = Date.now();
        function app_checking(time) {
            var dt = (1000.0 / Tetris.FrameRate);
            if ((Date.now() - __last) >= dt) {
                game.draw();
                __last += dt;
            }
            window.requestAnimationFrame(app_checking);
        }
        window.requestAnimationFrame(app_checking);
    };
})();
//# sourceMappingURL=app.js.map