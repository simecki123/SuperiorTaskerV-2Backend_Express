const Project = require('../models/dao/Project');
const Group = require('../models/dao/Group');
const Task = require('../models/dao/Task');
const TaskService = require('./taskService');
const ProjectCommonService = require('./projectCommonService');
const mongoose = require('mongoose');
const ProjectResponse = require('../models/dto/ProjectResponse');
const DeleteResponse = require('../models/dto/DeleteResponse');

class ProjectService {
    async createProject(projectRequest) {
        const group = await Group.findById(projectRequest.groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }

        const project = new Project({
            groupId: projectRequest.groupId,
            name: projectRequest.name,
            description: projectRequest.description,
            startDate: new Date(projectRequest.startDate),
            endDate: new Date(projectRequest.endDate),
            completion: 0.0
        });

        await project.save();

        console.log('Project created');
        return new ProjectResponse({
            id: project.id,
            groupId: project.groupId,
            userId: projectRequest.userId,
            name: project.name,
            description: project.description,
            completion: project.completion,
            startDate: project.startDate,
            endDate: project.endDate
        });
    }

    async getAllProjects(userId, groupId, startCompletion, endCompletion, 
                         includeComplete, includeNotStarted, search, pageable) {
        const criteria = {};
        
        if (groupId) {
            criteria.groupId = groupId;
        }
        
        if (search) {
            criteria.name = { $regex: search, $options: 'i' };
        }
        
        const completionCriteria = [];
        
        if (includeComplete) {
            completionCriteria.push({ completion: 100.0 });
        }
        
        if (includeNotStarted) {
            completionCriteria.push({ completion: 0.0 });
        }
        
        if (startCompletion !== null || endCompletion !== null) {
            const rangeCriteria = {};
            if (startCompletion !== null) {
                rangeCriteria.$gte = startCompletion;
            }
            if (endCompletion !== null) {
                rangeCriteria.$lte = endCompletion;
            }
            completionCriteria.push({ completion: rangeCriteria });
        }
        
        if (completionCriteria.length > 0) {
            criteria.$or = completionCriteria;
        }
        
        let projects = await Project.find(criteria)
            .sort({ createdAt: -1 })
            .skip(pageable.page * pageable.size)
            .limit(pageable.size);
            
        console.log('Found', projects.length, 'results');
        
        if (userId) {
            const filteredProjects = [];
            
            for (const project of projects) {
                const request = {
                    userId: userId,
                    projectId: project._id.toString(),
                    groupId: project.groupId
                };
                
                const response = await TaskService.fetchUserProjectRelations([request]);
                if (response.length > 0) {
                    filteredProjects.push(project);
                }
            }
            
            projects = filteredProjects;
        }
        console.log("Projects ", projects)
        
        return projects.map(project => new ProjectResponse({
            id: project._id,
            groupId: project.groupId,
            userId: userId,
            name: project.name,
            description: project.description,
            completion: project.completion,
            startDate: project.startDate,
            endDate: project.endDate
        }));
    }

    async findAllProjectsByUserId(userId) {
        if (!userId) {
            throw new Error('UserId cannot be null or empty');
        }
        
        const allProjects = await Project.find();
        const filteredProjects = [];
        
        for (const project of allProjects) {
            const request = {
                userId: userId,
                projectId: project._id.toString(),
                groupId: project.groupId
            };
            
            const response = await TaskService.fetchUserProjectRelations([request]);
            if (response.length > 0) {
                filteredProjects.push(project);
            }
        }
        
        return filteredProjects.map(project => new ProjectResponse({
            projectId: project._id,
            groupId: project.groupId,
            name: project.name,
            description: project.description,
            completion: project.completion,
            startDate: project.startDate,
            endDate: project.endDate
        }));
    }

    async getProjectById(id) {
        const project = await Project.findById(id);
        if (!project) {
            throw new Error('No project found with id: ' + id);
        }
        
        return new ProjectResponse({
            id: project._id,
            groupId: project.groupId,
            name: project.name,
            description: project.description,
            completion: project.completion,
            startDate: project.startDate,
            endDate: project.endDate
        });
    }

    async deleteProjectById(projectId) {
        try {
            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error('There is no project with that id present...');
            }
            
            await Project.deleteOne({ _id: projectId });
            await this.deleteProjectTasks(projectId);
            
            console.log('Project is deleted as well as his tasks...');
            return new DeleteResponse(true, 'Project and his tasks deleted successfully...');
            
        } catch (error) {
            console.error('Error deleting project', projectId, ':', error.message);
            throw error;
        }
    }

    async updateProject(request, projectId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error('No project found with id: ' + projectId);
        }
        
        project.name = request.name;
        project.description = request.description;
        project.startDate = new Date(request.startDate);
        project.endDate = new Date(request.endDate);
        
        await project.save();
        
        console.log('Project updated successfully');
        return new ProjectResponse({
            id: project._id,
            groupId: project.groupId,
            name: project.name,
            description: project.description,
            completion: project.completion,
            startDate: project.startDate,
            endDate: project.endDate
        });
    }

    async deleteProjectTasks(projectId) {
        const projectTasks = await Task.find({ projectId });
        for (const task of projectTasks) {
            await Task.deleteOne({ _id: task._id });
        }
    }
}

module.exports = new ProjectService();