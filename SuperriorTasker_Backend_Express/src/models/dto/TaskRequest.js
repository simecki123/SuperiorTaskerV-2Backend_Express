class TaskRequest {
    constructor(data = {}) {
        this.userId = data.userId || null;
        this.projectId = data.projectId || null;
        this.groupId = data.groupId || null;
        this.name = data.name || null;
        this.description = data.description || null;
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
    }
}

module.exports = TaskRequest;