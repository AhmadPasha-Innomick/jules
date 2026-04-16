export const getAccessTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find(row => row.startsWith("accessToken="));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
};
