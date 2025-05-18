import clsx from 'clsx'
import { Plus } from 'lucide-react'
import React from 'react'

export interface CharImageUploaderProps {
  previewUrl: string
  fileName?: string
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function CharImageUploader({
  previewUrl,
  fileName,
  onFileChange,
}: CharImageUploaderProps) {
  return (
    <div className="space-y-1">
      <label className="block text-gray-800">캐릭터 이미지 (선택):</label>
      <div className="flex items-center gap-4">
        <input
          id="char-image-upload"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
        <label
          htmlFor="char-image-upload"
          className={clsx(
            'inline-flex items-center gap-1 p-2 rounded cursor-pointer transition',
            'bg-gray-200 hover:bg-gray-300 text-gray-800'
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">이미지 선택</span>
        </label>
        <span className="text-sm text-gray-600">
          {fileName || '선택된 파일 없음'}
        </span>
        {previewUrl && previewUrl !== '/default.png' && (
          <img
            src={previewUrl}
            alt="미리보기"
            className="w-12 h-12 object-cover rounded border border-gray-300"
          />
        )}
      </div>
    </div>
  )
}