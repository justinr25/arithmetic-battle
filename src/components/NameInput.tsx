interface NameInputProps {
  value: string;
  onChange: (newValue: string) => void;
}

export default function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div className="mb-3">
      <label htmlFor="name-input" className="form-label fw-semibold text-muted small">
        Player Display Name
      </label>
      <input
        id="name-input"
        type="text"
        className="form-control form-control-lg text-center shadow-sm"
        placeholder="Enter your name..."
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}