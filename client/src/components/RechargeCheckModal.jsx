import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const RechargeCheckModal = ({ isOpen, onPullHighTask, onKeepSchedule }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Break Complete! 🔋</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            You just finished a recharge task. Since you are rested, do you want to pull a High Priority task to the front of the queue right now?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <button onClick={onPullHighTask} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
            🚀 Yes, give me a High Priority task
          </button>
          <button onClick={onKeepSchedule} className="w-full bg-white/5 hover:bg-white/10 text-gray-400 p-4 rounded-xl font-bold text-lg transition-colors border border-white/10 cursor-pointer">
            ➡️ No, just follow the normal schedule
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeCheckModal;