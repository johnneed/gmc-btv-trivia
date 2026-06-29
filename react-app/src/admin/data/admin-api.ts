import type { Quiz, MediaAttachment } from "../../domain/types";
import type { TriviaSmithUser } from "../store/settings/settings.slice";

interface AdminConfig {
    apiBase: string;
    nonce: string;
    currentUser?: { id: number; displayName: string; isAdmin: boolean };
}

const config = (): AdminConfig => {
    const c = (window as { ttAdmin?: AdminConfig; trailTriviaAdminConfig?: AdminConfig }).ttAdmin
        ?? (window as { trailTriviaAdminConfig?: AdminConfig }).trailTriviaAdminConfig;
    if (!c?.apiBase) throw new Error("Admin config not found");
    return c;
};

const headers = (): Record<string, string> => ({
    "Content-Type": "application/json",
    "X-WP-Nonce": config().nonce,
});

const base = () => config().apiBase;

const handleResponse = async <T>(res: Response): Promise<T> => {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
};

// ---- Games ----

interface GamesResponse {
    items: Quiz[];
    total: number;
}

export const fetchAllGames = async (
    page: number,
    perPage: number,
    statusFilter: string,
    searchQuery: string
): Promise<GamesResponse> => {
    const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
    });
    const res = await fetch(`${base()}/games/all?${params}`, { headers: headers() });
    const items = await handleResponse<Quiz[]>(res);
    console.log("API ALL GAMES RESPONSE:", items);
    if (items.length > 0) {
        console.log("FIRST GAME PREVIEW:", {
            title: items[0].title,
            questionsCount: items[0].questions?.length,
            questions: items[0].questions
        });
    }
    const total = parseInt(res.headers.get("X-WP-Total") ?? "0", 10);
    return { items, total };
};

export const fetchGame = async (id: string): Promise<Quiz> => {
    const res = await fetch(`${base()}/games/${id}`, { headers: headers() });
    return handleResponse<Quiz>(res);
};

export const createGame = async (data: Partial<Quiz>): Promise<Quiz> => {
    const res = await fetch(`${base()}/games`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
    });
    return handleResponse<Quiz>(res);
};

export const updateGame = async (id: string, data: Partial<Quiz>): Promise<Quiz> => {
    const res = await fetch(`${base()}/games/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
    });
    return handleResponse<Quiz>(res);
};

export const patchGame = async (id: string, fields: Partial<Quiz>): Promise<Quiz> => {
    const res = await fetch(`${base()}/games/${id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(fields),
    });
    return handleResponse<Quiz>(res);
};

export const deleteGame = async (id: string): Promise<void> => {
    const res = await fetch(`${base()}/games/${id}`, {
        method: "DELETE",
        headers: headers(),
    });
    await handleResponse<{ deleted: boolean }>(res);
};

export const seedGames = async (): Promise<void> => {
    const res = await fetch(`${base()}/games/seed`, {
        method: "POST",
        headers: headers(),
    });
    await handleResponse<{ seeded: boolean }>(res);
};

// ---- Media ----

export const uploadAnswerImage = async (file: File): Promise<MediaAttachment> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${base()}/media/upload`, {
        method: "POST",
        headers: { "X-WP-Nonce": config().nonce },
        body: form,
    });
    return handleResponse<MediaAttachment>(res);
};

export const sideloadAnswerImageFromUrl = async (url: string): Promise<MediaAttachment> => {
    const res = await fetch(`${base()}/media/from-url`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ url }),
    });
    return handleResponse<MediaAttachment>(res);
};

// ---- Settings ----

interface SettingsResponse {
    gamesPerPage: number;
    version?: string;
    wpMinimum?: string;
    phpMinimum?: string;
}

export const fetchSettings = async (): Promise<SettingsResponse> => {
    const res = await fetch(`${base()}/settings`, { headers: headers() });
    return handleResponse<SettingsResponse>(res);
};

export const updateSettings = async (data: { gamesPerPage: number }): Promise<SettingsResponse> => {
    const res = await fetch(`${base()}/settings`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
    });
    return handleResponse<SettingsResponse>(res);
};

// ---- TriviaSmith Access ----

export const fetchTriviaSmiths = async (): Promise<TriviaSmithUser[]> => {
    const res = await fetch(`${base()}/settings/access`, { headers: headers() });
    return handleResponse<TriviaSmithUser[]>(res);
};

export const grantAccess = async (username: string): Promise<TriviaSmithUser> => {
    const res = await fetch(`${base()}/settings/access`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ username }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
    }
    const data = await res.json() as { success: boolean; user: TriviaSmithUser };
    return data.user;
};

export const revokeAccess = async (userId: number): Promise<void> => {
    const res = await fetch(`${base()}/settings/access/${userId}`, {
        method: "DELETE",
        headers: headers(),
    });
    await handleResponse<{ success: boolean }>(res);
};
