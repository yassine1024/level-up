export type FriendlyErrorCategory =
  | "no-internet"
  | "timeout"
  | "server"
  | "auth"
  | "unknown";

export function mapApiError(error: unknown): FriendlyErrorCategory {
  const e = error as { response?: { status?: number }; code?: string; message?: string };
  if (!e?.response) {
    if (e?.code === "ECONNABORTED" || /timeout/i.test(e?.message ?? "")) {
      return "timeout";
    }
    return "no-internet";
  }
  const status = e.response.status ?? 0;
  if (status === 401 || status === 403) return "auth";
  if (status >= 500) return "server";
  if (status === 408 || status === 504) return "timeout";
  return "unknown";
}

export function friendlyMessage(category: FriendlyErrorCategory): string {
  switch (category) {
    case "no-internet":
      return "No internet connection. Please check your network.";
    case "timeout":
      return "Waking up the server, please wait...";
    case "server":
      return "Server problem. Please try again in a moment.";
    case "auth":
      return "Session expired. Please log in again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export const LOGIN_REQUIRED_MESSAGE = "Enter your username and password.";
export const LOGIN_ERROR_MESSAGE = "Username or password is not correct. Try again.";
export const WAKE_UP_MESSAGE = "Waking up the server, please wait...";
export const TRY_AGAIN_LABEL = "Try again";
export const TAKE_A_MOMENT_MESSAGE = "This can take a moment.";
