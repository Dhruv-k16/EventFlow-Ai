import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface KPICardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: LucideIcon;
  accentColor?: 'purple' | 'green' | 'amber' | 'red' | 'blue';
  gradient?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subLabel,
  icon: Icon,
  accentColor = 'purple',
  gradient,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  const getGradient = () => {
    if (gradient) return gradient;
    switch (accentColor) {
      case 'green':
        return 'gradient-success';
      case 'red':
        return 'gradient-danger';
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-orange-400';
      case 'blue':
        return 'bg-gradient-to-r from-blue-600 to-blue-400';
      default:
        return 'gradient-purple-primary';
    }
  };

  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 800;
      const steps = 50;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setAnimatedValue(value);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [value]);

  const displayValue = typeof value === 'number' ? animatedValue : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl border border-gray-100 shadow-[0_4px_6px_rgba(73,34,91,0.08),0_2px_4px_rgba(73,34,91,0.04)] hover:shadow-[0_20px_40px_rgba(73,34,91,0.14),0_8px_16px_rgba(73,34,91,0.08)] transition-all duration-300 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className={`h-[3px] ${getGradient()}`} />

      <div className="p-6 flex items-start justify-between">
        {/* Left: Content */}
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.08em] text-gray-500 mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-[#49225B] font-mono mb-1" style={{ fontFamily: 'JetBrains Mono' }}>
            {displayValue}
          </p>
          {subLabel && (
            <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
          )}
        </div>

        {/* Right: Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`w-10 h-10 ${getGradient()} rounded-full flex items-center justify-center transition-transform duration-300`}
        >
          <Icon size={20} className="text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
};
