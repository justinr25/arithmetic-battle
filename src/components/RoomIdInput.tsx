interface RoomIdInputProps {
  value: string;
  onChange: (newValue: string) => void;
}

export default function RoomIdInput({ value, onChange }: RoomIdInputProps) {
  return (
    <div className="form-control w-full mb-3">
      <label htmlFor="room-id-input" className="label">
        <span className="label-text font-semibold text-sm opacity-70">Room ID</span>
      </label>
      <input
        id="room-id-input"
        type="text"
        className="input input-bordered input-lg w-full text-center shadow-sm"
        placeholder="Enter Room ID..."
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}