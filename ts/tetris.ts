

module Tetris {
    export let FrameRate: number = 60;

    interface IBlockDrawer { drawBlock(posx: number, posy: number, color: string): void }
    interface IDrawElement { render(drawer: IBlockDrawer): void }

    enum Commands {
        MoveDown, MoveLeft, MoveRight,
        Drop, // Space
        Rotate, // Arrow-UP
        Start, // Enter
        End, // Esc
        Nothing
    }

    class Shape implements IDrawElement {
        /** static members */
        static NumberOfTypes = 7;
        static InitialYPosition = 1;
        static Colours: string[]
        = ['#00ffff',
            '#0000ff',
            '#ffa500',
            '#ffff00',
            '#00ff00',
            '#800080',
            '#ff0000'];

        static ShapeCoords: number[][][] = [
            [[0, 0, 2, 0, 1, 0, -1, 0], [0, 0, 0, 1, 0, -1, 0, 2], [0, 0, 2, 0, 1, 0, -1, 0], [0, 0, 0, 1, 0, -1, 0, 2]], //I
            [[0, 0, -1, 0, 1, 0, -1, -1], [0, 0, 0, -1, 0, 1, -1, 1], [0, 0, -1, 0, 1, 0, 1, 1], [0, 0, 0, -1, 0, 1, 1, -1]], //J
            [[0, 0, 1, 0, -1, 0, 1, -1], [0, 0, 0, 1, 0, -1, -1, -1], [0, 0, 1, 0, -1, 0, -1, 1], [0, 0, 0, -1, 0, 1, 1, 1]], //L
            [[0, 0, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1]], //O
            [[0, 0, -1, 0, 0, -1, 1, -1], [0, 0, 0, 1, -1, 0, -1, -1], [0, 0, -1, 0, 0, -1, 1, -1], [0, 0, 0, 1, -1, 0, -1, -1]], //S
            [[0, 0, -1, 0, 1, 0, 0, 1], [0, 0, 0, -1, 0, 1, 1, 0], [0, 0, -1, 0, 1, 0, 0, -1], [0, 0, -1, 0, 0, -1, 0, 1]], //T
            [[0, 0, -1, -1, 0, -1, 1, 0], [0, 0, -1, 0, -1, 1, 0, -1], [0, 0, -1, -1, 0, -1, 1, 0], [0, 0, -1, 0, -1, 1, 0, -1]] //Z
        ];

        private static nextType(): number { return Math.floor(Math.random() * Shape.NumberOfTypes) }


        private _shape: number
        private _rotation: number
        private _pos: number[] = [0, 0]

        constructor(posx: number) {
            this._rotation = 0
            this._shape = Shape.nextType()
            this._pos[0] = posx
            this._pos[1] = Shape.InitialYPosition
        }

        get coordinates(): number[] { return Shape.ShapeCoords[this._shape][this._rotation] }
        get nextCoordinates(): number[] {
            return Shape.ShapeCoords[this._shape][(this._rotation + 1) % 4]
        }
        get position(): number[] { return this._pos }
        get positionX(): number { return this._pos[0] }
        get positionY(): number { return this._pos[1] }
        get colour(): string { return Shape.Colours[this._shape] }

        moveLeft() { this._pos[0] -= 1; }
        moveRight() { this._pos[0] += 1; }
        moveDown(amount: number = 1) { this._pos[1] += amount; }
        rotate() { this._rotation = (++this._rotation) % 4 }


        render(drawer: IBlockDrawer): void {
            for (let i = 0; i < 4; ++i) {
                drawer.drawBlock(Shape.ShapeCoords[this._shape][this._rotation][i * 2] + this._pos[0],
                    Shape.ShapeCoords[this._shape][this._rotation][i * 2 + 1] + this._pos[1], this.colour)
            }
        }
    }


    class GridBoard implements IDrawElement {
        static EMPTY: string = ' '
        static WALL: string = '#'

        private _grid: string[][]
        private _blockSize: number[] = [0, 0]

        initialize(w: number, h: number): void {
            this._grid = new Array(h + 2)

            for (let i = 0; i < h + 2; ++i)
                this._grid[i] = new Array(w + 2)

            this._blockSize[0] = w
            this._blockSize[1] = h
            this.reset()
        }

        get width(): number { return this._blockSize[0] }
        get height(): number { return this._blockSize[1] }

        freezeShape(coords: number[], pos: number[], colour: string) {
            let i: number, cx: number, cy: number, t: number
            for (i = 0; i < 4; ++i)
                this._grid[coords[i * 2 + 1] + pos[1] + 1][coords[i * 2] + pos[0] + 1] = colour

            // check rows
            for (cy = 1; cy < this._blockSize[1] + 1; ++cy) {
                for (cx = 1; cx < this._blockSize[0] + 1; ++cx)
                    if (this._grid[cy][cx] == ' ') break; // if empty then break

                if (cx == this._blockSize[0] + 1) { // remove filled row
                    for (t = cy; t > 1; --t)  //move row content
                        for (cx = 1; cx < this._blockSize[0] + 1; ++cx)
                            this._grid[t][cx] = this._grid[t - 1][cx];
                }
            }
        }

        isBlocked(coords: number[], pos: number[]): boolean {
            let retval: boolean = false
            let px: number, py: number
            for (let i = 0; i < 4; ++i) {
                px = coords[i * 2] + pos[0] + 1;
                py = coords[i * 2 + 1] + pos[1] + 1;

                if (px < 1 || px >= (this._blockSize[0] + 1) || // check range
                    py < 1 || py >= (this._blockSize[1] + 1) || // check range
                    (this._grid && this._grid[py][px] != ' ')) { // check is wall
                    retval = true;
                    break;
                }
            }
            return retval
        }

        reset(): void {
            let i: number = 0
            let w = this._blockSize[0] + 2
            let h = this._blockSize[1] + 2
            for (i = 0; i < h; ++i)
                for (let j = 0; j < w; ++j)
                    this._grid[i][j] = GridBoard.EMPTY

            for (i = 0; i < w; ++i) this._grid[h - 1][i] = GridBoard.WALL
            for (i = 0; i < h; ++i) this._grid[i][0] = this._grid[i][w - 1] = GridBoard.WALL
        }


        render(drawer: IBlockDrawer): void {
            for (let i = 0; i < this._blockSize[1]; ++i)
                for (let j = 0; j < this._blockSize[0]; ++j)
                    drawer.drawBlock(j, i, (this._grid[i + 1][j + 1] != ' ') ? this._grid[i + 1][j + 1] : '#888888');
        }
    }


    enum GameState { Playing, Stopped }
    class GameController implements IDrawElement {

        private _gameState: GameState = GameState.Stopped
        private _board: GridBoard
        private _shape: Shape
        private _commands: Commands[] = []

        constructor(width: number, height: number) {
            this._board = new GridBoard();
            this._board.initialize(width, height)
            this._shape = null
        }

        /** getter */
        get isPlaying(): boolean { return (this._gameState == GameState.Playing) }

        reset() {
            this._board.reset()
            this.newShape()
            this._commands = []
        }

        start() {
            this.reset()
            this._gameState = GameState.Playing
        }

        stop() {
            this._gameState = GameState.Stopped
        }


        newShape(): boolean {
            this._shape = new Shape(this._board.width / 2)
            return !this._board.isBlocked(this._shape.coordinates, this._shape.position)
        }

        update() {
            while (this._commands.length != 0) {
                let c = this._commands
                this._commands = []
                c.forEach(this.keyCommand, this)
            }
        }
        render(drawer: IBlockDrawer): void {
            this._board.render(drawer)
            this._shape.render(drawer)
        }

        pushCommand(cmd: Commands) {
            this._commands.push(cmd)
        }

        keyCommand(cmd: Commands) {
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
                    let dy = 1;
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
        }



        private freezeShape() {
            this._board.freezeShape(this._shape.coordinates, this._shape.position, this._shape.colour)
            // this.newShape()
            if (!this.newShape()) this.stop()
        }

        moveDown() {
            if (this._board.isBlocked(this._shape.coordinates, this._shape.position))
                this.freezeShape()
            else
                this._shape.moveDown()

        }


    }



    export class GameMain implements IBlockDrawer {
        static BlockCount: number[] = [10, 20]

        private _ctx: CanvasRenderingContext2D
        private _game: GameController
        private _lastTime: number
        private _eachSize: number
        private _xoffset: number
        private _dropInterval = Math.floor(1000 / 1.5)


        constructor(canvasID: string) {
            let c = <HTMLCanvasElement>document.getElementById("myCanvas")

            this._ctx = c.getContext("2d")


            // register events
            // let that = this
            // document.onkeydown = (key: KeyboardEvent) => {
            //     that.onkeydown(key)
            // }

            /** alternative way */
            document.onkeydown = this.onkeydown.bind(this)
        }

        initWith(size: number[]) {
            this._ctx.canvas.width = size[0]
            this._ctx.canvas.height = size[1]
            this._game = new GameController(GameMain.BlockCount[0], GameMain.BlockCount[1])
            this._eachSize = size[1] / GameMain.BlockCount[1]
            this._xoffset = (size[0] - (GameMain.BlockCount[0] * this._eachSize)) / 2
        }


        private render() {
            this._ctx.fillStyle = '#ffffff'
            this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height)
            this._game.render(this)
        }

        private static _startTxt = 'Start : Enter'
        private stopScreen() {
            this._ctx.fillStyle = '#000000'
            this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height)
            this._ctx.fillStyle = '#AAAAAA'
            this._ctx.font = 'italic 40pt Calibri'
            let size = this._ctx.measureText(GameMain._startTxt);
            this._ctx.fillText(GameMain._startTxt, (this._ctx.canvas.width - size.width) / 2, this._ctx.canvas.height * 1 / 3)
        }
        draw() {
            if (!this._game.isPlaying) {
                this.stopScreen()
                return
            }

            let now = this.currentMilliseconds()
            if ((now - this._lastTime) >= this._dropInterval) {
                this._game.moveDown()
                this._lastTime += this._dropInterval
            }

            this._game.update() //commands
            this.render()
        }

        drawBlock(posx: number, posy: number, color: string): void {
            this._ctx.fillStyle = color
            this._ctx.fillRect(this._xoffset + posx * this._eachSize,
                posy * this._eachSize, this._eachSize, this._eachSize)

            this._ctx.strokeStyle = 'black'
            this._ctx.strokeRect(this._xoffset + posx * this._eachSize,
                posy * this._eachSize, this._eachSize, this._eachSize)
        }

        private currentMilliseconds(): number { return Date.now() }


        onkeydown(key: KeyboardEvent) {
            let cmd = Commands.Nothing
            switch (key.keyCode) {
                case 81: // 'q'
                    this._game.stop()
                    break;
                case 32: // space
                    if (this._game.isPlaying) cmd = Commands.Drop;
                    break;
                case 13: // enter
                    if (!this._game.isPlaying) {
                        this._lastTime = this.currentMilliseconds()
                        this._game.start()
                    }
                    break;
                case 39: //right
                    if (this._game.isPlaying) cmd = Commands.MoveRight;
                    break;
                case 37: //left
                    if (this._game.isPlaying) cmd = Commands.MoveLeft;
                    break;
                case 38: //up
                    if (this._game.isPlaying) cmd = Commands.Rotate;
                    break;
                case 40: //down
                    if (this._game.isPlaying) cmd = Commands.MoveDown;
                    break;
            }
            if (cmd != Commands.Nothing) this._game.pushCommand(cmd)
        }
    }

}/**module Tetris*/

(function () {


    let game = new Tetris.GameMain("myCanvas");
    window.onload = () => {
        let v = Math.floor(Math.min(window.innerWidth, window.innerHeight)) - 20;
        game.initWith([v, v])

        let __last: number = Date.now();

        function app_checking(time) {
            let dt = (1000.0 / Tetris.FrameRate)
            if ((Date.now() - __last) >= dt) {
                game.draw()
                __last += dt;
            }
            window.requestAnimationFrame(app_checking);
        }
        window.requestAnimationFrame(app_checking);
    }
})()