const express = require('express');
const router = express.Router();
const TaskService = require('../services/taskService');

router.post('/createTask', async (req, res) => {
    try {
        console.log('Creating new task...');
        const taskRequest = req.body;
        
        const response = await TaskService.createTask(taskRequest);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error creating task:', error);
        if (error.message.includes('No project associated') || 
            error.message.includes('No group associated')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.get('/getFilteredTasks', async (req, res) => {
    try {
        const { 
            userId, 
            groupId, 
            projectId, 
            status, 
            search,
            page = 0,
            size = 4
        } = req.query;
        
        const pageable = {
            page: parseInt(page),
            size: parseInt(size)
        };
        
        const tasks = await TaskService.getAllTasksForUser(
            userId, 
            groupId, 
            projectId, 
            status, 
            search, 
            pageable
        );
        
        console.log('Retrieved tasks count:', tasks.length);
        console.log('Query parameters - userId:', userId, 'groupId:', groupId, 
                    'projectId:', projectId, 'status:', status, 'search:', search, 
                    'page:', page, 'size:', size);
        
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching filtered tasks:', error);
        res.status(400).json({ message: error.message });
    }
});

router.patch('/update-task-status', async (req, res) => {
    try {
        const { taskId, status } = req.query;
        console.log('Updating task status...');
        
        const response = await TaskService.updateTaskStatus(taskId, status);
        res.status(200).json({ message: response });
    } catch (error) {
        console.error('Error updating task status:', error);
        if (error.message.includes('There is no task')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.patch('/update-task', async (req, res) => {
    try {
        const taskRequest = req.body;
        const { taskId } = req.query;
        
        console.log('Updating task with Id', taskId);
        
        const response = await TaskService.updateTask(taskRequest, taskId);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating task:', error);
        if (error.message.includes('No task found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.delete('/delete-task', async (req, res) => {
    try {
        const { taskId } = req.query;
        console.log('Deleting task...');
        
        const response = await TaskService.deleteTaskById(taskId);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting task:', error);
        if (error.message.includes('There is no task')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.post('/get-user-projectRelation', async (req, res) => {
    try {
        const userProjectRelationRequests = req.body;
        console.log('Fetching user projectRelations');
        
        const response = await TaskService.fetchUserProjectRelations(userProjectRelationRequests);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching user project relations:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;