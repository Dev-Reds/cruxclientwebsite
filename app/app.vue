
<style>
body {
  background: #1a0a0a;
  margin: 0;
  min-height: 100vh;
}
.page-wrap {
  background: #000 url('/background.png') center/cover no-repeat fixed;
  min-height: 100vh;
  padding-top: 72px;
  padding-bottom: 0;
  box-sizing: border-box;
  transition: padding-bottom .2s;
}
body:has(.call-bar) .page-wrap {
  padding-bottom: 70px;
}

/* ═══ INCOMING CALL BANNER ═══ */
.incoming-banner {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: #2a1010;
  border: 1px solid #3d1a1a;
  border-radius: 14px;
  padding: 12px 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,.6);
  animation: slideDown .3s ease;
  min-width: 320px;
  max-width: 420px;
}
@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}
.incoming-content {
  display: flex;
  align-items: center;
  gap: 14px;
}
.incoming-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: white;
  background: #3d1a1a; border: 2px solid #43b581;
  flex-shrink: 0;
}
.incoming-info {
  flex: 1;
  min-width: 0;
}
.incoming-name {
  display: block;
  font-size: 15px; font-weight: 600; color: #e9edef;
}
.incoming-status {
  display: block;
  font-size: 12px; color: #43b581;
}
.incoming-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.incoming-btn {
  width: 42px; height: 42px; border-radius: 50%; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s;
}
.incoming-btn.accept { background: #43b581; color: white; }
.incoming-btn.accept:hover { background: #3ca374; transform: scale(1.08); }
.incoming-btn.reject { background: #e53935; color: white; }
.incoming-btn.reject:hover { background: #c62828; transform: scale(1.08); }

/* ═══ FLOATING CALL BAR ═══ */
.call-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: #1a0a0a;
  border: 1px solid #3d1a1a;
  border-radius: 16px;
  padding: 8px 12px;
  box-shadow: 0 8px 40px rgba(0,0,0,.6);
  animation: fadeUp .3s ease;
  min-width: 300px;
  max-width: 500px;
}
@keyframes fadeUp {
  from { transform: translateX(-50%) translateY(20px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}
.bar-video-pip {
  margin-bottom: 8px;
  border-radius: 10px;
  overflow: hidden;
  background: #000;
  border: 1px solid #3d1a1a;
  position: relative;
  max-height: 120px;
}
.pip-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  max-height: 120px;
}
.pip-self {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 80px;
  aspect-ratio: 4/3;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,.3);
  background: #000;
}
.pip-self-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bar-main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bar-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700; color: white;
  background: #3d1a1a; border: 2px solid #e53935;
  flex-shrink: 0;
}
.bar-info {
  flex: 1;
  min-width: 0;
}
.bar-name {
  display: block;
  font-size: 14px; font-weight: 600; color: #e9edef;
}
.bar-status {
  display: block;
  font-size: 11px; color: #8696a0;
}
.bar-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}
.bar-btn {
  width: 36px; height: 36px; border-radius: 50%; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s;
  background: #3d1a1a; color: #8696a0; flex-shrink: 0;
}
.bar-btn:hover { background: #5a2020; color: #e9edef; }
.bar-btn.active { background: #43b581; color: white; }
.bar-btn.active:hover { background: #3ca374; }
.bar-btn.end { background: #e53935; color: white; width: 40px; height: 40px; }
.bar-btn.end:hover { background: #c62828; }
.bar-btn.close-bar {
  width: auto; height: auto;
  border-radius: 20px; padding: 6px 14px;
  font-size: 12px; font-weight: 600; font-family: inherit;
}

/* ═══ DRAGGABLE CALL BAR ═══ */
.call-bar { cursor: grab; user-select: none; }
.call-bar:active { cursor: grabbing; }

/* ═══ FULLSCREEN CALL BAR ═══ */
.call-bar.fullscreen {
  cursor: default;
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  max-width: none; border-radius: 0; border: none;
  transform: none !important; padding: 0;
  background: #000; z-index: 10000;
  display: flex; flex-direction: column;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.call-bar.fullscreen .bar-video-pip {
  max-height: none; margin-bottom: 0; border-radius: 0; border: none;
  flex: 1; width: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #000;
}
.call-bar.fullscreen .pip-video {
  max-height: none; height: 100%; width: 100%;
  object-fit: contain;
}
.call-bar.fullscreen .pip-self {
  width: 180px;
}
.call-bar.fullscreen .bar-main {
  position: absolute; bottom: 20px; left: 50%;
  transform: translateX(-50%);
  background: rgba(26,10,10,.85);
  backdrop-filter: blur(8px);
  border-radius: 16px; padding: 10px 16px;
  min-width: 300px;
}
.call-bar.fullscreen .bar-btn { width: 40px; height: 40px; }
.call-bar.fullscreen .bar-btn.end { width: 44px; height: 44px; }

@media(max-width:768px){
  .call-bar {
    left: 8px;
    right: 8px;
    transform: none;
    min-width: unset;
    max-width: unset;
    bottom: 8px;
  }
  @keyframes fadeUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .incoming-banner {
    left: 8px;
    right: 8px;
    transform: none;
    min-width: unset;
    max-width: unset;
  }
  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .bar-avatar { width: 32px; height: 32px; font-size: 13px; }
  .bar-name { font-size: 13px; }
  .bar-btn { width: 32px; height: 32px; }
  .bar-btn.end { width: 36px; height: 36px; }
  .call-bar.fullscreen .pip-self { width: 120px; }
  .call-bar.fullscreen .bar-main { min-width: unset; left: 8px; right: 8px; transform: none; }
}
</style>
