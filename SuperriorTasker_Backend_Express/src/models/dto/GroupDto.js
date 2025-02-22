class GroupDto {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || null;
        this.description = data.description || null;
        this.photoUri = data.photoUri || null;
    }
}

module.exports = GroupDto;