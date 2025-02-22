class MessageRequest {
    constructor(data = {}) {
        this.groupId = data.groupId || null;
        this.userId = data.userId || null;
        this.message = data.message || null;
    }
}

module.exports = MessageRequest;