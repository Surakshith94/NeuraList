import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 1. Added onSwap here
const SortableTaskItem = ({ task, onDrop, onSwap }) => { 
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`flex items-center justify-between p-4 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing ${
        isDragging 
          ? 'bg-blue-500/10 border-blue-500/50 shadow-2xl shadow-blue-500/20 scale-[1.02]' 
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-gray-500 cursor-grab active:cursor-grabbing">⋮⋮</span>
        <div>
          <h4 className="font-semibold text-gray-200">{task.title}</h4>
          <p className="text-xs text-gray-500 mt-1">
            ⏳ {task.estimatedMinutes} mins | 📁 {task.project || 'General'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-400 bg-black/20 px-3 py-1 rounded-full">
          {task.priority}
        </span>
        
        {/* NEW: Swap to Active Button */}
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={() => onSwap(task._id)}
          className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
          title="Swap to Active Task"
        >
          ⬆️
        </button>

        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={() => onDrop(task._id)}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          title="Drop Task for Tonight"
        >
          ⏭️
        </button>
      </div>
    </div>
  );
};

export default SortableTaskItem;