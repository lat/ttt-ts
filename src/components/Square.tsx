import { useState } from 'react';
import './Square.css'

type Cell = number | 'X' | 'O';
type Board = Cell[][];

const OIcon = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
            id="SVGRepo_tracerCarrier"
        ></g>
        <g id="SVGRepo_iconCarrier">
            {" "}
            <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#000"
                strokeWidth="2"
            ></path>{" "}
        </g>
    </svg>
);

const XIcon = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
            id="SVGRepo_tracerCarrier"
        ></g>
        <g id="SVGRepo_iconCarrier">
            {" "}
            <path
                d="M19 5L5 19M5.00001 5L19 19"
                stroke="#000"
                strokeWidth="2"
            ></path>{" "}
        </g>
    </svg>
);


const Square = (props: {
    id: number,
    setGameOver: (gameOver: boolean) => void,
    gameOver: boolean,
    setGameState: React.Dispatch<React.SetStateAction<Board>>,
    currentPlayer: 'X' | 'O',
    setCurrentPlayer: React.Dispatch<React.SetStateAction<'X' | 'O'>>,
  }) => {
    const [icon, setIcon] = useState<React.ReactNode | null>(null);
    
    const clickOnSquare = () => {
        if(props.gameOver){
            return;
        }

      if (!icon) {
        if(props.currentPlayer === 'O'){
          setIcon(OIcon);
        }
        else{
          setIcon(XIcon);
        }
        const myCurrentPlayer = props.currentPlayer;
        props.setCurrentPlayer(props.currentPlayer === 'X' ? 'O' : 'X'); // Might be wrong
        props.setGameState((prevState: Board) => {
            let newState = prevState.map(row => [...row]);
            const rowIndex = Math.floor(props.id / 3);
            const colIndex = props.id % 3;
            newState[rowIndex][colIndex] = myCurrentPlayer; // Might cause problems
            return newState;
        });
      }
    }
    
    return (
      <div onClick={clickOnSquare} className={`square ${props.gameOver ? 'not-allowed' : ''}`}>{icon}</div>
    )
  }

export default Square