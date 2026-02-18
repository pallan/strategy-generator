"use strict";

const sample = (a, range = null) => {
  if (!Array.isArray(a)) return '';
  range = (range === null ? a.length : range);
  return a[Math.floor(Math.random() * range)];
};

const rand = (min, max) => Math.random() * (max - min) + min;

const getRandomInt = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);

const getRandomItem = function(list, weight) {
  const total_weight = weight.reduce((prev, cur) => prev + cur);
  const random_num = rand(0, total_weight);
  let weight_sum = 0;

  for (let i = 0; i < list.length; i++) {
    weight_sum += weight[i];
    weight_sum = +weight_sum.toFixed(2);
    if (random_num <= weight_sum) {
      return list[i];
    }
  }
  // Fallback for floating-point edge cases
  return list[list.length - 1];
};

const SVG_NS = "http://www.w3.org/2000/svg";

const safeParseJSON = function(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

class HouseScenario {
  constructor(scale, svgId) {
    this.debug = false;
    this.scale = scale;
    this.stone_radius = scale * 0.48;
    this.width = scale * 14;
    this.height = scale * 30;
    this.scenarioConfig = {
      coordinates: [],
      description: "",
      scale: scale,
    };

    this.svg = document.getElementById(svgId);
    this.stonesGroup = document.getElementById("stones");
    this.scenarioText = document.getElementById("scenarioText");
  }

  drawStone(pos, colour, num) {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("aria-label", `Stone ${num}, ${colour}`);

    const outer = document.createElementNS(SVG_NS, "circle");
    outer.setAttribute("cx", pos.x);
    outer.setAttribute("cy", pos.y);
    outer.setAttribute("r", this.stone_radius);
    outer.setAttribute("fill", "grey");
    outer.setAttribute("stroke", "black");
    outer.setAttribute("stroke-width", "0.5");
    g.appendChild(outer);

    const inner = document.createElementNS(SVG_NS, "circle");
    inner.setAttribute("cx", pos.x);
    inner.setAttribute("cy", pos.y);
    inner.setAttribute("r", this.stone_radius * 0.7);
    inner.setAttribute("fill", colour);
    inner.setAttribute("stroke", "black");
    inner.setAttribute("stroke-width", "0.5");
    g.appendChild(inner);

    if (num !== undefined) {
      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", pos.x);
      text.setAttribute("y", pos.y + 5);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", colour === "Yellow" ? "black" : "white");
      text.setAttribute("font-size", "18");
      text.setAttribute("font-family", "serif");
      text.textContent = num;
      g.appendChild(text);
    }

    this.stonesGroup.appendChild(g);
  }

  overlappingStones(pos, existing) {
    const newStone = { radius: this.stone_radius, x: pos.x, y: pos.y };

    for (let i = 0; i < existing.length; i++) {
      const stone = { radius: this.stone_radius, x: existing[i].origin.x, y: existing[i].origin.y };
      const dx = newStone.x - stone.x;
      const dy = newStone.y - stone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < newStone.radius + stone.radius) {
        return true;
      }
    }
    return false;
  }

  fetchZone(zones) {
    const origin = { x: this.width / 2, y: this.width / 2 };
    const back_line = origin.y - 6 * this.scale - this.stone_radius;
    const hog_line = origin.y + 21 * this.scale - this.stone_radius;

    const list = zones.map(e => e.name);
    const weight = zones.map(e => e.weight);
    const elements = {
      "zone1": { min: origin.y + 12 * this.scale, max: hog_line },
      "zone2": { min: origin.y + 6 * this.scale, max: origin.y + 12 * this.scale },
      "zone3": { min: origin.y, max: origin.y + 6 * this.scale },
      "zone4": { min: back_line, max: origin.y },
    };

    return elements[getRandomItem(list, weight)];
  }

  generateStonePos(zone) {
    return {
      y: getRandomInt(zone.min, zone.max),
      x: getRandomInt(this.stone_radius, this.width - this.stone_radius),
    };
  }

  scenarioToString(config) {
    const ends = config.numberOfEnds ? ` (${config.numberOfEnds} ends)` : '';
    return `${config.colour}, ${config.end} end ${config.hammer ? 'w/' : 'w/o '}hammer, ${config.thrower}, ${config.score_diff}${ends}`;
  }

  randomScenario(colours, numberOfEnds = 8, stonesThrown = 15, currentEnd = "") {
    const labels = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
    const positions = ["Lead's first", "Lead's last", "Second's first", "Second's last", "Third's first", "Third's last", "Skip's first", "Skip's last"];
    let up_down = sample(['Up', 'Down']);
    const nextStone = stonesThrown + 1;
    const score_diff = Math.floor(Math.random() * 6);

    const posIndex = Math.ceil(nextStone / 2) - 1;
    const conf = {
      numberOfEnds: numberOfEnds,
      end: (currentEnd !== "" ? currentEnd : sample(labels, numberOfEnds)),
      hammer: (stonesThrown % 2 === 0),
      colour: sample(colours),
      thrower: posIndex < positions.length ? positions[posIndex] : positions[positions.length - 1],
      score_diff: ''
    };

    if (conf.end === "2nd" && up_down === "Up" && conf.hammer) {
      up_down = "Down";
    }
    conf.score_diff = (score_diff === 0 || conf.end === '1st' ? 'Tied' : `${up_down} ${score_diff}`);

    return conf;
  }

  drawScenarioText(description) {
    this.scenarioText.textContent = description;
  }

  resetHouse() {
    this.stonesGroup.innerHTML = '';
  }

  generate(config = null) {
    this.resetHouse();

    const configForm = document.getElementById("configForm");
    const colourSelect = configForm.elements.namedItem('stoneColours');
    const notes = configForm.elements.namedItem('scenarioNotes');
    const zoneFields = document.getElementsByClassName("zoneInput");

    if (config) {
      if (this.debug) { console.log("Generating house using supplied config"); }
      this.scenarioConfig = config;

      colourSelect.value = this.scenarioConfig.stone_colours.join(" / ");
      for (const field of zoneFields) {
        for (let x = 0; x < this.scenarioConfig.zone_weights.length; x++) {
          if (field.name === this.scenarioConfig.zone_weights[x].name) {
            field.value = this.scenarioConfig.zone_weights[x].weight * 100;
          }
        }
      }
      notes.value = '';
      if (this.scenarioConfig.notes) notes.value = this.scenarioConfig.notes;
    } else {
      if (this.debug) { console.log("Generating house using randomly generated config"); }

      const stone_colours = colourSelect.options[colourSelect.selectedIndex].value.split(" / ");
      const minStonesSelect = configForm.elements.namedItem('minThrown');
      const minStones = minStonesSelect.options[minStonesSelect.selectedIndex].value;
      const numberOfEnds = configForm.elements.namedItem("numOfEnds").value;
      const currentEndSelect = configForm.elements.namedItem("currentEnd");
      const currentEnd = currentEndSelect.options[currentEndSelect.selectedIndex].value;

      const zones = [];
      Array.prototype.forEach.call(zoneFields, function(element) {
        zones.push({ name: element.name, weight: parseInt(element.value) / 100 });
      });
      zones.sort((a, b) => (a.weight > b.weight) ? 1 : -1).reverse();

      const stones_thrown = getRandomInt(minStones, 15);
      this.scenarioConfig = {
        coordinates: [],
        details: this.randomScenario(stone_colours, numberOfEnds, stones_thrown, currentEnd),
        scale: this.scale,
        stone_colours: stone_colours,
        zone_weights: zones,
        notes: ''
      };

      notes.value = '';

      if (this.scenarioConfig.details.hammer && this.scenarioConfig.details.colour === this.scenarioConfig.stone_colours[0]) {
        this.scenarioConfig.stone_colours.reverse();
      }

      // Generate stone positions
      const MAX_PLACEMENT_ATTEMPTS = 100;
      for (let x = 0; x < stones_thrown; x++) {
        const zone = this.fetchZone(zones);
        let pos;
        let attempts = 0;
        do {
          pos = this.generateStonePos(zone);
          attempts++;
        } while (this.overlappingStones(pos, this.scenarioConfig.coordinates) && attempts < MAX_PLACEMENT_ATTEMPTS);

        if (attempts >= MAX_PLACEMENT_ATTEMPTS) continue;

        // Each stone has a 55% chance of staying in play
        if (getRandomInt(1, 100) > 45) {
          this.scenarioConfig.coordinates.push({ origin: pos, num: Math.ceil((x + 1) / 2), colour_index: (x % 2) });
        }
      }
    }

    // Draw stones
    for (let x = 0; x < this.scenarioConfig.coordinates.length; x++) {
      const stone = this.scenarioConfig.coordinates[x];
      this.drawStone(stone.origin, this.scenarioConfig.stone_colours[stone.colour_index], stone.num);
    }

    // Draw scenario text
    if (this.scenarioConfig.description) {
      this.drawScenarioText(this.scenarioConfig.description);
    } else {
      this.drawScenarioText(this.scenarioToString(this.scenarioConfig.details));
    }

    const dump = document.getElementById("scenario_config");
    dump.value = JSON.stringify(this.scenarioConfig, null, 2);
  }
}

const refreshHouse = function(config = null) {
  const house = new HouseScenario(30, "houseCanvas");
  house.generate(config);
};

// Saved scenario list management
const scenarioListItemNode = function(index, description) {
  const textnode = document.createTextNode(description);
  const node = document.createElement("button");
  node.setAttribute('type', 'button');
  node.className = "block w-full text-left px-4 py-3 text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50 cursor-pointer";
  node.setAttribute('data-index', index);
  node.appendChild(textnode);
  return node;
};

const loadScenario = function(index) {
  const scenarios = safeParseJSON(localStorage.getItem("savedScenarios"));
  if (Array.isArray(scenarios) && scenarios[index]) {
    refreshHouse(scenarios[index]);
  }
};

const loadSavedList = function() {
  const scenarioList = document.getElementById("saved-scenario-list");
  while (scenarioList.firstChild) {
    scenarioList.removeChild(scenarioList.firstChild);
  }

  if (localStorage.getItem("savedScenarios") !== null) {
    const scenarios = safeParseJSON(localStorage.getItem("savedScenarios"));
    if (!Array.isArray(scenarios)) return;
    for (let x = 0; x < scenarios.length; x++) {
      const listItem = scenarioListItemNode(x, scenarios[x].description);
      scenarioList.appendChild(listItem);

      listItem.addEventListener('click', function() {
        loadScenario(this.getAttribute('data-index'));
        for (const item of this.parentNode.children) {
          item.classList.remove('bg-indigo-50', 'text-indigo-700');
        }
        this.classList.add('bg-indigo-50', 'text-indigo-700');
      });
    }
  }
};

// Page load
window.addEventListener('load', function() {
  document.getElementById('configForm').addEventListener('submit', function(evt) {
    evt.preventDefault();
    refreshHouse();
  });

  document.getElementById('toggle-advanced').addEventListener('click', function(evt) {
    evt.preventDefault();
    const advancedForm = document.getElementById('advanced-config');
    advancedForm.style.display = advancedForm.style.display === "block" ? "none" : "block";
  });

  document.getElementById('rawJSONConfigForm').addEventListener('submit', function(evt) {
    evt.preventDefault();
    const field = safeParseJSON(document.getElementById('scenario_config').value);
    if (field) refreshHouse(field);
  });

  document.getElementById('clear-saved').addEventListener('click', function() {
    if (confirm("Remove all saved scenarios? They cannot be recovered!")) {
      localStorage.removeItem("savedScenarios");
      loadSavedList();
    }
  });

  document.getElementById('save-button').addEventListener('click', function() {
    const field_value = safeParseJSON(document.getElementById('scenario_config').value);
    if (!field_value) return;

    const configForm = document.getElementById("configForm");
    const notes = configForm.elements.namedItem('scenarioNotes');

    if (notes.value) { field_value.notes = notes.value; }

    let scenarios = safeParseJSON(localStorage.getItem("savedScenarios"));
    if (!Array.isArray(scenarios)) {
      scenarios = [];
    }
    scenarios.push(field_value);
    localStorage.setItem("savedScenarios", JSON.stringify(scenarios));
    loadSavedList();
  });

  loadSavedList();
  refreshHouse();
});
