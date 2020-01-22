"use strict";

const sample = (a, range=null) => {
  if (!Array.isArray(a)) return ''
  range = (range == null ? a.length : range);
  return a[Math.floor(Math.random()*range)]
}

const rand = (min, max) => Math.random() * (max - min) + min;

const getRandomInt = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);

const getRandomItem = function(list, weight) {
  let total_weight = weight.reduce((prev, cur, i, arr) => prev + cur );
   
  let random_num = rand(0, total_weight);
  let weight_sum = 0;
   
  for (let i = 0; i < list.length; i++) {
    weight_sum += weight[i];
    weight_sum = +weight_sum.toFixed(2);
     
    if (random_num <= weight_sum) {
      return list[i];
    }
  }
};

const refreshHouse = function(config= null) {
  let house = new HouseScenario(30, "houseCanvas")
  house.generate(config);
}

function HouseScenario(scale, canvasId) {
  this.debug = false;
  this.scale = scale;
  this.stone_radius = (this.scale * 0.48);
  this.width = (scale * 14);
  this.height = (scale * 30);
  this.scenarioConfig = {
    coordinates: [],
    description: "",
    scale: scale,
  };
  this.defaultCanvasValues = {
    lineWidth: scale < 40 ? 1 : 2,
  }

  // configure the canvas
  this.canvas = document.getElementById(canvasId);
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  this.context = document.getElementById(canvasId).getContext("2d");
  this.context.lineWidth = this.defaultCanvasValues.lineWidth;
}

HouseScenario.prototype.drawCircle = function(origin, radius, colour="white") {
  this.context.beginPath();
  this.context.arc(origin.x, origin.y, radius, 0, 2 * Math.PI);
  this.context.fillStyle = colour;
  this.context.fill();
  this.context.stroke();
},

HouseScenario.prototype.drawHouse = function() {
  let origin    = {x: (this.canvas.width / 2), y: (this.canvas.width / 2)},
      back_line = (origin.y - (6 * this.scale)),
      hog_line  = (origin.y + (21 * this.scale));

  this.drawCircle(origin, (6 * this.scale), 'blue');  // Twelve foot
  this.drawCircle(origin, (4 * this.scale)); // Eight foot
  this.drawCircle(origin, (2 * this.scale), 'red'); // Four foot
  this.drawCircle(origin, (0.5 * this.scale)); // Button

  // Centre line
  this.context.beginPath();
  this.context.moveTo(0, origin.y);
  this.context.lineTo(this.canvas.width, origin.y);
  this.context.stroke();

  // T-line
  this.context.beginPath();
  this.context.moveTo(origin.x, back_line);
  this.context.lineTo(origin.x, this.canvas.height);
  this.context.stroke();

  // Backline
  this.context.beginPath();
  this.context.moveTo(0, back_line);
  this.context.lineTo(this.canvas.width, back_line);
  this.context.stroke();

  // Hogline
  this.context.beginPath();
  this.context.moveTo(0, hog_line);
  this.context.lineTo(this.canvas.width, hog_line);
  this.context.lineWidth = this.defaultCanvasValues.lineWidth * 5;
  this.context.stroke();
  this.context.lineWidth = this.defaultCanvasValues.lineWidth;
},

HouseScenario.prototype.drawStone = function(pos, colour, num) {
  this.context.lineWidth = 0.5;
  this.drawCircle(pos, this.stone_radius, 'grey');
  this.drawCircle(pos, (this.stone_radius * 0.7), colour);
  this.context.lineWidth = this.defaultCanvasValues.lineWidth;
  if (num !== undefined) {
    this.context.fillStyle = (colour == 'Yellow' ? 'black' : 'white');
    this.context.font = '18px serif';
    this.context.textAlign = "center";
    this.context.fillText(num, pos.x, pos.y+5);
  }
},

HouseScenario.prototype.overlappingStones = function(pos, existing) {
  let newStone = {radius: this.stone_radius, x: pos.x, y: pos.y};

  for(let i=0; i < existing.length; i++) {
    let stone = {radius: this.stone_radius, x: existing[i].origin.x, y: existing[i].origin.y};
    let dx = newStone.x - stone.x;
    let dy = newStone.y - stone.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < newStone.radius + stone.radius) {
      return true;
    }
  }
  return false;
},

HouseScenario.prototype.fetchZone = function(zones) {
  let origin    = {x: (this.canvas.width / 2), y: (this.canvas.width / 2)},
      back_line = (origin.y - (6 * this.scale) - this.stone_radius),
      hog_line  = (origin.y + (21 * this.scale) - this.stone_radius);

  let list = zones.map(function(e) { return e.name });
  let weight = zones.map(function(e) { return e.weight });
  let elements = {
    "zone1": {min: (origin.y + (12 * this.scale)), max: hog_line},
    "zone2": {min: (origin.y + (6 * this.scale)), max: (origin.y + (12 * this.scale))},
    "zone3": {min: origin.y, max: (origin.y + (6 * this.scale))},
    "zone4": {min: back_line, max: origin.y},
  }
  
  return elements[getRandomItem(list, weight)]
};

HouseScenario.prototype.generateStonePos = function(zone) {
  return {
    y: getRandomInt(zone.min, zone.max),
    x: getRandomInt(this.stone_radius, (this.canvas.width - this.stone_radius)),
  }
},

HouseScenario.prototype.scenarioToString = function(config) {
  let ends = (config.numberOfEnds ? ` (${config.numberOfEnds} ends)` : '' );
  return `${config.colour}, ${config.end} end ${config.hammer ? 'w/' : 'w/o '}hammer, ${config.thrower}, ${config.score_diff}${ends}`
}

HouseScenario.prototype.randomScenario = function(colours, numberOfEnds = 8, stonesThrown = 15, currentEnd="") {
  let labels = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
      positions = ["Lead's first","Lead's last","Second's first","Second's last","Third's first","Third's last","Skip's first","Skip's last"],
      up_down = sample(['Up', 'Down']),
      nextStone = stonesThrown + 1,
      score_diff = Math.floor(Math.random()*6);


      console.log(currentEnd)
  let conf = {
    numberOfEnds: numberOfEnds,
    end: (currentEnd != "" ? currentEnd : sample(labels, numberOfEnds)),
    hammer: (stonesThrown % 2 == 0),
    colour: sample(colours),
    thrower: positions[Math.ceil(nextStone/2)-1],
    score_diff: ''
  }

  if (conf.end == "2nd" && up_down == "Up" && conf.hammer) {
    up_down = "Down";
  }
  conf.score_diff = (score_diff == 0 || conf.end == '1st' ? 'Tied' : `${up_down} ${score_diff}`);

  return conf;
}

HouseScenario.prototype.drawScenarioText = function(description) {
  this.context.fillStyle = 'black';
  this.context.font = '14px sans-serif';
  this.context.textAlign = "center";
  this.context.fillText(description, (this.width / 2), 20);
}

HouseScenario.prototype.resetHouse = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.context.lineWidth = this.defaultCanvasValues.lineWidth;;
  this.drawHouse();
}

HouseScenario.prototype.generate = function(config=null) {
  this.resetHouse();

  let configForm = document.getElementById("configForm");
  let colourSelect = configForm.elements.namedItem('stoneColours');
  let notes = configForm.elements.namedItem('scenarioNotes');
  let zoneFields = document.getElementsByClassName("zoneInput");

  if (config) {
    if (this.debug) { console.log("Generating house using supplied config") }
    this.scenarioConfig = config;
    
    // Update the form with the config values?
    colourSelect.value = this.scenarioConfig.stone_colours.join(" / ")
    for (let field of zoneFields) {
      for(let x=0; x < this.scenarioConfig.zone_weights.length; x++) {
        if (field.name == this.scenarioConfig.zone_weights[x].name) {
          field.value = this.scenarioConfig.zone_weights[x].weight * 100
        }
      }
    }
    notes.value = null;
    if (this.scenarioConfig.notes) notes.value = this.scenarioConfig.notes
  } else {
    if (this.debug) { console.log("Generating house using randomly generated config") }
    
    // Pull the config from the form
    let stone_colours = colourSelect.options[colourSelect.selectedIndex].value.split(" / ");

    let minStonesSelect = configForm.elements.namedItem('minThrown');
    let minStones = minStonesSelect.options[minStonesSelect.selectedIndex].value;
    let numberOfEnds = configForm.elements.namedItem("numOfEnds").value;
    
    let currentEndSelect = configForm.elements.namedItem("currentEnd");
    let currentEnd = currentEndSelect.options[currentEndSelect.selectedIndex].value;

    let zones = [];
    Array.prototype.forEach.call(zoneFields, function(element) {
      zones.push({ name: element.name, weight: parseInt(element.value) / 100 })
    });
    zones.sort((a,b) => (a.weight > b.weight) ? 1 : -1).reverse();

    let stones_thrown = getRandomInt(minStones,15); // all stones thrown
    if (this.debug) { console.log(`Stones Thrown ${stones_thrown}`) }
    this.scenarioConfig = {
      coordinates: [],
      details: this.randomScenario(stone_colours, numberOfEnds, stones_thrown, currentEnd),
      scale: this.scale,
      stone_colours: stone_colours,
      zone_weights: zones,
      notes: ''
    }

    notes.value = null;

    if (this.scenarioConfig.details.hammer && this.scenarioConfig.details.colour == this.scenarioConfig.stone_colours[0]) {
      this.scenarioConfig.stone_colours.reverse();
    }

    // Generate the stone positions
    for(let x=0; x < stones_thrown; x++) {
      let zone = this.fetchZone(zones),
          pos;
      do {
        pos = this.generateStonePos(zone);
      } while (this.overlappingStones(pos, this.scenarioConfig.coordinates));

      // randomly give each stone a 50% chance of being in play
      if (getRandomInt(1,100) > 45) {
        this.scenarioConfig.coordinates.push({ origin: pos, num: Math.ceil((x+1)/2), colour_index: (x % 2) });
      }
    }
  }

  // Draw the scenario
  // Draw the stone positions
  for(let x=0; x < this.scenarioConfig.coordinates.length; x++) {
    let stone = this.scenarioConfig.coordinates[x];
    this.drawStone(stone.origin, this.scenarioConfig.stone_colours[stone.colour_index], stone.num);
  }

  // Draw the scenario text
  if (this.scenarioConfig.description) {
    this.drawScenarioText(this.scenarioConfig.description)
  } else {
    this.drawScenarioText(this.scenarioToString(this.scenarioConfig.details))
  }

  // New scnario clear the notes  
  // Dump the config to screen (for debugging)
  let dump = document.getElementById("scenario_config");
  dump.value = JSON.stringify(this.scenarioConfig, null, 2);
}

// Manage the Saved Scenario List
const scenarioListItemNode = function(index, description) {
  let textnode = document.createTextNode(description);
  let node = document.createElement("BUTTON");
  node.setAttribute('type', 'button');
  node.className += "list-group-item list-group-item-action";
  node.setAttribute('data-index', index);
  node.appendChild(textnode);
  return node;
};

const loadScenario = function(index) {
  let scenarios = JSON.parse(localStorage.getItem("savedScenarios"))
  refreshHouse(scenarios[index]);
};

const loadSavedList = function() {
  let scenarioList = document.getElementById("saved-scenario-list")
  while (scenarioList.firstChild) {
    scenarioList.removeChild(scenarioList.firstChild);
  }

  if (localStorage.getItem("savedScenarios") !== null) {
    let scenarios = JSON.parse(localStorage.getItem("savedScenarios"));
    for(let x=0; x < scenarios.length; x++) { 
      let listItem = scenarioListItemNode(x, scenarios[x].description);
      scenarioList.appendChild(listItem);

      listItem.addEventListener('click', function(evt){
        loadScenario(this.getAttribute('data-index'))
        for (let item of this.parentNode.children) {
          item.classList.remove('active');
        }
        this.className += " active";
      });
    }
  }
}

// Page load initializations
window.addEventListener('load', function() {

  document.getElementById('configForm').addEventListener('submit', function(evt){
    evt.preventDefault()
    let field = JSON.parse(document.getElementById('scenario_config').value);
    refreshHouse();
  });

  document.getElementById('toggle-advanced').addEventListener('click', function(evt){
    let advancedForm = document.getElementById('advanced-config');
    advancedForm.style.display = advancedForm.style.display == "block" ? "none" : "block";
  });

  document.getElementById('rawJSONConfigForm').addEventListener('submit', function(evt){
    evt.preventDefault()
    let field = JSON.parse(document.getElementById('scenario_config').value);
    refreshHouse(field);
  });

  document.getElementById('clear-saved').addEventListener('click', function(evt){
    if (confirm("Remove all saved scenarios? They cannot be recovered!")) {
      localStorage.removeItem("savedScenarios");
      loadSavedList();
    }
  });

  document.getElementById('save-button').addEventListener('click', function(evt){
    if (this.debug) { console.log('Saving to local storage') }
    let field_value = JSON.parse(document.getElementById('scenario_config').value);
    let scenarios = localStorage.getItem("savedScenarios")

    let configForm = document.getElementById("configForm");
    let notes = configForm.elements.namedItem('scenarioNotes');

    if (notes.value) { field_value.notes = notes.value }
    console.log(field_value.notes);

    if (scenarios === null) {
      scenarios = [field_value]
    } else {
      scenarios = JSON.parse(scenarios)
      if (!Array.isArray(scenarios)) {
        localStorage.removeItem("savedScenarios");
        scenarios = [];
      }
      scenarios.push(field_value);
    }
    localStorage.setItem("savedScenarios", JSON.stringify(scenarios));
    loadSavedList();
  })

  loadSavedList();
  refreshHouse();
})
