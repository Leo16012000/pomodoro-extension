let timerInterval;
let timeRemaining = 0; // in seconds
let currentTask = '';

function startTimer(duration, taskName) {
    timeRemaining = duration * 60; // Convert minutes to seconds
    currentTask = taskName;
    timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            chrome.notifications.create({
                type: 'basic',
                title: 'Time Up!',
                message: `Time to take a break! Task "${currentTask}" completed.`,
                priority: 2
            });
            saveTask(currentTask, duration);
            currentTask = '';
            chrome.action.setBadgeText({ text: '' }); // Clear badge text
        } else {
            timeRemaining--;
            updateBadge();
        }
    }, 1000);
}

function updateBadge() {
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    chrome.action.setBadgeText({ text: `${minutes}` });
}

function saveTask(name, duration) {
    chrome.storage.sync.get({tasks: []}, function(data) {
        const tasks = data.tasks;
        const task = {name: name, duration: duration};
        tasks.push(task);
        chrome.storage.sync.set({tasks: tasks});
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.command == 'start') {
            startTimer(request.duration, request.taskName);
            sendResponse({status: 'Timer started'});
        } else if (request.command == 'get_time') {
            sendResponse({remainingTime: timeRemaining});
        }
    }
);
