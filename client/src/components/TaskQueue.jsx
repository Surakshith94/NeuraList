import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskItem from './SortableTaskItem';

const TaskQueue = ({ tasks, onReorder, onDrop }) => {
  // Configure sensors to know when the user is dragging (mouse or touch)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Requires moving 5px before drag starts to prevent accidental clicks
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // If you dropped it in a new spot, tell App.jsx to update the array
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task._id === active.id);
      const newIndex = tasks.findIndex((task) => task._id === over.id);
      
      const newOrder = arrayMove(tasks, oldIndex, newIndex);
      onReorder(newOrder); // Pass the new array back to App.jsx!
    }
  };

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">
        ⏭️ Up Next
      </h3>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <SortableTaskItem key={task._id} task={task} onDrop={onDrop} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TaskQueue;