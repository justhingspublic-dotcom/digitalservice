// 共用的後台佈局組件

function renderTopbar() {
  return `
    <nav class="navbar navbar-expand-lg top-navbar">
      <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center gap-2" href="a04-dashboard.html" style="color: #FFFFFF !important;">
          <span class="material-icons" style="color: #FFFFFF;">analytics</span>
          <strong>商業服務業數位應用資料庫</strong>
        </a>
        <div class="ms-auto d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-2">
            <span class="material-icons" style="font-size: 20px; color: #FFFFFF;">account_circle</span>
            <span style="color: #FFFFFF;">
              <small>管理員：<strong>admin</strong></small>
            </span>
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

function renderSidebar(activePage) {
  // 檢查是否有保存的狀態
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  
  return `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="mainSidebar" style="height: 100%; overflow-y: auto;">
      <div class="sidebar-toggle" onclick="toggleSidebar()" title="${isCollapsed ? '展開側邊欄' : '收起側邊欄'}">
        <span class="material-icons">chevron_left</span>
      </div>
      <nav class="nav flex-column">
        <a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="a04-dashboard.html" title="儀表板">
          <span class="material-icons" style="font-size: 20px;">dashboard</span>
          <span class="nav-link-text">儀表板</span>
        </a>
        <a class="nav-link ${activePage === 'companies' ? 'active' : ''}" href="a02-companies.html" title="所有公司">
          <span class="material-icons" style="font-size: 20px;">business</span>
          <span class="nav-link-text">所有公司</span>
        </a>
        <a class="nav-link ${activePage === 'guidance' ? 'active' : ''}" href="a05-guidance-records.html" title="輔導紀錄">
          <span class="material-icons" style="font-size: 20px;">history_edu</span>
          <span class="nav-link-text">輔導紀錄</span>
        </a>
      </nav>
    </aside>
  `;
}

function initLayout(activePage) {
  // 插入 topbar
  const topbarContainer = document.getElementById('topbar');
  if (topbarContainer) {
    topbarContainer.innerHTML = renderTopbar();
  }

  // 插入 sidebar
  const sidebarContainer = document.getElementById('sidebar');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = renderSidebar(activePage);
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

// 檢查登入狀態
function checkLogin() {
  const loginData = localStorage.getItem('adminLogin') || sessionStorage.getItem('adminLogin');
  if (!loginData) {
    window.location.href = 'a01-login.html';
    return false;
  }
  return true;
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
  
  // 更新切換按鈕的 title
  const toggleBtn = sidebar.querySelector('.sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.title = isCollapsed ? '收起側邊欄' : '展開側邊欄';
  }
}

