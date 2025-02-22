class LoginRequest {
    constructor(data = {}) {
        this.email = data.email || null;
        this.password = data.password || null;
    }
}

module.exports = LoginRequest;