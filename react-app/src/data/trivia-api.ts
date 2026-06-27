import type { Quiz } from "../domain/types";

// ponytail: class justified — provides a .name discriminant for 401 detection in the thunk
// rejected handler without coupling to HTTP status codes (see plan.md Complexity Tracking)
export class UnauthorizedError extends Error {
    name = "UnauthorizedError";
    constructor() { super("Unauthorized"); }
}

const apiBase = (): string => {
    const base =
        (window as { trailTriviaConfig?: { apiBase?: string } }).trailTriviaConfig?.apiBase ??
        import.meta.env.VITE_API_BASE_URL;
    if (!base) throw new Error("API base URL is not configured");
    return base;
};

const TIMEOUT_MS = 10_000;

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!response.ok) {
            if (response.status === 401) throw new UnauthorizedError();
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<T>;
    } finally {
        clearTimeout(timer);
    }
};

export const fetchGames = async (): Promise<Quiz[]> =>
    request<Quiz[]>(`${apiBase()}/games`);

export const fetchGame = async (id: string): Promise<Quiz> =>
    request<Quiz>(`${apiBase()}/games/${id}`);

export const fetchAllGames = async (nonce: string): Promise<Quiz[]> =>
    request<Quiz[]>(`${apiBase()}/games/all`, { headers: { "X-WP-Nonce": nonce } });
