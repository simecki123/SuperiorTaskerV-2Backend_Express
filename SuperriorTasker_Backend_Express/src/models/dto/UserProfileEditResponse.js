class UserProfileEditResponse {
    constructor(data = {}) {
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.description = data.description || null;
        this.profileUri = data.description || null;
    }
}

module.exports = UserProfileEditResponse;