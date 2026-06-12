const Experiment = {
    isAlive: true,
    bodyParts: {
        head: { hp: 100, maxHp: 100, sprite: "experimentHead.png", isBleeding: false },
        eye: { sprite: "experimentEyeOpen.png" },
        uptorso: { hp: 120, maxHp: 120, sprite: "experimentUpTorso.png", isBleeding: false },
        downtorso: { hp: 100, maxHp: 100, sprite: "experimentDownTorso.png", isBleeding: false },
        crus: { hp: 60, maxHp: 60, sprite: "experimentCrus.png", isBleeding: false, isBroken: false },
        tail: { hp: 40, maxHp: 40, sprite: "experimentTail.png", isBleeding: false }
    },

    // Логика получения урона
    receiveDamage: function(partName, damage) {
        if (!this.isAlive) return;
        let part = this.bodyParts[partName];
        if (!part) return;

        part.hp -= damage;
        if (part.hp < 0) part.hp = 0;

        if (partName === "head") {
            if (this.bodyParts.head.hp <= 0) {
                this.isAlive = false;
                this.bodyParts.head.sprite = "experimentHeadDisfigured3.png";
                this.bodyParts.eye.sprite = "experimentEyePanic.png";
            } else if (this.bodyParts.head.hp < 35) {
                this.bodyParts.head.sprite = "experimentHeadDisfigured2.png";
                this.bodyParts.eye.sprite = "experimentEyePanic.png";
                this.bodyParts.head.isBleeding = true;
            } else if (this.bodyParts.head.hp < 70) {
                this.bodyParts.head.sprite = "experimentHeadDisfigured1.png";
                this.bodyParts.eye.sprite = "experimentEyeSad.png";
            }
        }

        if (partName === "crus" && part.hp < 20) {
            part.isBroken = true;
            part.isBleeding = true;
        }

        if (partName === "tail" && part.hp <= 0) {
            part.isBleeding = true;
        }
    },

    // Логика медицины
    healPart: function(partName, amount) {
        if (!this.isAlive) return;
        let part = this.bodyParts[partName];
        if (!part) return;

        part.hp += amount;
        if (part.hp > part.maxHp) part.hp = part.maxHp;
        part.isBleeding = false;

        if (partName === "head" && part.hp >= 100) {
            part.sprite = "experimentHead.png";
            this.bodyParts.eye.sprite = "experimentEyeOpen.png";
        }
        if (partName === "head" && part.hp < 100 && part.hp > 35) {
            part.sprite = "experimentHeadDisfigured1Healed.png";
            this.bodyParts.eye.sprite = "experimentEyeHalfClosed.png";
        }
        if (partName === "crus") {
            part.isBroken = false;
        }
    }
};

// Функция обновления картинок и текста на сайте
function updateUI() {
    document.getElementById("hp-head").innerText = Experiment.bodyParts.head.hp;
    document.getElementById("hp-uptorso").innerText = Experiment.bodyParts.uptorso.hp;
    document.getElementById("hp-downtorso").innerText = Experiment.bodyParts.downtorso.hp;
    document.getElementById("hp-crus").innerText = Experiment.bodyParts.crus.hp;
    document.getElementById("hp-tail").innerText = Experiment.bodyParts.tail.hp;

    // Обновляем спрайт головы
    document.getElementById("img-head").src = Experiment.bodyParts.head.sprite;
    
    // ЖЕСТКАЯ ФИКСАЦИЯ ГЛАЗА: Меняем картинку, но принудительно держим ровные координаты
    let eyeImg = document.getElementById("img-eye");
    eyeImg.src = Experiment.bodyParts.eye.sprite;
    eyeImg.style.position = "absolute";
    eyeImg.style.transform = "none";
    eyeImg.style.top = "50px";       // Идеальная высота по вертикали
    eyeImg.style.left = "161px";     // Идеальное положение по горизонтали
    eyeImg.style.width = "45px";     // Аккуратный родной размер зрачка
    eyeImg.style.height = "45px";
    eyeImg.style.zIndex = "11";
    eyeImg.style.objectFit = "contain";
    eyeImg.style.imageRendering = "pixelated";

    // Вывод статуса перелома ноги
    document.getElementById("lbl-crus").innerText = Experiment.bodyParts.crus.isBroken ? "(ПЕРЕЛОМ)" : "";
    document.getElementById("lbl-crus").className = Experiment.bodyParts.crus.isBroken ? "status-crit" : "";

    // Подсчет общего статуса кровотечения
    let bleeding = Experiment.bodyParts.head.isBleeding || Experiment.bodyParts.crus.isBleeding || Experiment.bodyParts.tail.isBleeding;
    let bleedLabel = document.getElementById("bleed-status");
    bleedLabel.innerText = bleeding ? "АКТИВНО" : "НЕТ";
    bleedLabel.className = bleeding ? "status-crit" : "status-ok";

    // Проверка чипа в голове подопытного
    let sanityLabel = document.getElementById("sanity-status");
    if (Experiment.bodyParts.head.hp < 35 && Experiment.isAlive) {
        sanityLabel.innerText = "ЧИП КОРОТИТ (ГЛЮКИ)";
        sanityLabel.className = "status-warn";
    } else if (!Experiment.isAlive) {
        sanityLabel.innerText = "СВЯЗЬ ПОТЕРЯНА";
        sanityLabel.className = "status-crit";
    } else {
        sanityLabel.innerText = "СТАБИЛЬНО";
        sanityLabel.className = "status-ok";
    }

    // Главный статус системы жизнеобеспечения
    let globalStatus = document.getElementById("global-status");
    if (!Experiment.isAlive) {
        globalStatus.innerText = "ЭКСПЕРИМЕНТ УНИЧТОЖЕН";
        globalStatus.className = "status-crit";
    } else if (bleeding) {
        globalStatus.innerText = "КРИТИЧЕСКОЕ СОСТОЯНИЕ: ПОТЕРЯ КРОВИ";
        globalStatus.className = "status-warn";
    } else {
        globalStatus.innerText = "ПОДОПЫТНЫЙ СТАБИЛЕН";
        globalStatus.className = "status-ok";
    }
}

// Функции для работы кнопок клика на сайте
function dealDamage(part, amount) {
    Experiment.receiveDamage(part, amount);
    updateUI();
}

function heal(part, amount) {
    Experiment.healPart(part, amount);
    updateUI();
}

// Стартовый запуск интерфейса при открытии страницы
updateUI();
