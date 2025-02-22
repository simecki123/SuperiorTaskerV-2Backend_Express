class GroupEditResponse {
    constructor(data = {}) {
        this.name = data.name || null;
        this.description = data.description || null;
        this.photoUri = data.photoUri || null;
    }
}

module.exports = GroupEditResponse;