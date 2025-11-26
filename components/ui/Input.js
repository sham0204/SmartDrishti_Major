export default function Input({ 
  label, 
  error, 
  className = "", 
  ...props 
}) {
  const baseClasses = "w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500";
  const errorClasses = error ? "border-red-500/60 focus:border-red-500" : "";
  const classes = `${baseClasses} ${errorClasses} ${className}`;
  
  return (
    <div className="space-y-1 text-sm">
      {label && (
        <label className="block text-slate-200">
          {label}
        </label>
      )}
      <input
        className={classes}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}