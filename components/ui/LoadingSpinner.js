export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  const classes = `animate-spin rounded-full border-2 border-solid border-sky-500 border-t-transparent ${sizeClasses[size]} ${className}`;
  
  return (
    <div className="flex items-center justify-center">
      <div className={classes} />
    </div>
  );
}