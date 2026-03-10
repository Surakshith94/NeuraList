import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // State for fetching tasks
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the new task form
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [energyLevel, setEnergyLevel] = useState('Neutral');

  // Fetch tasks on load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        setTasks(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Handle form submission
  const handleAddTask = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    
    if (!title || !minutes) return alert("Please enter a title and estimated minutes!");

    const newTask = {
      title: title,
      estimatedMinutes: Number(minutes),
      priority: priority,
      energyLevel: energyLevel,
      isFlexible: true 
    };

    try {
      // Send to backend
      const response = await axios.post('http://localhost:5000/api/tasks', newTask);
      
      // Update the UI immediately without reloading
      setTasks([...tasks, response.data]);
      
      // Clear the form
      setTitle('');
      setMinutes('');
      setPriority('Medium');
      setEnergyLevel('Neutral');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Smart To-Do Engine</h1>
      
      {/* THE INPUT FORM */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>Add a New Task</h3>
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <input 
            type="text" 
            placeholder="e.g., Build SyncSpace whiteboard or Calisthenics routine" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ padding: '8px' }}
          />
          
          <input 
            type="number" 
            placeholder="Estimated Minutes (e.g., 45)" 
            value={minutes} 
            onChange={(e) => setMinutes(e.target.value)} 
            style={{ padding: '8px' }}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '8px', flex: 1 }}>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} style={{ padding: '8px', flex: 1 }}>
              <option value="High Focus">High Focus (Deep Work)</option>
              <option value="Neutral">Neutral (Standard)</option>
              <option value="Recharge">Recharge (Gaming/Relaxing)</option>
            </select>
          </div>

          <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            + Add Task
          </button>
        </form>
      </div>

      <button style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', marginBottom: '20px', width: '100%', cursor: 'pointer' }}>
        Check In: Start My Evening
      </button>

      <h2>Today's Tasks</h2>
      {loading ? (
        <p>Loading your schedule...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks added yet. You are completely free!</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li key={task._id} style={{ background: '#f4f4f4', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{task.title}</strong>
                <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#555' }}>
                  {task.estimatedMinutes} mins | Energy: {task.energyLevel}
                </p>
              </div>
              <span style={{ 
                background: task.priority === 'High' ? '#ffcccc' : task.priority === 'Medium' ? '#fff3cd' : '#cce5ff', 
                padding: '5px 10px', 
                borderRadius: '5px',
                height: 'fit-content'
              }}>
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;