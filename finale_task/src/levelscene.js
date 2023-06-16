/**
 * Created by andrey on 06.05.2022.
 */
var LevelScene = cc.Scene.extend({
    ctor: function () {
        this._super();
        cc.audioEngine.playMusic(resources.basic_music, true);
        cc.audioEngine.setMusicVolume(0.5);
        //Создаем логику уровня
        this.levelLogic = new Level();
        //Добавляем фон для игры и слотов под слова
        this.addBackground();
        this.addWordBackground();
        //Создаем координаты для слов и кнопок-букв
        this.wordsToSolveCoords = this.generateLayoutForWords();
        this.letterButtonsPos = this.createPointsForLetters(120, this.levelLogic.wordsToSolve[this.levelLogic.wordsToSolve.length-1].length);
        //Необходимые списки элементов и компонентов для уровня
        this.letterButtonsList = [];
        this.wordCells = [];
        this.linesList = [];
        this.pressedArray = [];
        //Создаем ячейки под буквы, кнопки-буквы, список слов сверху экрана, строку текущего набранного слова, счетчик монет
        this.createLetterCells();
        this.addLetterButtons();
        this.printWordsList();
        this.createCurrentLettersLabel();
        this.moneyCountLabel = this.addMoneyCounter();
        //Добавляем дополнительные кнопки: сброс, перемешивание, подсказка
        this.addResetButton();
        this.addShuffleButton();
        this.addHelpButton();
        

        this.levelLogic.playVictoryAnimation = this.playVictoryAnimation.bind(this);
        this.levelLogic.clearPressedLetters = this.clearPressedLetters.bind(this);
    },
    //Функция для перерисовывания линий
    redrawLinesBetweenLastButtons: function () {
        this.clearLines();
        if(this.pressedArray.length < 2) return;
        //Функция для нахождения угла для линии по вектору от одной кнопки-буквы до другой
        getAngle = function(x,y){
            var angle = Math.atan2(y, x);
            var degrees = 180*angle/Math.PI;
            return -(360+Math.round(degrees))%360; 
        }
        for(let i = 1; i < this.pressedArray.length; i++){          
            //Получаем элементы, которые необходимо соеденить линией и их координаты
            firstEl = this.letterButtonsList[this.pressedArray[i-1][0]];
            secondEl = this.letterButtonsList[this.pressedArray[i][0]];
            firstElPos = firstEl.getPosition();
            secondElPos = secondEl.getPosition();
            //Высчитывает вектор от одной кнопки до другой и находим среднюю точку между ними
            vectorDelta = [firstElPos["x"] - secondElPos["x"], firstElPos["y"] - secondElPos["y"]];
            vectorDeltaLength = Math.sqrt(Math.pow(vectorDelta[0],2) + Math.pow(vectorDelta[1],2));
            midPoind = [firstElPos["x"] - (firstElPos["x"] - secondElPos["x"])/2,firstElPos["y"] - (firstElPos["y"] - secondElPos["y"])/2]
            //Отрисовываем линию
            var lineSize = cc.spriteFrameCache.getSpriteFrame('line.png').getOriginalSize();
            var lineView = new ccui.ImageView('line.png', ccui.Widget.PLIST_TEXTURE);
            lineView.setPosition(midPoind[0], midPoind[1]);
            lineView.setScale9Enabled(true);
            lineView.setLocalZOrder(-0.5);
            lineView.setCapInsets(cc.rect(lineSize.width / 2 - 1, lineSize.height / 2 - 1, 2, 2));
            lineView.setRotation(getAngle(vectorDelta[0], vectorDelta[1]));
            lineView.setContentSize(vectorDeltaLength, 10);
            this.linesList.push(lineView);
            this.addChild(lineView);
        }
    },
    //Функция для очистки нарисованных линий
    clearLines: function () {
        for(line of this.linesList){
            line.removeFromParent();
        }
        this.linesList = [];
    },
    //Функция для отрисовывания задника поля
    addBackground: function () {
        var background = new cc.Sprite(resources.background);
        background.setScale(Math.max(this.width / background.width, this.height / background.height));
        background.setPosition(this.width / 2, this.height / 2);
        background.setLocalZOrder(-1);
        background.runAction(cc.scaleTo(1,background.scale*1.1,background.scale*1.1));
        this.addChild(background);
    },
    //Функция для отрисовывания задника для слотов под поля
    addWordBackground: function () {
        this.wordBackground = new ccui.ImageView('board_bg.png', ccui.Widget.PLIST_TEXTURE);
        this.wordBackground.setScale9Enabled(true);
        this.wordBackground.setCapInsets(cc.rect(20, 20, 20, 20));
        this.wordBackground.setContentSize(this.width*1.2, this.height/2.6);
        this.wordBackground.setLocalZOrder(0);
        this.wordBackground.setPosition(this.width/2, this.height-this.height/3);
        this.addChild(this.wordBackground);

    },
    //Добавление кнопки сброса набранного слова
    addResetButton: function () {
        var buttonSize = cc.spriteFrameCache.getSpriteFrame('button.png').getOriginalSize();
        this.resetButton = new ccui.Button('button.png', 'button_on.png', 'button_off.png', ccui.Widget.PLIST_TEXTURE);
        this.resetButton.setScale9Enabled(true);
        this.resetButton.setContentSize(200, 50);
        this.resetButton.setCapInsets(cc.rect(buttonSize.width / 2 - 1, buttonSize.height / 2 - 1, 2, 2));
        this.resetButton.setPosition(this.width / 2, this.height-(this.height/3)*1.65);
        this.resetButton.setTitleText("СБРОС");
        this.resetButton.setTitleFontSize(32);
        this.resetButton.setTitleFontName(resources.marvin_round.name);
        this.resetButton.addClickEventListener(function () {
            this.clearPressedLetters();
            this.clearLines();
        }.bind(this));
        this.addChild(this.resetButton);
    },
    //Добавление кнопки для подсказки
    addHelpButton: function () {
        var buttonSize = cc.spriteFrameCache.getSpriteFrame('button.png').getOriginalSize();
        this.helpButton = new ccui.Button('button.png', 'button_on.png', 'button_off.png', ccui.Widget.PLIST_TEXTURE);
        this.helpButton.setScale9Enabled(true);
        this.helpButton.setContentSize(300, 120);//Добавить скейл
        this.helpButton.setCapInsets(cc.rect(buttonSize.width / 2 - 1, buttonSize.height / 2 - 1, 2, 2));
        this.helpButton.setPosition(this.width / 2 +this.width / 3, this.height-(this.height/3)*1.75);
        this.helpButton.addClickEventListener(function () {
            if(this.levelLogic.moneyCount >= 50){
                this.levelLogic.moneyCount -= 50;
                this.levelLogic.openRandomLetter();
                this.levelLogic.checkForVictory();
                this.updateMoneyCounter();
            }
        }.bind(this));
        this.addChild(this.helpButton);
        this.helpLabel = new ccui.Text();
        this.helpLabel.setFontSize(35);
        this.helpLabel.setString("ПОДСКАЗКА\n     50 C");
        this.helpLabel.setFontName(resources.marvin_round.name);
        this.helpLabel.setPosition(this.helpButton.width/2,this.helpButton.height/2);
        this.helpButton.addChild(this.helpLabel);
    },
    //Добавление кнопки для перемешивания
    addShuffleButton: function () {
        var buttonSize = cc.spriteFrameCache.getSpriteFrame('shuffle.png').getOriginalSize();
        let basicPosition = [this.width/2, this.height-this.height/2.5*2];
        this.shuffleButton = new ccui.Button('shuffle.png', 'shuffle_on.png', 'shuffle.png', ccui.Widget.PLIST_TEXTURE);
        this.shuffleButton.setScale9Enabled(true);
        this.shuffleButton.setCapInsets(cc.rect(buttonSize.width / 2 - 1, buttonSize.height / 2 - 1, 2, 2));
        this.shuffleButton.setPosition(basicPosition[0], basicPosition[1]);
        this.shuffleButton.addClickEventListener(function () {
            this.shuffleLetterButtons();
            this.clearPressedLetters();
            this.clearLines();
            this.shuffleButton.setEnabled(false);
            setTimeout(() => {
                this.shuffleButton.setEnabled(true);
            }, 1000);
        }.bind(this));
        this.addChild(this.shuffleButton);
    },
    //Добавление счетчика денег
    addMoneyCounter: function () {
        var barSize = cc.spriteFrameCache.getSpriteFrame('bar_bg.png').getOriginalSize();
        var moneyCounterBack = new ccui.ImageView('bar_bg.png', ccui.Widget.PLIST_TEXTURE);
        moneyCounterBack.setScale9Enabled(true);
        moneyCounterBack.setCapInsets(cc.rect(barSize.width / 2 - 1, barSize.height / 2 - 1, 2, 2));
        moneyCounterBack.setContentSize(200,100);
        moneyCounterBack.setLocalZOrder(0);
        moneyCounterBack.setPosition(this.width/8, this.height-this.height/11);

        this.addChild(moneyCounterBack);
        var moneyCounterLabel = new ccui.Text();
        moneyCounterLabel.setString(this.levelLogic.moneyCount + " C");
        moneyCounterLabel.setPosition(moneyCounterBack.width / 2, moneyCounterBack.height / 2);
        moneyCounterLabel.setFontSize(32);
        moneyCounterBack.setLocalZOrder(1);
        moneyCounterLabel.setFontName(resources.marvin_round.name);
        moneyCounterBack.addChild(moneyCounterLabel);
        return moneyCounterLabel;      
    },
    //Обновления счетчика денег
    updateMoneyCounter: function () {
        this.moneyCountLabel.setString(this.levelLogic.moneyCount + " C");
    },
    //Перемешивание координат для кнопок-букв
    shuffleLetterButtons: function () {
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        let shuffledPositions1 = shuffleArray(this.letterButtonsPos.slice(0));
        let shuffledPositions2 = shuffleArray(shuffledPositions1.slice(0));
        let shuffledPositions3 = shuffleArray(shuffledPositions2.slice(0));
        for(let i = 0; i <  this.letterButtonsList.length; i++){
            this.letterButtonsList[i].runAction(new cc.Sequence(
                new cc.MoveTo(0.3, shuffledPositions1[i][0], shuffledPositions1[i][1]),
                new cc.MoveTo(0.3, shuffledPositions2[i][0], shuffledPositions2[i][1]),
                new cc.MoveTo(0.3, shuffledPositions3[i][0], shuffledPositions3[i][1])
            ));
        }
    },
    //Создание координат для слотов под слова
    generateLayoutForWords: function () {
        let maxWordLen = this.levelLogic.wordsToSolve[this.levelLogic.wordsToSolve.length-1].length;
        let columnsX = [];
        let rowsY = [];
        let wordsToSolveCoords = [];
        let numOfrows =  Math.ceil(this.levelLogic.wordsToSolve.length / 3);
        var boxsize = cc.spriteFrameCache.getSpriteFrame('cell.png').getOriginalSize().width;
        boxsize = boxsize*60/boxsize;
        columnsX.push(this.wordBackground.width/2 - boxsize*(maxWordLen+1));
        columnsX.push(this.wordBackground.width/2);
        columnsX.push(this.wordBackground.width/2 + boxsize*(maxWordLen+1));
        for(let i = 0; i < numOfrows; i++){
            rowsY.push(this.wordBackground.height-this.wordBackground.height/4 - i*(boxsize+boxsize*60/boxsize));
        }
        for(let i = 0; i < this.levelLogic.wordsToSolve.length; i++){  
            wordsToSolveCoords.push([columnsX[i%3], rowsY[Math.floor(i/3)] ]);   
        }
        return wordsToSolveCoords;
    },
    //Добавление ячеек под слова
    createLetterCells: function () {
        for(let i = 0; i < this.levelLogic.wordsToSolve.length; i++){
            this.word = new wordSlotView([this.wordsToSolveCoords[i][0], this.wordsToSolveCoords[i][1]], this.levelLogic.wordsToSolveLogic[i]);
            this.wordBackground.addChild(this.word);
        }
    },
    //Создание координат для кнопок-букв
    createPointsForLetters: function (radius, numOfPoints) {
        let deltaDegree = 360/numOfPoints;
        let basicPosition = [this.width/2, this.height-this.height/2.5*2];
        let pointsArr = [];
        for(var i = 0; i < 360; i += deltaDegree){
            var xp = Math.floor(basicPosition[0] + radius *  Math.sin(i*Math.PI/180));
            var yp =  Math.floor(basicPosition[1] + radius *  Math.cos(i*Math.PI/180));
            pointsArr.push([xp,yp]);
        }
        return pointsArr;
    },
    //Добавление списка слов сверху
    printWordsList: function () {
        this.wordsListLabel = new ccui.Text();
        this.wordsListLabel.setString(this.levelLogic.wordsToSolve);
        this.wordsListLabel.setFontSize(35);
        this.wordsListLabel.setPosition(this.width/2,this.height-this.height/10);
        this.wordsListLabel.setFontName(resources.marvin_round.name);
        this.addChild(this.wordsListLabel);
    },
    //Добавление кнопок-букв
    addLetterButtons: function () {
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        let shuffledPositions = shuffleArray(this.letterButtonsPos.slice(0));
        for(let i = 0; i < this.letterButtonsPos.length; i++){
            targetAngle = Math.floor(Math.random() * 20 - 10);
            let newButtonView = new letterButtonView(this.levelLogic.mainWord[i], i,targetAngle); 
            newButtonView.addToPressedButtons = this.addLetterToPressed.bind(this);
            newButtonView.removeFromPressedButtons = this.removeLetterFromPressed.bind(this);
            newButtonView.setPosition(shuffledPositions[i][0], shuffledPositions[i][1]);
            newButtonView.setRotation(targetAngle);
            this.letterButtonsList.push(newButtonView);
            this.addChild(newButtonView);
        }
    },
    //Добавление строки с текущими набранными буквами
    createCurrentLettersLabel: function () {
        this.currentLettersLabel = new ccui.Text();
        this.currentLettersLabel.setFontSize(35);
        this.currentLettersLabel.setPosition(this.width/2,this.height-(this.height/3)*1.85);
        this.currentLettersLabel.setFontName(resources.marvin_round.name);
        this.addChild(this.currentLettersLabel);
    },
     //Обновление строки с текущими набранными буквами
    updateCurrentLettersLabel: function () {
        let pressedWord = "";
        for(let i = 0; i < this.pressedArray.length; i++){
            pressedWord += this.pressedArray[i][1];
        }
        this.currentLettersLabel.setString(pressedWord.toUpperCase());
    },
    //Добавление буквы к списку нажатых
    addLetterToPressed: function (id, letter) {
        this.pressedArray.push([id, letter]);
        let pressedWord = "";
        for(let i = 0; i < this.pressedArray.length; i++){
            pressedWord += this.pressedArray[i][1];
        }
        
        this.updateCurrentLettersLabel();
        this.levelLogic.updateWithPressedWord(pressedWord);
        this.redrawLinesBetweenLastButtons();
    },
    //Удаление буквы из списка нажатых
    removeLetterFromPressed: function (id) {
        for( var i = 0; i < this.pressedArray.length; i++){      
            if ( this.pressedArray[i][0] == id) { 
                this.pressedArray.splice(i, 1); 
                i--; 
            }
        }
        let pressedWord = "";
        for(let i = 0; i < this.pressedArray.length; i++){
            pressedWord += this.pressedArray[i][1];
        }

        this.updateCurrentLettersLabel();
        this.levelLogic.updateWithPressedWord(pressedWord);
        this.redrawLinesBetweenLastButtons();
    },
    //Проверка, не является ли набранное слово одним из неотгаданных
    checkIfWordPressed: function () {
        let pressedWord = "";
        for(let i = 0; i < this.pressedArray.length; i++){
            pressedWord += this.pressedArray[i][1];
        }
        for(word of wordCells){
            if(word.wordText == pressedWord) word.lightCells();
        }
    },
    //Сброс набранного слова и состояния кнопок-букв
    clearPressedLetters: function () {
        this.pressedArray = [];
        this.updateCurrentLettersLabel();
        this.redrawLinesBetweenLastButtons();
        this.letterButtonsList.length;
        for(button of this.letterButtonsList){
            button.unlightButton();
        }
    },
    //Проигрыш анимации победы
    playVictoryAnimation: function () {
        cc.audioEngine.playMusic(resources.win_music, false);
        this.victoryAnimationground = new ccui.ImageView('res/victory/reward_bg.png', ccui.Widget.PLIST_TEXTURE);
        this.addChild(this.victoryAnimationground);
        this.victoryAnimation = sp.SkeletonAnimation.create(resources['victory_animation_json'], resources.game_atlas);
        this.victoryAnimation.setAnimation(0, "open", false);
        this.victoryAnimation.setPosition(this.width / 2, this.height / 2);
        this.victoryAnimation.setCompleteListener(function() {
            this.victoryAnimation.setAnimation(0, "idle", true);
         }.bind(this));
        this.addChild(this.victoryAnimation);
    }
});