"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetCurrentResidencesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";

const Residences = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo.userId || "", // Ensure we have a valid user ID
    {
      skip: !authUser?.cognitoInfo?.userId, // Skip the query if authUser is not available
    }
  );

  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(
    authUser?.cognitoInfo.userId || "", // Ensure we have a valid user ID
    {
      skip: !authUser?.cognitoInfo.userId // Skip if no user ID is available
    }
  );

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading current residences</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="Current residences"
        subtitle="View and manage your current living spaces"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentResidences?.map(
          (
            property //array of favorite properties
          ) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={tenant?.favorites.includes(property.id) || false}
              onFavoriteToggle={() => {}} // No toggle needed for favorites view
              showFavoriteButton={false}
              propertyLink={`/tenants/residences/${property.id}`}
            />
          )
        )}
      </div>
      {(!currentResidences || currentResidences.length === 0) && (
        <p>You don't have any current residences!</p>
      )}
    </div>
  );
};

export default Residences;
