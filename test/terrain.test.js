// const io = require("socket.io-client");
// const should = require("should");
// const socketURL = "http://0.0.0.0:8081";
// const assert = require("chai").assert;

const tilesHit = require("../server/terrain").tilesHit;
const createPlatformLayer = require("../server/terrain").createPlatformLayer;
const updatePlatformLayer = require("../server/terrain").updatePlatformLayer;


// describe("createPlatformLayer", function() {
//     it("check if the", () => {
//       // let players = {};
//       // let playerOrder = [];
//       // let id1 = "1kjgfkjdfbv";
//       // let id2 = "2oiehrgodnf";
//       // let id3 = "3ljebnfvdfv";
//       // let id4 = "4lkejngjdfn";
//       // let alias1 = "Player Adam";
//       // let alias2 = "Player Edvin";
//       // let alias3 = "Player Caspar";
//       // let alias4 = "Player Tor";
//       // let alias5 = "Player Nurre";

//       // let result1 = createPlayer(players, id1, alias1, playerOrder);
//       // assert.equal(result1.alias, alias1);

//       // playerOrder.push(id1);
//       // let result2 = createPlayer(result1, id2, alias2, playerOrder);
//       // assert.equal(result2.alias, alias2);
//     });
//   });

let matrix = createPlatformLayer(512, 768, 16);
let before = JSON.parse(JSON.stringify(matrix))
let tiles = tilesHit({ x: 500, y: 500, radius: 200 }, 16);
updatePlatformLayer(matrix, tiles);
let res = testRemoveTiles(before,matrix,tiles);
console.log("Result",res);

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