export default function Card({ children, className = "", ...props }) {
  const baseClasses = "rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-900/40";
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}