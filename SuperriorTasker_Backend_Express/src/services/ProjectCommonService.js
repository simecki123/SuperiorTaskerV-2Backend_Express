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
        console.log('Returning task list', taskList);
        
        let completionSum = 0.0;
        for (const task of taskList) {
            if (task.status === 'COMPLETED') {
                completionSum += 1;
            }
        }

        const completion = taskList.length > 0 
            ? this.round((completionSum / taskList.length) * 100) 
            : 0.0;

        console.log("Completion ", completion);

        project.completion = completion;
        await project.save();
    }

    round(value) {
        const factor = Math.pow(10, 2);
        value = value * factor;
        const tmp = Math.round(value);
        return tmp / factor;
    }
}

module.exports = new ProjectCommonService();