const ide = document.getElementById("ide");
const lineNumbers = document.getElementById("line-numbers");

ide.addEventListener("input", updateLineNumbers);
ide.addEventListener("scroll", syncScroll);
ide.addEventListener("keydown", handleTabKey);
ide.addEventListener("input", updateLineNumbers);
ide.addEventListener("scroll", syncScroll);

let code = "";
function updateLineNumbers() {
  const lines = ide.value.split("\n").length;
  lineNumbers.innerHTML = "";
  for (let i = 1; i <= lines; i++) {
    const lineNumber = document.createElement("div");
    lineNumber.textContent = i;
    lineNumbers.appendChild(lineNumber);
  }
}

function syncScroll() {
  lineNumbers.scrollTop = ide.scrollTop;
}

function handleTabKey(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = ide.selectionStart;
    const end = ide.selectionEnd;

    // Insert tab character at cursor position
    ide.value = ide.value.substring(0, start) + "\t" + ide.value.substring(end);
    // Move cursor to right after the inserted tab character
    ide.selectionStart = ide.selectionEnd = start + 1;
  }
}

// Initialize line numbers
updateLineNumbers();

async function parseCode() {
  code = ide.value;

  lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("//") || line === "") {
      continue;
    }

    // assignment
    if (line.includes("=")) {
      // check if there is computation
      // if (
      //   line.includes("+") ||
      //   line.includes("-") ||
      //   line.includes("*") ||
      //   line.includes("/")
      // ) {
      //   const [variable, expression] = line.split("=");
      //   eval(line);
      //   assign(variable.trim(), value);
      // } else {
      const [variable, value] = line.split("=");
      eval(line);
      assign(variable.trim(), value.trim());
      // }
    }
    // if move("direction")
    else if (line.startsWith("move")) {
      const direction = line.split('"')[1].trim();
      let result = movePlayer(direction);
    } else {
      sendMessageToAI(code + "\n" + "Pinpoint the error in the code.");
    }

    // timeout 1 second
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

function syncScroll() {
  lineNumbers.scrollTop = ide.scrollTop;
}

// Initialize line numbers
updateLineNumbers();
