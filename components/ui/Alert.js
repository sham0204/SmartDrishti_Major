export default function Alert({ 
  children, 
  variant = "info", 
  className = "", 
  ...props 
}) {
  const baseClasses = "rounded-lg border px-3 py-2 text-xs";
  
  const variantClasses = {
    info: "border-sky-500/60 bg-sky-500/10 text-sky-300",
    success: "border-emerald-500/60 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/60 bg-amber-500/10 text-amber-300",
    error: "border-red-500/60 bg-red-500/10 text-red-300"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}