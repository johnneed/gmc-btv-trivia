<?php
/**
 * Admin page — Trail Trivia admin SPA mount point.
 *
 * @package Trail_Trivia
 */
?>
<script>
var ttAdmin = <?php echo wp_json_encode( array(
    'apiBase' => rest_url( 'trail-trivia/v1' ),
    'nonce'   => wp_create_nonce( 'wp_rest' ),
) ); ?>;
</script>
<div class="wrap">
<div id="trail-trivia-admin-root">

  <!-- ── Notice ── -->
  <div class="notice success hidden" id="global-notice" role="status" aria-live="polite">
    <span id="notice-msg">Saved.</span>
    <button class="notice-dismiss" onclick="hideNotice()" aria-label="Dismiss notice">×</button>
  </div>

  <!-- ══════════════════════════════════════
       SCREEN 1: GAME LIST
  ══════════════════════════════════════ -->
  <div class="screen active" id="list-screen">

    <div class="list-header">
      <h1>Trail Trivia</h1>
      <button class="btn btn-primary" onclick="showNewGame()">+ Add New Game</button>
    </div>

    <div class="subsubsub" role="tablist" aria-label="Filter games by status">
      <button class="current" role="tab" aria-selected="true">All <span style="color:var(--wp-muted)">(6)</span></button>
      <span class="pipe">|</span>
      <button role="tab" aria-selected="false">Published <span style="color:var(--wp-muted)">(4)</span></button>
      <span class="pipe">|</span>
      <button role="tab" aria-selected="false">Draft <span style="color:var(--wp-muted)">(2)</span></button>
    </div>

    <div class="tablenav">
      <form class="search-form" role="search" onsubmit="return false">
        <label for="game-search" style="position:absolute;left:-9999px">Search games</label>
        <input type="text" id="game-search" placeholder="Search games…" aria-label="Search games">
        <button class="btn btn-secondary btn-sm" type="submit">Search</button>
      </form>
      <span style="font-size:12px;color:var(--wp-muted)">6 games</span>
    </div>

    <table class="widefat" aria-label="Trail Trivia games">
      <thead>
        <tr>
          <th class="col-title" scope="col">Title</th>
          <th class="col-status" scope="col">Status</th>
          <th class="col-qs" scope="col">Questions</th>
          <th class="col-author" scope="col">Author</th>
          <th class="col-date" scope="col">Date</th>
        </tr>
      </thead>
      <tbody id="games-tbody">
        <tr><td colspan="5" style="padding:12px;color:var(--wp-muted)">Loading…</td></tr>
      </tbody>
    </table>

  </div><!-- /list-screen -->


  <!-- ══════════════════════════════════════
       SCREEN 2: SETTINGS
  ══════════════════════════════════════ -->
  <div class="screen" id="settings-screen" role="main" aria-label="Plugin settings">
    <div class="settings-wrap">

      <div class="list-header" style="margin-bottom:20px">
        <h1 style="font-family:var(--font-display);font-size:23px;font-weight:700">Settings</h1>
      </div>

      <div class="settings-panel">
        <div class="settings-panel-head"><h2>General</h2></div>
        <table class="form-table" aria-label="General settings">
          <tr>
            <th scope="row"><label for="setting-per-page">Games per page</label></th>
            <td>
              <input type="number" id="setting-per-page" value="10" min="1" max="100" aria-describedby="per-page-desc">
              <p class="field-desc" id="per-page-desc">Number of games shown per page in the game list.</p>
            </td>
          </tr>
        </table>
        <div class="settings-footer">
          <button class="btn btn-primary" onclick="saveSettings()">Save Changes</button>
        </div>
      </div>

      <div class="settings-panel">
        <div class="settings-panel-head">
          <h2>TriviaSmith Access</h2>
          <p>TriviaSmiths can create, edit, and publish Trail Trivia games. Administrators always have full access.</p>
        </div>
        <table class="ts-table" aria-label="Users with TriviaSmith access">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">WordPress Role</th>
              <th scope="col">Access</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="ts-user-list">
            <tr>
              <td><strong><?php echo esc_html( wp_get_current_user()->display_name ); ?></strong>
                <span style="color:var(--wp-muted);font-size:12px"><?php echo esc_html( wp_get_current_user()->user_login ); ?></span></td>
              <td><span class="ts-role-badge">Administrator</span></td>
              <td><span class="badge badge-pub"><span class="badge-dot" aria-hidden="true"></span>Always active</span></td>
              <td><span class="ts-admin-note">Cannot revoke</span></td>
            </tr>
          </tbody>
        </table>
        <div class="grant-row">
          <label for="grant-user">Grant access to:</label>
          <input type="text" id="grant-user" placeholder="Username or display name…" aria-label="WordPress username">
          <button class="btn btn-primary" onclick="grantAccess()">Grant Access</button>
        </div>
      </div>

      <div class="settings-panel">
        <div class="settings-panel-head"><h2>About</h2></div>
        <div class="about-grid">
          <div class="about-row"><div class="about-label">Plugin</div><div class="about-value">Trail Trivia for GMC Burlington</div></div>
          <div class="about-row"><div class="about-label">Version</div><div class="about-value"><?php echo esc_html( TRAIL_TRIVIA_VERSION ); ?></div></div>
          <div class="about-row"><div class="about-label">WordPress</div><div class="about-value">Requires 6.4 or higher</div></div>
          <div class="about-row"><div class="about-label">PHP</div><div class="about-value">Requires 8.0 or higher</div></div>
          <div class="about-row"><div class="about-label">Data storage</div><div class="about-value">Custom post type — no custom database tables</div></div>
        </div>
      </div>

    </div>
  </div><!-- /settings-screen -->


  <!-- ══════════════════════════════════════
       SCREEN 3: GAME EDITOR
  ══════════════════════════════════════ -->
  <div class="screen" id="editor-screen">

    <div class="editor-bar">
      <button class="back-link" onclick="showGames()" aria-label="Return to All Games">← All Games</button>
      <span class="autosave" role="status" aria-live="polite" id="autosave-msg">Draft saved 2 minutes ago</span>
    </div>

    <div class="editor-layout">

      <!-- Left column -->
      <div>
        <div class="title-box" role="group" aria-label="Game title and subtitle">
          <label for="game-title" style="position:absolute;left:-9999px">Game title</label>
          <input type="text" id="game-title" placeholder="Add game title…" aria-required="true">
          <label for="game-subtitle" style="position:absolute;left:-9999px">Game subtitle (optional)</label>
          <input type="text" id="game-subtitle" placeholder="Subtitle (optional)">
        </div>

        <div class="questions-box" role="region" aria-label="Questions">
          <div class="questions-head">
            <h2>Questions <span class="q-total-badge" id="q-badge">5</span></h2>
          </div>

          <div id="questions-list"></div>
        </div><!-- /questions-box -->
      </div><!-- /left column -->

      <!-- Right column -->
      <div>
        <button class="preview-game-btn" onclick="openPreview()" aria-label="Preview this game">
          <svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden="true"><path d="M2 1.5l10 5.5-10 5.5V1.5z" fill="currentColor"/></svg>
          Preview Game
        </button>

        <div class="metabox">
          <div class="metabox-head" onclick="toggleMeta('publish-body')">
            <h2>Publish</h2>
            <span class="metabox-toggle" aria-hidden="true">▼</span>
          </div>
          <div id="publish-body">
            <div class="publish-misc">
              <div class="pub-row">
                <span class="pub-label">Status</span>
                <span class="pub-value" id="status-display">
                  <span class="status-dot status-pub" aria-hidden="true"></span>
                  <span id="status-text">Published</span>
                  <button class="pub-change" onclick="toggleStatus()" aria-label="Change status">Change</button>
                </span>
              </div>
              <div class="pub-row">
                <span class="pub-label">Published</span>
                <span class="pub-value" id="pub-date-display">Dec 29, 2023</span>
              </div>
              <div class="pub-row">
                <span class="pub-label">Author</span>
                <span class="pub-value"><?php echo esc_html( wp_get_current_user()->display_name ); ?></span>
              </div>
            </div>
            <div class="publish-actions">
              <button class="btn btn-publish" id="main-publish-btn" onclick="publishGame()">Update</button>
              <button class="btn btn-secondary" onclick="saveDraft()">Save Draft</button>
              <div style="display:flex;justify-content:flex-end">
                <button class="btn btn-icon" style="color:var(--wp-red);border-color:var(--wp-red);background:none" title="Move to Trash" aria-label="Move to Trash" onclick="trashCurrentGame()">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M1 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4M2.5 4l.75 9.5a.5.5 0 0 0 .5.5h6.5a.5.5 0 0 0 .5-.5L11.5 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 7v5M8.5 7v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div><!-- /publish metabox -->

        <div class="metabox">
          <div class="metabox-head" onclick="toggleMeta('tags-body')">
            <h2>Tags</h2>
            <span class="metabox-toggle" aria-hidden="true">▼</span>
          </div>
          <div class="metabox-body" id="tags-body">
            <div class="tag-input-row">
              <label for="tag-input" style="position:absolute;left:-9999px">Add tag</label>
              <input type="text" id="tag-input" placeholder="Add tag…" onkeydown="if(event.key==='Enter'){addTag();event.preventDefault();}">
              <button class="btn btn-secondary btn-sm" onclick="addTag()">Add</button>
            </div>
            <div class="tag-cloud" id="tag-cloud">
              <span class="tag-chip">CDT <button onclick="removeTag(this)" aria-label="Remove tag CDT">×</button></span>
              <span class="tag-chip">Triple Crown <button onclick="removeTag(this)" aria-label="Remove tag Triple Crown">×</button></span>
            </div>
          </div>
        </div><!-- /tags metabox -->

      </div><!-- /right column -->
    </div><!-- /editor-layout -->
  </div><!-- /editor-screen -->

</div><!-- /trail-trivia-admin-root -->
</div><!-- /wrap -->

<!-- Preview modal -->
<div class="preview-modal hidden" id="preview-modal" role="dialog" aria-modal="true" aria-label="Game preview">
  <button class="pv-close-btn" id="pv-close-btn" onclick="closePreview()" aria-label="Close preview">×</button>
  <div class="pv-app">
    <div class="pv-screen active" id="pv-home">
      <div class="pv-home">
        <p class="pv-message">A new trivia challenge every Friday</p>
        <div class="pv-home-header">
          <h1 class="pv-h1">Trail Trivia</h1>
          <div class="pv-logo" aria-hidden="true">
            <span><svg width="1419" height="1419" viewBox="0 0 1419 1419" xmlns="http://www.w3.org/2000/svg"><g transform="translate(10.65,-56.7)"><path fill="#2A1C00" d="m698.9 570.3c-108 0-195.9 87.9-195.9 195.9s87.9 195.9 195.9 195.9 195.8-87.9 195.8-195.9-87.9-195.9-195.8-195.9zm0 369.1c-95.5 0-173.2-77.7-173.2-173.2s77.6-173.2 173.2-173.2 173.2 77.7 173.2 173.2-77.7 173.2-173.2 173.2z"/><path fill="#2A1C00" d="m775.3 674.7-115.6 41.8c-3.1 1.1-5.6 3.6-6.7 6.7l-45 119.8c-1.6 4.2-0.5 8.9 2.7 12.1 2.1 2.1 5 3.2 7.9 3.2 1.4 0 2.8-0.3 4.2-0.8l126.3-50.3c3.2-1.2 5.6-3.9 6.6-7.2l34.2-111.3c1.2-4.1 0.1-8.5-3-11.5s-7.6-3.9-11.6-2.5zm-39.7 113.5-97.5 38.9 34.2-91 89.4-32.3z"/></g></svg></span>
            <span><svg viewBox="0 0 1419 1419" xmlns="http://www.w3.org/2000/svg"><circle cx="709.5" cy="709.5" r="680" fill="none" stroke="#AA1300" stroke-width="18" stroke-dasharray="60 30"/><circle cx="709.5" cy="709.5" r="620" fill="none" stroke="#006A00" stroke-width="8" stroke-dasharray="80 20"/></svg></span>
          </div>
        </div>
        <p class="pv-quiz-title" id="pv-game-title"></p>
        <p class="pv-quiz-subtitle" id="pv-game-subtitle"></p>
        <div class="pv-btn-wrap">
          <button class="pv-action-btn pv-btn-dark" onclick="previewStartGame()">Play</button>
        </div>
        <div class="pv-author"><p id="pv-author-line">Preview mode</p></div>
      </div>
    </div>
    <div class="pv-screen" id="pv-question-screen">
      <article class="pv-question-box">
        <div class="pv-question-text" id="pv-qtext"></div>
        <div class="pv-choices-container" id="pv-choices" role="group" aria-labelledby="pv-qtext"></div>
      </article>
      <div id="pv-answer-section" style="display:none" aria-live="polite">
        <div class="pv-answer"><h4 class="pv-huzzah">Huzzah!</h4><div id="pv-answer-body"></div></div>
        <div id="pv-nav-section"></div>
      </div>
    </div>
    <div class="pv-screen" id="pv-score-screen">
      <div class="pv-score-screen">
        <div><h1 class="pv-h1">Trail Trivia</h1></div>
        <p class="pv-score-msg" id="pv-score-msg" aria-live="assertive"></p>
        <div class="pv-score-nav">
          <button class="pv-action-btn pv-btn-dark" onclick="closePreview()">◁ Back to Trail Trivia</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Delete dialog -->
<div class="dialog-backdrop hidden" id="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <div class="dialog">
    <h3 id="dialog-title">Move to Trash?</h3>
    <p id="dialog-desc">Move "<span id="dialog-game-name">this game</span>" to the trash? You can restore it from the Trash screen.</p>
    <div class="dialog-actions">
      <button class="btn btn-secondary" onclick="hideDialog()">Cancel</button>
      <button class="btn" style="background:var(--wp-red);color:#fff;border-color:#8b1a1a" onclick="confirmDelete()">Move to Trash</button>
    </div>
  </div>
</div>
