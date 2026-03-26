/**
 * portal-auth.js — 项目门户统一授权检查模块 v2
 * 所有子项目在 <head> 中引入此脚本即可接入门户用户体系
 *
 * 用法：
 *   <script src="portal-auth.js" data-proj-id="your-project-id"></script>
 *
 * 或内嵌调用：
 *   portalAuth.init('your-project-id');
 */
(function(global) {
  'use strict';

  const PORTAL_TOKEN = 'portal_v1_songhw_2026';
  const PORTAL_URL   = 'https://songhonglu.github.io/projects/index.html';
  const AUTH_SES_KEY = 'portal_auth_session';
  const AUTH_DB_KEY  = 'portal_db_v2';

  const portalAuth = {

    /**
     * 检查门户是否要求该项目需要认证
     */
    needsAuth(projId) {
      try {
        const db = JSON.parse(localStorage.getItem(AUTH_DB_KEY) || '{}');
        const ctrl = db.authCtrl || {};
        if (projId in ctrl) return ctrl[projId];
      } catch(e) {}
      return true;
    },

    /**
     * 校验门户 session 是否有效
     */
    isAuthenticated() {
      try {
        const ses = JSON.parse(localStorage.getItem(AUTH_SES_KEY) || 'null');
        if (!ses || ses.token !== PORTAL_TOKEN) return false;
        if (Date.now() - ses.ts > (ses.ttl || 28800000)) {
          localStorage.removeItem(AUTH_SES_KEY);
          return false;
        }
        return true;
      } catch(e) { return false; }
    },

    /**
     * 获取当前登录用户信息
     */
    getUser() {
      try {
        const ses = JSON.parse(localStorage.getItem(AUTH_SES_KEY) || 'null');
        return ses || {};
      } catch(e) { return {}; }
    },

    /**
     * 主入口：检查授权，未授权则跳转门户
     * @param {string} projId - 项目ID（与门户中 PROJECTS 的 id 一致）
     */
    init(projId) {
      if (!projId) {
        console.warn('[portal-auth] 未指定 projId，跳过授权检查');
        return;
      }
      if (this.needsAuth(projId) && !this.isAuthenticated()) {
        document.documentElement.style.visibility = 'hidden';
        try { sessionStorage.setItem('portal_redirect', location.href); } catch(e) {}
        location.replace(PORTAL_URL);
        return;
      }
      document.documentElement.style.visibility = 'visible';
      // 将用户信息挂载到全局
      global.__portalUser = this.getUser();
    }
  };

  global.portalAuth = portalAuth;

  // 支持 data-proj-id 属性自动初始化
  document.addEventListener('DOMContentLoaded', function() {
    const script = document.currentScript ||
      document.querySelector('script[src*="portal-auth"]');
    if (script) {
      const projId = script.getAttribute('data-proj-id');
      if (projId) portalAuth.init(projId);
    }
  });

})(window);
