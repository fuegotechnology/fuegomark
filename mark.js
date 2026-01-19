// mark.js — Fuego Mark Advanced v2 (Markdown + Slash Commands)
const editor = document.getElementById("editor");
const status = document.getElementById("status");
const commandPalette = document.getElementById("commandPalette");
const cmdTrigger = document.getElementById("cmdTrigger");
const floatingToolbar = document.getElementById("floatingToolbar");

const STORAGE_KEY = "fuego-mark-doc";
let timeout;
let isFocusMode = false;

// ------------------------------
// Load saved document
// ------------------------------
editor.innerHTML = localStorage.getItem(STORAGE_KEY) || editor.innerHTML;

// ------------------------------
// Autosave
// ------------------------------
function saveDocument() {
  localStorage.setItem(STORAGE_KEY, editor.innerHTML);
  showStatus("Saved");
}

function showStatus(msg) {
  status.textContent = msg;
  clearTimeout(timeout);
  timeout = setTimeout(() => (status.textContent = "Saved"), 1000);
}

editor.addEventListener("input", () => {
  showStatus("Saving...");
  parseMarkdown(editor);
  saveDocument();
});

// ------------------------------
// Focus Mode (F2)
// ------------------------------
function toggleFocusMode() {
  isFocusMode = !isFocusMode;
  editor.parentElement.classList.toggle("focus-mode", isFocusMode);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "F2") {
    e.preventDefault();
    toggleFocusMode();
  }
});

// ------------------------------
// Floating Toolbar
// ------------------------------
function updateFloatingToolbar() {
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    floatingToolbar.classList.remove("visible");
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  floatingToolbar.style.top = `${rect.top + window.scrollY - 40}px`;
  floatingToolbar.style.left = `${rect.left + window.scrollX}px`;
  floatingToolbar.classList.add("visible");
}

editor.addEventListener("mouseup", updateFloatingToolbar);
editor.addEventListener("keyup", updateFloatingToolbar);

floatingToolbar.addEventListener("click", (e) => {
  const cmd = e.target.dataset.command;
  if (!cmd) return;

  applyCommand(cmd);
  updateFloatingToolbar();
});

function applyCommand(cmd) {
  switch (cmd) {
    case "bold":
      document.execCommand("bold");
      break;
    case "italic":
      document.execCommand("italic");
      break;
    case "heading":
      document.execCommand("formatBlock", false, "h1");
      break;
    case "code":
      document.execCommand("formatBlock", false, "pre");
      break;
    case "quote":
      document.execCommand("formatBlock", false, "blockquote");
      break;
  }
}

// ------------------------------
// Command Palette
// ------------------------------
function toggleCommandPalette(show = null) {
  const isVisible = commandPalette.classList.contains("visible");
  if (show === null) show = !isVisible;
  commandPalette.classList.toggle("visible", show);
}

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    toggleCommandPalette();
  }
});

commandPalette.addEventListener("click", (e) => {
  if (e.target.tagName !== "LI") return;
  const action = e.target.dataset.action;
  applyCommand(action);
  toggleCommandPalette(false);
});

// ------------------------------
// Block Wrapping
// ------------------------------
function wrapBlocks() {
  Array.from(editor.childNodes).forEach((node) => {
    if (!node.classList || !node.classList.contains("editor-block")) {
      node.classList.add("editor-block");
    }
  });
}

wrapBlocks();
editor.addEventListener("input", wrapBlocks);

// ------------------------------
// Markdown Parser (inline & block-level)
// ------------------------------
function parseMarkdown(container) {
  const nodes = Array.from(container.childNodes);

  nodes.forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return;

    let text = node.textContent;

    // Block-level Markdown
    if (/^#\s/.test(text)) {
      const h1 = document.createElement("h1");
      h1.textContent = text.replace(/^#\s/, "");
      node.replaceWith(h1);
    } else if (/^##\s/.test(text)) {
      const h2 = document.createElement("h2");
      h2.textContent = text.replace(/^##\s/, "");
      node.replaceWith(h2);
    } else if (/^###\s/.test(text)) {
      const h3 = document.createElement("h3");
      h3.textContent = text.replace(/^###\s/, "");
      node.replaceWith(h3);
    } else if (/^>\s/.test(text)) {
      const blockquote = document.createElement("blockquote");
      blockquote.textContent = text.replace(/^>\s/, "");
      node.replaceWith(blockquote);
    } else if (/^```\s*$/.test(text)) {
      const pre = document.createElement("pre");
      pre.textContent = "";
      node.replaceWith(pre);
    } else if (text.trim() !== "") {
      const p = document.createElement("p");
      p.textContent = text;
      node.replaceWith(p);
    }
  });

  // Inline Markdown
  container.querySelectorAll("p, h1, h2, h3, blockquote").forEach((el) => {
    let html = el.innerHTML;

    // Bold **text**
    html = html.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    // Italic _text_
    html = html.replace(/_(.+?)_/g, "<i>$1</i>");
    // Inline code `code`
    html = html.replace(/`(.+?)`/g, "<code>$1</code>");

    el.innerHTML = html;
  });
}

// ------------------------------
// Slash Command Integration
// ------------------------------
editor.addEventListener("keydown", (e) => {
  const sel = window.getSelection();
  const node = sel.anchorNode;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;

  // Detect slash command at start
  const text = node.textContent;
  if (text.startsWith("/")) {
    const cmd = text.slice(1).toLowerCase();

    if (e.key === "Enter") {
      e.preventDefault();
      switch (cmd) {
        case "heading":
          document.execCommand("formatBlock", false, "h1");
          break;
        case "bold":
          document.execCommand("bold");
          break;
        case "italic":
          document.execCommand("italic");
          break;
        case "quote":
          document.execCommand("formatBlock", false, "blockquote");
          break;
        case "code":
          document.execCommand("formatBlock", false, "pre");
          break;
      }
      node.textContent = "";
    }
  }
});

// ------------------------------
// Placeholder Support
// ------------------------------
function updatePlaceholder() {
  if (!editor.innerText.trim()) {
    editor.setAttribute("data-placeholder", "Start writing your ideas here...");
  } else {
    editor.removeAttribute("data-placeholder");
  }
}

editor.addEventListener("input", updatePlaceholder);
updatePlaceholder();

// ------------------------------
// Responsive Enhancements
// ------------------------------
window.addEventListener("resize", () => {
  const event = new Event("keyup");
  editor.dispatchEvent(event);
});
