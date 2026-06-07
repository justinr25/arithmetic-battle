interface RoomIdInputProps {
  value: string;
  onChange: (newValue: string) => void;
}

export default function RoomIdInput({ value, onChange }: RoomIdInputProps) {
  return (
    <div className="mb-3">
      <label htmlFor="room-id-input" className="form-label fw-semibold text-muted small">
        Room ID
      </label>
      <input
        id="room-id-input"
        type="text"
        className="form-control form-control-lg text-center shadow-sm"
        placeholder="Enter Room ID..."
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}