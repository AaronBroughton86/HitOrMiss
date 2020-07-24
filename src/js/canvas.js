import utils from './utils'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
    x: 10, // sets mous intiatil horizontal postion
    y: 10 // sets mous intiatil vertical postion
}

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66']

// Event Listeners
addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
})

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init();
});

// Utility Functions
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}

// Gets distance between wo points.
function getDistance(x1, y1, x2, y2) {
    const xDist = x2 - x1;  // horizontal distance between two points
    const yDist = y2 - y1;  // vertical distance between two points

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));  // Pythagreon Theroum, gets the hypotenuse
}

// Creating our ball as an object, in order to create mulitple balls with x and y cordinates
function Circle(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.update = function () {

        this.draw();
    }

    this.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  // drawing out the circle
        c.fillStyle = this.color;
        c.fill(); // filling that circle in
        c.closePath();
    }
}

// Creating our ball as an object, in order to create mulitple balls with x and y cordinates
function Square(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.update = function () {

        this.draw();
    }

    this.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  // drawing out the circle
        c.fillStyle = this.color;
        c.fill(); // filling that circle in
        c.closePath();
    }
}

// Implementation
let circle1;
let circle2;
let square1;

function init() {
    circle1 = new Circle(300, 300, 100, 'black');
    circle2 = new Circle(10, 10, 30, 'red');
    square1 = new Circle(10, 10, 30, 'red');
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate)
  c.clearRect(0, 0, canvas.width, canvas.height) // clears the screen everytime you draw, comment out and see what happens :)
  
    circle1.update();
    circle2.x = mouse.x;
    circle2.y = mouse.y;
    circle2.update();

    if (getDistance(circle1.x, circle1.y, circle2.x, circle2.y) < circle1.radius + circle2.radius)
    {
        circle1.color = 'red';
    }
    else {
        circle1.color = 'green';
    }

    //console.log(getDistance(circle1.x, circle1.y, circle2.x, circle2.y));

}

init();
animate();
