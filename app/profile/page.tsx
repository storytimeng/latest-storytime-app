import React, { Suspense } from "react";
import { ProfileView } from "@/views";

const ProfilePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileView />
    </Suspense>
  );
};

export default ProfilePage;
