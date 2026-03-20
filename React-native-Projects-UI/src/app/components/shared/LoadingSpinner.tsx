import React from 'react';
import { motion } from 'motion/react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; fullScreen?: boolean }> = ({
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div
        className={`${sizeClasses[size]} border-4 border-[#A56ABD] border-t-transparent rounded-full animate-spin`}
      />
      {fullScreen && <p className="text-gray-500 text-sm">Loading...</p>}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#F5EBFA] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 animate-pulse">
    <div className="h-4 bg-gray-100 rounded w-1/4 shimmer" />
    <div className="h-8 bg-gray-100 rounded w-1/2 shimmer" />
    <div className="h-3 bg-gray-100 rounded w-1/3 shimmer" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <div className="bg-gray-50 p-4 border-b border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-1/4 shimmer" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-50 space-y-3">
        <div className="flex gap-4">
          <div className="h-4 bg-gray-100 rounded w-1/4 shimmer" />
          <div className="h-4 bg-gray-100 rounded w-1/4 shimmer" />
          <div className="h-4 bg-gray-100 rounded w-1/4 shimmer" />
        </div>
      </div>
    ))}
  </div>
);
