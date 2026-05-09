import { useUser } from "@clerk/react";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";

export function useDisplayName(): string {
  const { user } = useUser();
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false } });

  const profileFirst = profile?.fullName?.trim()?.split(" ")[0];
  if (profileFirst) return profileFirst;

  if (user?.firstName?.trim()) return user.firstName.trim();

  const fullFirst = user?.fullName?.trim()?.split(" ")[0];
  if (fullFirst) return fullFirst;

  const email = user?.primaryEmailAddress?.emailAddress;
  if (email) return email.split("@")[0];

  return "Student";
}
