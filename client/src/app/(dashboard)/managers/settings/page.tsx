"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useGetAuthUserQuery,
  useUpdateManagerSettingsMutation,
} from "@/state/api";
import { on } from "events";
import React, { use } from "react";

const TenantSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  // Using useGetAuthUserQuery to fetch the authenticated user's data
  const [updateManager] = useUpdateManagerSettingsMutation();

  if (isLoading) return <div>Loading...</div>;

  const initialData = {
    name: authUser?.userInfo.name,
    email: authUser?.userInfo.email,
    phoneNumber: authUser?.userInfo.phoneNumber,
  };
  
  const handleSubmit = async (data: typeof initialData) => {
    await updateManager({
      cognitoId: authUser?.cognitoInfo.userId,
      ...data,
    });
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="tenant"
    />
  );
};

export default TenantSettings;
