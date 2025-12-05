// 주차칸 크기, 위치 저장해둔 파일
//주차칸 크기
export const SLOT_WIDTH = 80
export const SLOT_HEIGHT = 50

// 건물별로 이름, 건물영역, 입구위치, 실제 주차칸 위치
export const PARKING_LAYOUTS = {
    paldal: {
        name: '팔달관',
        buildingRect: { left: '5%', top: '80%', width: '70%', height: '8%' },
        entranceRect: { left: '34%', top: '18%', width: '6.5%', height: '6%' },
        clusters: [
            { id: 'paldal-cctv', left: '6%', top: '18%', rows: 2, cols: 8, startId: 1 }, // 위치, 행*열, 시작할 슬롯번호
            { id: 'paldal-top-right', left: '42%', top: '18%', rows: 2, cols: 8, startId: 17 },
            { id: 'paldal-mid-left', left: '6%', top: '50%', rows: 2, cols: 8, startId: 33 },
            { id: 'paldal-mid-center', left: '42%', top: '50%', rows: 2, cols: 8, startId: 49 },
            { id: 'paldal-mid-right', left: '72%', top: '50%', rows: 2, cols: 3, startId: 65 },
        ],
    },

    library: {
        name: '도서관',
        buildingRect: { left: '6%', top: '18%', width: '8%', height: '70%' },
        entranceRect: { left: '47%', top: '74%', width: '6.5%', height: '6%' },
        // 위쪽 왼쪽/오른쪽, 아래쪽 왼쪽/오른쪽 - 4개 블록
        clusters: [
            // 위 왼쪽
            { id: 'lib-top-left', left: '19%', top: '18%', rows: 2, cols: 8, startId: 1 },
            // 위 오른쪽
            { id: 'lib-top-right', left: '55%', top: '18%', rows: 2, cols: 8, startId: 17 },
            { id: 'lib-top-right2', left: '85%', top: '18%', rows: 2, cols: 3, startId: 33 },
            // 아래 왼쪽
            { id: 'lib-bottom-left', left: '19%', top: '52%', rows: 2, cols: 8, startId: 39 },
            // 아래 오른쪽
            { id: 'lib-bottom-right', left: '55%', top: '52%', rows: 2, cols: 8, startId: 55 },
        ],
    },

    yulgok: {
        name: '율곡관',
        // 아래쪽 건물 바 두께 축소
        buildingRect: { left: '10%', top: '70%', width: '40%', height: '8%' },
        // 건물 오른쪽 끝 입구 박스 축소
        entranceRect: { left: '52%', top: '70%', width: '6.5%', height: '6%' },
        clusters: [
            { id: 'yulgok-col-1', left: '10%', top: '18%', rows: 8, cols: 1, startId: 1 },
            { id: 'yulgok-col-2', left: '21%', top: '18%', rows: 8, cols: 1, startId: 9 },
            { id: 'yulgok-col-3', left: '26.5%', top: '18%', rows: 8, cols: 1, startId: 17 },
            { id: 'yulgok-col-4', left: '37.5%', top: '18%', rows: 8, cols: 1, startId: 25 },
            { id: 'yulgok-col-5', left: '43%', top: '18%', rows: 8, cols: 1, startId: 33 },
            { id: 'yulgok-col-6', left: '62%', top: '18%', rows: 10, cols: 1, startId: 41 },
            { id: 'yulgok-col-7', left: '73%', top: '18%', rows: 10, cols: 1, startId: 51 },
            { id: 'yulgok-col-8', left: '78.5%', top: '18%', rows: 10, cols: 1, startId: 61 },
        ],
    },

    yeonam: {
        name: '연암관',
        // 위쪽 얇은 건물 바
        buildingRect: { left: '10%', top: '12%', width: '50%', height: '8%' },
        // 오른쪽 아래 입구 박스 축소
        entranceRect: { left: '76.3%', top: '71.4%', width: '6.5%', height: '6%' },
        clusters: [
            { id: 'yeonam-col-1', left: '10%', top: '30%', rows: 8, cols: 1, startId: 1 },
            { id: 'yeonam-col-2', left: '21%', top: '30%', rows: 8, cols: 1, startId: 9 },
            { id: 'yeonam-col-3', left: '26.5%', top: '30%', rows: 8, cols: 1, startId: 17 },
            { id: 'yeonam-col-4', left: '37.5%', top: '30%', rows: 8, cols: 1, startId: 25 },
            { id: 'yeonam-col-5', left: '43%', top: '30%', rows: 8, cols: 1, startId: 33 },
            { id: 'yeonam-col-6', left: '54%', top: '30%', rows: 8, cols: 1, startId: 41 },
            { id: 'yeonam-col-7', left: '59.5%', top: '30%', rows: 8, cols: 1, startId: 49 },
            { id: 'yeonam-col-8', left: '70.5%', top: '30%', rows: 8, cols: 1, startId: 57 },
            { id: 'yeonam-col-9', left: '76%', top: '30%', rows: 6, cols: 1, startId: 65 },
        ],
    },
}