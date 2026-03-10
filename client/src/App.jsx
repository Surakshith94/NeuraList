import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [energyLevel, setEnergyLevel] = useState('Neutral');

  // --- NEW: Mood Tracking State ---
  const [currentMood, setCurrentMood] = useState(null); // null means you haven't checked in yet

  // --- NEW: Time State ---
  const [bedtime, setBedtime] = useState('23:00'); // Default 11:00 PM
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [scheduledTasks, setScheduledTasks] = useState([]); // Tasks that actually fit
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

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title || !minutes) return alert("Please enter a title and estimated minutes!");

    const newTask = { title, estimatedMinutes: Number(minutes), priority, energyLevel, isFlexible: true };

    try {
      const response = await axios.post('http://localhost:5000/api/tasks', newTask);
      setTasks([...tasks, response.data]);
      setTitle(''); setMinutes(''); setPriority('Medium'); setEnergyLevel('Neutral');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // --- NEW: The Smart Scheduling Algorithm ---
  const generateSchedule = () => {
    // 1. Calculate Time Remaining until Bedtime
    const now = new Date();
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const bedDate = new Date();
    bedDate.setHours(bedHour, bedMin, 0, 0);

    // If bedtime is already past for today (e.g., it's 1 AM), push to tomorrow
    if (bedDate < now) {
      bedDate.setDate(bedDate.getDate() + 1);
    }

    const diffMs = bedDate - now;
    const diffMins = Math.floor(diffMs / 60000); // Convert milliseconds to minutes
    setTimeRemaining(diffMins);

    // 2. Filter by Mood First
    let availableTasks = [...tasks];
    if (currentMood === 'Tired') {
      availableTasks = availableTasks.filter(task => task.energyLevel === 'Recharge');
    } else if (currentMood === 'Good') {
      availableTasks = availableTasks.filter(task => task.energyLevel === 'High Focus' || task.energyLevel === 'Neutral');
    }

    // 3. Sort by Priority (High -> Medium -> Low)
    const priorityValues = { 'High': 3, 'Medium': 2, 'Low': 1 };
    availableTasks.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);

    // 4. The Greedy Algorithm: Pack tasks until time runs out
    let minutesUsed = 0;
    const finalSchedule = [];

    for (let task of availableTasks) {
      if (minutesUsed + task.estimatedMinutes <= diffMins) {
        finalSchedule.push(task);
        minutesUsed += task.estimatedMinutes;
      }
    }

    setScheduledTasks(finalSchedule);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Smart To-Do Engine</h1>
      
      {/* Input Form */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>Add a New Task</h3>
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '8px' }} />
          <input type="number" placeholder="Estimated Minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} style={{ padding: '8px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '8px', flex: 1 }}>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <select value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} style={{ padding: '8px', flex: 1 }}>
              <option value="High Focus">High Focus</option>
              <option value="Neutral">Neutral</option>
              <option value="Recharge">Recharge</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Add Task</button>
        </form>
      </div>

      {/* Mood & Schedule Generator UI */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
        <h3>Step 1: Target Bedtime</h3>
        <input 
          type="time" 
          value={bedtime} 
          onChange={(e) => setBedtime(e.target.value)} 
          style={{ padding: '10px', fontSize: '16px', marginBottom: '15px' }}
        />

        <h3>Step 2: How are you feeling right now?</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px', marginBottom: '20px' }}>
          <button onClick={() => setCurrentMood('Good')} style={{ padding: '10px 20px', background: currentMood === 'Good' ? '#0d6efd' : '#fff', color: currentMood === 'Good' ? '#fff' : '#0d6efd', border: '2px solid #0d6efd', borderRadius: '5px', cursor: 'pointer' }}>🚀 Good</button>
          <button onClick={() => setCurrentMood('Tired')} style={{ padding: '10px 20px', background: currentMood === 'Tired' ? '#dc3545' : '#fff', color: currentMood === 'Tired' ? '#fff' : '#dc3545', border: '2px solid #dc3545', borderRadius: '5px', cursor: 'pointer' }}>😫 Tired</button>
          <button onClick={() => setCurrentMood(null)} style={{ padding: '10px 20px', background: 'transparent', color: '#6c757d', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Clear</button>
        </div>

        <button onClick={generateSchedule} style={{ padding: '12px 24px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%' }}>
          ✨ Generate My Evening Schedule
        </button>
      </div>

      {/* Display Output */}
      {timeRemaining !== null && (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeeba' }}>
          <strong>⏱️ Time until Bedtime:</strong> {timeRemaining} minutes available.
        </div>
      )}

      <h2>Your Optimized Schedule</h2>
      {loading ? (
        <p>Loading...</p>
      ) : scheduledTasks.length === 0 && timeRemaining !== null ? (
        <p>No tasks fit into your remaining time and current mood. Take a break!</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {scheduledTasks.map((task) => (
            <li key={task._id} style={{ background: '#f4f4f4', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', borderLeft: task.priority === 'High' ? '5px solid #dc3545' : '5px solid transparent' }}>
              <div>
                <strong>{task.title}</strong>
                <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#555' }}>
                  {task.estimatedMinutes} mins | {task.energyLevel}
                </p>
              </div>
              <span style={{ fontWeight: 'bold', color: '#666' }}>{task.priority}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;