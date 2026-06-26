type WPRole = "contributor" | "author" | "editor" | "administrator";

type AppUser = {
  id: number;
  displayName: string;
  roles: WPRole[];
  isTriviaSmith: boolean;
};

export type { WPRole };
export default AppUser;
