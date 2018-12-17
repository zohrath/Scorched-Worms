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

function createPlatformLayer() {
  let tileWidth = 16;
  let width = 1024;
  let height = 768;
  let tilesToAdd = [];
  let colHeight = getRndInteger(0.6 * height, 0.8 * height);
  let nextHeight = colHeight;
  let type;
  lastHeight = colHeight;
  for (i = 0; i < width; i = i + tileWidth) {
    nextHeight = colHeight + getRndInteger(-1, 1) * 16;
    if (nextHeight < tileWidth) {
      nextHeight = height - tileWidth;
    }

    type = 1;
    if (lastHeight <= colHeight && nextHeight > colHeight) {
      type = 2;
    } else if (lastHeight > colHeight && nextHeight > colHeight) {
      type = 12;
    } else if (lastHeight > colHeight && colHeight >= nextHeight) {
      type = 3;
    }

    tilesToAdd.push({
      type: type,
      x: i,
      y: colHeight
    });

    lastHeight = colHeight;
    colHeight = nextHeight;
  }
  console.log(tilesToAdd);
  return tilesToAdd;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  tilesHit: tilesHit,
  createPlatformLayer: createPlatformLayer
};
