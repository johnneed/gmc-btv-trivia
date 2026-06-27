import React, { useEffect, useState } from "react";
import { useAdminDispatch, useAdminSelector } from "../../store";
import {
    loadSettings, saveSettings, grantAccess, revokeAccess, clearGrantError,
} from "../../store/settings/settings.slice";

const SettingsPage = () => {
    const dispatch = useAdminDispatch();
    const { gamesPerPage, version, wpMinimum, phpMinimum, triviaSmiths, status, grantError } =
        useAdminSelector((s) => s.settingsAdmin);
    const [perPageInput, setPerPageInput] = useState(gamesPerPage);
    const [perPageError, setPerPageError] = useState("");
    const [grantInput, setGrantInput] = useState("");

    useEffect(() => { dispatch(loadSettings()); }, [dispatch]);
    useEffect(() => { setPerPageInput(gamesPerPage); }, [gamesPerPage]);

    const handleSaveGeneral = () => {
        if (perPageInput < 1) { setPerPageError("Must be at least 1"); return; }
        setPerPageError("");
        dispatch(saveSettings({ gamesPerPage: perPageInput }));
    };

    const handleGrant = () => {
        if (!grantInput.trim()) return;
        dispatch(grantAccess(grantInput.trim()));
        setGrantInput("");
    };

    return (
        <div className="trail-trivia-settings wrap">
            <h1>Trail Trivia — Settings</h1>

            {/* General panel */}
            <section aria-labelledby="general-panel-heading" className="trail-trivia-settings-panel">
                <h2 id="general-panel-heading">General</h2>
                <table className="form-table">
                    <tbody>
                        <tr>
                            <th scope="row"><label htmlFor="games-per-page">Games per page</label></th>
                            <td>
                                <input
                                    id="games-per-page"
                                    type="number"
                                    min={1}
                                    value={perPageInput}
                                    onChange={(e) => setPerPageInput(parseInt(e.target.value, 10))}
                                />
                                {perPageError && (
                                    <p role="alert" style={{ color: "#d63638" }}>{perPageError}</p>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button
                    type="button"
                    className="button button-primary"
                    onClick={handleSaveGeneral}
                    aria-busy={status === "saving"}
                >
                    {status === "saving" ? "Saving…" : "Save Changes"}
                </button>
            </section>

            {/* TriviaSmith Access panel */}
            <section aria-labelledby="access-panel-heading" className="trail-trivia-settings-panel">
                <h2 id="access-panel-heading">TriviaSmith Access</h2>

                <table className="wp-list-table widefat fixed">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Access</th>
                        </tr>
                    </thead>
                    <tbody>
                        {triviaSmiths.map((smith) => (
                            <tr key={smith.userId}>
                                <td>{smith.displayName}</td>
                                <td>{smith.roles.join(", ")}</td>
                                <td>
                                    {smith.isAdmin ? (
                                        <span>Always Active</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => dispatch(revokeAccess(smith.userId))}
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {triviaSmiths.length === 0 && (
                            <tr><td colSpan={3}>No TriviaSmiths yet.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="trail-trivia-grant-row" style={{ marginTop: 12 }}>
                    <label htmlFor="grant-username">Grant access to:</label>
                    <input
                        id="grant-username"
                        type="text"
                        value={grantInput}
                        onChange={(e) => { setGrantInput(e.target.value); dispatch(clearGrantError()); }}
                        placeholder="WordPress username"
                    />
                    <button type="button" onClick={handleGrant}>Grant</button>
                    {grantError && (
                        <p role="alert" style={{ color: "#d63638" }}>{grantError}</p>
                    )}
                </div>
            </section>

            {/* About panel */}
            <section aria-labelledby="about-panel-heading" className="trail-trivia-settings-panel">
                <h2 id="about-panel-heading">About</h2>
                <table className="form-table">
                    <tbody>
                        <tr><th>Plugin version</th><td>{version}</td></tr>
                        <tr><th>Requires WordPress</th><td>{wpMinimum}+</td></tr>
                        <tr><th>Requires PHP</th><td>{phpMinimum}+</td></tr>
                        <tr>
                            <th>Data storage</th>
                            <td>Games are stored as the <code>trail_trivia_game</code> Custom Post Type with post meta. No custom database tables.</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default SettingsPage;
