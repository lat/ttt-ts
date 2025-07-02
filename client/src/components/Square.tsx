import './Square.css'
import { Socket } from 'socket.io-client';

type Cell = number | 'X' | 'O';
type Board = Cell[][];

const OIcon = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#000"
        strokeWidth="2"
      ></path>
    </g>
  </svg>
);

const XIcon = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#000"
        strokeWidth="2"
      ></path>
    </g>
  </svg>
);

const Square = (props: {
  gameState: Board,
  id: number,
  setGameOver: (gameOver: boolean) => void,
  gameOver: boolean,
  setGameState: React.Dispatch<React.SetStateAction<Board>>,
  currentPlayer: 'X' | 'O',
  setCurrentPlayer: React.Dispatch<React.SetStateAction<'X' | 'O'>>,
  socket: Socket | null,
  currentElement: Cell,
  playerSymbol: 'X' | 'O',
}) => {
  
  const clickOnSquare = () => {
    // Check if it's the player's turn
    if(props.currentPlayer !== props.playerSymbol){
      return;
    }
    
    // Check if game is over
    if(props.gameOver){
      return;
    }
    
    // Check if cell is already taken
    if (typeof props.currentElement !== 'number') {
      return;
    }

    // Update local state immediately for responsive UI
    props.setGameState((prevState) => {
      let newState = prevState.map(row => [...row]);
      const rowIndex = Math.floor(props.id / 3);
      const colIndex = props.id % 3;
      newState[rowIndex][colIndex] = props.playerSymbol;
      return newState;
    });

    // Switch current player locally for immediate feedback
    props.setCurrentPlayer(props.playerSymbol === 'X' ? 'O' : 'X');

    // Send move to server
    props.socket?.emit("player-move-client", { 
      state: {
        id: props.id,
        sign: props.playerSymbol,
      }
    });
  }

  return (
    <div 
      onClick={clickOnSquare} 
      className={`square ${props.gameOver ? 'not-allowed' : ''} ${props.currentPlayer !== props.playerSymbol ? 'not-allowed' : ''}`}
    >
      {props.currentElement === 'O' ? OIcon : props.currentElement === 'X' ? XIcon : props.currentElement}
    </div>
  )
}

export default Square