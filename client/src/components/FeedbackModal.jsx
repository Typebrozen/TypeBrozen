import { useState, useEffect } from 'react';

const CATEGORIES = ['Bug', 'Suggestion', 'Other'];

function getDevice() {
  const ua = navigator.userAgent || '';
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

export default function FeedbackModal({ themeStyles: t, pageInfo, onClose }) {
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: real users never see this
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorText, setErrorText] = useState('');

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (status === 'sending') return;
    if (message.trim().length < 5) {
      setStatus('error');
      setErrorText('Please write a little more (at least 5 characters).');
      return;
    }
    setStatus('sending');
    setErrorText('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message,
          contact,
          website,
          page: pageInfo || 'unknown',
          device: getDevice(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorText(data.error || 'Could not send feedback. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorText('Network problem. Please try again.');
    }
  };

  const borderColor = 'rgba(128,128,128,0.4)';
  const fieldClass = 'w-full rounded-lg px-3 py-2 text-sm bg-transparent border outline-none focus:border-yellow-500';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      // Keep typing inside this form from reaching the typing test's key listeners
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onKeyPress={(e) => e.stopPropagation()}
    >
      <div
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border p-5 ${t.bg} ${t.text}`}
        style={{ borderColor }}
        role="dialog"
        aria-modal="true"
        aria-label="Feedback"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">💬 Send Feedback</h2>
          <button
            onClick={onClose}
            className="text-xl leading-none opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🙏</div>
            <p className="font-semibold mb-1">Thank you!</p>
            <p className="text-sm opacity-80 mb-5">
              Your feedback has reached us. It really helps us improve TypeHanuman.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-yellow-500 hover:bg-yellow-400 text-black"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-80">Type</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === c ? t.activebtn : t.btn
                    }`}
                  >
                    {c === 'Bug' ? '🐞 Bug' : c === 'Suggestion' ? '💡 Suggestion' : '✉️ Other'}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-80">
                Your message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="What are you experiencing? What should be improved?"
                className={fieldClass}
                style={{ borderColor, resize: 'vertical' }}
              />
              <div className="text-right text-[11px] opacity-60 mt-1">
                {message.length}/1000
              </div>
            </div>

            {/* Optional contact */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-80">
                Email or Telegram username (optional)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={100}
                placeholder="Only if you want a reply"
                className={fieldClass}
                style={{ borderColor }}
              />
              <p className="text-[11px] opacity-60 mt-1">
                This will only be used to reply to you.
              </p>
            </div>

            {/* Honeypot: hidden from real users */}
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
            >
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-500">{errorText}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-sm ${t.btn}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === 'sending'}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-yellow-500 hover:bg-yellow-400 text-black disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}