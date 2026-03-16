import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const OvertimeModal = ({ isOpen, taskTitle, overtimeMinutes, onDropTask, onPushBedtime }) => {
  return (
    // The Dialog component handles all the dark overlay and click-outside-to-close logic automatically
    <Dialog open={isOpen}> 
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-red-400">
            Overtime Detected ⏱️
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            You spent <span className="text-white font-bold">{overtimeMinutes} extra minutes</span> on "{taskTitle}". 
            To maintain your schedule, the algorithm needs instructions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-6">
          {/* Option 1: Drop a task */}
          <div className="p-4 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
            <h4 className="font-semibold mb-1">Option 1: Drop a low-priority task</h4>
            <p className="text-sm text-gray-400 mb-4">Skip your gaming/recharge session tonight to hit your original bedtime.</p>
            <Button 
              onClick={onDropTask}
              className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl"
            >
              Drop Task
            </Button>
          </div>

          {/* Option 2: Push bedtime */}
          <div className="p-4 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
            <h4 className="font-semibold mb-1">Option 2: Push Bedtime</h4>
            <p className="text-sm text-gray-400 mb-4">Keep all tasks, but go to sleep {overtimeMinutes} minutes later than planned.</p>
            <Button 
              onClick={onPushBedtime}
              className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl"
            >
              Push Bedtime
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OvertimeModal;