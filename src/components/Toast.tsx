export default function Toast({ open, message }: { open: boolean; message: string }) {
  if (!open) return null
  return <div className="toast pop-in">{message}</div>
}

