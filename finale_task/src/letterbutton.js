var letterButtonView = cc.Node.extend({
    ctor: function (letter, id, angle) {
        this._super();
        this.id = id;
        this.letter = letter;
        this.createButton();
        this.isPressed = false;
        this.basicAngle = angle;
        this.addToPressedButtons = function () {};
        this.removeFromPressedButtons = function () {};
    },
    //Создание кнопки
    createButton: function() {       
        //Создание светящегося фона у кнопки. Изначально прозрачный.
        this.buttonGlow = new ccui.ImageView('letter_bg_glow.png', ccui.Widget.PLIST_TEXTURE);
        this.buttonGlow.setScale9Enabled(true);
        this.buttonGlow.setCapInsets(cc.rect(20, 20, 2, 2));
        this.buttonGlow.setContentSize(78, 78);
        this.buttonGlow.setOpacity(0);
        this.addChild(this.buttonGlow);
        //Добавление самой кнопки
        this.buttonView = new ccui.Button('letter_bg.png', 'letter_bg.png', 'letter_bg.png', ccui.Widget.PLIST_TEXTURE);
        this.buttonView.setScale9Enabled(true);
        this.buttonView.setCapInsets(cc.rect(20, 20, 2, 2));
        this.buttonView.setContentSize(60, 60);
        this.buttonView.addClickEventListener(function () {
            if(this.isPressed == false){
                cc.audioEngine.playEffect(resources.letter_on_effect, false);
                this.buttonGlow.runAction(new cc.FadeTo(0.1, 255));
                this.runAction(new cc.RotateTo(0.1, this.basicAngle-10));
                this.runAction(new cc.scaleTo(0.1, 1.1));
                this.isPressed = true;
                this.addToPressedButtons(this.id, this.letter);
            } else {;
                cc.audioEngine.playEffect(resources.letter_off_effect, false);
                this.buttonGlow.runAction(new cc.FadeTo(0.1, 0));
                this.runAction(new cc.RotateTo(0.1, this.basicAngle));
                this.runAction(new cc.scaleTo(0.1, 1.0));
                this.isPressed = false;
                this.removeFromPressedButtons(this.id);
            }
        }.bind(this));
        this.addChild(this.buttonView);
        //Добавление буквы на кнопку
        this.buttonLetter = new ccui.ImageView('rus/' +rutoeng[this.letter] +'.png', ccui.Widget.PLIST_TEXTURE);
        this.buttonLetter.setScale(0.7);
        this.addChild(this.buttonLetter);
    },
    //Сброс выделения с кнопки
    unlightButton: function() {
        if(this.isPressed){
            this.isPressed = false;
            this.runAction(new cc.RotateTo(0.1, this.basicAngle));
            this.buttonGlow.runAction(new cc.FadeTo(0.1, 0));
            this.runAction(new cc.scaleTo(0.1, 1.0));
        }
    }

});