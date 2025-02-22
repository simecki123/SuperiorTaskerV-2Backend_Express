const TaskStatus = require('../enums/TaskStatus');

class TaskResponse {
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.groupId = data.groupId || null;
        this.proejctId = data.proejctId || null;
        this.name = data.name || null;
        this.description = data.description || null;
        this.taskStatus = data.taskStatus || TaskStatus.IN_PROGRESS;
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
    }
}