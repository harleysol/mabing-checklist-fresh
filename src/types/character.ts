export interface GameCharacterData {
    id: number;
    name: string;
    job: string;
    image: string;
    previewUrl: string;
    silver: number;
    tribute: number;
    silverStartPick?: string;
    tributeStartPick?: string;
    imageFile?: File;
}