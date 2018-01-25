$(() => {
  ui.startView();
});

var board = {
  board: [],
  init: function() {
    this.renderBoard();
  },

  renderBoard: function() {
    var children = $("#board").children();

    for (var i = 0; i < 9; i++) {
      this.board[i] = "blank";
      if ($(children[i]).hasClass("o x")) {
        $(children[i]).removeClass("o x");
      }
    }
  },
  blankCells: function() {
    let indexs = [];
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === "blank") {
        indexs.push(i);
      }
    }
    return indexs;
  },
  insert: function(symbol, position) {
    if (position > 8 || this.board[position] !== "blank") return false;
    this.board[position] = symbol;
    return true;
  }
};
var game = {
  currentPlayer: 1,
  player1: 1,
  player2: 0,
  gameOver: false,
  result: "",
  play: function(chosen, starting_player = 1) {
    let boardChildren = $("#board");
    let starting = parseInt(starting_player);
    let maximizing = starting;
    this.currentPlayer = starting;
    ui.turnText(this.currentPlayer);
    if (chosen == "onePlayer") {
      let html_cells = [...$("#board").children()];
      if (!starting) {
        let center_and_corners = [0, 2, 4, 6, 8];
        let first_choice =
          center_and_corners[
            Math.floor(Math.random() * center_and_corners.length)
          ];
        let symbol = !maximizing ? "x" : "o";
        board.insert(symbol, first_choice);
        
        $(html_cells[first_choice]).addClass(symbol);
        this.currentPlayer = 1; //Switch turns
      }
    }

    boardChildren.click(event => {
      var target = $(event.target);
      var SN = target.index();

      switch (chosen) {
        case "twoPlayers":
          if (target.hasClass("x") || target.hasClass("o") || this.isWin(board))
            return false;

          let symbol = this.currentPlayer ? "x" : "o";

          board.board[SN] = symbol;
          $(event.target).addClass(board.board[SN]);

          if (this.isWin(board)) {
            $("#result").show();
            $("#board").off("click");
            ui.resultScreen(this.result);
            this.currentPlayer = 1;
          } else {
            this.takeTurn();
            ui.turnText(this.currentPlayer);
          }
          break;
        case "onePlayer":
          if (
            target.hasClass("x") ||
            target.hasClass("o") ||
            this.isWin(board) ||
            !this.currentPlayer
          )
            return false;

          let symbol1 = maximizing ? "x" : "o";

          board.board[SN] = symbol1;
          $(event.target).addClass(board.board[SN]);

          if (this.isWin(board)) {
            $("#result").show();
            $("#board").off("click");
            ui.resultScreen(this.result);
          } else {
            this.currentPlayer = 0;

            let p = !maximizing ? "x" : "o";

            aiPlayer.findBestMove(board.board, p, best => {
              let symbol = !maximizing ? "x" : "o";
              let children = $("#board").children();

              board.board[best] = symbol;
              $(children[best]).addClass(board.board[best]);

              if (game.isWin(board)) {
                $("#result").show();
                $("#board").off("click");
                ui.resultScreen(this.result);
              }
            });
            this.currentPlayer = 1;
            // ui.turnText(this.currentPlayer);
          }

          break;
      } // end of swith
    });
  },

  takeTurn: function() {
    let player1 = this.player1,
      player2 = this.player2;
    this.currentPlayer =
      this.currentPlayer === this.player1 ? player2 : player1;
  },

  isWin: function(board) {
    var S = board.board;
    //check row
    for (let i = 0; i <= 6; i += 3) {
      if (S[i] !== "blank" && S[i] === S[i + 1] && S[i + 1] === S[i + 2]) {
        this.result = `Winner is player ${S[i].toUpperCase()}!`;
        return true;
      }
    }
    //check column
    for (let i = 0; i <= 2; i++) {
      if (S[i] !== "blank" && S[i] === S[i + 3] && S[i + 3] === S[i + 6]) {
        this.result = `Winner is player ${S[i].toUpperCase()}!`;
        return true;
      }
    }
    //check diagonals
    for (let i = 0, j = 4; i <= 2; i += 2, j -= 2) {
      if (S[i] !== "blank" && S[i] === S[i + j] && S[i + j] === S[i + 2 * j]) {
        this.result = `Winner is player ${S[i].toUpperCase()}!`;
        return true;
      }
    }

    let available = board.blankCells();

    if (available.length === 0) {
      this.result = "The game is draw!";
      return true;
    } else {
      return false;
    }
  }
};

var ui = {
  starting_player: 1,
  startView() {
    let players = `           
            <ul>
            <li>
            <input type="radio" name="players" id="one" value="onePlayer" checked>
            <label for="one">Single Player</label>            
            <div class="check">
           </div>
            </li>
            <li>
            <input type="radio" name="players" id="two" value="twoPlayers">
            <label for="two">Two Players</label>
            <div class="check"></div>
            </li>
            <ul>
            <div class="field">
					<label>Starting Player</label>
					<div class="starting_player_choices" id="starting_player">
						<ul>
							<li data-value="1" class="active">Human</li>
							<li data-value="0">Computer</li>
						</ul>
					</div>
				</div>
          <a href="#" class="btn" id="start">Start</a>
            
       `;
    $("#select").append(players);
    $("#turn").hide();
    this.starting_player = 1;

    document.getElementById("starting_player").addEventListener(
      "click",
      event => {
        if (event.target.tagName !== "LI" || $(event.target).hasClass("active"))
          return;
        let starting_player_choices = [
          ...document.getElementById("starting_player").children[0].children
        ];
        starting_player_choices.forEach(choice => {
          $(choice).removeClass("active");
        });
        $(event.target).addClass("active");
        this.starting_player = event.target.dataset.value;
      },
      false
    );
    $("#start").click(() => {
      let player = $("input:radio[name=players]");
      let chosen = player.filter(":checked").val();
      $("#select").hide();
      $("#turn").show();

      ui.boardView();
      board.init();
      
      game.play(chosen, this.starting_player);
    });
  },

  boardView() {
    var items = `<div class="box a"></div>
    <div class="box b"></div>
    <div class="box c"></div>
    <div class="box d"></div>
    <div class="box e"></div>
    <div class="box f"></div>
    <div class="box g"></div>
    <div class="box h"></div>
    <div class="box k"></div>`;
    $("#board").append(items);
  },
  resultScreen(texts) {
    var result = `
        
        <h3>${texts}</h3>
        <a href="#" class="btn btn1" id="restart">Restart</a>
        <a href="#" class="btn btn1" id="playAgain">Play Again</a>
       
       `;

    $("#result").append(result);
    $("#restart").click(() => {
      $("#board").empty();
      $("#result").hide();
      $("#result").empty();
      $("#select").empty();
      $("#select").show();
      this.startView();
    });
    $("#playAgain").click(() => {
      let player = $("input:radio[name=players]");
      let chosen = player.filter(":checked").val();

      $("#result").hide();

      $("#result").empty();

      $("#board").empty();

      ui.boardView();
      board.init();
      console.log("starting player ==" + this.starting_player);

      game.play(chosen, this.starting_player);
    });
  },
  turnText(value) {
    if (value === 1) {
      $("#turn").empty();
      $("#turn").html("<h3>Player X turn!</h3>");
    } else if (value === 0) {
      $("#turn").empty();
      $("#turn").html("<h3>Player O turn!</h3>");
    }
  }
};

var aiPlayer = {
  nodes_map: new Map(),
  isMoveLeft(state) {
    for (let v = 0; v < state.length; v++) {
      if (state[v] == "blank") return true;
    }

    return false;
  },

  evaluate(S) {
    //check row
    for (let i = 0; i <= 6; i += 3) {
      if (S[i] !== "blank" && S[i] === S[i + 1] && S[i + 1] === S[i + 2]) {
        if (S[i] == "x") {
          return +10;
        } else if (S[i] == "o") {
          return -10;
        }
      }
    }
    //check column
    for (let i = 0; i <= 2; i++) {
      if (S[i] !== "blank" && S[i] === S[i + 3] && S[i + 3] === S[i + 6]) {
        if (S[i] == "x") {
          return +10;
        } else if (S[i] == "o") {
          return -10;
        }
      }
    }
    //check diagonals
    for (let i = 0, j = 4; i <= 2; i += 2, j -= 2) {
      if (S[i] !== "blank" && S[i] === S[i + j] && S[i + j] === S[i + 2 * j]) {
        if (S[i] == "x") {
          return +10;
        } else if (S[i] == "o") {
          return -10;
        }
      }
    }

    return 0;
  },
  minimax(state, depth, isMax) {
    let score = this.evaluate(state);

    if (score == 10) return score;

    if (score == -10) return score;

    if (this.isMoveLeft(state) === false) return 0;

    if (isMax) {
      let best = -1000,
        arr,
        rand,
        ret;
      for (let v = 0; v < state.length; v++) {
        if (state[v] == "blank") {
          state[v] = "x";
          let node_value = this.minimax(state, depth + 1, !isMax);
          best = Math.max(best, node_value);
          // if (depth === 0) {
          //   //Comma seperated indicies if multiple moves have the same heuristic value
          //   var moves = this.nodes_map.has(node_value)
          //     ? `${this.nodes_map.get(node_value)},${v}`
          //     : v;
          //   this.nodes_map.set(node_value, moves);
          // }
          state[v] = "blank";
        }
      }
      //       if (depth === 0) {
      //         if (typeof this.nodes_map.get(best) == "string") {
      //           arr = this.nodes_map.get(best).split(",");
      //           rand = Math.floor(Math.random() * arr.length);
      //           ret = arr[rand];
      //         } else {
      //           ret = this.nodes_map.get(best);
      //         }

      //         return ret;
      //       }
      return best;
    } else {
      let best = 1000;
      for (let v = 0; v < state.length; v++) {
        if (state[v] == "blank") {
          state[v] = "o";
          let node_value = this.minimax(state, depth + 1, !isMax);
          best = Math.min(best, node_value);
          // if (depth === 0) {
          //   //Comma seperated indicies if multiple moves have the same heuristic value
          //   let moves = this.nodes_map.has(node_value)
          //     ? `${this.nodes_map.get(node_value)},${v}`
          //     : v;
          //   this.nodes_map.set(node_value, moves);
          // }
          state[v] = "blank";
        }
      }
      //       if (depth === 0) {
      //         if (typeof this.nodes_map.get(best) == "string") {
      //           arr = this.nodes_map.get(best).split(",");
      //           rand = Math.floor(Math.random() * arr.length);
      //           ret = arr[rand];
      //         } else {
      //           ret = this.nodes_map.get(best);
      //         }

      //         return ret;
      //       }
      return best;
    }
  },
  findBestMove(state, player, callback = () => {}) {
    var move = -1;
    switch (player) {
      case "o":
        let bestVal = 1000;

        for (let v = 0; v < state.length; v++) {
          if (state[v] == "blank") {
            state[v] = player;

            var moveVal = this.minimax(state, 0, true);

            state[v] = "blank";
            if (moveVal < bestVal) {
              move = v;

              bestVal = moveVal;
            }
          }
        }

        return callback(move);

      case "x":
        let bestVal1 = -1000;

        for (let v = 0; v < state.length; v++) {
          if (state[v] == "blank") {
            state[v] = player;

            var moveVal1 = this.minimax(state, 0, false);

            state[v] = "blank";
            if (moveVal1 > bestVal1) {
              move = v;

              bestVal1 = moveVal1;
            }
          }
        }

        return callback(move);
    }
  } //findBestMove
};