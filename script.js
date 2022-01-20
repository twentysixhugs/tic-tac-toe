const GameController = (function() {
    //add event listener that will rescan the array every time any button is clicked and check the return value
})();

const GameBoard = (function() {
    const _board = ['x', 'x', 'x', 'o', '', 'o', '', 'x', 'x']; //The array that stores current game state

    const getBoard = function() {
        return [..._board];
    }

    const setCellInBoardArray = function(index, mark) {
        _board[index] = mark;
    }

    return {getBoard, setCellInBoardArray};
})();

const DisplayController = (function() {
    const _board = GameBoard.getBoard();

    const renderBoardToWebpage = function() {
        const cellDivs = document.querySelectorAll('.cell');

        cellDivs.forEach((cell, i) => {
            if (_board[i]) {
                cell.appendChild(MarksImages[_board[i]].cloneNode());
                //Marks object has x and o properties corresponding img nodes. _board[i] is either x, o or ""
                //If it's x or o, then it takes img node from Marks object and appends it to the current cell
            }
        });
    }

    return {renderBoardToWebpage};
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


const Player = function(name) {
    
    const placeMark = function(cellIndex, mark) {
        if (!GameBoard.getBoard()[cellIndex]) { //if there's no X or O in this cell yet
            GameBoard.setCellInBoardArray(cellIndex, mark);
        } else {
            return "already taken";
        }
    }

    return {placeMark};
};


DisplayController.renderBoardToWebpage();