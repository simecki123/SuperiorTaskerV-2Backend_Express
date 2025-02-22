class UserProjectRelationRequest {
    constructor(data = {}) {
        this.projectId = data.projectId || null;
        this.userId = data.projectId || null;
        this.groupId = data.groupId || null;
    }
}

module.exports = UserProjectRelationRequest;