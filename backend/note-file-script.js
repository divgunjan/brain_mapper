// --- State ---
let notes = [];
let currentNoteId = null;
let graphNodes = [];
let graphLinks = [];
let canvas, ctx;
let isDragging = false;
let draggedNode = null;

// --- Simulated Dictionary ---
const commonWords = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "brain", "mapper", "note", "title", "graph", "link", "code", "html", "css", "javascript", "js", "web", "dev", "app", "data", "is", "are", "was", "were", "been", "has", "had", "create", "edit", "delete", "view", "idea", "project", "start", "typing"
]);

function init() {
    canvas = document.getElementById('graph-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    renderNotesList();
}

// --- Note Operations ---
function createNewNote() {
    const note = {
        id: Date.now(),
        title: 'Untitled',
        content: '',
        links: []
    };
    notes.push(note);
    openNote(note.id);
}

function renderNotesList() {
    const list = document.getElementById('notesList');
    list.innerHTML = notes.map(note => `
        <div class="note-item ${note.id === currentNoteId ? 'active' : ''}" onclick="openNote(${note.id})">
            ${note.title || 'Untitled'}
        </div>
    `).join('');
}

function openNote(id) {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    if (note) {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('noteContent').style.display = 'block';
        document.getElementById('backdrop').style.display = 'block';

        document.getElementById('noteTitle').value = note.title;
        const textarea = document.getElementById('noteContent');
        textarea.value = note.content;

        renderNotesList();
        switchView('editor');

        // Trigger spellcheck and scroll sync
        textarea.focus();
        checkSpelling();
        handleScroll();
    }
}

function updateNoteTitle() {
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
        note.title = document.getElementById('noteTitle').value || 'Untitled';
        renderNotesList();
    }
}

// --- Editor & Spellcheck ---
function handleInput() {
    const textarea = document.getElementById('noteContent');
    const note = notes.find(n => n.id === currentNoteId);

    if (note) {
        note.content = textarea.value;
        extractLinks(note);
    }

    checkSpelling();
    checkForLinkTrigger(textarea);
}

function handleScroll() {
    const textarea = document.getElementById('noteContent');
    const backdrop = document.getElementById('backdrop');
    backdrop.scrollTop = textarea.scrollTop;
    backdrop.scrollLeft = textarea.scrollLeft;
}

function checkSpelling() {
    const textarea = document.getElementById('noteContent');
    const highlights = document.getElementById('highlights');
    let text = textarea.value;

    // HTML Escape to prevent XSS in the backdrop
    text = text.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Regex to find words and check against dictionary
    const processedText = text.replace(/\b([a-zA-Z]{2,})\b/g, (match) => {
        const lower = match.toLowerCase();
        // If it's a known word OR matches a note title, it's valid
        const isTitle = notes.some(n => n.title.toLowerCase().includes(lower));
        if (commonWords.has(lower) || isTitle) {
            return match;
        } else {
            return `<span class="misspelled">${match}</span>`;
        }
    });

    // Replace newlines with <br> and add trailing space for cursor alignment
    highlights.innerHTML = processedText.replace(/\n/g, '<br>') + '<br>&nbsp;';
}

// --- Link Features ---
function extractLinks(note) {
    const regex = /\[\[(.*?)\]\]/g;
    const matches = [...note.content.matchAll(regex)];
    note.links = matches.map(m => m[1]);
}

function checkForLinkTrigger(textarea) {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const lastChars = text.substring(Math.max(0, cursorPos - 2), cursorPos);

    if (lastChars === '[[') {
        showLinkSuggestions(textarea);
    } else {
        hideLinkSuggestions();
    }
}

function showLinkSuggestions(textarea) {
    const suggestion = document.getElementById('linkSuggestion');

    // Simple logic: exclude current note
    const availableNotes = notes.filter(n => n.id !== currentNoteId);

    if (availableNotes.length === 0) {
        suggestion.style.display = 'none';
        return;
    }

    suggestion.innerHTML = availableNotes
        .map(n => `<div class="link-item" onclick="insertLink('${n.title.replace(/'/g, "\\\'")}')">${n.title}</div>`)
        .join('');

    // Basic Positioning near cursor (simplified for demo)
    // Ideally use getBoundingClientRect of a dummy element at cursor pos
    const rect = textarea.getBoundingClientRect();
    suggestion.style.left = (rect.left + 40) + 'px';
    suggestion.style.top = (rect.top + 80) + 'px';
    suggestion.classList.add('active');
}

function hideLinkSuggestions() {
    document.getElementById('linkSuggestion').classList.remove('active');
}

function insertLink(title) {
    const textarea = document.getElementById('noteContent');
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    const beforeCursor = text.substring(0, cursorPos);
    const afterCursor = text.substring(cursorPos);
    const lastBrackets = beforeCursor.lastIndexOf('[[');

    if (lastBrackets !== -1) {
        textarea.value = text.substring(0, lastBrackets) + '[[' + title + ']]' + afterCursor;
        const newPos = lastBrackets + title.length + 4;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
    }

    hideLinkSuggestions();
    handleInput();
}

// --- UI & View Switch ---
function switchView(view) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    const buttons = document.querySelectorAll('.view-btn');

    if (view === 'editor') {
        buttons[0].classList.add('active');
        document.getElementById('editorView').style.display = 'block';
        document.getElementById('graphView').classList.remove('active');
    } else {
        buttons[1].classList.add('active');
        document.getElementById('editorView').style.display = 'none';
        document.getElementById('graphView').classList.add('active');
        setTimeout(() => {
            resizeCanvas();
            updateGraph();
            animateGraph();
        }, 50);
    }
}

// --- Graph Visualization ---
function resizeCanvas() {
    const container = canvas.parentElement;
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

function updateGraph() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (graphNodes.length !== notes.length) {
        graphNodes = notes.map((note, index) => {
            const angle = (index / notes.length) * Math.PI * 2;
            return {
                id: note.id,
                title: note.title,
                x: centerX + Math.cos(angle) * 100,
                y: centerY + Math.sin(angle) * 100,
                vx: 0, vy: 0, radius: 25
            };
        });
    }

    graphLinks = [];
    notes.forEach(note => {
        note.links.forEach(linkTitle => {
            const target = notes.find(n => n.title === linkTitle);
            if (target) {
                graphLinks.push({ source: note.id, target: target.id });
            }
        });
    });

    document.getElementById('nodeCount').textContent = graphNodes.length;
    document.getElementById('linkCount').textContent = graphLinks.length;
}

function animateGraph() {
    if (!document.getElementById('graphView').classList.contains('active')) return;

    // Physics (Repulsion & Attraction)
    const k = 100; // ideal spring length

    // Repulsion
    for (let i = 0; i < graphNodes.length; i++) {
        for (let j = i + 1; j < graphNodes.length; j++) {
            const n1 = graphNodes[i];
            const n2 = graphNodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 5000 / (d * d); // Coulomb's lawish
            const fx = (dx / d) * force;
            const fy = (dy / d) * force;
            n1.vx -= fx; n1.vy -= fy;
            n2.vx += fx; n2.vy += fy;
        }
    }

    // Spring (Links)
    graphLinks.forEach(link => {
        const s = graphNodes.find(n => n.id === link.source);
        const t = graphNodes.find(n => n.id === link.target);
        if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (d - k) * 0.05;
            const fx = (dx / d) * force;
            const fy = (dy / d) * force;
            s.vx += fx; s.vy += fy;
            t.vx -= fx; t.vy -= fy;
        }
    });

    // Center Gravity & Update
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    graphNodes.forEach(node => {
        // Gravity to center
        node.vx += (cx - node.x) * 0.005;
        node.vy += (cy - node.y) * 0.005;

        // Friction
        node.vx *= 0.9;
        node.vy *= 0.9;

        // Move
        if (!isDragging || draggedNode !== node) {
            node.x += node.vx;
            node.y += node.vy;
        }
    });

    drawGraph();
    requestAnimationFrame(animateGraph);
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Links
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
    graphLinks.forEach(link => {
        const s = graphNodes.find(n => n.id === link.source);
        const t = graphNodes.find(n => n.id === link.target);
        if (s && t) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(t.x, t.y);
            ctx.stroke();
        }
    });

    // Draw Nodes
    graphNodes.forEach(node => {
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '12px sans-serif';
        ctx.fillText(node.title.substr(0, 10), node.x, node.y);
    });
}

// --- Graph Interaction ---
function onMouseDown(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    draggedNode = graphNodes.find(n => Math.hypot(n.x - x, n.y - y) < n.radius);
    if (draggedNode) isDragging = true;
}
function onMouseMove(e) {
    if (isDragging && draggedNode) {
        const r = canvas.getBoundingClientRect();
        draggedNode.x = e.clientX - r.left;
        draggedNode.y = e.clientY - r.top;
    }
}
function onMouseUp() {
    if (isDragging && draggedNode && !movedSignificantly()) {
        // Click event (open note) could go here
        openNote(draggedNode.id);
        switchView('editor');
    }
    isDragging = false;
    draggedNode = null;
}
function movedSignificantly() { return false; /* simplify for demo */ }


// --- Chat Bot ---
function toggleChat() {
    document.getElementById('aiChatWindow').classList.toggle('active');
}
function handleChatKey(e) { if (e.key === 'Enter') sendMessage(); }
function sendMessage() {
    const input = document.getElementById('chatInput');
    const txt = input.value.trim();
    if (!txt) return;

    const chat = document.getElementById('chatMessages');
    chat.innerHTML += `<div class="message user">${txt}</div>`;
    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    // Show loading indicator
    const loadingId = 'loading-' + Date.now();
    chat.innerHTML += `<div class="message bot" id="${loadingId}">Typing...</div>`;
    chat.scrollTop = chat.scrollHeight;

    // Call AI asynchronously
    generateAI(txt).then(response => {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        chat.innerHTML += `<div class="message bot">${response}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }).catch(err => {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        chat.innerHTML += `<div class="message bot error">Error: ${err.message}</div>`;
    });
}

async function generateAI(query) {
    try {
        // Dynamic import for browser environment
        const { GoogleGenerativeAI } = await import("https://esm.run/@google/generative-ai");

        // KEY FECTHED FROM env.js (Loaded in HTML)
        const API_KEY = window.ENV ? window.ENV.API_KEY : '';

        if (!API_KEY) throw new Error("API Key not found in env.js");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(query);
        const response = await result.response;
        let text = response.text();

        // Simple markdown cleanup if needed
        text = text.replace(/\*\*/g, '').replace(/\*/g, '');

        return text;
    } catch (error) {
        console.error("AI Error:", error);
        return "I encountered an error connecting to the AI. Please try again.";
    }
}

init();