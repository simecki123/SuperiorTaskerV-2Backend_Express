const Role = require('../enums/Role');

class GroupMemberDto {
    constructor(data = {}) {
        this.userId = data.userId || null;
        this.firstName = data.userId || null;
        this.lastName = data.userId || null;
        this.role = data.role || Role.USER;
        this.photoUrl = data.photoUrl || null;
    }
}

module.exports = GroupMemberDto;
