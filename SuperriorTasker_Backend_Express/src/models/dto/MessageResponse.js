const MessageStatus = require('../enums/MessageStatus');

class MessageResponse {
    constructor(data = {}) {
        this.id = data.id || null;
        this.message = data.message || null;
        this.messageStatus = data.messageStatus || MessageStatus.UNREAD;
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.photoUri = data.photoUri || null;
    }
}

module.exports = MessageResponse;