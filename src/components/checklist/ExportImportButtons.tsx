'use client';

import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import { useState } from 'react';

export default function ExportImportButtons() {
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    const data = {
      characters: localStorage.getItem('characters'),
      tasks: localStorage.getItem('mabing-tasks'),
      taskValues: localStorage.getItem('task-values'),
      customChecklist: localStorage.getItem('customChecklist'),
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `checklist_${new Date().toISOString()}.json`);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        if (importedData.characters) localStorage.setItem('characters', importedData.characters);
        if (importedData.tasks) localStorage.setItem('mabing-tasks', importedData.tasks);
        if (importedData.taskValues) localStorage.setItem('task-values', importedData.taskValues);
        if (importedData.customChecklist) localStorage.setItem('customChecklist', importedData.customChecklist);

        alert('✅ 데이터 가져오기 완료!');
        location.reload();
      } catch (error) {
        setImportError('⚠️ 데이터 형식이 잘못됐어요.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2 items-center">
      <Button onClick={handleExport}>📤 내보내기</Button>
      <label htmlFor="import" className="cursor-pointer">
        <input
          type="file"
          accept=".json"
          id="import"
          className="hidden"
          onChange={handleImport}
        />
        <Button asChild>
          <span>📥 가져오기</span>
        </Button>
      </label>
      {importError && <div className="text-red-500">{importError}</div>}
    </div>
  );
}