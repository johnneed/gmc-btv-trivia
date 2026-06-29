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
        <div className="settings-wrap wrap">
            <h1>Settings</h1>

            {/* General panel */}
            <div className="settings-panel">
                <div className="settings-panel-head">
                    <h2>General</h2>
                </div>
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
                                <p className="field-desc">Number of games shown per page in the TriviaSmith game list.</p>
                                {perPageError && (
                                    <p role="alert" style={{ color: "#d63638", margin: "4px 0 0" }}>{perPageError}</p>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="settings-footer">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveGeneral}
                        aria-busy={status === "saving"}
                    >
                        {status === "saving" ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* TriviaSmith Access panel */}
            <div className="settings-panel">
                <div className="settings-panel-head">
                    <h2>TriviaSmith Access</h2>
                    <p>TriviaSmiths can create, edit, and publish Trail Trivia games. Administrators always have full access and do not need to be granted permission.</p>
                </div>

                <table className="ts-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>WordPress Role</th>
                            <th>Access</th>
                        </tr>
                    </thead>
                    <tbody>
                        {triviaSmiths.map((smith) => (
                            <tr key={smith.userId}>
                                <td><strong>{smith.displayName}</strong></td>
                                <td><span className="ts-role-badge">{smith.roles[0] ?? "—"}</span></td>
                                <td>
                                    {smith.isAdmin ? (
                                        <>
                                            <span style={{ color: "var(--wp-green)", fontWeight: 500 }}>● Always active</span>
                                            <span className="ts-admin-note" style={{ marginLeft: 12 }}>Cannot revoke</span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: "var(--tt-green)", fontWeight: 500, marginRight: 12 }}>● TriviaSmith</span>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => dispatch(revokeAccess(smith.userId))}
                                            >
                                                Revoke
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {triviaSmiths.length === 0 && (
                            <tr><td colSpan={3} style={{ color: "var(--wp-muted)", fontStyle: "italic" }}>No TriviaSmiths yet.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="grant-row">
                    <label htmlFor="grant-username">Grant access to:</label>
                    <input
                        id="grant-username"
                        type="text"
                        value={grantInput}
                        onChange={(e) => { setGrantInput(e.target.value); dispatch(clearGrantError()); }}
                        placeholder="Username or display name…"
                        onKeyDown={(e) => { if (e.key === "Enter") handleGrant(); }}
                    />
                    <button type="button" className="btn btn-primary" onClick={handleGrant}>
                        Grant Access
                    </button>
                    {grantError && (
                        <p role="alert" style={{ color: "#d63638", margin: "8px 0 0", fontSize: 13 }}>{grantError}</p>
                    )}
                </div>
            </div>

            {/* About panel */}
            <div className="settings-panel">
                <div className="settings-panel-head">
                    <h2>About</h2>
                </div>
                <div className="about-grid">
                    <div className="about-row">
                        <div className="about-label">Plugin</div>
                        <div className="about-value">Trail Trivia for GMC Burlington</div>
                    </div>
                    <div className="about-row">
                        <div className="about-label">Version</div>
                        <div className="about-value">{version ?? "—"}</div>
                    </div>
                    <div className="about-row">
                        <div className="about-label">WordPress</div>
                        <div className="about-value">Requires {wpMinimum ?? "6.4"}+</div>
                    </div>
                    <div className="about-row">
                        <div className="about-label">PHP</div>
                        <div className="about-value">Requires {phpMinimum ?? "8.0"}+</div>
                    </div>
                    <div className="about-row">
                        <div className="about-label">Data storage</div>
                        <div className="about-value">Custom post type — no custom database tables</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
