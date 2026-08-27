
    /* ==========================================
   COOKWITHME CHATBOT
========================================== */

const chatLauncher =
  document.getElementById("chatLauncher");

const chatbot =
  document.getElementById("chatbot");

const closeChat =
  document.getElementById("closeChat");

const clearChat =
  document.getElementById("clearChat");

const chatBody =
  document.getElementById("chatBody");

const messageInput =
  document.getElementById("messageInput");

const sendButton =
  document.getElementById("sendButton");

const voiceButton =
  document.getElementById("voiceButton");


/* ==========================================
   RECIPE DATABASE
========================================== */

const recipes = [

  {
    name: "Tomato Rice",
    emoji: "🍅",
    time: "25 min",
    difficulty: "Easy",
    ingredients: [
      "rice",
      "tomato",
      "onion"
    ]
  },

  {
    name: "Egg Fried Rice",
    emoji: "🍳",
    time: "20 min",
    difficulty: "Easy",
    ingredients: [
      "rice",
      "egg",
      "onion"
    ]
  },

  {
    name: "Onion Rice",
    emoji: "🧅",
    time: "20 min",
    difficulty: "Easy",
    ingredients: [
      "rice",
      "onion"
    ]
  },

  {
    name: "Tomato Egg Rice",
    emoji: "🍅",
    time: "25 min",
    difficulty: "Easy",
    ingredients: [
      "rice",
      "tomato",
      "egg"
    ]
  },

  {
    name: "Egg Tomato Curry",
    emoji: "🥚",
    time: "30 min",
    difficulty: "Medium",
    ingredients: [
      "egg",
      "tomato",
      "onion"
    ]
  },

  {
    name: "Masala Omelette",
    emoji: "🍳",
    time: "12 min",
    difficulty: "Easy",
    ingredients: [
      "egg",
      "onion",
      "tomato"
    ]
  },

  {
    name: "Tomato Onion Salad",
    emoji: "🥗",
    time: "10 min",
    difficulty: "Easy",
    ingredients: [
      "tomato",
      "onion"
    ]
  }

];


/* ==========================================
   INGREDIENT DICTIONARY
========================================== */

const ingredientDictionary = [

  "rice",
  "tomato",
  "onion",
  "egg",
  "potato",
  "carrot",
  "beans",
  "peas",
  "chicken",
  "paneer",
  "milk",
  "bread",
  "garlic",
  "ginger",
  "cheese",
  "capsicum",
  "spinach",
  "corn",
  "dal",
  "lentils"

];


/* ==========================================
   WELCOME
========================================== */

function showWelcome() {

  chatBody.innerHTML = "";

  addBotMessage(`
    <div class="welcome-icon">
      👋
    </div>

    <strong>
      Hi! I'm your CookWithMe assistant.
    </strong>

    <br><br>

    Tell me what ingredients you have
    and I'll find recipes you can make.
  `);

  setTimeout(() => {

    addBotMessage(`
      For example:<br>

      <strong>
        “I have rice, tomato, onion and egg.”
      </strong>
    `);

  }, 450);

}


/* ==========================================
   OPEN CHAT
========================================== */

function openChat() {

  chatbot.classList.add("open");

  chatLauncher.classList.add("hidden");

  messageInput.focus();

}

chatLauncher.addEventListener(
  "click",
  openChat
);


/* ==========================================
   CLOSE CHAT
========================================== */

function closeChatWindow() {

  chatbot.classList.remove("open");

  chatLauncher.classList.remove("hidden");

}

closeChat.addEventListener(
  "click",
  closeChatWindow
);


/* ==========================================
   CLEAR CHAT
========================================== */

clearChat.addEventListener(
  "click",
  showWelcome
);


/* ==========================================
   BOT MESSAGE
========================================== */

function addBotMessage(html) {

  const row =
    document.createElement("div");

  row.className = "message-row";

  row.innerHTML = `
    <div class="message bot">
      ${html}
    </div>
  `;

  chatBody.appendChild(row);

  scrollToBottom();

}


/* ==========================================
   USER MESSAGE
========================================== */

function addUserMessage(text) {

  const row =
    document.createElement("div");

  row.className =
    "message-row user";

  row.innerHTML = `
    <div class="message user">
      ${escapeHTML(text)}
    </div>
  `;

  chatBody.appendChild(row);

  scrollToBottom();

}


/* ==========================================
   TYPING
========================================== */

function showTyping() {

  const row =
    document.createElement("div");

  row.className =
    "typing-row";

  row.id =
    "typingIndicator";

  row.innerHTML = `
    <div class="typing">

      <span></span>
      <span></span>
      <span></span>

    </div>
  `;

  chatBody.appendChild(row);

  scrollToBottom();

}


function removeTyping() {

  const typing =
    document.getElementById(
      "typingIndicator"
    );

  if (typing) {
    typing.remove();
  }

}


/* ==========================================
   INGREDIENT EXTRACTION
========================================== */

function extractIngredients(text) {

  const normalized =
    text
      .toLowerCase()
      .replace(/[.,!?]/g, " ");

  const found = [];

  ingredientDictionary.forEach(
    ingredient => {

      if (
        normalized.includes(ingredient) &&
        !found.includes(ingredient)
      ) {

        found.push(ingredient);

      }

    }
  );

  return found;

}


/* ==========================================
   FIND RECIPES
========================================== */

function findRecipes(ingredients) {

  if (!ingredients.length) {
    return [];
  }

  return recipes

    .map(recipe => {

      const matched =
        recipe.ingredients.filter(
          ingredient =>
            ingredients.includes(ingredient)
        );

      const score =
        matched.length /
        recipe.ingredients.length;

      return {
        ...recipe,
        matched,
        score
      };

    })

    .filter(recipe =>
      recipe.score >= 0.66
    )

    .sort((a, b) =>
      b.score - a.score
    )

    .slice(0, 4);

}


/* ==========================================
   RECIPE CARDS
========================================== */

function recipeCardsHTML(recipeResults) {

  if (!recipeResults.length) {
    return "";
  }

  return `

    <div class="recipe-list">

      ${recipeResults.map(recipe => `

        <div class="recipe-card">

          <div class="recipe-image">
            ${recipe.emoji}
          </div>

          <div class="recipe-info">

            <div class="recipe-name">
              ${recipe.name}
            </div>

            <div class="recipe-meta">
              ⏱ ${recipe.time}
              · ⭐ ${recipe.difficulty}
            </div>

            <button
              class="recipe-button"
              onclick="viewRecipe('${recipe.name}')"
            >
              View Recipe →
            </button>

          </div>

        </div>

      `).join("")}

    </div>

  `;

}


/* ==========================================
   SEND MESSAGE
========================================== */

function sendMessage() {

  const text =
    messageInput.value.trim();

  if (!text) {
    return;
  }

  addUserMessage(text);

  messageInput.value = "";

  showTyping();

  setTimeout(() => {

    removeTyping();

    processMessage(text);

  }, 750);

}

sendButton.addEventListener(
  "click",
  sendMessage
);


/* ==========================================
   PROCESS MESSAGE
========================================== */

function processMessage(text) {

  const lower =
    text.toLowerCase();

  const ingredients =
    extractIngredients(text);


  /* Greeting */

  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("hey")
  ) {

    addBotMessage(`
      👋 Hello! Ready to cook?

      <br><br>

      Tell me your ingredients and
      I'll suggest recipes.
    `);

    return;

  }


  /* Help */

  if (
    lower.includes("help") ||
    lower.includes("how do you work")
  ) {

    addBotMessage(`
      🧑‍🍳 <strong>Here's how I work:</strong>

      <br><br>

      1. Tell me your ingredients.<br>
      2. I'll identify them.<br>
      3. I'll match recipes.<br>
      4. Choose a recipe.

      <br><br>

      Try:

      <strong>
        “I have rice, egg and onion.”
      </strong>
    `);

    return;

  }


  /* Ingredients */

  if (ingredients.length > 0) {

    const recipeResults =
      findRecipes(ingredients);

    const chips =
      ingredients
        .map(item => `
          <span class="ingredient-chip">
            ${item}
          </span>
        `)
        .join("");


    if (recipeResults.length) {

      addBotMessage(`
        😋 Great! I found:

        <div class="ingredient-list">
          ${chips}
        </div>

        <br>

        🍳 <strong>
          Recipes you can make
        </strong>

        ${recipeCardsHTML(recipeResults)}
      `);

    } else {

      addBotMessage(`
        I found:

        <div class="ingredient-list">
          ${chips}
        </div>

        <br>

        🤔 I don't have a close
        recipe match yet.

        <br><br>

        Try adding another ingredient.
      `);

    }

    return;

  }


  /* Recipe request */

  if (
    lower.includes("recipe") ||
    lower.includes("cook") ||
    lower.includes("make")
  ) {

    addBotMessage(`
      🥘 Sure!

      <br><br>

      Tell me what ingredients you have.

      <br><br>

      Example:

      <strong>
        rice, tomato, onion and egg
      </strong>
    `);

    return;

  }


  /* Default */

  addBotMessage(`
    🧑‍🍳 I'm ready to help!

    <br><br>

    Tell me ingredients such as:

    <div class="ingredient-list">

      <span class="ingredient-chip">
        Rice
      </span>

      <span class="ingredient-chip">
        Tomato
      </span>

      <span class="ingredient-chip">
        Onion
      </span>

      <span class="ingredient-chip">
        Egg
      </span>

    </div>
  `);

}


/* ==========================================
   QUICK ACTIONS
========================================== */

document
  .querySelectorAll(".quick-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const action =
          button.dataset.action;


        if (action === "find") {

          addUserMessage(
            "Find a recipe for me"
          );

          showTyping();

          setTimeout(() => {

            removeTyping();

            addBotMessage(`
              🥘 Absolutely!

              <br><br>

              Tell me what ingredients
              you have.

              <br><br>

              Example:

              <strong>
                rice, tomato, onion and egg
              </strong>
            `);

          }, 600);

        }


        if (action === "ingredients") {

          addUserMessage(
            "My ingredients"
          );

          showTyping();

          setTimeout(() => {

            removeTyping();

            addBotMessage(`
              🧂 Your ingredient list
              is currently empty.

              <br><br>

              Type something like:

              <strong>
                “I have rice, potato and onion.”
              </strong>
            `);

          }, 600);

        }


        if (action === "help") {

          addUserMessage(
            "Cooking help"
          );

          showTyping();

          setTimeout(() => {

            removeTyping();

            addBotMessage(`
              📖 I can help with:

              <br><br>

              • Recipe ideas<br>
              • Ingredient combinations<br>
              • Cooking steps<br>
              • Substitutions<br>
              • Meal ideas

              <br><br>

              What would you like to cook?
            `);

          }, 600);

        }

      }
    );

  });


/* ==========================================
   VIEW RECIPE
========================================== */

function viewRecipe(recipeName) {

  const recipe =
    recipes.find(
      item => item.name === recipeName
    );

  if (!recipe) {
    return;
  }

  addUserMessage(
    `View ${recipe.name}`
  );

  showTyping();

  setTimeout(() => {

    removeTyping();

    addBotMessage(`

      🍳 <strong>
        ${recipe.name}
      </strong>

      <br><br>

      ⏱ Cooking time:
      ${recipe.time}

      <br>

      ⭐ Difficulty:
      ${recipe.difficulty}

      <br><br>

      <strong>
        Ingredients
      </strong>

      <div class="ingredient-list">

        ${recipe.ingredients.map(
          item => `
            <span class="ingredient-chip">
              ${item}
            </span>
          `
        ).join("")}

      </div>

      <br>

      👨‍🍳 Start by preparing
      all the ingredients.

    `);

  }, 650);

}


/* ==========================================
   VOICE INPUT
========================================== */

voiceButton.addEventListener(
  "click",
  () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      addBotMessage(`
        🎤 Voice input isn't supported
        by this browser.
      `);

      return;

    }


    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    voiceButton.textContent = "🔴";

    recognition.start();


    recognition.onresult =
      event => {

        const transcript =
          event.results[0][0].transcript;

        messageInput.value =
          transcript;

        sendMessage();

      };


    recognition.onerror =
      () => {

        addBotMessage(`
          🎤 I couldn't hear that clearly.
          Please try again.
        `);

      };


    recognition.onend =
      () => {

        voiceButton.textContent =
          "🎤";

      };

  }
);


/* ==========================================
   ENTER KEY
========================================== */

messageInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      event.preventDefault();

      sendMessage();

    }

  }
);


/* ==========================================
   SCROLL
========================================== */

function scrollToBottom() {

  requestAnimationFrame(() => {

    chatBody.scrollTop =
      chatBody.scrollHeight;

  });

}


/* ==========================================
   HTML ESCAPE
========================================== */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}


/* ==========================================
   START
========================================== */

showWelcome();
  