const User = require('../models/dao/User');
const Task = require('../models/dao/Task');
const ProjectService = require('./projectService');
const UserStatisticsDto = require('../models/dto/UserStatisticsDto');

class UserStatisticsService {
    async getUserStats(userId) {
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            throw new Error(`User with ID ${userId} not found`);
        }

        const userTasks = await Task.find({ userId });

        const userProjects = await ProjectService.findAllProjectsByUserId(userId);

        const totalTasks = userTasks.length;
        const completedTasks = userTasks.filter(task => task.status === 'COMPLETED').length;
        const inProgressTasks = userTasks.filter(task => task.status === 'IN_PROGRESS').length;

        const totalProjects = userProjects.length;
        const completedProjects = userProjects.filter(project => project.completion === 100.0).length;
        const incompleteProjects = totalProjects - completedProjects;

        return new UserStatisticsDto({
            numberOfTasks: totalTasks,
            numberOfFinishedTasks: completedTasks,
            numberOfUnfinishedTasks: inProgressTasks,
            numberOfProjects: totalProjects,
            numberOfCompletedProjects: completedProjects,
            numberOfIncompletedProjects: incompleteProjects
        });
    }
}

module.exports = new UserStatisticsService();