"use client";

import { ReactNode } from "react";

type MobileCardProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function MobileCard({ children, onClick, className = "" }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${onClick ? "active:bg-gray-50 cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

type MobileCardRowProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function MobileCardRow({ label, value, className = "" }: MobileCardRowProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

type MobileCardGridProps = {
  children: ReactNode;
  className?: string;
};

export function MobileCardGrid({ children, className = "" }: MobileCardGridProps) {
  return <div className={`grid grid-cols-1 sm:hidden gap-3 ${className}`}>{children}</div>;
}

type DesktopTableProps = {
  children: ReactNode;
  className?: string;
};

export function DesktopTable({ children, className = "" }: DesktopTableProps) {
  return (
    <div className={`hidden sm:block bg-white rounded-lg border border-gray-200 overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}
