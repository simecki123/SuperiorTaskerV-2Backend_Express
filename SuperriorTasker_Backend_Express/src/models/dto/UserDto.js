class UserDto {
    constructor(data = {}) {
        this.id = data.id || null;
        this.email = data.email || null;
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.description = data.description || null;
        this.profileUri = data.profileUri || null;
        this.groupMembershipData = data.groupMembershipData || [];
    }
}

module.exports = UserDto;