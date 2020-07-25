let resetGame = document.querySelector('.reload');
resetGame.addEventListener('click', () => document.location.reload(true));

function newElement(tagName, className) {
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier');

    const border = newElement('div', 'border');
    const pipe = newElement('div', 'pipe');
    this.element.appendChild(reverse ? pipe : border);
    this.element.appendChild(reverse ? border : pipe);

    this.setPipeHeight = pipeHeight => pipe.style.height = `${pipeHeight}px`;
}

function BarrierPair(barrierHeight, barrierOpening, x) {
    this.element = newElement('div', 'barrier-pair');

    this.upperBarrier = new Barrier(true);
    this.lowerBarrier = new Barrier(false);

    this.element.appendChild(this.upperBarrier.element);
    this.element.appendChild(this.lowerBarrier.element);

    this.drawOpening = () => {
        const topHeight = Math.random() * (barrierHeight - barrierOpening);
        const lowerHeight = barrierHeight - barrierOpening - topHeight;

        this.upperBarrier.setPipeHeight(topHeight);
        this.lowerBarrier.setPipeHeight(lowerHeight);
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0]);
    this.setX = x => this.element.style.left = `${x}px`;
    this.getWidth = () => this.element.clientWidth;

    this.drawOpening();
    this.setX(x);
}

function Barriers(barriersHeight, playWidth, barriersOpening, space, pointNotification) {
    this.pairs = [
        new BarrierPair(barriersHeight, barriersOpening, playWidth),
        new BarrierPair(barriersHeight, barriersOpening, playWidth + space),
        new BarrierPair(barriersHeight, barriersOpening, playWidth + space * 2),
        new BarrierPair(barriersHeight, barriersOpening, playWidth + space * 3)
    ]

    const displacement = 3;
    this.animation = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement);

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length);
                pair.drawOpening();
            }

            const middle = playWidth / 2;
            const crossedTheMiddle = pair.getX() + displacement >= middle &&
                pair.getX() < middle;

            if (crossedTheMiddle) pointNotification();
        });
    }
}

function Bird(gameHeight) {
    let flying = false;

    this.element = newElement('img', 'bird');
    this.element.src = '../../assets/bird.png';

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setY = y => this.element.style.bottom = `${y}px`;

    window.onkeydown = e => flying = true;
    window.onkeyup = e => flying = false;

    this.animation = () => {
        const newY = this.getY() + (flying ? 7 : -4);
        const maxHeight = gameHeight - this.element.clientHeight;

        if (newY <= 0) {
            this.setY(0);
        } else if (newY >= maxHeight) {
            this.setY(maxHeight);
        } else {
            this.setY(newY);
        }
    }

    this.setY(gameHeight / 2);
}

function sky() {
    let hour = new Date().getHours();

    if (hour > 18 || hour < 7) {
        document.querySelector('[wm-flappy]').style.backgroundColor = '#191970';
    } else {
        document.querySelector('[wm-flappy]').style.backgroundColor = '#00bfff';
    }
}

function Progress() {
    this.element = newElement('span', 'progress');
    this.updatePoints = points => {
        this.element.innerHTML = points;
    }
    this.updatePoints(0);
}

function overlap(elementA, elementB) {
    const a = elementA.getBoundingClientRect();
    const b = elementB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top;

    return horizontal && vertical;
}

function collided(bird, barriers) {
    let collided = false;

    barriers.pairs.forEach(barrierPair => {
        if (!collided) {
            const higher = barrierPair.upperBarrier.element;
            const bottom = barrierPair.lowerBarrier.element;

            collided = overlap(bird.element, higher)
                || overlap(bird.element, bottom);
        }
    });
    return collided;
}

function FlappyBird() {
    let points = 0;

    const gameArea = document.querySelector('[wm-flappy]');
    const gameHeight = gameArea.clientHeight;
    const gameWidth = gameArea.clientWidth;

    const progress = new Progress();
    const barriers = new Barriers(gameHeight, gameWidth, 200, 400,
        () => progress.updatePoints(++points));

    const bird = new Bird(gameHeight);
    let reload = document.querySelector('.icon');

    gameArea.appendChild(progress.element);
    gameArea.appendChild(bird.element);
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element));

    this.start = () => {
        const timer = setInterval(() => {
            barriers.animation();
            bird.animation();

            if (collided(bird, barriers)) {
                clearInterval(timer);
                reload.style.display = 'flex';
            }
        }, 20);
    }
}

sky();
new FlappyBird().start();