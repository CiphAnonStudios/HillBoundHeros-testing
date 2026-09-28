/* =========================================================
   HILL BOUND
   CiphAnon Studios
   Improved Gameplay Version
========================================================= */

"use strict";

/* =========================================================
   DOM
========================================================= */

const $ = id => document.getElementById(id);
const $$ = selector => [...document.querySelectorAll(selector)];

const canvas = $("game");
const ctx = canvas.getContext("2d");

const previewCanvas = $("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");

/* =========================================================
   SAVE
========================================================= */

const SAVE_KEY = "hillbound_save_v2";

function defaultSave() {
    return {
        coins: 0,
        best: {},
        selectedVehicle: "buggy",
        selectedCharacter: "rex",
        selectedStage: "countryside",

        ownedVehicles: {
            buggy: true
        },

        ownedStages: {
            countryside: true
        },

        ownedCharacters: {
            rex: true,
            luna: true,
            bolt: true
        },

        upgrades: {},

        missions: {},

        settings: {
            sound: true,
            shake: true
        }
    };
}

function loadSave() {

    const base = defaultSave();

    try {

        const raw = localStorage.getItem(SAVE_KEY);

        if (!raw) return base;

        const old = JSON.parse(raw);

        const save = {
            ...base,
            ...old,

            ownedVehicles: {
                ...base.ownedVehicles,
                ...(old.ownedVehicles || {})
            },

            ownedStages: {
                ...base.ownedStages,
                ...(old.ownedStages || {})
            },

            ownedCharacters: {
                ...base.ownedCharacters,
                ...(old.ownedCharacters || {})
            },

            upgrades: {
                ...base.upgrades,
                ...(old.upgrades || {})
            },

            missions: {
                ...base.missions,
                ...(old.missions || {})
            },

            settings: {
                ...base.settings,
                ...(old.settings || {})
            }
        };

        return save;

    } catch {
        return base;
    }
}

let save = loadSave();

function persist() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

/* =========================================================
   VEHICLES
========================================================= */

const VEHICLES = {

    buggy: {
        name: "Trail Buggy",
        price: 0,
        color: "#f47b20",
        accent: "#242b33",
        power: 6,
        speed: 5,
        grip: 6,
        suspension: 6,
        weight: 1,
        description: "A balanced starter vehicle.",
        ability: "Balanced"
    },

    crusher: {
        name: "Mud Crusher",
        price: 500,
        color: "#3d9b55",
        accent: "#18241c",
        power: 8,
        speed: 4,
        grip: 8,
        suspension: 9,
        weight: 1.3,
        description: "Heavy, powerful and great over rough terrain.",
        ability: "Heavy Suspension"
    },

    roadster: {
        name: "Roadster X",
        price: 1200,
        color: "#e74e45",
        accent: "#27191a",
        power: 7,
        speed: 10,
        grip: 5,
        suspension: 4,
        weight: .85,
        description: "Fast but harder to control.",
        ability: "High Speed"
    },

    hopper: {
        name: "Dirt Hopper",
        price: 2500,
        color: "#7658d8",
        accent: "#211d36",
        power: 6,
        speed: 7,
        grip: 6,
        suspension: 8,
        weight: .8,
        description: "Built for jumps and tricks.",
        ability: "Air Control"
    },

    titan: {
        name: "Titan 4X4",
        price: 4000,
        color: "#4f6575",
        accent: "#172027",
        power: 10,
        speed: 6,
        grip: 10,
        suspension: 10,
        weight: 1.7,
        description: "A giant climbing machine.",
        ability: "Maximum Grip"
    }

};

/* =========================================================
   STAGES
========================================================= */

const STAGES = {

    countryside: {
        name: "Countryside",
        price: 0,
        sky: "#76b9dc",
        ground: "#73502d",
        grass: "#4f8c3f",
        gravity: 1,
        traction: 1,
        description: "Rolling hills and farm terrain."
    },

    desert: {
        name: "Desert",
        price: 800,
        sky: "#e9ad68",
        ground: "#a86e38",
        grass: "#b98948",
        gravity: 1,
        traction: .9,
        description: "Hot dunes with loose sand."
    },

    arctic: {
        name: "Arctic",
        price: 2000,
        sky: "#a8d7e9",
        ground: "#dce8ee",
        grass: "#b9d4dc",
        gravity: 1,
        traction: .65,
        description: "Slippery ice and frozen terrain."
    },

    moon: {
        name: "The Moon",
        price: 3500,
        sky: "#151928",
        ground: "#646779",
        grass: "#838596",
        gravity: .38,
        traction: .8,
        description: "Low gravity and giant jumps."
    }

};

/* =========================================================
   CHARACTERS
========================================================= */

const CHARACTERS = {

    rex: {
        name: "Rex",
        price: 0,
        body: "#efad43",
        head: "#f6bd53"
    },

    luna: {
        name: "Luna",
        price: 0,
        body: "#e06a8d",
        head: "#f08ba6"
    },

    bolt: {
        name: "Bolt",
        price: 0,
        body: "#5ca8e6",
        head: "#70b7ed"
    },

    ziggy: {
        name: "Ziggy",
        price: 300,
        body: "#72c66d",
        head: "#9ce17f"
    },

    captain: {
        name: "Captain Patch",
        price: 600,
        body: "#bd514b",
        head: "#e07167"
    },

    kage: {
        name: "Kage",
        price: 900,
        body: "#444957",
        head: "#626879"
    },

    goldie: {
        name: "Goldie",
        price: 1500,
        body: "#f4bb35",
        head: "#ffdc63"
    }

};

/* =========================================================
   UPGRADES
========================================================= */

const UPGRADE_NAMES = [
    "engine",
    "suspension",
    "tires",
    "grip"
];

function getUpgrade(vehicle, type) {

    if (!save.upgrades[vehicle]) {
        save.upgrades[vehicle] = {};
    }

    return save.upgrades[vehicle][type] || 1;
}

function upgradePrice(vehicle, type) {

    const level = getUpgrade(vehicle, type);

    return Math.floor(180 * level * level * .7);
}

/* =========================================================
   MISSIONS
========================================================= */

const MISSIONS = [

    {
        id: "distance500",
        name: "First Adventure",
        text: "Travel 500 meters.",
        goal: 500,
        reward: 250,
        stat: "distance"
    },

    {
        id: "distance2000",
        name: "Long Haul",
        text: "Travel 2,000 meters.",
        goal: 2000,
        reward: 500,
        stat: "distance"
    },

    {
        id: "coins50",
        name: "Coin Collector",
        text: "Collect 50 coins in total.",
        goal: 50,
        reward: 300,
        stat: "coins"
    },

    {
        id: "flip5",
        name: "Upside Down",
        text: "Perform 5 flips.",
        goal: 5,
        reward: 400,
        stat: "flips"
    },

    {
        id: "air10",
        name: "Air Time",
        text: "Stay airborne for 10 seconds total.",
        goal: 10,
        reward: 350,
        stat: "airtime"
    },

    {
        id: "combo5",
        name: "Show Off",
        text: "Reach a x5 combo.",
        goal: 5,
        reward: 600,
        stat: "combo"
    }

];

function missionProgress(mission) {
    return save.missions[mission.id] || 0;
}

function setMissionProgress(id, amount) {
    save.missions[id] = Math.max(save.missions[id] || 0, amount);
}

/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(id) {

    $$(".screen").forEach(s => s.classList.remove("active"));

    $(id).classList.add("active");

    updateCoins();

    if (id === "garage") {
        renderGarage();
    }

    if (id === "characters") {
        renderCharacters();
    }

    if (id === "missions") {
        renderMissions();
    }

    if (id === "settings") {
        renderSettings();
    }
}

/* =========================================================
   COINS
========================================================= */

function updateCoins() {

    $("menuCoins").textContent = save.coins;
    $("garageCoins").textContent = save.coins;
    $("gameCoins").textContent = game.coins;

    const best = Math.max(
        0,
        ...Object.values(save.best || {})
    );

    $("menuBest").textContent = Math.floor(best);
}

/* =========================================================
   GARAGE
========================================================= */

function renderGarage() {

    const vehicle = VEHICLES[save.selectedVehicle];

    $("vehicleName").textContent = vehicle.name;
    $("vehicleDescription").textContent =
        vehicle.description + " Ability: " + vehicle.ability;

    const stats = getVehicleStats(vehicle);

    $("powerStat").style.width = `${stats.power * 10}%`;
    $("speedStat").style.width = `${stats.speed * 10}%`;
    $("gripStat").style.width = `${stats.grip * 10}%`;
    $("suspensionStat").style.width = `${stats.suspension * 10}%`;

    renderVehicleList();
    renderStages();
    renderUpgradeLevels();
    drawPreview();
}

function getVehicleStats(vehicle) {

    return {
        power: Math.min(10, vehicle.power + (getUpgrade(save.selectedVehicle, "engine") - 1) * .7),
        speed: Math.min(10, vehicle.speed + (getUpgrade(save.selectedVehicle, "engine") - 1) * .5),
        grip: Math.min(10, vehicle.grip + (getUpgrade(save.selectedVehicle, "grip") - 1) * .7),
        suspension: Math.min(10, vehicle.suspension + (getUpgrade(save.selectedVehicle, "suspension") - 1) * .8)
    };
}

function renderVehicleList() {

    const list = $("vehicleList");
    list.innerHTML = "";

    for (const [id, vehicle] of Object.entries(VEHICLES)) {

        const owned = !!save.ownedVehicles[id];
        const selected = save.selectedVehicle === id;

        const card = document.createElement("button");

        card.className =
            "vehicle-card" +
            (selected ? " selected" : "") +
            (!owned ? " locked" : "");

        card.innerHTML = `
            <canvas width="160" height="75"></canvas>
            <b>${vehicle.name}</b>
            <small>${owned ? "Owned" : "● " + vehicle.price}</small>
        `;

        card.onclick = () => {

            if (owned) {

                save.selectedVehicle = id;
                persist();
                renderGarage();

            } else if (save.coins >= vehicle.price) {

                save.coins -= vehicle.price;
                save.ownedVehicles[id] = true;
                save.selectedVehicle = id;

                persist();
                renderGarage();
                playBeep(600);

            }

        };

        list.appendChild(card);

        const c = card.querySelector("canvas");
        drawMiniVehicle(c.getContext("2d"), c.width, c.height, vehicle);
    }
}

function renderStages() {

    const list = $("stageList");
    list.innerHTML = "";

    for (const [id, stage] of Object.entries(STAGES)) {

        const owned = !!save.ownedStages[id];

        const button = document.createElement("button");

        button.className =
            "stage-chip" +
            (save.selectedStage === id ? " selected" : "") +
            (!owned ? " locked" : "");

        button.textContent =
            owned ? stage.name : `🔒 ${stage.name} • ${stage.price}`;

        button.onclick = () => {

            if (owned) {

                save.selectedStage = id;
                persist();
                renderGarage();

            } else if (save.coins >= stage.price) {

                save.coins -= stage.price;
                save.ownedStages[id] = true;
                save.selectedStage = id;

                persist();
                renderGarage();
                playBeep(600);

            }

        };

        list.appendChild(button);
    }
}

function renderUpgradeLevels() {

    for (const type of UPGRADE_NAMES) {

        const level = getUpgrade(save.selectedVehicle, type);

        $(type + "Level").textContent =
            `${level}/5`;
    }
}

/* =========================================================
   CHARACTERS
========================================================= */

function renderCharacters() {

    const list = $("characterList");
    list.innerHTML = "";

    for (const [id, character] of Object.entries(CHARACTERS)) {

        const owned = !!save.ownedCharacters[id];
        const selected = save.selectedCharacter === id;

        const card = document.createElement("button");

        card.className =
            "character-card" +
            (selected ? " selected" : "");

        card.innerHTML = `
            <canvas width="180" height="120"></canvas>
            <h3>${character.name}</h3>
            <small>
                ${owned ? "Owned" : "● " + character.price}
            </small>
        `;

        card.onclick = () => {

            if (owned) {

                save.selectedCharacter = id;
                persist();
                renderCharacters();

            } else if (save.coins >= character.price) {

                save.coins -= character.price;
                save.ownedCharacters[id] = true;
                save.selectedCharacter = id;

                persist();
                renderCharacters();
                playBeep(600);

            }

        };

        list.appendChild(card);

        drawCharacter(
            card.querySelector("canvas").getContext("2d"),
            90,
            95,
            character,
            1
        );
    }
}

/* =========================================================
   MISSIONS
========================================================= */

function renderMissions() {

    const list = $("missionList");
    list.innerHTML = "";

    for (const mission of MISSIONS) {

        const progress = Math.min(
            mission.goal,
            missionProgress(mission)
        );

        const complete = progress >= mission.goal;

        const card = document.createElement("div");

        card.className =
            "mission" +
            (complete ? " completed" : "");

        card.innerHTML = `
            <h3>${mission.name}</h3>
            <p>${mission.text}</p>

            <div class="mission-progress">
                <i style="width:${progress / mission.goal * 100}%"></i>
            </div>

            <div class="mission-bottom">
                <span>${Math.floor(progress)} / ${mission.goal}</span>
                <span>● ${mission.reward}</span>
            </div>
        `;

        list.appendChild(card);
    }
}

/* =========================================================
   SETTINGS
========================================================= */

function renderSettings() {

    $("soundToggle").querySelector("b").textContent =
        save.settings.sound ? "ON" : "OFF";

    $("shakeToggle").querySelector("b").textContent =
        save.settings.shake ? "ON" : "OFF";
}

/* =========================================================
   PREVIEW
========================================================= */

function drawPreview() {

    previewCtx.clearRect(
        0,
        0,
        previewCanvas.width,
        previewCanvas.height
    );

    const vehicle = VEHICLES[save.selectedVehicle];

    previewCtx.save();

    previewCtx.translate(
        previewCanvas.width / 2,
        150
    );

    previewCtx.scale(1.5, 1.5);

    drawVehicleBody(
        previewCtx,
        vehicle,
        0,
        -15,
        0
    );

    drawWheel(
        previewCtx,
        -48,
        25,
        19,
        0
    );

    drawWheel(
        previewCtx,
        48,
        25,
        19,
        0
    );

    drawCharacter(
        previewCtx,
        0,
        -50,
        CHARACTERS[save.selectedCharacter],
        1
    );

    previewCtx.restore();
}

/* =========================================================
   GAME STATE
========================================================= */

const game = {

    running: false,
    paused: false,
    mode: "adventure",

    time: 0,
    distance: 0,
    coins: 0,
    fuel: 100,

    speed: 0,

    cameraX: 0,
    cameraY: 0,

    shake: 0,

    combo: 1,
    comboTimer: 0,

    flips: 0,
    airtime: 0,
    totalCoins: 0,

    airborne: false,
    airStart: 0,

    wheelieTime: 0,

    terrain: [],
    obstacles: [],
    pickups: [],

    particles: [],

    lastTime: 0,

    rivalX: 0,
    finishDistance: 800,

    countdown: 0,
    ended: false,

    car: null
};

/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas() {

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;

    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

/* =========================================================
   TERRAIN
========================================================= */

function terrainHeight(x) {

    const stage = STAGES[save.selectedStage];

    let y = 390;

    y += Math.sin(x * .0023) * 35;
    y += Math.sin(x * .0067) * 18;
    y += Math.sin(x * .013) * 9;

    if (stage === STAGES.desert) {
        y += Math.sin(x * .0015) * 25;
        y += Math.sin(x * .004) * 12;
    }

    if (stage === STAGES.arctic) {
        y += Math.sin(x * .003) * 22;
    }

    if (stage === STAGES.moon) {
        y += Math.sin(x * .0014) * 50;
        y += Math.sin(x * .004) * 18;
    }

    return y;
}

function generateTerrain() {

    game.terrain = [];

    const width = 100000;

    for (let x = -500; x <= width; x += 40) {

        game.terrain.push({
            x,
            y: terrainHeight(x)
        });
    }
}

/* =========================================================
   OBSTACLES
========================================================= */

function generateObjects() {

    game.obstacles = [];
    game.pickups = [];

    let seed = 12345;

    function random() {

        seed =
            (seed * 9301 + 49297) %
            233280;

        return seed / 233280;
    }

    for (let x = 450; x < 30000; x += 240 + random() * 420) {

        const r = random();

        if (r < .22) {

            game.obstacles.push({
                type: "rock",
                x,
                y: terrainHeight(x) - 17,
                w: 38 + random() * 30,
                h: 28 + random() * 20
            });

        } else if (r < .39) {

            game.obstacles.push({
                type: "log",
                x,
                y: terrainHeight(x) - 15,
                w: 80,
                h: 20,
                rot: (random() - .5) * .5
            });

        } else if (r < .48) {

            game.obstacles.push({
                type: "ramp",
                x,
                y: terrainHeight(x) - 8,
                w: 100,
                h: 40
            });

        }

        if (random() < .7) {

            const amount = 2 + Math.floor(random() * 5);

            for (let i = 0; i < amount; i++) {

                game.pickups.push({
                    type: "coin",
                    x: x + i * 42,
                    y: terrainHeight(x + i * 42) - 65 -
                        Math.sin(i / amount * Math.PI) * 35,
                    collected: false
                });
            }
        }

        if (random() < .13) {

            game.pickups.push({
                type: "fuel",
                x: x + 120,
                y: terrainHeight(x + 120) - 45,
                collected: false
            });
        }
    }
}

/* =========================================================
   CAR
========================================================= */

function buildCar() {

    const vehicle = VEHICLES[save.selectedVehicle];
    const stats = getVehicleStats(vehicle);

    return {

        x: 120,
        y: terrainHeight(120) - 80,

        vx: 0,
        vy: 0,

        angle: 0,
        angularVelocity: 0,

        width: 120,
        height: 45,

        wheelRadius: 21,

        wheelSpin: 0,

        grounded: false,
        groundFront: false,
        groundBack: false,

        suspensionFront: 0,
        suspensionBack: 0,

        power: stats.power,
        speed: stats.speed,
        grip: stats.grip,
        suspension: stats.suspension,

        weight: vehicle.weight,

        prevAngle: 0,

        damage: 0
    };
}

/* =========================================================
   PHYSICS
========================================================= */

function groundAt(x) {
    return terrainHeight(x);
}

function normalizeAngle(a) {

    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;

    return a;
}

function physics(dt) {

    const car = game.car;
    const vehicle = VEHICLES[save.selectedVehicle];
    const stage = STAGES[save.selectedStage];

    const gas = input.gas;
    const brake = input.brake;

    const gravity = 980 * stage.gravity;

    const frontX =
        car.x + Math.cos(car.angle) * 48;

    const backX =
        car.x - Math.cos(car.angle) * 48;

    const frontGround =
        groundAt(frontX) - car.wheelRadius;

    const backGround =
        groundAt(backX) - car.wheelRadius;

    const frontWheelY =
        car.y + Math.sin(car.angle) * 48;

    const backWheelY =
        car.y - Math.sin(car.angle) * 48;

    const frontCompression =
        frontWheelY - frontGround;

    const backCompression =
        backWheelY - backGround;

    car.grounded =
        frontCompression >= -3 ||
        backCompression >= -3;

    car.groundFront = frontCompression >= -3;
    car.groundBack = backCompression >= -3;

    /* gravity */

    car.vy += gravity * dt;

    /* ENGINE */

    if (gas && game.fuel > 0) {

        const engineForce =
            400 *
            (car.power / 6) *
            (vehicle.weight > 1.5 ? .9 : 1);

        car.vx +=
            Math.cos(car.angle) *
            engineForce *
            dt;

        game.fuel -= dt * (
            .45 +
            car.power * .025
        );
    }

    /* BRAKE */

    if (brake) {

        car.vx *= Math.pow(.06, dt);

        if (Math.abs(car.vx) < 8) {
            car.vx = 0;
        }
    }

    /* AIR CONTROL */

    if (!car.grounded) {

        if (gas) {
            car.angularVelocity +=
                2.2 * dt;
        }

        if (brake) {
            car.angularVelocity -=
                2.2 * dt;
        }
    }

    /* AIR ROTATION */

    car.angle += car.angularVelocity * dt;

    car.angularVelocity *=
        Math.pow(car.grounded ? .12 : .82, dt);

    /* TRACTION */

    const traction =
        stage.traction *
        (car.grip / 6);

    if (car.grounded) {

        const slope =
            Math.atan2(
                terrainHeight(frontX) -
                terrainHeight(backX),
                96
            );

        car.angle +=
            normalizeAngle(slope - car.angle) *
            Math.min(1, dt * (
                3.5 +
                car.suspension * .15
            ));

        const targetSpeed =
            160 +
            car.speed * 24;

        if (Math.abs(car.vx) > targetSpeed) {

            car.vx *=
                Math.pow(.35, dt);
        }

        car.vx *=
            Math.pow(
                .55 + traction * .08,
                dt
            );

        const targetY =
            Math.min(
                frontGround,
                backGround
            ) - 30;

        car.y +=
            (targetY - car.y) *
            Math.min(1, dt * (
                8 + car.suspension
            ));

        car.vy *= .35;
    }

    /* POSITION */

    car.x += car.vx * dt;
    car.y += car.vy * dt;

    car.wheelSpin +=
        car.vx * dt /
        car.wheelRadius;

    /* SPEED */

    game.speed =
        Math.abs(car.vx) * .08;

    /* DISTANCE */

    game.distance =
        Math.max(
            0,
            (car.x - 120) / 10
        );

    /* FUEL */

    if (game.fuel <= 0) {

        game.fuel = 0;

        car.vx *=
            Math.pow(.18, dt);
    }

    /* WORLD FALL */

    if (car.y > 900) {

        crash();
    }
}

/* =========================================================
   TRICKS
========================================================= */

function updateTricks(dt) {

    const car = game.car;

    if (!car.grounded) {

        if (!game.airborne) {

            game.airborne = true;
            game.airStart = game.time;
        }

        game.airtime += dt;

        const rotation =
            normalizeAngle(
                car.angle -
                car.prevAngle
            );

        if (Math.abs(rotation) > .025) {

            if (rotation > 0) {

                game.currentRotation =
                    (game.currentRotation || 0) +
                    rotation;

            } else {

                game.currentRotation =
                    (game.currentRotation || 0) +
                    rotation;
            }
        }

    } else if (game.airborne) {

        game.airborne = false;

        const airTime =
            game.time -
            game.airStart;

        if (airTime > .3) {

            addCombo(
                1,
                "AIR TIME +" +
                airTime.toFixed(1) +
                "s"
            );
        }

        const rotations =
            Math.floor(
                Math.abs(
                    game.currentRotation || 0
                ) /
                (Math.PI * 2)
            );

        if (rotations > 0) {

            game.flips += rotations;

            addCombo(
                rotations * 2,
                rotations + " FLIP" +
                (rotations > 1 ? "S" : "")
            );
        }

        game.currentRotation = 0;

        const landingSpeed =
            Math.abs(car.vy);

        if (landingSpeed > 500) {

            car.damage +=
                landingSpeed / 100;

            game.shake = 7;
        }
    }

    car.prevAngle = car.angle;

    /* WHEELIE */

    if (
        car.grounded &&
        car.groundBack &&
        !car.groundFront &&
        Math.abs(car.vx) > 70
    ) {

        game.wheelieTime += dt;

        if (game.wheelieTime > .8) {

            addCombo(
                1,
                "WHEELIE"
            );

            game.wheelieTime = 0;
        }

    } else {

        game.wheelieTime = 0;
    }
}

/* =========================================================
   COMBO
========================================================= */

function addCombo(amount, text) {

    game.combo =
        Math.min(
            10,
            game.combo + amount
        );

    game.comboTimer = 3;

    $("comboText").textContent =
        `COMBO x${game.combo}`;

    $("comboFill").style.width = "100%";

    $("combo-container")?.classList.add("active");

    showTrick(
        `${text}  x${game.combo}`
    );

    game.shake = 2;
}

function updateCombo(dt) {

    if (game.combo > 1) {

        game.comboTimer -= dt;

        $("comboFill").style.width =
            `${Math.max(
                0,
                game.comboTimer / 3 * 100
            )}%`;

        document
            .querySelector(".combo-container")
            .classList.add("active");

        if (game.comboTimer <= 0) {

            game.combo = 1;

            document
                .querySelector(".combo-container")
                .classList.remove("active");
        }
    }
}

/* =========================================================
   OBJECTS
========================================================= */

function updateObjects(dt) {

    const car = game.car;

    for (const object of game.pickups) {

        if (object.collected) continue;

        const dx =
            object.x - car.x;

        const dy =
            object.y - car.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance < 55) {

            object.collected = true;

            if (object.type === "coin") {

                const reward =
                    game.combo > 1
                        ? game.combo
                        : 1;

                game.coins += reward;
                game.totalCoins += reward;

                addParticles(
                    object.x,
                    object.y,
                    "#ffd34e",
                    8
                );

                setMissionProgress(
                    "coins50",
                    (save.missions.coins50 || 0) + reward
                );

                playBeep(700);
            }

            if (object.type === "fuel") {

                game.fuel =
                    Math.min(
                        100,
                        game.fuel + 35
                    );

                showTrick("FUEL +35");

                addParticles(
                    object.x,
                    object.y,
                    "#58d46b",
                    15
                );

                playBeep(500);
            }
        }
    }

    /* OBSTACLES */

    for (const obstacle of game.obstacles) {

        if (
            Math.abs(obstacle.x - car.x) >
            180
        ) continue;

        const dx =
            Math.abs(
                obstacle.x - car.x
            );

        const dy =
            Math.abs(
                obstacle.y - car.y
            );

        if (
            dx <
            obstacle.w / 2 + 45 &&
            dy <
            obstacle.h / 2 + 35
        ) {

            if (obstacle.type === "ramp") {

                car.vy -=
                    350 *
                    dt *
                    (1 + car.speed / 10);

                car.angle -=
                    .25 * dt;
            }

            if (
                obstacle.type === "rock" ||
                obstacle.type === "log"
            ) {

                car.vx *= .85;
                car.vy -= 80;

                car.angularVelocity +=
                    (Math.random() - .5) *
                    .7;

                obstacle.hit = true;

                addParticles(
                    obstacle.x,
                    obstacle.y,
                    "#d2b080",
                    6
                );

                game.shake = 4;
            }
        }
    }
}

/* =========================================================
   PARTICLES
========================================================= */

function addParticles(x, y, color, amount) {

    for (let i = 0; i < amount; i++) {

        game.particles.push({
            x,
            y,

            vx: (Math.random() - .5) * 100,
            vy: -Math.random() * 120,

            life: .3 + Math.random() * .5,

            size: 2 + Math.random() * 4,

            color
        });
    }
}

function updateParticles(dt) {

    for (const p of game.particles) {

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        p.vy += 250 * dt;

        p.life -= dt;
    }

    game.particles =
        game.particles.filter(
            p => p.life > 0
        );
}

/* =========================================================
   CAMERA
========================================================= */

function updateCamera(dt) {

    const targetX =
        game.car.x -
        innerWidth * .35;

    const targetY =
        game.car.y -
        innerHeight * .48;

    game.cameraX +=
        (targetX - game.cameraX) *
        Math.min(1, dt * 4);

    game.cameraY +=
        (targetY - game.cameraY) *
        Math.min(1, dt * 4);

    game.cameraY =
        Math.max(
            -100,
            Math.min(
                250,
                game.cameraY
            )
        );

    if (game.shake > 0) {

        game.shake *=
            Math.pow(.03, dt);

        if (save.settings.shake) {

            game.cameraX +=
                (Math.random() - .5) *
                game.shake;

            game.cameraY +=
                (Math.random() - .5) *
                game.shake;
        }
    }
}

/* =========================================================
   RACE
========================================================= */

function updateRace(dt) {

    if (game.mode !== "race") return;

    game.rivalX +=
        (150 +
        Math.sin(game.time * .8) * 35) *
        dt;

    const playerDistance =
        game.car.x - 120;

    const rivalDistance =
        game.rivalX;

    $("raceFill").style.width =
        `${Math.min(
            100,
            playerDistance /
            (game.finishDistance * 10) *
            100
        )}%`;

    if (
        playerDistance >
        game.finishDistance * 10
    ) {

        finishRace(true);
    }

    if (
        rivalDistance >
        game.finishDistance * 10
    ) {

        finishRace(false);
    }
}

function finishRace(playerWon) {

    if (game.ended) return;

    game.ended = true;

    const bonus =
        playerWon
            ? 300
            : 80;

    game.coins += bonus;

    endGame(
        playerWon
            ? "RACE WON!"
            : "RACE LOST"
    );
}

/* =========================================================
   CRASH
========================================================= */

function crash() {

    if (game.ended) return;

    game.ended = true;

    game.shake = 14;

    addParticles(
        game.car.x,
        game.car.y,
        "#d7d7d7",
        25
    );

    setTimeout(() => {

        endGame("CRASH!");

    }, 700);
}

/* =========================================================
   UPDATE
========================================================= */

function update(dt) {

    if (!game.running ||
        game.paused ||
        game.ended
    ) return;

    game.time += dt;

    if (game.countdown > 0) {

        game.countdown -= dt;

        const count =
            Math.ceil(game.countdown);

        $("countdown").textContent =
            count > 0
                ? count
                : "GO!";

        if (game.countdown <= 0) {
            $("countdown").textContent = "";
        }

        updateCamera(dt);
        return;
    }

    physics(dt);
    updateTricks(dt);
    updateObjects(dt);
    updateParticles(dt);
    updateCombo(dt);
    updateCamera(dt);
    updateRace(dt);

    updateHUD();

    updateMissionStats();
}

/* =========================================================
   MISSION TRACKING
========================================================= */

function updateMissionStats() {

    setMissionProgress(
        "distance500",
        game.distance
    );

    setMissionProgress(
        "distance2000",
        game.distance
    );

    setMissionProgress(
        "flip5",
        (save.missions.flip5 || 0) +
        0
    );

    setMissionProgress(
        "air10",
        (save.missions.air10 || 0) +
        0
    );

    setMissionProgress(
        "combo5",
        Math.max(
            save.missions.combo5 || 0,
            game.combo
        )
    );

    if (
        game.airtime >
        (save.missions.air10 || 0)
    ) {

        save.missions.air10 =
            game.airtime;
    }

    if (
        game.flips >
        (save.missions.flip5 || 0)
    ) {

        save.missions.flip5 =
            game.flips;
    }
}

/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    $("distance").textContent =
        Math.floor(game.distance);

    $("gameCoins").textContent =
        game.coins;

    $("fuelFill").style.width =
        `${game.fuel}%`;

    $("comboText").textContent =
        `COMBO x${game.combo}`;

    if (game.mode === "race") {

        $("raceBar").classList.add("active");

    } else {

        $("raceBar").classList.remove("active");
    }
}

/* =========================================================
   GAME START
========================================================= */

function startGame(mode) {

    game.running = true;
    game.paused = false;
    game.ended = false;

    game.mode = mode;

    game.time = 0;
    game.distance = 0;
    game.coins = 0;
    game.fuel = 100;

    game.speed = 0;

    game.combo = 1;
    game.comboTimer = 0;

    game.flips = 0;
    game.airtime = 0;
    game.wheelieTime = 0;
    game.currentRotation = 0;

    game.particles = [];

    game.rivalX = 0;

    game.finishDistance = 800;

    generateTerrain();
    generateObjects();

    game.car = buildCar();

    game.cameraX =
        game.car.x -
        innerWidth * .35;

    game.cameraY =
        game.car.y -
        innerHeight * .48;

    $("pauseOverlay").classList.remove("active");
    $("resultsOverlay").classList.remove("active");

    showScreen("gameScreen");

    game.countdown =
        mode === "race"
            ? 3
            : 0;

    $("countdown").textContent =
        mode === "race"
            ? "3"
            : "";

    updateHUD();
}

/* =========================================================
   END GAME
========================================================= */

function endGame(title) {

    game.running = false;

    const vehicle =
        save.selectedVehicle;

    save.best[vehicle] =
        Math.max(
            save.best[vehicle] || 0,
            game.distance
        );

    save.coins +=
        Math.floor(game.coins);

    persist();

    $("resultTitle").textContent =
        title;

    $("resultDistance").textContent =
        Math.floor(game.distance);

    $("resultCoins").textContent =
        game.coins;

    $("resultStats").innerHTML = `
        Top speed: ${Math.floor(game.speed * 10)} km/h<br>
        Flips: ${game.flips}<br>
        Air time: ${game.airtime.toFixed(1)}s<br>
        Best combo: x${game.combo}
    `;

    $("resultsOverlay").classList.add("active");
}

/* =========================================================
   RENDER
========================================================= */

function render() {

    const w = innerWidth;
    const h = innerHeight;

    ctx.clearRect(0, 0, w, h);

    drawBackground(w, h);

    ctx.save();

    ctx.translate(
        -game.cameraX,
        -game.cameraY
    );

    drawTerrain();

    drawObjects();

    drawRival();

    drawParticles();

    if (game.car) {
        drawCar(game.car);
    }

    ctx.restore();
}

/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground(w, h) {

    const stage =
        STAGES[save.selectedStage];

    const gradient =
        ctx.createLinearGradient(
            0, 0, 0, h
        );

    gradient.addColorStop(
        0,
        stage.sky
    );

    gradient.addColorStop(
        1,
        "#e9c995"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    /* SUN */

    ctx.fillStyle =
        stage === STAGES.moon
            ? "#e7e9ff"
            : "#ffd96a";

    ctx.beginPath();

    ctx.arc(
        w * .78,
        h * .22,
        stage === STAGES.moon ? 35 : 45,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* PARALLAX HILLS */

    for (let layer = 0; layer < 3; layer++) {

        ctx.beginPath();

        const speed =
            .12 + layer * .12;

        const base =
            h * (.48 + layer * .11);

        ctx.moveTo(
            0,
            h
        );

        for (
            let x = -50;
            x <= w + 50;
            x += 35
        ) {

            const worldX =
                x +
                game.cameraX *
                speed;

            const y =
                base +
                Math.sin(worldX * .004) *
                (25 + layer * 15) +
                Math.sin(worldX * .009) *
                12;

            ctx.lineTo(
                x,
                y
            );
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        ctx.fillStyle =
            layer === 0
                ? "#68875e"
                : layer === 1
                    ? "#55705b"
                    : "#42594e";

        ctx.fill();
    }

    /* MOON STARS */

    if (stage === STAGES.moon) {

        ctx.fillStyle =
            "#ffffffcc";

        for (
            let i = 0;
            i < 50;
            i++
        ) {

            const x =
                ((i * 137) -
                game.cameraX * .05) %
                w;

            const y =
                (i * 71) %
                (h * .55);

            ctx.fillRect(
                x,
                y,
                2,
                2
            );
        }
    }
}

/* =========================================================
   TERRAIN DRAW
========================================================= */

function drawTerrain() {

    const stage =
        STAGES[save.selectedStage];

    ctx.beginPath();

    ctx.moveTo(
        -1000,
        900
    );

    for (
        let x =
            Math.floor(game.cameraX / 40) * 40 - 500;

        x <
            game.cameraX +
            innerWidth +
            500;

        x += 40
    ) {

        ctx.lineTo(
            x,
            terrainHeight(x)
        );
    }

    ctx.lineTo(
        game.cameraX +
        innerWidth +
        1000,
        900
    );

    ctx.closePath();

    ctx.fillStyle =
        stage.ground;

    ctx.fill();

    /* GRASS / TOP */

    ctx.beginPath();

    for (
        let x =
            Math.floor(game.cameraX / 40) * 40 - 500;

        x <
            game.cameraX +
            innerWidth +
            500;

        x += 40
    ) {

        const y =
            terrainHeight(x);

        if (x === Math.floor(game.cameraX / 40) * 40 - 500) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.strokeStyle =
        stage.grass;

    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    /* TERRAIN STRIPES */

    ctx.strokeStyle =
        "#00000015";

    ctx.lineWidth = 2;

    for (
        let x =
            Math.floor(game.cameraX / 100) * 100;

        x <
            game.cameraX +
            innerWidth +
            200;

        x += 100
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            terrainHeight(x) + 20
        );

        ctx.lineTo(
            x + 30,
            terrainHeight(x + 30) + 45
        );

        ctx.stroke();
    }
}

/* =========================================================
   OBJECT DRAW
========================================================= */

function drawObjects() {

    for (const object of game.obstacles) {

        if (
            Math.abs(
                object.x - game.cameraX
            ) > innerWidth + 200
        ) continue;

        if (object.type === "rock") {

            ctx.save();

            ctx.translate(
                object.x,
                object.y
            );

            ctx.fillStyle =
                object.hit
                    ? "#5e5a55"
                    : "#77736c";

            ctx.beginPath();

            ctx.moveTo(
                -object.w / 2,
                object.h / 2
            );

            ctx.lineTo(
                -object.w / 3,
                -object.h / 2
            );

            ctx.lineTo(
                object.w / 4,
                -object.h / 2
            );

            ctx.lineTo(
                object.w / 2,
                object.h / 3
            );

            ctx.closePath();

            ctx.fill();

            ctx.restore();
        }

        if (object.type === "log") {

            ctx.save();

            ctx.translate(
                object.x,
                object.y
            );

            ctx.rotate(object.rot || 0);

            ctx.fillStyle = "#754329";

            ctx.fillRect(
                -object.w / 2,
                -object.h / 2,
                object.w,
                object.h
            );

            ctx.fillStyle = "#a76639";

            ctx.beginPath();

            ctx.arc(
                object.w / 2,
                0,
                object.h / 2,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();
        }

        if (object.type === "ramp") {

            ctx.save();

            ctx.translate(
                object.x,
                object.y
            );

            ctx.fillStyle =
                "#d18b3b";

            ctx.beginPath();

            ctx.moveTo(
                -object.w / 2,
                object.h / 2
            );

            ctx.lineTo(
                object.w / 2,
                object.h / 2
            );

            ctx.lineTo(
                object.w / 2,
                -object.h / 2
            );

            ctx.closePath();

            ctx.fill();

            ctx.restore();
        }
    }

    for (const pickup of game.pickups) {

        if (pickup.collected) continue;

        if (
            Math.abs(
                pickup.x - game.cameraX
            ) > innerWidth + 100
        ) continue;

        if (pickup.type === "coin") {

            const spin =
                Math.sin(game.time * 6 + pickup.x) *
                .35;

            ctx.save();

            ctx.translate(
                pickup.x,
                pickup.y
            );

            ctx.scale(
                Math.max(.2, Math.abs(spin)),
                1
            );

            ctx.fillStyle =
                "#ffd34e";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                11,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "#fff0a0";

            ctx.beginPath();

            ctx.arc(
                -3,
                -3,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();
        }

        if (pickup.type === "fuel") {

            ctx.save();

            ctx.translate(
                pickup.x,
                pickup.y
            );

            ctx.fillStyle =
                "#e84c45";

            ctx.fillRect(
                -12,
                -18,
                24,
                36
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.fillRect(
                -5,
                -7,
                10,
                12
            );

            ctx.fillStyle =
                "#d5d5d5";

            ctx.fillRect(
                4,
                -23,
                8,
                7
            );

            ctx.restore();
        }
    }
}

/* =========================================================
   RIVAL
========================================================= */

function drawRival() {

    if (game.mode !== "race") return;

    const x =
        120 +
        game.rivalX;

    const y =
        terrainHeight(x) - 55;

    const vehicle =
        VEHICLES.roadster;

    ctx.save();

    ctx.translate(x, y);

    drawVehicleBody(
        ctx,
        vehicle,
        0,
        0,
        0
    );

    drawWheel(
        ctx,
        -45,
        30,
        19,
        game.time * 4
    );

    drawWheel(
        ctx,
        45,
        30,
        19,
        game.time * 4
    );

    drawCharacter(
        ctx,
        0,
        -37,
        CHARACTERS.kage,
        1
    );

    ctx.restore();
}

/* =========================================================
   CAR DRAW
========================================================= */

function drawCar(car) {

    const vehicle =
        VEHICLES[save.selectedVehicle];

    ctx.save();

    ctx.translate(
        car.x,
        car.y
    );

    ctx.rotate(car.angle);

    drawVehicleBody(
        ctx,
        vehicle,
        0,
        0,
        0
    );

    drawWheel(
        ctx,
        -48,
        28,
        car.wheelRadius,
        car.wheelSpin
    );

    drawWheel(
        ctx,
        48,
        28,
        car.wheelRadius,
        car.wheelSpin
    );

    drawCharacter(
        ctx,
        0,
        -37,
        CHARACTERS[save.selectedCharacter],
        1
    );

    /* EXHAUST */

    if (input.gas && game.fuel > 0) {

        ctx.fillStyle =
            "#d8d8d855";

        ctx.beginPath();

        ctx.arc(
            -65,
            8,
            7 + Math.random() * 4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.restore();
}

/* =========================================================
   VEHICLE BODY
========================================================= */

function drawVehicleBody(
    context,
    vehicle,
    x,
    y,
    angle
) {

    context.save();

    context.translate(x, y);
    context.rotate(angle);

    /* chassis */

    context.fillStyle =
        vehicle.accent;

    roundRect(
        context,
        -62,
        -18,
        124,
        38,
        10
    );

    context.fill();

    /* body */

    context.fillStyle =
        vehicle.color;

    context.beginPath();

    context.moveTo(-58, 5);
    context.lineTo(-47, -17);
    context.lineTo(-15, -25);
    context.lineTo(34, -24);
    context.lineTo(57, -5);
    context.lineTo(62, 12);
    context.lineTo(-60, 12);

    context.closePath();

    context.fill();

    /* cockpit */

    context.fillStyle =
        "#202a32";

    context.beginPath();

    context.moveTo(
        -18,
        -21
    );

    context.lineTo(
        30,
        -21
    );

    context.lineTo(
        40,
        -7
    );

    context.lineTo(
        -12,
        -7
    );

    context.closePath();

    context.fill();

    /* highlight */

    context.fillStyle =
        "#ffffff33";

    context.fillRect(
        -43,
        -9,
        25,
        5
    );

    /* bumper */

    context.fillStyle =
        "#20252b";

    context.fillRect(
        -67,
        9,
        13,
        7
    );

    context.fillRect(
        55,
        9,
        13,
        7
    );

    context.restore();
}

/* =========================================================
   WHEEL
========================================================= */

function drawWheel(
    context,
    x,
    y,
    radius,
    rotation
) {

    context.save();

    context.translate(x, y);

    context.rotate(rotation);

    context.fillStyle =
        "#15191d";

    context.beginPath();

    context.arc(
        0,
        0,
        radius,
        0,
        Math.PI * 2
    );

    context.fill();

    context.fillStyle =
        "#646b72";

    context.beginPath();

    context.arc(
        0,
        0,
        radius * .48,
        0,
        Math.PI * 2
    );

    context.fill();

    context.strokeStyle =
        "#353b41";

    context.lineWidth = 3;

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        context.rotate(
            Math.PI / 3
        );

        context.beginPath();

        context.moveTo(
            0,
            0
        );

        context.lineTo(
            radius * .8,
            0
        );

        context.stroke();
    }

    context.restore();
}

/* =========================================================
   CHARACTER
========================================================= */

function drawCharacter(
    context,
    x,
    y,
    character,
    scale
) {

    context.save();

    context.translate(x, y);
    context.scale(scale, scale);

    /* legs */

    context.strokeStyle =
        "#20252a";

    context.lineWidth = 8;
    context.lineCap = "round";

    context.beginPath();

    context.moveTo(-7, 19);
    context.lineTo(-10, 33);

    context.moveTo(7, 19);
    context.lineTo(10, 33);

    context.stroke();

    /* body */

    context.fillStyle =
        character.body;

    roundRect(
        context,
        -17,
        -5,
        34,
        31,
        11
    );

    context.fill();

    /* arms */

    context.strokeStyle =
        character.body;

    context.lineWidth = 8;

    context.beginPath();

    context.moveTo(-14, 2);
    context.lineTo(-25, 14);

    context.moveTo(14, 2);
    context.lineTo(25, 14);

    context.stroke();

    /* head */

    context.fillStyle =
        character.head;

    context.beginPath();

    context.arc(
        0,
        -18,
        18,
        0,
        Math.PI * 2
    );

    context.fill();

    /* eyes */

    context.fillStyle =
        "#20252a";

    context.beginPath();

    context.arc(
        -6,
        -20,
        2.5,
        0,
        Math.PI * 2
    );

    context.arc(
        6,
        -20,
        2.5,
        0,
        Math.PI * 2
    );

    context.fill();

    /* smile */

    context.strokeStyle =
        "#20252a";

    context.lineWidth = 2;

    context.beginPath();

    context.arc(
        0,
        -16,
        7,
        0,
        Math.PI
    );

    context.stroke();

    context.restore();
}

/* =========================================================
   PARTICLES DRAW
========================================================= */

function drawParticles() {

    for (const p of game.particles) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life * 2
            );

        ctx.fillStyle =
            p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

/* =========================================================
   MINI VEHICLE
========================================================= */

function drawMiniVehicle(
    context,
    width,
    height,
    vehicle
) {

    context.clearRect(
        0,
        0,
        width,
        height
    );

    context.save();

    context.translate(
        width / 2,
        height / 2
    );

    context.scale(.75, .75);

    drawVehicleBody(
        context,
        vehicle,
        0,
        0,
        0
    );

    drawWheel(
        context,
        -45,
        28,
        18,
        0
    );

    drawWheel(
        context,
        45,
        28,
        18,
        0
    );

    context.restore();
}

/* =========================================================
   ROUND RECT
========================================================= */

function roundRect(
    context,
    x,
    y,
    w,
    h,
    r
) {

    context.beginPath();

    context.moveTo(
        x + r,
        y
    );

    context.arcTo(
        x + w,
        y,
        x + w,
        y + h,
        r
    );

    context.arcTo(
        x + w,
        y + h,
        x,
        y + h,
        r
    );

    context.arcTo(
        x,
        y + h,
        x,
        y,
        r
    );

    context.arcTo(
        x,
        y,
        x + w,
        y,
        r
    );

    context.closePath();
}

/* =========================================================
   INPUT
========================================================= */

const input = {
    gas: false,
    brake: false
};

function bindHold(button, key) {

    const down = e => {

        e.preventDefault();

        input[key] = true;
    };

    const up = e => {

        e.preventDefault();

        input[key] = false;
    };

    button.addEventListener(
        "pointerdown",
        down
    );

    button.addEventListener(
        "pointerup",
        up
    );

    button.addEventListener(
        "pointercancel",
        up
    );

    button.addEventListener(
        "pointerleave",
        up
    );
}

bindHold(
    $("gasBtn"),
    "gas"
);

bindHold(
    $("brakeBtn"),
    "brake"
);

window.addEventListener(
    "keydown",
    e => {

        if (
            e.key === "ArrowRight" ||
            e.key === "d"
        ) {
            input.gas = true;
        }

        if (
            e.key === "ArrowLeft" ||
            e.key === "a"
        ) {
            input.brake = true;
        }

        if (e.key === " ") {

            if (game.running) {
                togglePause();
            }
        }
    }
);

window.addEventListener(
    "keyup",
    e => {

        if (
            e.key === "ArrowRight" ||
            e.key === "d"
        ) {
            input.gas = false;
        }

        if (
            e.key === "ArrowLeft" ||
            e.key === "a"
        ) {
            input.brake = false;
        }
    }
);

/* =========================================================
   SOUND
========================================================= */

let audioContext = null;

function playBeep(
    frequency = 500
) {

    if (!save.settings.sound)
        return;

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();
        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.frequency.value =
            frequency;

        oscillator.type = "square";

        gain.gain.value = .04;

        oscillator.connect(gain);
        gain.connect(
            audioContext.destination
        );

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime +
            .07
        );

    } catch {}
}

/* =========================================================
   POPUPS
========================================================= */

let popupTimer = null;

function showTrick(text) {

    const popup =
        $("trickPopup");

    popup.textContent =
        text;

    popup.style.opacity = "1";

    clearTimeout(popupTimer);

    popupTimer =
        setTimeout(() => {

            popup.style.opacity = "0";

        }, 1000);
}

/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (!game.running) return;

    game.paused =
        !game.paused;

    $("pauseOverlay")
        .classList.toggle(
            "active",
            game.paused
        );
}

$("pauseBtn").onclick =
    togglePause;

$("resumeBtn").onclick = () => {

    game.paused = false;

    $("pauseOverlay")
        .classList.remove(
            "active"
        );
};

$("restartBtn").onclick = () => {

    startGame(
        game.mode
    );
};

$("quitBtn").onclick = () => {

    game.running = false;

    $("pauseOverlay")
        .classList.remove(
            "active"
        );

    showScreen("menu");
};

/* =========================================================
   RESULTS
========================================================= */

$("resultRestart").onclick = () => {

    $("resultsOverlay")
        .classList.remove(
            "active"
        );

    startGame(
        game.mode
    );
};

$("resultMenu").onclick = () => {

    $("resultsOverlay")
        .classList.remove(
            "active"
        );

    showScreen("menu");
};

/* =========================================================
   MENU BUTTONS
========================================================= */

$("raceBtn").onclick = () => {

    startGame("race");
};

$("adventureBtn").onclick = () => {

    startGame("adventure");
};

$("garageBtn").onclick = () => {

    showScreen("garage");
};

$("charactersBtn").onclick = () => {

    showScreen("characters");
};

$("missionsBtn").onclick = () => {

    showScreen("missions");
};

$("settingsBtn").onclick = () => {

    showScreen("settings");
};

$$(".backBtn").forEach(
    button => {

        button.onclick = () => {

            showScreen("menu");
        };
    }
);

/* =========================================================
   UPGRADE BUTTONS
========================================================= */

$$(".upgrade").forEach(
    button => {

        button.onclick = () => {

            const type =
                button.dataset.upgrade;

            const level =
                getUpgrade(
                    save.selectedVehicle,
                    type
                );

            if (level >= 5) return;

            const price =
                upgradePrice(
                    save.selectedVehicle,
                    type
                );

            if (save.coins < price) {

                showTrick(
                    "NOT ENOUGH COINS"
                );

                playBeep(180);

                return;
            }

            save.coins -= price;

            if (!save.upgrades[
                save.selectedVehicle
            ]) {

                save.upgrades[
                    save.selectedVehicle
                ] = {};
            }

            save.upgrades[
                save.selectedVehicle
            ][type] =
                level + 1;

            persist();

            renderGarage();

            playBeep(700);
        };
    }
);

/* =========================================================
   SETTINGS
========================================================= */

$("soundToggle").onclick = () => {

    save.settings.sound =
        !save.settings.sound;

    persist();

    renderSettings();
};

$("shakeToggle").onclick = () => {

    save.settings.shake =
        !save.settings.shake;

    persist();

    renderSettings();
};

$("resetBtn").onclick = () => {

    const yes =
        confirm(
            "Reset all Hill Bound progress?"
        );

    if (!yes) return;

    save =
        defaultSave();

    persist();

    renderSettings();
    renderGarage();
    updateCoins();
};

/* =========================================================
   FULLSCREEN
========================================================= */

$("fullscreenBtn").onclick =
    async () => {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement
                    .requestFullscreen();

            } else {

                await document.exitFullscreen();
            }

        } catch {}
    };

/* =========================================================
   GAME LOOP
========================================================= */

function loop(timestamp) {

    if (!game.lastTime) {
        game.lastTime = timestamp;
    }

    const dt =
        Math.min(
            .033,
            (timestamp -
                game.lastTime) /
            1000
        );

    game.lastTime =
        timestamp;

    update(dt);
    render();

    requestAnimationFrame(
        loop
    );
}

requestAnimationFrame(loop);

/* =========================================================
   LOADING
========================================================= */

const tips = [
    "Use the gas in the air to rotate forward.",
    "Use the brake in the air to rotate backward.",
    "Land on your wheels to keep your combo.",
    "Different vehicles handle very differently.",
    "The Moon has much lower gravity.",
    "Upgrade suspension for rough terrain.",
    "Collect fuel cans to keep your adventure alive.",
    "Longer tricks create bigger combos.",
    "Watch out for rocks and logs!",
    "Ramps are great for huge jumps."
];

function startLoading() {

    showScreen("loading");

    const duration =
        3000 +
        Math.random() * 7000;

    const start =
        performance.now();

    $("loadingTip").textContent =
        "Tip: " +
        tips[
            Math.floor(
                Math.random() *
                tips.length
            )
        ];

    function progress(now) {

        const p =
            Math.min(
                1,
                (now - start) /
                duration
            );

        $("loadingFill").style.width =
            `${p * 100}%`;

        $("loadingText").textContent =
            p >= 1
                ? "READY!"
                : `Loading... ${Math.floor(
                    p * 100
                )}%`;

        if (p < 1) {

            requestAnimationFrame(
                progress
            );

        } else {

            setTimeout(() => {

                showScreen("menu");

            }, 250);
        }
    }

    requestAnimationFrame(progress);
}

/* =========================================================
   STARTUP
========================================================= */

setTimeout(() => {

    startLoading();

}, 2600);

/* =========================================================
   PREVIEW UPDATE
========================================================= */

setInterval(() => {

    if (
        $("garage").classList.contains(
            "active"
        )
    ) {

        drawPreview();
    }

}, 50);

/* =========================================================
   MISSION SAVE
========================================================= */

setInterval(() => {

    if (game.running) {

        updateMissionStats();
        persist();
    }

}, 2000);