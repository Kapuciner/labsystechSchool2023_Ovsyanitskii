/**
 * Created by andrey on 08.05.2022.
 */
var Level = function () {
    //Русский алфавит. 
    this.alphabet = ["а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь","э","ю","я"];
    
    //Обработка русского словаря
    this.rusPopPrepared = this.prepareVocabularyPopular();

    minlength = 3; //минимальная длина исходного слова
    maxlength = 7; //максимальная длина исходного слова
    minsubwords = 4; //минимальное кол-во слов, которые можно составить
    maxsubwords = 9; //максимальное кол-во слов, которые можно составить
    subwordsminlen = 4; //Минимальная длина слов, которые можно составить
    this.mainWord = [];
    this.moneyCount = 150;
    //Выбор случайного слова и слов для отгадывания по вышеописанным условиям
    let randWordResult= this.getRandomWord(this.rusPopPrepared,  minlength-2,maxlength-2,minsubwords,maxsubwords,subwordsminlen);
    this.mainWord = randWordResult[0];
    this.wordsToSolve = randWordResult[1];
    this.wordsToSolveLogic = [];
    //Для каждого слова создается логика
    for(let i = 0; i < this.wordsToSolve.length; i++){
        this.wordsToSolveLogic.push(new WordLogic(this.wordsToSolve[i]));
    }
    this.playVictoryAnimation = function () {};
    this.clearPressedLetters = function () {};
    
};
//Функция для обработки словаря
Level.prototype.prepareVocabularyPopular = function () {
    var alphabetDict = {}
    //Список словарей с различной длиной слова для упрощения вывода и сортировки
    var dictsByLen = [] ;
    for(let i = 0; i < 20; i++){
        dictsByLen.push([]);
    }
    //Создание заготовки для хранения слов в виде словаря вида "Буква": "Кол-во таких букв в слове"
    for(letter of this.alphabet){ 
        alphabetDict[letter] = 0; 
    }   
    //Создание словаря для каждого слова в представленном словаре и распределение их по длине.
    var wordID = 0;
    for (wordIn of rusPop){ 
        let alphabetDictLocal = {...alphabetDict}
        let wordLetters = wordIn.split("")
        for (letter of wordLetters){
            alphabetDictLocal[letter]++
        }
        alphabetDictLocal["id"] = wordID
        wordID++
        dictsByLen[wordIn.length-2].push(alphabetDictLocal)
    }
    return dictsByLen;
};
//Функция для получения случайного слова. 
Level.prototype.getRandomWord = function (dictsByLen, minlength, maxlength, minsubwords, maxsubwords, subwordsminlen) {
    randLen = Math.floor(Math.random() * (maxlength-minlength) + minlength);
    for(var i = 0; i < 1000; i++){
        randWord = rusPop[dictsByLen[randLen+1][Math.floor(Math.random() * dictsByLen[randLen+1].length)]["id"]];
        subwords = this.getEveryWordOfLetters(randWord, subwordsminlen);
        if(subwords.length >= minsubwords && subwords.length <= maxsubwords) return [randWord, subwords];
    }
    return "Error, no word found";
};
//Функция для получения всех слов минимальной длины, которые можно составить из данного слова.
Level.prototype.getEveryWordOfLetters = function (word, minLength) {
    var dictsByLen = this.rusPopPrepared;
    var alphabetDict = {}
    for(letter of this.alphabet){ 
        alphabetDict[letter] = 0; 
    }  
    
    //Создание словаря для слова из входного значения
    var wordDict = {...alphabetDict}
    let wordLetters = word;
    for (letter of wordLetters){
        wordDict[letter]++
    }

    //Сравниванием побуквенно слово из входного значения со словами из подготовленного словаря. 
    var goodWords = []
    for(dictsArr of dictsByLen.slice(minLength-2)){
        for(dict of dictsArr){
            var isGoodWord = true;
            for(key of Object.keys(alphabetDict))
            {               
                if(wordDict[key] < dict[key]){
                    isGoodWord = false;
                    break;
                }
            }
            if(isGoodWord){
                goodWords.push(rusPop[dict['id']])
            }
        }
    }
    return goodWords;
};
//Обновление отгаданных слов при изменении набранного слова
Level.prototype.updateWithPressedWord = function (pressedWord){
    for(wordLogic of this.wordsToSolveLogic){
        if(!wordLogic.isSolved && wordLogic.checkIfCorrectWord(pressedWord)){
            //Таймаут для того, чтобы успела проиграться анимация вех букв
            setTimeout(() => {
                this.clearPressedLetters();
            }, 100);
        } 
    }
    this.checkForVictory();
};
//Проверка на победу если не осталось неотгаданных слов
Level.prototype.checkForVictory = function (){
    var isAllSolvedFlag = true;
    for(wordLogic of this.wordsToSolveLogic){
        if(!wordLogic.isSolved){
            isAllSolvedFlag = false;
            break;
        }
    }
    if(isAllSolvedFlag){
        this.playVictoryAnimation();
    } 
};
//Выбор случайного слова из неотгаданных
Level.prototype.openRandomLetter = function (){
    let notSolvedWords = [];
    for(wordLogic of this.wordsToSolveLogic){
        if(!wordLogic.isSolved){
            notSolvedWords.push(wordLogic);
        } 
    }
    let randUnsolvedWord = notSolvedWords[Math.floor(Math.random() * notSolvedWords.length)];
    randUnsolvedWord.openRandomCell();
};
//Логика слова
var WordLogic = function (word) {
    this.wordText = word;
    this.isSolved = false;
    this.lightWordCells = function () {};
    this.openRandomCell = function () {};
}; 
//Проверка на корректность слова
WordLogic.prototype.checkIfCorrectWord = function (wordToCheck){
    if(this.wordText === wordToCheck){
        this.lightWordCells(); 
        this.isSolved = true;
        return true;
    } 
    return false;
};
