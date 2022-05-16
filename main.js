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
  '#2E86AB',
  '#A23B72',
  '#F18F01',
  '#C73E1D',
  '#3B1F2B',
];

// array for the setIntervals
var intervals = [];

// array for planets
var planets = [];

// gravitational constant
const grav = 0.01;

// the planet the camera focuses on; -1 = don't follow anything
const camPlan = 2;

// zoom factor
var zoom = 1;

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

// ----------FUNCTIONS----------

function init() {
  for (let interval of intervals) {
    window.clearInterval(interval);
  }

  // reset some variables
  planets = [];
  intervals = [];
  startSim = false;

  // Planet(r, x, y, vel, dir, color)
  planets.push(new Planet(20, 550, 200, 7, 140, colorArray[0]));
  planets.push(new Planet(10, 1000, 100, 4, 70, colorArray[1]));
  planets.push(new Planet(60, 550, 450, 0, 0, colorArray[2]));

  // draws the planets' every set interval
  intervals.push(window.setInterval(function () {updateScreen();}, 1000 / fps));
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
    // runs if camPlan is an array of planets to situate the camera between
    if (Array.isArray(camPlan)) {
      // the totals of the x and y values of the planets the camera depends on
      let totX = 0;
      let totY = 0;

      // finds the total position values
      for (let planNum of camPlan) {
        totX += planets[planNum].x;
        totY += planets[planNum].y;
      }

      // the center of the planets
      let centX = totX / camPlan.length;
      let centY = totY / camPlan.length;

      // changes the visual coords to the center of the planets in question
      this.visX = (this.x * zoom) + (canvas.width / 2) - (centX * zoom);
      this.visY = (this.y * zoom) + (canvas.height / 2) - (centY * zoom);

    } else {
      if (camPlan == -1) {
        // doesn't follow any planet
        this.visX = this.x * zoom;
        this.visY = this.y * zoom;
      } else {
        // follows the planet at index camPlan
        this.visX = (this.x * zoom) + (canvas.width / 2) - (planets[camPlan].x * zoom);
        this.visY = (this.y * zoom) + (canvas.height / 2) - (planets[camPlan].y * zoom);
      }
    }

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

    // draws the velocity vector
    c.beginPath();
    c.moveTo(this.visX, this.visY);
    c.lineTo(this.visX + dxVel, this.visY + dyVel);
    c.strokeStyle = '#068501';
    c.stroke();

    // draws the acceleration vector
    c.beginPath();
    c.moveTo(this.visX, this.visY);
    c.lineTo(this.visX + dxAcc, this.visY + dyAcc);
    c.strokeStyle = '#a61d08';
    c.stroke();
  };

  // draws the planet
  this.draw = function () {
    c.beginPath();
    c.arc(this.visX, this.visY, this.visR, 0, Math.PI * 2);

    // fills the circle with a random color from palette
    c.fillStyle = this.color;
    c.fill();
  };
}

// updates the planets data
function simulatePlanets() {
  // update all planets accelerations
  updateAccs();

  // update all planets velocities
  for (let planet of planets) {planet.updateVel();}

  // update all planets positions
  for (let planet of planets) {planet.updatePos();}
}

// updates the screen
function updateScreen() {
  // clears the canvas
  c.clearRect(0, 0, innerWidth, innerHeight);

  // updates all planets visual positions
  for (let planet of planets) {planet.updateVisPos();}

  // draws all planets vectors
  for (let planet of planets) {planet.drawVectors();}

  // draw all planets
  for (let planet of planets) {planet.draw();}

  drawPlanetDataBox();
}

// draws the planet data box
function drawPlanetDataBox() {
  // the height of each planet section
  let secHei = 75;

  // the height of the plan info section
  var planInfoHei = secHei * planets.length + 5;

  // updates sBox.hei
  sBox.hei = (planets.length * secHei) + 60;

  // draws the main box
  c.fillStyle = '#333333';
  c.fillRect(sBox.lef, sBox.top, sBox.wid, sBox.hei);

  // the top button
  c.fillStyle = '#999999';
  c.fillRect(sBox.lef + 7, sBox.top + 7, sBox.wid - 14, 30);

  // the button text
  c.fillStyle = '#111111';
  if (!startSim) {
    c.font = 'bold 28px serif';
    c.fillText('Start Sim', sBox.lef + 17, sBox.top + 32);
  } else {
    c.font = '28px serif';
    c.fillText('Info Box', sBox.lef + 23, sBox.top + 32);
  }

  // the box that has planet info
  c.fillStyle = '#777777';
  c.fillRect(sBox.lef + 5, sBox.top + 50, sBox.wid - 10, planInfoHei);

  // gives info on the planets
  for (let i = 0; i < planets.length; i++) {
    // color boundaries
    c.fillStyle = planets[i].color;
    c.fillRect(sBox.lef + 5, sBox.top + 50 + secHei * i, 3, secHei + 5);

    // sets text color back to normal
    c.fillStyle = '#111111';

    // planet numbers
    c.font = 'bolder 12px serif';
    c.fillText('Planet ' + i + ':', sBox.lef + 10, sBox.top + 65 + secHei * i);

    // sets text back to normal
    c.font = '11px serif';

    // planet radii
    let planR = planets[i].r;
    let radText = 'Radius: ' + planR;
    c.fillText(radText, sBox.lef + 15, sBox.top + 75 + secHei * i);

    // planet positions
    let planX = parseInt(planets[i].x);
    let planY = parseInt(planets[i].y);
    let posText = 'Pos: (' + planX + ', ' + planY + ')';
    c.fillText(posText, sBox.lef + 15, sBox.top + 85 + secHei * i);

    // planet velocities
    let planVel = planets[i].vel.toFixed(4);
    let planVelDir = parseInt(planets[i].velDir);
    let velText = 'Vel: ' + planVel;
    let velDirText = 'VelDir: ' + planVelDir;
    c.fillText(velText, sBox.lef + 15, sBox.top + 95 + secHei * i);
    c.fillText(velDirText, sBox.lef + 15, sBox.top + 105 + secHei * i);

    // planet accelerations
    let planAcc = planets[i].acc.toFixed(4);
    let planAccDir = parseInt(planets[i].accDir);
    let accText = 'Acc: ' + planAcc;
    let accDirText = 'AccDir: ' + planAccDir;
    c.fillText(accText, sBox.lef + 15, sBox.top + 115 + secHei * i);
    c.fillText(accDirText, sBox.lef + 15, sBox.top + 125 + secHei * i);
  }
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

// given 2 points, calculates their relative dirs; bascially points -> slope -> angle
function calcDirs(x1, y1, x2, y2) {
  let rise = y2 - y1;
  let run = x2 - x1;

  // the angle from 1 to 2
  let dir = (180 * Math.atan(rise / run)) / Math.PI;

  // if 2 is left of 1...
  if (x2 < x1) {
    dir += 180;
  } else if (x2 >= x1 && y2 < x1) {
    dir += 360;
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

// ----------THE REST----------

init();
