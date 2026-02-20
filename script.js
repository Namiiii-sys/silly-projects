/* ---------------------
   GLOBAL VARIABLES
--------------------- */

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let currentQuote = null;

const backupQuotes = [
    { content: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { content: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" }
];

/* ---------------------
    INITIAL LOAD
--------------------- */

window.onload = () => {
    loadRandomQuote();
    renderNotes();
};

/* ---------------------
    QUOTE FUNCTIONS
--------------------- */

// Fetch random quote
async function loadRandomQuote() {
    toggleQuoteLoading(true);

    try {
        const res = await fetch("https://api.quotable.io/random");
        if (!res.ok) throw new Error("API failed");

        const data = await res.json();
        currentQuote = data;
        showQuote(data);

    } catch (error) {
        const backup = backupQuotes[Math.floor(Math.random() * backupQuotes.length)];
        currentQuote = backup;
        showQuote(backup);
    }
}

// Fetch quote by category
async function loadQuoteByTag(tag) {
    toggleQuoteLoading(true);

    try {
        const res = await fetch(`https://api.quotable.io/random?tags=${tag}`);
        const data = await res.json();
        currentQuote = data;
        showQuote(data);

    } catch {
        loadRandomQuote();
    }
}

// Display quote
function showQuote(data) {
    document.getElementById("quoteText").textContent = `"${data.content}"`;
    document.getElementById("quoteAuthor").textContent = `— ${data.author}`;
    toggleQuoteLoading(false);
}

// Toggle loading state
function toggleQuoteLoading(show) {
    document.getElementById("quoteLoading").classList.toggle("hidden", !show);
    document.getElementById("quoteContent").classList.toggle("hidden", show);
}

/* ---------------------
    NOTE FUNCTIONS
--------------------- */

// Add note
function addNote() {
    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();

    if (!title || !content) return alert("Please fill both fields!");

    const note = {
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleDateString(),
        color: getRandomColor()
    };

    notes.unshift(note);
    saveNotes();
    renderNotes();
    clearForm();
}

// Save to localStorage
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// Render all notes
function renderNotes() {
    const container = document.getElementById("notesList");
    const count = document.getElementById("noteCount");

    count.textContent = notes.length;

    if (notes.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-white/80 py-10 text-xl">No notes yet </p>`;
        return;
    }

    container.innerHTML = notes.map(note => `
        <div class="bg-white/95 text-gray-800 p-5 rounded-xl shadow-lg border-l-4 ${note.color}">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg">${note.title}</h3>
                <button onclick="deleteNote(${note.id})" class="text-xl text-red-600">×</button>
            </div>
            <p class="mb-3 whitespace-pre-wrap">${note.content}</p>
            <p class="text-xs text-gray-500">${note.date}</p>
        </div>
    `).join("");
}

// Delete one note
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
}

// Clear all notes
function clearAllNotes() {
    if (notes.length === 0) return;
    if (!confirm("Delete ALL notes?")) return;

    notes = [];
    saveNotes();
    renderNotes();
}

// Prefill form with quote
function saveQuoteAsNote() {
    if (!currentQuote) return;

    document.getElementById("noteTitle").value = `Quote by ${currentQuote.author}`;
    document.getElementById("noteContent").value = `"${currentQuote.content}"`;
}

// Copy quote
function copyQuote() {
    navigator.clipboard.writeText(
        `"${currentQuote.content}" — ${currentQuote.author}`
    );
    alert("Quote copied!");
}

// Clear inputs
function clearForm() {
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
}

// Random pastel borders
function getRandomColor() {
    const colors = [
        "border-purple-400",
        "border-pink-400",
        "border-blue-400",
        "border-green-400",
        "border-orange-400"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/* ---------------------
    EVENT LISTENERS
--------------------- */

document.getElementById("newQuoteBtn").onclick = loadRandomQuote;
document.getElementById("copyQuoteBtn").onclick = copyQuote;
document.getElementById("saveQuoteBtn").onclick = saveQuoteAsNote;
document.getElementById("addNoteBtn").onclick = addNote;
document.getElementById("clearFormBtn").onclick = clearForm;
document.getElementById("clearAllBtn").onclick = clearAllNotes;

// Category buttons
document.querySelectorAll(".tag-btn").forEach(btn => {
    btn.onclick = () => loadQuoteByTag(btn.dataset.tag);
});
