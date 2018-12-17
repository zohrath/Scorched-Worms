function tilesHit(explosionInfo, tileSize = 1) {
  let xCenter = Math.round(explosionInfo.x);
  let yCenter = Math.round(explosionInfo.y);
  let radius = explosionInfo.radius;
  let tilesToRemove = [];
  for (x = xCenter - radius; x < xCenter + radius; x++) {
    yspan = Math.round(radius * Math.sin(Math.acos((xCenter - x) / radius)));
    for (y = yCenter - yspan; y < yCenter + yspan; y++) {
      tilesToRemove.push({
        x: x,
        y: y
      });
    }
  }
  return tilesToRemove;
}

function updatePlatformLayer(layer,tilesToRemove) {

}

function createPlatformLayer() {
  let tileSize = 16;
  let width = 1024;
  let height = 768;
  let tilesToAdd = [];
  let colHeight = getRndInteger(0.6 * height, 0.8 * height);
  let nextHeight = colHeight;
  let type;
  lastHeight = colHeight;
  let tileColumn;
  for (i = 0; i < width; i = i + tileSize) {
    tileColumn = [];
    nextHeight = colHeight + getRndInteger(-1, 1) * tileSize;
    if (nextHeight < tileSize) {
      nextHeight = height - tileSize;
    }

    type = 1;
    if (lastHeight <= colHeight && nextHeight > colHeight) {
      type = 2;
    } else if (lastHeight > colHeight && nextHeight > colHeight) {
      type = 12;
    } else if (lastHeight > colHeight && colHeight >= nextHeight) {
      type = 3;
    }

    tileColumn.push({
      type: type,
      x: i,
      y: colHeight
    });

    for(j = colHeight+tileSize; j<height;j += tileSize){
      tileColumn.push({
        type: 13,
        x: i,
        y: j
      });
    }
    tilesToAdd.push(tileColumn);
    lastHeight = colHeight;
    colHeight = nextHeight;
  }
  return tilesToAdd;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  tilesHit: tilesHit,
  createPlatformLayer: createPlatformLayer
};
