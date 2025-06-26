"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";

const Favorites = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo.userId || "", // Ensure we have a valid user ID
    {
      skip: !authUser?.cognitoInfo?.userId, // Skip the query if authUser is not available
    }
  );

  const {
    data: favoriteProperties,
    isLoading,
    error,
  } = useGetPropertiesQuery(
    { favoriteIds: tenant?.favorites.map((fav: { id: number }) => fav.id) },
    {
      skip: !tenant?.favorites || tenant.favorites.length === 0, // Skip if no favorites
    }
  );

  if(isLoading) return <Loading />;
  if(error) return <div>Error loading favorites</div>;

  return <div className="dashboard-container">
    <Header
    title="Favorited properties"
    subtitle="Browse and manage your saved property listings"
    />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteProperties?.map((property) => ( //array of favorite properties
             <Card
                key={property.id}
                property={property}
                isFavorite={true}
                onFavoriteToggle={() => {}} // No toggle needed for favorites view
                showFavoriteButton={false}
                propertyLink={`/tenants/residences/${property.id}`}
              />)
        )}
    </div>
    {(!favoriteProperties || favoriteProperties.length === 0) && (
        <p>You don't have any favorited properties!</p>
    )}
  </div>;
};

export default Favorites;
