'use client'

interface NoticeCommentEditorProps {
  value: string
  setValue: (value: string) => void
  secret: boolean
  setSecret: (value: boolean) => void
  onSubmit: () => void
  onCancel?: () => void
  placeholder: string
  submitText: string
  disabled: boolean
}

export function NoticeCommentEditor({
  value,
  setValue,
  secret,
  setSecret,
  onSubmit,
  onCancel,
  placeholder,
  submitText,
  disabled
}: NoticeCommentEditorProps) {
  return (
    <div style={{ marginTop: 16 }}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={1000}
        style={{
          width: '100%',
          minHeight: 96,
          resize: 'vertical',
          padding: 12,
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          outline: 'none'
        }}
      />
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            color: '#787E80'
          }}
        >
          <input
            type="checkbox"
            checked={secret}
            onChange={(e) => setSecret(e.target.checked)}
          />
          Secret comment
        </label>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ fontSize: 13, color: '#787E80' }}>
            {value.length}/1000
          </span>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                border: '1px solid #D9D9D9',
                background: '#FFFFFF',
                borderRadius: 9999,
                padding: '8px 14px',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            style={{
              border: '1px solid #D9D9D9',
              background: disabled ? '#F5F5F5' : '#FFFFFF',
              borderRadius: 9999,
              padding: '8px 14px',
              fontSize: 14,
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  )
}
