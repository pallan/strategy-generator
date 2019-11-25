
const sample = (a, range=null) => {
  if (!Array.isArray(a)) return ''
  range = (range == null ? a.length : range);
  return a[Math.floor(Math.random()*range)]
}

let rand = function(min, max) {
  return Math.random() * (max - min) + min;
};
 
let getRandomItem = function(list, weight) {
  let total_weight = weight.reduce(function (prev, cur, i, arr) {
    return prev + cur;
  });
   
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function refreshHouse()
{
  house.generate();
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
  this.context.moveTo(origin.x, 0);
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

HouseScenario.prototype.drawStone = function(pos, colour) {
  this.context.lineWidth = 0.5;
  this.drawCircle(pos, this.stone_radius, 'grey');
  this.drawCircle(pos, (this.stone_radius * 0.7), colour);
  this.context.lineWidth = this.defaultCanvasValues.lineWidth;
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

HouseScenario.prototype.fetchZone = function() {
  let origin    = {x: (this.canvas.width / 2), y: (this.canvas.width / 2)},
      back_line = (origin.y - (6 * this.scale) - this.stone_radius),
      hog_line  = (origin.y + (21 * this.scale) - this.stone_radius);

  let list = ['zone4', 'zone3', 'zone2', 'zone1'];
  let weight = [0.3, 0.4, 0.22, 0.08];
  let elements = {
    "zone1": {min: (origin.y + (12 * this.scale)), max: hog_line},
    "zone2": {min: (origin.y + (6 * this.scale)), max: (origin.y + (12 * this.scale))},
    "zone3": {min: origin.y, max: (origin.y + (6 * this.scale))},
    "zone4": {min: back_line, max: origin.y},
  }
  
  return elements[getRandomItem(list, weight)]
};

HouseScenario.prototype.generateStonePos = function() {
  zone = this.fetchZone();
  return {
    y: getRandomInt(zone.min, zone.max),
    x: getRandomInt(this.stone_radius, (this.canvas.width - this.stone_radius)),
  }
},

HouseScenario.prototype.randomScenario = function() {
  let labels = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'],
      end = sample(labels),
      player = sample(["Lead's", "Second's", "Third's", "Skip's"]),
      stone = sample(labels, 2),
      hammer = sample(['with', 'without']),
      your_colour = sample(['Red','Yellow']),
      up_down = sample(['Up', 'Down']),
      score_diff = Math.floor(Math.random()*6);

  score_diff = (score_diff == 0 ? 'Tied' : `${up_down} ${score_diff}`);
  return `${your_colour}, ${end} end ${hammer} hammer, ${player} ${stone.toLowerCase()}, ${score_diff}`
},

HouseScenario.prototype.drawScenarioText = function(description) {
  this.context.fillStyle = 'black';
  this.context.font = '16px sans-serif';
  this.context.textAlign = "center";
  this.context.fillText(description, (this.width / 2), (this.height - 10));
}

HouseScenario.prototype.resetHouse = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.context.lineWidth = this.defaultCanvasValues.lineWidth;;
  this.drawHouse();
}

HouseScenario.prototype.generate = function(config=null) {
  this.resetHouse();

  if (config) {
    if (this.debug) { console.log("Generating house using supplied config") }
    this.scenarioConfig = config;
  } else {
    if (this.debug) { console.log("Generating house using randomly generated config") }
    let stone_colours = ['red', 'yellow'];
    this.scenarioConfig = {
      coordinates: [],
      description: this.randomScenario(),
      scale: this.scale,
    }

    // Generate the stone positions
    for(let x=1; x < 17; x++) {
      do {
        pos = this.generateStonePos();
      } while (this.overlappingStones(pos, this.scenarioConfig.coordinates));

      // randomly give each stone a 50% chance of being in play
      if (getRandomInt(1,100) > 50) {
        this.scenarioConfig.coordinates.push({ origin: pos, colour: stone_colours[(x % 2)] });
      }
    }
  }

  // Draw the scenario
  // Draw the stone positions
  for(let x=0; x < this.scenarioConfig.coordinates.length; x++) {
    let stone = this.scenarioConfig.coordinates[x];
    this.drawStone(stone.origin, stone.colour);
  }

  // Draw the scenario text
  this.drawScenarioText(this.scenarioConfig.description)
  
  // Dump the config to screen (for debugging)
  let dump = document.getElementById("scenario_config");
  dump.value = JSON.stringify(this.scenarioConfig, null, 2);
}

window.addEventListener('load', function() {
  let appendSavedScenario = function(list, index, description) {
    let textnode = document.createTextNode(description);
    let node = document.createElement("BUTTON");
    node.setAttribute('type', 'button');
    node.className += "list-group-item list-group-item-action load-saved";
    node.setAttribute('data-index', index);
    node.appendChild(textnode);
    list.appendChild(node);
  };

  let loadSavedList = function() {
    let scenarioList = document.getElementById("saved-scenario-list")
    while (scenarioList.firstChild) {
      scenarioList.removeChild(scenarioList.firstChild);
    }

    if (localStorage.getItem("savedScenarios") !== null) {
      s = JSON.parse(localStorage.getItem("savedScenarios"));
      for(let x=0; x < s.length; x++) { 
        appendSavedScenario(scenarioList, x, s[x].description)
      }
    }

    let classname = document.getElementsByClassName("load-saved");
    let loadScenario = function() {
      let scenarios = JSON.parse(localStorage.getItem("savedScenarios"))
      house.generate(scenarios[this.getAttribute('data-index')]);
      for (let i = 0; i < classname.length; i++) {
        classname[i].classList.remove('active');
      }
      this.className += " active";
    };
    for (let i = 0; i < classname.length; i++) {
      classname[i].addEventListener('click', loadScenario, false);
    }
  }

  document.getElementById('scenario-config-form').addEventListener('submit', function(evt){
    evt.preventDefault()
    let field = JSON.parse(document.getElementById('scenario_config').value);
    house.generate(field);
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
  house = new HouseScenario(40, "houseCanvas")
  house.generate();
})
