const Role = require('../enums/Role');

class ChangeGroupAdminDto {
    constructor(data = {}) {
        this.groupId = data.groupId || null;
        this.userId = data.userId || null;
        this.role = data.role || Role.USER;
    }
}

module.exports = ChangeGroupAdminDto;