function Player(name, mark) {
    return {name, mark};
};



//Modules


const GameBoard = (function() {
    const _board = new Array(9).fill(''); //The array that stores current game state

    const getBoard = function() {
        return [..._board];
    };

    const pushCellIntoBoardArray = function(index, mark) {
        _board[index] = mark;
    };

    const clear = function() {
        for (let i = 0; i < _board.length; i++) {
            _board[i] = '';
        }
    };

    const isFilled = function () {
        for (cell of _board) {
            if (cell === '') return false;
        }
        
        return true;
    }

    const getWinner = function () { 
        const _possibleWinsIndexes = [
            //horizontal
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            //vertical
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            //diagonal
            [0, 4, 8],
            [6, 4, 2]
        ];

        for (const combination of _possibleWinsIndexes) {
            // if using current combination of indexes encounter three 'x' or 'o'
            // in _board array (like three subsequent 'x' in the second column, or in a diagonal, etc.)
            const _xWon = combination.every(index => _board[index] === 'x');
            const _oWon = combination.every(index => _board[index] === 'o');
            
            if (_xWon) return {mark: 'x', combination};
            if (_oWon) return {mark: 'o', combination};
        };

        return {mark: ''}; //otherwise
    };


    return {
        getBoard,
        pushCellIntoBoardArray,
        clear,
        getWinner,
        isFilled,
    };

})();


const MarksImages = (function createMarksImages() {
    const _xImg = document.createElement('img');
    const _oImg = document.createElement('img');

    _xImg.setAttribute('src', './img/x.png');
    _xImg.setAttribute('alt', "");
    _oImg.setAttribute('src', './img/o.png');
    _oImg.setAttribute('alt', "");

    return {x: _xImg, o: _oImg};
})();


const DisplayController = (function() {

    /* Interaction with cells */
    const _cellDivs = document.querySelectorAll('.cell');

    const renderArray = function() {
        _cellDivs.forEach((cell, i) => {
            if (GameBoard.getBoard()[i]) {
                cell.appendChild(MarksImages[GameBoard.getBoard()[i]].cloneNode());
                //Marks object has x and o properties corresponding img nodes. _board[i] is either x, o or ""
                //If it's x or o, then it takes img node from Marks object and appends it to the current cell
            }
        });
    };

    const clear = function() {
        _cellDivs.forEach(cell => cell.textContent = "");
    };

    const _cellClickHandler = function (e) {
        e.stopPropagation();
        GameFlowController.respondToCellClick(e.target.dataset.index);
        //index is undefined when we click on cell with image because of bubbling
        //GameFlowController will respond to it accordingly
    };

    const _enableCellClick = function () {
        _cellDivs.forEach(cell => cell.addEventListener('click', _cellClickHandler, {capture: true, once: true}));
    };

    const _disableCellClick = function () {
        _cellDivs.forEach(cell => cell.removeEventListener('click', _cellClickHandler, {capture: true, once: true}));
    };

    /* Interaction with menu */

    const _startBtn = document.querySelector("#start");
    const _currentPlayerDiv = document.querySelector("#current-player");
    const _playerForms = document.querySelectorAll(".player"); //nodes Player O/X + name input form
    const _gameResultDiv = document.querySelector("#result");

    //button
    const _showStartBtn = function () {
        _startBtn.classList.add("shown-flex");
    };

    const _hideStartBtn = function () {
        _startBtn.classList.remove("shown-flex");
    };

    //current player
    const renderCurrentPlayer = function (currentPlayer) {
        _currentPlayerDiv.textContent = `Current player: ${currentPlayer.name} (${currentPlayer.mark.toUpperCase()})`;
    };

    const _showCurrentPlayer = function () {
        _currentPlayerDiv.classList.add('shown-flex');
    };

    const _hideCurrentPlayer = function () {
        _currentPlayerDiv.classList.remove('shown-flex');
    };

    
    //player forms
    const _resetPlayerForms = function () {
        //hide
        _playerForms[0].classList.remove('shown-flex');
        _playerForms[1].classList.remove('shown-flex');

        //reset so that they are empty after page reload
        _playerForms[0].lastElementChild.value = "";
        _playerForms[1].lastElementChild.value = "";

    }

    //game result
    const showWinner = function (winner) {
        _hideCurrentPlayer();

        _gameResultDiv.classList.add("shown-flex");

        _gameResultDiv.textContent = `${winner.name} is winner!`;

        _disableCellClick();

        _showStartBtn();
    };

    const showTie = function () {
        _hideCurrentPlayer();

        _gameResultDiv.classList.add("shown-flex");

        _gameResultDiv.textContent = 'Tie';

        _disableCellClick();

        _showStartBtn();
    }

    const _hideResult = function () {
        _gameResultDiv.classList.remove('shown-flex');
    }

    const toggleWinningCellsHighlight = function (combination) {
        combination.forEach((indexOfCell) => {
            document.querySelector(`div[data-index="${indexOfCell}"]`).classList.toggle('winner');
        })
    }
    //Start/Play again button

    _startBtn.addEventListener('click', _handleStartBtnClick);

    function _handleStartBtnClick(e) {

        //According to whether or not the game was played, executes different blocks
        //Defines it by button's text

        if (e.target.textContent === 'Start!') { //If the game hasn't been played yet
            _hideStartBtn();
            _startBtn.textContent = 'Play again!';

            _showCurrentPlayer();

            //Scan value in input forms and set each player's name (Player 1 / 2 is set by default in PlayerController)
            //Input form is lastElementChild

            if (_playerForms[0].lastElementChild.value) {
                GameFlowController.PlayerController.setPlayerXName(_playerForms[0].lastElementChild.value);
            }

            if (_playerForms[1].lastElementChild.value) {
                GameFlowController.PlayerController.setPlayerOName(_playerForms[1].lastElementChild.value);
            }

            _resetPlayerForms();

            //called from here the first time to display initial value,
            //then called after each cell click from GameFlowController
            renderCurrentPlayer(GameFlowController.PlayerController.getCurrentPlayer()); 

            _enableCellClick();
        } else {
            //If the game was already played
            if (document.getElementById("result").textContent !== "Tie")
                toggleWinningCellsHighlight(GameBoard.getWinner().combination);

            GameBoard.clear();
            clear();

            _hideResult();
            _hideStartBtn();

            GameFlowController.PlayerController.resetCurrentPlayer();
            renderCurrentPlayer(GameFlowController.PlayerController.getCurrentPlayer());
            _showCurrentPlayer(); 
            _enableCellClick();
        }
    };

    //place display winner here


    return {
        clear, 
        renderArray,
        renderCurrentPlayer,
        showWinner,
        toggleWinningCellsHighlight,
        showTie
    };
})();


const GameFlowController = (function() {

    const PlayerController = (function() {
        //'Player 1' and 'Player 2' are default names
        let _playerX = Player('Player 1', 'x');
        let _playerO = Player('Player 2', 'o');

        const setPlayerXName = function (name) {
            _playerX.name = name;
        };

        const setPlayerOName = function (name) {
            _playerO.name = name;
        };
    
        //X makes first move
        let _currentPlayer = _playerX;
    
        const changeCurrentPlayer = function () {
            _currentPlayer = (_currentPlayer === _playerX) ? _playerO : _playerX;
        };

        const resetCurrentPlayer = function () {
            _currentPlayer = _playerX;
        };
    
        const getCurrentPlayer = function () {
            return _currentPlayer;
        };
    
        return {
            changeCurrentPlayer, 
            getCurrentPlayer,
            setPlayerXName,
            setPlayerOName,
            resetCurrentPlayer,
        };
    })();

    const respondToCellClick = function (index) {
        if (!GameBoard.getBoard()[index]) {
            GameBoard.pushCellIntoBoardArray(index, PlayerController.getCurrentPlayer().mark);

            DisplayController.clear();
            DisplayController.renderArray();

            const winner = GameBoard.getWinner();

            if (winner.mark) {
                DisplayController.showWinner(PlayerController.getCurrentPlayer());
                DisplayController.toggleWinningCellsHighlight(winner.combination);
            } else if (!GameBoard.isFilled()){ //continue playing
                PlayerController.changeCurrentPlayer();
                DisplayController.renderCurrentPlayer(PlayerController.getCurrentPlayer());
            } else {
                DisplayController.showTie();
            }
        }
    }

    return {
        respondToCellClick, 
        start,
        PlayerController,
    };
})();