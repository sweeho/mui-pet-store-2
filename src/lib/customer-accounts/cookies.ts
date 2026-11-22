export const REMEMBER_COOKIE = "bp_signon";
/** 31 days. */
export const REMEMBER_MAX_AGE = 2_678_400;

/** The `bp_signon` cookie: the user name for 31 days when the box is ticked, else expired. */
export function rememberCookie(userName: string, remember: boolean) {
  return remember
    ? { name: REMEMBER_COOKIE, value: userName, maxAge: REMEMBER_MAX_AGE }
    : { name: REMEMBER_COOKIE, value: "", maxAge: 0 };
}
