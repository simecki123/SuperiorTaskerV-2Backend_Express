const Role = require('../enums/Role');

class GroupMemberResponse {
    constructor(data = {}) {
        this.userId = data.userId || null;
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this. description = data.description || null;
        this.role = data.role || Role.USER;
        this.photoUri = data.photoUri || null;
    }

}

module.exports = GroupMemberResponse;