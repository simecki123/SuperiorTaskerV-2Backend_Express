class UserProjectResponse {
    constructor(data = {}) {
        this.projectId = data.projectId || null;
        this.userId = data.userId || null;
        this.groupId = data.groupId || null;
    }
}

module.exports = UserProjectResponse;