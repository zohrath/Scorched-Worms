// const io = require("socket.io-client");
// const should = require("should");
// const socketURL = "http://0.0.0.0:8081";
const assert = require("chai").assert;

const tilesHit = require("../server/terrain").tilesHit;
const createPlatformLayer = require("../server/terrain").createPlatformLayer;
const updatePlatformLayer = require("../server/terrain").updatePlatformLayer;


let matrix = createPlatformLayer(512, 768, 16);
let before = JSON.parse(JSON.stringify(matrix))
let tiles = tilesHit({ x: 500, y: 500, radius: 200 }, 16);
updatePlatformLayer(matrix, tiles);

Object.entries(matrix).forEach(function(key,col){
  Object.entries(col).forEach(function(key,elem){
    
    validTile(elem,width,height,allowedTypes)
  });
});

describe("createPlatformLayer",function(){
  
  let height = 20;
  let width = 10;
  let matrix = createPlatformLayer(width,height,1);
  
  it("checks all tiles in the matrix", () =>{
    let allowedTypes = [];
    Object.entries(matrix).forEach(function(key,col){
      Object.entries(col).forEach(function(key,elem){
        
        assert.isTrue(validTile(elem,width,height,allowedTypes))
      });
    });

  });
    
});


describe("testRemoveTiles", function (){
  it("testRemoveTiles",() =>{

    assert.isTrue(testRemoveTiles(before,matrix,tiles));
  });

});


function validTile(tile,allowedWidth,allowedHeight,allowedTypes){
  if(!(tile.x <= allowedWidth && tile.x >= 0)){
    return false;
  }

  if(!(tile.y <= allowedHeight && tile.y >= 0)){
    return false;
  }

  console.log(allowedTypes.includes(tile.type));
  if(!(allowedTypes.includes(tile.type))){
    return false;
  }

  return true;
}

function testRemoveTiles(layerBefore, layerAfter, tiles) {
  let array = matrixDifference(layerBefore,layerAfter) 

  let nrNotFound = 0;
  let nrToMatch = Object.keys(array).length;

  tiles.forEach(tile => {
    if(array[tile.x+","+tile.y]){
      nrNotFound ++;
    }
  })
  if(nrNotFound === nrToMatch){
    return true;
  } else {
    console.log(nrNotFound,nrToMatch)
    return false;
  }
}

function matrixDifference(matrix1, matrix2) {
  let resArray = {};
  let matrix1Array = Object.entries(matrix1);
  let matrix2Array = Object.entries(matrix2);
  matrix1Array.forEach(([x, column1]) => {
    Object.entries(column1).forEach(([y, tile1]) => {
      if (!compareTiles(tile1,matrix2[x][y])) {
        resArray[tile1.x+","+tile1.y] = tile1;
      }
    });
  });
  return resArray;
}

function compareTiles(tile1, tile2) {
  if(tile1 && tile2){
    return tile1.x === tile2.x && tile1.y === tile2.y
  }
  return false;
}