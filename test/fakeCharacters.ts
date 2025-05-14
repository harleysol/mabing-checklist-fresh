export const fakeCharacters = [
    {
        id: 1,
        name: '테스트용 마법사',
        job: '화염술사',
        silver: { current: 99, lastUpdated: Date.now() - 9999999, max: 100 },
        tribute: { current: 5, lastUpdated: Date.now() - 9999999, max: 10 },
    },
    {
        id: 2,
        name: '테스트용 사제',
        job: '사제',
        silver: { current: 80, lastUpdated: Date.now() - 8000000, max: 100 },
        tribute: { current: 4, lastUpdated: Date.now() - 8000000, max: 10 },
    }
];