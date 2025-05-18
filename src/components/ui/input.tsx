import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: React.HTMLInputTypeAttribute;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn('block w-full rounded border p-2', className)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
