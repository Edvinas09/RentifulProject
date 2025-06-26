"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetManagerPropertiesQuery,
} from "@/state/api";
import React from "react";

const Properties = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const {data: managerProperties,
    isLoading,
    error,
  } = useGetManagerPropertiesQuery(
    authUser?.cognitoInfo.userId || "", // Ensure we have a valid user ID
    {
      skip: !authUser?.cognitoInfo?.userId, // Skip the query if authUser is not available
    }
  );

  if(isLoading) return <Loading />;
  if(error) return <div>Error loading manager properties</div>;

  return <div className="dashboard-container">
    <Header
    title="My properties"
    subtitle="View and manage your property listings"
    />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {managerProperties?.map((property) => ( //array of favorite properties
             <Card
                key={property.id}
                property={property}
                isFavorite={false}
                onFavoriteToggle={() => {}} // No toggle needed for favorites view
                showFavoriteButton={false}
                propertyLink={`/managers/properties/${property.id}`}
              />)
        )}
    </div>
    {(!managerProperties || managerProperties.length === 0) && (
        <p>You don't manage properties!</p>
    )}
  </div>;
};

export default Properties;
