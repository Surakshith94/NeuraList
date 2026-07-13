import React, { useState, useEffect } from 'react';

const SleepCountdown = ({ targetBedtime = "23:00" }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Split "23:00" into hours and minutes
      const [hours, minutes] = targetBedtime.split(':').map(Number);
      
      const bedtime = new Date();
      bedtime.setHours(hours, minutes, 0, 0);

      // If it is already past bedtime (e.g., 1:00 AM), calculate for the next night
      if (now > bedtime) {
        bedtime.setDate(bedtime.getDate() + 1);
      }

      const diffMs = bedtime - now;
      
      // Math to convert milliseconds into Hours, Minutes, and Seconds
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      // Format with leading zeros for that sleek digital clock look (e.g., 09s instead of 9s)
      const formattedMins = diffMins.toString().padStart(2, '0');
      const formattedSecs = diffSecs.toString().padStart(2, '0');

      setTimeLeft(`${diffHrs}h ${formattedMins}m ${formattedSecs}s`);
    };

    calculateTimeLeft(); // Run it immediately on load
    const timer = setInterval(calculateTimeLeft, 1000); // Then update it every 1 second

    // Cleanup function to stop the timer if the component unmounts
    return () => clearInterval(timer);
  }, [targetBedtime]);

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-md">
      <span className="text-xl animate-pulse">⏳</span>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">
          Until Sleep
        </span>
        <span className="text-sm font-mono font-bold text-blue-400 leading-none">
          {timeLeft}
        </span>
      </div>
    </div>
  );
};

export default SleepCountdown;