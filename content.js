(async function() {
  if (document.getElementById('wa-extractor-panel')) {
    return; // Already injected
  }

  // Inject CSS
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes pulseShadow { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
    .wa-panel {
      position: fixed; top: 20px; right: 20px; z-index: 999999;
      background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
      border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
      font-family: 'Inter', sans-serif; color: #0f172a;
      width: 380px; padding: 24px;
      animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .wa-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
    .wa-header-left { display: flex; gap: 12px; }
    .wa-logo { width: 44px; height: 44px; background: #dcfce7; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.15); }
    .wa-logo svg { width: 28px; height: 28px; }
    .wa-title-group h2 { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.2; }
    .wa-title-group p { margin: 2px 0 0 0; font-size: 12px; font-weight: 500; color: #64748b; }
    .wa-header-actions { display: flex; gap: 8px; }
    .wa-icon-btn { background: transparent; border: none; cursor: pointer; padding: 6px; color: #64748b; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .wa-icon-btn:hover { background: #f1f5f9; color: #0f172a; transform: rotate(15deg); }

    /* Minimize Mode */
    .wa-panel.minimized { width: 50px; height: 50px; border-radius: 50%; padding: 0; overflow: hidden; justify-content: center; align-items: center; cursor: pointer; display: flex; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .wa-panel.minimized > *:not(.wa-header) { display: none !important; }
    .wa-panel.minimized .wa-header { margin: 0; width: 100%; height: 100%; justify-content: center; align-items: center; }
    .wa-panel.minimized .wa-header-left { margin: 0; }
    .wa-panel.minimized .wa-title-group, .wa-panel.minimized .wa-header-actions { display: none !important; }
    .wa-panel.minimized .wa-logo { background: transparent; box-shadow: none; width: 100%; height: 100%; pointer-events: none; }
    .wa-panel.minimized .wa-logo svg { width: 34px; height: 34px; }
    .wa-panel.minimized:hover { box-shadow: 0 0 15px rgba(37, 211, 102, 0.5); transform: scale(1.05); }

    .wa-tabs { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; gap: 4px; }
    .wa-tab { padding: 8px 12px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
    .wa-tab:hover { color: #0f172a; background: #f8fafc; border-radius: 6px 6px 0 0; }
    .wa-tab.active { color: #10b981; border-bottom-color: #10b981; }
    .wa-tab-content { display: none; }
    .wa-tab-content.active { display: block; }

    .wa-section-title { display: flex; align-items: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; margin-bottom: 16px; }
    .wa-section-title::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; margin-left: 12px; }
    .wa-start-btn { width: 100%; padding: 14px; background: linear-gradient(to right, #34d399, #10b981); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: all 0.2s; margin-bottom: 12px; }
    .wa-start-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); }
    .wa-start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .wa-start-btn.running { background: linear-gradient(to right, #fbbf24, #f59e0b); box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }
    .wa-stop-link { text-align: center; font-size: 13px; color: #64748b; text-decoration: underline; cursor: pointer; transition: color 0.2s; margin-bottom: 24px; display: block; background: none; border: none; width: 100%; }
    .wa-stop-link:hover { color: #ef4444; }

    .wa-status { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 16px; }
    .wa-status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; }
    .wa-status-dot.active { animation: pulseShadow 1.5s infinite; }
    .wa-stats-grid { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .wa-stat-label { font-size: 12px; color: #64748b; font-weight: 500; margin-bottom: 4px; }
    .wa-stat-value { font-size: 32px; font-weight: 700; color: #0f172a; line-height: 1; }
    .wa-stat-value.small { font-size: 18px; line-height: 1.5; text-align: right; }
    .wa-data-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .wa-data-title { font-size: 12px; font-weight: 500; color: #475569; }
    .wa-download-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #e2e8f0; color: #334155; font-size: 11px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
    .wa-download-btn:hover:not(:disabled) { background: #cbd5e1; }
    .wa-download-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .wa-progress-bar { width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: 16px; position: relative; }
    .wa-progress-fill { height: 100%; background: #34d399; width: 0%; transition: width 0.3s ease; }
    .wa-progress-indeterminate { position: absolute; top:0; left:0; height: 100%; width: 30%; background: #34d399; animation: indeterminate 1.5s infinite linear; display: none; }
    @keyframes indeterminate { 0% { left: -30%; } 100% { left: 100%; } }
    .wa-list-container { max-height: 140px; overflow-y: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; }
    .wa-list-container::-webkit-scrollbar { width: 6px; }
    .wa-list-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .wa-list-item { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; align-items: center; }
    .wa-list-item:last-child { border-bottom: none; }
    .wa-item-name { color: #0f172a; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wa-item-number { color: #64748b; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wa-item-status { color: #10b981; font-weight: 500; }

    .wa-form-group { margin-bottom: 16px; }
    .wa-label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .wa-textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 13px; resize: vertical; min-height: 80px; box-sizing: border-box; }
    .wa-input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 13px; box-sizing: border-box;}
    .wa-input-row { display: flex; gap: 12px; }
    .wa-input-row > div { flex: 1; }
    .wa-queue-box { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; color: #475569; text-align: center; margin-bottom: 16px; border: 1px dashed #cbd5e1; }
    .wa-premium-lock { background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 8px; font-size: 12px; text-align: center; margin-bottom: 16px; font-weight: 500; display: none; }
    .wa-drop-zone { border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; background: #f8fafc; color: #64748b; font-size: 12px; cursor: pointer; margin-bottom: 8px; transition: all 0.2s; }
    .wa-drop-zone:hover, .wa-drop-zone.dragover { border-color: #10b981; background: #dcfce7; color: #0f172a; }
    .wa-template-btn { display: block; text-align: center; font-size: 11px; color: #10b981; text-decoration: none; margin-bottom: 16px; cursor: pointer; font-weight: 600; }
    .wa-template-btn:hover { text-decoration: underline; }

    .wa-settings-menu { position: absolute; top: 60px; right: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 12px; display: none; z-index: 10; width: 180px; }
    .wa-settings-menu.open { display: block; }
    .wa-toggle-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 13px; font-weight: 500; color: #334155; }
    .wa-switch { position: relative; display: inline-block; width: 34px; height: 20px; }
    .wa-switch input { opacity: 0; width: 0; height: 0; }
    .wa-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 20px; }
    .wa-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .wa-slider { background-color: #10b981; }
    input:checked + .wa-slider:before { transform: translateX(14px); }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'wa-panel';
  panel.id = 'wa-extractor-panel';
  
  const wappSvg = '<svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><path d="M12.012 2c5.506 0 9.989 4.478 9.989 9.984 0 5.504-4.483 9.983-9.989 9.983-1.745 0-3.385-.45-4.805-1.238l-5.188 1.36 1.385-5.056a9.92 9.92 0 0 1-1.376-5.049c0-5.506 4.483-9.984 9.984-9.984z" fill="#25D366"/><path d="M17.48 15.04c-.288-.144-1.692-.84-1.956-.936-.264-.096-.456-.144-.648.144-.192.288-.744.936-.912 1.128-.168.192-.336.216-.624.072-1.26-.612-2.184-1.104-3.036-2.58-.216-.384.42-.36.96-1.44.072-.144.036-.288-.012-.432-.048-.144-.648-1.56-.888-2.136-.24-.564-.48-.492-.648-.504-.168-.012-.36-.012-.552-.012-.192 0-.504.072-.768.36-.264.288-1.008.984-1.008 2.4s1.032 2.784 1.176 2.976c.144.192 2.028 3.096 4.908 4.344 1.764.768 2.508.84 3.42.708.768-.108 2.376-.972 2.712-1.908.336-.936.336-1.74.24-1.908-.096-.168-.36-.264-.648-.408z" fill="#FFFFFF"/></svg>';
  const gearSvg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
  const closeSvg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  const minusSvg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
  const csvSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 9H9v-1h2v-1H9v-1h2v-1H9v-1h2v-1h1.5l1.5 2 1.5-2H18v1h-2v1h2v1h-2v1h2v1h-2v1h-2.5l-1.5-2-1.5 2H11z"/></svg>';

  panel.innerHTML = `
    <div class="wa-header">
      <div class="wa-header-left">
        <div class="wa-logo">${wappSvg}</div>
        <div class="wa-title-group">
          <h2>Yogendra SaaS</h2>
          <p>Ultimate WA CRM</p>
        </div>
      </div>
      <div class="wa-header-actions">
        <button class="wa-icon-btn" id="wa-min-btn" title="Minimize">${minusSvg}</button>
        <button class="wa-icon-btn" id="wa-settings-btn" title="Settings">${gearSvg}</button>
        <button class="wa-icon-btn" id="wa-close-btn" title="Close Panel">${closeSvg}</button>
      </div>
    </div>

    <div class="wa-settings-menu" id="wa-settings-menu">
      <div class="wa-toggle-row">
        <span>Auto-Scroll</span>
        <label class="wa-switch">
          <input type="checkbox" id="wa-autoscroll-toggle" checked>
          <span class="wa-slider"></span>
        </label>
      </div>
      <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 14px; font-weight: 500; color: #0f172a;">Credits:</span>
          <span id="wa-credits-count" style="font-size: 16px; font-weight: 700; color: #10b981;">0</span>
        </div>
        <button class="wa-start-btn" id="wa-pay-btn" style="background: linear-gradient(to right, #6366f1, #4f46e5); box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); width: 100%; padding: 8px; font-size: 13px;">Add 50 Credits</button>
      </div>
    </div>

    <!-- TABS -->
    <div class="wa-tabs">
      <div class="wa-tab active" data-tab="extractor">Extractor</div>
      <div class="wa-tab" data-tab="validator">Validator</div>
      <div class="wa-tab" data-tab="sender">Sender</div>
      <div class="wa-tab" data-tab="bot">Auto-Bot</div>
    </div>

    <!-- TAB 1: EXTRACTOR -->
    <div class="wa-tab-content active" id="tab-extractor">
      <div class="wa-status">
        Status: <span id="wa-status-text">Ready to Extract</span> <span class="wa-status-dot" id="wa-status-dot"></span>
      </div>

      <div class="wa-stats-grid">
        <div>
          <div class="wa-stat-label">Contacts Found:</div>
          <div class="wa-stat-value" id="wa-count-text">0</div>
        </div>
        <div>
          <div class="wa-stat-label" style="text-align: right;">Last Sync:</div>
          <div class="wa-stat-value small" id="wa-sync-text">Never</div>
        </div>
      </div>

      <div class="wa-section-title">Controls</div>
      <button class="wa-start-btn" id="wa-start-btn">START COLLECTING</button>
      <button class="wa-stop-link" id="wa-stop-btn">Stop Extraction</button>

      <div class="wa-section-title">Data</div>
      <div class="wa-data-header">
        <div class="wa-data-title" id="wa-data-title">Collected Data (0 entries)</div>
        <button class="wa-download-btn" id="wa-download-btn" disabled>
          ${csvSvg} DOWNLOAD CSV
        </button>
      </div>
      
      <div class="wa-progress-bar">
        <div class="wa-progress-fill" id="wa-progress-fill"></div>
        <div class="wa-progress-indeterminate" id="wa-progress-anim"></div>
      </div>

      <div class="wa-list-container" id="wa-preview-list"></div>
    </div>

    <!-- TAB 1.5: VALIDATOR -->
    <div class="wa-tab-content" id="tab-validator">
      <div class="wa-premium-lock" id="wa-validator-lock">🔒 Premium Feature: Please login via Extension Icon to use.</div>
      <div id="wa-validator-content">
        <div class="wa-drop-zone" id="wa-val-drop-zone">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px; color:#f59e0b;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <div>Upload CSV to Validate<br>(Name, Number)</div>
          <input type="file" id="wa-val-file-input" accept=".csv" style="display:none;">
        </div>
        
        <div class="wa-stats-grid" style="margin-top: 15px; display: none;" id="wa-val-stats">
          <div><div class="wa-stat-label">Total</div><div class="wa-stat-value" id="wa-val-total">0</div></div>
          <div><div class="wa-stat-label">Active 🟢</div><div class="wa-stat-value" id="wa-val-valid">0</div></div>
          <div><div class="wa-stat-label">Inactive 🔴</div><div class="wa-stat-value" id="wa-val-invalid">0</div></div>
        </div>

        <button class="wa-btn" id="wa-val-start" style="width: 100%; margin-top: 15px; display: none;">START VALIDATION</button>
        <button class="wa-stop-link" id="wa-val-stop" style="display:none;">Stop Validation</button>
        <button class="wa-stop-link" id="wa-val-reupload" style="display:none; color:#3b82f6;">🔄 Re-upload CSV</button>
        
        <div style="margin-top: 15px; display: flex; gap: 8px;">
          <button class="wa-btn wa-btn-outline" id="wa-val-down-valid" style="flex: 1; display: none; color: #10b981; border-color: #10b981; font-size: 11px; padding: 6px;">
            ⬇️ Download Active
          </button>
          <button class="wa-btn wa-btn-outline" id="wa-val-down-invalid" style="flex: 1; display: none; color: #ef4444; border-color: #ef4444; font-size: 11px; padding: 6px;">
            ⬇️ Download Inactive
          </button>
        </div>
        <div class="wa-list-container" id="wa-val-preview-list" style="margin-top: 15px; display: none; height: 180px;"></div>
      </div>
    </div>

    <!-- TAB 2: BULK SENDER -->
    <div class="wa-tab-content" id="tab-sender">
      <div class="wa-premium-lock" id="wa-sender-lock">🔒 Premium Feature: Please login via Extension Icon to use.</div>
      <div id="wa-sender-content">
        
        <div id="wa-sender-settings">
          <div class="wa-drop-zone" id="wa-drop-zone">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px; color:#10b981;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <div>Drag & Drop CSV File Here<br>or Click to Upload</div>
            <input type="file" id="wa-file-input" accept=".csv" style="display:none;">
          </div>
          <div class="wa-template-btn" id="wa-download-template">⬇️ Download Test CSV Template</div>
        </div>
        
        <div class="wa-queue-box" id="wa-queue-info">
          Queue: 0 Contacts Loaded
        </div>

        <button class="wa-start-btn" id="wa-sender-start">START CAMPAIGN (-1 Credit)</button>
        <button class="wa-stop-link" id="wa-sender-stop" style="display:none;">Stop Sending</button>
        <button class="wa-stop-link" id="wa-sender-reupload" style="display:none; color:#3b82f6;">🔄 Re-upload CSV</button>
      </div>
    </div>

    <!-- TAB 3: AUTO-BOT -->
    <div class="wa-tab-content" id="tab-bot">
      <div class="wa-premium-lock" id="wa-bot-lock">🔒 Premium Feature: Please login via Extension Icon to use.</div>
      <div id="wa-bot-content">
        <div class="wa-queue-box" style="margin-top: 20px;">
          Auto-Reply Bot logic coming in Phase 4.
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Tab Logic
  const tabs = document.querySelectorAll('.wa-tab');
  const tabContents = document.querySelectorAll('.wa-tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.getAttribute('data-tab')).classList.add('active');
    });
  });

  const closeBtn = document.getElementById('wa-close-btn');
  const minBtn = document.getElementById('wa-min-btn');
  const settingsBtn = document.getElementById('wa-settings-btn');
  const settingsMenu = document.getElementById('wa-settings-menu');
  settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); settingsMenu.classList.toggle('open'); });

  minBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.add('minimized');
  });

  panel.addEventListener('click', (e) => {
    if (panel.classList.contains('minimized')) {
      panel.classList.remove('minimized');
    }
  });

  // Web Worker approach removed due to WhatsApp CSP blocking blob: workers.

  // STATE VARIABLES
  let waUser = null;
  let extractInterval = null;
  let scrollInterval = null;
  let contacts = new Set();
  let contactDetails = [];
  
  // UI ELEMENTS
  const startBtn = document.getElementById('wa-start-btn');
  const stopBtn = document.getElementById('wa-stop-btn');
  const downloadBtn = document.getElementById('wa-download-btn');
  const autoScrollToggle = document.getElementById('wa-autoscroll-toggle');
  
  const countText = document.getElementById('wa-count-text');
  const syncText = document.getElementById('wa-sync-text');
  const statusText = document.getElementById('wa-status-text');
  const statusDot = document.getElementById('wa-status-dot');
  const dataTitle = document.getElementById('wa-data-title');
  const previewList = document.getElementById('wa-preview-list');
  const progressAnim = document.getElementById('wa-progress-anim');
  const queueInfo = document.getElementById('wa-queue-info');

  const senderStart = document.getElementById('wa-sender-start');
  const senderStop = document.getElementById('wa-sender-stop');
  const senderMsg = document.getElementById('wa-sender-msg');
  const delayMin = document.getElementById('wa-delay-min');
  const delayMax = document.getElementById('wa-delay-max');

  // USER & CREDITS ON LOAD
  chrome.storage.local.get(['waUser', 'waSenderState', 'waContacts'], (data) => {
    if (data.waUser) {
      waUser = data.waUser;
      document.getElementById('wa-credits-count').textContent = waUser.credits;
      document.getElementById('wa-sender-content').style.display = 'block';
      document.getElementById('wa-bot-content').style.display = 'block';
      document.getElementById('wa-sender-lock').style.display = 'none';
      document.getElementById('wa-bot-lock').style.display = 'none';
    } else {
      document.getElementById('wa-sender-content').style.display = 'none';
      document.getElementById('wa-bot-content').style.display = 'none';
      document.getElementById('wa-sender-lock').style.display = 'block';
      document.getElementById('wa-bot-lock').style.display = 'block';
    }

    if (data.waContacts) {
      contactDetails = data.waContacts;
      contactDetails.forEach(c => contacts.add(c.number));
      queueInfo.textContent = 'Queue: ' + contactDetails.length + ' Contacts Loaded';
    }

    // CHECK IF SENDER IS ACTIVE
    if (data.waSenderState && data.waSenderState.active) {
      resumeCampaign(data.waSenderState);
    }
  });

  // DUMMY PAYMENT GATEWAY
  document.getElementById('wa-pay-btn').addEventListener('click', async () => {
    if (!waUser) return alert("Please Login via Extension Icon first!");
    
    const btn = document.getElementById('wa-pay-btn');
    btn.textContent = 'Processing Payment...';
    
    // Simulate Gateway Delay
    setTimeout(async () => {
      try {
        const newCredits = waUser.credits + 50;
        await fetch('https://firestore.googleapis.com/v1/projects/nazdik-pro/databases/(default)/documents/users/' + waUser.uid, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: { credits: { integerValue: newCredits } } })
        });
        
        waUser.credits = newCredits;
        chrome.storage.local.set({ waUser: waUser });
        document.getElementById('wa-credits-count').textContent = newCredits;
        
        btn.textContent = 'Add 50 Credits (Pay ₹99)';
        alert("Payment Successful! 50 Credits Added to your account. 🎉");
      } catch (e) {
        alert("Payment update failed. Please check internet connection.");
        btn.textContent = 'Add 50 Credits (Pay ₹99)';
      }
    }, 2000);
  });

  // CSV UPLOAD & TEMPLATE LOGIC
  const dropZone = document.getElementById('wa-drop-zone');
  const fileInput = document.getElementById('wa-file-input');
  const downloadTemplate = document.getElementById('wa-download-template');
  const senderSettings = document.getElementById('wa-sender-settings');
  const reuploadBtn = document.getElementById('wa-sender-reupload');
  
  reuploadBtn.addEventListener('click', () => {
    senderSettings.style.display = 'block';
    reuploadBtn.style.display = 'none';
    queueInfo.textContent = 'Queue: 0 Contacts Loaded';
    contactDetails = [];
    contacts = new Set();
    chrome.storage.local.set({ waContacts: [] });
  });

  downloadTemplate.addEventListener('click', () => {
    let csv = "Name,Phone number,Message\nYogendra yogi,8302806913\t,this is a test mesej\nYogesh yogi,88302829465\t,Bhai party kab de raha hai? Yeh ek mazakiya test message hai! 😂";
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = "Test_Sender_Template.csv";
    link.click();
  });

  dropZone.addEventListener('click', () => fileInput.click());
  
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleCSVFile(e.dataTransfer.files[0]);
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleCSVFile(e.target.files[0]);
  });

  function handleCSVFile(file) {
    if (!file.name.endsWith('.csv')) return alert("Please upload a CSV file!");
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      // Split by newline, supporting both Windows (\r\n) and Unix (\n)
      const lines = text.split(/\r?\n/);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      let newContacts = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple CSV parse handling commas inside quotes
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
        
        let contact = { name: 'Unknown', number: '', message: '' };
        
        headers.forEach((h, index) => {
          if (h === 'name') contact.name = row[index] || 'Unknown';
          if (h === 'number' || h === 'phone number') contact.number = (row[index] || '').replace(/[^\d+]/g, '');
          if (h === 'message') contact.message = row[index] || '';
        });
        
        // Only queue contacts that have a message
        if (contact.number.length >= 10 && contact.message.trim().length > 0) newContacts.push(contact);
      }
      
      if (newContacts.length > 0) {
        contactDetails = newContacts;
        contacts = new Set(newContacts.map(c => c.number));
        chrome.storage.local.set({ waContacts: contactDetails });
        queueInfo.textContent = 'Queue: ' + newContacts.length + ' Contacts from CSV';
        
        // Hide settings and show Re-upload button
        senderSettings.style.display = 'none';
        reuploadBtn.style.display = 'block';
        
        alert(newContacts.length + " Contacts loaded successfully from CSV!");
      } else {
        alert("No valid contacts found in CSV. Please check the format.");
      }
    };
    reader.readAsText(file);
  }

  // BULK SENDER LOGIC
  senderStart.addEventListener('click', async () => {
    if (!waUser) return alert('Please Login via the Extension Icon first!');
    if (waUser.credits <= 0) {
      alert('⚠️ You have 0 credits! Please purchase more to run a campaign.');
      document.querySelector('[data-tab="account"]').click();
      return;
    }
    
    if (contactDetails.length === 0) return alert('Please upload a CSV file with Messages first!');
    
    // Check Daily Limit (50/day)
    chrome.storage.local.get(['waDailyLimits'], async (data) => {
      let today = new Date().toLocaleDateString();
      let limits = data.waDailyLimits || { date: today, count: 0 };
      
      if (limits.date !== today) {
        limits = { date: today, count: 0 }; // Reset for new day
      }
      
      if (limits.count >= 50) {
        return alert("⚠️ Daily Limit Reached! You have sent 50 messages today. Please come back tomorrow to keep your account safe.");
      }
    
    senderStart.textContent = 'Processing...';
    senderStart.disabled = true;

    // Deduct 1 Credit
    try {
      const newCredits = waUser.credits - 1;
      await fetch('https://firestore.googleapis.com/v1/projects/nazdik-pro/databases/(default)/documents/users/' + waUser.uid, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { credits: { integerValue: newCredits } } })
      });
      waUser.credits = newCredits;
      chrome.storage.local.set({ waUser: waUser });
      document.getElementById('wa-credits-count').textContent = newCredits;
    } catch (e) {
      alert("Failed to connect to server. Please check internet connection.");
      senderStart.textContent = 'START CAMPAIGN (-1 Credit)';
      senderStart.disabled = false;
      return;
    }

    chrome.storage.local.set({
      waSenderState: {
        active: true,
        queue: contactDetails,
        currentIndex: 0,
        sessionCount: 0, // Track for 10-msg pause
        pauseUntil: null,
        status: "Running"
      }
    }, () => {
      sendNextMessage();
    });
    });
  });

  senderStop.addEventListener('click', () => {
    chrome.storage.local.set({ waSenderState: { active: false } });
    let startBtn = document.getElementById('wa-sender-start');
    startBtn.style.display = 'block';
    startBtn.textContent = 'START CAMPAIGN (-1 Credit)';
    startBtn.disabled = false;
    document.getElementById('wa-sender-stop').style.display = 'none';
    document.getElementById('wa-sender-reupload').style.display = 'block';
    document.getElementById('wa-queue-info').innerHTML = 'Campaign Stopped.';
  });

  function sendNextMessage() {
    chrome.storage.local.get(['waSenderState', 'waDailyLimits'], (data) => {
      const state = data.waSenderState;
      if (!state || !state.active) return;
      
      let today = new Date().toLocaleDateString();
      let limits = data.waDailyLimits || { date: today, count: 0 };
      if (limits.date !== today) limits = { date: today, count: 0 };
      
      // 1. Check Daily Limit (50)
      if (limits.count >= 50) {
        chrome.storage.local.set({ waSenderState: { active: false } });
        alert('⚠️ Daily Limit Reached! Campaign stopped to protect your account.');
        let startBtn = document.getElementById('wa-sender-start');
        startBtn.style.display = 'block';
        startBtn.textContent = 'START CAMPAIGN (-1 Credit)';
        startBtn.disabled = false;
        document.getElementById('wa-sender-stop').style.display = 'none';
        document.getElementById('wa-queue-info').innerHTML = 'Daily Limit Reached (50/50)';
        return;
      }
      
      // 2. Check Queue End
      if (state.currentIndex >= state.queue.length) {
        chrome.storage.local.set({ waSenderState: { active: false } });
        alert('🎉 Campaign Finished Successfully!');
        let startBtn = document.getElementById('wa-sender-start');
        startBtn.style.display = 'block';
        startBtn.textContent = 'START CAMPAIGN (-1 Credit)';
        startBtn.disabled = false;
        document.getElementById('wa-sender-stop').style.display = 'none';
        document.getElementById('wa-sender-reupload').style.display = 'block';
        document.getElementById('wa-queue-info').innerHTML = 'Queue: ' + state.queue.length + ' Contacts Loaded';
        return;
      }

      // 3. Check for Forced 5-Minute Pause
      if (state.pauseUntil) {
        if (Date.now() < state.pauseUntil) {
          // Still in pause, reload state check in 5 seconds
          setTimeout(sendNextMessage, 5000);
          return;
        } else {
          // Pause over
          state.pauseUntil = null;
          chrome.storage.local.set({ waSenderState: state });
        }
      }

      const contact = state.queue[state.currentIndex];
      
      // Format Message
      let baseMsg = contact.message || "";
      let msg = baseMsg.replace(/\\[Name\\]/gi, contact.name !== 'Unknown' ? contact.name : '');
      
      // Soft Navigate to WhatsApp Send URL (avoids hard page reload)
      let link = document.createElement('a');
      link.href = 'https://web.whatsapp.com/send?phone=' + contact.number + '&text=' + encodeURIComponent(msg);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Start the campaign watcher immediately since page won't reload
      setTimeout(() => resumeCampaign(state), 2000);
    });
  }

  function resumeCampaign(state) {
    if (state.pauseUntil && Date.now() < state.pauseUntil) {
       // Display Pause UI
       const timeLeft = Math.ceil((state.pauseUntil - Date.now()) / 1000);
       const minutes = Math.floor(timeLeft / 60);
       const seconds = timeLeft % 60;
       
       document.getElementById('wa-queue-info').innerHTML = `
          <h3 style="margin:0 0 10px 0; color:#f59e0b;">Anti-Ban Break 🛡️</h3>
          <p style="font-size:13px; color:#64748b;">10 messages sent. Pausing to look like a human.</p>
          <div style="font-size:24px; font-weight:bold; color:#f59e0b; margin:15px 0;">
             ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}
          </div>
      `;
      document.getElementById('wa-sender-start').style.display = 'none';
      document.getElementById('wa-sender-stop').style.display = 'block';
      
      setTimeout(() => resumeCampaign(state), 1000); // Update timer every second
      return;
    }

    // Hide UI and show a mini progress bar
    document.getElementById('wa-queue-info').innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#0f172a;">Campaign Running 🚀</h3>
        <p style="font-size:13px; color:#64748b;">Sending ${state.currentIndex + 1} of ${state.queue.length}</p>
        <p style="font-size:12px; color:#10b981; font-weight: 600;">Target: ${state.queue[state.currentIndex].number}</p>
        <p>Sending...</p>
    `;
    document.getElementById('wa-sender-start').style.display = 'none';
    document.getElementById('wa-sender-stop').style.display = 'block';

    // Wait for WhatsApp to load the chat and the SEND button to appear
    let attempts = 0;
    const checkReady = setInterval(() => {
      attempts++;
      
      // Check for Invalid Number Dialog
      const invalidPopup = Array.from(document.querySelectorAll('div')).find(el => {
        let txt = el.textContent || '';
        return txt.includes('Phone number shared via url is invalid.') || txt.includes("isn't on WhatsApp");
      });
      if (invalidPopup) {
        clearInterval(checkReady);
        // Try to click OK to close the dialog
        let okBtn = Array.from(invalidPopup.querySelectorAll('button, div[role="button"]')).find(b => b.textContent && b.textContent.includes('OK'));
        if (okBtn) okBtn.click();
        
        state.currentIndex++;
        chrome.storage.local.set({ waSenderState: state }, () => {
          setTimeout(sendNextMessage, 3000); // Wait 3 sec then skip
        });
        return;
      }

      // Check for Send Button
      let sendBtn = document.querySelector('button[aria-label="Send"]');
      if (!sendBtn) {
        let icon = document.querySelector('[data-icon="send"]');
        if (icon) {
          sendBtn = icon.closest('button') || icon.closest('div[role="button"]') || icon.parentElement;
        }
      }

      if (sendBtn) {
        clearInterval(checkReady);
        
        setTimeout(() => {
          sendBtn.click();
          state.currentIndex++;
          state.sessionCount = (state.sessionCount || 0) + 1;
          
          chrome.storage.local.get(['waDailyLimits'], (data) => {
            let today = new Date().toLocaleDateString();
            let limits = data.waDailyLimits || { date: today, count: 0 };
            limits.count++;
            chrome.storage.local.set({ waDailyLimits: limits });
            
            // Check if we need to pause (every 10 messages)
            if (state.sessionCount >= 10) {
              state.pauseUntil = Date.now() + (5 * 60 * 1000); // 5 minutes
              state.sessionCount = 0; // reset for next batch
              chrome.storage.local.set({ waSenderState: state }, () => {
                 resumeCampaign(state); // Show pause UI
                 sendNextMessage(); // Loop will handle waiting
              });
            } else {
              chrome.storage.local.set({ waSenderState: state }, () => {
                let delaySec = Math.floor(Math.random() * (20 - 10 + 1) + 10); // 10 to 20 seconds
                let timerInt = setInterval(() => {
                  chrome.storage.local.get(['waSenderState'], (curData) => {
                    if (!curData.waSenderState || !curData.waSenderState.active) {
                      clearInterval(timerInt);
                      return;
                    }
                    if (delaySec <= 0) {
                      clearInterval(timerInt);
                      document.getElementById('wa-queue-info').querySelector('p:last-child').textContent = 'Sending...';
                      sendNextMessage();
                      return;
                    }
                    document.getElementById('wa-queue-info').querySelector('p:last-child').textContent = 'Waiting ' + delaySec + 's for safety...';
                    delaySec--;
                  });
                }, 1000);
              });
            }
          });
        }, 1000);
      }
      
      if (attempts > 60) { // 30 seconds timeout
        clearInterval(checkReady);
        state.currentIndex++;
        chrome.storage.local.set({ waSenderState: state }, () => {
          sendNextMessage();
        });
      }
    }, 500);
  }

  // NORMAL EXTRACTOR LOGIC
  function stopAll() {
    if (extractInterval) { clearInterval(extractInterval); extractInterval = null; }
    if (scrollInterval) { clearInterval(scrollInterval); scrollInterval = null; }
    
    startBtn.textContent = 'START COLLECTING';
    startBtn.classList.remove('running');
    statusText.textContent = 'Stopped';
    statusDot.classList.remove('active');
    statusDot.style.background = '#ef4444';
    progressAnim.style.display = 'none';
  }

  function addPreviewItem(name, number) {
    const item = document.createElement('div');
    item.className = 'wa-list-item';
    item.innerHTML = '<div class="wa-item-name">' + name + '</div>' +
                     '<div class="wa-item-number">' + number.substring(0, 18) + '...</div>' +
                     '<div class="wa-item-status">Status: Success</div>';
    previewList.prepend(item);
    if (previewList.children.length > 50) previewList.removeChild(previewList.lastChild);
  }

  startBtn.addEventListener('click', () => {
    if (extractInterval) return; 
    
    startBtn.textContent = 'COLLECTING...';
    startBtn.classList.add('running');
    statusText.textContent = 'Scraping Active';
    statusDot.style.background = '#10b981';
    statusDot.classList.add('active');
    downloadBtn.disabled = false;
    progressAnim.style.display = 'block';

    if (autoScrollToggle.checked) {
      scrollInterval = setInterval(() => {
        let items = document.querySelectorAll('div[role="listitem"]');
        if (items.length > 0) {
          let el = items[0];
          while (el && el !== document.body) {
            let style = window.getComputedStyle(el);
            if (el.scrollHeight > el.clientHeight && (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'overlay')) {
              el.scrollTop += 15; 
              break;
            }
            el = el.parentElement;
          }
        }
      }, 20); 
    }

    extractInterval = setInterval(() => {
      let items = document.querySelectorAll('div[role="listitem"]');
      let foundNew = false;
      
      items.forEach(item => {
        // WhatsApp injects invisible characters like \u200E (Left-To-Right Mark), we MUST strip them
        let textLines = item.innerText.split('\n')
          .map(t => t.replace(/[\u200E\u200B\u200F\u202A-\u202E]/g, '').trim())
          .filter(t => t);
        
        // Find line that contains 10-15 digits after stripping formatting
        let numberMatch = textLines.find(t => {
          let clean = t.replace(/[^\d+]/g, '');
          return clean.length >= 10 && clean.length <= 16;
        });
        
        let nameMatch = textLines[0]; 
        
        if (numberMatch) {
          let cleanNumber = numberMatch.replace(/[^\d+]/g, '');
          let nameToSave = (nameMatch && nameMatch.replace(/[^\d+]/g, '') !== cleanNumber) ? nameMatch : "Unknown";

          if (!contacts.has(cleanNumber)) {
            contacts.add(cleanNumber);
            contactDetails.push({ name: nameToSave, number: cleanNumber });
            
            countText.textContent = contacts.size.toLocaleString();
            dataTitle.textContent = 'Collected Data (' + contacts.size.toLocaleString() + ' entries)';
            addPreviewItem(nameToSave, cleanNumber);
            queueInfo.textContent = 'Queue: ' + contacts.size.toLocaleString() + ' Contacts Loaded';
            
            chrome.storage.local.set({ waContacts: contactDetails });
            foundNew = true;
          }
        }
      });

      if (foundNew) {
        let d = new Date();
        syncText.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
      }
    }, 500);
  });

  stopBtn.addEventListener('click', stopAll);

  downloadBtn.addEventListener('click', () => {
    stopAll();
    if (contactDetails.length === 0) return alert("No contacts collected yet!");
    let csv = "Name,Phone number\n" + contactDetails.map(e => '"' + e.name + '","' + e.number + '\t"').join("\n");
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "WhatsApp_Premium_Members.csv");
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  closeBtn.addEventListener('click', () => {
    stopAll();
    panel.remove();
  });

  // ==========================================
  // VALIDATOR LOGIC
  // ==========================================
  const valDropZone = document.getElementById('wa-val-drop-zone');
  const valFileInput = document.getElementById('wa-val-file-input');
  const valStartBtn = document.getElementById('wa-val-start');
  const valStopBtn = document.getElementById('wa-val-stop');
  const valStats = document.getElementById('wa-val-stats');
  const valTotal = document.getElementById('wa-val-total');
  const valValidTxt = document.getElementById('wa-val-valid');
  const valInvalidTxt = document.getElementById('wa-val-invalid');
  const valDownValid = document.getElementById('wa-val-down-valid');
  const valDownInvalid = document.getElementById('wa-val-down-invalid');
  const valReuploadBtn = document.getElementById('wa-val-reupload');
  const valPreviewList = document.getElementById('wa-val-preview-list');

  function addValPreviewItem(name, number, status) {
    let item = document.createElement('div');
    item.className = 'wa-list-item';
    item.style.position = 'relative';
    let icon = status === 'active' ? '🟢' : '🔴';
    item.innerHTML = `
      <div class="wa-item-avatar" style="background: ${status === 'active' ? '#dcfce7' : '#fee2e2'}; color: ${status === 'active' ? '#166534' : '#991b1b'};">${name.charAt(0).toUpperCase()}</div>
      <div class="wa-item-info">
        <div class="wa-item-name">${name} ${icon}</div>
        <div class="wa-item-number">${number}</div>
      </div>
      <button class="wa-copy-btn" data-number="${number}" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 14px;" title="Copy Number">📋</button>
    `;
    item.querySelector('.wa-copy-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        navigator.clipboard.writeText(btn.getAttribute('data-number'));
        btn.textContent = '✅';
        setTimeout(() => { btn.textContent = '📋'; }, 2000);
    });
    valPreviewList.prepend(item);
  }

  let validatorQueue = [];
  let validList = [];
  let invalidList = [];
  let isValidating = false;

  valReuploadBtn.addEventListener('click', () => {
    validatorQueue = [];
    validList = [];
    invalidList = [];
    valTotal.textContent = "0";
    valValidTxt.textContent = "0";
    valInvalidTxt.textContent = "0";
    
    valDropZone.style.display = 'block';
    valStats.style.display = 'none';
    valStartBtn.style.display = 'none';
    valStopBtn.style.display = 'none';
    valDownValid.style.display = 'none';
    valDownInvalid.style.display = 'none';
    valReuploadBtn.style.display = 'none';
    valPreviewList.innerHTML = '';
    valPreviewList.style.display = 'none';
  });

  valDropZone.addEventListener('click', () => valFileInput.click());
  valDropZone.addEventListener('dragover', (e) => { e.preventDefault(); valDropZone.classList.add('dragover'); });
  valDropZone.addEventListener('dragleave', () => valDropZone.classList.remove('dragover'));
  valDropZone.addEventListener('drop', (e) => {
    e.preventDefault(); valDropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleValCSV(e.dataTransfer.files[0]);
  });
  valFileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleValCSV(e.target.files[0]);
  });

  function handleValCSV(file) {
    if (!file.name.endsWith('.csv')) return alert("Please upload a CSV file!");
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const lines = text.split(/\r?\n/);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      let newContacts = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
        let contact = { name: 'Unknown', number: '' };
        headers.forEach((h, index) => {
          if (h === 'name') contact.name = row[index] || 'Unknown';
          if (h === 'number' || h === 'phone number') contact.number = (row[index] || '').replace(/[^\d+]/g, '');
        });
        if (contact.number.length >= 10) newContacts.push(contact);
      }
      
      if (newContacts.length > 0) {
        validatorQueue = newContacts;
        validList = [];
        invalidList = [];
        valTotal.textContent = newContacts.length;
        valValidTxt.textContent = "0";
        valInvalidTxt.textContent = "0";
        
        valDropZone.style.display = 'none';
        valStats.style.display = 'flex';
        valStartBtn.style.display = 'block';
        valDownValid.style.display = 'block';
        valDownInvalid.style.display = 'block';
        valReuploadBtn.style.display = 'block';
        valPreviewList.style.display = 'block';
        alert(newContacts.length + " Contacts loaded for Validation!");
      } else {
        alert("No valid numbers found in CSV.");
      }
    };
    reader.readAsText(file);
  }

  valStartBtn.addEventListener('click', async () => {
    if (!waUser) return alert('Please Login via the Extension Icon first!');
    if (validatorQueue.length === 0) return alert('Upload CSV first!');
    
    isValidating = true;
    valStartBtn.style.display = 'none';
    valStopBtn.style.display = 'block';
    
    // 1. Click "New Chat" icon
    let newChatBtn = document.querySelector('div[title="New chat"]') || document.querySelector('span[data-icon="chat"]');
    if (newChatBtn && newChatBtn.closest('button')) newChatBtn.closest('button').click();
    else if (newChatBtn && newChatBtn.closest('div[role="button"]')) newChatBtn.closest('div[role="button"]').click();
    
    await new Promise(r => setTimeout(r, 1000));
    validateNext(0);
  });

  valStopBtn.addEventListener('click', () => {
    isValidating = false;
    valStopBtn.style.display = 'none';
    valStartBtn.style.display = 'block';
    valStartBtn.textContent = 'RESUME VALIDATION';
    showValDownloads();
  });

  async function validateNext(index) {
    if (!isValidating) return;
    if (index >= validatorQueue.length) {
      isValidating = false;
      valStopBtn.style.display = 'none';
      showValDownloads();
      alert('🎉 Validation Finished!');
      return;
    }

    const contact = validatorQueue[index];
    
    // Find search input using robust filtering that supports BOTH contenteditable and standard <input> fields
    let searchInput = null;
    let mainChat = document.querySelector('#main') || document.querySelector('footer');
    
    // Grab all potential text inputs on the page
    let allInputs = Array.from(document.querySelectorAll('[contenteditable="true"], input[type="text"], input[type="search"], input[title="Search name or number"]'));
    
    // Filter out anything inside the main chat window
    let validInputs = allInputs.filter(el => {
       if (mainChat && mainChat.contains(el)) return false;
       // Also filter out hidden elements
       if (el.offsetWidth === 0 && el.offsetHeight === 0 && el.tagName !== 'INPUT') return false;
       return true;
    });
    
    if (validInputs.length > 0) {
       searchInput = validInputs[0];
    }
    
    if (!searchInput) {
      alert("Please keep WhatsApp New Chat sidebar open!");
      isValidating = false;
      valStopBtn.style.display = 'none';
      valStartBtn.style.display = 'block';
      return;
    }

    searchInput.focus();
    if (searchInput.tagName === 'INPUT') {
        searchInput.value = contact.number;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        
        // Paste number using ClipboardEvent for WhatsApp Lexical Editor
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', contact.number);
        searchInput.dispatchEvent(new ClipboardEvent('paste', {
          clipboardData: dataTransfer,
          bubbles: true,
          cancelable: true
        }));
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // IMPORTANT: Wait for old search results to clear!
    // If we poll immediately, we might read the PREVIOUS number's 'Contacts on WhatsApp'
    await new Promise(r => setTimeout(r, 1500));
    
    // Wait for search to complete (Network request can take a few seconds)
    let isInvalid = false;
    let waitTime = 0;
    while (waitTime < 3500) {
      await new Promise(r => setTimeout(r, 500));
      waitTime += 500;
      
      let pageText = document.body.innerText || "";
      
      if (pageText.includes("No results found")) {
        isInvalid = true;
        break;
      }
    }
    
    // Final fallback check just in case
    let finalCheckText = document.body.innerText || "";
    if (finalCheckText.includes("No results found")) {
      isInvalid = true;
    }
    
    if (isInvalid) {
      invalidList.push(contact);
      valInvalidTxt.textContent = invalidList.length;
      addValPreviewItem(contact.name, contact.number, 'inactive');
    } else {
      validList.push(contact);
      valValidTxt.textContent = validList.length;
      addValPreviewItem(contact.name, contact.number, 'active');
    }

    // clear for next
    let retryClear = 0;
    while (retryClear < 4) {
      searchInput.focus();
      if (searchInput.tagName === 'INPUT') {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
          document.execCommand('selectAll', false, null);
          const dt = new DataTransfer();
          dt.setData('text/plain', '');
          searchInput.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
          document.execCommand('delete', false, null);
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Check if it's actually cleared
      await new Promise(r => setTimeout(r, 300));
      let currentText = searchInput.tagName === 'INPUT' ? searchInput.value : searchInput.innerText.trim();
      if (!currentText) break;
      retryClear++;
    }
    
    // Random anti-ban delay (10-20 seconds) animated
    let delaySec = Math.floor(Math.random() * (20 - 10 + 1) + 10);
    for (let s = delaySec; s > 0; s--) {
      if (!isValidating) break;
      valStopBtn.textContent = 'Waiting ' + s + 's (Anti-Ban)... Click to Stop';
      await new Promise(r => setTimeout(r, 1000));
    }
    
    valStopBtn.textContent = 'Stop Validation';

    validateNext(index + 1);
  }

  function showValDownloads() {
    valDownValid.style.display = 'block';
    valDownInvalid.style.display = 'block';
  }

  valDownValid.addEventListener('click', () => {
    if (validList.length === 0) return alert('No active numbers!');
    downloadCSV("Active_Numbers.csv", validList);
  });

  valDownInvalid.addEventListener('click', () => {
    if (invalidList.length === 0) return alert('No inactive numbers!');
    downloadCSV("Inactive_Numbers.csv", invalidList);
  });

  function downloadCSV(filename, list) {
    let csv = "Name,Phone number\n" + list.map(e => '"' + e.name + '","' + e.number + '\t"').join("\n");
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

})();
