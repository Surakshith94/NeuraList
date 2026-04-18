import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const RelaxSuggestionModal = ({ isOpen, onAcceptRelax, onSkipRelax }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Pace Yourself 🛋️</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Task complete! Since you are in a Neutral mood, do you want to pull up a quick Low Priority task to relax before jumping into the next heavy task?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <button onClick={onAcceptRelax} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
            🛋️ Yes, give me an easy task
          </button>
          <button onClick={onSkipRelax} className="w-full bg-white/5 hover:bg-white/10 text-gray-400 p-4 rounded-xl font-bold text-lg transition-colors border border-white/10 cursor-pointer">
            🚀 No, keep the schedule going
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RelaxSuggestionModal;