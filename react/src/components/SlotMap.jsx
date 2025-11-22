import React from 'react';

export default function SlotMap({ slots = [], onSelect = () => {} }) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-1">
          {slots.map(slot => (
            <div
              key={slot.id}                 
              className={`w-8 h-8 ${slot.occupied ? 'bg-gray-400' : 'bg-blue-200'} 
                border border-gray-300 m-0.5 flex items-center justify-center text-xs cursor-pointer`}
              onClick={() => onSelect(slot)}
            >
              {slot.id}                   
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
