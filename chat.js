const apiKey = "sk-proj-zPocXeahxIqy5bnLjxzUT3BlbkFJkrSbemyu8OVz4TJeBbo6";
const endpoint = "https://api.openai.com/v1/chat/completions";

ai_memory = [];

let expectingStoryMessage = false;
let storyCallback = null;

const chatPanel = document.getElementById("chat-panel");
const chatMessages = document.getElementById("chat-messages");
const currentInput = document.getElementById("current-input");
const errorPanel = document.getElementById("error-panel");

let memoryModal = document.getElementById("memory-modal");
memoryModal.style.display = "none";

function displayMessage(role, text) {
  currentInput.textContent = "";

  if (role === "system") showFloatingMessage(text);

  const messageElem = document.createElement("div");
  messageElem.classList.add("message", role);
  messageElem.textContent = text;
  chatMessages.appendChild(messageElem);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
async function __sendMessageToAI(message, system) {
  let _res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  let text_res = await _res.json();
  let reply = text_res.choices[0].message.content;
  return reply;
}

function sendMessageToAI(message) {
  if (!message) return;

  messages = [
    {
      role: "system",
      content:
        'You are a programming tutor. You are also an evil AI model in a game. Keep your answers short and evil. Do not use harsh language. The user may sometimes send commands that are not correctly formatted, you just need to quickly explain why its not good and how suggest the correct command. Commands: [move("direction") -> direction: left, right, top, down), memory open, memory close, run].',
    },
  ];
  // add messages from memory
  for (const memory of ai_memory) {
    messages.push(memory);
  }

  messages.push({
    role: "user",
    content: message,
  });

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: messages,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const reply = data.choices[0].message.content;

      ai_memory.push({
        role: "assistant",
        content: reply,
      });
      displayMessage("system", reply);
    })
    .catch((error) => {
      console.error("Error:", error);
      displayMessage("system", "Error: Failed to fetch response");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const chatPanel = document.getElementById("chat-panel");
  const chatMessages = document.getElementById("chat-messages");
  const currentInput = document.getElementById("current-input");
  const errorPanel = document.getElementById("error-panel");
  let chatEnabled = true;

  displayMessage("system", "What is your name");
  expectingStoryMessage = true;
  storyCallback = (message) => {
    displayMessage("system", `Hello ${message}!`);
    document.cookie = "name=" + message;
  };

  function disableChat() {
    chatEnabled = false;
    chatPanel.classList.add("hidden");
    errorPanel.classList.remove("hidden");
  }

  function enableChat() {
    chatEnabled = true;
    chatPanel.classList.remove("hidden");
    errorPanel.classList.add("hidden");
  }

  chatPanel.addEventListener("keypress", function (e) {
    if (!chatEnabled) return;

    if (e.key === "Enter") {
      e.preventDefault();

      const message = currentInput.textContent.trim();

      if (expectingStoryMessage) {
        console.log("story");
        displayMessage("user", `> ${message}`);
        storyCallback(message);
        expectingStoryMessage = false;
        storyCallback = null;
        return;
      }

      if (message) {
        const safe_msg = message.toLowerCase();

        if (safe_msg == "run") {
          displayMessage("user", `> ${message}`);
          parseCode();
        } else if (safe_msg == "memory open") {
          displayMessage("user", `> ${message}`);
          let memoryListElement = document.getElementById("memory-list");
          let memoryList = getMemory();
          memoryListElement.innerHTML = "";
          for (const key in memoryList) {
            const memoryItem = document.createElement("li");
            memoryItem.textContent = `${key}: ${memoryList[key]}`;
            memoryListElement.appendChild(memoryItem);
          }
          memoryModal.style.display = "block";
        } else if (safe_msg == "memory close") {
          displayMessage("user", `> ${message}`);
          memoryModal.style.display = "none";
        } else if (safe_msg.startsWith("move")) {
          const direction = safe_msg.split('"')[1];

          if (
            direction === "left" ||
            direction === "right" ||
            direction === "up" ||
            direction === "down"
          ) {
            displayMessage("user", `> ${message}`);
            movePlayer(direction);
          } else {
            displayMessage("user", `> ${message}`);
            sendMessageToAI(message);
          }
        } else {
          displayMessage("user", `> ${message}`);
          sendMessageToAI(message);
        }
      }
    }
  });

  chatPanel.addEventListener("click", function () {
    if (chatEnabled) {
      currentInput.focus();
    }
  });

  currentInput.focus();
});

function getMemory() {
  return {
    "Task 1": "Completed",
    "Task 2": "Pending",
    "Task 3": "In Progress",
  };
}
