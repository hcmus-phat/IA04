import { useState } from 'react';

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button className={`square ${isWinning ? 'winning' : ''}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every((square) => square)) {
    status = 'Draw';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      {[0, 1, 2].map((row) => (
        <div key={row} className="board-row">
          {[0, 1, 2].map((col) => {
            const i = row * 3 + col;
            return (
              <Square
                key={i}
                value={squares[i]}
                onSquareClick={() => handleClick(i)}
                isWinning={winnerInfo && winnerInfo.line.includes(i)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), location: null },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares) {
    const prevSquares = history[currentMove].squares;
    let newLocation = null;
    for (let i = 0; i < nextSquares.length; i++) {
      if (prevSquares[i] !== nextSquares[i]) {
        newLocation = { row: Math.floor(i / 3), col: i % 3 };
        break;
      }
    }

    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, location: newLocation },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function handleSort() {
    setIsAscending(!isAscending);
  }

  const sortedHistory = isAscending ? history.slice() : history.slice().reverse();

  const moves = sortedHistory.map((entry, index) => {
    const move = isAscending ? index : history.length - 1 - index;
    const location = entry.location
      ? `(${entry.location.row}, ${entry.location.col})`
      : '';

    let description;
    if (move > 0) {
      description = `Go to move #${move} ${location}`;
    } else {
      description = 'Go to game start';
    }

    if (move === currentMove) {
      return (
        <li key={move}>
          You are at move #{move} {location}
        </li>
      );
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={handleSort}>
          {isAscending ? 'Sort Descending' : 'Sort Ascending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}
