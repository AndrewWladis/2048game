import Grid from "./Grid.js"
import Tile from "./Tile.js"


function createLoseScreen() {
  let modal = document.querySelector('.modal-content')
  modal.innerHTML = '<a style="color: black;" class="modal-text" href="/index.html"><p class="modal-header">You Lost!</p><br><p class="modal-header">Click to start again.</p><br><p class="modal-header">No more half measures.</p></a>';
  modal.style.animation = 'show 0.1s'
  setTimeout(() => {
      modal.style.opacity = '100%';
  }, 99)
}

const gameBoard = document.getElementById("game-board")

const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setupInput()

function setupInput() {
  window.addEventListener("keydown", handleInput, { once: true })
}

async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInput()
        return
      }
      await moveUp()
      break
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput()
        return
      }
      await moveDown()
      break
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput()
        return
      }
      await moveLeft()
      break
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput()
        return
      }
      await moveRight()
      break
    default:
      setupInput()
      return
  }

  grid.cells.forEach(cell => cell.mergeTiles())

  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      createLoseScreen()
    })
    return
  }

  setupInput()
}

function forSwipe() {
  grid.cells.forEach(cell => cell.mergeTiles())

  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      alert("You lose")
    })
    return
  }
}
document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     
                                                                         
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
                                                                         
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
          moveLeft() 
          forSwipe()
        } else {
          moveRight() 
          forSwipe()
        }                       
    } else {
        if ( yDiff > 0 ) {
          moveUp()
          forSwipe()
        } else { 
          moveDown()
          forSwipe()
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

function moveUp() {
  return slideTiles(grid.cellsByColumn)
}

function moveDown() {
  return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
  return slideTiles(grid.cellsByRow)
}

function moveRight() {
  return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
  return Promise.all(
    cells.flatMap(group => {
      const promises = []
      for (let i = 1; i < group.length; i++) {
        const cell = group[i]
        if (cell.tile == null) continue
        let lastValidCell
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j]
          if (!moveToCell.canAccept(cell.tile)) break
          lastValidCell = moveToCell
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition())
          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile
          } else {
            lastValidCell.tile = cell.tile
          }
          cell.tile = null
        }
      }
      return promises
    })
  )
}

function canMoveUp() {
  return canMove(grid.cellsByColumn)
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
  return canMove(grid.cellsByRow)
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) return false
      if (cell.tile == null) return false
      const moveToCell = group[index - 1]
      return moveToCell.canAccept(cell.tile)
    })
  })
}