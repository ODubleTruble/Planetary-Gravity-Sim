// ----------VARIABLE DECLARATIONS----------

// looks for canvas element and stores it in the variable named canvas
var canvas = document.querySelector('canvas');

// sets the canvas' width and height to the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// content of the canvas
var c = canvas.getContext('2d');

// palette of colors for planets
const colorArray = [
  '#F18F01', // yellow
  '#C73E1D', // red-orange
  '#CD5D67', // salmon
  '#A23B72', // purple
  '#2E86AB', // blue
  '#339989', // turquoise
];

// array for the setIntervals
var intervals = [];

// array for planets
var planets = [];

// gravitational constant
const grav = 0.01;

// array of planets the camera follows
var camPlan = [0];

// zoom factor
var zoom;
const maxZoom = 0.8;

// the ms between each calculation of the sim
const simSpeed = 10;

// the times the screen updates in one second
const fps = 200;

// whether or not the sim starts
var startSim = false;

// object for info of settings box
sBox = {
  lef: 20,
  top: 20,
  wid: 150,
  hei: 0,
};

// the mouse click position
var mouseX = 0;
var mouseY = 0;

// counters for the num of times the sim has ran or the screen updated
var simCount = 0;
var drawCount = 0;

var config = 8;
console.log(`CONFIG: ${config}`);

// ----------EVENT LISTENERS----------

// resizes the canvas on window resize
window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  init();
});

// detects for clicks
window.addEventListener('click', function (pos) {
  mouseX = pos.clientX;
  mouseY = pos.clientY;

  // if clicked start sim button and sim isn't running
  if (!startSim) {
    if (mouseX > sBox.lef + 7 && mouseX < sBox.lef + 7 + sBox.wid - 14) {
      if (mouseY > sBox.top + 7 && mouseY < sBox.top + 7 + 30) {
        startSim = true;

        // updates the planets' data every set interval
        intervals.push(window.setInterval(function () {simulatePlanets();}, simSpeed));
      }
    }
  }
});

// ----------MAIN FUNCTIONS----------

function init() {
  // resets the array of intervals
  for (let interval of intervals) {
    window.clearInterval(interval);
  }

  // reset some variables
  planets = [];
  intervals = [];
  startSim = false;

  makeInitialPlanets();

  // draws the planets' every set interval
  intervals.push(window.setInterval(function () {updateScreen();}, 1000 / fps));

  // creates the html for the planets
  createPlanHTML();
}

function makeInitialPlanets() {
  if (config == 0) {
    camPlan = [0];
    planets.push(new Planet(60, 0, 0, 0, 0, colorArray[0]));
  }

  // original 3-planet simulation; good for consistency tests
  if (config == 1) {
    camPlan = [0, 1, 2];
    planets.push(new Planet(60, 550, 450, 0, 0, colorArray[0]));
    planets.push(new Planet(20, 550, 200, 7, 140, colorArray[4]));
    planets.push(new Planet(10, 1000, 100, 4, 70, colorArray[3]));
  }

  // original 3-planet simulation but weird creation order; good for consistency tests
  if (config == 2) {
    camPlan = [0, 1, 2];
    planets.push(new Planet(20, 550, 200, 7, 140, colorArray[4]));
    planets.push(new Planet(10, 1000, 100, 4, 70, colorArray[3]));
    planets.push(new Planet(60, 550, 450, 0, 0, colorArray[0]));
  }

  // line of 4 planets; good for collision tests
  if (config == 3) {
    camPlan = [0, 1, 2, 3];
    planets.push(new Planet(60, 550, 450, 0, 0, colorArray[0]));
    planets.push(new Planet(30, 700, 450, 10, 90, colorArray[4]));
    planets.push(new Planet(40, 1100, 450, 5, 90, colorArray[3]));
    planets.push(new Planet(50, 1400, 450, 5, 90, colorArray[1]));
  }

  // one planet orbits far out; good for auto zoom tests
  if (config == 4) {
    camPlan = [0, 1, 2];
    planets.push(new Planet(60, 550, 450, 0, 0, colorArray[0]));
    planets.push(new Planet(50, 1400, 450, 5, 90, colorArray[1]));
    planets.push(new Planet(30, 550, 300, 10, 180, colorArray[4]));
  }

  // yin yang; turn off clear screen and vectors
  if (config == 5) {
    camPlan = [0, 1];
    planets.push(new Planet(50, 0, 0, 2.5, 300, '#FFFFFF'));
    planets.push(new Planet(50, 300, 0, 2.5, 120, '#000000'));
  }

  // compare all 6 colors
  if (config == 6) {
    camPlan = [0, 1, 2, 3, 4, 5];
    planets.push(new Planet(40, 0, 0, 0, 0, colorArray[0]));
    planets.push(new Planet(40, 100, 0, 0, 0, colorArray[1]));
    planets.push(new Planet(40, 200, 0, 0, 0, colorArray[2]));
    planets.push(new Planet(40, 300, 0, 0, 0, colorArray[3]));
    planets.push(new Planet(40, 400, 0, 0, 0, colorArray[4]));
    planets.push(new Planet(40, 500, 0, 0, 0, colorArray[5]));
  }

  // sun with two planets each with moon orbiting
  if (config == 7) {
    camPlan = [0, 1, 2, 3, 4];
    planets.push(new Planet(60, 0, 0, 0, 0, colorArray[0]));

    planets.push(new Planet(20, -500, 0, 4, 270, colorArray[2]));
    planets.push(new Planet(10, -550, 0, 1, 270, colorArray[3]));

    planets.push(new Planet(20, 500, 0, 4, 90, colorArray[4]));
    planets.push(new Planet(10, 550, 0, 1, 90, colorArray[5]));
  }

  // asteroid, sun with two planets each with moon orbiting
  if (config == 8) {
    camPlan = [0, 1, 2, 3, 4];

    // sun
    planets.push(new Planet(60, 0, 0, 0, 0, colorArray[0]));

    // planet and moon pair 1
    planets.push(new Planet(20, -500, 0, 4, 270, colorArray[2]));
    planets.push(new Planet(10, -550, 0, 1, 270, colorArray[3]));

    // planet and moon pair 2
    planets.push(new Planet(20, 500, 0, 4, 90, colorArray[4]));
    planets.push(new Planet(10, 550, 0, 1, 90, colorArray[5]));

    // astroid
    planets.push(new Planet(40, 20000, 0, 40, 180.7, colorArray[1]));
  }
}

function Planet(r, x, y, vel, dir, color) {
  this.r = r;
  this.x = x;
  this.y = y;
  this.vel = vel;
  this.velDir = dir; // dir is the degree of the direction the velocity is
  this.acc = 0;
  this.accDir = 0;
  this.color = color;

  // calculates the volume as the mass
  this.mass = (4 / 3) * Math.PI * (r ** 3);

  // the visual values for displaying on the screen
  this.visX = x;
  this.visY = y;
  this.visR = r;

  // -----PLANET FUNCTIONS-----

  // updates the planet's velocity
  this.updateVel = function () {
    let newVelVec = addVec(this.vel, this.velDir, this.acc, this.accDir);
    this.vel = newVelVec[0];
    this.velDir = newVelVec[1];
  };

  // updates the planet's position
  this.updatePos = function () {
    // calc the new pos from the velocity
    this.x += this.vel * Math.cos(this.velDir * (Math.PI / 180));
    this.y += this.vel * Math.sin(this.velDir * (Math.PI / 180));
  };

  // updates the planet's visual pos to account for camPlan
  this.updateVisPos = function () {
    let centPos = calcCentCamPlan();

    // changes the visual coords to the center of the planets in question
    this.visX = (this.x * zoom) + (canvas.width / 2) - (centPos[0] * zoom);
    this.visY = (this.y * zoom) + (canvas.height / 2) - (centPos[1] * zoom);

    this.visR = this.r * zoom;
  };

  // draws the planet's vectors
  this.drawVectors = function () {
    // how much larger the vector is than the actual value it represents
    let scaleVel = 5;
    let scaleAcc = 100;

    // the change in pos from center of plan to end of vel vector
    let dxVel = (this.vel * zoom * scaleVel + this.visR) * Math.cos(this.velDir * (Math.PI / 180));
    let dyVel = (this.vel * zoom * scaleVel + this.visR) * Math.sin(this.velDir * (Math.PI / 180));

    // the change in pos from center of plan to end of acc vector
    let dxAcc = (this.acc * zoom * scaleAcc + this.visR) * Math.cos(this.accDir * (Math.PI / 180));
    let dyAcc = (this.acc * zoom * scaleAcc + this.visR) * Math.sin(this.accDir * (Math.PI / 180));

    // changes the line width
    c.lineWidth = 5 * zoom;

    // draws the velocity vector if vel isn't 0
    if (this.vel != 0) {
      c.beginPath();
      c.moveTo(this.visX, this.visY);
      c.lineTo(this.visX + dxVel, this.visY + dyVel);
      c.strokeStyle = '#068501';
      c.stroke();
    }

    if (this.acc != 0) {
      // draws the acceleration vector
      c.beginPath();
      c.moveTo(this.visX, this.visY);
      c.lineTo(this.visX + dxAcc, this.visY + dyAcc);
      c.strokeStyle = '#a61d08';
      c.stroke();
    }
  };

  // draws the planet
  this.draw = function () {
    // the planet itself
    c.beginPath();
    c.arc(this.visX, this.visY, this.visR, 0, Math.PI * 2);

    // creates a gradient
    let x0 = this.visX; // the x of the starting circle of gradient
    let y0 = this.visY; // the y of the starting circle of gradient
    let r0 = 0;
    let x1 = this.visX;
    let y1 = this.visY;
    let r1 = this.visR * 1.2;
    let grd = c.createRadialGradient(x0, y0, r0, x1, y1, r1);
    grd.addColorStop(0, this.color);
    grd.addColorStop(1, '#111111');

    // fills the circle with a random color from palette
    c.fillStyle = grd;
    c.fill();
  };
}

// updates the planets data (only data/nonvisual things)
function simulatePlanets() {
  // update all planets accelerations
  updateAccs();

  // update all planets velocities
  for (let planet of planets) {planet.updateVel();}

  // update all planets positions
  for (let planet of planets) {planet.updatePos();}

  // detects collisions if there's more than 1 planet
  if (planets.length > 1) {
    detectColl();
  }

  simCount += 1;
}

// updates the screen (only visual things)
function updateScreen() {
  // clears the canvas
  c.fillStyle = '#111111';
  c.fillRect(0, 0, innerWidth, innerHeight);

  // draws border around the canvas
  drawBorder();

  // updates zoom
  updateZoom();

  // updates all planets visual positions
  for (let planet of planets) {planet.updateVisPos();}

  // draws all planets vectors
  for (let planet of planets) {planet.drawVectors();}

  // draw all planets
  for (let planet of planets) {planet.draw();}

  drawPlanetDataBox();

  drawCount += 1;
}

// ----------DO SOMETHING FUNCTIONS----------

// creates the html for the planets
function createPlanHTML() {
  // get the planets div and clear it
  const planetsDiv = document.getElementById('planets');
  planetsDiv.innerHTML = '';

  // changes the grid layout based on screen size
  planetsDiv.style.gridTemplateColumns = '1fr '.repeat(window.innerWidth / 300);

  // runs for each planet
  planets.forEach(function (plan, i) {
    // create the div for this planet
    let planDiv = document.createElement('div');
    planDiv.className = `plan${i}`;

    // the planet header
    let planHeader = document.createElement('h3');
    planHeader.innerHTML = `Planet ${i}`;
    planDiv.appendChild(planHeader);

    // the remove button
    let remBut = document.createElement('input');
    remBut.setAttribute('type', 'button');
    remBut.setAttribute('value', '-');
    remBut.setAttribute('onclick', `removePlan(${i})`);
    remBut.className = 'removeButton';
    planDiv.appendChild(remBut);

    // insert a break
    planDiv.appendChild(document.createElement('br'));

    // radius
    let rLabel = document.createElement('label');
    rLabel.innerHTML = 'Radius: ';
    planDiv.appendChild(rLabel);
    let rBox = document.createElement('input');
    rBox.setAttribute('type', 'text');
    rBox.setAttribute('id', `plan${i}r`);
    rBox.setAttribute('name', `plan${i}r`);
    rBox.setAttribute('value', plan.r);
    rBox.setAttribute('onchange', `htmlInputsChanged(${i}, 'r')`);
    planDiv.appendChild(rBox);

    // insert a break
    planDiv.appendChild(document.createElement('br'));

    // mass
    let massLabel = document.createElement('label');
    massLabel.innerHTML = 'Mass: ';
    planDiv.appendChild(massLabel);
    let massBox = document.createElement('input');
    massBox.setAttribute('type', 'text');
    massBox.setAttribute('id', `plan${i}mass`);
    massBox.setAttribute('name', `plan${i}mass`);
    massBox.setAttribute('value', plan.mass);
    massBox.setAttribute('onchange', `htmlInputsChanged(${i}, 'mass')`);
    planDiv.appendChild(massBox);

    // insert a break
    planDiv.appendChild(document.createElement('br'));

    // x
    let xLabel = document.createElement('label');
    xLabel.innerHTML = 'X: ';
    planDiv.appendChild(xLabel);
    let xBox = document.createElement('input');
    xBox.setAttribute('type', 'text');
    xBox.setAttribute('id', `plan${i}x`);
    xBox.setAttribute('name', `plan${i}x`);
    xBox.setAttribute('value', plan.x);
    xBox.setAttribute('onchange', `htmlInputsChanged(${i}, 'x')`);
    planDiv.appendChild(xBox);

    // insert a break
    planDiv.appendChild(document.createElement('br'));

    // y
    let yLabel = document.createElement('label');
    yLabel.innerHTML = 'Y: ';
    planDiv.appendChild(yLabel);
    let yBox = document.createElement('input');
    yBox.setAttribute('type', 'text');
    yBox.setAttribute('id', `plan${i}y`);
    yBox.setAttribute('name', `plan${i}y`);
    yBox.setAttribute('value', plan.y);
    yBox.setAttribute('onchange', `htmlInputsChanged(${i}, 'y')`);
    planDiv.appendChild(yBox);

    // insert a break
    planDiv.appendChild(document.createElement('br'));

    // velocity
    let velLabel = document.createElement('label');
    velLabel.innerHTML = 'Velocity: ';
    planDiv.appendChild(velLabel);
    let velBox = document.createElement('input');
    velBox.setAttribute('type', 'text');
    velBox.setAttribute('id', `plan${i}vel`);
    velBox.setAttribute('name', `plan${i}vel`);
    velBox.setAttribute('value', plan.vel);
    velBox.setAttribute('onchange', `htmlInputsChanged(${i}, 'vel')`);
    planDiv.appendChild(velBox);

    // insert a break
    planDiv.appendChild(document.createElement('br'));

    // velocity direction
    let velDirLabel = document.createElement('label');
    velDirLabel.innerHTML = 'Vel. Direction: ';
    planDiv.appendChild(velDirLabel);
    let velDirBox = document.createElement('input');
    velDirBox.setAttribute('type', 'text');
    velDirBox.setAttribute('id', `plan${i}velDir`);
    velDirBox.setAttribute('name', `plan${i}velDir`);
    velDirBox.setAttribute('value', plan.velDir);
    velDirBox.setAttribute('onchange', `htmlInputsChanged(${i}, 'velDir')`);
    planDiv.appendChild(velDirBox);

    // insert a break
    planDiv.appendChild(document.createElement('br'));

    // does camera depend on this planet
    let camDepLabel = document.createElement('label');
    camDepLabel.innerHTML = 'Camera depends on this planet: ';
    planDiv.appendChild(camDepLabel);
    let camDepBox = document.createElement('input');
    camDepBox.className = 'chkBox';
    camDepBox.setAttribute('type', 'checkbox');
    camDepBox.setAttribute('id', `plan${i}cam`);
    camDepBox.setAttribute('name', `plan${i}cam`);
    camDepBox.setAttribute('onchange', `htmlInputsChanged(${i}, 'cam')`);
    if (camPlan.includes(i)) {
      camDepBox.checked = true;
    }

    planDiv.appendChild(camDepBox);

    // insert the planDiv
    planetsDiv.insertAdjacentElement('beforeend', planDiv);
  });
}

// runs when one of the boxes in the html has changed
function htmlInputsChanged(planNum, varName) {
  if (varName == 'cam') {
    // runs if the change was for the camera

    // gets the changed value
    newVal = document.getElementById(`plan${planNum}${varName}`).checked;

    if (newVal) {
      // runs if this planet should be added to camPlan

      // adds the planet to camPlan
      camPlan.push(planNum);

      // removes duplicate cam planets from copyCamPlan and sorts it
      // there shouldn't be duplicates but just in case
      camPlan = camPlan.sort().filter(function (item, pos, ary) {
        return !pos || item != ary[pos - 1];
      });
    } else {
      // runs if this planet should be removed from camPlan

      // the index of the planet to be removed
      let planIndex = camPlan.findIndex(plan => planNum == plan);

      // removes the planet from camPlan
      camPlan.splice(planIndex, 1);
    }
  } else if (varName == 'r' || varName == 'mass') {
    // runs if the change was for radius or mass

    // gets the changed value
    newVal = document.getElementById(`plan${planNum}${varName}`).value;

    // converts the value to a number; returns NaN if not a number
    newVal = Number(newVal);

    // sets the planet's radius or mass to the input value
    planets[planNum][varName] = newVal;

    // recalculates the planet's radius or mass depending on which was changed
    // also updates the radius or mass input box in the html
    if (varName == 'r') {
      planets[planNum].mass = (4 / 3) * Math.PI * (newVal ** 3);
      let massBox = document.getElementById(`plan${planNum}mass`);
      massBox.value = planets[planNum].mass;
    } else {
      planets[planNum].r = Math.cbrt((3 * newVal) / (4 * Math.PI));
      let rBox = document.getElementById(`plan${planNum}r`);
      rBox.value = planets[planNum].r;
    }
  } else {
    // runs if the change wasn't for camera, radius, or mass

    // gets the changed value
    newVal = document.getElementById(`plan${planNum}${varName}`).value;

    // converts the value to a number; returns NaN if not a number
    newVal = Number(newVal);

    // sets the planet's value to the input value
    planets[planNum][varName] = newVal;
  }
}

// runs if the button to add a new planet was pressed
function addNewPlan() {
  planets.push(new Planet(10, 0, 0, 0, 0, colorArray[0]));
  createPlanHTML();
}

// runs if button to remove a planet is pressed
function removePlan(planNum) {
  // -----removes the planet from camPlan-----
  // the index of the planet to be removed
  let planIndex = camPlan.findIndex(plan => planNum == plan);

  // runs if planNum was in camPlan
  if (planIndex != -1) {
    // removes the planet from camPlan
    camPlan.splice(planIndex, 1);

    // decreases every plan after this in camPlan by 1
    camPlan.forEach(function (plan, i) {
      // runs if this plan was after the removed plan in camPlan
      if (i >= planNum) {
        camPlan[i] -= 1;
      }
    });
  }

  // -----removes the planet from planets-----
  // the index of the planet to be removed
  planIndex = planets.findIndex(planObj => planets[planNum] == planObj);

  // removes the planet from planets
  planets.splice(planIndex, 1);

  // -----updates the html-----
  createPlanHTML();
}

// draws a border around the canvas
function drawBorder() {
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(innerWidth, 0);
  c.lineTo(innerWidth, innerHeight);
  c.lineTo(0, innerHeight);
  c.lineTo(0, 0);
  c.lineWidth = 10;
  c.strokeStyle = '#222222';
  c.stroke();
}

// draws the planet data box
function drawPlanetDataBox() {
  // the top and bot of the current section; y-value
  let topOfSec;
  let botOfSec;

  // the height of the vis info sec
  let visInfoHei = 39;

  // the height of each planet section
  let secHei = 85;

  // the height of the plan info section
  let planInfoHei = secHei * planets.length + 5;

  // updates sBox.hei; the constant accounts for margins
  sBox.hei = 59 + visInfoHei + planInfoHei;

  // -----MAIN BOX-----
  // draws the main box
  c.fillStyle = '#333333';
  c.fillRect(sBox.lef, sBox.top, sBox.wid, sBox.hei);

  // the top button/title
  c.fillStyle = '#999999';
  c.fillRect(sBox.lef + 7, sBox.top + 7, sBox.wid - 14, 30);

  // the button/title text
  c.fillStyle = '#111111';
  if (!startSim) {
    c.font = 'bold 28px serif';
    c.fillText('Start Sim', sBox.lef + 17, sBox.top + 32);
  } else {
    c.font = '28px serif';
    c.fillText('Info Box', sBox.lef + 23, sBox.top + 32);
  }

  // adjusts botOfSec and topOfSec
  botOfSec = sBox.top + 37;
  topOfSec = botOfSec + 10;
  botOfSec = topOfSec;

  // -----VISUALS INFO BOX-----
  // draws the box that has visuals info
  c.fillStyle = '#777777';
  c.fillRect(sBox.lef + 5, topOfSec, sBox.wid - 10, visInfoHei);

  // the fillStyle for text
  c.fillStyle = '#111111';

  // label of section
  c.font = 'bolder 12px serif';
  c.fillText('Visual Info:', sBox.lef + 9, topOfSec + 13);

  // info in the sec
  c.font = '11px serif';
  let camPlanText = `CamPlan: [${camPlan}]`;
  c.fillText(camPlanText, sBox.lef + 14, topOfSec + 23);
  let zoomText = `Zoom: ${zoom.toFixed(5)}`;
  c.fillText(zoomText, sBox.lef + 14, topOfSec + 34);

  // adjusts botOfSec and topOfSec
  botOfSec = topOfSec + visInfoHei;
  topOfSec = botOfSec + 7;
  botOfSec = topOfSec;

  // -----PLAN INFO BOX-----
  // draws the box that has planet info
  c.fillStyle = '#777777';
  c.fillRect(sBox.lef + 5, topOfSec, sBox.wid - 10, planInfoHei);

  // gives info on the planets
  for (let i = 0; i < planets.length; i++) {
    // color boundaries
    c.fillStyle = planets[i].color;
    c.fillRect(sBox.lef + 5, topOfSec + secHei * i, 3, secHei + 5);

    // sets text color back to normal
    c.fillStyle = '#111111';

    // planet numbers
    c.font = 'bolder 12px serif';
    c.fillText('Planet ' + i + ':', sBox.lef + 10, topOfSec + 13 + secHei * i);

    // sets text back to normal
    c.font = '11px serif';

    // planet radii
    let planR = planets[i].r.toFixed(5);
    let radText = 'Radius: ' + planR;
    c.fillText(radText, sBox.lef + 15, topOfSec + 23 + secHei * i);

    // planet mass
    let planMass = parseInt(planets[i].mass).toLocaleString('en-US');
    let massText = 'Mass: ' + planMass;
    c.fillText(massText, sBox.lef + 15, topOfSec + 33 + secHei * i);

    // planet positions
    let planX = parseInt(planets[i].x);
    let planY = parseInt(planets[i].y);
    let posText = 'Pos: (' + planX + ', ' + planY + ')';
    c.fillText(posText, sBox.lef + 15, topOfSec + 43 + secHei * i);

    // planet velocities
    let planVel = planets[i].vel.toFixed(5);
    let planVelDir = parseInt(planets[i].velDir);
    let velText = 'Vel: ' + planVel;
    let velDirText = 'VelDir: ' + planVelDir;
    c.fillText(velText, sBox.lef + 15, topOfSec + 53 + secHei * i);
    c.fillText(velDirText, sBox.lef + 15, topOfSec + 63 + secHei * i);

    // planet accelerations
    let planAcc = planets[i].acc.toFixed(5);
    let planAccDir = parseInt(planets[i].accDir);
    let accText = 'Acc: ' + planAcc;
    let accDirText = 'AccDir: ' + planAccDir;
    c.fillText(accText, sBox.lef + 15, topOfSec + 73 + secHei * i);
    c.fillText(accDirText, sBox.lef + 15, topOfSec + 83 + secHei * i);
  }
}

// updates the zoom
function updateZoom() {
  // -----finds the farthest points in every direction-----
  // the center of all the planets; [x, y]
  var centPos = calcCentCamPlan();

  // stores the farthest points in every direction
  // starts at the center of all the planets
  var farLef = centPos[0];
  var farRig = centPos[0];
  var farTop = centPos[1];
  var farBot = centPos[1];

  // finds the farthest points in every direction of all cam planets
  for (let planNum of camPlan) {
    // data on the current cam planet
    let planX = planets[planNum].x;
    let planY = planets[planNum].y;
    let planR = planets[planNum].r;

    farLef = Math.min(farLef, planX - planR);
    farRig = Math.max(farRig, planX + planR);
    farTop = Math.min(farTop, planY - planR);
    farBot = Math.max(farBot, planY + planR);
  }

  // -----recalculates the zoom-----
  let sideBorder = 1.2;
  let xZoom = (canvas.width / sideBorder) / (farRig - farLef);
  let yZoom = (canvas.height / sideBorder) / (farBot - farTop);

  zoom = Math.min(maxZoom, xZoom, yZoom);
}

// updates the zoom
function updateZoom() {
  // the farthest points in every direction
  var farLef;
  var farRig;
  var farTop;
  var farBot;

  // -----finds largest radius-----
  // largest radius of the cam planets
  var largRad = 0;

  // finds the largest radius of the cam planets
  for (let planNum of camPlan) {
    largRad = Math.max(largRad, planets[planNum].r);
  }

  // -----finds center of camera-----
  let centPos = calcCentCamPlan();
  let centX = centPos[0];
  let centY = centPos[1];

  // -----finds the farthest points in every direction-----
  // recalculates the farthest points in every direction
  farLef = centX - largRad - (canvas.width / 2);
  farRig = centX + largRad + (canvas.width / 2);
  farTop = centY - largRad - (canvas.height / 2);
  farBot = centY + largRad + (canvas.height / 2);

  // finds the farthest points in every direction of all cam planets
  for (let planNum of camPlan) {
    farLef = Math.min(farLef, planets[planNum].x);
    farRig = Math.max(farRig, planets[planNum].x);
    farTop = Math.min(farTop, planets[planNum].y);
    farBot = Math.max(farBot, planets[planNum].y);
  }

  // -----recalculates the zoom-----
  // the zooms needed in each direction to fit the farthest points plus some
  let xZoom = (canvas.width / 1.25) / (farRig - farLef);
  let yZoom = (canvas.height / 1.25) / (farBot - farTop);

  zoom = Math.min(maxZoom, xZoom, yZoom);
}

// updates the accelerations
function updateAccs() {
  // makes sure each planet is clean
  for (let planet = 0; planet < planets.length; planet++) {
    planets[planet].acc = 0;
    planets[planet].accDir = 0;
  }

  // runs for each planet; calculates all the forces
  for (let mainPlan = 0; mainPlan < planets.length; mainPlan++) {
    // data of mainPlan (main planet)
    let x1 = planets[mainPlan].x;
    let y1 = planets[mainPlan].y;
    let mass1 = planets[mainPlan].mass;

    // calculates the forces mainPlan has with the planets after it in the array
    for (let iterPlan = mainPlan + 1; iterPlan < planets.length; iterPlan++) {
      // data of iterPlan (the planet that is being calculated with)
      let x2 = planets[iterPlan].x;
      let y2 = planets[iterPlan].y;
      let mass2 = planets[iterPlan].mass;

      // the distance between mainPlan and iterPlan
      let dist = Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));

      // the force mainPlan has with iterPlan
      let force = (grav * mass1 * mass2) / (dist ** 2);

      // the direction of mainPlan to iterPlan and backwards
      let dirs = calcDirs(x1, y1, x2, y2);

      // old data of the planets
      let mainPlanOldAcc = planets[mainPlan].acc;
      let iterPlanOldAcc = planets[iterPlan].acc;
      let mainPlanOldAccDir = planets[mainPlan].accDir;
      let iterPlanOldAccDir = planets[iterPlan].accDir;

      // new net forces of the planets
      let mainNetForce = addVec(mainPlanOldAcc * mass1, mainPlanOldAccDir, force, dirs[0]);
      let iterNetForce = addVec(iterPlanOldAcc * mass2, iterPlanOldAccDir, force, dirs[1]);

      // change the accelerations of the planets
      planets[mainPlan].acc = mainNetForce[0] / mass1;
      planets[iterPlan].acc = iterNetForce[0] / mass2;
      planets[mainPlan].accDir = mainNetForce[1];
      planets[iterPlan].accDir = iterNetForce[1];
    }
  }
}

// detects collisions
function detectColl() {
  // runs for each planet
  for (let mainPlan = 0; mainPlan < planets.length; mainPlan++) {
    // get mainPlan data
    let x1 = planets[mainPlan].x;
    let y1 = planets[mainPlan].y;
    let r1 = planets[mainPlan].r;

    // compares mainPlan to each planet after it in the array
    for (let iterPlan = mainPlan + 1; iterPlan < planets.length; iterPlan++) {
      // get iterPlan data
      let x2 = planets[iterPlan].x;
      let y2 = planets[iterPlan].y;
      let r2 = planets[iterPlan].r;

      // the distance bewteen the 2 planets
      let dist = calcDist(x1, y1, x2, y2);

      // the closest the 2 planets can be
      minDist = r1 + r2;

      // runs if the 2 planets are colliding; creates new child planet
      if (dist < minDist) {
        console.log(`Coll: ${mainPlan} (r:${r1}) and ${iterPlan} (r:${r2})`);

        // creates new child planet
        plansCollide(mainPlan, iterPlan);
        break;
      }
    }
  }
}

// make two planets collide; creates child planet
function plansCollide(index1, index2) {
  // -----creates the child planet-----
  // data of the colliding planets
  let color1 = planets[index1].color;
  let color2 = planets[index2].color;
  let mass1 = planets[index1].mass;
  let mass2 = planets[index2].mass;
  let x1 = planets[index1].x;
  let x2 = planets[index2].x;
  let y1 = planets[index1].y;
  let y2 = planets[index2].y;
  let vel1 = planets[index1].vel;
  let vel2 = planets[index2].vel;
  let velDir1 = planets[index1].velDir;
  let velDir2 = planets[index2].velDir;

  // average of the 2 planets colors
  let cColor = calcAvgColor(color1, color2, mass1, mass2);

  // sum of the 2 planets masses
  let cMass = mass1 + mass2;

  // radius of sphere when given volume (or mass with density of 1)
  let cRadius = ((3 * cMass) / (4 * Math.PI)) ** (1 / 3);

  // calculates the child's x and y
  let cX = calcAvgWithWei(x1, x2, mass1, mass2);
  let cY = calcAvgWithWei(y1, y2, mass1, mass2);

  // calculates the child's vel and velDir
  // the new vel vector with the input velocities weighted by mass
  let newWeiVelVec = addVec(vel1 * mass1, velDir1, vel2 * mass2, velDir2);
  let cVel = newWeiVelVec[0] / (mass1 + mass2);
  let cVelDir = newWeiVelVec[1];

  // delete colliding planets from the planets array
  // makes sure to delete the higher index planet first
  planets.splice(Math.max(index1, index2), 1);
  planets.splice(Math.min(index1, index2), 1);

  // add the child planet to the planets array
  planets.push(new Planet(cRadius, cX, cY, cVel, cVelDir, cColor));

  // -----fixes camPlan-----
  // copy of camPlan
  let copyCamPlan = camPlan;

  // the index of the child planet
  let childPlanIndex = planets.length - 1;

  // whether or not a cam planet was in the collision
  let camPlanetWasInColl = false;

  // detects if either of the colliding planets were in camPlan
  if (copyCamPlan.indexOf(index1) != -1 || copyCamPlan.indexOf(index2) != -1) {
    camPlanetWasInColl = true;
  }

  // runs if a cam planet was in the collision
  if (camPlanetWasInColl) {
    // runs for each cam planet
    camPlan.forEach(function (plan, i) {
      // runs if this specific cam planet was in the collision
      if (plan == index1 || plan == index2) {
        // removes the collided cam planet from copyCamPlan and replaces it with placeholder of -1
        copyCamPlan.splice(copyCamPlan.indexOf(plan), 1, -1);
      }
    });

    // the amount to decrease each cam planet by in the copyCamPlan array
    let decPlanBy = 0;

    // replaces all the -1 placeholders in copyCamPlan with the child planet's index
    // runs for each plan in copyCamPlan
    copyCamPlan.forEach(function (plan, i) {
      if (plan == -1) {
        // sets the -1 placeholder to the child planet's index
        copyCamPlan[i] = childPlanIndex;
      } else {
        // resets decPlanBy
        decPlanBy = 0;

        // calculates decPlanBy for this index
        if (index1 < plan) {
          decPlanBy += 1;
        }

        if (index2 < plan) {
          decPlanBy += 1;
        }

        copyCamPlan[i] -= decPlanBy;
      }
    });
  }

  // runs if none of the cam planets were in the collision
  if (!camPlanetWasInColl) {
    // runs for each cam planet
    camPlan.forEach(function (plan, i) {
      // the amount to decrease plan by
      let decBy = 0;

      // decreases the cam planet by 1 if coll planet 1 is before it
      if (index1 < plan) {
        decBy += 1;
      }

      // decreases the cam planet by 1 if coll planet 2 is before it
      if (index2 < plan) {
        decBy += 1;
      }

      // decreases cam planet
      copyCamPlan[i] = plan - decBy;
    });
  }

  // removes duplicate cam planets from copyCamPlan and sorts it
  copyCamPlan = copyCamPlan.sort().filter(function (item, pos, ary) {
    return !pos || item != ary[pos - 1];
  });

  // sets camPlan to the copy array
  camPlan = copyCamPlan;

  // logs the collision
  console.log(`New camPlan: [${camPlan}]`);

  // updates the html
  createPlanHTML();
}

// ----------TOOL FUNCTIONS----------

// given 2 points, calculates their relative dirs; bascially points -> slope -> angle
function calcDirs(x1, y1, x2, y2) {
  let rise = y2 - y1;
  let run = x2 - x1;

  let dir;

  // runs if the points are vertically in a line
  if (run == 0) {
    // if the first point is 'above' the second (actually below since y is reversed)
    if (y1 > y2) {
      dir = 270;
    } else {
      dir = 90;
    }
  } else {
    // runs if the points aren't vertically in a line

    // the slope between the points
    let slope = rise / run;

    // the angle from 1 to 2
    dir = (180 * Math.atan(slope)) / Math.PI;

    // fixes dir
    // if 2 is left of 1...
    if (x2 < x1) {
      dir += 180;
    } else if (x2 >= x1 && y2 < x1) {
      dir += 360;
    }
  }

  // the angle going the other direction
  let dirBack = dir + 180;

  // makes sure dirBack isn't over 360
  if (dirBack >= 360) {
    dirBack += -360;
  }

  return [dir, dirBack];
}

// adds 2 force vectors //TODO: make this scalable for many vectors
function addVec(force1, dir1, force2, dir2) {
  // the end of the net force vector
  let netEnd = [0, 0];

  // add first force
  netEnd[0] += force1 * Math.cos(dir1 * (Math.PI / 180));
  netEnd[1] += force1 * Math.sin(dir1 * (Math.PI / 180));

  // add second force
  netEnd[0] += force2 * Math.cos(dir2 * (Math.PI / 180));
  netEnd[1] += force2 * Math.sin(dir2 * (Math.PI / 180));

  // net force is the dist to the end point
  netForce = Math.sqrt(((netEnd[0]) ** 2) + ((netEnd[1]) ** 2));

  // gets direction of the net force
  dir = calcDirs(0, 0, netEnd[0], netEnd[1])[0];

  return [netForce, dir];
}

// calculate the distance between 2 points
function calcDist(x1, y1, x2, y2) {
  let xDif = (x2 - x1) ** 2;
  let yDif = (y2 - y1) ** 2;
  return Math.sqrt(xDif + yDif);
}

// calculates the average of two hex colors
function calcAvgColor(color1, color2, col1Weight = 1, col2Weight = 1) {
  // base RGB values for the colors
  let r1 = parseInt(color1.slice(1, 3), 16) ** 2;
  let g1 = parseInt(color1.slice(3, 5), 16) ** 2;
  let b1 = parseInt(color1.slice(5, 7), 16) ** 2;
  let r2 = parseInt(color2.slice(1, 3), 16) ** 2;
  let g2 = parseInt(color2.slice(3, 5), 16) ** 2;
  let b2 = parseInt(color2.slice(5, 7), 16) ** 2;

  // weighted RGB values for the colors
  wr1 = r1 * col1Weight;
  wg1 = g1 * col1Weight;
  wb1 = b1 * col1Weight;
  wr2 = r2 * col2Weight;
  wg2 = g2 * col2Weight;
  wb2 = b2 * col2Weight;

  // weighted averages for the colors
  let avgR = parseInt(Math.sqrt((wr1 + wr2) / (col1Weight + col2Weight)));

  //let avgR = parseInt(Math.sqrt((r1 + r2) / 2));
  let avgG = parseInt(Math.sqrt((wg1 + wg2) / (col1Weight + col2Weight)));
  let avgB = parseInt(Math.sqrt((wb1 + wb2) / (col1Weight + col2Weight)));

  // the hex values for RGB
  let hexR = avgR.toString(16);
  let hexG = avgG.toString(16);
  let hexB = avgB.toString(16);

  // array to hold the hex values
  let hexArray = [hexR, hexG, hexB];

  // makes sure the hex values are 2 digits
  hexArray.forEach(function (hex, i) {
    if (hex.length == 1) {
      // puts a 0 at the front of the hex
      hexArray[i] = '0' + hex;
    }
  });

  let newHexColor = `#${hexArray[0]}${hexArray[1]}${hexArray[2]}`;

  return newHexColor;
}

// averages two numbers with weights
function calcAvgWithWei(n1, n2, w1, w2) {
  // the weighted numbers
  let wn1 = n1 * w1;
  let wn2 = n2 * w2;

  // returns the weighted average
  return (wn1 + wn2) / (w1 + w2);
}

// calculates the center of all the cam planets
function calcCentCamPlan() {
  // finds the largest radius in camPlan
  let largRad = 0;
  for (let planNum of camPlan) {
    largRad = Math.max(largRad, planets[planNum].r);
  }

  // stores the farthest points in every direction
  // starts at the pos of first cam plan
  var farLef = planets[camPlan[0]].x;
  var farRig = planets[camPlan[0]].x;
  var farTop = planets[camPlan[0]].y;
  var farBot = planets[camPlan[0]].y;

  // runs for each cam planet; calculates farthest points
  for (let planNum of camPlan) {
    // data of the current cam planet
    // uses largRad for radius to reduce some screen shake
    let planX = planets[planNum].x;
    let planY = planets[planNum].y;

    farLef = Math.min(farLef, planX - largRad);
    farRig = Math.max(farRig, planX + largRad);
    farTop = Math.min(farTop, planY - largRad);
    farBot = Math.max(farBot, planY + largRad);
  }

  // the center of the planets
  let centX = (farLef + farRig) / 2;
  let centY = (farTop + farBot) / 2;

  return [centX, centY];
}

// ----------THE REST----------

init();
