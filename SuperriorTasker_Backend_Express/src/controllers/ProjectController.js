const express = require('express');
const router = express.Router();
const ProjectService = require('../services/projectService');

router.post('/createProject', async (req, res) => {
    try {
        console.log('Creating new project...');
        const projectRequest = req.body;
        
        const response = await ProjectService.createProject(projectRequest);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error creating project:', error);
        if (error.message.includes('No group associated')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.get('/getFilteredProjects', async (req, res) => {
    try {
        const { 
            userId, 
            groupId, 
            startCompletion = 0, 
            endCompletion = 100,
            includeComplete = false, 
            includeNotStarted = false, 
            search,
            page = 0,
            size = 4
        } = req.query;

        console.log('Received request with userId:', userId);
        
        if (parseFloat(startCompletion) > parseFloat(endCompletion)) {
            return res.status(400).json({ message: 'Start completion cannot be greater than end completion' });
        }
        
        const pageable = {
            page: parseInt(page),
            size: parseInt(size)
        };
        
        const projects = await ProjectService.getAllProjects(
            userId, 
            groupId, 
            parseFloat(startCompletion), 
            parseFloat(endCompletion),
            includeComplete === 'true', 
            includeNotStarted === 'true', 
            search, 
            pageable
        );
        
        if (projects.length === 0) {
            console.log('No projects found for userId:', userId);
            return res.status(200).json([]);
        }
        
        console.log('Found', projects.length, 'projects');
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error in getFilteredProjects:', error);
        res.status(404).json({ message: error.message });
    }
});

router.patch('/update-project', async (req, res) => {
    try {
        const projectRequest = req.body;
        const { projectId } = req.query;
        
        console.log('Updating project with id:', projectId);
        
        const response = await ProjectService.updateProject(projectRequest, projectId);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating project:', error);
        if (error.message.includes('No project found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.get('/get-project-by-id', async (req, res) => {
    try {
        const { projectId } = req.query;
        console.log('Searching for project with id:', projectId);
        
        const project = await ProjectService.getProjectById(projectId);
        res.status(200).json(project);
    } catch (error) {
        console.error('Error getting project:', error);
        if (error.message.includes('No project found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.delete('/delete-project', async (req, res) => {
    try {
        const { projectId } = req.query;
        console.log('Deleting project by his id...');
        
        const response = await ProjectService.deleteProjectById(projectId);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting project:', error);
        if (error.message.includes('No project found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

module.exports = router;