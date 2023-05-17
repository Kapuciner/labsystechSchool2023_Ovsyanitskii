/**
 * Created by andrey on 08.05.2022.
 */

var SolderView = cc.Node.extend({
    ctor: function (solder) {
        this._super();

        this.solder = solder;

        this.animation = sp.SkeletonAnimation.create(resources[solder.type + solder.code + '_json'], resources.battle_atlas);
        this.animation.setAnimation(0, "idle", true);
        this.addChild(this.animation);
        //Добавляем дочерный элемент - фон полоски здоровья
        this.hpBarBackground = new ccui.LoadingBar("res_source/progress_bar/progress_backgroundnew.png");
        this.hpBarBackground.setPosition(this.width, 150);
        this.addChild(this.hpBarBackground);
        //Добавляем дочерный элемент - полоску здоровья
        this.hpBar = new ccui.LoadingBar("res_source/progress_bar/progressbarnew.png");
        this.hpBar.setPosition(this.width, 150);
        this.addChild(this.hpBar);
        //Добавляем дочерный элемент - счетчик здоровья
        this.hpBarLabel = new ccui.Text();
        this.hpBarLabel.setString(this.solder.hp);
        this.hpBarLabel.setPosition(this.width, 150);
        this.addChild(this.hpBarLabel);
        //Добавляем дочерный элемент - двигающуюся дельту здоровья
        this.damageDeltaAnimation = new ccui.Text();
        this.addChild(this.damageDeltaAnimation);


        if (solder.type === 'solder') {
            this.animation.setScaleX(-1);
        }

        solder.onTakeDamageAnimation = this.onTakeDamage.bind(this);
        solder.onAttackAnimation = this.onAttack.bind(this);
        solder.onDieAnimation = this.onDie.bind(this);

        this.playFinalAnimation = function () {
        };
    },

    onDie: function() {
        //При смерти солдата затеняем полоску здоровья
        this.hpBar.runAction(new cc.FadeOut(0));
        this.hpBarBackground.runAction(new cc.FadeOut(0));
        this.hpBarLabel.runAction(new cc.FadeOut(0));
        this.animation.runAction(new cc.Sequence(
            new cc.FadeOut(0.3),
            new cc.ToggleVisibility()
        ));
        this.playFinalAnimation();
    },

    onAttack: function() {
        this.animation.setAnimation(0, "attack", false);
        this.animation.setCompleteListener(function() {
            this.animation.setAnimation(0, "idle", true);
        }.bind(this));

        cc.audioEngine.playEffect(resources['battle_' + this.solder.type + '_effect'], false);
    },

    onTakeDamage: function () {
        this.animation.runAction(new cc.Sequence(
            new cc.FadeTo(0.3, 140),
            new cc.FadeTo(0.3, 255)
        ));
        //Передвигаем двигающуюся дельту здоровья
        this.damageDeltaAnimation.setPosition(this.width, this.height);
        this.damageDeltaAnimation.set = 255;
        this.damageDeltaAnimation.setString("-" + this.solder.lastTakenDamage);
        this.damageDeltaAnimation.runAction(new cc.Sequence(
            new cc.MoveTo(0,0,0),
            new cc.FadeTo(0.1, 255),
            new cc.MoveBy(0.7, 0, 90),
            new cc.FadeTo(0.2, 0)
        ));
        //Обновляем заполнение полоски здоровья
        this.hpBar.setPercent(this.solder.hp / this.solder.maxhp * 100); //Изменение размеров полоски ХП
        this.hpBarLabel.setString(this.solder.hp);

        var damage = sp.SkeletonAnimation.create(resources.damage_json, resources.battle_atlas);
        damage.setAnimation(0, "animation", false);
        damage.setCompleteListener(function() {
            damage.removeFromParent();
        })
        this.addChild(damage);
    }
});