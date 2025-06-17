import { createNewUserInDatabase } from "@/lib/utils";
import { Manager, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

// Custom baseQuery to support async token fetching
const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  });

  // Fetch token asynchronously
  let headers = new Headers(extraOptions?.headers || {});
  try {
    const session = await fetchAuthSession();
    const { idToken } = session.tokens ?? {};
    if (idToken) {
      headers.set("Authorization", `Bearer ${idToken}`);
    }
  } catch (e) {
    // Token fetch failed, continue without auth header
  }

  // Pass headers to the request
  if (typeof args === "string") {
    args = { url: args };
  }
  args.headers = headers;

  return rawBaseQuery(args, api, extraOptions);
};

export const api = createApi({
  baseQuery: customBaseQuery, // Use custom baseQuery instead
  reducerPath: "api",
  tagTypes: ["Managers", "Tenants"],
  endpoints: (build) => ({
    // ...rest of your endpoints remain the same
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint =
            userRole === "manager"
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;

          let userDetailsResponse = await fetchWithBQ(endpoint);

          // if user doesn't exist, create new user
          if (
            userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ
            );
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
        } catch (error: any) {
          return { error: error.message || "Could not fetch user data" };
        }
      },
    }),

    updateTenantSettings: build.mutation<
      Tenant,
      { cognitoId: string } & Partial<Tenant>
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),

    updateManagerSettings: build.mutation<
      Manager,
      { cognitoId: string } & Partial<Manager>
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
} = api;