export const isActiveDonor = (user: { is_donor?: boolean; donor_expiry?: Date | string | null } | null | undefined) => {
  if (!user?.is_donor) return false;
  if (!user.donor_expiry) return true;
  return new Date(user.donor_expiry) > new Date();
};
