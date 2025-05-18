export * from './character';
export * from './task';

export interface GameCharacterData {
    id: number;
    name: string;
    job: string;
    previewUrl: string;      // ✅ 보여줄 이미지 URL or base64
    imageFile?: File;        // ✅ 선택: 사용자가 등록한 원본 파일
    silver: number;
    tribute: number;
    silverStartPick: string;
    tributeStartPick: string;
}
