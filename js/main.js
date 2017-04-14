/* Setup */
var renderer = PIXI.autoDetectRenderer(329, 426, {backgroundColor: 0xa7afbe});
document.body.appendChild(renderer.view);
var stage = new PIXI.Container();

PIXI.loader
    .add("img/background.png")
    .load(setup);

function setup(){
    var sprite = new PIXI.Sprite(
        PIXI.loader.resources["img/background.png"].texture
    );
    stage.addChild(sprite);
    var text_layer=drawTextRenderer(renderer.width / 2, renderer.height / 2, renderer.width / 2, renderer.height / 2, -0.6, 0, 0.53, renderer.width, renderer.height, "Hello123", "Arial", 32);
    stage.addChild(text_layer);

    renderer.render(stage);
}

function drawTextRenderer(posX, posY, pivotX, pivotY, skewX, skewY, rotation, width, height, text, font_family, font_size){
    var layer = new PIXI.SkewableContainer();
    layer.position.x = posX;//renderer.width / 2;
    layer.position.y = posY;//renderer.height / 2;
    layer.pivot.x = pivotX;//renderer.width / 2;
    layer.pivot.y = pivotY;//renderer.height / 2;
    layer.width = width;//renderer.width;
    layer.height = height;//renderer.height;
    layer.skew.x = skewX;//0.5;
    layer.skew.y = skewY;//0.2;
    layer.rotation = rotation;//-0.2;
    var message = new PIXI.Text(text, {fontFamily: font_family, fontSize: font_size});
    message.position.set(posX, posY);
    layer.addChild(message);

    return layer;
}




