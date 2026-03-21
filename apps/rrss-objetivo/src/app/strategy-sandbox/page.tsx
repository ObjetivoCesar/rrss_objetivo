'use client';

import dynamic from 'next/dynamic';

// Import dynamically to avoid SSR issues with React Flow
const StrategySandbox = dynamic(
  () => import('@/components/strategy-sandbox/StrategySandbox'),
  { ssr: false }
);

export default function StrategySandboxPage() {
  return <StrategySandbox />;
}
