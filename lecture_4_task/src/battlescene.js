/**
 * Created by andrey on 06.05.2022.
 */
var BattleScene = cc.Scene.extend({
    ctor: function () {
        this._super();

        this.battle = new Battle();
        //Добавляем в battle возможность вызова анимации победы
        this.battle.soldersWin = this.solderWinAnimation.bind(this);
        this.battle.enemiesWin = this.emenyWinAnimation.bind(this);
        this.addBackground();
        //Заполняем массивы солдат и врагов, хранящиеся в battle
        //Их количество определяется рандомом в battle
        this.soldersPositions, this.enemiesPositions = this.generateSoldersPositions();
        for(let i = 0; i < this.battle.soldersArr.length; i++){
            let newSolderView = new SolderView(this.battle.soldersArr[i]);
            newSolderView.setPosition(this.soldersPositions[i][0], this.soldersPositions[i][1]);
            this.addChild(newSolderView);       
        }
        for(let i = 0; i < this.battle.enemiesArr.length; i++){
            let newEnemyView = new SolderView(this.battle.enemiesArr[i]);
            newEnemyView.setPosition(this.enemiesPositions[i][0], this.enemiesPositions[i][1]);
            this.addChild(newEnemyView);       
        }
        //Добавляем анимацию начала
        this.playStartAnimation();
        //Добавляем счетчик денег
        this.addMoneyCountLabel();
        //Добавляем кнопку использования бустера
        this.addBoosterButton();

        cc.audioEngine.playMusic(resources.battle_music, true);
        cc.audioEngine.setMusicVolume(0.5);
    },

    addBackground: function () {
        var background = new cc.Sprite(resources.background);
        background.setScale(Math.max(this.width / background.width, this.height / background.height));
        background.setPosition(this.width / 2, this.height / 2);
        background.setLocalZOrder(-1);
        this.addChild(background);
    },
    //Функция проигрывания стартовой анимации
    playStartAnimation: function () {
        var animationStart = sp.SkeletonAnimation.create(resources['battle_start_json'], resources.battle_atlas);
        animationStart.setAnimation(0, "animation", false);
        animationStart.setPosition(this.width / 2, this.height / 2);
        animationStart.setCompleteListener(function() {
           animationStart.removeFromParent();
        });
        this.addChild(animationStart);
        
    },
    //Функция победной анимации врагов
    emenyWinAnimation: function () {
        this.animationStart = sp.SkeletonAnimation.create(resources['battle_final_json'], resources.battle_atlas);
        this.animationStart.setAnimation(0, "animation", false);
        this.animationStart.setPosition(this.width / 2, this.height / 2);
        this.animationStart.setScaleX(0.6);
        this.animationStart.setScaleY(0.6);
        this.addChild(this.animationStart);

        this.finalAnimationText = new ccui.Text("NE VICTORY :(", resources.marvin_round.name,65);
        this.finalAnimationText.setPosition(this.width / 2, this.height / 2);
        this.addChild(this.finalAnimationText);
    },
    //Функция победной анимации солдат
    solderWinAnimation: function () {
        this.animationStart = sp.SkeletonAnimation.create(resources['battle_final_json'], resources.battle_atlas);
        this.animationStart.setAnimation(0, "animation", false);
        this.animationStart.setPosition(this.width / 2, this.height / 2);
        this.animationStart.setScaleX(0.6);
        this.animationStart.setScaleY(0.6);
        this.addChild(this.animationStart);

        this.finalAnimationText = new ccui.Text("VICTORY", resources.marvin_round.name,65);
        this.finalAnimationText.setPosition(this.width / 2, this.height / 2);
        
        this.addChild(this.finalAnimationText);
    },
    //Добавления счетчика денег
    addMoneyCountLabel: function () {
        this.moneyCount = 100;
        this.moneyCountView = new ccui.Text();
        this.moneyCountView.setString(this.moneyCount + " M");
        this.moneyCountView.setPosition(this.width / 2, this.height / 2 - this.height / 3 - 70);
        this.moneyCountView.setFontSize(32);
        this.moneyCountView.setFontName(resources.marvin_round.name);
        this.addChild(this.moneyCountView); 
    },
    //Создание координат расположения для солдат и врагов. До 6 с каждой стороны.
    generateSoldersPositions: function () {
        this.fightersPositions = [this.height / 2, this.height / 2 - 200, this.height / 2 + 200];
        this.soldersPositions = [];
        this.enemiesPositions = [];
        for(let i = 0; i < this.battle.soldersArr.length; i++){
            if(i < 3){
                this.soldersPositions.push([this.width / 2 - this.width / 6, this.fightersPositions[i]]);
            } else {
                this.soldersPositions.push([this.width / 2 - this.width / 6 - 150, this.fightersPositions[i%3]]);
            }
        }
        for(let i = 0; i < this.battle.enemiesArr.length; i++){
            if(i < 3){
                this.enemiesPositions.push([this.width / 2 + this.width / 6, this.fightersPositions[i]]);
            } else {
                this.enemiesPositions.push([this.width / 2 + this.width / 6 + 150, this.fightersPositions[i%3]]);
            }
        }
        return this.soldersPositions, this.enemiesPositions;
    },
    //Добавление кнопки для использование бустера
    addBoosterButton: function () {
        var buttonSize = cc.spriteFrameCache.getSpriteFrame('button.png').getOriginalSize();
        this.boosterView = new ccui.Button('#button.png', '#button_on.png', '#button_off.png', ccui.Widget.PLIST_TEXTURE);
        this.boosterView.setScale9Enabled(true);
        this.boosterView.setContentSize(340, 70);
        this.boosterView.setCapInsets(cc.rect(buttonSize.width / 2 - 1, buttonSize.height / 2 - 1, 2, 2));
        this.boosterView.setPosition(this.width / 2, this.height / 2 - this.height / 3);
        this.addChild(this.boosterView);

        this.boosterView.setTitleText("USE BOOSTER: 50m");
        this.boosterView.setTitleFontSize(32);
        this.boosterView.setTitleFontName(resources.marvin_round.name);

        this.boosterView.addClickEventListener(function () {
            if (!this.battle.running) {
                console.log("wait start");
                return;
            }
            if(this.moneyCount >=50){
                prokeBooster = new Booster(this.battle.soldersArr);
                this.moneyCount -= 50;
                this.moneyCountView.setString(this.moneyCount + " M");
            }
            //Если бустер уже невозможно купить, кнопка блокируется
            if(this.moneyCount < 50) this.boosterView.setEnabled(false);
        }.bind(this));
    }
});