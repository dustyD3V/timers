let timers = JSON.parse(localStorage.getItem("timers")) || [];
let intervals = {}
render()
timers.forEach(timer => {
    if (timer.running) {
        intervals[timer.id] = setInterval(() => {
            const now = Date.now();
            timer.time = Math.floor((now - timer.startTime) / 1000);

            saveTimers();

            const timeElement = document.getElementById(`timer-${timer.id}`);

            if (timeElement) {
                timeElement.textContent = formatTime(timer.time);
            }
        }, 1000);
    }
});
let nextId = timers.length > 0 ? Math.max(...timers.map(t => t.id)) + 1 : 0;

function saveTimers() {
    localStorage.setItem("timers", JSON.stringify(timers));
}

function render() {
    const app = document.getElementById("app");
    const buttons = document.getElementById("buttons");
    app.innerHTML = "";
    buttons.innerHTML = "<button class=\"material-button\" onclick=\"addTimer()\">New timer</button>";

    if (timers.length > 1) {
        buttons.innerHTML += `
            <button class="material-button" onclick="startAll()">Start all</button>
            <button class="material-button" onclick="pauseAll()">Pause all</button>
            <button class="material-button" onclick="resetAll()">Reset all</button>
            <button class="material-button danger" onclick="deleteAll()">Delete all</button>
        `;
    }

    timers.forEach(timer => {
        const div = document.createElement("div");
        div.className = "timer-card";
        const nameHTML = timer.editing
            ? `<input 
                value="${timer.name}" 
                onkeydown="handleNameKey(event, ${timer.id})"
                onblur="saveName(${timer.id}, this.value)"
                autofocus
        />`
            : `<h3 onclick="editTimer(${timer.id})">${timer.name}</h3>`;

        div.innerHTML = `
      ${nameHTML}
      <p class="timer-time" id="timer-${timer.id}">${formatTime(timer.time)}</p>
      
      <textarea maxlength="150" placeholder="comments..." oninput="updateNotes(${timer.id}, this.value)">${timer.notes}</textarea>
      <small>${timer.notes.length}/150</small>
      <button
        class="timer-toggle ${timer.running ? "running" : ""}"
        onclick="toggleTimer(${timer.id})"
      >
        <span class="timer-toggle-icon">${timer.running ? "⏸" : "▶"}</span>
        <span>${timer.running ? "Pause" : "Start"}</span>
      </button>
      <button class="material-button" onclick="editTimer(${timer.id})">Edit</button>
      <button class="material-button" onclick="resetTimer(${timer.id})">Reset</button>
      <button class="material-button danger" onclick="deleteTimer(${timer.id})">Delete</button>
    `;

        app.appendChild(div);
    });
}

function addTimer() {
    timers.push({
        id: nextId++,
        name: "Timer " + nextId,
        time: 0,
        running: false,
        startTime: null,
        notes: "",
        editing: false
    });

    saveTimers();
    render();
}

function startAll() {
    timers.forEach(timer => {
        if (!timer.running) {
            startTimer(timer.id);
        }
    });
}

function pauseAll() {
    timers.forEach(timer => {
        if (timer.running) {
            pauseTimer(timer.id);
        }
    });
}

function resetAll() {
    timers.forEach(timer => {
        resetTimer(timer.id);
    });
}

function deleteAll() {
    stopAllIntervals()
    timers = [];
    saveTimers();
    render();
}

function editTimer(id) {
    const timer = timers.find(t => t.id === id);
    timer.editing = true;

    render();
}

function toggleTimer(id) {
    const timer = timers.find(t => t.id === id);

    if (timer.running) {
        pauseTimer(id);
    } else {
        startTimer(id);
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function startTimer(id) {
    const timer = timers.find(t => t.id === id);

    if (timer.running) return;

    timer.running = true;
    timer.startTime = Date.now() - timer.time * 1000;
    intervals[id] = setInterval(() => {
        const now = Date.now();
        timer.time = Math.floor((now - timer.startTime) / 1000);

        saveTimers();

        const timeElement = document.getElementById(`timer-${timer.id}`);

        if (timeElement) {
            timeElement.textContent = formatTime(timer.time);
        }
    }, 1000);

    render()
}

function pauseTimer(id) {
    const timer = timers.find(t => t.id === id);

    if (!timer.running) return;

    clearInterval(intervals[id]);
    delete intervals[id];

    const now = Date.now();
    timer.time = Math.floor((now - timer.startTime) / 1000);

    timer.running = false;
    timer.startTime = null;

    saveTimers();

    render()
}

function resetTimer(id) {
    const timer = timers.find(t => t.id === id);

    clearInterval(intervals[id]);
    delete intervals[id];
    timer.running = false;
    timer.time = 0;

    saveTimers();
    render();
}

function deleteTimer(id) {
    timers.find(t => t.id === id);

    clearInterval(intervals[id]);
    delete intervals[id];
    timers = timers.filter(t => t.id !== id);

    saveTimers();
    render();
}

function updateNotes(id, value) {
    const timer = timers.find(t => t.id === id);

    timer.notes = value.slice(0, 150);

    saveTimers();
}

function saveName(id, value) {
    const timer = timers.find(t => t.id === id);

    timer.name = value;
    timer.editing = false;

    saveTimers();
    render();
}

function handleNameKey(e) {
    if (e.key === "Enter") {
        e.target.blur();
    }
}

function stopAllIntervals() {
    Object.values(intervals).forEach(clearInterval);
    intervals = {};
}
