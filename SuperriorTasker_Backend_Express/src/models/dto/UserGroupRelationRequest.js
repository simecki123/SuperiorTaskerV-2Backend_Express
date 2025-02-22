class UserGroupRelationRequest {
    constructor(data = {}) {
        this.userId = data.userId || null;;
        this.groupId = data.groupId || null;;
    }
}

module.exports = UserGroupRelationRequest;