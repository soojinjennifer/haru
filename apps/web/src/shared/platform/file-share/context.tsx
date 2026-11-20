/**
 * `FileSharePort` 공급 — 선택은 `app/providers` 한 곳에서 하고(Web | Mock), 소비자는
 * `useFileSharePort()` 로만 받는다 (`push-permission/context.tsx` 와 같은 모양).
 */
import { createContext, use, type ReactNode } from 'react';

import type { FileSharePort } from './file-share-port';

const FileShareContext = createContext<FileSharePort | null>(null);

export interface FileShareProviderProps {
  port: FileSharePort;
  children: ReactNode;
}

export function FileShareProvider({ port, children }: FileShareProviderProps) {
  return <FileShareContext value={port}>{children}</FileShareContext>;
}

export function useFileSharePort(): FileSharePort {
  const port = use(FileShareContext);
  if (port === null) {
    throw new Error('useFileSharePort must be used inside <FileShareProvider>.');
  }
  return port;
}
