import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const RechargeCheckModal = ({ isOpen, onLevelUp, onStayRelaxed }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Break Complete! 🔋</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            You just finished a recharge task. Are you feeling ready to tackle some heavier focus tasks, or do you need to keep relaxing?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <button onClick={onLevelUp} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold text-lg transition-colors cursor-pointer shadow-lg shadow-blue-500/20">
            🚀 Yes, I'm ready to focus!
          </button>
          <button onClick={onStayRelaxed} className="w-full bg-white/5 hover:bg-white/10 text-gray-400 p-4 rounded-xl font-bold text-lg transition-colors cursor-pointer border border-white/10">
            🛋️ No, keep my schedule light.
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeCheckModal;