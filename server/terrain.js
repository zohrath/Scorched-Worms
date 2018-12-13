function tilesHit(explosionInfo,tileSize=1) {
    let xCenter = Math.round(explosionInfo.x);
    let yCenter = Math.round(explosionInfo.y);
    let radius = explosionInfo.radius;
    let tilesToRemove= [];
    for(x=xCenter-radius; x<xCenter+radius; x++) {
        yspan = Math.round(radius*Math.sin(Math.acos((xCenter-x)/radius)));
        for(y=yCenter-yspan; y<yCenter+yspan; y++) {
            tilesToRemove.push({
                x: x,
                y: y
            })
        }
    }
    return tilesToRemove;
 }

 module.exports = {
    tilesHit: tilesHit,

};