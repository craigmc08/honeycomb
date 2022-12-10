import { useEffect } from 'react';

export function useDocumentListener(event, listener) {
  useEffect(() => {
    document.addEventListener(event, listener);
    return function cleanupDocumentListener() {
      document.removeEventListener(event, listener);
    }
  });
}
