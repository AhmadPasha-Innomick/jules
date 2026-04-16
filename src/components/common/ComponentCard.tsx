import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; 
  desc?: string; 
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white ${className}`}>
    
      <div className="px-6 py-5">
        <h3 className="text-base font-stc-medium text-gray-800">{title}</h3>
        {desc && <p className="mt-1 text-sm text-gray-500">{desc}</p>}
      </div>

    
      <div className="border-t border-gray-100 p-4 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
