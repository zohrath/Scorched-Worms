function tilesHit(explosionInfo, tileSize = 1) {
  let xCenter = Math.round(explosionInfo.x);
  let yCenter = Math.round(explosionInfo.y);
  let radius = explosionInfo.radius;
  let tilesToRemove = [];
  for (x = xCenter - radius; x <= xCenter + radius; x++) {
    ySpan = Math.round(radius * Math.sin(Math.acos((xCenter - x) / radius)));
    for (y = yCenter - ySpan; y <= yCenter + ySpan; y++) {
      tilesToRemove.push({
        x: x,
        y: y
      });
    }
  }
  return tilesToRemove;
}

function updatePlatformLayer(layer,tilesToRemove) {
  tilesToRemove.forEach(tile => {
    let column = layer[tile.x];
    if(column){
      delete column[tile.y];
    }
  });

}

function createPlatformLayer(width,height,tileSize) {
  let tilesToAdd = {};
  let highYAllowed = height - 2*tileSize;
  let lowYAllowed = 0.3*height;
  
  let colHeight = getRndInteger(lowYAllowed,highYAllowed);
  let nextHeight = colHeight;
  let type;
  lastHeight = colHeight;
  let tileColumn;
  for (i = 0; i < width; i += tileSize) {
    tileColumn = {};
    nextHeight = colHeight + getRndInteger(-1, 1) * tileSize;
    if (nextHeight > highYAllowed) {
      nextHeight = highYAllowed;
    } else if(nextHeight < lowYAllowed){
      nextHeight = lowYAllowed
    }

    type = 1;
    if (lastHeight <= colHeight && nextHeight > colHeight) {
      type = 2;
    } else if (lastHeight > colHeight && nextHeight > colHeight) {
      type = 12;
    } else if (lastHeight > colHeight && colHeight >= nextHeight) {
      type = 3;
    }

    tileColumn[colHeight] = {
      type: type,
      x: i,
      y: colHeight
    };

    for(j = colHeight+tileSize; j<height; j += tileSize){
      tileColumn[j] = {
        type: 13,
        x: i,
        y: j
      };
    }
    tilesToAdd[i] = tileColumn;
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
  createPlatformLayer: createPlatformLayer,
  updatePlatformLayer: updatePlatformLayer
};