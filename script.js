const input_user = document.querySelector(".input");
const tasklist = document.querySelector("#list");

// Date state
let selectedDate = new Date();
let calendarViewDate = new Date();

// Format date as YYYY-MM-DD for storage key
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

// Format date for display
function formatDateDisplay(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get date label (Today, Tomorrow, Yesterday)
function getDateLabel(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const diffTime = compareDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return " (Today)";
    if (diffDays === 1) return " (Tomorrow)";
    if (diffDays === -1) return " (Yesterday)";
    return "";
}

// Update date display
function updateDateDisplay() {
    const displayEl = document.getElementById("selected-date-display");
    displayEl.textContent = formatDateDisplay(selectedDate) + getDateLabel(selectedDate);
    
    // Update quick date buttons
    document.querySelectorAll(".quick-date-btn[data-offset]").forEach(btn => {
        const offset = parseInt(btn.dataset.offset);
        const btnDate = new Date();
        btnDate.setDate(btnDate.getDate() + offset);
        btn.classList.toggle("active", formatDateKey(btnDate) === formatDateKey(selectedDate));
    });
}

// Get all tasks from localStorage
function getAllTasks() {
    return JSON.parse(localStorage.getItem("calendarTasks")) || {};
}

// Get tasks for selected date
function getTasksForDate(date) {
    const allTasks = getAllTasks();
    return allTasks[formatDateKey(date)] || [];
}

// Save tasks for selected date
function saveTasksForDate(date, tasks) {
    const allTasks = getAllTasks();
    if (tasks.length === 0) {
        delete allTasks[formatDateKey(date)];
    } else {
        allTasks[formatDateKey(date)] = tasks;
    }
    localStorage.setItem("calendarTasks", JSON.stringify(allTasks));
}

// Save current tasks from DOM to localStorage
function saveTasksToLocalStorage() {
    let tasks = [];
    document.querySelectorAll(".task").forEach(taskEl => {
        const text = taskEl.querySelector("p").textContent;
        const completed = taskEl.querySelector(".check").checked;
        tasks.push({ text, completed });
    });
    saveTasksForDate(selectedDate, tasks);
    updateCalendar();
}

// Load tasks for selected date
function loadTasksForDate() {
    tasklist.innerHTML = "";
    const tasks = getTasksForDate(selectedDate);
    tasks.forEach(task => addTask(task.text, task.completed));
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    // Migrate old tasks to today if they exist
    const oldTasks = JSON.parse(localStorage.getItem("tasks"));
    if (oldTasks && oldTasks.length > 0) {
        const allTasks = getAllTasks();
        const todayKey = formatDateKey(new Date());
        allTasks[todayKey] = [...(allTasks[todayKey] || []), ...oldTasks.reverse()];
        localStorage.setItem("calendarTasks", JSON.stringify(allTasks));
        localStorage.removeItem("tasks");
    }
    
    updateDateDisplay();
    loadTasksForDate();
    renderCalendar();
});

function add() {
    const value_input = input_user.value;

    if (value_input === "") {
        alert("Enter a task");
        return;
    }

    addTask(value_input, false);
    saveTasksToLocalStorage();
    input_user.value = "";
}

function addTask(text, completed) {
    const newtask = document.createElement("div");
    newtask.classList.add("task");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("check");
    checkbox.checked = completed;

    const item = document.createElement("p");
    item.textContent = text;

    if (completed) {
        item.style.textDecoration = "line-through";
        item.style.color = "grey";
    }

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            item.style.textDecoration = "line-through";
            item.style.color = "grey";
        } else {
            item.style.textDecoration = "none";
            item.style.color = "black";
        }
        saveTasksToLocalStorage();
    });

    const icon = document.createElement("img");
    icon.src = "close.png";
    icon.classList.add("delete-icon");

    icon.addEventListener("click", () => {
        newtask.remove();
        saveTasksToLocalStorage();
    });

    newtask.append(checkbox, item, icon);
    tasklist.prepend(newtask);
}

// Navigate to previous/next day
function navigateDate(offset) {
    selectedDate.setDate(selectedDate.getDate() + offset);
    updateDateDisplay();
    loadTasksForDate();
    updateCalendar();
}

// Set a specific date
function setDate(date) {
    selectedDate = new Date(date);
    updateDateDisplay();
    loadTasksForDate();
    document.getElementById("calendar-popup").classList.add("hidden");
}

// Render calendar
function renderCalendar() {
    const calendarDays = document.getElementById("calendar-days");
    const calendarMonthYear = document.getElementById("calendar-month-year");
    
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    
    calendarMonthYear.textContent = calendarViewDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const allTasks = getAllTasks();
    const today = new Date();
    
    calendarDays.innerHTML = "";
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
        const dayEl = document.createElement("div");
        dayEl.classList.add("cal-day", "other-month");
        dayEl.textContent = prevMonth.getDate() - i;
        calendarDays.appendChild(dayEl);
    }
    
    // Current month days
    for (let day = 1; day <= totalDays; day++) {
        const dayEl = document.createElement("div");
        dayEl.classList.add("cal-day");
        dayEl.textContent = day;
        
        const dateKey = formatDateKey(new Date(year, month, day));
        
        // Check if today
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            day === today.getDate()) {
            dayEl.classList.add("today");
        }
        
        // Check if selected
        if (dateKey === formatDateKey(selectedDate)) {
            dayEl.classList.add("selected");
        }
        
        // Check if has tasks
        if (allTasks[dateKey] && allTasks[dateKey].length > 0) {
            dayEl.classList.add("has-tasks");
        }
        
        dayEl.addEventListener("click", () => {
            setDate(new Date(year, month, day));
        });
        
        calendarDays.appendChild(dayEl);
    }
    
    // Next month days
    const remainingDays = 42 - (startDay + totalDays);
    for (let day = 1; day <= remainingDays; day++) {
        const dayEl = document.createElement("div");
        dayEl.classList.add("cal-day", "other-month");
        dayEl.textContent = day;
        calendarDays.appendChild(dayEl);
    }
}

function updateCalendar() {
    const calendarPopup = document.getElementById("calendar-popup");
    if (!calendarPopup.classList.contains("hidden")) {
        renderCalendar();
    }
}

// Event Listeners for date navigation
document.getElementById("prev-day").addEventListener("click", () => navigateDate(-1));
document.getElementById("next-day").addEventListener("click", () => navigateDate(1));

// Quick date buttons
document.querySelectorAll(".quick-date-btn[data-offset]").forEach(btn => {
    btn.addEventListener("click", () => {
        const offset = parseInt(btn.dataset.offset);
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + offset);
        setDate(newDate);
    });
});

// Calendar toggle
document.getElementById("pick-date-btn").addEventListener("click", () => {
    const calendarPopup = document.getElementById("calendar-popup");
    calendarPopup.classList.toggle("hidden");
    if (!calendarPopup.classList.contains("hidden")) {
        calendarViewDate = new Date(selectedDate);
        renderCalendar();
    }
});

// Calendar month navigation
document.getElementById("prev-month").addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
});

// Enter key to add task
input_user.addEventListener("keypress", (e) => {
    if (e.key === "Enter") add();
});
