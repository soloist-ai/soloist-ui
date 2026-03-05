import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../api';
import ProfileView from '../components/ProfileView';
import { gqlSdk } from '../graphql/client';

type ProfileTabProps = {
  isAuthenticated: boolean;
};

const ProfileTab: React.FC<ProfileTabProps> = ({ isAuthenticated }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Prevents double-fetch caused by React.StrictMode double-mount in development
  const fetchInitiatedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchInitiatedRef.current = false;
      setLoading(false);
      return;
    }
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;

    setLoading(true);
    gqlSdk.GetUserProfile()
      .then(({ me }) => setUser(me as unknown as User))
      .catch((err) => console.error('[ProfileTab] failed to load profile:', err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return <ProfileView user={user} loading={loading} isOwnProfile />;
};

export default ProfileTab;
