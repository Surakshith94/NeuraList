import { useState, useEffect } from 'react';
import axios from 'axios';
import ActiveTaskCard from './components/ActiveTaskCard';
import OvertimeModal from './components/OvertimeModal';
import TaskQueue from './components/TaskQueue'; 
import AddTaskModal from './components/AddTaskModal'; // <-- NEW IMPORT

function App() {
  const [activeTask, setActiveTask] = useState(null);
  const [queueTasks, setQueueTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // <-- NEW STATE

  useEffect(() => {
    const fetchDatabaseTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        const allTasks = response.data;
        if (allTasks.length > 0) {
          setActiveTask(allTasks[0]);
          setQueueTasks(allTasks.slice(1));
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from MongoDB:", error);
        setIsLoading(false);
      }
    };
    fetchDatabaseTasks();
  }, []);

  // --- NEW: Handle a newly added task ---
  const handleTaskAdded = (newTask) => {
    if (!activeTask) {
      // If we have nothing active, make this the active task
      setActiveTask(newTask);
    } else {
      // Otherwise, push it to the queue
      setQueueTasks([...queueTasks, newTask]);
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
          {/* NEW: The + Button to open the Add Task modal */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors cursor-pointer border border-white/10"
          >
            +
          </button>
        </header>

        {activeTask ? (
          <ActiveTaskCard task={activeTask} onComplete={handleComplete} onPause={handlePause} />
        ) : (
          <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl bg-white/5 mb-6">
            <p className="text-gray-400">No active tasks right now.</p>
          </div>
        )}

        <TaskQueue tasks={queueTasks} />

        <OvertimeModal 
          isOpen={isOvertimeModalOpen}
          taskTitle={activeTask?.title}
          overtimeMinutes={activeTask ? activeTask.timeSpent - activeTask.estimatedMinutes : 0}
          onDropTask={() => setIsOvertimeModalOpen(false)}
          onPushBedtime={() => setIsOvertimeModalOpen(false)}
        />

        {/* NEW: Rendering the Add Task Modal */}
        <AddTaskModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onTaskAdded={handleTaskAdded} 
        />

      </div>
    </div>
  );
}

export default App;