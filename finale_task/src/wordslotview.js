
//Вью для ячеек под одно отгадываемое слово
var wordSlotView = cc.Node.extend({
    ctor: function (position, wordLogic) {
        this._super();
        this.wordLogic = wordLogic;
        this.letters = this.wordLogic.wordText.split("");
        this.cells = [];
        this.position = position;
        this.cellSize = cc.spriteFrameCache.getSpriteFrame('cell.png').getOriginalSize().width;
        this.cellSize = this.cellSize*60/this.cellSize;
        this.wordLogic.lightWordCells = this.lightCells.bind(this);
        this.wordLogic.openRandomCell = this.openRandomCell.bind(this);
        this.createCells();
    },
    //Создание пустых ячеек под буквы
    createCells: function() {
        for(let i = 0; i < this.wordLogic.wordText.length; i++){
            let newWordView = new ccui.ImageView('cell.png', ccui.Widget.PLIST_TEXTURE);
            newWordView.setScale9Enabled(true);
            newWordView.setCapInsets(cc.rect(20, 20, 2, 2));
            newWordView.setContentSize(this.cellSize, this.cellSize);

            centerValue = Math.ceil(this.wordLogic.wordText.length/2);

            if(i <= centerValue){
                newWordView.setPosition(this.position[0]-(this.wordLogic.wordText.length-i-centerValue)*this.cellSize, this.position[1]);
            }
            else{
                newWordView.setPosition(this.position[0]-(this.wordLogic.wordText.length-i-centerValue)*this.cellSize, this.position[1]);
            }

            this.cells.push([newWordView,false]);
            this.addChild(newWordView);
        }
        
    },
    //Замена указанной пустой ячейки на букву
    openCell: function(indexOfCell, delay = 0.1) {
        console.log(rutoeng[this.letters[indexOfCell]] +'.png');
        this.cellLetter = new ccui.ImageView('rus/' +rutoeng[this.letters[indexOfCell]] +'.png', ccui.Widget.PLIST_TEXTURE);
        this.cellLetter.setScale(60/this.cellSize-0.1);
        this.cellLetter.setLocalZOrder(1);
        this.cellLetter.setPosition(this.cells[indexOfCell][0].width/2,this.cells[indexOfCell][0].height/2);

        this.cells[indexOfCell][0].loadTexture('letter_bg.png', ccui.Widget.PLIST_TEXTURE);
        this.cells[indexOfCell][0].setScale(1.1);
        this.cells[indexOfCell][0].runAction(new cc.Sequence(
            new cc.DelayTime(delay),
            new cc.ScaleTo(0.3, 1.0)
        ));
        this.cells[indexOfCell][0].addChild(this.cellLetter);
        this.cells[indexOfCell][1] = true;
    },
    //Функция открытия случайной ячейки, для подсказки
    openRandomCell: function() {
        let notSolvedCellsIndexes = [];
        for(let i = 0; i < this.cells.length; i++){
            if(!this.cells[i][1]){
                notSolvedCellsIndexes.push(i);
            } 
        }
        let randNotSolvedCellsIndex = notSolvedCellsIndexes[Math.floor(Math.random() * notSolvedCellsIndexes.length)];
        this.openCell(randNotSolvedCellsIndex);
        this.checkIfFullOpen();
    },
    //Проверка, не являются ли все ячейки заполнены. Необходима, если победа достигается подсказкой
    checkIfFullOpen:  function() {
        let notSolvedCellsIndexes = [];
        for(let i = 0; i < this.cells.length; i++){
            if(!this.cells[i][1]){
                notSolvedCellsIndexes.push(i);
            } 
        }
        if(notSolvedCellsIndexes.length == 0) this.wordLogic.isSolved = true;
    },
    //Открытие всех ячеек слова если оно было отгадано
    lightCells: function() {
        for(let i = 0; i < this.cells.length; i++){
            if(this.cells[i][1] == false){
                this.openCell(i, i*0.1);
            }
        }
    },
});
