class GroupResponse {
    constructor(data = {}) {
        this.groupId = data.groupId || null;
        this.name = data.name || null;
        this.description = data.description || null;
    }
}

module.exports = GroupResponse;