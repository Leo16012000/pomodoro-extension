document.getElementById('startButton').addEventListener('click', function() {
    const taskName = document.getElementById('taskNameInput').value.trim();
    const duration = parseInt(document.getElementById('timeInput').value.trim());
    chrome.runtime.sendMessage({command: 'start', duration: duration, taskName: taskName}, response => {
        console.log(response.status);
    });
});

function loadTasks() {
    chrome.storage.sync.get({tasks: []}, function(data) {
        const jobList = document.getElementById('jobList');
        jobList.innerHTML = ''; // Clear existing list first
        data.tasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = task;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'deleteButton';
            deleteButton.onclick = function() {
                deleteSpecificTask(task, index); // Pass the task name and index to delete function
            };

            listItem.appendChild(deleteButton);
            jobList.appendChild(listItem);
        });
    });
}

function deleteSpecificTask(taskToDelete, index) {
    chrome.storage.sync.get({tasks: []}, function(data) {
        let updatedTasks = data.tasks;
        updatedTasks.splice(index, 1); // Remove the task at the specified index
        chrome.storage.sync.set({tasks: updatedTasks}, function() {
            loadTasks(); // Reload the list to reflect changes
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setInterval(() => {
        chrome.runtime.sendMessage({command: 'get_time'}, response => {
            let minutes = Math.floor(response.remainingTime / 60);
            let seconds = response.remainingTime % 60;
            document.getElementById('timerDisplay').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        });
    }, 1000);
});
