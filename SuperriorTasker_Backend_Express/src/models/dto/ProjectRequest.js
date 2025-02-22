class ProjectRequest {
    constructor(data = {}) {
        this.userId = data.userId;
        this.groupId = data.groupId;
        this.name = data.name;
        this.description = data.description;
        this.startDate = data.startDate;
        this.endDate = date.endDate;
    }
}

module.exports = ProjectRequest;