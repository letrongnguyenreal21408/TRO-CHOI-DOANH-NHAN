document.addEventListener("DOMContentLoaded", function () {
  let balance = 10000000;
  let userChoice = null;
  let revealAllowed = false;
  let countdownInterval = null;

  const clickSound = document.getElementById("click-sound");
  const timeoutSound = document.getElementById("timeout-sound");
  const btnTai = document.getElementById("btn-tai");
  const btnXiu = document.getElementById("btn-xiu");
  const betButton = document.querySelector(".bet-btn");
  const betInput = document.getElementById("bet-amount");
  const cover = document.getElementById("cover");

  const predictBtn = document.getElementById("predict-btn");
  const allBtn = document.getElementById("all-btn");
  const predictBox = document.getElementById("predict-box");
  const taiPercentEl = document.getElementById("tai-percent");
  const xiuPercentEl = document.getElementById("xiu-percent");
  const predictResultEl = document.getElementById("predict-result");

  let predictionVisible = false;
  let prediction = null;

  predictBtn.addEventListener("click", () => {
    predictionVisible = !predictionVisible;
    predictBox.style.display = predictionVisible ? "block" : "none";
    if (predictionVisible && prediction === null) {
      generatePrediction();
    }
  });

  allBtn.addEventListener("click", () => {
    betInput.value = formatCurrency(balance);
    validateInput();
  });

  function generatePrediction() {
    let tai = Math.floor(Math.random() * 100);
    let xiu = 100 - tai;
    prediction = tai > xiu ? "tai" : "xiu";

    taiPercentEl.textContent = tai + "%";
    xiuPercentEl.textContent = xiu + "%";
    predictResultEl.textContent = "Dự đoán: " + prediction.toUpperCase();
  }

  btnTai.addEventListener("click", () => choose("tai"));
  btnXiu.addEventListener("click", () => choose("xiu"));
  betButton.addEventListener("click", playGame);

  betInput.addEventListener("input", function () {
    let raw = betInput.value.replace(/\D/g, "");
    if (raw.length > 0) {
      let number = parseInt(raw);
      betInput.value = formatCurrency(number);
    } else {
      betInput.value = "";
    }
    validateInput();
  });

  function choose(choice) {
    userChoice = choice;
    btnTai.classList.remove("active");
    btnXiu.classList.remove("active");
    document.getElementById("btn-" + choice).classList.add("active");
    validateInput();
  }

  function updateBalance() {
    document.getElementById("balance").textContent =
      "Số tiền: " + balance.toLocaleString("vi-VN") + " VND";
  }

  function validateInput() {
    const value = parseInt(betInput.value.replace(/\D/g, ""));
    if (!userChoice || isNaN(value) || value <= 0 || value > balance) {
      betButton.disabled = true;
    } else {
      betButton.disabled = false;
    }
  }

  function formatCurrency(value) {
    return value.toLocaleString("vi-VN");
  }

  function renderDots(diceEl, value) {
    const dotMap = {
      1: [4], 2: [0, 8], 3: [0, 4, 8],
      4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
    };
    diceEl.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const dot = document.createElement("div");
      if (dotMap[value].includes(i)) dot.className = "dot";
      diceEl.appendChild(dot);
    }
  }

  function playGame() {
    clickSound.play();
    const errorDiv = document.getElementById("error");
    const resultBox = document.getElementById("result-box");
    const diceEls = [
      document.getElementById("dice1"),
      document.getElementById("dice2"),
      document.getElementById("dice3"),
    ];

    let betAmount = parseInt(betInput.value.replace(/\D/g, ""));
    errorDiv.textContent = "";
    resultBox.style.display = "none";
    cover.style.display = "none";
    revealAllowed = false;

    cover.style.display = "block";
    cover.style.left = "50%";
    cover.style.top = "50%";
    cover.style.transform = "translate(-50%, -50%)";
    revealAllowed = true;

    diceEls.forEach((die) => {
      die.classList.add("animate");
      setTimeout(() => die.classList.remove("animate"), 600);
    });

    // Tạo xúc xắc khớp với dự đoán
    let diceValues = [];
    let total = 0;
    do {
      diceValues = [];
      total = 0;
      for (let i = 0; i < 3; i++) {
        const value = Math.floor(Math.random() * 6) + 1;
        diceValues.push(value);
        total += value;
      }
    } while (
      (prediction === "tai" && total < 11) ||
      (prediction === "xiu" && total > 10)
    );

    for (let i = 0; i < 3; i++) {
      renderDots(diceEls[i], diceValues[i]);
    }

    const result = total >= 11 ? "tai" : "xiu";

    function revealResult() {
      const diceArea = document.getElementById("dice-area").getBoundingClientRect();
      const coverBox = cover.getBoundingClientRect();

      const outside =
        coverBox.bottom < diceArea.top ||
        coverBox.top > diceArea.bottom ||
        coverBox.right < diceArea.left ||
        coverBox.left > diceArea.right;

      if (outside && revealAllowed) {
        resultBox.textContent = result === "tai" ? "TÀI" : "XỈU";
        resultBox.className = "result-box " + result;
        resultBox.style.display = "block";

        if (userChoice === result) balance += betAmount * 2;
        else balance -= betAmount;

        updateBalance();
        validateInput();
        revealAllowed = false;
        cover.style.display = "none";

        // Reset lại dự đoán sau mỗi lượt
        generatePrediction();
        prediction = null;

        startCountdown();
      }
    }

    // Kéo chuột
    let offsetX = 0, offsetY = 0;
    cover.onmousedown = function (e) {
      if (!revealAllowed) return;
      offsetX = e.clientX - cover.offsetLeft;
      offsetY = e.clientY - cover.offsetTop;

      document.onmousemove = function (e) {
        cover.style.left = e.clientX - offsetX + "px";
        cover.style.top = e.clientY - offsetY + "px";
        revealResult();
      };
      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };

    // Kéo cảm ứng
    cover.ontouchstart = function (e) {
      if (!revealAllowed) return;
      offsetX = e.touches[0].clientX - cover.offsetLeft;
      offsetY = e.touches[0].clientY - cover.offsetTop;

      document.ontouchmove = function (e) {
        cover.style.left = e.touches[0].clientX - offsetX + "px";
        cover.style.top = e.touches[0].clientY - offsetY + "px";
        revealResult();
      };
      document.ontouchend = function () {
        document.ontouchmove = null;
        document.ontouchend = null;
      };
    };
  }

  function startCountdown() {
    const countdownEl = document.getElementById("countdown");
    clearInterval(countdownInterval);

    let timeLeft = 20;

    function updateDisplay() {
      const sec = String(timeLeft % 60).padStart(2, '0');
      const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      countdownEl.textContent = `00:${min}:${sec}`;
    }

    updateDisplay();

    countdownInterval = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft === 11) {
        try {
          timeoutSound.currentTime = 0;
          timeoutSound.play().catch(err => {
            console.warn("Trình duyệt chặn âm thanh:", err.message);
          });
        } catch (e) {
          console.warn("Không thể phát âm thanh:", e.message);
        }
      }

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }

  updateBalance();
  validateInput();
  startCountdown();
});