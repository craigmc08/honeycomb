import { Suspense } from 'react';

export default function Root({ children }: { children: React.JSX.Element[] }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  )
}
