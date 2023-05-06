window.onload = function(e){ initGame() }
var canvas = document.getElementById("canvas");//все элементы будут изображаться в пределах этого canvas
var ctx = canvas.getContext("2d");
canvas.addEventListener('click', function(e) { onClick(e)}, false);

//параметры поля
const tileSize = 100					//размер тайла, в пикселях canvas
const xTileCount = 7, yTileCount = 6	//размеры поля, в тайлах
var xFieldOffset, yFieldOffset			//положение поля в пределах canvas
var tiles = Array(xTileCount).fill().map(() => new Array(yTileCount).fill())
var scale = Array(xTileCount).fill().map(() => new Array(yTileCount).fill(1))

//параметры игры
const lineLength = 3	//минимальная длина линии, которую нужно собрать
const tileIdCount = 6	//количество различных типов тайлов
var tileResources = Array(tileIdCount)

//общие параметры анимаций 
const animationTime = 250	//продолжительность анимаций в мс
const animationTicks = 20	//количество промежуточных состояний для отрисовки
function waitForAnimation () { return new Promise((resolve) => setTimeout(resolve, animationTime)); }
var tick

function initGame(){
	ctx.strokeStyle = "rgb(255,0,255)"
	ctx.lineWidth = 5
	xFieldOffset = (canvas.width - xTileCount * tileSize) / 2
	yFieldOffset = (canvas.height - yTileCount * tileSize) / 2
	for(id = 0; id < tileIdCount; id++)
	tileResources[id] = document.getElementById("tile" + id)

	//стартовое положение - нет готовых линий, но есть ходы
	idCounter = 0
	for (x = 0; x < xTileCount; x++)
	for (y = 0; y < yTileCount; y++)
	if (x == 2 || x == 4)
	tiles[x][y] = y
	else
	tiles[x][y] = (y + 1) % tileIdCount
	drawField()
}

//перевод из абсолютных координат в координаты в пределах canvas
function getMousePos(event) {
	rect = canvas.getBoundingClientRect()
	scaleX = canvas.width / rect.width
	scaleY = canvas.height / rect.height
	return {
		x: (event.clientX - rect.left) * scaleX,
		y: (event.clientY - rect.top) * scaleY
	}
}

//[selectX, selectY] - текущий выбранный тайл
var selectX = -1, selectY = -1
function onClick(event){
	pos = getMousePos(event)
	//перевод координат canvas в номер выбранного тайла
	x = Math.floor((pos.x - xFieldOffset) / tileSize)
	y = Math.floor((pos.y - yFieldOffset) / tileSize)
	d = Math.abs(x - selectX) + Math.abs(y - selectY)

	//клик на уже выбранном тайле снимает с него выделение
	if (d == 0){
		selectX = -1
		selectY = -1
		drawField()
	}
	//клик на тайле рядом с выбранным - пробуем поменять их местами
	else if (d == 1){
		swapTiles(x,y)
	}
	//клик на тайле, не соседнем с выбранным, делает его новым выбранным
	else{
		selectX = x
		selectY = y
		drawField()
	}
}

function isCorrectTile(x, y){
	return x >= 0 && x < xTileCount && y >= 0 && y < yTileCount
}

//удалить изображение тайла [x,y]
function clearTile(x, y){
	ctx.clearRect(x * tileSize + xFieldOffset, y * tileSize + yFieldOffset, tileSize, tileSize);
}

//изобразить выделение для тайла [selectX, selectY]
function selectTile(){
	if (isCorrectTile(selectX, selectY))
		ctx.strokeRect(selectX*tileSize + xFieldOffset, selectY*tileSize + yFieldOffset, tileSize, tileSize)
}

//сдвинуть все тайлы, под которыми пусто, на 1 строку вниз - шаг анимации
function moveTilesTick(columnsToMove)
{
	if (tick >= animationTicks)
		return
	tick++

	ctx.clearRect(0, 0, canvas.width, yFieldOffset);
	for (x = 0; x < xTileCount; x++)
		for (y = columnsToMove[x]; y >= 0; y--)
			clearTile(x,y)
	selectTile()

	part = tick/animationTicks
	for (x = 0; x < xTileCount; x++)
		for (y = columnsToMove[x]; y >= 0; y--)
			drawTile(x, y, 0, (part-1)*tileSize)
}

//сдвинуть все тайлы, под которыми пусто, на 1 строку вниз; создать новые тайлы для верхней строки
function moveAndCreateTiles(){
	columnsToMove = Array(xTileCount).fill(-1)//номер нижнего передвигаемого тайла в каждой колонке
	for (x = 0; x < xTileCount; x++)
		for (y = 0; y < yTileCount; y++)
			if (tiles[x][y] == -1)
				columnsToMove[x] = y 

	numOfMoved = 0
	for (x = 0; x < xTileCount; x++){
		for (y = columnsToMove[x]; y > 0; y--)
			tiles[x][y] = tiles[x][y-1]
		if(columnsToMove[x] > -1){
			tiles[x][0] = Math.floor(Math.random() * tileIdCount)
		numOfMoved++
		}
	}

	if (numOfMoved == 0)
	{
		//все тайлы лежат стабильно и больше не падают
		//теперь можем проверять, не образовались ли при падении новые линии
		tilesToDelete = checkLines()
		if (tilesToDelete.length > 0)
			deleteTiles(tilesToDelete)
		return
	}

	tick = 1
	let intervalId = setInterval(moveTilesTick, animationTime/animationTicks, columnsToMove);
	waitForAnimation().then(() => {
		clearInterval(intervalId)
		moveAndCreateTiles()//возможно, есть куда падать дальше
	});
}

//удалить тайлы, образующие линии - шаг анимации по их "сжатию в точку"
function deleteTilesTick(tilesToDelete)
{
	if (tick >= animationTicks)
		return
	tick++

	for (tile of tilesToDelete)
		clearTile(tile.x,tile.y)
	selectTile()

	part = tick/animationTicks
	for (tile of tilesToDelete)
		drawTile(tile.x, tile.y, 0, 0, 1 - part)
}

//удалить тайлы, образующие линии
function deleteTiles(tilesToDelete){
	tick = 1
	let intervalId = setInterval(deleteTilesTick, animationTime/animationTicks, tilesToDelete);
	waitForAnimation().then(() => {
		clearInterval(intervalId)
		for(tile of tilesToDelete)
			tiles[tile.x][tile.y] = -1
		moveAndCreateTiles()
	});
}	

//обмен тайлов [x1,y1] и [x2,y2] - шаг анимации по движению навстречу
function swapTilesTick(x1, y1, x2, y2)
{
	if (tick >= animationTicks)
		return
	tick++

	clearTile(x1,y1)
	clearTile(x2,y2)
	selectTile()

	part = tick/animationTicks
	xOffset = (1-part)*(x2-x1) * tileSize
	yOffset = (1-part)*(y2-y1) * tileSize
	drawTile(x1, y1, xOffset, yOffset)
	drawTile(x2, y2, -xOffset, -yOffset)
}

//попытаться поменять местами тайл [x,y] с [selectX, selectY], если удалось - обработать последствия
function swapTiles(x,y){
	[tiles[x][y], tiles[selectX][selectY]] = [tiles[selectX][selectY], tiles[x][y]]
	tilesToDelete = checkLines()
	if (tilesToDelete.length == 0){
		//ход невозможен, т.к. не образовалось ни одной линии
		//отменяем перестановку
		[tiles[x][y], tiles[selectX][selectY]] = [tiles[selectX][selectY], tiles[x][y]]
		return
	}

	tick = 1
	let intervalId = setInterval(swapTilesTick, animationTime/animationTicks, x, y, selectX, selectY);
	waitForAnimation().then(() => {
		clearInterval(intervalId)
		deleteTiles(tilesToDelete)
		selectX = -1
		selectY = -1
		drawField()
	});
}

//отрисовать тайл [x,y], возможно со сдвигом/масштабированием
function drawTile(x, y, xOffset, yOffset, scale){
	if (xOffset === undefined)
		xOffset = 0
	if (yOffset === undefined)
		yOffset = 0
	if (scale == undefined)
		scale = 1

	id = tiles[x][y]
	if (id < 0 || id >= tileIdCount)
		return
	var xPos = xFieldOffset + x*tileSize
	var yPos = yFieldOffset + y*tileSize
	ctx.drawImage(tileResources[id], xPos + xOffset, yPos + yOffset, tileSize*scale, tileSize*scale)
}

//отрисовать игровое поле полностью
function drawField(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (x = 0; x < xTileCount; x++)
		for (y = 0; y < yTileCount; y++)
			drawTile(x,y)
	selectTile()
}

//найти все собранные линии на поле, вернуть список соответствующих тайлов для удаления
function checkLines()
{
	tilesToDelete = []
	equalTilesCounter = 0
	
	//ищем вертикальные линии
	for (x = 0; x < xTileCount; x++){
		for (y = 0; y <= yTileCount; y++){//равенство (<=) для линий, доходящих до края поля
			if (y > 0 && y < yTileCount && tiles[x][y] == tiles[x][y-1] && tiles[x][y] > -1){
				equalTilesCounter++
				continue	
			}
			if (equalTilesCounter >= lineLength)
				for (cnt = 0; cnt < equalTilesCounter; cnt++)
					tilesToDelete.push({x:x, y:y-1-cnt})
			equalTilesCounter = 1
		}
	}
	
	//ищем горизонтальные линии
	for (y = 0; y < yTileCount; y++){
		for (x = 0; x <= xTileCount; x++){//равенство (<=) для линий, доходящих до края поля
			if (x > 0 && x < xTileCount && tiles[x][y] == tiles[x-1][y] && tiles[x][y] > -1){
				equalTilesCounter++
				continue	
			}
			if (equalTilesCounter >= lineLength)
				for (cnt = 0; cnt < equalTilesCounter; cnt++)
					tilesToDelete.push({x:x-1-cnt, y:y})
			equalTilesCounter = 1
		}
	}
	
	addScore(tilesToDelete)
	return tilesToDelete;
}

var scores = 0;
function addScore(tilesToDelete) {
	scores += tilesToDelete.length; //Увеличиваем кол-во очков на то, сколько тайлов было удалено
	document.getElementById('scores').innerHTML = scores; //Заданием элементу значение, равное новому кол-ву очков
}