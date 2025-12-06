import React from 'react';

export default function SlotMap({ slots = [], onSelect = () => {} }) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-1">
          {slots.map(slot => (
            <div
              key={slot.slot} // slot.id가 아니라 slot.slot
              className={`w-8 h-8 ${slot.occupied ? 'bg-gray-400' : 'bg-blue-200'} border border-gray-300 m-0.5 flex items-center justify-center text-xs cursor-pointer`}
              onClick={() => onSelect(slot)}
            >
              {slot.slot} {/* 표시되는 번호도 slot.slot */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
