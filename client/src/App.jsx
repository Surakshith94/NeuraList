import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // This runs the moment the app loads to fetch your data
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Hitting the GET route we made earlier
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Smart To-Do Engine</h1>
      
      {/* A simple Check-In Button for our future mood feature */}
      <button style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', marginBottom: '20px' }}>
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
                background: task.priority === 'High' ? '#ffcccc' : '#cce5ff', 
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