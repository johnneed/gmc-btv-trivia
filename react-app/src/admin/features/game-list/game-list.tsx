import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminDispatch, useAdminSelector } from "../../store";
import {
    loadGames, removeGame, setStatusFilter, setSearchQuery, setPage,
} from "../../store/games/games.slice";
import ConfirmationDialog from "../../components/confirmation-dialog/confirmation-dialog";
import { seedGames } from "../../data/admin-api";
import type { Quiz } from "../../../domain/types";

const GameList = () => {
    const dispatch = useAdminDispatch();
    const navigate = useNavigate();
    const { items, total, page, perPage, statusFilter, status } = useAdminSelector((s) => s.gamesAdmin);
    const [searchInput, setSearchInput] = useState("");
    const [trashTarget, setTrashTarget] = useState<Quiz | null>(null);
    const [seeding, setSeeding] = useState(false);
    const [seedError, setSeedError] = useState<string | null>(null);

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

    const handleSeed = async () => {
        if (!window.confirm("Seed the database with sample games? Images will be downloaded — this may take several minutes.")) return;
        setSeeding(true);
        setSeedError(null);
        try {
            await seedGames();
            dispatch(loadGames());
        } catch (err) {
            setSeedError(err instanceof Error ? err.message : "Seeding failed");
        } finally {
            setSeeding(false);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    return (
        <div className="wrap">
            <div className="list-header">
                <h1>Trail Trivia</h1>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleSeed}
                        disabled={seeding}
                        title="Import sample games with images (may take several minutes)"
                    >
                        {seeding ? "Seeding…" : "Seed Games"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate("/games/new")}
                    >
                        + Add New Game
                    </button>
                </div>
            </div>
            {seedError && <p role="alert" style={{ color: "var(--wp-error, red)" }}>{seedError}</p>}

            <div className="subsubsub" role="tablist" aria-label="Filter games by status">
                {(["all", "published", "draft"] as const).map((f, i) => (
                    <React.Fragment key={f}>
                        {i > 0 && <span className="pipe">|</span>}
                        <button
                            role="tab"
                            aria-selected={statusFilter === f}
                            type="button"
                            onClick={() => handleFilter(f)}
                            className={statusFilter === f ? "current" : ""}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            <div className="tablenav">
                <form className="search-form" role="search" onSubmit={handleSearch}>
                    <label htmlFor="game-search" style={{ position: "absolute", left: -9999 }}>Search games</label>
                    <input
                        id="game-search"
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search games…"
                        aria-label="Search games by title"
                    />
                    <button type="submit" className="btn btn-secondary btn-sm">Search</button>
                </form>
                <span style={{ fontSize: 12, color: "var(--wp-muted)" }}>{total} {total === 1 ? "game" : "games"}</span>
            </div>

            {status === "loading" && <p>Loading…</p>}
            {status === "failed" && <p role="alert">Failed to load games.</p>}

            <table className="widefat" aria-label="Trail Trivia games">
                <thead>
                    <tr>
                        <th className="col-title" scope="col">Title</th>
                        <th className="col-status" scope="col">Status</th>
                        <th className="col-qs" scope="col">Questions</th>
                        <th className="col-author" scope="col">Author</th>
                        <th className="col-date" scope="col">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && status === "idle" && (
                        <tr><td colSpan={5}>No games found.</td></tr>
                    )}
                    {items.map((game) => (
                        <tr key={game.id}>
                            <td>
                                <div className="row-title-wrap">
                                    <button
                                        type="button"
                                        className="row-title"
                                        onClick={() => navigate(`/games/${game.id}/edit`)}
                                        aria-label={`Edit ${game.title}`}
                                    >
                                        {game.title}
                                    </button>
                                    {game.subtitle && <span className="row-subtitle">{game.subtitle}</span>}
                                    <div className="row-actions" role="group" aria-label={`Actions for ${game.title}`}>
                                        <button type="button" className="edit-link" onClick={() => navigate(`/games/${game.id}/edit`)}>
                                            Edit
                                        </button>
                                        <span className="sep" aria-hidden="true">|</span>
                                        <button type="button" className="trash-link" onClick={() => setTrashTarget(game)}>
                                            Trash
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`badge ${game.status === "published" ? "badge-pub" : "badge-draft"}`}>
                                    <span className="badge-dot" aria-hidden="true" />
                                    {game.status === "published" ? "Published" : "Draft"}
                                </span>
                            </td>
                            <td className="qs-count">{game.questions.length}</td>
                            <td>{game.author}</td>
                            <td>{new Date(game.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => { dispatch(setPage(p)); dispatch(loadGames()); }}
                            aria-label={`Page ${p}`}
                            aria-current={p === page ? "page" : undefined}
                            className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`}
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
