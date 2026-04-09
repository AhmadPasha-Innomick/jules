import React from 'react';

const SkeletonLoader = ({ type = 'card' }) => {
  const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

  if (type === 'bento') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        <div className="md:col-span-2 h-64 bg-surface-container-high rounded-xl"></div>
        <div className="h-64 bg-surface-container-high rounded-xl"></div>
        <div className="h-64 bg-surface-container-high rounded-xl"></div>
      </div>
    );
  }

  if (type === 'media-featured') {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-surface-container-high rounded-full"></div>
        <div className="aspect-[21/9] bg-surface-container-high rounded-xl"></div>
      </div>
    );
  }

  if (type === 'lawyer-stats') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-surface-container-high rounded-2xl"></div>
        <div className="space-y-3">
          <div className="h-20 bg-surface-container-high rounded-2xl"></div>
          <div className="h-20 bg-surface-container-high rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low p-8 rounded-xl animate-pulse space-y-6">
      <div className="h-6 w-32 bg-surface-container-high rounded-full"></div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-surface-container-high rounded"></div>
        <div className="h-4 w-full bg-surface-container-high rounded"></div>
        <div className="h-4 w-2/3 bg-surface-container-high rounded"></div>
      </div>
      <div className="h-32 bg-surface-container-high rounded-lg"></div>
    </div>
  );
};

export default SkeletonLoader;
