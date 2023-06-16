
cc.game.onStart = function () {
    var size = cc.view.getFrameSize();
    cc.view.enableRetina(false);
    cc.view.adjustViewPort(true);
    cc.view.setDesignResolutionSize(size.width, size.height, cc.ResolutionPolicy.NO_BORDER);
    cc.view.resizeWithBrowserSize(true);

    cc.LoaderScene.preload(Object.values(resources), function () {
        cc.spriteFrameCache.addSpriteFrames(resources.game_plist);

        cc.director.runScene(new LevelScene());
    }, this);
};

cc.game.run();