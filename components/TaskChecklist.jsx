import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { DebugButtons } from '../test/debugButtons';
import { useDevResetLog } from '../test/devHooks';
import { convertToBase64 } from '../utils/image';
import { getResetTaskState } from '../utils/tasks';
import { shouldResetTask } from '../utils/time';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';

export default function TaskChecklist() {
  // 캐릭터 생성 상태
  const [newCharacter, setNewCharacter] = useState('');
  const [newJob, setNewJob] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [newSilver, setNewSilver] = useState('');
  const [newTribute, setNewTribute] = useState('');
  const [newSilverStart, setNewSilverStart] = useState('');
  const [newTributeStart, setNewTributeStart] = useState('');
  const [charSubmitted, setCharSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // “수정 모드”용 상태
  const [editingCharId, setEditingCharId] = useState(null);

  // 숙제 생성 상태
  const [newTask, setNewTask] = useState('');
  const [newTaskType, setNewTaskType] = useState('');
  const [newResetFreq, setNewResetFreq] = useState('');
  const [newInputMode, setNewInputMode] = useState('');
  const [taskFormErrors, setTaskFormErrors] = useState({});
  const [charFormErrors, setCharFormErrors] = useState({});
  const [taskSubmitted, setTaskSubmitted] = useState(false);

  // 다이얼로그 컨트롤 상태
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isCharDialogOpen, setIsCharDialogOpen] = useState(false);

  // 전역 상태
  const [characters, setCharacters] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskValues, setTaskValues] = useState({});
  const [selectedCharacter, setSelectedCharacter] = useState('all');
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  // ── 이미지 확대용 상태 ──
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  //전체 삭제 핸들러
  const clearAll = () => {
    setCharacters([]);
    setTasks([]);
    setTaskValues({});
  };

  // ── 폼 초기화 함수 ──
  const resetTaskForm = () => {
    setNewTask('');
    setNewTaskType('');
    setNewResetFreq('');
    setNewInputMode('');
    setTaskFormErrors({});
  };

  const resetCharForm = () => {
    setNewCharacter('');
    setNewJob('');
    setNewImageFile(null);
    setNewSilver('');
    setNewTribute('');
    setNewSilverStart('');
    setNewTributeStart('');
    setCharFormErrors({});
    setPreviewUrl('');
  };

  const resetAllTasks = () => {
    const now = Date.now();
    const { updatedTasks, updatedValues } = getResetTaskState(tasks, characters, taskValues, now);
    setTasks(updatedTasks);
    setTaskValues(updatedValues);
  };


  // ✅ 개발 전용 초기화 함수

  const IS_DEV_MODE = process.env.NODE_ENV === 'development';

  useEffect(() => {
    console.log('[DEBUG] IS_DEV_MODE:', IS_DEV_MODE);
    if (!IS_DEV_MODE) return; // ← 이 조건만으로 통제

    const now = Date.now();
    tasks.forEach(task => {
      if (shouldResetTask(task, now)) {
        useDevResetLog(task, now);
      }
    });
  }, [tasks]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🌱 현재 개발자 모드입니다!');
    }
  }, []);

  // 캐릭터 생성 핸들러 (이미지 선택 시 미리보기 URL도 설정)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPreviewUrl('');
      return;
    }

    const base64 = await convertToBase64(file);
    setNewImageFile(file);
    setPreviewUrl(base64);
  };

  const createCharacter = () => {
    setCharSubmitted(true);

    const errors = {};
    if (!newCharacter.trim()) errors.name = true;
    if (!newJob) errors.job = true;
    if (Object.keys(errors).length > 0) {
      setCharFormErrors(errors);
      return;
    }
    setCharFormErrors({});

    const rawSilverStart = newSilverStart;
    const rawTributeStart = newTributeStart;

    const preview = newImageFile
      ? previewUrl // ✅ base64 URL
      : '/default.png';

    if (editingCharId !== null) {
      // ■ 수정 모드
      setCharacters(prev =>
        prev.map(c =>
          c.id === editingCharId
            ? {
              ...c,
              name: newCharacter.trim(),
              job: newJob,
              image: newImageFile ? newImageFile.name : c.image,
              previewUrl: preview,
              silver: {
                ...c.silver,
                current: Number(newSilver) || 0,
                lastUpdated: newSilverStart || c.silver.lastUpdated,
              },
              tribute: {
                ...c.tribute,
                current: Number(newTribute) || 0,
                lastUpdated: newTributeStart || c.tribute.lastUpdated,
              },
              silverStartPick: rawSilverStart,
              tributeStartPick: rawTributeStart,
            }
            : c
        )
      );
    } else {
      // ■ 새로 만들기 모드 (기존 로직)
      const nowMin = newSilverStart || String(new Date().getMinutes()).padStart(2, '0');
      const nowHr = newTributeStart || String(new Date().getHours()).padStart(2, '0');

      // ■ 새로 업로드 이미지에 대한 URL을 생성
      const preview = previewUrl || '/default.png';

      // ■ 생성 모드
      const character = {
        id: Date.now(),
        name: newCharacter.trim(),
        job: newJob,
        image: newImageFile ? newImageFile.name : 'default.png',
        previewUrl: preview,
        silver: {
          current: Number(newSilver) || 0,
          max: 100,
          lastUpdated: rawSilverStart,
        },
        tribute: {
          current: Number(newTribute) || 0,
          max: 10,
          lastUpdated: rawTributeStart,
        },
        silverStartPick: rawSilverStart,
        tributeStartPick: rawTributeStart,
      };
      setCharacters(prev => [...prev, character]);
    }

    // ■ 다이얼로그 닫고 초기화
    setIsCharDialogOpen(false);
    resetCharForm();
    setCharSubmitted(false);
    setEditingCharId(null);
  };
  //불러오기
  useEffect(() => {
    const savedChars = localStorage.getItem('mabi-characters');
    const savedTasks = localStorage.getItem('mabi-tasks');
    const savedValues = localStorage.getItem('mabi-values');
    if (savedChars) setCharacters(JSON.parse(savedChars));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedValues) setTaskValues(JSON.parse(savedValues));
  }, []);

  //저장하기
  // 캐릭터 배열이 바뀔 때 저장
  useEffect(() => {
    localStorage.setItem('mabi-characters', JSON.stringify(characters));
  }, [characters]);

  // 숙제 배열이 바뀔 때 저장
  useEffect(() => {
    localStorage.setItem('mabi-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // 숙제 값이 바뀔 때 저장
  useEffect(() => {
    localStorage.setItem('mabi-values', JSON.stringify(taskValues));
  }, [taskValues]);

  // 숙제 생성 시 inputMode 자동 설정
  useEffect(() => {
    if (['일반던전', '사냥터'].includes(newTaskType)) {
      // 자동 모드(은화 드롭다운)로 넘어갈 땐 에러 해제
      setNewInputMode('silver-dropdown');
      setTaskFormErrors(prev => ({
        ...prev,
        inputMode: false
      }));
    } else {
      setNewInputMode('');
      setTaskFormErrors(prev => ({
        ...prev,
        inputMode: true
      }));
    }
  }, [newTaskType]);

  // 편집 모드: 다이얼로그 열릴 때 기존 값 채우기 캐릭터 편집
  useEffect(() => {
    if (isCharDialogOpen && editingCharId !== null) {
      const ch = characters.find(c => c.id === editingCharId);
      if (ch) {
        setNewCharacter(ch.name);
        setNewJob(ch.job);
        setNewSilver(String(ch.silver.current));
        setNewTribute(String(ch.tribute.current));
        setNewSilverStart(ch.silverStartPick || '');
        setNewTributeStart(ch.tributeStartPick || '');
        setPreviewUrl(ch.previewUrl || '');
      }
    }
    if (!isCharDialogOpen) {
      setEditingCharId(null);
      setCharSubmitted(false);
    }
  }, [isCharDialogOpen, editingCharId, characters]);

  // 숙제 편집 모드용 훅
  useEffect(() => {
    if (isTaskDialogOpen && editingTaskId !== null) {
      const t = tasks.find(x => x.id === editingTaskId);
      if (t) {
        setNewTask(t.name === t.type ? '' : t.name);
        setNewTaskType(t.type);
        setNewResetFreq(t.resetFreq);
        setNewInputMode(t.inputMode);
      }
    }
    if (!isTaskDialogOpen) {
      setEditingTaskId(null);
      setTaskSubmitted(false);
    }
  }, [isTaskDialogOpen, editingTaskId, tasks]);

  const addTask = () => {
    // 1) 검증
    setTaskSubmitted(true);
    const errors = {};
    if (!newTaskType) errors.type = true;
    if (!newResetFreq) errors.resetFreq = true;
    if (!newInputMode) errors.inputMode = true;
    if (Object.keys(errors).length > 0) {
      setTaskFormErrors(errors);
      return;
    }
    setTaskFormErrors({});

    // ■ 수정 모드 분기
    if (editingTaskId !== null) {
      setTasks(prev =>
        prev.map(t =>
          t.id === editingTaskId
            ? {
              ...t,
              name: newTask.trim() || newTaskType,
              type: newTaskType,
              inputMode: newInputMode
            }
            : t
        )
      );
    } else {

      // ■ 생성 로직
      const name = newTask.trim() || newTaskType;
      const inputMode =
        ['일반던전', '사냥터'].includes(newTaskType)
          ? 'silver-dropdown'
          : newInputMode;
      setTasks(prev => [
        ...prev,
        { id: Date.now(), name, type: newTaskType, resetFreq: newResetFreq, inputMode }
      ]);
    }

    // 3) 다이얼로그 닫기
    setIsTaskDialogOpen(false);

    // 3) 초기화
    setNewTask('');
    setNewTaskType('');
    setNewResetFreq('');
    setNewInputMode('');
    // 에러 플래그·제출 플래그도 초기화
    setTaskFormErrors({});
    setTaskSubmitted(false);
  };

  const handleValueChange = (charId, taskId, key, value) => {
    const id = `${charId}-${taskId}`;
    setTaskValues(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  // 필터링된 캐릭터 목록
  const filteredChars = selectedCharacter === 'all'
    ? characters
    : characters.filter(c => String(c.id) === selectedCharacter);

  // visibleTasks 로직: 체크 안한 숙제만 보기
  const visibleTasks = tasks.filter(t => {
    if (!showIncompleteOnly) return true;
    if (selectedCharacter === 'all') {
      // 모든 캐릭터 중 하나라도 미완료면 보여줌
      return characters.some(c => {
        const val = taskValues[`${c.id}-${t.id}`] || {};
        if (t.inputMode === 'checkbox') return !val.selectValue;
        return (
          val.selectValue === '' ||
          val.selectValue === undefined ||
          (val.selectValue === 'custom' && !val.customValue)
        );
      });
    }
    // 특정 캐릭터만 검사
    return filteredChars.some(c => {
      const val = taskValues[`${c.id}-${t.id}`] || {};
      if (t.inputMode === 'checkbox') return !val.selectValue;
      return (
        val.selectValue === '' ||
        val.selectValue === undefined ||
        (val.selectValue === 'custom' && !val.customValue)
      );
    });
  });

  return (
    <div className="p-6 bg-gray-800 text-white rounded-2xl shadow-xl overflow-auto">
      <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <img src="/mabing-icon.png" alt="마빙이" className="w-30 h-30 mt-5" />
        마빙이 체크리스트
      </h1>

      {/* 캐릭터 필터 */}
      <div className="mb-4 flex items-center gap-4">
        <label className="font-medium">캐릭터 보기 :</label>
        <select
          className="bg-gray-700 text-white p-2 rounded"
          value={selectedCharacter}
          onChange={e => setSelectedCharacter(e.target.value)}
        >
          <option value="all">모든 캐릭터</option>
          {characters.map(c => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-white">
          <input
            type="checkbox"
            checked={showIncompleteOnly}
            onChange={e => setShowIncompleteOnly(e.target.checked)}
          />
          체크 안한 숙제만 보기
        </label>
      </div>

      {/* 숙제 생성 */}
      <div className="mb-4 flex gap-2">
        <Dialog
          open={isTaskDialogOpen}
          onOpenChange={open => {
            if (!open) resetTaskForm();  // 다이얼로그 닫힐 때만 폼 리셋
            setIsTaskDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              숙제 생성
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white text-black space-y-4">
            <DialogHeader>
              <DialogTitle className="text-black">
                {editingTaskId !== null ? '숙제 수정' : '숙제 생성'}
              </DialogTitle>
            </DialogHeader>
            <form
              id="task-form"
              tabIndex={0}
              onSubmit={e => {
                e.preventDefault();
                addTask();
              }}
              className="space-y-4"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const tag = e.target.tagName;
                  const type = e.target.type;

                  if (tag === 'SELECT' || type === 'submit' || type === 'button') return;
                  e.preventDefault();
                  addTask();
                }
              }}
            >

              <button type="submit" style={{ display: 'none' }} aria-hidden="true" />

              {/* 숙제 이름 */}
              <label className="block text-black">
                숙제 이름 (선택) :
                <Input
                  id="task-name-input"
                  placeholder={newTaskType}
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  className="mt-1 w-full bg-white text-black border border-gray-300"
                />
              </label>

              {/* 숙제 타입 */}
              <label className="block">
                <span className={taskSubmitted && taskFormErrors.type ? 'text-red-500' : 'text-black'}>
                  숙제 타입 (*필수) :
                </span>
                <select
                  value={newTaskType}
                  onChange={e => {
                    const val = e.target.value;
                    setNewTaskType(val);
                    if (taskSubmitted) {
                      setTaskFormErrors(prev => ({ ...prev, type: val === '' }));
                    }
                  }}
                  className={`ml-2 mt-1 w-25 bg-white text-black p-2 rounded border ${taskSubmitted && taskFormErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">선택</option>
                  <option>일반던전</option>
                  <option>사냥터</option>
                  <option>심층던전</option>
                  <option>기타</option>
                </select>
              </label>

              <label className="block">
                <span className={taskSubmitted && taskFormErrors.resetFreq ? 'text-red-500' : 'text-black'}>
                  초기화 주기 (*필수) :
                </span>
                <span className="inline-block w-1" />
                <select
                  value={newResetFreq}
                  onChange={e => {
                    const val = e.target.value;
                    setNewResetFreq(val);

                    if (taskSubmitted) {
                      setTaskFormErrors(prev => ({
                        ...prev,
                        resetFreq: val === ''
                      }));
                    }
                  }}
                  className={`ml-2 mt-1 w-20 p-2 rounded border ${taskSubmitted && taskFormErrors.resetFreq
                    ? 'border-red-500'
                    : 'border-gray-300'
                    }`}
                >
                  <option value="">선택</option>
                  <option>일간</option>
                  <option>주간</option>
                </select>
              </label>

              {/* 입력 방식 */}
              <fieldset className="block">
                <legend className={taskSubmitted && taskFormErrors.inputMode ? 'text-red-500' : 'text-black'}>
                  입력 방식 (*필수) :
                </legend>
                <div className="mt-1 flex gap-4">
                  {/* 체크박스 레이블 */}
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="inputMode"
                      value="checkbox"
                      checked={newInputMode === 'checkbox'}
                      onChange={e => {
                        const val = e.target.value;
                        setNewInputMode(val);
                        setTaskFormErrors(prev => ({ ...prev, inputMode: val === '' }));
                      }}
                      disabled={['일반던전', '사냥터'].includes(newTaskType)}
                      className="accent-black"
                    />
                    <span className="ml-1">체크박스</span>
                  </label>

                  {/* 드롭박스 레이블 */}
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="inputMode"
                      value="dropdown"
                      checked={newInputMode === 'dropdown'}
                      onChange={e => {
                        const val = e.target.value;
                        setNewInputMode(val);
                        setTaskFormErrors(prev => ({
                          ...prev, inputMode: val === ''
                        }));
                      }}
                      disabled={['일반던전', '사냥터'].includes(newTaskType)}
                      className="accent-black"
                    />
                    <span className="ml-1">드롭박스</span>
                  </label>
                </div>
              </fieldset>

              {/* 삭제 버튼 */}
              <DialogFooter className="flex justify-between">
                {editingTaskId !== null && (
                  <Button
                    type="submit"
                    onClick={() => {
                      setTasks(prev => prev.filter(t => t.id !== editingTaskId));
                      resetTaskForm();
                      setIsTaskDialogOpen(false);
                      setEditingTaskId(null);
                    }}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </Button>
                )}
                {/* 2) 생성/수정 완료 버튼 */}
                <Button
                  type="submit"
                  disabled={taskSubmitted && Object.values(taskFormErrors).some(v => v)}
                >
                  {editingTaskId !== null ? '수정 완료' : '생성'}
                </Button>
              </DialogFooter>

              <div
                onClick={() => {
                  const input = document.getElementById('task-name-input');
                  if (input) input.focus();
                }}
                className="h-6" // 높이 조절 가능 (6 = 약 24px)
                tabIndex={-1}
              />
              {/* 안내 문구 */}
              <p className="text-xs text-gray-400 mt-2 text-center">
                "일반던전은 은화 떨어지고, 심층은 공물 차감돼요... 그 외는 기타로 해주세요!! 부탁해요오!!"
              </p>
            </form>
          </DialogContent>
        </Dialog>

        {/* 캐릭터 생성 */}
        <Dialog
          open={isCharDialogOpen}
          onOpenChange={open => {
            if (!open) resetCharForm()
            setIsCharDialogOpen(open)
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsCharDialogOpen(true)}>
              <Plus className="w-4 h-4" /> 캐릭터 생성
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-white text-black space-y-4">
            <DialogHeader>
              <DialogTitle className="text-black">
                {editingCharId !== null ? '캐릭터 수정' : '캐릭터 생성'}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                마빙이와 함께 체크리스트를 관리할 캐릭터를 설정하세요!
              </DialogDescription>
            </DialogHeader>
            {/* Enter나 버튼 클릭 모두 이 form 으로 처리됩니다 */}
            <form onSubmit={e => {
              e.preventDefault();
              createCharacter();
            }}
              className="space-y-4"
            >
              <label className="block">
                <span className={charSubmitted && charFormErrors.name ? 'text-red-500' : 'text-black'}>
                  캐릭터 이름 (*필수) :
                </span>
                <span className="inline-block w-1" />
                <Input
                  placeholder="이름"
                  value={newCharacter}
                  onChange={e => {
                    const val = e.target.value;
                    setNewCharacter(val);
                    if (charSubmitted) {
                      setCharFormErrors(prev => ({ ...prev, name: val.trim() === '' }));
                    }
                  }}
                  className="ml-2 mt-1 w-full p-2 rounded border"
                />
              </label>

              <label className="block">
                <span className={charSubmitted && charFormErrors.job ? 'text-red-500' : 'text-black'}>
                  캐릭터 직업 (*필수) :
                </span>
                <span className="inline-block w-1" />
                <select
                  value={newJob}
                  onChange={e => {
                    const val = e.target.value;
                    setNewJob(val);
                    // 제출된 이후에만 job 에러 토글
                    if (charSubmitted) {
                      setCharFormErrors(prev => ({ ...prev, job: val === '' }));
                    }
                  }}
                  className={`ml-2 mt-1 w-32 p-2 rounded border ${charSubmitted && charFormErrors.job ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">선택</option>
                  <option>대검전사</option>
                  <option>전사</option>
                  <option>검술사</option>
                  <option>궁수</option>
                  <option>장궁병</option>
                  <option>석궁사수</option>
                  <option>마법사</option>
                  <option>빙결술사</option>
                  <option>화염술사</option>
                  <option>힐러</option>
                  <option>사제</option>
                  <option>수도사</option>
                  <option>도적</option>
                  <option>격투가</option>
                  <option>듀얼블레이드</option>
                  <option>음유시인</option>
                  <option>악사</option>
                  <option>댄서</option>
                </select>
              </label>

              <label className="block text-black">
                캐릭터 이미지 (선택) :
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="char-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="char-image-upload"
                  className="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">이미지 선택</span>
                </label>
                <span className="text-sm text-gray-600">
                  {newImageFile ? newImageFile.name : '선택된 파일 없음'}
                </span>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="w-12 h-12 object-cover rounded border border-gray-300"
                  />
                )}
              </div>

              <label className="block text-black">
                현재 은화 (선택) :
                <Input
                  // 1) 모바일에서 숫자키보드 띄우기, 숫자만 허용하라는 힌트
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={newSilver}
                  // 2) 숫자가 아닌 문자는 모두 제거
                  onChange={e => {
                    const digitsOnly = e.target.value.replace(/\D/g, '')
                    setNewSilver(digitsOnly)
                  }}
                  className="mt-1 w-20 bg-white text-black border border-gray-300"
                />
              </label>

              <label className="block text-black">
                현재 공물 (선택) :
                <Input
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={newTribute}
                  onChange={e => {
                    const digitsOnly = e.target.value.replace(/\D/g, '')
                    setNewTribute(digitsOnly)
                  }}
                  className="mt-1 w-20 bg-white text-black border border-gray-300"
                />
              </label>

              <label className="block text-black">
                은화 충전 분 (선택) :
                <select
                  value={newSilverStart}
                  onChange={e => setNewSilverStart(e.target.value)}
                  className="ml-2 mt-1 w-20 bg-white text-black border border-gray-300 p-1 rounded"
                >
                  <option value="">--</option>
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(min => (
                    <option key={min} value={min}>{min}분</option>
                  ))}
                </select>
              </label>

              <label className="block text-black">
                공물 충전 시간 (선택) :
                <select
                  value={newTributeStart}
                  onChange={e => setNewTributeStart(e.target.value)}
                  className="ml-2 mt-1 w-20 bg-white text-black border border-gray-300 p-1 rounded"
                >
                  <option value="">--</option>
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hr => (
                    <option key={hr} value={hr}>{hr}시</option>
                  ))}
                </select>
              </label>

              <DialogFooter className="flex justify-between">
                {/* 1) 휴지통(삭제) 버튼 */}
                {editingCharId !== null && (
                  <Button
                    type="button"
                    onClick={() => {
                      const updated = characters.filter(c => c.id !== editingCharId);
                      console.log('🧾 삭제 후 캐릭터 목록:', updated);
                      setCharacters(updated);
                      resetCharForm();
                      setIsCharDialogOpen(false);
                      setEditingCharId(null);
                    }}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </Button>
                )}

                {/* 수정 완료(또는 생성) 버튼 */}
                <Button
                  type="submit"
                  disabled={charSubmitted && Object.values(charFormErrors).some(v => v)}
                >
                  {editingCharId !== null ? '수정 완료' : '생성'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 이미지 확대용 */}
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogContent className="bg-transparent p-0">
            {/* 제목을 숨겨진 상태로 넣어 줍니다 */}
            <DialogTitle asChild>
              <span className="sr-only">이미지 확대 보기</span>
            </DialogTitle>
            <img
              src={previewImageUrl}
              alt="캐릭터 확대"
              className="max-w-full max-h-screen rounded-lg shadow-lg"
            />
          </DialogContent>
        </Dialog>

        {/* 전체 표 삭제 */}
        <Button
          onClick={clearAll}
          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded">
          <Trash2 className="w-4 h-4" />
          표 삭제
        </Button>
      </div>

      {/* 체크리스트 테이블 */}
      <table className="table-auto w-full border-collapse border border-gray-700">
        <thead>
          <tr>
            <th className="p-2 border border-gray-700 text-center">숙제</th>
            {filteredChars.map(c => (
              <th key={c.id} className="p-2 border border-gray-700 text-center">
                <div className="flex flex-col items-center">
                  <img
                    src={c.previewUrl || '/default.png'}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover mb-1 cursor-zoom-in"
                    onClick={e => {
                      e.stopPropagation();
                      setPreviewImageUrl(c.previewUrl || '/default.png');
                      setIsImageDialogOpen(true);
                    }}
                  />
                  <div
                    className="text-sm cursor-pointer hover:underline text-center"
                    onClick={() => {
                      setEditingCharId(c.id);
                      setIsCharDialogOpen(true);
                    }}
                  >
                    {c.name}
                    <br />
                    <span className="text-xs text-gray-300">({c.job})</span>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleTasks.map(t => (
            <tr key={t.id}>
              <td className="p-2 border border-gray-700 font-semibold text-center">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    setEditingTaskId(t.id);
                    setIsTaskDialogOpen(true);
                  }}
                >
                  {t.name}
                </span>
              </td>

              {filteredChars.map(c => {
                const key = `${c.id}-${t.id}`;
                const v = taskValues[key] || {};
                const isCompleted = t.inputMode === 'checkbox'
                  ? !!v.selectValue
                  : v.selectValue && v.selectValue !== '';

                if (showIncompleteOnly && selectedCharacter === 'all' && isCompleted) {
                  return (
                    <td key={key} className="p-2 border border-gray-700 bg-gray-800"></td>
                  );
                }

                return (
                  <td key={key} className="p-2 border border-gray-700 text-center">
                    <div className="flex gap-2 items-center justify-center w-full">
                      {/* 체크박스 */}
                      {t.inputMode === 'checkbox' && (
                        <Checkbox
                          checked={!!v.selectValue}
                          onCheckedChange={val => handleValueChange(c.id, t.id, 'selectValue', val)}
                        />
                      )}

                      {/* 드롭다운 */}
                      {(t.inputMode === 'dropdown' || t.inputMode === 'silver-dropdown') && (
                        <>
                          <select
                            value={v.selectValue || ''}
                            onChange={e =>
                              handleValueChange(c.id, t.id, 'selectValue', e.target.value)
                            }
                            className="bg-white text-black p-1 rounded border"
                          >
                            <option value="">선택</option>
                            {(t.inputMode === 'silver-dropdown'
                              ? [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                              : Array.from({ length: 10 }, (_, i) => i + 1)
                            ).map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                            <option value="custom">직접입력</option>
                          </select>

                          {v.selectValue === 'custom' && (
                            <Input
                              inputMode="numeric"
                              pattern="\d*"
                              placeholder={
                                t.inputMode === 'silver-dropdown'
                                  ? '은화 입력'
                                  : t.type === '심층던전'
                                    ? '공물 입력'
                                    : '숫자 입력'
                              }
                              min={1}
                              value={v.customValue || ''}
                              onChange={e => {
                                const digitsOnly = e.target.value.replace(/\D/g, '');
                                handleValueChange(c.id, t.id, 'customValue', digitsOnly);
                              }}
                              className="w-16 bg-white text-black p-1 rounded border"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <DebugButtons resetTasks={resetAllTasks} />
    </div>
  );
}