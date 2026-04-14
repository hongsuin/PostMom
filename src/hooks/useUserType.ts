import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getUserType } from '../types/user';
import type { UserType } from '../types/user';

export function useUserType(): UserType {
  const [userType, setUserType] = useState<UserType>('student');

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setUserType(getUserType(data.session));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserType(getUserType(s));
    });
    return () => subscription.unsubscribe();
  }, []);

  return userType;
}
