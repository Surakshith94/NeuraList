// src/utils/algorithm.js

/**
 * FEATURE 1: The Energy Wave (Time-Boxing)
 * If a task is longer than 60 minutes, this prevents burnout by 
 * automatically slicing it into 45-minute focus sprints with 15-minute breaks.
 */
export const applyEnergyWave = (tasks) => {
  const wavedQueue = [];

  tasks.forEach(task => {
    // If it's a heavy focus task and takes a long time, slice it up
    if (task.energyLevel === 'High Focus' && task.estimatedMinutes > 60) {
      let remainingTime = task.estimatedMinutes;
      let part = 1;

      while (remainingTime > 0) {
        // Take a max 45-minute chunk
        const chunkTime = Math.min(remainingTime, 45); 
        
        wavedQueue.push({
          ...task,
          _id: `${task._id}-part${part}`, // Create a temporary unique ID
          title: `${task.title} (Part ${part})`,
          estimatedMinutes: chunkTime
        });

        remainingTime -= chunkTime;
        part++;

        // If there is still work left, force a 15-minute wind-down break
        if (remainingTime > 0) {
          wavedQueue.push({
            _id: `break-${Date.now()}-${part}`,
            title: '🧠 Mandatory Brain Rest',
            estimatedMinutes: 15,
            energyLevel: 'Recharge',
            priority: 'Medium',
            isSystemGenerated: true // Flags it so we don't save it to MongoDB permanently
          });
        }
      }
    } else {
      // Normal tasks (like a 30 min LeetCode session) pass through untouched
      wavedQueue.push(task);
    }
  });

  return wavedQueue;
};

/**
 * FEATURE 2: Option A (The Time Bonus)
 * If you finish a 30 min task in 20 mins, this takes the saved 10 mins 
 * and adds it to the very next 'Recharge' task in your queue.
 */
export const applyTimeBonus = (queue, minutesSaved) => {
  if (minutesSaved <= 0) return queue;

  const newQueue = [...queue];
  
  // Find the first relaxing task in the upcoming queue
  const nextRechargeIndex = newQueue.findIndex(t => t.energyLevel === 'Recharge');

  if (nextRechargeIndex !== -1) {
    // Reward the user by expanding their next break
    newQueue[nextRechargeIndex] = {
      ...newQueue[nextRechargeIndex],
      estimatedMinutes: newQueue[nextRechargeIndex].estimatedMinutes + minutesSaved,
      title: `🎁 Bonus Time: ${newQueue[nextRechargeIndex].title}`
    };
  }

  return newQueue;
};