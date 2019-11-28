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

const refreshHouse = function(config=null) {
  let house = new HouseScenario("houseCanvas", config)
  house.generate();
}

function HouseScenario(canvasID, conf=null) {
  let defaults ={ 
    scale: 30,
    description: "",
    coordinates: [],
    notes: "",
    stone_colours: ['Red', 'Yellow'],
  }

  this.canvasID = canvasID
  this.conf = Object.assign({}, defaults, conf);

  this.debug = false;
  this.stone_radius = (this.conf.scale * 0.48);
  this.width        = (this.conf.scale * 14);
  this.height       = (this.conf.scale * 30);

  // configure the canvas
  this.canvas = {
    element: document.getElementById(this.canvasID),
    context: document.getElementById(this.canvasID).getContext("2d"),
    conf: {
      origin: {
        x: (this.width / 2),
        y: (this.width / 2)
      },
      back_line: ((this.width / 2) - (6 * this.conf.scale)),
      hog_line: ((this.width / 2) + (21 * this.conf.scale)),
    },
    get width() { return this.element.width },
    get height(){ return this.element.height },
  };
  this.canvas.element.width     = this.width;
  this.canvas.element.height    = this.height;
  this.canvas.context.lineWidth = this.conf.scale < 40 ? 1 : 2;
}

HouseScenario.prototype.drawCircle = function(origin, radius, colour="white") {
  this.canvas.context.beginPath();
  this.canvas.context.arc(origin.x, origin.y, radius, 0, 2 * Math.PI);
  this.canvas.context.fillStyle = colour;
  this.canvas.context.fill();
  this.canvas.context.stroke();
},

HouseScenario.prototype.drawHouse = function() {
  this.drawCircle(this.canvas.conf.origin, (6 * this.conf.scale), 'blue');  // Twelve foot
  this.drawCircle(this.canvas.conf.origin, (4 * this.conf.scale)); // Eight foot
  this.drawCircle(this.canvas.conf.origin, (2 * this.conf.scale), 'red'); // Four foot
  this.drawCircle(this.canvas.conf.origin, (0.5 * this.conf.scale)); // Button

  // Centre line
  this.canvas.context.beginPath();
  this.canvas.context.moveTo(0, this.canvas.conf.origin.y);
  this.canvas.context.lineTo(this.canvas.width, this.canvas.conf.origin.y);
  this.canvas.context.stroke();

  // T-line
  this.canvas.context.beginPath();
  this.canvas.context.moveTo(this.canvas.conf.origin.x, this.canvas.conf.back_line);
  this.canvas.context.lineTo(this.canvas.conf.origin.x, this.canvas.height);
  this.canvas.context.stroke();

  // Backline
  this.canvas.context.beginPath();
  this.canvas.context.moveTo(0, this.canvas.conf.back_line);
  this.canvas.context.lineTo(this.canvas.width, this.canvas.conf.back_line);
  this.canvas.context.stroke();

  // Hogline
  this.canvas.context.beginPath();
  this.canvas.context.moveTo(0, this.canvas.conf.hog_line);
  this.canvas.context.lineTo(this.canvas.width, this.canvas.conf.hog_line);
  this.canvas.context.lineWidth = this.canvas.context.lineWidth * 5;
  this.canvas.context.stroke();
  this.canvas.context.lineWidth = this.canvas.context.lineWidth;
},

HouseScenario.prototype.drawStone = function(pos, colour, num) {
  this.canvas.context.lineWidth = 0.5;
  this.drawCircle(pos, this.stone_radius, 'grey');
  this.drawCircle(pos, (this.stone_radius * 0.7), colour);
  this.canvas.context.lineWidth = this.canvas.context.lineWidth;
  if (num !== undefined) {
    this.canvas.context.fillStyle = (colour == 'Yellow' ? 'black' : 'white');
    this.canvas.context.font = '18px serif';
    this.canvas.context.textAlign = "center";
    this.canvas.context.fillText(num, pos.x, pos.y+5);
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
  let list = zones.map(function(e) { return e.name });
  let weight = zones.map(function(e) { return e.weight });
  let elements = {
    "zone1": {min: (this.canvas.conf.origin.y + (12 * this.conf.scale)), max: this.canvas.conf.hog_line},
    "zone2": {min: (this.canvas.conf.origin.y + (6 * this.conf.scale)), max: (this.canvas.conf.origin.y + (12 * this.conf.scale))},
    "zone3": {min: this.canvas.conf.origin.y, max: (this.canvas.conf.origin.y + (6 * this.conf.scale))},
    "zone4": {min: this.canvas.conf.back_line, max: this.canvas.conf.origin.y},
  }
  
  return elements[getRandomItem(list, weight)]
};

HouseScenario.prototype.generateStonePos = function(zone) {
  return {
    y: getRandomInt(zone.min, zone.max),
    x: getRandomInt(this.stone_radius, (this.canvas.width - this.stone_radius)),
  }
},

HouseScenario.prototype.randomScenario = function(colours, stonesThrown = 15) {
  let labels = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
      positions = ["Lead's first","Lead's last","Second's first","Second's last","Third's first","Third's last","Skip's first","Skip's last"],
      end = sample(labels),
      hammer = (stonesThrown % 2 == 0 ? 'without' : 'with'),
      your_colour = sample(colours),
      up_down = sample(['Up', 'Down']),
      score_diff = Math.floor(Math.random()*6),
      nextStone = stonesThrown + 1;

  if (this.debug) { console.log(`Next Stone: ${nextStone}; Position ${Math.ceil(nextStone/2)-1} : ${positions[Math.ceil(nextStone/2)-1]}`) }

  if (end == "2nd" && up_down == "Up" && hammer == "with") {
    up_down = "Down";
  }
  score_diff = (score_diff == 0 || end == '1st' ? 'Tied' : `${up_down} ${score_diff}`);
  return `${your_colour}, ${end} end ${hammer} hammer, ${positions[Math.ceil(nextStone/2)-1]}, ${score_diff}`
},

HouseScenario.prototype.drawScenarioText = function(description) {
  this.canvas.context.fillStyle = 'black';
  this.canvas.context.font = '16px sans-serif';
  this.canvas.context.textAlign = "center";
  this.canvas.context.fillText(description, (this.width / 2), 20);
}

HouseScenario.prototype.resetHouse = function() {
  this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.canvas.context.lineWidth = this.canvas.context.lineWidth;
  this.drawHouse();
}

HouseScenario.prototype.generate = function(config=null) {
  let configForm = document.getElementById("configForm");
  let colourSelect = configForm.elements.namedItem('stoneColours');
  let notesTextArea = configForm.elements.namedItem('scenarioNotes');
  let zoneFields = document.getElementsByClassName("zoneInput");

  if (config) {
    if (this.debug) { console.log("Generating house using supplied config") }
    this.conf = config;
    
    // Update the form with the config values?
    colourSelect.value = this.conf.stone_colours.join(" / ")
    for (let field of zoneFields) {
      for(let x=0; x < this.conf.zone_weights.length; x++) {
        if (field.name == this.conf.zone_weights[x].name) {
          field.value = this.conf.zone_weights[x].weight * 100
        }
      }
    }
    notesTextArea.value = null;
    if (this.conf.notes) notesTextArea.value = this.conf.notes
  } else {
    if (this.debug) { console.log("Generating house using randomly generated config") }
    
    // Pull the config from the form
    let stone_colours = colourSelect.options[colourSelect.selectedIndex].value.split(" / ");

    let minStonesSelect = configForm.elements.namedItem('minThrown');
    let minStones = minStonesSelect.options[minStonesSelect.selectedIndex].value

    let zones = [];
    Array.prototype.forEach.call(zoneFields, function(element) {
      zones.push({ name: element.name, weight: parseInt(element.value) / 100 })
    });
    zones.sort((a,b) => (a.weight > b.weight) ? 1 : -1).reverse();

    let stones_thrown = getRandomInt(minStones,15); // all stones thrown
    if (this.debug) { console.log(`Stones Thrown ${stones_thrown}`) }
    this.conf = {
      coordinates: [],
      description: this.randomScenario(stone_colours, stones_thrown),
      scale: this.conf.scale,
      stone_colours: stone_colours,
      zone_weights: zones,
      notes: null,
    }

    notesTextArea.value = null;

    // Generate the stone positions
    for(let x=0; x < stones_thrown; x++) {
      let zone = this.fetchZone(zones),
          pos;
      do {
        pos = this.generateStonePos(zone);
      } while (this.overlappingStones(pos, this.conf.coordinates));

      // randomly give each stone a 50% chance of being in play
      if (getRandomInt(1,100) > 45) {
        this.conf.coordinates.push({ origin: pos, num: Math.ceil((x+1)/2), colour_index: (x % 2) });
      }
    }
  }
  // Dump the config to hidden field
  let dump = document.getElementById("scenario_config");
  dump.value = JSON.stringify(this.conf, null, 2);

  // Draw the scenario
  this.resetHouse();

  // Draw the stone positions
  for(let x=0; x < this.conf.coordinates.length; x++) {
    let stone = this.conf.coordinates[x];
    this.drawStone(stone.origin, this.conf.stone_colours[stone.colour_index], stone.num);
  }

  // Draw the scenario text
  this.drawScenarioText(this.conf.description)
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
