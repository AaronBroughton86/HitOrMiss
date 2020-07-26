import utils from './utils'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
    x: 10, // sets mous intiatil horizontal postion
    y: 10 // sets mous intiatil vertical postion
}

const colors = ['#42ddf5', '#f58d42', '#c842f5']

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

// Gets distance between two points. For Initial Circles
function getDistance(x1, y1, x2, y2) {
    const xDist = x2 - x1;  // horizontal distance between two points
    const yDist = y2 - y1;  // vertical distance between two points

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));  // Pythagreon Theroum, gets the hypotenuse
}

// Gets distance between two points. For Particles
function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;  // horizontal distance between two points
    const yDist = y2 - y1;  // vertical distance between two points

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));  // Pythagreon Theroum, gets the hypotenuse
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

// Creating particle as an object, in order to create mulitple balls that will later be used with collision detection
function Particle(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.velocity = {
        x: (Math.random() - 0.5) * 5,   // Make it so that our particles move randomly in an horizontal direction
        y: (Math.random() - 0.5) * 5   // Make it so that our particles move randomly in an vertical direction
    };
    this.radius = radius;
    this.color = color;
    this.mass = 1;
    this.opacity = 0;

    this.update = function () {

        this.draw();

        // Each time you run through this loop you'll be getting the distance between a this particle, and all surrounding particles specified like such particles[i].x, particles[i].y
        for (let i = 0; i < particles.length; i++) {
            // continue makes sure that we never compare a particle to itself.
            if (this === particles[i]) continue;
            if (distance(this.x, this.y, particles[i].x, particles[i].y) - this.radius * 2 < 0) {
                //console.log('has collided');
                resolveCollision(this, particles[i]);
            }
        }

        // Stops the particles form moving off the screen left and right
        if (this.x - this.radius <= 0 || this.x + this.radius >= innerWidth) {
            this.velocity.x = -this.velocity.x;  // bounce off the left and right side
        }

        // Stops the particles form moving off the screen top and bottom
        if (this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
            this.velocity.y = -this.velocity.y;  // bounce off the top and bottom
        }

        // mouse collision detection
        if (distance(mouse.x, mouse.y, this.x, this.y) < 80 && this.opacity < 0.2) {
            this.opacity += 0.02;
        } else if (this.opacity > 0) {
            this.opacity -= 0.02;
            this.opacity = Math.max(0, this.opacity);

        }


        this.x += this.velocity.x;  // Adds velocity to our x cordinate
        this.y += this.velocity.y;  // Adds velocity to our y cordinate
    };

    this.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  // drawing out the circle
        c.save(); // Saves the cavas at this specific point of time, then restores so that only the background has a lighter opacity
        c.globalAlpha = this.opacity; // Changes entire opacity of our canvas
        c.fillStyle = this.color;
        c.fill();
        c.restore();
        c.strokeStyle = this.color;
        c.stroke(); // filling that circle in
        c.closePath();
    }
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
let particles;
let circle1;
let circle2;
let square1;

function init() {
    // Store all of our Particles within an array
    particles = [];

    // Push particles into our array, in order to display them randomly on our screen
    for (let i = 0; i < 200; i++) {
        const radius = 15;
        let x = randomIntFromRange(radius, canvas.width - radius); // Randomly spawn particles on the screen. Ensures never overlapping with left and right hands of our screen... Takes a random cordinate, anywhere from 0 to the width of our screen
        let y = randomIntFromRange(radius, canvas.height - radius); // Randomly spawn particles on the screen. Ensures never overlapping with top and bottom hands of our screen...  Takes a random cordinate, anywhere from 0 to the height of our screen

        const color = randomColor(colors);
        
        // Start comparing distances between circles, if they are less than 0, regenerate them and place them elsewhere on the screen

        //Skip over the regeneration process for the first iteration
        if (i !== 0) {
            for (let j = 0; j < particles.length; j++) {
                if (distance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0) {
                    x = randomIntFromRange(radius, canvas.width - radius); 
                    y = randomIntFromRange(radius, canvas.height - radius); 

                    j = -1;
                }
            }
        }

        particles.push(new Particle(x, y, radius, color));
    }

    console.log(particles);

    circle1 = new Circle(300, 300, 100, 'black');
    circle2 = new Circle(10, 10, 30, 'red');
    square1 = new Circle(10, 10, 30, 'red');
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height) // clears the screen everytime you draw, comment out and see what happens :)

    // draws all particles on the screen
    particles.forEach(particle => {
        particle.update(particles);
    });

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

    console.log(getDistance(circle1.x, circle1.y, circle2.x, circle2.y));

}

init();
animate();
