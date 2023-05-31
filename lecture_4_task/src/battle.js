/**
 * Created by andrey on 08.05.2022.
 */

var Battle = function () {
    //Добавление массивов, в которых будут храниться вьюшки солдат и врагов
    this.soldersArr = [];
    this.enemiesArr = [];
    //Установка максимума рандома солдат и врагов. Максимум 6, далее проблемы с размещением на экране. 
    let maxsolders = 6;
    let maxenemies = 6;
    
    this.fightersCount = [Math.floor(Math.random() * maxsolders)+1, Math.floor(Math.random() * maxenemies)+1];
    for (let i = 0; i < this.fightersCount[0]; i++) {
        this.soldersArr.push(new Solder('solder'));
    }
    for (let i = 0; i < this.fightersCount[1]; i++) {
        this.enemiesArr.push(new Solder('enemy'));
    }

    this.coins = 100;
    this.booster = new Booster(this);

    //Функции из battlescene, вызывающие победные анимации для каждой из сторон
    this.soldersWin = function () {
    };
    this.enemiesWin = function () {
    };
    setTimeout(this.start.bind(this), 3000);
};

Battle.prototype.start = function () {
    this.running = true;

    console.log("Started!");
    this.enemyTimers = [];
    this.interval = setInterval(this.run.bind(this), 100);
    //Солдаты атакуют одновременно каждую секунду
    this.soldersInterval = setInterval(this.soldersAttack.bind(this), 1000);
};

Battle.prototype.run = function () {
    //Проверка, остался ли кто-либо живой на обеих сторонах
    let allowedEnemies = this.searchAliveEmenies();
    let allowedSolders = this.searchAliveSolders();
    if(allowedEnemies.length === 0){
        this.stop();
        this.soldersWin();
        return;
    } else if(allowedSolders.length === 0){
        this.stop();
        this.enemiesWin();
        return;
    }
    //Обновление таймера атаки для врагов
    for(let i = 0; i < this.enemiesArr.length; i++){
        if (this.enemyTimers[i] = null && this.enemiesArr[i].isAlive()) {
            this.enemyTimers[i] = Date.now() +
            Math.random() * (Battle.ENEMY_INTERVAL[1] - Battle.ENEMY_INTERVAL[0]) + Battle.ENEMY_INTERVAL[0];
        }
    }
    //Атака отдельным врагом солдат каждый раз, когда наступает время атаки
    for(let i = 0; i < this.enemiesArr.length; i++){
        if (Date.now() > this.enemyTimers[i]) {
            this.enemyAttack(this.enemiesArr[i]);
            this.enemyTimers[i] = null;
        }
    }
};

//Функция поиска оставшихся в живых солдат
Battle.prototype.searchAliveSolders = function() {
    let allowedSolders = [];
    for(let i = 0; i < this.soldersArr.length; i++){
        if(this.soldersArr[i].isAlive()) allowedSolders.push(i);
    }
    return allowedSolders;
};

//Функция поиска оставшихся в живых врагов
Battle.prototype.searchAliveEmenies = function() {
    let allowedEnemies = [];
    for(let i = 0; i < this.enemiesArr.length; i++){
        if(this.enemiesArr[i].isAlive()) allowedEnemies.push(i);
    }
    return allowedEnemies;
};

//Единовременная атака всех солдат
Battle.prototype.soldersAttack = function() {
    let allowedEnemies = this.searchAliveEmenies();
    if(allowedEnemies.length > 0){
        for(let solderAttacker of this.soldersArr){
            if(solderAttacker.isAlive()){
                solderAttacker.attack(this.enemiesArr[allowedEnemies[Math.floor(Math.random() * allowedEnemies.length)]]);
            }
        }
    }
};

//Атака одним из врагов случайного солдата
Battle.prototype.enemyAttack = function(enemy) {
    let allowedSolders = this.searchAliveSolders();
    if(allowedSolders.length > 0) enemy.attack(this.soldersArr[allowedSolders[Math.floor(Math.random() * allowedSolders.length)]]);
};

//Обновление текущих монет в битве
Battle.prototype.updateCoinsState = function(change) {
    this.coins += change;
};

Battle.prototype.stop = function () {
    this.running = false;

    console.log("Stopped!");

    clearInterval(this.interval);
};

Battle.ENEMY_INTERVAL = [2000, 3000];


var Booster = function (battlearg) {
    this.battle = battlearg;
    this.soldersArr = battlearg.soldersArr;
    this.enemiesArr = battlearg.enemiesArr;
    this.blockBooster = function() {
    };
};

Booster.prototype.useBooster = function() {
    this.battle.updateCoinsState(Booster.COST);
    var minHPSolderIndex = -1;
    var minHPSolder = 100000;
    for(let i = 0; i < this.soldersArr.length; i++){
        if(this.soldersArr[i].isAlive() && this.soldersArr[i].hp < minHPSolder){
            minHPSolderIndex = i;
            minHPSolder = this.soldersArr[i].hp;
        }
    }   
    this.soldersArr[minHPSolderIndex].takeHeal(50);
    if(this.battle.coins < 50) this.blockBooster();
};
Booster.COST = -50;  