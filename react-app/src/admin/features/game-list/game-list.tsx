import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminDispatch, useAdminSelector } from "../../store";
import {
    loadGames, removeGame, setStatusFilter, setSearchQuery, setPage,
} from "../../store/games/games.slice";
import ConfirmationDialog from "../../components/confirmation-dialog/confirmation-dialog";
import type { Quiz } from "../../../domain/types";

const GameList = () => {
    const dispatch = useAdminDispatch();
    const navigate = useNavigate();
    const { items, total, page, perPage, statusFilter, status } = useAdminSelector((s) => s.gamesAdmin);
    const [searchInput, setSearchInput] = useState("");
    const [trashTarget, setTrashTarget] = useState<Quiz | null>(null);

    useEffect(() => { dispatch(loadGames()); }, [dispatch, page, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setSearchQuery(searchInput));
        dispatch(loadGames());
    };

    const handleFilter = (filter: "all" | "published" | "draft") => {
        dispatch(setStatusFilter(filter));
        dispatch(loadGames());
    };

    const handleTrashConfirm = async () => {
        if (!trashTarget) return;
        await dispatch(removeGame(trashTarget.id));
        setTrashTarget(null);
    };

    const totalPages = Math.ceil(total / perPage);

    return (
        <div className="trail-trivia-game-list wrap">
            <h1>Trail Trivia Games</h1>
            <button
                type="button"
                className="button button-primary"
                onClick={() => navigate("/games/new")}
            >
                Add New Game
            </button>

            {/* Filter tabs */}
            <div className="trail-trivia-filter-tabs" role="tablist" aria-label="Filter games by status">
                {(["all", "published", "draft"] as const).map((f) => (
                    <button
                        key={f}
                        role="tab"
                        aria-selected={statusFilter === f}
                        type="button"
                        onClick={() => handleFilter(f)}
                        className={statusFilter === f ? "trail-trivia-tab-active" : ""}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="trail-trivia-search-form">
                <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by title…"
                    aria-label="Search games by title"
                />
                <button type="submit">Search</button>
            </form>

            {/* Table */}
            {status === "loading" && <p>Loading…</p>}
            {status === "failed" && <p role="alert">Failed to load games.</p>}

            <table className="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Questions</th>
                        <th>Author</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && status === "idle" && (
                        <tr><td colSpan={5}>No games found.</td></tr>
                    )}
                    {items.map((game) => (
                        <tr key={game.id} className="trail-trivia-game-row">
                            <td>
                                <strong>{game.title}</strong>
                                {game.subtitle && <div className="trail-trivia-subtitle">{game.subtitle}</div>}
                                <div className="trail-trivia-row-actions">
                                    <button type="button" onClick={() => navigate(`/games/${game.id}/edit`)}>
                                        Edit
                                    </button>
                                    {" | "}
                                    <button type="button" onClick={() => setTrashTarget(game)} style={{ color: "#d63638" }}>
                                        Trash
                                    </button>
                                </div>
                            </td>
                            <td>
                                <span className={`trail-trivia-badge-${game.status}`}>
                                    {game.status}
                                </span>
                            </td>
                            <td>{game.questions.length}</td>
                            <td>{game.author}</td>
                            <td>{new Date(game.publishDate).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="trail-trivia-pagination" role="navigation" aria-label="Game list pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => { dispatch(setPage(p)); dispatch(loadGames()); }}
                            aria-label={`Page ${p}`}
                            aria-current={p === page ? "page" : undefined}
                            className={p === page ? "trail-trivia-page-active" : ""}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            <ConfirmationDialog
                open={trashTarget !== null}
                message={`Move "${trashTarget?.title}" to trash? You can recover it from WordPress Trash.`}
                onConfirm={handleTrashConfirm}
                onCancel={() => setTrashTarget(null)}
            />
        </div>
    );
};

export default GameList;
