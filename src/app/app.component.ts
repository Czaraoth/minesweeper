import {Component, OnInit} from '@angular/core';

interface Cell {
  value: any;
  revealed: boolean;
  flagged: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  rows: number;
  columns: number;
  mines: number;
  board: Cell[][];
  gameOver: boolean;
  gameStarted: boolean;
  timeLeft: number;
  timerInterval: any;
  time:string;
  math = Math;
  win=false;
  constructor() {
    this.rows = 10;
    this.columns = 10;
    this.mines = 5;
    this.board = [];
    this.gameOver = false;
    this.gameStarted = false;
    this.timeLeft = 600;
    this.time="10:00";
  }

  ngOnInit() {
    this.startNewGame();
  }

  startNewGame(): void {
    this.timeLeft=600;
    this.time="10:00";
    this.board = [];
    this.gameOver = false;
    this.gameStarted = false;
    this.win=false;
    this.generateBoard();
  }

  generateBoard(): void {
    this.board = [];
    for (let i = 0; i < this.rows; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < this.columns; j++) {
        row.push({
          value: null,
          revealed: false,
          flagged: false
        });
      }
      this.board.push(row);
    }
  }


  placeMines(rowClicked: number, colClicked: number): void {
    let minesToPlace = this.mines;
    while (minesToPlace > 0) {
      const randomRow = Math.floor(Math.random() * this.rows);
      const randomColumn = Math.floor(Math.random() * this.columns);
      if (
        randomRow !== rowClicked ||
        randomColumn !== colClicked
      ) {
        if (this.board[randomRow][randomColumn].value !== -1) {
          this.board[randomRow][randomColumn].value = -1; // -1 reprezentuje minę
          minesToPlace--;
        }
      }
    }
  }
  calculateNeighborCounts(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (this.board[row][col].value !== -1) {
          this.board[row][col].value = this.countNeighborMines(row, col);
        }
      }
    }
  }

  countNeighborMines(row: number, col: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (
          newRow >= 0 &&
          newRow < this.rows &&
          newCol >= 0 &&
          newCol < this.columns &&
          this.board[newRow][newCol].value === -1
        ) {
          count++;
        }
      }
    }
    return count;
  }
  revealCell(row: number, col: number): void {
    if (this.gameOver) {
      return;
    }
    const cell = this.board[row][col];
    if (!this.gameStarted) {
      this.startTimer();
      this.placeMines(row, col);
      this.calculateNeighborCounts();
      this.gameStarted = true;
    }
    if (!cell.revealed) {
      cell.revealed = true;

      if (cell.value === -1) {
        this.gameOver = true;
        clearInterval(this.timerInterval);
        this.showRemainingMines();
        alert("You Lose. Try Again Fool!")
      } else if (cell.value === 0) {
        this.revealEmptyNeighbors(row, col);
      }
    }
    if (this.checkWinCondition() && !this.gameOver) {
      clearInterval(this.timerInterval);
      if(!this.win){
        alert("Wygrałeś!")
        this.win=true;
      }

    }
  }
  revealEmptyNeighbors(row: number, col: number): void {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (
          newRow >= 0 &&
          newRow < this.rows &&
          newCol >= 0 &&
          newCol < this.columns &&
          !this.board[newRow][newCol].revealed
        ) {
          this.revealCell(newRow, newCol);
        }
      }
    }
  }
  isCellEmpty(value: number): boolean {
    return value === null || value === undefined;
  }
  flagCell(event: MouseEvent, rowIndex: number, colIndex: number): void {
    event.preventDefault();
    const cell = this.board[rowIndex][colIndex];
    cell.flagged = !cell.flagged;
  }
  checkWinCondition(): boolean {
    let revealedCount = 0;
    let totalCells = this.rows * this.columns;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        const cell = this.board[i][j];
        if (cell.revealed && !cell.flagged) {
          revealedCount++;
        }
      }
    }
    return revealedCount === totalCells - this.mines;
  }
  startTimer(): void {
    this.timerInterval = setInterval(() => {

      this.timeLeft--;
      const hour = this.math.trunc(this.timeLeft/60);
      const minutes = this.timeLeft - hour*60;
      if(minutes<10){
        this.time = "0"+hour+"0"+minutes;
      } else {
        this.time = "0"+hour+":"+minutes;
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.gameOver = true;
        alert("Czas minął. Przegrałeś!");
      }
    }, 1000);
  }
  showRemainingMines(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const cell = this.board[row][col];
        if (cell.value === -1 && !cell.flagged) {
          cell.revealed = true;
        }
      }
    }
  }
}
