const Project = require('../models/dao/Project');
const Task = require('../models/dao/Task');

class ProjectCommonService {
    async updateProjectCompletion(id) {
        const project = await Project.findById(id);
        if (!project) {
            throw new Error('No project with associated id');
        }
        console.log('Fetching project');

        const taskList = await Task.find({ projectId: id });
        console.log(`Found ${taskList.length} tasks for project ${id}`);
        
        // Debug the task statuses to see what's going on
        taskList.forEach(task => {
            console.log(`Task ${task._id}: status = "${task.status}"`);
        });
        
        let completionSum = 0.0;
        for (const task of taskList) {
            // Make sure we're checking the status correctly
            // The issue may be caused by case sensitivity or different string representations
            if (task.status === 'COMPLETED') {
                completionSum += 1;
                console.log(`Task ${task._id} is completed`);
            } else {
                console.log(`Task ${task._id} is not completed, status = "${task.status}"`);
            }
        }

        const completion = taskList.length > 0 
            ? this.round((completionSum / taskList.length) * 100) 
            : 0.0;

        console.log(`Project completion calculation: ${completionSum} / ${taskList.length} * 100 = ${completion}%`);

        // Use updateOne to ensure we're updating properly
        const updateResult = await Project.updateOne(
            { _id: id },
            { $set: { completion: completion } }
        );
        
        console.log('Project update result:', updateResult);
        
        return completion;
    }

    round(value) {
        const factor = Math.pow(10, 2);
        value = value * factor;
        const tmp = Math.round(value);
        return tmp / factor;
    }
}

module.exports = new ProjectCommonService();