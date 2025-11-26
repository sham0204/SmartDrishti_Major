export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  disabled = false, 
  className = "", 
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-sky-500 via-purple-500 to-emerald-500 text-white shadow-lg hover:opacity-90 focus:ring-sky-500",
    secondary: "border border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800/80 focus:ring-slate-500",
    danger: "bg-red-500/20 text-red-400 border border-red-500/60 hover:bg-red-500/30 focus:ring-red-500",
    ghost: "text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 focus:ring-slate-500"
  };
  
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };
  
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : "";
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button 
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}