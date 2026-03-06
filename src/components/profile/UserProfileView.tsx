import React, { useState, useEffect } from 'react';
import { gqlSdk } from '../../graphql/client';
import type { User } from '../../api';
import ProfileView from './ProfileView';

type UserProfileViewProps = {
  userId: number;
  isAuthenticated: boolean;
};

const UserProfileView: React.FC<UserProfileViewProps> = ({ userId, isAuthenticated }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      setLoading(true);
      gqlSdk.GetUserById({ id: userId })
        .then(({ user: userData }) => {
          setUser(userData as unknown as User);
          setLoading(false);
        })
        .catch((error: any) => {
          console.error('Error getting user:', error);
          setLoading(false);
        });
    }
  }, [isAuthenticated, userId]);

  return (
    <ProfileView 
      user={user} 
      loading={loading} 
      isOwnProfile={false}
    />
  );
};

export default UserProfileView;

