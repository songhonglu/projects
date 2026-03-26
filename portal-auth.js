/**
 * portal-auth.js  v2.2
 * 项目门户统一授权检查模块
 *
 * 使用方式（子项目 <head> 中最早引入）：
 *   <script src="https://songhonglu.github.io/projects/portal-auth.js"
 *           data-proj-id="your-project-id"></script>
 *
 * 工作原理：
 *   1. 从当前 script 标签读取 data-proj-id 属性，确定当前子项目 ID
 *   2. 读取门户 localStorage portal_db_v2 中的 authCtrl，判断该子项目是否需要认证
 *   3. 如果需要认证，验证 portal_auth_session 中的 token 和有效期
 *   4. 未登录 → 显示子门户登录表单（统一用主门户用户体系验证）
 *   5. 已登录但无权 → 显示无权限提示页
 *   6. 认证成功 → 恢复页面可见性，应用主题，在 window.__portalUser 挂载当前用户信息
 *
 * 安全说明：
 *   - token 仅在 localStorage 中传递，全程不经过 URL
 *   - 同 origin（songhonglu.github.io）下所有路径共享 localStorage
 *   - 有效期 8 小时，超时自动要求重新登录
 *
 * 新增功能（v2.2）：
 *   - 子门户登录统一用主门户用户体系验证（从 portal_db_v2.users 读取）
 *   - 主题与主门户同步，支持用户个人偏好保存（portal_user_prefs.${userId}.${projId}）
 */
(function () {
  'use strict';

  // ── 配置 ──────────────────────────────────────────────────────────────
  const PORTAL_URL    = 'https://songhonglu.github.io/projects/index.html';
  const PORTAL_TOKEN  = 'portal_v1_songhw_2026';
  const DB_KEY        = 'portal_db_v2';
  const SESSION_KEY   = 'portal_auth_session';
  const SESSION_TTL   = 8 * 60 * 60 * 1000;  // 8 小时

  // ── 读取当前子项目 ID ─────────────────────────────────────────────────
  var projId = null;
  var scripts = document.querySelectorAll('script[data-proj-id]');
  if (scripts.length > 0) {
    projId = scripts[scripts.length - 1].getAttribute('data-proj-id');
  }
  // 兜底：从路径中推断（如 /huarongdao-game/ 推断为 huarongdao-game）
  if (!projId) {
    var m = location.pathname.match(/\/([^/]+)\//);
    if (m) projId = m[1];
  }

  // ── 工具函数 ──────────────────────────────────────────────────────────
  function readDB() {
    try { return JSON.parse(localStorage.getItem(DB_KEY) || 'null'); } catch (e) { return null; }
  }

  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
  }

  // ── 判断是否需要认证 ──────────────────────────────────────────────────
  function needsAuth(id) {
    var db = readDB();
    if (!db) return true; // 没有门户数据库，默认要求认证
    var ctrl = db.authCtrl || {};
    if (id in ctrl) return !!ctrl[id];
    return true; // 未配置则默认需要认证（安全优先）
  }

  // ── 验证 session ──────────────────────────────────────────────────────
  function isAuthenticated() {
    var ses = readSession();
    if (!ses) return false;
    if (ses.token !== PORTAL_TOKEN) return false;
    if (!ses.ts || (Date.now() - ses.ts) > SESSION_TTL) {
      try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
      return false;
    }
    return true;
  }

  // ── 验证用户是否有权访问该子项目 ─────────────────────────────────────
  function hasProjectAccess(userId) {
    if (!projId) return true; // 无法确定项目 ID，放行
    if (!userId) return true; // 无用户 ID，仅做 token 校验
    var db = readDB();
    if (!db) return true;
    var user = db.users && db.users.find(function (u) { return u.id === userId; });
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.projectPerms === null || user.projectPerms === undefined) return true;
    return Array.isArray(user.projectPerms) && user.projectPerms.indexOf(projId) >= 0;
  }

  // ── 跳转到主门户登录（未认证时） ─────────────────────────────
  function redirectToPortalLogin() {
    // 保存当前页面 URL，登录后自动跳转回
    try { sessionStorage.setItem('portal_redirect', location.href); } catch (e) {}
    // 先隐藏页面，再跳转，防止内容闪现
    document.documentElement.style.visibility = 'hidden';
    location.replace(PORTAL_URL);
  }

  // ── 显示无权限提示页 ─────────────────────────────────────────────────
  function showNoAccessPage(username) {
    document.documentElement.style.visibility = 'visible';
    document.body.innerHTML = [
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;',
      'min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,\\\'Segoe UI\\\',Roboto,sans-serif;',
      'background:#f6f8fa;color:#24292f;text-align:center;gap:16px">',
      '  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f85149"',
      '       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '    <circle cx="12" cy="12" r="10"></circle>',
      '    <line x1="12" y1="8" x2="12" y2="12"></line>',
      '    <line x1="12" y1="16" x2="12.01" y2="16"></line>',
      '  </svg>',
      '  <h2 style="margin:0;font-size:20px;font-weight:600;">无访问权限</h2>',
      '  <p style="color:#57606a;margin:0;max-width:400px;">',
      '    您好，<strong>' + (username || '用户') + '</strong>。您没有访问此项目的权限。<br>',
      '    联系管理员（songhw）为您开通。',
      '  </p>',
      '  <a href="' + PORTAL_URL + '" target="_self" style="margin-top:8px;padding:10px 24px;',
      '  background:#1f6feb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">',
      '    返回项目门户',
      '  </a>',
      '</div>'
    ].join('');
  }

  // ── 应用主题：先读用户个人偏好，若无则读主门户主题 ──────────────
  function applyTheme() {
    try {
      var ses = readSession();
      var userId = ses && ses.uid;
      if (!userId) return;

      var prefKey = 'portal_user_prefs.' + userId + '.' + projId;
      var portalThemeKey = 'portal_theme';

      // 优先读用户个人偏好
      var userPrefsStr = localStorage.getItem(prefKey);
      if (userPrefsStr) {
        var userPrefs = JSON.parse(userPrefsStr);
        if (userPrefs.theme && typeof window.applyTheme === 'function') {
          window.applyTheme(userPrefs.theme);
          return;
        }
      }

      // 其次读主门户主题
      var portalTheme = localStorage.getItem(portalThemeKey) || 'dark';
      if (typeof window.applyTheme === 'function') {
        window.applyTheme(portalTheme);
      }
    } catch (e) {}
  }

  // ── 主逻辑 ────────────────────────────────────────────────────────────
  function check() {
    if (!projId) {
      // 无法确定 projId，放行（兜底）
      document.documentElement.style.visibility = 'visible';
      return;
    }

    if (!needsAuth(projId)) {
      // 该子项目不需要认证，直接放行
      document.documentElement.style.visibility = 'visible';
      applyTheme();
      return;
    }

    if (!isAuthenticated()) {
      // 未登录：跳转到主门户登录
      redirectToPortalLogin();
      return;
    }

    var ses = readSession();
    if (!hasProjectAccess(ses && ses.uid)) {
      // 已登录但无权访问此项目
      showNoAccessPage(ses && ses.username);
      return;
    }

    // ✅ 认证通过，恢复可见性，应用主题，挂载用户信息
    document.documentElement.style.visibility = 'visible';
    applyTheme();

    // 在 window 上挂载当前用户信息（供子项目页面使用）
    try {
      var db = readDB();
      var user = ses && db && db.users && db.users.find(function (u) { return u.id === ses.uid; });
      window.__portalUser = user || { username: ses && ses.username || 'unknown' };
      window.__portalProjId = projId;
    } catch (e) {}
  }

  // 立即隐藏页面，防止未授权内容闪现（页面加载时即执行）
  if (needsAuth(projId)) {
    document.documentElement.style.visibility = 'hidden';
  }

  // DOM 就绪后执行检查
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }

  // ── 监听子门户主题变化，自动保存到用户个人偏好 ───────────────
  if (typeof window.applyTheme === 'function') {
    var originalApplyTheme = window.applyTheme;
    window.applyTheme = function (themeName) {
      originalApplyTheme.apply(this, arguments);
      try {
        var ses = readSession();
        var userId = ses && ses.uid;
        if (userId && projId) {
          var prefKey = 'portal_user_prefs.' + userId + '.' + projId;
          var prefsStr = localStorage.getItem(prefKey);
          var prefs = prefsStr ? JSON.parse(prefsStr) : {};
          prefs.theme = themeName;
          localStorage.setItem(prefKey, JSON.stringify(prefs));
        }
      } catch (e) {}
    };
  }

}());
