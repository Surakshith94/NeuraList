import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const BreakSuggestionModal = ({ isOpen, onAcceptBreak, onSkipBreak }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Pace Yourself 🛑</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            You are moving fast and have plenty of time left tonight, but your next task is High Priority. Do you want to take a quick 10-minute breather before tackling it?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <button onClick={onAcceptBreak} className="w-full bg-green-600 hover:bg-green-500 text-white p-4 rounded-xl font-bold text-lg transition-colors cursor-pointer shadow-lg shadow-green-500/20">
            ☕ Yes, give me a 10 min break
          </button>
          <button onClick={onSkipBreak} className="w-full bg-white/5 hover:bg-white/10 text-gray-400 p-4 rounded-xl font-bold text-lg transition-colors cursor-pointer border border-white/10">
            🚀 No, keep the momentum going!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BreakSuggestionModal;