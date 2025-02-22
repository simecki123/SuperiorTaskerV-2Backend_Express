class UserToAddInGroupResponse {
    constructor(data = {}) {
        this.userId = data.userId || null;
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.description = data.description || null;
        this.photoUrl = data.photoUrl || null;
    }
}

module.exports = UserToAddInGroupResponse;