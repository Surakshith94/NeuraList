import { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure you import axios!
import ActiveTaskCard from './components/ActiveTaskCard';
import OvertimeModal from './components/OvertimeModal';
import TaskQueue from './components/TaskQueue'; 

function App() {
  // 1. Initialize empty states
  const [activeTask, setActiveTask] = useState(null);
  const [queueTasks, setQueueTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // To show a loading screen while fetching
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. The Fetch Logic (Runs once when the app opens)
  useEffect(() => {
    const fetchDatabaseTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        const allTasks = response.data;

        // For now, we will just grab the first task as the "Active" one, 
        // and put everything else in the "Up Next" queue.
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
  }, []); // Empty array means this only runs once on load

  // 3. Handlers
  const handleComplete = (taskId) => {
    // We will update this later to actually delete/update in MongoDB
    const overtime = activeTask.timeSpent - activeTask.estimatedMinutes;
    if (overtime > 0) {
      setIsModalOpen(true);
    } else {
      alert('Task finished on time!');
    }
  };

  const handlePause = (taskId) => {
    // We will update this later to pause in MongoDB
    alert('Task paused.');
  };

  // 4. Loading State UI
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 shadow-lg border border-white/20"></div>
        </header>

        {/* Only show the Active card if we actually have a task! */}
        {activeTask ? (
          <ActiveTaskCard 
            task={activeTask} 
            onComplete={handleComplete} 
            onPause={handlePause} 
          />
        ) : (
          <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl bg-white/5 mb-6">
            <p className="text-gray-400">No active tasks right now.</p>
          </div>
        )}

        <TaskQueue tasks={queueTasks} />

        {activeTask && (
          <OvertimeModal 
            isOpen={isModalOpen}
            taskTitle={activeTask.title}
            overtimeMinutes={activeTask.timeSpent - activeTask.estimatedMinutes}
            onDropTask={() => setIsModalOpen(false)}
            onPushBedtime={() => setIsModalOpen(false)}
          />
        )}

      </div>
    </div>
  );
}

export default App;