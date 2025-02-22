const Role = require('../enums/Role');

class UserGroupRelationDto {
    constructor(data = {}) {
        this.groupId = data.groupId || null;
        this.userId = data.userId || null;
        this.userRole = data.userRole || Role.USER;
    }
}

module.exports = UserGroupRelationDto;