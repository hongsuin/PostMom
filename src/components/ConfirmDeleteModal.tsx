import { Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  type: 'post' | 'comment';
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  type,
  isLoading,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!isLoading) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">
          {type === 'post' ? '게시글 삭제' : '댓글 삭제'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {type === 'post'
            ? '이 게시글을 삭제할까요? 삭제 후에는 되돌릴 수 없어요.'
            : '이 댓글을 삭제할까요? 삭제 후에는 되돌릴 수 없어요.'}
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? '삭제 중...' : '삭제하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
