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
        _board.forEach(el => el = '');
    };

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
            
            if (_xWon) return 'x';
            if (_oWon) return 'o';
        };

        return false; //otherwise
    };


    return {
        getBoard,
        pushCellIntoBoardArray,
        clear,
        getWinner
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

    const enableCellClick = function () {
        _cellDivs.forEach(cell => cell.addEventListener('click', (e) => {
            e.stopPropagation();
            GameFlowController.respondToCellClick(e.target.dataset.index);
            //index is undefined when we click on cell with image because of bubbling
            //GameFlowController will respond to it accordingly
        }, {capture: true, once: true}));
    };

    /* Interaction with menu */

    const _startBtn = document.querySelector("#start");
    const _currentPlayerDiv = document.querySelector("#current-player");
    const _playerForms = document.querySelectorAll(".player"); //nodes Player O/X + name input form

    _startBtn.addEventListener('click', _handleStartBtnClick);

    function _handleStartBtnClick(e) {
        _startBtn.classList.toggle("shown-flex"); //Hide it
        _startBtn.textContent = "Play again"; //When it shows up later, its text will be this

        //display current player
        _currentPlayerDiv.classList.toggle("shown-flex");

        //scan value in input forms and set each player's name (Player 1 / 2 is set by default in PlayerController)
        if (_playerForms[0].lastElementChild.value) //input form is lastChild in this case
            GameFlowController.PlayerController.setPlayerXName(_playerForms[0].lastElementChild.value);
        if (_playerForms[1].lastElementChild.value)
            GameFlowController.PlayerController.setPlayerOName(_playerForms[1].lastElementChild.value);

        //clear and hide player forms
        _playerForms[0].lastElementChild.value = "";
        _playerForms[1].lastElementChild.value = "";

        _playerForms[0].classList.toggle("shown-flex");
        _playerForms[1].classList.toggle("shown-flex");
        

        //called from here only after start/play again button click,
        //otherwise from GameFlowController
        showCurrentPlayer(GameFlowController.PlayerController.getCurrentPlayer()); 

        enableCellClick();
    };

    const showCurrentPlayer = function (currentPlayer) {
        _currentPlayerDiv.textContent = `Current player: ${currentPlayer.name} (${currentPlayer.mark.toUpperCase()})`;
    };

    //place display winner here


    return {
        enableCellClick, 
        clear, 
        renderArray,
        showCurrentPlayer,
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
    
        const getCurrentPlayer = function () {
            return _currentPlayer;
        };
    
        return {
            changeCurrentPlayer, 
            getCurrentPlayer,
            setPlayerXName,
            setPlayerOName,
        };
    })();

    const respondToCellClick = function (index) {
        if (!GameBoard.getBoard()[index]) { //if index is not undefined (it's undefined when we click on image because of bubbling)
            GameBoard.pushCellIntoBoardArray(index, PlayerController.getCurrentPlayer().mark);

            DisplayController.clear();
            DisplayController.renderArray();

            if (GameBoard.getWinner()) {
                console.log(`${GameBoard.getWinner()} is winner`);
                document.querySelector("#result").classList.toggle('shown-flex');
            } else {
                PlayerController.changeCurrentPlayer();
                DisplayController.showCurrentPlayer(PlayerController.getCurrentPlayer());
            }
        }
    }

    const start = function () {

    }

    return {
        respondToCellClick, 
        start,
        PlayerController,
    };
})();