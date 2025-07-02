import React, { useEffect, useState } from 'react'
import './App.css';
import Square from './components/Square';

type Cell = number | 'X' | 'O';
type Board = Cell[][];

const renderBoard: Board = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

const App = () => {

  const [gameState, setGameState] = useState<Board>(renderBoard);
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [playOnline, setPlayOnline] = useState<boolean>(false);

  const checkWin = (): string | number | null => {
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        return gameState[row][0];
      }
    }
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        return gameState[0][col];
      }
    }
    if(gameState[0][0] === gameState[1][1] && gameState[1][1] === gameState[2][2]){
      return gameState[0][0]
    }
    if(gameState[0][2] === gameState[1][1] && gameState[1][1] === gameState[2][0]){
      return gameState[0][2];
    }

    const isDraw = gameState.flat().every((cell) => {
      if(cell === 'X' || cell === 'O')
        return true;
    });

    if(isDraw){
      return 'draw';
    }

    return null;
  }

  useEffect(() => {
    const winner = checkWin();
    if (winner) {
      console.log(winner);
      setGameOver(true);
    }
  }, [gameState]);

  return (
    <div className="main-continer">
      <div>

        <div className="move-detection">
          <div className="left">You</div>
          <div className="right">Opponent</div>
        </div>
        <h1 className="game-title outline">TTT</h1>
        <div className="square-container">
          {
            gameState.map((arr, rowIndex) =>
              arr.map((cell, colIndex) => {
                return <Square
                  setGameOver={setGameOver}
                  gameOver={gameOver}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState} key={rowIndex * 3 + colIndex} id={rowIndex * 3 + colIndex} />;
              })
            )
          }
        </div>
        {checkWin() === 'draw' ? <h3 className='game-over-text'>Draw</h3> : <h3 className='game-over-text'>{checkWin() ? checkWin() + ' won!' : ''}</h3>}
      </div>
    </div>
  )
}

export default App