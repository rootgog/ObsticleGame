const canvas = document.getElementById("game");

const ctx = canvas.getContext('2d');

let gameloop = requestAnimationFrame(draw);

let lastframe = Date.now();
let deltatime;

const floory = canvas.height - 60;

document.addEventListener('keydown', keydown);

function keydown(e) {
    if (e.code === "Space") {
        if (p.alive) {
            if (p.y === floory - p.height) {
                p.jumping = true;
                p.velocity.y = 1;
            }
        } else {
            score = 0;
            p.alive = true;
            obsticles = [];
            p.y = floory - p.height;
            p.velocity.y = 0;
            draw();
            spawner();
        }
    }
}

//player
let p = {
    width: 30,
    height: 70,
    x: 40,
    y: floory - 70,
    jumping: false,
    velocity: {
        y: 0
    },
    alive: true
}

let score = 0;
let highScore = 0;
let jumpHeight = p.height + 60;
let jumpSpeed = 250;



let obsticles = [];

function Obsticle() {
    this.width = 30;
    this.height = 30;
    this.x = canvas.width;
    this.y = floory - this.height;
    this.passed = false;
}

let speed = 400;

let spawnerTimeout;

function spawner() {
    obsticles.push(new Obsticle());
    let interval = Math.random() * 5000;
    interval = interval > 2000 ? interval : 2000;
    spawnerTimeout = setTimeout(spawner, interval);
}
spawner();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //deltatime calcs
    deltatime = (Date.now() - lastframe) / 1000;
    lastframe = Date.now();

    //draw floor
    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.moveTo(0, floory);
    ctx.lineTo(canvas.width, floory);
    ctx.stroke();

    //draw player
    ctx.beginPath();
    ctx.rect(p.x, p.y, p.width, p.height);
    ctx.fill();

    //draw obsticles
    for (let i = obsticles.length - 1; i >= 0; --i) {
        let ob = obsticles[i];

        //move
        ob.x -= speed * deltatime;

        //draw
        ctx.beginPath();
        ctx.rect(ob.x, ob.y, ob.width, ob.height);
        ctx.fill();

        //collision?
        let pleft = p.x;
        let pright = p.x + p.width;
        let pbottom = p.y + p.height;

        let obleft = ob.x;
        let obright = ob.x + ob.width;
        let obtop = ob.y;

        if (pright > obleft &&
            pleft < obright &&
            pbottom > obtop) {
            p.alive = false;
        } else {
            //past player?
            if (ob.x + ob.width < p.x && !ob.passed) {
                score++;
                ob.passed = true;
                if (score >= highScore) {
                    highScore = score;
                }
            }
        }
        //remove?
        if (ob.x + ob.width <= 0) {
            obsticles.splice(i, 1);
        }
    }

    //handle jumping
    if (p.jumping) {
        //distance to floor
        let d2f = (floory - p.y - p.height) < 0 ? 0 : floory - p.y - p.height;
        //distance to peak
        let d2p = (jumpHeight - d2f) / jumpHeight;
        d2f = d2f / jumpHeight;
        if ((p.y === floory - p.height) || (p.velocity.y > 0 && p.y > floory - jumpHeight)) {
            //starting or still rising
            if (d2p < 0.3) {
                p.velocity.y = 0.1;
            }
            if (d2p < 0.5) {
                p.velocity.y = 0.6
            }
            p.y -= (jumpSpeed * deltatime) * p.velocity.y;
        } else if (p.velocity.y > 0 && p.y <= floory - jumpHeight) {
            //player reached top of jumps
            p.velocity.y = -0.1;
        } else if (p.velocity.y < 0 && p.y < floory - p.height) {
            //player is falling
            if (d2f < 0.6) {
                p.velocity.y = -1;
            } else if (d2f < 0.3) {
                p.velocity.y = -0.15;
            }
            p.y -= (jumpSpeed * deltatime) * p.velocity.y;
        } else {
            p.jumping = false;
            p.velocity.y = 0;
            p.y = floory - p.height;
        }
    }

    //display score
    ctx.textAlign = "center";
    ctx.font = "32px Arial";
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 50);
    ctx.textAlign = "left";
    ctx.font = "16px Arial";
    ctx.fillText(`High Score: ${highScore}`, 5, 20);

    if (p.alive) {
        requestAnimationFrame(draw);
    } else {
        clearTimeout(spawnerTimeout);
        ctx.textAlign = "center";
        ctx.font = "52px Arial";
        ctx.fillText(`You Died!`, canvas.width / 2, canvas.height / 2);
        ctx.font = "24px Arial";
        ctx.fillText(`Press Spacebar to restart`, canvas.width / 2, canvas.height / 2 + 40);
    }
}