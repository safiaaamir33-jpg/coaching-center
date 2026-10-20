import { auth } from './config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function getFriendlyErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('Quota limit exceeded') || raw.includes('quota') || raw.includes('Free daily read units')) {
    return 'Firebase Daily Free Tier Read Quota exceeded for today. All changes have been safely saved to your local browser storage and will automatically synchronize once the daily quota resets (or if billing is enabled in Firebase Console).';
  }
  if (raw.includes('permission-denied') || raw.includes('Missing or insufficient permissions')) {
    return 'Access denied. You do not have administrative permission for this action.';
  }
  if (raw.includes('offline') || raw.includes('client is offline')) {
    return 'Network is currently offline. Your data has been safely recorded locally.';
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error) return getFriendlyErrorMessage(parsed.error);
  } catch {
    // raw string
  }
  return raw;
}
