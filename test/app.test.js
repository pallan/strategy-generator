"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const stubElement = () => ({ setAttribute() {}, appendChild() {}, addEventListener() {} });

const loadApp = (saved = null) => {
  const fields = {
    stoneColours: { options: [{ value: "Red / Yellow" }], selectedIndex: 0, value: "Red / Yellow" },
    minThrown: { options: [{ value: "3" }], selectedIndex: 0 },
    numOfEnds: { value: "8" },
    currentEnd: { options: [{ value: "" }], selectedIndex: 0 },
    scenarioNotes: { value: "" },
  };
  const list = { appended: [], appendChild(n) { this.appended.push(n); } };
  const byId = {
    configForm: { elements: { namedItem: (name) => fields[name] } },
    "saved-scenario-list": list,
  };
  const document = {
    getElementById: (id) => (byId[id] ??= stubElement()),
    getElementsByClassName: () => [{ name: "zone3", value: "100" }],
    createElementNS: stubElement,
    createElement: () => ({ ...stubElement(), appendChild(n) { this.label = n.data; } }),
    createTextNode: (data) => ({ data: String(data) }),
  };
  const context = vm.createContext({
    document,
    window: { addEventListener() {} },
    localStorage: { getItem: () => saved },
  });
  const source = fs.readFileSync(path.join(__dirname, "../js/app.js"), "utf8");
  const app = vm.runInContext(`${source}\n;({ HouseScenario, loadSavedList })`, context);
  return { ...app, fields, list };
};

test("the team throwing an even-numbered stone has hammer", () => {
  const { HouseScenario } = loadApp();
  const house = new HouseScenario(30, "houseCanvas");
  assert.strictEqual(house.randomScenario(["Red", "Yellow"], 8, 15).hammer, true);
  assert.strictEqual(house.randomScenario(["Red", "Yellow"], 8, 14).hammer, false);
});

test("the named colour is the colour of the next stone", () => {
  const { HouseScenario } = loadApp();
  const house = new HouseScenario(30, "houseCanvas");
  for (let i = 0; i < 200; i++) {
    house.generate();
    const { details, stone_colours } = house.scenarioConfig;
    assert.strictEqual(stone_colours[details.hammer ? 1 : 0], details.colour);
  }
});

test("loading a save with reversed colours selects a real dropdown option", () => {
  const { HouseScenario, fields } = loadApp();
  new HouseScenario(30, "houseCanvas").generate({
    coordinates: [],
    details: { colour: "Red", end: "3rd", hammer: true, thrower: "Skip's last", score_diff: "Tied" },
    stone_colours: ["Yellow", "Red"],
    zone_weights: [],
  });
  assert.strictEqual(fields.stoneColours.value, "Red / Yellow");
});

test("the 2nd end score agrees with who has hammer", () => {
  const { HouseScenario } = loadApp();
  const house = new HouseScenario(30, "houseCanvas");
  for (let i = 0; i < 200; i++) {
    assert.doesNotMatch(house.randomScenario(["Red", "Yellow"], 8, 15, "2nd").score_diff, /Up/);
    assert.doesNotMatch(house.randomScenario(["Red", "Yellow"], 8, 14, "2nd").score_diff, /Down/);
  }
});

test("saved scenarios without a description are listed by their details", () => {
  const details = { colour: "Red", end: "3rd", hammer: true, thrower: "Skip's last", score_diff: "Tied" };
  const { loadSavedList, list } = loadApp(JSON.stringify([{ details }]));
  loadSavedList();
  assert.strictEqual(list.appended[0].label, "Red, 3rd end w/hammer, Skip's last, Tied");
});
