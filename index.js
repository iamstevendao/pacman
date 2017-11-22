(function () {
  // region: initialize constants
  const canvas = document.getElementById('root')
  const ctx = canvas.getContext('2d')
  setCanvasStyle()
  const w = canvas.width
  const MARGIN_PACMAN = 1
  const STEP = 5
  const COLOR = {
    BACKGROUND: '#000000',
    PACMAN: '#EA1B21',
    POWER: '#ff0000',
    MAP: '#000099',
    FOOD: '#ffffff',
    CHERRY: '#990000',
    CHERRY_BRANCH: '#009900',
    EYE: '#ffffff',
    GHOST_WEAK: '#A9A9A9',
    GHOST: ['#993333', '#339933', '#333399', '#999933', '#993399', '#339999']
  }
  const SIZE = {
    GRID: 19,
    BLOCK: w / 19
  }
  const NUMBER = {
    GHOST: 8,
    CHERRY: 5,
    ROW: SIZE.GRID * STEP,
    POWER: 50,
    INTERVAL: 100
  }
  const ELEMENT = {
    FOOD: 'food',
    BLOCK: 'block',
    CHERRY: 'cherry',
    GHOST: 'ghost'
  }
  const GHOST_AREA = {
    x: 7,
    y: 8,
    w: 5,
    h: 3
  }
  const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
  }
  // endregion

  // region: declare variable
  var pacman = {}
  var map = []
  var food = []
  var ghosts = []
  var cherries = []
  var isOpen = false
  var score = 0
  var ingame = {
    px: 0,
    py: 0
  }
  // endregion

  // region: start game
  reset()
  setInterval(update, NUMBER.INTERVAL)
  // endregion

  // region: game flow
  function update() {
    draw()
    controlGame()
  }

  function draw() { // draw every elements in the game
    drawBackground()
    drawMap()
    drawPath()
    drawFood()
    drawCherries()
    drawPacman()
    drawGhosts()
    drawScore()
  }

  function controlGame() { // control every elements in the game
    controlObject(pacman)
    controlPath()
    controlGhosts()
    controlScore()
  }

  function reset() { // reset game
    toDefault()
    generateElements()
  }

  function toDefault() {
    score = 0
    map = []
    food = []
    ghosts = []
    cherries = []
    pacman = {
      x: 1,
      y: 1,
      direction: 'right',
      power: 0
    }
  }

  function generateElements() {
    generateMap()
    generateFood()
    generateCherry()
    generateGhosts()
  }
  // endregion

  // region: generate elements
  function generateGhosts() {
    for (let i = 0; i < NUMBER.GHOST; i++) {
      // randomize ghost's properties
      let x = random(GHOST_AREA.w) + GHOST_AREA.x
      let y = random(GHOST_AREA.h) + GHOST_AREA.y
      let direction = randomProperty(DIRECTION)
      let color = randomProperty(COLOR.GHOST)
      let path = []
      // add ghost to array
      ghosts.push({
        x,
        y,
        color,
        direction,
        path
      })
      generateTarget(ghosts[ghosts.length - 1])
    }
  }

  function generateFood() {
    for (let i = 0; i < SIZE.GRID; i++) {
      for (let j = 0; j < SIZE.GRID; j++) {
        let foo = {
          x: i,
          y: j
        }
        if (!isContained(map, foo)) {
          food.push(foo)
        }
      }
    }
  }

  function generateTarget(obj) {
    obj.path = []
    if (cherries.length <= 0) {
      obj.target = -1
      return
    }
    obj.target = random(NUMBER.GHOST) > NUMBER.GHOST / 4 ? -1 : random(cherries.length)
  }

  function generateCherry() {
    while (cherries.length < NUMBER.CHERRY) {
      let index = random(food.length)
      let cher = food[index]
      if (!isContained(cherries, cher)) {
        cherries.push(cher)
        food.splice(index, 1)
      }
    }
  }

  function generateMap() {
    for (let i = 0; i < SIZE.GRID / 2; i++) {
      generateOthers(i, 0)
    }
    for (let i = 1; i < SIZE.GRID / 2; i++) {
      generateOthers(0, i)
    }
    for (let i = 2; i < 2 + 5; i++) {
      generateOthers(2, i)
    }
    for (let i = 4; i < 4 + 5; i++) {
      generateOthers(i, 2)
    }
    for (let i = 2; i < 2 + 3; i++) {
      generateOthers(i, 8)
    }
    for (let i = 4; i < 9; i += 2) {
      for (let j = 4; j < 4 + 2; j++) {
        generateOthers(i, j)
      }
    }
    generateOthers(4, 7)
    generateOthers(7, 7)
    generateOthers(6, 7)
    generateOthers(6, 8)
    pushIntoMap({
      x: 6,
      y: 9
    })
    pushIntoMap({
      x: SIZE.GRID - 6 - 1,
      y: 9
    })
    for (let i = 8; i < 8 + 3; i++) {
      pushIntoMap({
        x: i,
        y: 11
      })
    }
  }
  // endregion

  // region: control score
  function hitGhost() {
    let index = isHitGhost()
    if (index === -1) {
      return
    }
    if (pacman.power < 0) {
      reset()
    } else {
      ghosts.splice(index, 1)
      score += 10
    }
  }

  function hitFood() {
    let index = isCrashed(food, ingame.px, ingame.py)
    if (index === -1) {
      return
    }
    score++
    food.splice(index, 1)
  }

  function hitCherry() {
    let index = isCrashed(cherries, ingame.px, ingame.py)
    if (index === -1) {
      return
    }
    pacman.power = NUMBER.INTERVAL * NUMBER.POWER
    cherries.splice(index, 1)
    score += 5
  }

  function checkOver() {
    if (!food.length || !ghosts.length) {
      reset()
    }
  }
  // endregion

  // region: control game
  function controlGhosts() {
    ghosts.forEach(value => {
      controlObject(value)
    })
  }

  function controlScore() {
    // pacman eats food
    hitFood()
    // pacman crashes ghost
    hitGhost()
    // pacman eats cherry
    hitCherry()
    // check game over
    checkOver()
  }

  function controlPath() {
    ghosts.forEach((ghost, index) => {
      let gx = Math.round(ghost.x)
      let gy = Math.round(ghost.y)
      if (ghost.target === -1) {
        ghost.path = findWay(index, {
          x: gx,
          y: gy,
          prev: null
        }, {
          x: ingame.px,
          y: ingame.py
        })
      } else {
        // generate new target
        if (ghost.path == null || ghost.target >= cherries.length || reachCherry(ghost)) {
          ghost.target = random(cherries.length)
        }
        let cherry = cherries[ghost.target]
        ghost.path = findWay(index, {
          x: gx,
          y: gy,
          prev: null
        }, {
          x: cherry.x,
          y: cherry.y
        })
      }
    })
  }

  function controlObject(obj) {
    let index = 0
    let possibleDirection = whereCanGo(obj)

    // if the object is a ghost
    if (obj.hasOwnProperty('path')) {
      // generate the target after an amount of time
      if ((pacman.power % (NUMBER.INTERVAL * NUMBER.POWER * 2)) === 0) {
        generateTarget(obj)
      }

      // control the direction
      // when pacman activates power, go backwards
      if (pacman.power >= NUMBER.INTERVAL * (NUMBER.POWER - 1)) {
        obj.direction = opositeOf(obj.direction)
      } else {
        // if the object still go ahead, remove the oposite direction
        if (isPossible(obj.direction)) {
          if ((index = possibleDirection.indexOf(opositeOf(obj.direction))) !== -1) {
            possibleDirection.splice(index, 1)
          }
        }
        // if the ghost is at the center of a block, random a new direction
        // otherwise just follow the current path
        if (Number.isInteger(obj.x) && Number.isInteger(obj.y)) {
          if (obj.path.length <= 0 || pacman.power > 0) {
            obj.direction = possibleDirection[random(possibleDirection.length)]
          } else {
            followPath(obj)
          }
        }
      }
    } else { // pacman changes its mouth's state, and reduce power
      obj.power -= NUMBER.INTERVAL
      isOpen = !isOpen
    }

    // move based on its current direction
    switch (obj.direction) {
      case DIRECTION.RIGHT:
        if (isPossible(DIRECTION.RIGHT)) {
          obj.x += 1 / 4
          obj.y = Math.round(obj.y)
        }
        break
      case DIRECTION.LEFT:
        if (isPossible(DIRECTION.LEFT)) {
          obj.x -= 1 / 4
          obj.y = Math.round(obj.y)
        }
        break
      case DIRECTION.UP:
        if (isPossible(DIRECTION.UP)) {
          obj.y -= 1 / 4
          obj.x = Math.round(obj.x)
        }
        break
      case DIRECTION.DOWN:
        if (isPossible(DIRECTION.DOWN)) {
          obj.y += 1 / 4
          obj.x = Math.round(obj.x)
        }
        break
    }

    // update round coordinates of pacman
    roundCoordinates()

    function isPossible(x) {
      return possibleDirection.indexOf(x) !== -1
    }
  }
  // endregion

  // region: Dijkstra's Algorithm
  // find the shortest way to the target
  function findWay(ind, departure, destination) {
    // if arrival and departure have a same coordinates, return a blank array
    if (departure.x === destination.x && departure.y === destination.y) {
      return []
    }
    // push departure to the queue as the start point
    let queue = [departure]
    let index = 0
    let result = null

    // keep finding a way until get a result
    while (!result) {
      let adj = getAdjacences(ind, queue, queue[index])
      adj.forEach((value) => {
        // deep copy the adjacence and push to queue
        value.prev = JSON.parse(JSON.stringify(queue[index]))
        queue.push(value)

        if (value.x === destination.x && value.y === destination.y) {
          result = value
        }
      })
      index++
    }

    // inverse nextMoves
    let nextMoves = []
    let curr = result
    do {
      nextMoves.push({
        x: curr.x,
        y: curr.y
      })
      curr = curr.prev
    } while (curr != null)

    return nextMoves.reverse().splice(1)
  }

  // get all possible next moves
  function getAdjacences(ind, queue, point) {
    if (typeof point !== 'undefined') {
      let adj = shuffle(ind, [{
        x: point.x,
        y: point.y - 1
      }, {
        x: point.x,
        y: point.y + 1
      }, {
        x: point.x - 1,
        y: point.y
      }, {
        x: point.x + 1,
        y: point.y
      }])
      return adj.filter((value) =>
        ((value.x >= 1 && value.x < SIZE.GRID && value.y < SIZE.GRID && value.y >= 1 && !isContained(map, value) && !isContained(queue, value))))
    } else {
      return []
    }
  }

  // shuffle the ghost's ways
  function shuffle(ind, array) {
    let arr = []
    let index = ind % 4
    for (let i = 0; i < 4; i++) {
      arr.push(array[(index + i) % 4])
    }
    return arr
  }
  // endregion

  // region: draw
  function drawPacman() {
    let color = pacman.power < 0 ? COLOR.PACMAN : COLOR.POWER
    let margin = pacman.power < 0 ? MARGIN_PACMAN : 0
    let angle = getAngle()
    let eye = getEye()
    let pac = {}
    pac.x = pacman.x * SIZE.BLOCK + SIZE.BLOCK / 2 + margin
    pac.y = pacman.y * SIZE.BLOCK + SIZE.BLOCK / 2 + margin
    pac.radius = SIZE.BLOCK / 2 - margin * 2

    // half of a circle
    ctx.beginPath()
    ctx.arc(pac.x, pac.y, pac.radius, angle.startMouth, angle.endMouth, false)
    ctx.fillStyle = color
    ctx.fill()

    // half of a circle
    ctx.beginPath()
    ctx.arc(pac.x, pac.y, pac.radius, angle.startHead, angle.endHead, false)
    ctx.fill()

    // draw eye
    ctx.beginPath()
    ctx.arc(eye.x, eye.y, SIZE.BLOCK / 10, 0, 2 * Math.PI, false)
    ctx.fillStyle = COLOR.FOOD
    ctx.fill()
  }

  function drawScore() {
    ctx.fillStyle = COLOR.FOOD
    ctx.font = '20px Monaco'
    ctx.fillText('Score: ' + score, 0, SIZE.BLOCK)
  }

  function drawPath() {
    if (pacman.power <= 0) {
      ghosts.forEach((value) => {
        value.path.forEach((path) => {
          ctx.fillStyle = value.color
          ctx.fillRect(path.x * SIZE.BLOCK + SIZE.BLOCK / 4, path.y * SIZE.BLOCK + SIZE.BLOCK / 4, SIZE.BLOCK / 2, SIZE.BLOCK / 2)
        })
      })
    }
  }

  function drawCherries() {
    cherries.forEach(cherry => {
      drawElement(ELEMENT.CHERRY, cherry)
    })
  }

  function drawGhosts() {
    ghosts.forEach(value => {
      drawElement(ELEMENT.GHOST, value)
    })
  }

  function drawFood() {
    food.forEach(value => {
      drawElement(ELEMENT.FOOD, value)
    })
  }

  function drawBackground() {
    ctx.fillStyle = COLOR.BACKGROUND
    ctx.fillRect(0, 0, w, w)
  }

  function drawMap() {
    map.forEach(value => {
      drawElement(ELEMENT.BLOCK, value)
    })
  }

  function drawElement(ele, obj) {
    let x = obj.x * SIZE.BLOCK
    let y = obj.y * SIZE.BLOCK
    switch (ele) {
      case ELEMENT.BLOCK:
        ctx.fillStyle = COLOR.MAP
        ctx.fillRect(x, y, SIZE.BLOCK, SIZE.BLOCK)
        break

      case ELEMENT.FOOD:
        ctx.fillStyle = COLOR.FOOD
        ctx.fillRect(x + SIZE.BLOCK / 3, y + SIZE.BLOCK / 3, SIZE.BLOCK / 3, SIZE.BLOCK / 3)
        break

      case ELEMENT.CHERRY:
        ctx.fillStyle = COLOR.CHERRY
        ctx.beginPath()
        ctx.arc(x + SIZE.BLOCK / 4, y + SIZE.BLOCK / 2, SIZE.BLOCK / 4, 0, 2 * Math.PI, false)
        ctx.arc(x + SIZE.BLOCK * 3 / 4, y + SIZE.BLOCK * 3 / 4, SIZE.BLOCK / 4, 0, 2 * Math.PI, false)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x + SIZE.BLOCK / 4, y + SIZE.BLOCK / 4)
        ctx.lineTo(x + SIZE.BLOCK, y)
        ctx.moveTo(x + SIZE.BLOCK * 3 / 4, y)
        ctx.lineTo(x + SIZE.BLOCK * 3 / 4, y + SIZE.BLOCK / 2)
        ctx.lineWidth = 3
        ctx.strokeStyle = COLOR.CHERRY_BRANCH
        ctx.stroke()
        break

      case ELEMENT.GHOST:
        const pow = pacman.power / 100
        let color = pow < 0 || pow === 1 || pow === 5 || pow === 9 || pow === 13 ? obj.color : COLOR.GHOST_WEAK
        ctx.fillStyle = color
        ctx.fillRect(x, y + SIZE.BLOCK / 2, SIZE.BLOCK, SIZE.BLOCK / 4)
        ctx.beginPath()
        ctx.arc(x + SIZE.BLOCK / 2, y + SIZE.BLOCK / 2, SIZE.BLOCK / 2, Math.PI, 0, false)
        // four circles as foot
        for (let i = -3; i <= 3; i += 2) {
          ctx.arc(x + SIZE.BLOCK / 2 + SIZE.BLOCK * i / 8, y + SIZE.BLOCK / 2 + SIZE.BLOCK / 4, SIZE.BLOCK / 8, 0, Math.PI, false)
        }

        ctx.fill()
        ctx.fillStyle = COLOR.EYE
        ctx.beginPath()
        ctx.arc(x + SIZE.BLOCK / 4, y + SIZE.BLOCK / 2, SIZE.BLOCK / 8, 0, 2 * Math.PI, false)
        ctx.arc(x + SIZE.BLOCK * 3 / 4, y + SIZE.BLOCK / 2, SIZE.BLOCK / 8, 0, 2 * Math.PI, false)
        ctx.fill()
        break
    }
  }
  // endregion

  // region: utils
  // set width = height = the shortest dimension of the browser window
  function setCanvasStyle() {
    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w > h ? h - 150 : w - 150
    canvas.height = canvas.width
    canvas.style.left = (w - canvas.width) / 2 + 'px'
    canvas.style.position = "absolute"
  }

  function isContained(arr, obj) {
    return arr.some(value => (value.x === obj.x && value.y === obj.y))
  }

  // simplify the random function
  function random(x) {
    return Math.floor(Math.random() * x)
  }

  function reachCherry(obj) {
    return obj.x === cherries[obj.target].x && obj.y === cherries[obj.target].y
  }

  // follow the path
  function followPath(ghost) {
    if (ghost.path[0].x === ghost.x) {
      ghost.direction = ghost.path[0].y > ghost.y ? DIRECTION.DOWN : DIRECTION.UP
    } else {
      ghost.direction = ghost.path[0].x > ghost.x ? DIRECTION.RIGHT : DIRECTION.LEFT
    }
  }

  // return the oposite direction
  function opositeOf(x) {
    switch (x) {
      case DIRECTION.LEFT:
        return DIRECTION.RIGHT
      case DIRECTION.RIGHT:
        return DIRECTION.LEFT
      case DIRECTION.UP:
        return DIRECTION.DOWN
      case DIRECTION.DOWN:
        return DIRECTION.UP
    }
  }

  // return the array of directions that a ghost is able to turn in the next move
  function whereCanGo(obj) {
    let direction = []
    if (isCrashed(map, obj.x + 1, obj.y) === -1) {
      direction.push(DIRECTION.RIGHT)
    }
    if (isCrashed(map, obj.x - 1, obj.y) === -1) {
      direction.push(DIRECTION.LEFT)
    }
    if (isCrashed(map, obj.x, obj.y - 1) === -1) {
      direction.push(DIRECTION.UP)
    }
    if (isCrashed(map, obj.x, obj.y + 1) === -1) {
      direction.push(DIRECTION.DOWN)
    }
    return direction
  }

  function isHitGhost() {
    let x = pacman.x
    let y = pacman.y
    for (let ele in ghosts) {
      let ex = ghosts[ele].x
      let ey = ghosts[ele].y
      let condition = (Math.ceil(ex) === Math.ceil(x) &&
          Math.ceil(ey) === Math.ceil(y)) ||
        (Math.floor(ex) === Math.floor(x) &&
          Math.floor(ey) === Math.floor(y))
      if (condition) {
        return ele
      }
    }
    return -1
  }

  // check if 2 elements are about to crash in the next move
  // returns -1 if not crash
  // return the index of the element in the array if crash
  function isCrashed(arr, x, y) {
    for (let ele in arr) {
      if (arr[ele].x === x && arr[ele].y === y) {
        return ele
      }
    }
    return -1
  }

  function randomProperty(obj) {
    let keys = Object.keys(obj)
    return obj[keys[random(keys.length)]]
  }

  function roundCoordinates() {
    ingame.px = Math.round(pacman.x)
    ingame.py = Math.round(pacman.y)
  }

  // get position of pacman's eyes
  function getEye() {
    let eye = {}
    const base = {
      x: pacman.x * SIZE.BLOCK,
      y: pacman.y * SIZE.BLOCK
    }
    switch (pacman.direction) {
      case DIRECTION.RIGHT:
      case DIRECTION.LEFT:
        eye.x = base.x + SIZE.BLOCK / 2
        eye.y = base.y + SIZE.BLOCK / 4
        break
      case DIRECTION.UP:
        eye.x = base.x + SIZE.BLOCK / 4
        eye.y = base.y + SIZE.BLOCK / 2
        break
      case DIRECTION.DOWN:
        eye.x = base.x + SIZE.BLOCK * 3 / 4
        eye.y = base.y + SIZE.BLOCK / 2
        break
    }
    return eye
  }

  // get angle of 2 arches of pacman
  function getAngle() {
    let angle = {
      startMouth: Math.PI,
      endMouth: Math.PI,
      startHead: Math.PI,
      endHead: Math.PI
    }
    if (!isOpen) {
      angle.startMouth = 0
      angle.endHead = 0
      return angle
    }
    let mouth = 0
    let head = 0
    switch (pacman.direction) {
      case DIRECTION.RIGHT:
        mouth = 0.25
        head = 0.75
        break
      case DIRECTION.LEFT:
        mouth = 1.75
        head = 1.25
        break
      case DIRECTION.UP:
        mouth = 0.25
        head = 1.75
        break
      case DIRECTION.DOWN:
        mouth = 0.75
        head = 1.25
        break
    }
    angle.startMouth *= mouth
    angle.endMouth *= mouth > 1 ? mouth - 1 : mouth + 1
    angle.startHead *= head
    angle.endHead *= head > 1 ? head - 1 : head + 1
    return angle
  }

  function generateOthers(x, y) {
    pushIntoMap({
      x: x,
      y: y
    })
    pushIntoMap({
      x: SIZE.GRID - x - 1,
      y: y
    })
    pushIntoMap({
      x: x,
      y: SIZE.GRID - y - 1
    })
    pushIntoMap({
      x: SIZE.GRID - x - 1,
      y: SIZE.GRID - y - 1
    })
  }

  function pushIntoMap(value) {
    map.push({
      x: value.x,
      y: value.y
    })
  }
  // endregion

  // region: keypress event
  document.onkeydown = function (e) {
    switch (e.keyCode) {
      case 37:
        pacman.direction = DIRECTION.LEFT
        pacman.y = ingame.py
        break
      case 38:
        pacman.direction = DIRECTION.UP
        pacman.x = ingame.px
        break
      case 39:
        pacman.direction = DIRECTION.RIGHT
        pacman.y = ingame.py
        break
      case 40:
        pacman.direction = DIRECTION.DOWN
        pacman.x = ingame.px
        break
    }
  }
  // endregion
})()