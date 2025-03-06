const Task = require('../models/dao/Task');
const Project = require('../models/dao/Project');
const Group = require('../models/dao/Group');
const ProjectCommonService = require('./projectCommonService');
const TaskResponse = require('../models/dto/TaskResponse');
const UserProjectResponse = require('../models/dto/UserProjectResponse');
const DeleteResponse = require('../models/dto/DeleteResponse');

class TaskService {
    async createTask(taskRequest) {
        console.log('Starting to create task');
        
        const group = await Group.findById(taskRequest.groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }
        
        const project = await Project.findById(taskRequest.projectId);
        if (!project) {
            throw new Error('No project associated with projectId');
        }
        
        const task = new Task({
            userId: taskRequest.userId,
            groupId: taskRequest.groupId,
            projectId: taskRequest.projectId,
            name: taskRequest.name,
            description: taskRequest.description,
            startDate: new Date(taskRequest.startDate),
            endDate: new Date(taskRequest.endDate),
            taskStatus: 'IN_PROGRESS'
        });
        
        await task.save();
        
        console.log('Updating completion of the project...');
        await ProjectCommonService.updateProjectCompletion(task.projectId);
        
        console.log('Task created');
        return new TaskResponse({
            id: task._id,
            userId: task.userId,
            groupId: task.groupId,
            projectId: task.projectId,
            name: task.name,
            description: task.description,
            taskStatus: task.taskStatus,
            startDate: task.startDate,
            endDate: task.endDate
        });
    }

    async getAllTasksForUser(userId, groupId, projectId, taskStatus, search, pageable) {
        console.log('Searching for tasks with userId:', userId);
        
        const criteria = {};
        
        if (userId) {
            criteria.userId = userId;
        }
        
        if (groupId) {
            criteria.groupId = groupId;
        }
        
        if (projectId) {
            criteria.projectId = projectId;
        }
        
        if (taskStatus) {
            criteria.status = taskStatus;
        }
        
        if (search) {
            criteria.name = { $regex: search, $options: 'i' };
        }
        
        const tasks = await Task.find(criteria)
            .sort({ createdAt: -1 })
            .skip(pageable.page * pageable.size)
            .limit(pageable.size);
            
        console.log('Found', tasks.length, 'results');
        
        return tasks.map(task => new TaskResponse({
            id: task._id,
            userId: task.userId,
            groupId: task.groupId,
            projectId: task.projectId,
            name: task.name,
            description: task.description,
            taskStatus: task.status,
            startDate: task.startDate,
            endDate: task.endDate
        }));
    }

    async updateTaskStatus(id, taskStatus) {
        const task = await Task.findById(id);
        if (!task) {
            throw new Error('There is no task with that id, so it cannot be updated!');
        }
        
        const updateResult = await Task.updateOne(
            { _id: id },
            { $set: { status: taskStatus } }
        );
        
        console.log('Task update result:', updateResult);
        
        if (updateResult.modifiedCount === 0) {
            console.warn('No changes made to task status - it may already be set to this value');
        }
        
        console.log('Updating completion of the project...');
        await ProjectCommonService.updateProjectCompletion(task.projectId);
        
        return 'Task status is successfully updated...';
    }

    async updateTask(taskRequest, taskId) {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error('No task found with id: ' + taskId);
        }
        
        task.name = taskRequest.name;
        task.description = taskRequest.description;
        task.userId = taskRequest.userId;
        task.startDate = new Date(taskRequest.startDate);
        task.endDate = new Date(taskRequest.endDate);
        
        await task.save();
        
        console.log('Task updated successfully');
        return new TaskResponse({
            id: task.id,
            userId: task.userId,
            groupId: task.groupId,
            projectId: task.projectId,
            name: task.name,
            description: task.description,
            taskStatus: task.taskStatus,
            startDate: task.startDate,
            endDate: task.endDate
        });
    }

    async deleteTaskById(taskId) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('There is no task with that id, so it cannot be updated!');
            }
            
            await Task.deleteOne({ _id: taskId });
            
            console.log('Updating completion of the project...');
            await ProjectCommonService.updateProjectCompletion(task.projectId);
            
            console.log('Task deleted successfully...');
            return new DeleteResponse(true, 'Task deleted successfully...');
            
        } catch (error) {
            console.error('Error deleting task', taskId, ':', error.message);
            throw error;
        }
    }

    async fetchUserProjectRelations(requests) {
        if (!requests || requests.length === 0) {
            console.log('No requests provided for user-project relations');
            return [];
        }
        
        console.log('Fetching user-project relations for', requests.length, 'requests');
        
        const responses = [];
        
        for (const request of requests) {
            console.log('Processing request for userId:', request.userId, 
                        'projectId:', request.projectId, 'groupId:', request.groupId);
            
            let task;
            
            if (request.groupId) {
                task = await Task.findOne({
                    userId: request.userId,
                    projectId: request.projectId,
                    groupId: request.groupId
                });
            } else {
                task = await Task.findOne({
                    userId: request.userId,
                    projectId: request.projectId
                });
            }
            
            if (task) {
                responses.push(new UserProjectResponse({
                    projectId: task.projectId,
                    userId: task.userId,
                    groupId: task.groupId
                }));
            }
        }
        
        console.log('Found', responses.length, 'user-project relations');
        return responses;
    }

    
}

module.exports = new TaskService();