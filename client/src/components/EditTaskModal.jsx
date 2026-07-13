import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import axios from 'axios';

const EditTaskModal = ({ isOpen, onClose, taskToEdit, onTaskUpdated }) => {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [energyLevel, setEnergyLevel] = useState('Neutral');
  const [project, setProject] = useState('');

  // When the modal opens and receives a task, instantly fill the form!
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setMinutes(taskToEdit.estimatedMinutes || '');
      setPriority(taskToEdit.priority || 'Medium');
      setEnergyLevel(taskToEdit.energyLevel || 'Neutral');
      setProject(taskToEdit.project || 'General');
    }
  }, [taskToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !minutes) return alert("Please enter a title and estimated minutes!");

    const updatedData = {
      title,
      estimatedMinutes: Number(minutes),
      priority,
      energyLevel,
      project: project.trim() === '' ? 'General' : project,
    };

    try {
      // Send the updated data to the backend
      const response = await axios.put(`http://localhost:5000/api/tasks/${taskToEdit._id}`, updatedData);
      
      // Send the new saved task back to App.jsx
      onTaskUpdated(response.data); 
      onClose(); 
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Task</DialogTitle>
          <DialogDescription className="text-gray-400 mt-1">Make changes to your existing task.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <input 
            type="text" placeholder="Task Name" 
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors"
            value={title} onChange={e => setTitle(e.target.value)}
          />
          
          <div className="flex gap-3">
            <input 
              type="number" placeholder="Mins" 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors"
              value={minutes} onChange={e => setMinutes(e.target.value)}
            />
            <input 
              type="text" placeholder="Project" 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors"
              value={project} onChange={e => setProject(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500/50 cursor-pointer" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="High" className="bg-[#121218]">High Priority</option>
              <option value="Medium" className="bg-[#121218]">Medium Priority</option>
              <option value="Low" className="bg-[#121218]">Low Priority</option>
            </select>
            <select className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500/50 cursor-pointer" value={energyLevel} onChange={e => setEnergyLevel(e.target.value)}>
              <option value="High Focus" className="bg-[#121218]">High Focus</option>
              <option value="Neutral" className="bg-[#121218]">Neutral</option>
              <option value="Recharge" className="bg-[#121218]">Recharge</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl p-4 font-bold mt-2 transition-colors cursor-pointer">
            Save Changes
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;