export default function ExamHall({ themeStyles: t, onBack }) {
    return (
      <div className="flex flex-col items-center w-full pt-6">
        <div className="w-full max-w-3xl">
          <button
            onClick={onBack}
            className={`px-3 py-1.5 rounded-lg text-xs ${t.btn}`}
          >
            ← Back to Typing
          </button>
  
          <div className={`mt-6 p-6 ${t.glassCard}`}>
            <h2 className="text-2xl font-semibold">📝 Exam Hall</h2>
            <p className={`mt-2 text-sm ${t.textMuted}`}>
              Real exam-hall practice with PYQs and mock tests.
            </p>
  
            <div
              className="mt-6 rounded-xl border p-4 text-sm"
              style={{ borderColor: 'rgba(128,128,128,0.3)' }}
            >
              <p className="font-medium">Coming soon</p>
              <p className={`mt-1 ${t.textMuted}`}>
                First exam: SSC GD Constable.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }