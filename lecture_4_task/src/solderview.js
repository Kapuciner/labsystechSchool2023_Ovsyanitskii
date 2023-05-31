/**
 * Created by andrey on 08.05.2022.
 */

var SolderView = cc.Node.extend({
    ctor: function (solder) {
        this._super();

        this.solder = solder;

        //Мьютекс для смерти, без него анимация работает некорректно
        this.deathMutex = false;
        this.animation = sp.SkeletonAnimation.create(resources[solder.type + solder.code + '_json'], resources.battle_atlas);
        this.animation.setAnimation(0, "idle", true);
        this.addChild(this.animation);

        //Добавляем дочерный элемент - фон полоски здоровья
        this.hpBarBackground = new ccui.LoadingBar("res_source/progress_bar/progress_background.png");
        this.hpBarBackground.setScale9Enabled(true);
        this.hpBarBackground.setContentSize(200, 88);
        this.hpBarBackground.setScaleX(0.5);
        this.hpBarBackground.setScaleY(0.5);
        this.hpBarBackground.setPosition(this.width, -90);
        this.addChild(this.hpBarBackground);

        //Добавляем дочерный элемент - полоску здоровья
        this.hpBar = new ccui.LoadingBar("res_source/progress_bar/progressbar.png");
        this.hpBar.setScale9Enabled(true);
        this.hpBar.setContentSize(200, 88);
        this.hpBar.setScaleX(0.5);
        this.hpBar.setScaleY(0.5);
        this.hpBar.setCapInsets(cc.rect(39, 43, 2, 2));
        this.hpBar.setPosition(this.width, -90);
        this.addChild(this.hpBar);

        //Добавляем дочерный элемент - счетчик здоровья
        this.hpBarLabel = new ccui.Text();
        this.hpBarLabel.setString(this.solder.hp);
        this.hpBarLabel.setPosition(this.width, -90);
        this.addChild(this.hpBarLabel);

        if (solder.type === 'solder') {
            this.animation.setScaleX(-1);
        }

        solder.onTakeDamageAnimation = this.onTakeDamage.bind(this);
        solder.onAttackAnimation = this.onAttack.bind(this);
        solder.onDieAnimation = this.onDie.bind(this);
        solder.onHealAnimation = this.onHeal.bind(this); //Дополнительная функция для бустера
    },

    onDie: function() {
        //Мьютекс для смерти, без него анимация работает некорректно
        if(this.deathMutex === false){
            this.deathMutex = true;
            this.animation.runAction(new cc.Sequence(
            new cc.FadeOut(0.3),
            new cc.ToggleVisibility()));
            //Скрытые полоски здоровья при смерти
            this.hpBar.runAction(new cc.FadeOut(0));
            this.hpBarBackground.runAction(new cc.FadeOut(0));
            this.hpBarLabel.runAction(new cc.FadeOut(0));
        }
    },

    onAttack: function() {
        this.animation.setAnimation(0, "attack", false);
        this.animation.setCompleteListener(function() {
            this.animation.setAnimation(0, "idle", true);
        }.bind(this));

        cc.audioEngine.playEffect(resources['battle_' + this.solder.type + '_effect'], false);
    },
    //Дополнительная функция для получения лечения от бустера
    onHeal: function () {
        this.animation.runAction(new cc.Sequence(
            new cc.FadeTo(0.3, 255),
            new cc.FadeTo(0.3, 140),
            new cc.FadeTo(0.3, 255),
            new cc.FadeTo(0.3, 140)
        ));

        //Добавления всплывающей дельты здоровья и затем ее удаление
        var damageDeltaAnimation = new ccui.Text();
        this.addChild(damageDeltaAnimation);
        let ran = (Math.random()-0.5) * 70;
        damageDeltaAnimation.setPosition(this.width + ran, this.height);
        damageDeltaAnimation.setFontSize(16);
        damageDeltaAnimation.setFontName(resources.marvin_round.name);
        damageDeltaAnimation.setString(this.solder.lastHPchange);
        damageDeltaAnimation.runAction(new cc.Sequence(
            new cc.MoveBy(0.7, 0, 90),
            new cc.FadeTo(0.2, 0),
        ));
        setTimeout(function () {
            damageDeltaAnimation.removeFromParent();
        }.bind(this), 900);
        
        //Обновляем заполнение полоски здоровья
        this.hpPercent = this.solder.hp / this.solder.maxhp * 100;
        if(this.hpPercent > 25) this.hpBar.setPercent(this.hpPercent);
        else this.hpBar.setPercent(25);
        this.hpBarLabel.setString(this.solder.hp);
        
        //Поскольку отдельной анимации нет, анимация получения урона
        var damage = sp.SkeletonAnimation.create(resources.damage_json, resources.battle_atlas);
        damage.setAnimation(0, "animation", false);
        damage.setCompleteListener(function() {
            damage.removeFromParent();
        })
        this.addChild(damage);
    },

    onTakeDamage: function () {
        this.animation.runAction(new cc.Sequence(
            new cc.FadeTo(0.3, 140),
            new cc.FadeTo(0.3, 255)
        ));
        
        //Добавления всплывающей дельты здоровья и затем ее удаление
        var damageDeltaAnimation = new ccui.Text();
        this.addChild(damageDeltaAnimation);
        let ran = (Math.random()-0.5) * 70;
        damageDeltaAnimation.setPosition(this.width + ran, this.height);
        damageDeltaAnimation.setFontSize(16);
        damageDeltaAnimation.setFontName(resources.marvin_round.name);
        damageDeltaAnimation.setString(this.solder.lastHPchange);
        damageDeltaAnimation.runAction(new cc.Sequence(
            new cc.MoveBy(0.7, 0, 90),
            new cc.FadeTo(0.2, 0),
        ));
        setTimeout(function () {
            damageDeltaAnimation.removeFromParent();
        }.bind(this), 900);

        //Обновляем заполнение полоски здоровья
        this.hpPercent = this.solder.hp / this.solder.maxhp * 100;
        if(this.hpPercent > 25) this.hpBar.setPercent(this.hpPercent);
        else this.hpBar.setPercent(25);
        this.hpBarLabel.setString(this.solder.hp);

        var damage = sp.SkeletonAnimation.create(resources.damage_json, resources.battle_atlas);
        damage.setAnimation(0, "animation", false);
        damage.setCompleteListener(function() {
            damage.removeFromParent();
        })
        this.addChild(damage);
    }
});