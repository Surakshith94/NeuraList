import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axios from 'axios';

const AddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [energyLevel, setEnergyLevel] = useState('Neutral');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !minutes) return alert("Please enter a title and estimated minutes!");

    const newTask = {
      title,
      estimatedMinutes: Number(minutes),
      priority,
      energyLevel,
      isFlexible: true 
    };

    try {
      // Send the new task to your Node/Express backend
      const response = await axios.post('http://localhost:5000/api/tasks', newTask);
      
      // Send the saved task back to App.jsx to update the UI instantly
      onTaskAdded(response.data); 
      
      // Clear the form and close the modal
      setTitle(''); setMinutes(''); setPriority('Medium'); setEnergyLevel('Neutral');
      onClose(); 
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    // onOpenChange allows the modal to close if you click outside of it
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px]">
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Task</DialogTitle>
          <DialogDescription className="text-gray-400 mt-1">
            What do you need to get done today?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <input 
            type="text" 
            placeholder="e.g., Fix SyncSpace database or Play Valorant" 
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors"
            value={title} 
            onChange={e => setTitle(e.target.value)}
          />
          
          <input 
            type="number" 
            placeholder="Estimated Minutes (e.g., 45)" 
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors"
            value={minutes} 
            onChange={e => setMinutes(e.target.value)}
          />
          
          <div className="flex gap-3">
            <select 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer" 
              value={priority} 
              onChange={e => setPriority(e.target.value)}
            >
              <option value="High" className="bg-[#121218]">High Priority</option>
              <option value="Medium" className="bg-[#121218]">Medium Priority</option>
              <option value="Low" className="bg-[#121218]">Low Priority</option>
            </select>
            
            <select 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer" 
              value={energyLevel} 
              onChange={e => setEnergyLevel(e.target.value)}
            >
              <option value="High Focus" className="bg-[#121218]">High Focus</option>
              <option value="Neutral" className="bg-[#121218]">Neutral</option>
              <option value="Recharge" className="bg-[#121218]">Recharge</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl p-4 font-bold mt-2 transition-colors cursor-pointer"
          >
            + Create Task
          </button>
        </form>

      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;