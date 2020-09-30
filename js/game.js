const X_CLASS = 'x'
const CIRCLE_CLASS = 'circle'

const game = {}

game.rule = undefined
game.circleTurn = undefined
game.board = undefined
game.size = undefined
game.cellElements = undefined
game.row = undefined
game.col = undefined
game.dataArr = undefined

game.endGame = (draw) => {
    document.querySelector('[status-messages]').innerText = draw ? 'Draw!' : `${game.circleTurn ? "O's" : "X's"} Wins!`
    document.getElementById('winningMessage').classList.add('show')
}

game.setBoardHoverClass = () => {
    const board = document.getElementById('board-game')
    board.classList.remove(X_CLASS)
    board.classList.remove(CIRCLE_CLASS)
    board.classList.add(game.circleTurn ? CIRCLE_CLASS : X_CLASS)
}

game.isDraw = () => {
    for (let i = 0; i < game.size; i++) {
        for (let j = 0; j < game.size; j++) {
            if (game.board[i][j] == 0) return false;
        }
    }
    return true;
}

game.startGame = () => {
    game.cellElements = document.querySelectorAll('[data-cell]')
    game.dataArr = Array.from(game.cellElements)
    game.board = [];
    for (let i = 0; i < game.size; i++) {
        let arr = [];
        for (let j = 0; j < game.size; j++) arr[j] = 0
        game.board.push(arr);
    }
    game.circleTurn = false
    game.cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS)
        cell.classList.remove(CIRCLE_CLASS)
        cell.removeEventListener('click', game.handleClick)
        cell.addEventListener('click', game.handleClick, {once: true})
    })
    game.setBoardHoverClass()
    document.getElementById('winningMessage').classList.remove('show')
}

game.handleClick = (e) => {
    const cell = e.target
    let currentClass = game.circleTurn ? CIRCLE_CLASS : X_CLASS;
    const data = {
        createdAt: new Date().toISOString(),
        owner: model.currentUser.email,
        type: currentClass,
        position: game.dataArr.indexOf(cell)
    }
    model.addPosition(data)
    cell.classList.add(currentClass);
    for (let i = 0; i < game.size * game.size; i++) {
        if (game.cellElements[i] === cell) {
            game.row = Math.floor(i / game.size);
            game.col = i % game.size;
            game.board[game.row][game.col] = currentClass;
        }
    }
    if (game.checkWin(currentClass)) {
        game.endGame(false)
    } else if (game.isDraw()) {
        game.endGame(true)
    } else {
        game.circleTurn = !game.circleTurn;
        game.setBoardHoverClass()
    }
}

game.checkWin = (currentClass) => {
    let r = game.row, c = game.col, count = 0;
    while (r > 0 && c > 0) {
        if (game.board[r - 1][c - 1] != currentClass) break;
        r--;
        c--;
    }
    while (r < game.size && c < game.size) {
        if (game.board[r][c] == currentClass) {
            count++;
            r++;
            c++;
        } else break;
    }
    if (count >= game.rule) return true;

    r = game.row, c = game.col, count = 0;
    while (r > 0) {
        if (game.board[r - 1][c] != currentClass) break;
        r--;
    }
    while (r < game.size) {
        if (game.board[r][c] == currentClass) {
            count++;
            r++;
        } else break;
    }
    if (count >= game.rule) return true;

    r = game.row, c = game.col, count = 0;
    while (c > 0) {
        if (game.board[r][c - 1] != currentClass) break;
        c--;
    }
    while (c < game.size) {
        if (game.board[r][c] == currentClass) {
            count++;
            c++;
        } else break;
    }
    if (count >= game.rule) return true;

    r = game.row, c = game.col, count = 0;
    while (r > 0 && c < game.size - 1) {
        if (game.board[r - 1][c + 1] != currentClass) break;
        r--;
        c++;
    }
    while (r < game.size && c >= 0) {
        if (game.board[r][c] == currentClass) {
            count++;
            r++;
            c--;
        } else break;
    }
    if (count >= game.rule) return true;
}

const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')
console.log(overlay)

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}