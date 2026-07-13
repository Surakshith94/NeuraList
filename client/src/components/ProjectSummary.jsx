import React from 'react';

const ProjectSummary = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return null;

  // 1. Group the tasks and calculate total minutes per project
  const projectStats = tasks.reduce((acc, task) => {
    // Failsafe in case older tasks in your DB don't have a project field
    const projectName = task.project || 'General'; 
    
    if (!acc[projectName]) {
      acc[projectName] = { count: 0, totalMinutes: 0 };
    }
    acc[projectName].count += 1;
    acc[projectName].totalMinutes += task.estimatedMinutes;
    return acc;
  }, {});

  // Convert the object back into an array so we can map over it in React
  const projectArray = Object.entries(projectStats).map(([name, stats]) => ({
    name,
    ...stats
  }));

  // Helper to format minutes into Hours/Mins (e.g., 135 mins -> 2h 15m)
  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4 mb-8 bg-[#1a1a24] border border-white/10 rounded-[24px] p-6 shadow-xl">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
        📊 Time Allocation
      </h3>
      
      <div className="flex flex-col gap-3">
        {projectArray.map((project, index) => (
          <div key={index} className="flex justify-between items-center">
            
            <div className="flex items-center gap-3">
              {/* Generate a random color dot based on the project name length so it looks cool */}
              <div className={`w-3 h-3 rounded-full ${
                project.name.length % 3 === 0 ? 'bg-purple-500' : project.name.length % 2 === 0 ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              <span className="font-semibold text-gray-200">{project.name}</span>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                {project.count} {project.count === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <span className="font-mono text-blue-400 font-bold">
              {formatTime(project.totalMinutes)}
            </span>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSummary;