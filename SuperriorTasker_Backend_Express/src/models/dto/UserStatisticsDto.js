class UserStatisticsDto {
    constructor(data = {}) {
        this.numberOfTasks = data.numberOfTasks || 0;
        this.numberOfFinishedTasks = data.numberOfFinishedTasks || 0;
        this.numberOfUnfinishedTasks = data.numberOfUnfinishedTasks || 0;
        this.numberOfProjects = data.numberOfProjects || 0;
        this.numberOfCompletedProjects = data.numberOfCompletedProjects || 0;
        this.numberOfIncompletedProjects = data.numberOfIncompletedProjects || 0;
    }
}

module.exports = UserStatisticsDto;