// 共用的後台佈局組件，支援角色權限控制

const ROLE_PERMISSIONS = {
  '系統管理員': ['companies', 'surveys', 'guidance', 'users', 'roles', 'departments', 'import'],
  '輔導顧問': ['companies', 'surveys', 'guidance', 'import'],
  '分析人員': ['companies', 'surveys']
};

const NAV_ITEMS = [
  // { key: 'dashboard', label: '儀表板', href: 'a04-dashboard.html', icon: 'dashboard' },
  { key: 'companies', label: '所有公司', href: 'a02-companies.html', icon: 'business' },
  { key: 'surveys', label: '問卷資料庫', href: 'a08-surveys.html', icon: 'poll' },
  { key: 'guidance', label: '輔導紀錄', href: 'a05-guidance-records.html', icon: 'history_edu' },
  { key: 'import', label: '資料匯入', href: 'import-data.html', icon: 'upload_file' }
];

// 側欄下拉群組（將使用者管理相關集中在一起）
const NAV_GROUPS = [
  {
    key: 'user_mgmt',
    label: '使用者管理',
    icon: 'groups',
    children: [
      { key: 'users', label: '使用者設定', href: 'a07-users.html', icon: 'people' },
      { key: 'roles', label: '角色與權限', href: 'a07-roles.html', icon: 'admin_panel_settings' },
      { key: 'departments', label: '部門設定', href: 'a07-departments.html', icon: 'apartment' }
    ]
  }
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
        <a class="navbar-brand d-flex align-items-center gap-2" href="a02-companies.html" style="color: #FFFFFF !important;">
          <span class="material-icons" style="color: #FFFFFF;">analytics</span>
          <strong>商業服務業數位應用資料庫</strong>
        </a>
        <div class="ms-auto d-flex align-items-center gap-3">
          <a href="../多公司問卷範例_2025Q4餐飲業調查_2025-10-29-2.xlsx" download="示範資料.xlsx" class="btn btn-success btn-sm">
            <span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px;">download</span>
            下載示範資料
          </a>
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

  // 準備群組（若群組中至少一個子項可見才顯示）
  const groups = NAV_GROUPS.map(group => {
    const visibleChildren = group.children.filter(child => hasModuleAccess(role, child.key));
    return { ...group, children: visibleChildren };
  }).filter(g => g.children.length > 0);

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

        ${groups.map(group => {
          const hasActiveChild = group.children.some(c => c.key === activePage);
          const stored = localStorage.getItem(`submenu_${group.key}_open`);
          const isOpen = stored === null ? hasActiveChild : stored === 'true';
          const iconName = isOpen ? 'expand_more' : 'chevron_right';
          return `
            <div class="nav-group">
              <a class="nav-link" href="javascript:void(0)" onclick="toggleSubmenu('${group.key}')" title="${group.label}">
                <span class="material-icons" style="font-size: 20px;">${group.icon}</span>
                <span class="nav-link-text">${group.label}</span>
                <span class="material-icons" id="submenu-icon-${group.key}" style="margin-left:auto; font-size: 18px;">${iconName}</span>
              </a>
              <div class="submenu" id="submenu-${group.key}" style="display:${isOpen ? 'block' : 'none'};">
                ${group.children.map(child => `
                  <a class="nav-link ${activePage === child.key ? 'active' : ''}" href="${child.href}" title="${child.label}" style="margin-left: 32px;">
                    <span class="material-icons" style="font-size: 18px;">${child.icon}</span>
                    <span class="nav-link-text">${child.label}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
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

// 切換次選單開合
function toggleSubmenu(groupKey) {
  const container = document.getElementById(`submenu-${groupKey}`);
  const icon = document.getElementById(`submenu-icon-${groupKey}`);
  if (!container) return;
  const isOpen = container.style.display !== 'none';
  if (isOpen) {
    container.style.display = 'none';
    if (icon) icon.textContent = 'chevron_right';
    localStorage.setItem(`submenu_${groupKey}_open`, 'false');
  } else {
    container.style.display = 'block';
    if (icon) icon.textContent = 'expand_more';
    localStorage.setItem(`submenu_${groupKey}_open`, 'true');
  }
}
