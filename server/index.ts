import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type"],
    credentials: true
  },
});

interface Player {
  socket: Socket;
  online: boolean;
  playerName: string;
  playing: boolean;
  opponentId?: string;
}

interface GameRoom {
  players: [string, string]; // player socket IDs
  gameState: (number | 'X' | 'O')[][];
  currentPlayer: 'X' | 'O';
  gameOver: boolean;
}

const allPlayers: { [key: string]: Player } = {};
const gameRooms: { [roomId: string]: GameRoom } = {};

// Helper function to check win condition
const checkWin = (board: (number | 'X' | 'O')[][]): string | null => {
  // Check rows
  for (let row = 0; row < board.length; row++) {
    if (
      board[row][0] === board[row][1] &&
      board[row][1] === board[row][2] &&
      (board[row][0] === 'X' || board[row][0] === 'O')
    ) {
      return board[row][0] as string;
    }
  }
  
  // Check columns
  for (let col = 0; col < board.length; col++) {
    if (
      board[0][col] === board[1][col] &&
      board[1][col] === board[2][col] &&
      (board[0][col] === 'X' || board[0][col] === 'O')
    ) {
      return board[0][col] as string;
    }
  }
  
  // Check diagonals
  if(board[0][0] === board[1][1] && board[1][1] === board[2][2] && (board[0][0] === 'X' || board[0][0] === 'O')){
    return board[0][0] as string;
  }
  if(board[0][2] === board[1][1] && board[1][1] === board[2][0] && (board[0][2] === 'X' || board[0][2] === 'O')){
    return board[0][2] as string;
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

// Helper function to get room ID for a player
const getRoomId = (playerId: string): string | null => {
  for (const roomId in gameRooms) {
    if (gameRooms[roomId].players.includes(playerId)) {
      return roomId;
    }
  }
  return null;
}

io.on("connection", (socket) => {
  allPlayers[socket.id] = {
    socket: socket,
    online: true,
    playerName: "",
    playing: false
  }

  socket.on("player-move-client", (data) => {
    const currentPlayer = allPlayers[socket.id];
    const roomId = getRoomId(socket.id);
    
    if (!currentPlayer?.opponentId || !roomId) {
      return;
    }

    const gameRoom = gameRooms[roomId];
    const opponent = allPlayers[currentPlayer.opponentId];
    
    if (!opponent || !gameRoom || gameRoom.gameOver) {
      return;
    }

    // Update the server-side game state
    const { id, sign } = data.state;
    const rowIndex = Math.floor(id / 3);
    const colIndex = id % 3;
    
    // Validate the move
    if (gameRoom.gameState[rowIndex][colIndex] !== id + 1) {
      return; // Invalid move - cell already taken
    }

    // Update server game state
    gameRoom.gameState[rowIndex][colIndex] = sign;
    gameRoom.currentPlayer = sign === 'X' ? 'O' : 'X';

    // Send move to both players
    currentPlayer.socket.emit("player-move-server", data);
    opponent.socket.emit("player-move-server", data);

    // Check for win condition on server
    const winner = checkWin(gameRoom.gameState);
    if (winner) {
      gameRoom.gameOver = true;
      
      // Notify both players of game over
      currentPlayer.socket.emit("game-over", { winner });
      opponent.socket.emit("game-over", { winner });
      
      // Clean up
      currentPlayer.playing = false;
      opponent.playing = false;
      delete gameRooms[roomId];
    }
  });

  socket.on("request_to_play", (data) => {
    const currentPlayer = allPlayers[socket.id];
    currentPlayer.playerName = data.playerName;
    
    let opponentPlayer = null;
    for (const key in allPlayers) {
      const player = allPlayers[key];
      if(player.online && !player.playing && socket.id !== key){
        opponentPlayer = player;
        break;
      }
    }

    if(opponentPlayer){
      // Set up the connection between players
      currentPlayer.opponentId = opponentPlayer.socket.id;
      opponentPlayer.opponentId = currentPlayer.socket.id;
      currentPlayer.playing = true;
      opponentPlayer.playing = true;

      // Create a new game room
      const roomId = `${socket.id}-${opponentPlayer.socket.id}`;
      gameRooms[roomId] = {
        players: [socket.id, opponentPlayer.socket.id],
        gameState: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        currentPlayer: 'X',
        gameOver: false
      };

      opponentPlayer.socket.emit("opponent_found", {
        opponentName: currentPlayer.playerName,
        playerSymbol: "X"
      });
      
      currentPlayer.socket.emit("opponent_found", {
        opponentName: opponentPlayer.playerName,
        playerSymbol: "O"
      });
    } else {
      currentPlayer.socket.emit("opponent_not_found");
    }
  });

  socket.on("disconnect", () => {
    const player = allPlayers[socket.id];
    if (player?.opponentId) {
      // Notify opponent of disconnect
      const opponent = allPlayers[player.opponentId];
      if (opponent) {
        opponent.socket.emit("opponent_disconnected");
        opponent.playing = false;
        opponent.opponentId = undefined;
      }
      
      // Clean up game room
      const roomId = getRoomId(socket.id);
      if (roomId) {
        delete gameRooms[roomId];
      }
    }
    delete allPlayers[socket.id];
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on port 3000");
});