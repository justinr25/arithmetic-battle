interface NameInputProps {
  value: string;
  onChange: (newValue: string) => void;
}

export default function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div className="form-control w-full mb-3">
      <label htmlFor="name-input" className="label">
        <span className="label-text font-semibold text-sm opacity-70">Player Display Name</span>
      </label>
      <input
        id="name-input"
        type="text"
        className="input input-bordered input-lg w-full text-center shadow-sm"
        placeholder="Enter your name..."
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}