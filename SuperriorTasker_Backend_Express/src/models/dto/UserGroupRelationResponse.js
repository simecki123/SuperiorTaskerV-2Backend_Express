const Role = require('../enums/Role');

class UserGroupRelationResponse {
    constructor(data = {}) {
        this.id = data.id || null;;
        this.userId = data.userId  || null;;
        this.groupId = data.groupId  || null;;
        this.role = data.role || Role.USER;
    }
}