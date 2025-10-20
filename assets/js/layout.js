// 共用的後台佈局組件，支援角色權限控制

const ROLE_PERMISSIONS = {
  '系統管理員': ['dashboard', 'companies', 'guidance', 'users'],
  '輔導顧問': ['companies', 'guidance'],
  '分析人員': ['dashboard', 'companies']
};

const NAV_ITEMS = [
  { key: 'dashboard', label: '儀表板', href: 'a04-dashboard.html', icon: 'dashboard' },
  { key: 'companies', label: '所有公司', href: 'a02-companies.html', icon: 'business' },
  { key: 'guidance', label: '輔導紀錄', href: 'a05-guidance-records.html', icon: 'history_edu' },
  { key: 'users', label: '使用者管理', href: 'a07-users.html', icon: 'people' }
];

function getStoredLoginData() {
  const raw = sessionStorage.getItem('adminLogin') || localStorage.getItem('adminLogin');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('無法解析登入資訊', err);
    return null;
  }
}

function hasModuleAccess(role, moduleKey) {
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(moduleKey);
}

function getDefaultModule(role) {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed || allowed.length === 0) {
    return NAV_ITEMS[0].key;
  }
  return allowed[0];
}

function renderTopbar(user) {
  const displayName = user?.displayName || user?.username || '未命名使用者';
  const roleLabel = user?.role || '未定義角色';
  return `
    <nav class="navbar navbar-expand-lg top-navbar">
      <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center gap-2" href="a04-dashboard.html" style="color: #FFFFFF !important;">
          <span class="material-icons" style="color: #FFFFFF;">analytics</span>
          <strong>商業服務業數位應用資料庫</strong>
        </a>
        <div class="ms-auto d-flex align-items-center gap-3">
          <div class="d-flex flex-column align-items-end text-white">
            <small><strong>${displayName}</strong></small>
            <small class="text-white-50">${roleLabel}</small>
          </div>
          <button class="btn btn-outline-light btn-sm" onclick="logout()">
            <span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px;">logout</span>
            登出
          </button>
        </div>
      </div>
    </nav>
  `;
}

function renderSidebar(activePage, user) {
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  const role = user?.role;
  const links = NAV_ITEMS.filter(item => hasModuleAccess(role, item.key));

  return `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="mainSidebar" style="height: 100%; overflow-y: auto;">
      <div class="sidebar-toggle" onclick="toggleSidebar()" title="${isCollapsed ? '展開側邊欄' : '收起側邊欄'}">
        <span class="material-icons">chevron_left</span>
      </div>
      <nav class="nav flex-column">
        ${links.map(item => `
          <a class="nav-link ${activePage === item.key ? 'active' : ''}" href="${item.href}" title="${item.label}">
            <span class="material-icons" style="font-size: 20px;">${item.icon}</span>
            <span class="nav-link-text">${item.label}</span>
          </a>
        `).join('')}
      </nav>
    </aside>
  `;
}

function initLayout(activePage) {
  const user = getStoredLoginData();
  if (!user) {
    window.location.href = 'a01-login.html';
    return;
  }

  if (!hasModuleAccess(user.role, activePage)) {
    const fallback = getDefaultModule(user.role);
    const target = NAV_ITEMS.find(item => item.key === fallback);
    if (target && window.location.pathname.split('/').pop() !== target.href) {
      window.location.href = target.href;
      return;
    }
  }

  const topbarContainer = document.getElementById('topbar');
  if (topbarContainer) {
    topbarContainer.innerHTML = renderTopbar(user);
  }

  const sidebarContainer = document.getElementById('sidebar');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = renderSidebar(activePage, user);
  }
}

function logout() {
  const confirmed = confirm('確定要登出嗎？');
  if (confirmed) {
    localStorage.removeItem('adminLogin');
    sessionStorage.removeItem('adminLogin');
    window.location.href = 'a01-login.html';
  }
}

// 檢查登入狀態並可選擇性驗證模組權限
function checkLogin(requiredModule) {
  const user = getStoredLoginData();
  if (!user) {
    window.location.href = 'a01-login.html';
    return null;
  }

  window.currentUser = user;

  if (requiredModule && !hasModuleAccess(user.role, requiredModule)) {
    const fallback = getDefaultModule(user.role);
    const target = NAV_ITEMS.find(item => item.key === fallback);
    if (target) {
      window.location.href = target.href;
    } else {
      window.location.href = 'a01-login.html';
    }
    return null;
  }

  return user;
}

// 切換側邊欄收起/展開
function toggleSidebar() {
  const sidebar = document.getElementById('mainSidebar');
  if (!sidebar) return;

  const isCollapsed = sidebar.classList.contains('collapsed');

  if (isCollapsed) {
    sidebar.classList.remove('collapsed');
    localStorage.setItem('sidebarCollapsed', 'false');
  } else {
    sidebar.classList.add('collapsed');
    localStorage.setItem('sidebarCollapsed', 'true');
  }

  const toggleBtn = sidebar.querySelector('.sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.title = isCollapsed ? '收起側邊欄' : '展開側邊欄';
  }
}
