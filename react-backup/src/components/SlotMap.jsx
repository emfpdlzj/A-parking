import React from 'react';

export default function SlotMap({ slots = [], onSelect = () => {} }) {
  // Render một ô đỗ xe
  const renderSlot = (number, isOccupied = false) => {
    const bgColor = isOccupied ? 'bg-gray-400' : 'bg-blue-200';
    
    return (
      <div
        key={number}
        className={`w-8 h-8 ${bgColor} border border-gray-300 m-0.5 flex items-center justify-center text-xs cursor-pointer`}
        onClick={() => onSelect({ id: number, occupied: isOccupied })}
      >
        {number}
      </div>
    );
  };

  // Render một khoảng trống
  const renderEmpty = (key) => (
    <div key={key} className="w-8 h-8 m-0.5" />
  );

  // Render một hàng chỗ đỗ xe
  const renderRow = (startNum, count, emptyBefore = 0, emptyAfter = 0) => {
    return (
      <div className="flex items-center">
        {[...Array(emptyBefore)].map((_, i) => renderEmpty(`empty-before-${startNum}-${i}`))}
        {[...Array(count)].map((_, i) => renderSlot(startNum + i))}
        {[...Array(emptyAfter)].map((_, i) => renderEmpty(`empty-after-${startNum}-${i}`))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Building 팔달관</h2>
          <button className="bg-red-500 text-white px-6 py-2 rounded-md">출입구</button>
        </div>
        
        {/* Phần chú thích */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-200 border border-gray-300 mr-2"></div>
            <span>이용가능 (43석)</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-400 border border-gray-300 mr-2"></div>
            <span>주차중 (90석)</span>
          </div>
        </div>

        {/* Container cho bản đồ đỗ xe */}
        <div className="relative bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col gap-1">
            {/* Hàng 1-15 */}
            <div className="flex gap-2">
              {[...Array(15)].map((_, i) => renderSlot(i + 1))}
            </div>

            {/* Hàng 16-50 */}
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                {[16, 21, 26, 31, 36, 41, 46].map(start => 
                  <div key={start} className="flex gap-1">
                    {[...Array(5)].map((_, i) => renderSlot(start + i))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {[51, 56, 61, 66].map(start => 
                  <div key={start} className="flex gap-1">
                    {[...Array(5)].map((_, i) => renderSlot(start + i))}
                  </div>
                )}
              </div>
            </div>

            {/* Hàng 71-135 */}
            <div className="mt-4">
              {[71, 81, 91, 101, 111, 121].map(start => 
                <div key={start} className="flex gap-1 mb-1">
                  {[...Array(10)].map((_, i) => renderSlot(start + i))}
                </div>
              )}
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md">
            <p className="text-blue-600 mb-2">현재 내 정식 이용권한</p>
            <p className="mb-2">7번, 24시간 52분</p>
            <p className="text-gray-600">예상요금</p>
            <p className="text-blue-600 font-bold">3,000원</p>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button className="text-gray-600">이전 화면</button>
          <button className="bg-blue-600 text-white px-8 py-2 rounded-md">뒤로가기</button>
        </div>
      </div>
    </div>
  );
}
