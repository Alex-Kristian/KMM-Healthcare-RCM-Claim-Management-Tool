import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import type { AuthUser } from 'aws-amplify/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Authenticator>
      {() => <>{children}</>}
    </Authenticator>
  );
}


export function useAuth(): { user: AuthUser; signOut: () => void } {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  return { user, signOut };
}