import React, { useEffect, useState } from 'react'
import './App.css';
import Square from './components/Square';
import { io } from 'socket.io-client';
import type { Socket } from "socket.io-client";

const URL = "http://localhost:3000";

type Cell = number | 'X' | 'O';
type Board = Cell[][];

const renderBoard: Board = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

const App = () => {

  const [gameState, setGameState] = useState<Board>(renderBoard);
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [playOnline, setPlayOnline] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const checkWin = (board: Board): string | number | null => {
    // Check rows
    for (let row = 0; row < board.length; row++) {
      if (
        board[row][0] === board[row][1] &&
        board[row][1] === board[row][2] &&
        (board[row][0] === 'X' || board[row][0] === 'O')
      ) {
        return board[row][0];
      }
    }
    
    // Check columns
    for (let col = 0; col < board.length; col++) {
      if (
        board[0][col] === board[1][col] &&
        board[1][col] === board[2][col] &&
        (board[0][col] === 'X' || board[0][col] === 'O')
      ) {
        return board[0][col];
      }
    }
    
    // Check diagonals
    if(board[0][0] === board[1][1] && board[1][1] === board[2][2] && (board[0][0] === 'X' || board[0][0] === 'O')){
      return board[0][0]
    }
    if(board[0][2] === board[1][1] && board[1][1] === board[2][0] && (board[0][2] === 'X' || board[0][2] === 'O')){
      return board[0][2];
    }

    // Check for draw
    const isDraw = board.flat().every((cell) => {
      return cell === 'X' || cell === 'O';
    });

    if(isDraw){
      return 'draw';
    }

    return null;
  }

  // Remove the useEffect that was causing race conditions
  // Winner checking will now be handled by the server

  const takePlayerName = () => {
    const playerName = prompt("Enter your name");
    if(playerName){
      socket?.emit("playerName", playerName);
      return playerName;
    }
  }

  socket?.on("player-move-server", (data) => {
    if (data.state) {
      const id = data.state.id;
      setGameState((prevState) => {
        let newState = prevState.map(row => [...row]);
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newState[rowIndex][colIndex] = data.state.sign;
        return newState;
      });
      setCurrentPlayer(data.state.sign === 'X' ? 'O' : 'X');
    }
  });

  // Add listener for game over events from server
  socket?.on("game-over", (data) => {
    setGameOver(true);
    setWinner(data.winner);
  });

  socket?.on("connect", () => {
    setPlayOnline(true);
  });

  socket?.on("opponent_not_found", () => {
    setOpponentName(null);
  });

  socket?.on("opponent_found", (data) => {
    setPlayerSymbol(data.playerSymbol);
    setOpponentName(data.opponentName);
  });

  const playOnlineClick = () => {
    const playerName = takePlayerName();
    console.log(playerName);

    if (!playerName) {
      return;
    }

    setPlayerName(playerName);

    const newSocket = io(URL, {
      autoConnect: true
    });

    newSocket?.emit("request_to_play", {
      playerName: playerName
    });

    setSocket(newSocket);
  }

  if(!playOnline){
    return <div className="main-screen">
      <button className="play-online-button" onClick={playOnlineClick}>Play Online</button>
    </div>
  }

  if(playOnline && !opponentName){
    return <div className="main-screen">
      <h1>Waiting for opponent...</h1>
    </div>
  }
  
  return (
    <div className="main-continer">
      <div>
        <div className="move-detection">
          <div className={`left ${currentPlayer === playerSymbol ? "current-move-O" : "current-move-X"}`}>{playerName}</div>
          <div className={`right ${currentPlayer === playerSymbol ? "current-move-X" : "current-move-O"}`}>{opponentName}</div>
        </div>
        <h1 className="game-title outline">TTT</h1>
        <div className="square-container">
          {
            playerSymbol && gameState.map((arr, rowIndex) =>
              arr.map((cell, colIndex) => {
                return <Square
                  gameState={gameState}
                  socket={socket}
                  playerSymbol={playerSymbol}
                  setGameOver={setGameOver}
                  gameOver={gameOver}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState} 
                  key={rowIndex * 3 + colIndex} 
                  id={rowIndex * 3 + colIndex} 
                  currentElement={cell}
                />;
              })
            )
          }
        </div>
        {winner === 'draw' ? <h3 className='game-over-text'>Draw</h3> : <h3 className='game-over-text'>{winner ? winner + ' won!' : ''}</h3>}
      </div>
    </div>
  )
}

export default App