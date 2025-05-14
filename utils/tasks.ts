export function getResetTaskState(tasks, characters, taskValues, now) {
    const updatedValues = { ...taskValues };
    const updatedTasks = tasks.map(t => {
        if (shouldResetTask(t, now)) {
            characters.forEach(c => {
                delete updatedValues[`${c.id}-${t.id}`];
            });
            return { ...t, lastReset: now };
        }
        return t;
    });

    return { updatedTasks, updatedValues };
}