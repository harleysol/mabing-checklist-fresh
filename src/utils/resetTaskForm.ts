export const resetTasks = (tasks: any[], freq: string) => {
    return tasks.map(task => {
        if (task.resetFreq === freq) {
            return { ...task, selectValue: undefined, customValue: undefined };
        }
        return task;
    });
};