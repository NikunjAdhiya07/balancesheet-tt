"use client";

export default function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
  danger = true,
}: {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
        <p className="text-sm font-medium text-slate-700">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
