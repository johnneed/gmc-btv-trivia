/* Trail Trivia admin — connects to REST API at window.ttAdmin.apiBase */

/* ── State ── */
var currentGame    = null;
var pendingDeleteId = null;
var games          = [];

/* ── HTML escape ── */
function escHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Screen navigation ── */
function setNav(activeId) {
    ['nav-all-games','nav-add-new','nav-settings'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('current');
    });
    var active = document.getElementById(activeId);
    if (active) active.classList.add('current');
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
}

function showGames() {
    setNav('nav-all-games');
    showScreen('list-screen');
}

function showSettings() {
    setNav('nav-settings');
    showScreen('settings-screen');
}

/* ── Games list ── */
function loadGames() {
    var tbody = document.getElementById('games-tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="padding:12px;color:var(--wp-muted)">Loading…</td></tr>';

    fetch(ttAdmin.apiBase + '/games/all', { headers: { 'X-WP-Nonce': ttAdmin.nonce } })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            games = Array.isArray(data) ? data : [];
            tbody.innerHTML = '';
            if (!games.length) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--wp-muted)">No games yet. Click <strong>+ Add New Game</strong> to get started.</td></tr>';
            } else {
                games.forEach(function(game) { tbody.appendChild(makeGameRow(game)); });
            }
            updateListCounts(games);
        })
        .catch(function() {
            tbody.innerHTML = '<tr><td colspan="5" style="padding:12px;color:var(--wp-red)">Failed to load games.</td></tr>';
        });
}

function makeGameRow(game) {
    var tr   = document.createElement('tr');
    var date = new Date(game.publishDate).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'});
    var badge = game.status === 'published'
        ? '<span class="badge badge-pub"><span class="badge-dot" aria-hidden="true"></span>Published</span>'
        : '<span class="badge badge-draft"><span class="badge-dot" aria-hidden="true"></span>Draft</span>';
    var qCount = (game.questions || []).length;
    tr.innerHTML =
        '<td><div class="row-title-wrap">' +
            '<a class="row-title" href="#">' + escHtml(game.title) + '</a>' +
            (game.subtitle ? '<span class="row-subtitle">' + escHtml(game.subtitle) + '</span>' : '') +
            '<div class="row-actions" role="group">' +
                '<button class="edit-link">Edit</button>' +
                '<span class="sep" aria-hidden="true">|</span>' +
                '<button class="trash-link">Trash</button>' +
            '</div>' +
        '</div></td>' +
        '<td>' + badge + '</td>' +
        '<td class="qs-count"' + (qCount < 5 ? ' style="color:var(--wp-muted)"' : '') + '>' + qCount + '</td>' +
        '<td>' + escHtml(game.author) + '</td>' +
        '<td>' + date + '</td>';
    tr.querySelector('.row-title').addEventListener('click', function(e) { e.preventDefault(); editGame(game.id); });
    tr.querySelector('.edit-link').addEventListener('click', function() { editGame(game.id); });
    tr.querySelector('.trash-link').addEventListener('click', function() { trashGame(game.id, game.title); });
    return tr;
}

function updateListCounts(arr) {
    var total     = arr.length;
    var published = arr.filter(function(g) { return g.status === 'published'; }).length;
    var drafts    = arr.filter(function(g) { return g.status === 'draft'; }).length;
    var tabs = document.querySelectorAll('#list-screen .subsubsub button');
    if (tabs[0]) tabs[0].innerHTML = 'All <span style="color:var(--wp-muted)">(' + total + ')</span>';
    if (tabs[1]) tabs[1].innerHTML = 'Published <span style="color:var(--wp-muted)">(' + published + ')</span>';
    if (tabs[2]) tabs[2].innerHTML = 'Draft <span style="color:var(--wp-muted)">(' + drafts + ')</span>';
    var countEl = document.querySelector('#list-screen .tablenav span');
    if (countEl) countEl.textContent = total + ' game' + (total !== 1 ? 's' : '');
}

/* ── Editor ── */
function editGame(id) {
    var game = games.find(function(g) { return g.id === id; });
    if (!game) return;
    currentGame = game;
    document.getElementById('game-title').value    = game.title;
    document.getElementById('game-subtitle').value = game.subtitle || '';
    var displayDate = new Date(game.publishDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    setStatus(game.status === 'published' ? 'published' : 'draft', displayDate);
    document.getElementById('autosave-msg').textContent = 'Last edited: ' + displayDate;
    document.getElementById('main-publish-btn').textContent = game.status === 'published' ? 'Update' : 'Publish';
    renderQuestions(game.questions || []);
    renderTags(game.tags || []);
    setNav('nav-add-new');
    showScreen('editor-screen');
    checkPublishReady();
}

function showNewGame() {
    currentGame = null;
    document.getElementById('game-title').value    = '';
    document.getElementById('game-subtitle').value = '';
    setStatus('draft', '—');
    document.getElementById('autosave-msg').textContent = 'Not saved yet';
    document.getElementById('main-publish-btn').textContent = 'Publish';
    renderQuestions([]);
    renderTags([]);
    setNav('nav-add-new');
    showScreen('editor-screen');
    checkPublishReady();
}

/* ── Question rendering ── */
var LETTERS     = ['A','B','C','D'];
var NO_IMAGE_STUB = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
    '<circle cx="8.5" cy="8.5" r="1.5"/>' +
    '<polyline points="21 15 16 10 5 21"/></svg>' +
    '<small>No image</small>';
var HANDLE_SVG  = '<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">' +
    '<circle cx="3" cy="3" r="1.5"/><circle cx="7" cy="3" r="1.5"/>' +
    '<circle cx="3" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/>' +
    '<circle cx="3" cy="13" r="1.5"/><circle cx="7" cy="13" r="1.5"/></svg>';

function renderQuestions(questions) {
    var qs = questions.slice();
    while (qs.length < 5) {
        qs.push({ questionText:'', choices:[{text:''},{text:''},{text:''},{text:''}], correctAnswerIndex:0, answerText:'', answerImageUrl:'', answerImageAlt:'', answerImageCaption:'' });
    }
    var qList = document.getElementById('questions-list');
    qList.innerHTML = '';
    qs.slice(0, 5).forEach(function(q, i) {
        var card = makeQuestionCard(q, i);
        var handle = document.createElement('div');
        handle.className = 'drag-handle';
        handle.setAttribute('aria-label', 'Drag to reorder');
        handle.innerHTML = HANDLE_SVG;
        card.querySelector('.q-card-head').prepend(handle);
        card.draggable = true;
        qList.appendChild(card);
    });
    updateQBadge();
}

function makeQuestionCard(q, i) {
    var num      = String(i + 1).padStart(2, '0');
    var n        = 'q' + i;
    var cardId   = 'q-card-' + i;
    var correctIdx = q.correctAnswerIndex || 0;
    var choices    = q.choices || [{text:''},{text:''},{text:''},{text:''}];

    var choicesHtml = choices.map(function(c, ci) {
        var isCor = ci === correctIdx;
        return '<div class="choice-row' + (isCor ? ' correct' : '') + '" data-choice-id="' + escHtml(c.id || '') + '">' +
            '<input type="radio" name="' + n + '-correct" value="' + ci + '"' + (isCor ? ' checked' : '') +
            ' aria-label="Mark ' + LETTERS[ci] + ' correct" onchange="markCorrect(\'' + cardId + '\',' + ci + ')">' +
            '<div class="choice-letter" aria-hidden="true">' + LETTERS[ci] + '</div>' +
            '<input type="text" value="' + escHtml(c.text || '') + '" aria-label="Choice ' + LETTERS[ci] + '">' +
            '<span class="correct-label">' + (isCor ? 'Correct' : '') + '</span>' +
            '</div>';
    }).join('');

    var hasImg  = !!q.answerImageUrl;
    var imgHtml =
        '<div class="img-layout">' +
        '<div class="img-preview' + (hasImg ? ' has-image' : '') + '" id="' + n + '-img-preview">' +
        '<span class="img-placeholder">' + NO_IMAGE_STUB + '</span>' +
        '<img src="' + escHtml(q.answerImageUrl || '') + '" alt="' + escHtml(q.answerImageAlt || '') + '"' +
        (hasImg ? '' : ' style="display:none"') +
        ' onerror="var p=this.closest(\'.img-preview\');p.classList.remove(\'has-image\');this.style.display=\'none\'"></div>' +
        '<div class="img-fields">' +
        '<div class="field"><label for="' + n + '-img">Answer image URL <span class="opt">(optional)</span></label>' +
        '<input type="url" id="' + n + '-img" value="' + escHtml(q.answerImageUrl || '') + '" oninput="updateImgPreview(this,\'' + n + '-img-preview\')"></div>' +
        '<div class="field"><label for="' + n + '-alt">Image alt text</label>' +
        '<input type="text" id="' + n + '-alt" value="' + escHtml(q.answerImageAlt || '') + '"></div>' +
        '<div class="field"><label for="' + n + '-cap">Image caption <span class="opt">(optional)</span></label>' +
        '<input type="text" id="' + n + '-cap" value="' + escHtml(q.answerImageCaption || '') + '"></div>' +
        '</div></div>';

    var previewText     = q.questionText || '';
    var correctChoiceTxt = choices[correctIdx] ? (choices[correctIdx].text || '') : '';

    var div = document.createElement('div');
    div.className = 'q-card';
    div.id        = cardId;
    div.dataset.index = i;
    if (q.id) div.dataset.questionId = q.id;

    div.innerHTML =
        '<div class="q-card-head" onclick="toggleQ(\'' + cardId + '\')" role="button" aria-expanded="false" ' +
        'aria-controls="' + cardId + '-body" tabindex="0" ' +
        'onkeydown="if(event.key===\'Enter\'||event.key===\' \')toggleQ(\'' + cardId + '\')">' +
            '<div class="q-num" aria-hidden="true">' + num + '</div>' +
            '<div class="q-card-preview">' +
                '<div class="q-preview-text' + (!previewText ? ' empty' : '') + '">' + escHtml(previewText || 'Empty question') + '</div>' +
                (correctChoiceTxt ? '<div class="q-preview-correct">✓ ' + escHtml(correctChoiceTxt) + '</div>' : '') +
            '</div>' +
            '<div class="q-card-meta"><span class="q-expand-icon" aria-hidden="true">▼</span></div>' +
        '</div>' +
        '<div class="q-card-body" id="' + cardId + '-body">' +
            '<div class="field"><label for="' + n + '-text">Question</label>' +
            '<textarea id="' + n + '-text" rows="2" onchange="updatePreview(\'' + cardId + '\', this.value)">' + escHtml(previewText) + '</textarea></div>' +
            '<div class="field"><label>Choices <span class="opt">(select the correct answer)</span></label>' +
            '<p class="choices-legend">Click the radio button next to the <strong>correct answer</strong>.</p>' +
            choicesHtml + '</div>' +
            '<div class="field"><label for="' + n + '-answer">Answer explanation</label>' +
            '<textarea id="' + n + '-answer" rows="3">' + escHtml(q.answerText || '') + '</textarea></div>' +
            imgHtml +
        '</div>';

    return div;
}

function updateQBadge() {
    var badge = document.getElementById('q-badge');
    if (badge) badge.textContent = document.getElementById('questions-list').querySelectorAll('.q-card').length;
}

/* ── Question accordion ── */
function toggleQ(id) {
    var card   = document.getElementById(id);
    var isOpen = card.classList.contains('open');
    card.classList.toggle('open', !isOpen);
    card.querySelector('.q-card-head').setAttribute('aria-expanded', String(!isOpen));
}

function markCorrect(qId, idx) {
    var card = document.getElementById(qId);
    var rows = card.querySelectorAll('.choice-row');
    rows.forEach(function(row, i) {
        var isCor = i === idx;
        row.classList.toggle('correct', isCor);
        row.querySelector('.correct-label').textContent = isCor ? 'Correct' : '';
    });
    var inp = rows[idx] ? rows[idx].querySelector('input[type="text"]') : null;
    var previewEl = card.querySelector('.q-preview-correct');
    if (previewEl) previewEl.textContent = inp && inp.value ? '✓ ' + inp.value : '';
}

function updatePreview(qId, val) {
    var card    = document.getElementById(qId);
    var preview = card.querySelector('.q-preview-text');
    preview.textContent = val || 'Empty question';
    preview.classList.toggle('empty', !val);
}

/* ── Tags ── */
function renderTags(tags) {
    var cloud = document.getElementById('tag-cloud');
    cloud.innerHTML = '';
    (tags || []).forEach(function(tag) { appendTagChip(tag); });
}

function appendTagChip(tag) {
    var cloud = document.getElementById('tag-cloud');
    var chip  = document.createElement('span');
    chip.className  = 'tag-chip';
    chip.dataset.tag = tag;
    chip.innerHTML   = escHtml(tag) + ' <button aria-label="Remove tag ' + escHtml(tag) + '">×</button>';
    chip.querySelector('button').addEventListener('click', function() { chip.remove(); });
    cloud.appendChild(chip);
}

function addTag() {
    var input = document.getElementById('tag-input');
    var val   = input.value.trim();
    if (!val) return;
    appendTagChip(val);
    input.value = '';
    input.focus();
}
function removeTag(btn) { btn.closest('.tag-chip').remove(); }

function collectTags() {
    return Array.from(document.querySelectorAll('#tag-cloud .tag-chip')).map(function(chip) {
        return chip.dataset.tag || chip.textContent.replace('×','').trim();
    });
}

/* ── Collect question form data ── */
function collectQuestions() {
    return Array.from(document.getElementById('questions-list').querySelectorAll('.q-card')).map(function(card) {
        var i   = parseInt(card.dataset.index !== undefined ? card.dataset.index : 0);
        var n   = 'q' + i;
        var q   = {
            questionText:       (document.getElementById(n + '-text')   || {value:''}).value,
            choices:            Array.from(card.querySelectorAll('.choice-row')).map(function(row) {
                var obj = { text: (row.querySelector('input[type="text"]') || {value:''}).value };
                if (row.dataset.choiceId) obj.id = row.dataset.choiceId;
                return obj;
            }),
            correctAnswerIndex: parseInt((card.querySelector('input[type="radio"]:checked') || {value:'0'}).value),
            answerText:         (document.getElementById(n + '-answer') || {value:''}).value,
            answerImageUrl:     (document.getElementById(n + '-img')    || {value:''}).value,
            answerImageAlt:     (document.getElementById(n + '-alt')    || {value:''}).value,
            answerImageCaption: (document.getElementById(n + '-cap')    || {value:''}).value,
        };
        if (card.dataset.questionId) q.id = card.dataset.questionId;
        return q;
    });
}

/* ── Save ── */
function saveGame(targetStatus) {
    var title = document.getElementById('game-title').value.trim();
    if (!title) { showNotice('Please add a game title before saving.', 'info'); return; }

    var btn = document.getElementById('main-publish-btn');
    btn.disabled = true;
    document.getElementById('autosave-msg').textContent = 'Saving…';

    try {
        var isNew  = !currentGame;
        var body   = {
            title:       title,
            subtitle:    document.getElementById('game-subtitle').value.trim(),
            status:      targetStatus,
            publishDate: currentGame ? currentGame.publishDate : Date.now(),
            questions:   collectQuestions(),
            tags:        collectTags(),
        };
        var url    = isNew ? ttAdmin.apiBase + '/games' : ttAdmin.apiBase + '/games/' + currentGame.id;
        var method = isNew ? 'POST' : 'PUT';

        fetch(url, {
            method:  method,
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': ttAdmin.nonce },
            body:    JSON.stringify(body),
        })
        .then(function(r) {
            if (!r.ok && r.status !== 400) {
                return r.json().then(function(e) { throw e; });
            }
            return r.json();
        })
        .then(function(data) {
            btn.disabled = false;
            if (data.code) {
                showNotice('Error: ' + (data.message || 'Save failed.'), 'info');
                document.getElementById('autosave-msg').textContent = 'Save failed';
                checkPublishReady();
                return;
            }
            currentGame = data;
            var idx = games.findIndex(function(g) { return g.id === data.id; });
            if (idx >= 0) games[idx] = data; else games.unshift(data);

            var d = new Date(data.publishDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
            setStatus(data.status === 'published' ? 'published' : 'draft', d);
            btn.textContent = data.status === 'published' ? 'Update' : 'Publish';
            document.getElementById('autosave-msg').textContent = 'Saved just now';
            showNotice(
                targetStatus === 'published' ? (isNew ? 'Game published.' : 'Game updated.') : 'Draft saved.',
                'success'
            );
            checkPublishReady();
        })
        .catch(function(err) {
            btn.disabled = false;
            var msg = (err && err.message) ? err.message : 'Save failed. Please try again.';
            showNotice('Error: ' + msg, 'info');
            document.getElementById('autosave-msg').textContent = 'Save failed';
        });
    } catch (err) {
        btn.disabled = false;
        showNotice('Error: ' + (err.message || 'Could not save.'), 'info');
        document.getElementById('autosave-msg').textContent = 'Save failed';
    }
}

function publishGame() { saveGame('published'); }
function saveDraft()   { saveGame('draft'); }

/* ── Status ── */
var currentStatus = 'draft';
function setStatus(status, date) {
    currentStatus = status;
    var dot   = document.querySelector('#status-display .status-dot');
    var txt   = document.getElementById('status-text');
    var datEl = document.getElementById('pub-date-display');
    if (dot) dot.className   = 'status-dot ' + (status === 'published' ? 'status-pub' : 'status-draft-text');
    if (txt) txt.textContent = status === 'published' ? 'Published' : 'Draft';
    if (datEl) datEl.textContent = date || '—';
}
function toggleStatus() {
    var n = currentStatus === 'published' ? 'draft' : 'published';
    setStatus(n, n === 'published' ? new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—');
    document.getElementById('main-publish-btn').textContent = n === 'published' ? 'Update' : 'Publish';
}

/* ── Delete ── */
function trashGame(id, name) { pendingDeleteId = id; showDeleteDialog(name); }
function trashCurrentGame() {
    if (!currentGame) return;
    trashGame(currentGame.id, document.getElementById('game-title').value || 'this game');
}
function confirmDelete() {
    var id = pendingDeleteId;
    pendingDeleteId = null;
    hideDialog();
    showGames();
    if (!id) return;

    fetch(ttAdmin.apiBase + '/games/' + id, {
        method: 'DELETE',
        headers: { 'X-WP-Nonce': ttAdmin.nonce },
    })
    .then(function(r) { return r.json(); })
    .then(function() {
        games = games.filter(function(g) { return g.id !== id; });
        var tbody = document.getElementById('games-tbody');
        tbody.innerHTML = '';
        if (games.length) {
            games.forEach(function(game) { tbody.appendChild(makeGameRow(game)); });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--wp-muted)">No games yet.</td></tr>';
        }
        updateListCounts(games);
        showNotice('Game moved to Trash.', 'info');
    })
    .catch(function() { showNotice('Delete failed.', 'info'); loadGames(); });
}

/* ── Drag-to-reorder ── */
var qListEl = document.getElementById('questions-list');
var dragSrc = null, canDrag = false;

qListEl.addEventListener('mousedown', function(e) { canDrag = !!e.target.closest('.drag-handle'); });
qListEl.addEventListener('dragstart', function(e) {
    if (!canDrag) { e.preventDefault(); return; }
    dragSrc = e.target.closest('.q-card');
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(function() { if (dragSrc) dragSrc.classList.add('dragging'); }, 0);
});
qListEl.addEventListener('dragend', function() {
    if (dragSrc) dragSrc.classList.remove('dragging');
    qListEl.querySelectorAll('.q-card').forEach(function(c) { c.classList.remove('drag-over'); });
    dragSrc = null;
});
qListEl.addEventListener('dragover', function(e) {
    e.preventDefault();
    var card = e.target.closest('.q-card');
    if (card && card !== dragSrc) {
        qListEl.querySelectorAll('.q-card').forEach(function(c) { c.classList.remove('drag-over'); });
        card.classList.add('drag-over');
    }
});
qListEl.addEventListener('dragleave', function(e) {
    if (!qListEl.contains(e.relatedTarget))
        qListEl.querySelectorAll('.q-card').forEach(function(c) { c.classList.remove('drag-over'); });
});
qListEl.addEventListener('drop', function(e) {
    e.preventDefault();
    var target = e.target.closest('.q-card');
    if (!target || !dragSrc || target === dragSrc) return;
    var cards = Array.from(qListEl.querySelectorAll('.q-card'));
    if (cards.indexOf(dragSrc) < cards.indexOf(target)) target.after(dragSrc);
    else target.before(dragSrc);
    qListEl.querySelectorAll('.q-card').forEach(function(c) { c.classList.remove('drag-over'); });
    renumberQs();
});

function renumberQs() {
    qListEl.querySelectorAll('.q-card').forEach(function(card, i) {
        card.dataset.index = i;
        var num = card.querySelector('.q-num');
        if (num) num.textContent = String(i + 1).padStart(2, '0');
    });
}

/* ── Publish gate ── */
function checkPublishReady() {
    var btn = document.getElementById('main-publish-btn');
    if (!btn) return;
    var complete = Array.from(qListEl.querySelectorAll('.q-card')).every(function(card) {
        var i      = parseInt(card.dataset.index !== undefined ? card.dataset.index : 0);
        var textEl = document.getElementById('q' + i + '-text');
        if (!textEl || !textEl.value.trim()) return false;
        var choices = Array.from(card.querySelectorAll('.choice-row input[type="text"]'));
        if (choices.length !== 4 || !choices.every(function(c) { return c.value.trim(); })) return false;
        var answerEl = document.getElementById('q' + i + '-answer');
        return answerEl && answerEl.value.trim();
    });
    btn.disabled = !complete;
    btn.title    = complete ? '' : 'Complete all 5 questions (text, choices, answer explanation) before publishing';
}
qListEl.addEventListener('input', checkPublishReady);

/* ── Metabox toggle ── */
function toggleMeta(bodyId) {
    var body = document.getElementById(bodyId);
    if (body) body.style.display = body.style.display === 'none' ? '' : 'none';
}

/* ── Delete dialog ── */
function showDeleteDialog(name) {
    document.getElementById('dialog-game-name').textContent = name;
    document.getElementById('delete-dialog').classList.remove('hidden');
    document.querySelector('#delete-dialog button:last-child').focus();
}
function hideDialog() { document.getElementById('delete-dialog').classList.add('hidden'); }
document.getElementById('delete-dialog').addEventListener('keydown', function(e) { if (e.key === 'Escape') hideDialog(); });

/* ── Notice ── */
function showNotice(msg, type) {
    var el = document.getElementById('global-notice');
    document.getElementById('notice-msg').textContent = msg;
    el.className = 'notice ' + type;
    clearTimeout(el._timer);
    el._timer = setTimeout(function() { el.classList.add('hidden'); }, 8000);
}
function hideNotice() { document.getElementById('global-notice').classList.add('hidden'); }

/* ── Image preview ── */
function updateImgPreview(input, previewId) {
    var preview     = document.getElementById(previewId);
    if (!preview) return;
    var url         = input.value.trim();
    var img         = preview.querySelector('img');
    var placeholder = preview.querySelector('.img-placeholder');
    if (url) {
        img.src = url;
        img.style.display = '';
        preview.classList.add('has-image');
        if (placeholder) placeholder.style.display = 'none';
    } else {
        img.src = '';
        img.style.display = 'none';
        preview.classList.remove('has-image');
        if (placeholder) placeholder.style.display = '';
    }
}

/* ── Settings ── */
function saveSettings() { showNotice('Settings saved.', 'success'); }

function revokeAccess(btn, name) {
    btn.closest('tr').remove();
    showNotice('TriviaSmith access revoked for ' + name + '.', 'info');
}

function grantAccess() {
    var input    = document.getElementById('grant-user');
    var username = input.value.trim();
    if (!username) { input.focus(); return; }
    var tbody = document.getElementById('ts-user-list');
    var row   = document.createElement('tr');
    row.innerHTML =
        '<td><strong>' + escHtml(username) + '</strong></td>' +
        '<td><span class="ts-role-badge">Contributor</span></td>' +
        '<td><span class="badge badge-pub"><span class="badge-dot" aria-hidden="true"></span>TriviaSmith</span></td>' +
        '<td><button class="btn btn-secondary btn-sm">Revoke</button></td>';
    row.querySelector('button').addEventListener('click', function() {
        row.remove();
        showNotice('TriviaSmith access revoked for ' + escHtml(username) + '.', 'info');
    });
    tbody.appendChild(row);
    input.value = '';
    showNotice('TriviaSmith access granted to ' + escHtml(username) + '.', 'success');
}

/* ── Preview Game ── */
var previewQs = [], previewIdx = 0, previewScore = 0, previewFirstTry = true;

function openPreview() {
    previewQs = Array.from(qListEl.querySelectorAll('.q-card')).map(function(card) {
        var i = parseInt(card.dataset.index !== undefined ? card.dataset.index : 0);
        var n = 'q' + i;
        return {
            text:          (document.getElementById(n + '-text')   || {value:''}).value || '(no question)',
            choices:       Array.from(card.querySelectorAll('.choice-row input[type="text"]')).map(function(el) { return el.value.trim() || '—'; }),
            correct:       parseInt((card.querySelector('input[type="radio"]:checked') || {value:'0'}).value),
            answerText:    (document.getElementById(n + '-answer') || {value:''}).value,
            answerImage:   (document.getElementById(n + '-img')    || {value:''}).value,
            answerAlt:     (document.getElementById(n + '-alt')    || {value:''}).value,
            answerCaption: (document.getElementById(n + '-cap')    || {value:''}).value,
        };
    });
    document.getElementById('pv-game-title').textContent    = document.getElementById('game-title').value.trim() || 'Untitled Game';
    document.getElementById('pv-game-subtitle').textContent = document.getElementById('game-subtitle').value.trim() || '';
    previewIdx = 0; previewScore = 0;
    pvShowScreen('pv-home');
    document.getElementById('preview-modal').classList.remove('hidden');
    document.getElementById('pv-close-btn').focus();
}
function closePreview() { document.getElementById('preview-modal').classList.add('hidden'); }

function pvShowScreen(id) {
    document.querySelectorAll('.pv-screen').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
}
function previewStartGame() { previewIdx = 0; previewScore = 0; pvRenderQ(); pvShowScreen('pv-question-screen'); }

function pvRenderQ() {
    var q = previewQs[previewIdx];
    previewFirstTry = true;
    document.getElementById('pv-qtext').textContent = q.text;
    document.getElementById('pv-answer-section').style.display = 'none';
    var choicesEl = document.getElementById('pv-choices');
    choicesEl.innerHTML = '';
    q.choices.forEach(function(text, i) {
        var wrap = document.createElement('div'); wrap.className = 'pv-choice'; wrap.id = 'pv-c-' + i;
        var inner = document.createElement('div'); inner.className = 'pv-choice-inner';
        var btn = document.createElement('button'); btn.textContent = text;
        btn.onclick = (function(idx) { return function() { pvPick(idx); }; })(i);
        inner.appendChild(btn); wrap.appendChild(inner); choicesEl.appendChild(wrap);
    });
}

function pvPick(idx) {
    var q = previewQs[previewIdx];
    if (idx === q.correct) {
        if (previewFirstTry) previewScore++;
        document.querySelectorAll('#pv-choices button').forEach(function(b) { b.disabled = true; });
        pvShowAnswer(q);
        document.getElementById('pv-answer-section').style.display = '';
    } else {
        previewFirstTry = false;
        var wrap = document.getElementById('pv-c-' + idx);
        wrap.classList.add('wrong');
        wrap.querySelector('button').disabled = true;
    }
}

function pvShowAnswer(q) {
    var body = document.getElementById('pv-answer-body');
    function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    var paras = q.answerText.split(/[\n\r]+/).filter(function(t) { return t.trim(); }).map(function(t) { return '<p>' + esc(t) + '</p>'; }).join('');
    if (q.answerImage) {
        body.innerHTML = '<article class="pv-answer-box"><div class="pv-answer-pic"><figure>' +
            '<img src="' + esc(q.answerImage) + '" alt="' + esc(q.answerAlt) + '" onerror="this.closest(\'figure\').style.display=\'none\'">' +
            (q.answerCaption ? '<figcaption>' + esc(q.answerCaption) + '</figcaption>' : '') +
            '</figure></div><div class="pv-answer-text">' + paras + '</div></article>';
    } else {
        body.innerHTML = '<article class="pv-answer-no-img"><div>' + paras + '</div></article>';
    }
    var isLast = previewIdx >= previewQs.length - 1;
    var nav    = document.getElementById('pv-nav-section');
    if (isLast) {
        nav.innerHTML = '<div class="pv-congrats"><div><span class="pv-congrats-emoji">🎉</span><span>' +
            '<button class="pv-congrats-text" onclick="pvShowScore()">You survived the quiz!<br>Checkout your score.</button>' +
            '</span><span class="pv-congrats-emoji">🎉</span></div></div>';
    } else {
        nav.innerHTML = '<button class="pv-next-q" onclick="pvNextQ()">Next Question ▷</button>';
    }
}

function pvNextQ()    { previewIdx++; pvRenderQ(); window.scrollTo(0,0); }
function pvShowScore() {
    document.getElementById('pv-score-msg').textContent = 'You got ' + previewScore + ' out of ' + previewQs.length + ' right on the first try!';
    pvShowScreen('pv-score-screen');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !document.getElementById('preview-modal').classList.contains('hidden')) closePreview();
});

/* ── Full-screen image modal ── */
var imgModal = document.createElement('div');
imgModal.className = 'img-modal hidden';
imgModal.setAttribute('role', 'dialog');
imgModal.setAttribute('aria-modal', 'true');
imgModal.setAttribute('aria-label', 'Full-size image');
imgModal.innerHTML = '<button class="img-modal-close" aria-label="Close image preview">×</button><img src="" alt=""><span class="img-modal-caption"></span>';
document.body.appendChild(imgModal);
var modalImg = imgModal.querySelector('img'), modalCaption = imgModal.querySelector('.img-modal-caption'), modalClose = imgModal.querySelector('.img-modal-close');
var closeImgModal = function() { imgModal.classList.add('hidden'); };
imgModal.addEventListener('click', function(e) { if (e.target !== modalImg) closeImgModal(); });
modalClose.addEventListener('click', closeImgModal);
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeImgModal(); });
document.addEventListener('click', function(e) {
    var preview = e.target.closest('.img-preview');
    if (!preview) return;
    var layout = preview.closest('.img-layout');
    if (!preview.classList.contains('has-image')) {
        // No image loaded — focus URL input so user can enter one
        var urlInput = layout ? layout.querySelector('input[type="url"]') : null;
        if (urlInput) { urlInput.focus(); urlInput.select(); }
        return;
    }
    var img = preview.querySelector('img');
    if (!img) return;
    modalImg.src = img.src; modalImg.alt = img.alt;
    var capInput = layout ? layout.querySelector('input[id$="-cap"]') : null;
    var cap = capInput ? capInput.value : '';
    modalCaption.textContent = cap; modalCaption.hidden = !cap;
    imgModal.classList.remove('hidden'); modalClose.focus();
});

/* ── Init ── */
var _page = new URLSearchParams(location.search).get('page');
if (_page === 'trail-trivia-settings') showSettings();
else loadGames();
