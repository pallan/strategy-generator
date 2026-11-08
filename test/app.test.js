"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const stubElement = () => ({
  setAttribute() {},
  appendChild() {},
  addEventListener(type, handler) { this[`on${type}`] = handler; },
});

const loadApp = (saved = null, zones = [{ name: "zone3", value: "100" }]) => {
  const fields = {
    stoneColours: { options: [{ value: "Red / Yellow" }], selectedIndex: 0, value: "Red / Yellow" },
    minThrown: { options: [{ value: "3" }], selectedIndex: 0 },
    numOfEnds: { value: "8" },
    currentEnd: { options: [{ value: "" }], selectedIndex: 0 },
    scenarioNotes: { value: "" },
  };
  const list = { appended: [], appendChild(n) { this.appended.push(n); }, replaceChildren() { this.appended = []; } };
  const byId = {
    configForm: { ...stubElement(), elements: { namedItem: (name) => fields[name] } },
    "saved-scenario-list": list,
  };
  const document = {
    getElementById: (id) => (byId[id] ??= stubElement()),
    getElementsByClassName: () => zones,
    createElementNS: stubElement,
    createElement: () => ({ ...stubElement(), appendChild(n) { this.label = n.data; } }),
    createTextNode: (data) => ({ data: String(data) }),
  };
  let stored = saved;
  let onLoad;
  const context = vm.createContext({
    document,
    window: { addEventListener: (type, handler) => { onLoad = handler; } },
    localStorage: { getItem: () => stored, setItem: (key, value) => { stored = value; } },
  });
  const source = fs.readFileSync(path.join(__dirname, "../js/app.js"), "utf8");
  const app = vm.runInContext(`${source}\n;({ HouseScenario, loadSavedList, loadScenario })`, context);
  return { ...app, fields, list, byId, boot: () => onLoad(), stored: () => JSON.parse(stored) };
};

test("the team throwing an even-numbered stone has hammer", () => {
  const { HouseScenario } = loadApp();
  const house = new HouseScenario(30);
  assert.strictEqual(house.randomScenario(["Red", "Yellow"], 8, 15).hammer, true);
  assert.strictEqual(house.randomScenario(["Red", "Yellow"], 8, 14).hammer, false);
});

test("the named colour is the colour of the next stone", () => {
  const { HouseScenario } = loadApp();
  const house = new HouseScenario(30);
  for (let i = 0; i < 200; i++) {
    house.generate();
    const { details, stone_colours } = house.scenarioConfig;
    assert.strictEqual(stone_colours[details.hammer ? 1 : 0], details.colour);
  }
});

test("loading a save with reversed colours selects a real dropdown option", () => {
  const { HouseScenario, fields } = loadApp();
  new HouseScenario(30).generate({
    coordinates: [],
    details: { colour: "Red", end: "3rd", hammer: true, thrower: "Skip's last", score_diff: "Tied" },
    stone_colours: ["Yellow", "Red"],
    zone_weights: [],
  });
  assert.strictEqual(fields.stoneColours.value, "Red / Yellow");
});

test("the 2nd end score agrees with who has hammer", () => {
  const { HouseScenario } = loadApp();
  const house = new HouseScenario(30);
  for (let i = 0; i < 200; i++) {
    assert.doesNotMatch(house.randomScenario(["Red", "Yellow"], 8, 15, "2nd").score_diff, /Up/);
    assert.doesNotMatch(house.randomScenario(["Red", "Yellow"], 8, 14, "2nd").score_diff, /Down/);
  }
});

test("loading a save restores zone percentages as whole numbers", () => {
  const zones = [{ name: "zone3", value: "100" }];
  const { HouseScenario } = loadApp(null, zones);
  new HouseScenario(30).generate({
    coordinates: [],
    details: { colour: "Red", end: "3rd", hammer: true, thrower: "Skip's last", score_diff: "Tied" },
    stone_colours: ["Red", "Yellow"],
    zone_weights: [{ name: "zone3", weight: 0.07 }],
  });
  assert.strictEqual(zones[0].value, 7);
});

test("a blank zone is ignored instead of breaking the weighted pick", () => {
  const { HouseScenario } = loadApp(null, [
    { name: "zone2", value: "" },
    { name: "zone3", value: "50" },
    { name: "zone4", value: "50" },
  ]);
  const house = new HouseScenario(30);
  const ys = [];
  for (let i = 0; i < 100; i++) {
    house.generate();
    ys.push(...house.scenarioConfig.coordinates.map((stone) => stone.origin.y));
  }
  assert.ok(ys.some((y) => y < 210), "expected stones in zone 4");
  assert.ok(ys.some((y) => y > 210), "expected stones in zone 3");
  assert.ok(ys.every((y) => y <= 390), "expected no stones in the blank zone");
});

test("a chosen end is only used if the game has that end", () => {
  const { HouseScenario } = loadApp();
  const house = new HouseScenario(30);
  assert.strictEqual(house.randomScenario(["Red", "Yellow"], "8", 15, "8th").end, "8th");
  for (let i = 0; i < 100; i++) {
    assert.notStrictEqual(house.randomScenario(["Red", "Yellow"], "8", 15, "10th").end, "10th");
  }
});

test("notes survive a save and load, and can then be cleared", () => {
  const app = loadApp();
  app.boot();

  app.fields.scenarioNotes.value = "Draw around the guard";
  app.byId["save-button"].onclick();
  assert.strictEqual(app.stored()[0].notes, "Draw around the guard");

  app.fields.scenarioNotes.value = "";
  app.loadScenario(0);
  assert.strictEqual(app.fields.scenarioNotes.value, "Draw around the guard");

  app.fields.scenarioNotes.value = "";
  app.byId["save-button"].onclick();
  assert.strictEqual(app.stored()[1].notes, "");
});

test("saved scenarios without a description are listed by their details", () => {
  const details = { colour: "Red", end: "3rd", hammer: true, thrower: "Skip's last", score_diff: "Tied" };
  const { loadSavedList, list } = loadApp(JSON.stringify([{ details }]));
  loadSavedList();
  assert.strictEqual(list.appended[0].label, "Red, 3rd end w/hammer, Skip's last, Tied");
});
