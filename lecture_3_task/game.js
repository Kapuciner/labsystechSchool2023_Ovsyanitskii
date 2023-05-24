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
	
	tilesToDelete = addSpecialEffects(tilesToDelete)
	return tilesToDelete
}
//Проверяет находятся ли в поле 4 тайла-соседа
function look4AroudInSet(tile){
	let aroundTileSet = new Set();
	if(isCorrectTile(+tile[0]-1, +tile[2]))	aroundTileSet.add((+tile[0]-1).toString() + "," + (+tile[2]).toString());
	if(isCorrectTile(+tile[0], +tile[2]+1)) aroundTileSet.add((+tile[0]).toString() + "," + (+tile[2]+1).toString()); 
	if(isCorrectTile(+tile[0], +tile[2]-1)) aroundTileSet.add((+tile[0]).toString() + "," + (+tile[2]-1).toString()); 
	if(isCorrectTile(+tile[0]+1, +tile[2])) aroundTileSet.add((+tile[0]+1).toString() + "," + (+tile[2]).toString()); 
	return aroundTileSet; //Возврат значения в формате множества с элементами "1,1", "2,2"
}
//Возвращает все соединенные с данными клетками клетки указанного цвета
function findAllColorNeighbourTiles(tilesArray, color){
	let neighbourTilesSet = new Set();
	//Преобразуем массив	 в множество
	for(let tile of tilesArray){
		neighbourTilesSet.add(tile.x.toString() + "," + (tile.y).toString());
	}
	//Делаем глубокую копию
	let lastIterationNeighboursSet = new Set(JSON.parse(JSON.stringify(Array.from(neighbourTilesSet)) ));
	var newIterationNeighboursSet = new Set();
	//При каждой итерации добавляем все клетки-соседи с подходящим цветом и не находящиеся в множестве уже добавленных
	do	{	
		for(let tileString of lastIterationNeighboursSet){
			for(let aroundTile of look4AroudInSet(tileString)){
				if(!neighbourTilesSet.has(aroundTile) && tiles[+aroundTile[0]][+aroundTile[2]] === color){
					newIterationNeighboursSet.add(aroundTile);
				} 
			}
		}
		neighbourTilesSet = new Set([...neighbourTilesSet, ...newIterationNeighboursSet]);
		lastIterationNeighboursSet = newIterationNeighboursSet;
		newIterationNeighboursSet = new Set();
	} while (lastIterationNeighboursSet.size > 0); //Повторяем пока в ходе итераций не найдется ни один новый тайл
	return neighbourTilesSet;//Возврат значения в формате множества с элементами "1,1", "2,2"
}
//Возвращает все допустимые клетки в указанном радиусе от всех клеток массива
function getTilesInSquareRadius(tilesArray, radius){
	let raduisTilesSet = new Set();
	//Преобразуем массив в множество
	for(let tile of tilesArray){
		raduisTilesSet.add(tile.x.toString() + "," + (tile.y).toString());
	}
	let lastIterationNeighboursSet = new Set(JSON.parse(JSON.stringify(Array.from(raduisTilesSet)) ));
	var newIterationNeighboursSet = new Set();
	//При каждой итерации добавляем всех соседей не находящиеся в множестве уже добавленных
	for(let i = 0; i < radius; i++){ //Кол-во итераций = радиусу
		for(let tileString of lastIterationNeighboursSet){
			for(let aroundTile of look4AroudInSet(tileString)){
				if(!raduisTilesSet.has(aroundTile)){
					newIterationNeighboursSet.add(aroundTile);
				} 
			}
		}
		raduisTilesSet = new Set([...raduisTilesSet, ...newIterationNeighboursSet]);
		lastIterationNeighboursSet = newIterationNeighboursSet;
		newIterationNeighboursSet = new Set();
	} 
	return raduisTilesSet;//Возврат значения в формате множества с элементами "1,1", "2,2"
}
//Разделяет массив удаляемых клеток по цветам
function splitTilesArray(tilesToDelete){
	var startPoint = 0;
	var endPoint = 0;
	var outArrays = [];
	//Разделяем удаляемые тайлы по изменению цвета
	for(let i = 0; i < tilesToDelete.length-1; i++){
		if(!(tiles[tilesToDelete[i].x][tilesToDelete[i].y] === tiles[tilesToDelete[i+1].x][tilesToDelete[i+1].y])){
			endPoint = i+1;
			outArrays.push(tilesToDelete.slice(startPoint,endPoint));
		}
		startPoint = endPoint;
	}
	if(endPoint < tilesToDelete.length){
		outArrays.push(tilesToDelete.slice(endPoint,tilesToDelete.length));
	} 
	return(outArrays); //Возвращает массив слайсов массива удаляемых тайлов
}
//специальные эффекты для удаляемых линий - дополнительные тайлы должны добавляться в массив tilesToDelete
//тайлы хранятся как объекты {x,y}, id содержимого тайлов (цвета) хранятся в глобальном массиве tiles[x][y]
function addSpecialEffects(tilesToDelete){
	//Проверяем эффекты только если удаляемых клеток больше 0
	if(tilesToDelete.length > 0){
		var resultSet = new Set();
		//Преобразуем массив в строковое представление для использование множеств
		for(let tile of tilesToDelete){
			resultSet.add(tile.x.toString() + "," + (tile.y).toString());
		}
		//Разделяем удаляемые клетки по цветам т.к. могут быть клетки с различными эффектами
		for(let row of splitTilesArray(tilesToDelete)){
			//Получаем подверженные эффекту клетки для каждого удаляемого цвета
			switch(tiles[row[0].x][row[0].y]) {
				case 2:  // Зеленые
					resultSet = new Set([...resultSet, ...getTilesInSquareRadius(row, 1)]);
					break;
					//1. При удалении клеток зеленой линии требуется
					//   удалять всех их соседей в радиусе 1 (по стороне).
					//   Например:
					//   (G - собранная зеленая линия, x - дополнительные удаляемые клетки любых цветов)
					//   .......
					//   ..xxx..
					//   .xGGGx.
					//   ..xxx..
					//   .......
					//   .......
					//
				case 1:  // Красные
					resultSet = new Set([...resultSet, ...getTilesInSquareRadius(row, 2)]);
					break;
					//2. При удалении клеток красной линии требуется
					//   удалять всех их соседей в радиусе 2 (по стороне).
					//   Например:
					//   (R - собранная красная линия, x - дополнительные удаляемые клетки любых цветов)
					//   xxxx...
					//   RRRxx..
					//   xxxx...
					//   xxx....
					//   .......
					//   .......
					//
				case 4: // Желтые
					resultSet = new Set([...resultSet, ...findAllColorNeighbourTiles(tilesToDelete, 4)]);
					break;
					//3. При удалении клеток желтой линии требуется удалять
					//   все смежные области из желтых клеток, даже если они не образуют линию.
					//   Например:
					//   (Y - собранная желтая линия, x - дополнительные удаляемые клетки желтого цвета)
					//   .......
					//   .....x.
					//   ....xx.
					//   ..YYY..
					//   .xx....
					//   xx.....
		  	}
		}
		//Преобразуем результат из множества в массив
		var outArray = [];
		for(let tileString of resultSet){
			let splittedTile = tileString.split(",").map(Number)
			let convertedTile = {
				x: splittedTile[0],
				y: splittedTile[1]
			}
			outArray.push(convertedTile);
		}
		tilesToDelete = outArray;
	}
	return tilesToDelete
}