var Booster = function (soldersViews) {
    var minHPSolderIndex = -1;
    var minHPSolder = 100000;
    for(let i = 0; i < soldersViews.length; i++){
        if(soldersViews[i].isAlive() && soldersViews[i].hp < minHPSolder){
            minHPSolderIndex = i;
            minHPSolder = soldersViews[i].hp;
        }
    }
    soldersViews[minHPSolderIndex].takeHeal(50);
};
//Как написано в ТЗ - бустер в виде отдельной сущности.
