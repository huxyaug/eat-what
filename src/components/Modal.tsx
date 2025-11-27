export default function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className={`${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} fixed inset-0 z-50 transition-opacity duration-300`}>
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity`} onClick={onClose} />
      <div className={`absolute inset-x-6 top-1/3 bg-white rounded-xl p-5 shadow-xl transition-all duration-300 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {children}
      </div>
    </div>
  )
}
