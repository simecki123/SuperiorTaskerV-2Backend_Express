class RegisterUserRequest {
    constructor(data = {}) {
        this.email = data.email || null;
        this.password = data.password || null;
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.description = data.description || null;
    }
}

module.exports = RegisterUserRequest;