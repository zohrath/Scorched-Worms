const assert = require("chai").assert;
const State = require("../server/State");

describe("State class default test", function() {
    let state = new State();
    it("Returns playerOrder as empty array", () => {
        assert.deepEqual(state.playerOrder, []);
    });
    it("Returns players as empty dict", () => {
        assert.deepEqual(state.players, {});
    });
});