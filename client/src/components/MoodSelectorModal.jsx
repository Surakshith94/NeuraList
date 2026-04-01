import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const MoodSelectorModal = ({ isOpen, onSelectMood, onClose }) => {
  return (
    // onOpenChange={onClose} is what handles the "click outside to close" feature!
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px]">
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            How are you feeling?
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            The algorithm will adjust your schedule based on your current energy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <button onClick={() => onSelectMood('Energized')} className="w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 p-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-between cursor-pointer">
            <span>🚀 Energized</span><span className="text-sm font-normal text-green-500/70">Show all tasks</span>
          </button>
          <button onClick={() => onSelectMood('Neutral')} className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 p-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-between cursor-pointer">
            <span>😐 Normal</span><span className="text-sm font-normal text-blue-500/70">Standard schedule</span>
          </button>
          <button onClick={() => onSelectMood('Burned Out')} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 p-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-between cursor-pointer">
            <span>😫 Burned Out</span><span className="text-sm font-normal text-red-500/70">Recharge only</span>
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default MoodSelectorModal;