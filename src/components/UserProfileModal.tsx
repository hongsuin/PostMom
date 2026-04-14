import { useState } from 'react';
import { X, MessageCircle, Check, AlertCircle } from 'lucide-react';
import UserTypeBadge from './UserTypeBadge';
import { useBizMoneyStore } from '../store/bizMoneyStore';
import type { UserType } from '../types/user';

interface UserProfileModalProps {
  author: string;
  userType?: UserType;
  isOpen: boolean;
  onClose: () => void;
  isAcademy: boolean;
}

type DmState = 'idle' | 'confirm' | 'success' | 'insufficient';

export default function UserProfileModal({
  author,
  userType,
  isOpen,
  onClose,
  isAcademy,
}: UserProfileModalProps) {
  const { balance, sendDM, dmsSent } = useBizMoneyStore();
  const [dmState, setDmState] = useState<DmState>('idle');

  if (!isOpen) return null;

  const alreadySent = dmsSent.has(author);

  const handleSend = () => {
    const result = sendDM(author);
    if (result === 'success') setDmState('success');
    else if (result === 'insufficient') setDmState('insufficient');
  };

  const handleClose = () => {
    setDmState('idle');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={17} />
        </button>

        <div className="p-6">
          {/* Avatar + Name */}
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
              {author[0]}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{author}</p>
              <div className="mt-1">
                <UserTypeBadge userType={userType} size="md" />
              </div>
            </div>
          </div>

          {/* DM section — 학원 로그인 시에만 표시 */}
          {isAcademy && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              {alreadySent || dmState === 'success' ? (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                  <Check size={15} />
                  DM을 전송했어요
                </div>
              ) : dmState === 'insufficient' ? (
                <>
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
                    <AlertCircle size={15} />
                    비즈머니가 부족해요 (현재 {balance.toLocaleString()}원)
                  </div>
                  <button
                    onClick={() => setDmState('idle')}
                    className="w-full text-xs text-slate-400 underline"
                  >
                    돌아가기
                  </button>
                </>
              ) : dmState === 'confirm' ? (
                <>
                  <p className="text-sm text-slate-600">
                    비즈머니{' '}
                    <span className="font-semibold text-primary">1,000원</span>이
                    차감됩니다. 계속하시겠어요?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDmState('idle')}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSend}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      보내기
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setDmState('confirm')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle size={15} />
                  DM 보내기 (1,000원)
                </button>
              )}

              <p className="text-center text-xs text-slate-400">
                현재 비즈머니: {balance.toLocaleString()}원
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
