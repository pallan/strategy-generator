
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

let house = {
  pixels_per_foot: 40,
  get stone_radius() { return (this.pixels_per_foot * 0.48) },
  get width() { return (this.pixels_per_foot * 30) },
  get height() { return (this.pixels_per_foot * 14) },
  canvas: document.getElementById("houseCanvas"),
  context: document.getElementById("houseCanvas").getContext("2d"),
  coordinates: new Array,
  
  initialize: function() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },

  drawCircle: function(origin, radius, colour="white") {
    this.context.beginPath();
    this.context.arc(origin.x, origin.y, radius, 0, 2 * Math.PI);
    this.context.fillStyle = colour;
    this.context.fill();
    this.context.stroke();
  },

  drawHouse: function() {
    let origin    = {x: (this.canvas.height / 2), y: (this.canvas.height / 2)},
        back_line = (origin.x - (6 * this.pixels_per_foot)),
        hog_line  = (origin.x + (21 * this.pixels_per_foot));

    this.drawCircle(origin, (6 * this.pixels_per_foot), 'blue');  // Twelve foot
    this.drawCircle(origin, (4 * this.pixels_per_foot)); // Eight foot
    this.drawCircle(origin, (2 * this.pixels_per_foot), 'red'); // Four foot
    this.drawCircle(origin, (0.5 * this.pixels_per_foot)); // Button

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
    this.context.moveTo(back_line, 0);
    this.context.lineTo(back_line, this.canvas.height);
    this.context.stroke();

    // Hogline
    let tmpLineWidth = this.context.lineWidth
    this.context.beginPath();
    this.context.moveTo(hog_line, 0);
    this.context.lineTo(hog_line, this.canvas.height);
    this.context.lineWidth = 10;
    this.context.stroke();

    this.context.lineWidth = tmpLineWidth;
  },
  
  drawStone: function(pos, colour) {
    this.context.lineWidth = 0.5;
    this.drawCircle(pos, this.stone_radius, 'grey');
    this.drawCircle(pos, (this.stone_radius - 7), colour);
  },
  
  overlappingStones: function(pos) {
    let newStone = {radius: this.stone_radius, x: pos.x, y: pos.y};

    for(i=0; i < this.coordinates.length; i++) {
      let stone = {radius: this.stone_radius, x: this.coordinates[i].x, y: this.coordinates[i].y};
      let dx = newStone.x - stone.x;
      let dy = newStone.y - stone.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < newStone.radius + stone.radius) {
        return true;
      }
    }
    return false;
  },
  
  generateStonePos: function(colour) {
    let origin    = {x: (this.canvas.height / 2), y: (this.canvas.height / 2)},
        back_line = (origin.x - (6 * this.pixels_per_foot) - this.stone_radius),
        hog_line  = (origin.x + (21 * this.pixels_per_foot) - this.stone_radius);

    let list = ['zone4', 'zone3', 'zone2', 'zone1'];
    let weight = [0.3, 0.4, 0.22, 0.08];
    let elements = {
      "zone1": {min: (origin.x + (12 * this.pixels_per_foot)), max: hog_line},
      "zone2": {min: (origin.x + (6 * this.pixels_per_foot)), max: (origin.x + (12 * this.pixels_per_foot))},
      "zone3": {min: origin.x, max: (origin.x + (6 * this.pixels_per_foot))},
      "zone4": {min: back_line, max: origin.x},
    }
    let zone = elements[getRandomItem(list, weight)]
    console.log(zone);

    do {
      pos = {
        x: getRandomInt(zone.min, zone.max),
        y: getRandomInt(this.stone_radius, (this.canvas.height - this.stone_radius)),
        colour,
      }
    } while (this.overlappingStones(pos));

    if (getRandomInt(1,100) > 50) {
      this.drawStone(pos, colour);
      this.coordinates.push(pos)
    }
  },
  
  randomScenario: function() {
    let labels = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'],
        end = sample(labels),
        player = sample(["Lead's", "Second's", "Third's", "Skip's"]),
        stone = sample(labels, 2),
        hammer = sample(['with', 'without']),
        your_colour = sample(['Red','Yellow']),
        up_down = sample(['Up', 'Down']),
        score_diff = Math.floor(Math.random()*6);

    score_diff =  (score_diff == 0 ? 'Tied' : `${up_down} ${score_diff}`);

    let scenario = `${your_colour}, ${end} end ${hammer} hammer, ${player} ${stone}, ${score_diff}`
    this.context.fillStyle = 'black';
    this.context.font = '16px sans-serif';
    this.context.textAlign = "center";
    this.context.fillText(scenario, (this.width / 2), (this.height - 10));
  },
  
  generate: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.lineWidth = 2;
    this.drawHouse();

    this.coordinates = new Array;
    for(i=1; i < 9; i++) {
      this.generateStonePos('red');
      this.generateStonePos('yellow');
    }

    this.randomScenario();
    let dump = document.getElementById("dump");
    dump.innerText = JSON.stringify(this.coordinates, null, 2);
  }
}

house.initialize();
house.generate();
