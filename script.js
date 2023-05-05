const GameController = (() => {
    const model = {
      word: "",
      wordDisplay: "",
      correctGuesses: 0,
      incorrectGuesses: 0,
      maxChances: 10,
      guessedLetters: new Set(),
      timer: 60,
    };
  
    const view = {
      guessCounter: document.querySelector(".game__guess-counter"),
      wordDisplay: document.querySelector(".game__word-display"),
      letterInput: document.querySelector(".game__letter-input"),
      newGameBtn: document.querySelector(".game__new-game-btn"),
      timerDisplay: document.querySelector(".game__timer"),
      guessHistory: document.querySelector(".game__guess-history"),
    };

    function updateTimerDisplay() {
        view.timerDisplay.textContent = model.timer;
      }
    
      function addToGuessHistory(letter, isCorrect) {
        const li = document.createElement("li");
        li.textContent = letter;
        li.classList.add("game__guess-history-item");
        li.classList.add(isCorrect ? "correct-guess" : "incorrect-guess");
        view.guessHistory.appendChild(li);
      }
    
      function clearGuessHistory() {
        view.guessHistory.innerHTML = "";
      }
      
      let timerInterval;
      function startTimer() {
        clearInterval(timerInterval);
        model.timer = 60;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
          model.timer--;
          updateTimerDisplay();
          if (model.timer === 0 || model.incorrectGuesses === model.maxChances) {
            clearInterval(timerInterval);
            alert(`Time's up! You have guessed ${model.correctGuesses} words!`);
            initializeGame();
          }
        }, 1000);
      }
  
    async function getRandomWord() {
      try {
        const response = await fetch("https://random-word-api.herokuapp.com/word");
        const [word] = await response.json();
        return word;
      } catch (error) {
        console.error("Error fetching random word:", error);
        const words = [ 
            "ballot",
            "soil",
            "legislation",
            "valley",
            "country",
            "nail",
            "piano",
            "speech",
            "efflux",
            "reason",
            "alcohol",
            "stable",
            "slice",
            "situation",
            "profession",
            "restaurant",
            "pocket",
            "satisfaction",
            "condition",
            "comfortable"
        ];
        return words[Math.floor(Math.random() * words.length)];
      }
    }
  
    function concealLetters(word) {
        const concealedCount = Math.floor(Math.random() * (word.length + 1));
        const concealedPositions = new Set();
      
        while (concealedPositions.size < concealedCount) {
          concealedPositions.add(Math.floor(Math.random() * word.length));
        }
      
        let wordDisplay = "";
        for (let i = 0; i < word.length; i++) {
          if (concealedPositions.has(i)) {
            wordDisplay += "_";
          } else {
            wordDisplay += word[i];
          }
        }
      
        return wordDisplay;
      }
      
  
    function revealLetter(letter) {
      let revealed = false;
      let updatedDisplay = "";
  
      for (let i = 0; i < model.word.length; i++) {
        if (model.word[i].toLowerCase() === letter.toLowerCase() && model.wordDisplay[i] === "_") {
          updatedDisplay += model.word[i];
          revealed = true;
        } else {
          updatedDisplay += model.wordDisplay[i];
        }
      }
  
      if (revealed) {
        model.wordDisplay = updatedDisplay;
      }
  
      return revealed;
    }
  
    function updateGuessCounter() {
      view.guessCounter.textContent = `${model.incorrectGuesses} / ${model.maxChances}`;
    }

    function updateWordDisplay() {
        let display = "";
        for (let i = 0; i < model.word.length; i++) {
            const letter = model.word[i];
            const revealed = model.wordDisplay[i] !== "_";
            display += `<span style="margin-right: 5px">${revealed ? letter : "_"}</span>`;
          }
        view.wordDisplay.innerHTML = display;
        //view.wordDisplay.textContent = model.wordDisplay;
        //view.wordDisplay.innerHTML = display;
    }
  
    async function initializeGame() {
      model.word = await getRandomWord();
      model.wordDisplay = concealLetters(model.word);
      model.correctGuesses = 0;
      model.incorrectGuesses = 0;
      model.guessedLetters.clear();

      const numLettersToHide = Math.floor(Math.random() * (model.word.length - 1)) + 1;

      for (let i = 0; i < model.word.length; i++) {
        if (i < numLettersToHide) {
        model.wordDisplay += "_";
        } else {
        model.wordDisplay += model.word[i];
        }
    }


  
      updateGuessCounter();
      updateWordDisplay();
      view.letterInput.value = "";
  
      //console.log("Random word:", model.word);
      //console.log("Concealed word:", model.wordDisplay);
    }

    view.letterInput.addEventListener("keypress", async (event) => {
        if (event.key === "Enter") {
        const letter = view.letterInput.value;

        if (!model.guessedLetters.has(letter.toLowerCase())) {
            model.guessedLetters.add(letter.toLowerCase());

            if (model.word.includes(letter)) {
            let updatedWordDisplay = "";
            for (let i = 0; i < model.word.length; i++) {
                if (model.word[i] === letter || model.wordDisplay[i] !== "_") {
                updatedWordDisplay += model.word[i];
                } else {
                updatedWordDisplay += "_";
                }
            }
            model.wordDisplay = updatedWordDisplay;
            updateWordDisplay();
            addToGuessHistory(letter, true);

            if (model.wordDisplay === model.word) {
                model.correctGuesses++;
                await initializeGame();
            }
            } else {
            model.incorrectGuesses++;
            updateGuessCounter();
            addToGuessHistory(letter, false);

            if (model.incorrectGuesses === model.maxChances) {
                alert(`Game over! You have guessed ${model.correctGuesses} words!`);
                await initializeGame();
            }
            }
        } else {
            alert("You have already guessed this letter!");
        }

        view.letterInput.value = "";
        }
    });
    

    view.newGameBtn.addEventListener("click", async () => {
        await initializeGame();
        clearGuessHistory();
        startTimer();
    });

    (async () => {
        await initializeGame();
        startTimer();
    })();
    })();


    
  

  