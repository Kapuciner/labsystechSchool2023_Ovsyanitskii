/**
 * Created by andrey on 06.05.2022.
 */

var BattleScene = cc.Scene.extend({
    ctor: function () {
        this._super();

        this.battle = new Battle();
        //Вызываем стартовую анимацию
        this.playStartAnimation();

        this.addBackground();

        this.solderView = new SolderView(this.battle.solder);
        this.solderView.setPosition(this.width / 2 - this.width / 6, this.height / 2);
        //Добавляем возможность вызвать соответствующую анимацию в конце битвы
        this.solderView.playFinalAnimation = this.playFinalAnimationLoose.bind(this); 
        this.addChild(this.solderView);

        this.enemyView = new SolderView(this.battle.enemy);
        this.enemyView.setPosition(this.width / 2 + this.width / 6, this.height / 2);
        //Добавляем возможность вызвать соответствующую анимацию в конце битвы
        this.enemyView.playFinalAnimation = this.playFinalAnimationWin.bind(this);
        this.addChild(this.enemyView);

        this.addAttackButton();

        cc.audioEngine.playMusic(resources.battle_music, true);
        cc.audioEngine.setMusicVolume(0.5);
    },

    playStartAnimation: function () {
        this.animationStart = sp.SkeletonAnimation.create(resources['battle_start_json'], resources.battle_atlas);
        this.animationStart.setAnimation(0, "animation", false);
        this.animationStart.setPosition(this.width / 2, this.height / 2);
        this.addChild(this.animationStart);
    },

    playFinalAnimationLoose: function () {
        this.animationStart = sp.SkeletonAnimation.create(resources['battle_final_json'], resources.battle_atlas);
        this.animationStart.setAnimation(0, "animation", false);
        this.animationStart.setPosition(this.width / 2, this.height / 2);
        this.addChild(this.animationStart);

        this.finalAnimationText = new ccui.Text("NE VICTORY :(", resources.marvin_round.name,85);
        this.finalAnimationText.setPosition(this.width / 2, this.height / 2);
        this.addChild(this.finalAnimationText);
    },

    playFinalAnimationWin: function () {
        this.animationStart = sp.SkeletonAnimation.create(resources['battle_final_json'], resources.battle_atlas);
        this.animationStart.setAnimation(0, "animation", false);
        this.animationStart.setPosition(this.width / 2, this.height / 2);
        this.addChild(this.animationStart);

        this.finalAnimationText = new ccui.Text("VICTORY", resources.marvin_round.name,85);
        this.finalAnimationText.setPosition(this.width / 2, this.height / 2);
        this.addChild(this.finalAnimationText);
    },

    addBackground: function () {
        var background = new cc.Sprite(resources.background);
        background.setScale(Math.max(this.width / background.width, this.height / background.height));
        background.setPosition(this.width / 2, this.height / 2);
        background.setLocalZOrder(-1);
        this.addChild(background);
    },

    addAttackButton: function () {
        var buttonSize = cc.spriteFrameCache.getSpriteFrame('button.png').getOriginalSize();
        this.attackButton = new ccui.Button('#button.png', '#button_on.png', '#button_off.png', ccui.Widget.PLIST_TEXTURE);
        this.attackButton.setScale9Enabled(true);
        this.attackButton.setContentSize(180, 70);
        this.attackButton.setCapInsets(cc.rect(buttonSize.width / 2 - 1, buttonSize.height / 2 - 1, 2, 2));
        this.attackButton.setPosition(this.width / 2, this.height / 2 - this.height / 3);
        this.addChild(this.attackButton);

        this.attackButton.setTitleText("ATTACK");
        this.attackButton.setTitleFontSize(35);
        this.attackButton.setTitleFontName(resources.marvin_round.name);

        this.attackButton.addClickEventListener(function () {
            if (!this.battle.running) {
                console.log("wait start");
                return;
            } 
            //С помощью таймаута выключаем кнопку на одну секунду
            this.attackButton.setEnabled(false);
            setTimeout(() => {
                this.attackButton.setEnabled(true);
            }, 1000);

            this.battle.solder.attack(this.battle.enemy);
        }.bind(this));
    }
});