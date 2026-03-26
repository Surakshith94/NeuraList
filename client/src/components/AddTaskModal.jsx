import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import axios from 'axios';

const AddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [energyLevel, setEnergyLevel] = useState('Neutral');
  // --- NEW: State for Project Tag ---
  const [project, setProject] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !minutes) return alert("Please enter a title and estimated minutes!");

    const newTask = {
      title,
      estimatedMinutes: Number(minutes),
      priority,
      energyLevel,
      // Pass the project (or default to 'General' if left blank)
      project: project.trim() === '' ? 'General' : project, 
      isFlexible: true 
    };

    try {
      const response = await axios.post('http://localhost:5000/api/tasks', newTask);
      onTaskAdded(response.data); 
      
      // Clear form
      setTitle(''); setMinutes(''); setPriority('Medium'); setEnergyLevel('Neutral'); setProject('');
      onClose(); 
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Task</DialogTitle>
          <DialogDescription className="text-gray-400 mt-1">What do you need to get done today?</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <input 
            type="text" placeholder="Task Name (e.g., Fix Socket.io bugs)" 
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50"
            value={title} onChange={e => setTitle(e.target.value)}
          />
          
          <div className="flex gap-3">
            <input 
              type="number" placeholder="Mins (e.g., 45)" 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50"
              value={minutes} onChange={e => setMinutes(e.target.value)}
            />
            {/* NEW: Project Input */}
            <input 
              type="text" placeholder="Project (e.g., SyncSpace)" 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50"
              value={project} onChange={e => setProject(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none cursor-pointer" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="High" className="bg-[#121218]">High Priority</option>
              <option value="Medium" className="bg-[#121218]">Medium Priority</option>
              <option value="Low" className="bg-[#121218]">Low Priority</option>
            </select>
            <select className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none cursor-pointer" value={energyLevel} onChange={e => setEnergyLevel(e.target.value)}>
              <option value="High Focus" className="bg-[#121218]">High Focus</option>
              <option value="Neutral" className="bg-[#121218]">Neutral</option>
              <option value="Recharge" className="bg-[#121218]">Recharge</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl p-4 font-bold mt-2 transition-colors cursor-pointer">
            + Create Task
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;