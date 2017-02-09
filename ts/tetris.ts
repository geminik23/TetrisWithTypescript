

module Tetris {
    

    interface IBlockDrawer {
        drawBlock(): void
    }

    interface IDrawElement {
        render(drawer:IBlockDrawer): void
    }



    class Shape implements IDrawElement {

        render(drawer: IBlockDrawer): void { }
    }



    class GridBoard implements IDrawElement {

        render(drawer: IBlockDrawer): void { }
    }




    enum GameState{Playing, Stopped }
    class GameController implements IDrawElement {
        
        _gameState: GameState = GameState.Stopped
        _board: GridBoard
        _shape: Shape
        

        

        render(drawer: IBlockDrawer): void { }
    }



    export class GameMain implements IBlockDrawer {
        private _ctx:CanvasRenderingContext2D

        constructor(canvasID: string) {
            let c = <HTMLCanvasElement>document.getElementById("myCanvas")
            this._ctx = c.getContext("2d")
            // register events
            document.onkeydown=this.onkeydown
        }

        onkeydown(key:KeyboardEvent){
            console.log(key.keyCode)
        }

        
        drawBlock(): void{
            this._ctx;
        }

    }

}

(function(){
    let data = new Tetris.GameMain("myCanvas");
    
})();