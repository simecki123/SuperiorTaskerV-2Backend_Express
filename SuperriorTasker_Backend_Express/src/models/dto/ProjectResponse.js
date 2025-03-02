class ProjectResponse {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || null;
        this.description = data.description || null;
        this.groupId = data.groupId || null;
        this.userId = data.userId || null;
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
        this.completion = data.completion || 0;
    }
}

module.exports = ProjectResponse;