const input_user = document.querySelector(".input");
const tasklist = document.querySelector("#list");

document.addEventListener("DOMContentLoaded", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.reverse().forEach(task => addTask(task.text, task.completed)); 
});

function add() {
    const value_input = input_user.value;

    if (value_input === "") {
        alert("Enter a task");
        return;
    }

    const taskObj = {
        text: value_input,
        completed: false
    };

    addTask(taskObj.text, taskObj.completed);
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


function saveTasksToLocalStorage() {
    let tasks = [];
    document.querySelectorAll(".task").forEach(taskEl => {
        const text = taskEl.querySelector("p").textContent;
        const completed = taskEl.querySelector(".check").checked;
        tasks.push({ text, completed });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
