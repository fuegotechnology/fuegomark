// mark.js — Advanced Fuego Mark Editor
// Author: Fuego Technology

// ------------------------------
// Initialization & Variables
// ------------------------------
const editor = document.getElementById("editor");
const status = document.getElementById("status");
const commandPalette = document.getElementById("commandPalette");
const cmdTrigger = document.getElementById("cmdTrigger");
const floatingToolbar = document.getElementById("floatingToolbar");

const STORAGE_KEY = "fuego-mark-doc";

let timeout; // For autosave
let isFocusMode = false;

// ------------------------------
// Load saved document (local-first)
// ------------------------------
editor.innerHTML = localStorage.getItem(STORAGE_KEY) || editor.innerHTML;

// ------------------------------
// Helpers
// ------------------------------
function saveDocument() {
  localStorage.setItem(STORAGE_KEY, editor.innerHTML);
  status.textContent = "Saved";
}

function showStatus(msg) {
  status.textContent = msg;
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    status.textContent = "Saved";
  }, 1000);
}

// ------------------------------
// Autosave
// ------------------------------
editor.addEventListener("input", () => {
  showStatus("Saving...");
  saveDocument();
});

// ------------------------------
// Focus Mode
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
// Floating Toolbar Logic
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

// Apply formatting from toolbar buttons
floatingToolbar.addEventListener("click", (e) => {
  const cmd = e.target.dataset.command;
  if (!cmd) return;

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
    default:
      break;
  }

  updateFloatingToolbar();
});

// ------------------------------
// Command Palette Logic
// ------------------------------
function toggleCommandPalette(show = null) {
  const isVisible = commandPalette.classList.contains("visible");
  if (show === null) show = !isVisible;
  commandPalette.classList.toggle("visible", show);
}

// Show palette on ⌘ / Ctrl+K
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    toggleCommandPalette();
  }
});

// Select command from palette
commandPalette.addEventListener("click", (e) => {
  if (e.target.tagName !== "LI") return;
  const action = e.target.dataset.action;

  switch (action) {
    case "heading":
      document.execCommand("formatBlock", false, "h1");
      break;
    case "bold":
      document.execCommand("bold");
      break;
    case "italic":
      document.execCommand("italic");
      break;
    case "blockquote":
      document.execCommand("formatBlock", false, "blockquote");
      break;
    case "code":
      document.execCommand("formatBlock", false, "pre");
      break;
    default:
      break;
  }

  toggleCommandPalette(false);
});

// ------------------------------
// Block-Level Enhancements
// ------------------------------
function wrapBlocks() {
  const nodes = Array.from(editor.childNodes);
  nodes.forEach((node) => {
    if (!node.classList || !node.classList.contains("editor-block")) {
      node.classList.add("editor-block");
    }
  });
}

// Initial wrapping
wrapBlocks();

// Wrap new nodes dynamically
editor.addEventListener("input", wrapBlocks);

// ------------------------------
// Keyboard Shortcuts
// ------------------------------
editor.addEventListener("keydown", (e) => {
  // Ctrl+B = Bold
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
    e.preventDefault();
    document.execCommand("bold");
  }

  // Ctrl+I = Italic
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
    e.preventDefault();
    document.execCommand("italic");
  }

  // Ctrl+Enter = New Paragraph
  if (e.key === "Enter" && !e.shiftKey) {
    const br = document.createElement("p");
    br.innerHTML = "<br>";
    const range = window.getSelection().getRangeAt(0);
    range.insertNode(br);
    range.setStartAfter(br);
    e.preventDefault();
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
  updateFloatingToolbar();
});
