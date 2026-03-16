import { useState, useEffect } from 'react';
import axios from 'axios';
import ActiveTaskCard from './components/ActiveTaskCard';
import OvertimeModal from './components/OvertimeModal';
import TaskQueue from './components/TaskQueue'; 
import AddTaskModal from './components/AddTaskModal'; 
import MoodSelectorModal from './components/MoodSelectorModal'; // <-- NEW IMPORT

function App() {
  // Store EVERYTHING from the database here
  const [allTasks, setAllTasks] = useState([]); 
  
  // What the user actually sees based on the algorithm
  const [activeTask, setActiveTask] = useState(null);
  const [queueTasks, setQueueTasks] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [hasEveningStarted, setHasEveningStarted] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch from database on load
  useEffect(() => {
    const fetchDatabaseTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        setAllTasks(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from MongoDB:", error);
        setIsLoading(false);
      }
    };
    fetchDatabaseTasks();
  }, []);

  // --- NEW: THE SMART FILTERING ALGORITHM ---
  const applyMoodAndStart = (mood) => {
    setCurrentMood(mood);
    setIsMoodModalOpen(false);
    setHasEveningStarted(true);

    let filteredTasks = [...allTasks];

    // If Burned Out, ONLY show tasks tagged as "Recharge" (like gaming/movies)
    if (mood === 'Burned Out') {
      filteredTasks = filteredTasks.filter(task => task.energyLevel === 'Recharge');
    } 
    // If Normal, hide "High Focus" but keep Neutral and Recharge
    else if (mood === 'Neutral') {
      filteredTasks = filteredTasks.filter(task => task.energyLevel !== 'High Focus');
    }
    // If Energized, keep everything (no filter needed)

    if (filteredTasks.length > 0) {
      setActiveTask(filteredTasks[0]);
      setQueueTasks(filteredTasks.slice(1));
    } else {
      setActiveTask(null);
      setQueueTasks([]);
    }
  };

  const handleTaskAdded = (newTask) => {
    setAllTasks([...allTasks, newTask]);
    // If the evening is already running, we should just push it to the queue
    if (hasEveningStarted) {
      if (!activeTask) setActiveTask(newTask);
      else setQueueTasks([...queueTasks, newTask]);
    }
  };

  const handleComplete = (taskId) => {
    const overtime = activeTask.timeSpent - activeTask.estimatedMinutes;
    if (overtime > 0) {
      setIsOvertimeModalOpen(true);
    } else {
      alert('Task finished on time!');
    }
  };

  const handlePause = (taskId) => {
    alert('Task paused.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] text-white flex items-center justify-center font-sans">
        <p className="text-xl text-gray-400 animate-pulse">Syncing with database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white p-6 md:p-12 font-sans selection:bg-green-500/30">
      <div className="max-w-md mx-auto">
        
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight">
            Good Evening.
          </h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors cursor-pointer border border-white/10"
          >
            +
          </button>
        </header>

        {/* --- NEW: The Start State vs Active State --- */}
        {!hasEveningStarted ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-[32px] mb-8">
            <h2 className="text-2xl font-bold mb-2">Ready to begin?</h2>
            <p className="text-gray-400 mb-8 text-center px-6">Your tasks are synced. Let the algorithm optimize your night.</p>
            <button 
              onClick={() => setIsMoodModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 cursor-pointer border border-blue-400/50"
            >
              Start My Evening
            </button>
          </div>
        ) : (
          <>
            {/* Show active mood tag */}
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm text-gray-400">Current State:</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-400 border border-blue-500/30">
                {currentMood}
              </span>
            </div>

            {activeTask ? (
              <ActiveTaskCard task={activeTask} onComplete={handleComplete} onPause={handlePause} />
            ) : (
              <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl bg-white/5 mb-6">
                <p className="text-gray-400">No active tasks match your current mood.</p>
              </div>
            )}

            <TaskQueue tasks={queueTasks} />
          </>
        )}

        {/* All our Modals */}
        <MoodSelectorModal 
          isOpen={isMoodModalOpen} 
          onSelectMood={applyMoodAndStart} 
        />

        <AddTaskModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onTaskAdded={handleTaskAdded} 
        />

        <OvertimeModal 
          isOpen={isOvertimeModalOpen}
          taskTitle={activeTask?.title}
          overtimeMinutes={activeTask ? activeTask.timeSpent - activeTask.estimatedMinutes : 0}
          onDropTask={() => setIsOvertimeModalOpen(false)}
          onPushBedtime={() => setIsOvertimeModalOpen(false)}
        />

      </div>
    </div>
  );
}

export default App;