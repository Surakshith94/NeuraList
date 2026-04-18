import { useState, useEffect } from 'react';
import axios from 'axios';
import ActiveTaskCard from './components/ActiveTaskCard';
import OvertimeModal from './components/OvertimeModal';
import TaskQueue from './components/TaskQueue'; 
import AddTaskModal from './components/AddTaskModal'; 
import EditTaskModal from './components/EditTaskModal'; 
import MoodSelectorModal from './components/MoodSelectorModal'; 
import SleepCountdown from './components/SleepCountdown'; 
import { applyEnergyWave, applyTimeBonus } from './utils/algorithm';
import MasterTaskList from './components/MasterTaskList'; 
import ProjectSummary from './components/ProjectSummary'; 
import ConsistencyHeatmap from './components/ConsistencyHeatmap';
import EveningTimeline from './components/EveningTimeline';
import RechargeCheckModal from './components/RechargeCheckModal';
import BreakSuggestionModal from './components/BreakSuggestionModal'; 
import RelaxSuggestionModal from './components/RelaxSuggestionModal'; 

function App() {
  const [allTasks, setAllTasks] = useState([]); 
  const [activeTask, setActiveTask] = useState(null);
  const [queueTasks, setQueueTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [hasEveningStarted, setHasEveningStarted] = useState(() => localStorage.getItem('hasEveningStarted') === 'true');
  const [currentMood, setCurrentMood] = useState(() => localStorage.getItem('currentMood') || null);
  
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Interceptor Modals
  const [isBreakSuggestionOpen, setIsBreakSuggestionOpen] = useState(false);
  const [isRelaxModalOpen, setIsRelaxModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [pendingNextTaskData, setPendingNextTaskData] = useState(null);

  const syncLayoutToStorage = (active, queue) => {
    if (active) localStorage.setItem('activeTaskId', active._id);
    else localStorage.removeItem('activeTaskId');
    if (queue) localStorage.setItem('queueTaskIds', JSON.stringify(queue.map(t => t._id)));
  };

  const processAndQueueTasks = (mood, rawTasks) => {
    let processedTasks = rawTasks.filter(task => task.status !== 'completed');

    processedTasks = processedTasks.map(task => {
      if (task.priority === 'High') {
        if (mood === 'Burned Out' && task.energyLevel !== 'Recharge') {
          return { ...task, estimatedMinutes: Math.min(task.estimatedMinutes, 10), title: task.title.includes('Sprint') ? task.title : `🚨 Micro-Sprint: ${task.title}` };
        } else if (mood === 'Neutral' && task.energyLevel === 'High Focus') {
          return { ...task, estimatedMinutes: Math.min(task.estimatedMinutes, 15), title: task.title.includes('Sprint') ? task.title : `🚨 Sprint: ${task.title}` };
        }
      }
      return task;
    });

    const now = new Date();
    const bedtime = new Date();
    bedtime.setHours(23, 0, 0, 0); 
    if (now > bedtime) bedtime.setDate(bedtime.getDate() + 1);
    let minutesUntilSleep = Math.floor((bedtime - now) / 60000);
    if (minutesUntilSleep <= 0) minutesUntilSleep = 60;

    const highTasks = processedTasks.filter(t => t.priority === 'High');
    const medTasks = processedTasks.filter(t => t.priority === 'Medium');
    const lowTasks = processedTasks.filter(t => t.priority === 'Low');

    let orderedTasks = [];
    if (mood === 'Energized') {
      orderedTasks = [...highTasks, ...medTasks, ...lowTasks]; 
    } else if (mood === 'Neutral') {
      orderedTasks = [...highTasks, ...medTasks, ...lowTasks]; 
    } else { 
      if (minutesUntilSleep > 120) {
        orderedTasks = [...lowTasks, ...highTasks, ...medTasks]; 
      } else {
        orderedTasks = [...highTasks, ...lowTasks, ...medTasks]; 
      }
    }

    let finalQueue = [];
    const totalQueueTime = orderedTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    if (totalQueueTime > minutesUntilSleep) {
      const ratio = minutesUntilSleep / totalQueueTime;
      orderedTasks.forEach(t => {
        const squeezedTime = Math.max(5, Math.floor(t.estimatedMinutes * ratio));
        finalQueue.push({ ...t, estimatedMinutes: squeezedTime, title: t.title.includes('Squeezed') ? t.title : `⏱️ Squeezed: ${t.title}` });
      });
    } else if (totalQueueTime > 0 && totalQueueTime < minutesUntilSleep) {
      const ratio = minutesUntilSleep / totalQueueTime;
      const safeRatio = Math.min(ratio, 1.5); 
      orderedTasks.forEach(t => {
        const stretchedTime = Math.floor(t.estimatedMinutes * safeRatio);
        finalQueue.push({ ...t, estimatedMinutes: stretchedTime, title: t.title.includes('Expanded') ? t.title : `🧘 Expanded: ${t.title}` });
      });
    } else {
      finalQueue = orderedTasks;
    }

    if (finalQueue.length > 0) {
      setActiveTask(finalQueue[0]);
      setQueueTasks(finalQueue.slice(1));
      syncLayoutToStorage(finalQueue[0], finalQueue.slice(1));
    } else {
      setActiveTask(null);
      setQueueTasks([]);
      syncLayoutToStorage(null, []);
    }
  };

  useEffect(() => {
    const fetchDatabaseTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        setAllTasks(response.data);
        if (localStorage.getItem('hasEveningStarted') === 'true') {
          const savedActiveId = localStorage.getItem('activeTaskId');
          const savedQueueIds = JSON.parse(localStorage.getItem('queueTaskIds') || '[]');
          const hydratedActive = response.data.find(t => t._id === savedActiveId) || null;
          const hydratedQueue = savedQueueIds.map(id => response.data.find(t => t._id === id)).filter(Boolean);

          if (hydratedActive) {
            setActiveTask(hydratedActive);
            setQueueTasks(hydratedQueue);
          } else {
            processAndQueueTasks(localStorage.getItem('currentMood'), response.data);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from MongoDB:", error);
        setIsLoading(false);
      }
    };
    fetchDatabaseTasks();
  }, []);

  const applyMoodAndStart = (mood) => {
    setCurrentMood(mood);
    setIsMoodModalOpen(false);
    setHasEveningStarted(true);
    localStorage.setItem('hasEveningStarted', 'true');
    localStorage.setItem('currentMood', mood);
    processAndQueueTasks(mood, allTasks);
  };

  const handleEndSession = () => {
    setHasEveningStarted(false);
    setCurrentMood(null);
    setActiveTask(null);
    setQueueTasks([]);
    localStorage.clear();
  };

  const handleTaskAdded = (newTask) => {
    setAllTasks([...allTasks, newTask]);
    if (hasEveningStarted) processAndQueueTasks(currentMood, [...allTasks, newTask]);
  };

  const openEditModal = (task) => { setTaskToEdit(task); setIsEditModalOpen(true); };

  const handleTaskUpdated = (updatedTask) => {
    const updatedAllTasks = allTasks.map(t => t._id === updatedTask._id ? updatedTask : t);
    setAllTasks(updatedAllTasks);
    if (activeTask && activeTask._id === updatedTask._id) {
      setActiveTask(updatedTask);
      syncLayoutToStorage(updatedTask, queueTasks);
    }
    const updatedQueue = queueTasks.map(t => t._id === updatedTask._id ? updatedTask : t);
    setQueueTasks(updatedQueue);
    syncLayoutToStorage(activeTask, updatedQueue);
  };

  // ------------------------------------------------------------------
  // THE NEW GLOBAL INTERCEPTOR ENGINE
  // ------------------------------------------------------------------
  const finalizeTaskCompletion = async (taskId, timeSpent) => {
    const undertime = activeTask.estimatedMinutes - timeSpent;
    let updatedQueue = [...queueTasks];
    if (undertime > 0) updatedQueue = applyTimeBonus(updatedQueue, undertime);

    try {
      if (!activeTask.isSystemGenerated) {
        await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: 'completed', completedAt: new Date() });
        setAllTasks(allTasks.map(t => t._id === taskId ? { ...t, status: 'completed', completedAt: new Date() } : t));
      }

      if (updatedQueue.length > 0) {
        const nextTask = updatedQueue[0];
        
        // INTERCEPTOR 1: After a Break -> Offer a High Priority Task
        if (activeTask.energyLevel === 'Recharge' && !activeTask.isSystemGenerated) {
          const hasHighPri = updatedQueue.some(t => t.priority === 'High');
          if (hasHighPri && nextTask.priority !== 'High') {
            setPendingNextTaskData({ nextTask, updatedQueue });
            setIsRechargeModalOpen(true);
            return;
          }
        }

        // INTERCEPTOR 2: After Work -> Offer a Low Priority Task to Relax (Across ALL moods)
        if (activeTask.energyLevel !== 'Recharge' && !activeTask.isSystemGenerated) {
          const hasLowPri = updatedQueue.some(t => t.priority === 'Low');
          if (hasLowPri && nextTask.priority !== 'Low') {
            setPendingNextTaskData({ nextTask, updatedQueue });
            setIsRelaxModalOpen(true);
            return;
          }
        }

        setActiveTask(nextTask);
        setQueueTasks(updatedQueue.slice(1));
        syncLayoutToStorage(nextTask, updatedQueue.slice(1)); 
      } else {
        setActiveTask(null);
        setQueueTasks([]);
        syncLayoutToStorage(null, []);
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleComplete = async (taskId, actualMinutesSpent) => {
    const timeSpent = actualMinutesSpent || activeTask.estimatedMinutes;
    const overtime = timeSpent - activeTask.estimatedMinutes;

    if (overtime > 0) {
      setActiveTask({ ...activeTask, timeSpent: timeSpent }); 
      setIsOvertimeModalOpen(true);
      return; 
    }
    
    finalizeTaskCompletion(taskId, timeSpent);
  };

  // --- Modal Button Handlers ---
  const handlePullHighTask = () => {
    setIsRechargeModalOpen(false);
    const { updatedQueue } = pendingNextTaskData;
    const highIndex = updatedQueue.findIndex(t => t.priority === 'High');
    const highTask = updatedQueue[highIndex];
    
    const newQueue = [...updatedQueue];
    newQueue.splice(highIndex, 1);

    setActiveTask(highTask);
    setQueueTasks(newQueue);
    syncLayoutToStorage(highTask, newQueue);
  };

  const handleAcceptRelax = () => {
    setIsRelaxModalOpen(false);
    const { updatedQueue } = pendingNextTaskData;
    const lowIndex = updatedQueue.findIndex(t => t.priority === 'Low');
    const lowTask = updatedQueue[lowIndex];

    const newQueue = [...updatedQueue];
    newQueue.splice(lowIndex, 1);

    setActiveTask(lowTask);
    setQueueTasks(newQueue);
    syncLayoutToStorage(lowTask, newQueue);
  };

  const handleKeepSchedule = () => {
    setIsRechargeModalOpen(false);
    setIsRelaxModalOpen(false);
    setIsBreakSuggestionOpen(false);
    setActiveTask(pendingNextTaskData.nextTask);
    setQueueTasks(pendingNextTaskData.updatedQueue.slice(1));
    syncLayoutToStorage(pendingNextTaskData.nextTask, pendingNextTaskData.updatedQueue.slice(1));
  };

  // Phantom Break task logic
  const handleAcceptBreak = () => {
    setIsBreakSuggestionOpen(false);
    const breakTask = {
      _id: `sys_break_${Date.now()}`,
      title: '☕ Quick Recharge',
      estimatedMinutes: 10,
      energyLevel: 'Recharge',
      priority: 'Low',
      project: 'Wellness',
      isSystemGenerated: true
    };
    setActiveTask(breakTask);
    setQueueTasks(pendingNextTaskData.updatedQueue); 
    syncLayoutToStorage(breakTask, pendingNextTaskData.updatedQueue);
  };

  const handleRestoreTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: 'Pending', completedAt: null, timeSpent: 0 });
      const updatedTasks = allTasks.map(t => t._id === taskId ? { ...t, status: 'Pending', completedAt: null, timeSpent: 0 } : t);
      setAllTasks(updatedTasks);
      if (hasEveningStarted) processAndQueueTasks(currentMood, updatedTasks);
    } catch (error) { console.error(error); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      setAllTasks(allTasks.filter(task => task._id !== taskId));
    } catch (error) { console.error(error); }
  };

  const handleReorderQueue = (newOrderedTasks) => {
    setQueueTasks(newOrderedTasks);
    syncLayoutToStorage(activeTask, newOrderedTasks);
  };

  // --- Background Auto-Sync ---
  const handleSyncSchedule = () => {
    if (!hasEveningStarted || queueTasks.length === 0 || !activeTask) return;
    const now = new Date();
    const bedtime = new Date();
    bedtime.setHours(23, 0, 0, 0); 
    if (now > bedtime) bedtime.setDate(bedtime.getDate() + 1);
    const minutesUntilSleep = Math.floor((bedtime - now) / 60000);
    const activeSecondsSpent = parseInt(localStorage.getItem(`timer_${activeTask._id}`) || 0, 10);
    const activeMinutesRemaining = Math.max(0, activeTask.estimatedMinutes - Math.floor(activeSecondsSpent / 60));
    
    let queueTimeRemaining = minutesUntilSleep - activeMinutesRemaining;
    if (queueTimeRemaining <= 0) queueTimeRemaining = 0; 

    const queueTotalTime = queueTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    if (queueTotalTime <= queueTimeRemaining) return; 

    const highTasks = queueTasks.filter(t => t.priority === 'High');
    const medTasks = queueTasks.filter(t => t.priority === 'Medium');
    const lowTasks = queueTasks.filter(t => t.priority === 'Low');

    let finalQueue = [];
    const processGroup = (group) => {
      if (group.length === 0 || queueTimeRemaining <= 0) return;
      const groupTotalTime = group.reduce((sum, t) => sum + t.estimatedMinutes, 0);
      if (groupTotalTime <= queueTimeRemaining) {
        finalQueue.push(...group);
        queueTimeRemaining -= groupTotalTime;
      } else {
        const ratio = queueTimeRemaining / groupTotalTime;
        group.forEach(t => {
          const squeezedTime = Math.max(5, Math.floor(t.estimatedMinutes * ratio)); 
          finalQueue.push({ ...t, estimatedMinutes: squeezedTime, title: t.title.includes('Synced') ? t.title : `🔄 Synced: ${t.title}` });
        });
        queueTimeRemaining = 0; 
      }
    };

    processGroup(highTasks);
    processGroup(medTasks);
    processGroup(lowTasks);
    setQueueTasks(finalQueue);
    syncLayoutToStorage(activeTask, finalQueue);
  };

  useEffect(() => {
    let autoSyncInterval;
    if (hasEveningStarted && queueTasks.length > 0) {
      autoSyncInterval = setInterval(() => { handleSyncSchedule(); }, 5000); 
    }
    return () => clearInterval(autoSyncInterval);
  }, [hasEveningStarted, queueTasks, activeTask]); 

  if (isLoading) return <div className="min-h-screen bg-[#0d0d12] text-white flex items-center justify-center"><p className="animate-pulse">Syncing...</p></div>;

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white p-6 md:p-12 font-sans selection:bg-green-500/30">
      <div className="max-w-md mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight">Good Evening.</h1>
          <div className="flex items-center gap-4">
            <SleepCountdown targetBedtime="23:00" />
            <button onClick={() => setIsAddModalOpen(true)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors cursor-pointer border border-white/10" title="Add New Task">+</button>
          </div>
        </header>

        {!hasEveningStarted ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-[32px] mb-8">
            <h2 className="text-2xl font-bold mb-2">Ready to begin?</h2>
            <p className="text-gray-400 mb-8 text-center px-6">Your tasks are synced. Let the algorithm optimize your night.</p>
            <button onClick={() => setIsMoodModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 cursor-pointer border border-blue-400/50 mb-6">Start My Evening</button>
            <ConsistencyHeatmap tasks={allTasks} />
            <ProjectSummary tasks={allTasks.filter(t => t.status !== 'completed')} />
            <MasterTaskList tasks={allTasks} onDelete={handleDeleteTask} onEdit={openEditModal} onRestore={handleRestoreTask} />
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Current State:</span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-400 border border-blue-500/30">{currentMood}</span>
              </div>
              <button onClick={handleEndSession} className="text-xs font-bold text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 bg-white/5 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2">🏠 Back to Dashboard</button>
            </div>

            <EveningTimeline activeTask={activeTask} queueTasks={queueTasks} />

            {activeTask ? (
              <ActiveTaskCard task={activeTask} onComplete={handleComplete} />
            ) : (
              <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl bg-white/5 mb-6"><p className="text-gray-400">No active tasks match your current mood. You are free!</p></div>
            )}

            <TaskQueue tasks={queueTasks} onReorder={handleReorderQueue} />
            {/* NEW: Completed Tasks show up immediately at the bottom of the active page! */}
            {allTasks.filter(t => t.status === 'completed').length > 0 && (
              <div className="mt-12 border-t border-white/10 pt-8">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2 opacity-50">
                  <span>✅</span> Completed Tonight
                </h3>
                <div className="flex flex-col gap-3 opacity-60 hover:opacity-100 transition-opacity">
                  {allTasks.filter(t => t.status === 'completed').map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                      <h4 className="font-semibold text-gray-400 line-through">{task.title}</h4>
                      <button 
                        onClick={() => handleRestoreTask(task._id)} 
                        className="text-gray-500 hover:text-green-400 hover:bg-green-500/10 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-bold"
                      >
                        ↩️ Undo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* END OF NEW SECTION */}
          </>
        )}

        <MoodSelectorModal isOpen={isMoodModalOpen} onSelectMood={applyMoodAndStart} onClose={() => setIsMoodModalOpen(false)} />
        <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onTaskAdded={handleTaskAdded} />
        <EditTaskModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} taskToEdit={taskToEdit} onTaskUpdated={handleTaskUpdated} />
        
        <RechargeCheckModal isOpen={isRechargeModalOpen} onPullHighTask={handlePullHighTask} onKeepSchedule={handleKeepSchedule} />
        <RelaxSuggestionModal isOpen={isRelaxModalOpen} onAcceptRelax={handleAcceptRelax} onSkipRelax={handleKeepSchedule} />
        <BreakSuggestionModal isOpen={isBreakSuggestionOpen} onAcceptBreak={handleAcceptBreak} onSkipBreak={handleKeepSchedule} />

        <OvertimeModal isOpen={isOvertimeModalOpen} taskTitle={activeTask?.title} overtimeMinutes={activeTask ? activeTask.timeSpent - activeTask.estimatedMinutes : 0} onDropTask={() => setIsOvertimeModalOpen(false)} onPushBedtime={() => setIsOvertimeModalOpen(false)} />
      </div>
    </div>
  );
}

export default App;