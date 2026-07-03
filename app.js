/**
 * 공모주 계좌 캘린더 - 핵심 애플리케이션 로직
 * 
 * [주의] 대한민국 공휴일 및 대체공휴일은 매년 초 업데이트가 필요합니다.
 * 현재 2025년 ~ 2028년 데이터가 기본 내장되어 있습니다.
 */

// 1. 2025년 ~ 2028년 대한민국 공휴일 데이터베이스 (근로자의 날 포함)
const HOLIDAYS = {
  "2025": {
    "01-01": "신정",
    "01-27": "임시공휴일",
    "01-28": "설날 연휴",
    "01-29": "설날",
    "01-30": "설날 연휴",
    "03-01": "삼일절",
    "03-03": "대체공휴일 (삼일절)",
    "05-01": "근로자의 날",
    "05-05": "어린이날 / 부처님오신날",
    "05-06": "대체공휴일 (어린이날/부처님오신날)",
    "06-06": "현충일",
    "08-15": "광복절",
    "10-03": "개천절",
    "10-05": "추석 연휴",
    "10-06": "추석",
    "10-07": "추석 연휴",
    "10-08": "대체공휴일 (추석)",
    "10-09": "한글날",
    "12-25": "크리스마스"
  },
  "2026": {
    "01-01": "신정",
    "02-16": "설날 연휴",
    "02-17": "설날",
    "02-18": "설날 연휴",
    "03-01": "삼일절",
    "03-02": "대체공휴일 (삼일절)",
    "05-01": "근로자의 날",
    "05-05": "어린이날",
    "05-24": "부처님오신날",
    "05-25": "대체공휴일 (부처님오신날)",
    "06-03": "지방선거 (임시공휴일)",
    "06-06": "현충일",
    "07-17": "제헌절",
    "08-15": "광복절",
    "08-17": "대체공휴일 (광복절)",
    "09-24": "추석 연휴",
    "09-25": "추석",
    "09-26": "추석 연휴",
    "10-03": "개천절",
    "10-05": "대체공휴일 (개천절)",
    "10-09": "한글날",
    "12-25": "크리스마스"
  },
  "2027": {
    "01-01": "신정",
    "02-06": "설날 연휴",
    "02-07": "설날",
    "02-08": "설날 연휴",
    "02-09": "대체공휴일 (설날)",
    "03-01": "삼일절",
    "05-01": "근로자의 날",
    "05-05": "어린이날",
    "05-13": "부처님오신날",
    "06-06": "현충일",
    "07-17": "제헌절",
    "07-19": "대체공휴일 (제헌절)",
    "08-15": "광복절",
    "08-16": "대체공휴일 (광복절)",
    "09-14": "추석 연휴",
    "09-15": "추석",
    "09-16": "추석 연휴",
    "10-03": "개천절",
    "10-04": "대체공휴일 (개천절)",
    "10-09": "한글날",
    "10-11": "대체공휴일 (한글날)",
    "12-25": "크리스마스",
    "12-27": "대체공휴일 (크리스마스)"
  },
  "2028": {
    "01-01": "신정",
    "01-26": "설날 연휴",
    "01-27": "설날",
    "01-28": "설날 연휴",
    "03-01": "삼일절",
    "04-12": "국회의원선거 (임시공휴일)",
    "05-01": "근로자의 날",
    "05-02": "부처님오신날",
    "05-05": "어린이날",
    "06-06": "현충일",
    "07-17": "제헌절",
    "08-15": "광복절",
    "10-02": "추석 연휴",
    "10-03": "추석 / 개천절",
    "10-04": "추석 연휴",
    "10-05": "대체공휴일 (개천절/추석)",
    "10-09": "한글날",
    "12-25": "크리스마스"
  }
};

// 2. 날짜 관련 유틸리티 함수 (타임존 문제 방지용)
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 특정 날짜가 공휴일인지 여부 판별
function getHolidayName(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const mmdd = `${month}-${day}`;
  
  if (HOLIDAYS[year] && HOLIDAYS[year][mmdd]) {
    return HOLIDAYS[year][mmdd];
  }
  return null;
}

// 영업일 여부 판별 (주말 및 공휴일 제외)
function isBusinessDay(date) {
  const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  if (getHolidayName(date)) {
    return false;
  }
  return true;
}

// 개설일로부터 영업일 기준 N일 뒤 날짜 계산 (기본 20영업일)
// 개설일 다음 날부터 카운트를 시작하며, 영업일 20일이 누적되는 날을 반환
function calculateNextDueDate(startDateStr, days = 20) {
  let date = parseLocalDate(startDateStr);
  let businessDaysAdded = 0;
  while (businessDaysAdded < days) {
    date.setDate(date.getDate() + 1);
    if (isBusinessDay(date)) {
      businessDaysAdded++;
    }
  }
  return formatLocalDate(date);
}

// 두 날짜 사이의 달력 기준 날짜 차이 계산 (D-Day용)
function calculateCalendarDaysDiff(targetDateStr, baseDateStr) {
  const target = parseLocalDate(targetDateStr);
  const base = parseLocalDate(baseDateStr);
  
  // 자정 기준으로 시간 설정하여 날짜 차이만 정확히 계산
  target.setHours(0, 0, 0, 0);
  base.setHours(0, 0, 0, 0);
  
  const diffTime = target - base;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 3. State Management (localStorage 활용)
const STORAGE_KEY = "ipo_accounts";

function getAccounts() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    // 개설일 기준 오름차순 정렬
    return list.sort((a, b) => a.openedDate.localeCompare(b.openedDate));
  } catch (e) {
    console.error("로컬스토리지 데이터를 파싱하지 못했습니다.", e);
    return [];
  }
}

function saveAccount(account) {
  const accounts = getAccounts();
  // 자동 계산 필드 추가
  account.nextDueDate = calculateNextDueDate(account.openedDate, 20);
  
  if (account.id) {
    // 수정
    const index = accounts.findIndex(acc => acc.id === account.id);
    if (index !== -1) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
  } else {
    // 신규 추가
    account.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    accounts.push(account);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return account;
}

function deleteAccount(id) {
  let accounts = getAccounts();
  accounts = accounts.filter(acc => acc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// 4. UI 렌더링 및 상태 관리
let currentYear;
let currentMonth;
let todayStr;

// DOM 요소 캐싱
const calendarMonthTitle = document.getElementById("calendarMonthTitle");
const calendarDaysGrid = document.getElementById("calendarDaysGrid");
const accountsTableBody = document.getElementById("accountsTableBody");
const accountsMobileList = document.getElementById("accountsMobileList");
const ddayBanner = document.getElementById("ddayBanner");
const bannerText = document.getElementById("bannerText");

// 모달 엘리먼트
const accountModal = document.getElementById("accountModal");
const accountForm = document.getElementById("accountForm");
const accountIdInput = document.getElementById("accountId");
const openedDateInput = document.getElementById("openedDate");
const brokerSelect = document.getElementById("brokerSelect");
const brokerInput = document.getElementById("brokerInput");
const accountTypeSelect = document.getElementById("accountTypeSelect");
const accountTypeInput = document.getElementById("accountTypeInput");
const accountNumberInput = document.getElementById("accountNumber");
const memoInput = document.getElementById("memo");
const modalTitle = document.getElementById("modalTitle");

const btnDeleteAccount = document.getElementById("btnDeleteAccount");
const btnModalCancel = document.getElementById("btnModalCancel");
const btnModalClose = document.getElementById("btnModalClose");
const btnPrevMonth = document.getElementById("btnPrevMonth");
const btnNextMonth = document.getElementById("btnNextMonth");
const btnQuickAdd = document.getElementById("btnQuickAdd");
const btnExportCSV = document.getElementById("btnExportCSV");

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  // 실제 2026년 기준 날짜를 활용하되, 로컬 시간 반영
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth(); // 0-indexed
  todayStr = formatLocalDate(now);
  
  // 이벤트 리스너 등록
  initEventListeners();
  
  // 데이터 로드 및 렌더링
  updateApp();
});

function initEventListeners() {
  // 이전달/다음달 이동
  btnPrevMonth.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateApp();
  });
  
  btnNextMonth.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateApp();
  });
  
  // 모달 닫기
  btnModalClose.addEventListener("click", closeModal);
  btnModalCancel.addEventListener("click", closeModal);
  accountModal.addEventListener("click", (e) => {
    if (e.target === accountModal) closeModal();
  });
  
  // 증권사 직접 입력 처리
  brokerSelect.addEventListener("change", () => {
    if (brokerSelect.value === "custom") {
      brokerInput.classList.add("show");
      brokerInput.setAttribute("required", "required");
      brokerInput.focus();
    } else {
      brokerInput.classList.remove("show");
      brokerInput.removeAttribute("required");
    }
  });
  
  // 계좌종류 직접 입력 처리
  accountTypeSelect.addEventListener("change", () => {
    if (accountTypeSelect.value === "custom") {
      accountTypeInput.classList.add("show");
      accountTypeInput.setAttribute("required", "required");
      accountTypeInput.focus();
    } else {
      accountTypeInput.classList.remove("show");
      accountTypeInput.removeAttribute("required");
    }
  });
  
  // 폼 제출
  accountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit();
  });
  
  // 삭제 버튼
  btnDeleteAccount.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = accountIdInput.value;
    if (id && confirm("정말 이 계좌 정보를 삭제하시겠습니까?")) {
      deleteAccount(id);
      closeModal();
      updateApp();
    }
  });
  
  // 상단 퀵 등록 버튼
  btnQuickAdd.addEventListener("click", () => {
    openModalForAdd(todayStr);
  });
  
  // CSV 내보내기 버튼
  btnExportCSV.addEventListener("click", exportToCSV);
}

// 앱의 전체적인 렌더링 업데이트
function updateApp() {
  renderCalendar();
  renderAccountsTable();
  updateDDayBanner();
}

// 5. 달력 렌더링
function renderCalendar() {
  calendarMonthTitle.textContent = `${currentYear}년 ${String(currentMonth + 1).padStart(2, '0')}월`;
  calendarDaysGrid.innerHTML = "";
  
  const accounts = getAccounts();
  
  // 해당 월의 첫째 날과 마지막 날 정보
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일
  
  // 캘린더 그리드에 채울 총 날짜 계산 (이전 달의 패딩 포함)
  // 이전 달의 정보
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  
  // 1. 이전 달 날짜 렌더링 (Padding)
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDay = prevMonthLastDay - i;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, prevDay);
    const dateStr = formatLocalDate(prevMonthDate);
    createDayCell(prevDay, dateStr, true, prevMonthDate);
  }
  
  // 2. 이번 달 날짜 렌더링
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(currentYear, currentMonth, day);
    const dateStr = formatLocalDate(currentDate);
    createDayCell(day, dateStr, false, currentDate);
  }
  
  // 3. 다음 달 날짜 렌더링 (Padding)
  // 7열 그리드의 줄을 완벽하게 맞추기 위해 남는 그리드 채우기 (보통 35칸 또는 42칸)
  const totalRendered = startDayOfWeek + daysInMonth;
  const remaining = totalRendered % 7 === 0 ? 0 : 7 - (totalRendered % 7);
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDate = new Date(currentYear, currentMonth + 1, i);
    const dateStr = formatLocalDate(nextMonthDate);
    createDayCell(i, dateStr, true, nextMonthDate);
  }
}

// 개별 날짜 셀 엘리먼트 생성
function createDayCell(dayNum, dateStr, isOtherMonth, dateObj = null) {
  const cell = document.createElement("div");
  cell.className = "day-cell";
  
  if (isOtherMonth) {
    cell.classList.add("other-month");
  }
  
  // 오늘 표시
  if (!isOtherMonth && dateStr === todayStr) {
    cell.classList.add("today");
  }
  
  // 요일 클래스 부여
  if (dateObj) {
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) cell.classList.add("sun");
    if (dayOfWeek === 6) cell.classList.add("sat");
  }
  
  // 공휴일 정보 확인
  if (dateObj) {
    const holidayName = getHolidayName(dateObj);
    if (holidayName) {
      cell.classList.add("holiday");
      const holDiv = document.createElement("div");
      holDiv.className = "cell-holiday-name";
      holDiv.textContent = holidayName;
      cell.appendChild(holDiv);
    }
  }
  
  // 계좌 데이터 바인딩
  const accounts = getAccounts();
  const openedAccounts = accounts.filter(acc => acc.openedDate === dateStr);
  const ddayAccounts = accounts.filter(acc => acc.nextDueDate === dateStr);
  
  const eventsContainer = document.createElement("div");
  eventsContainer.className = "cell-events";
  
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "cell-dots";
  
  // 개설일 표시
  if (openedAccounts.length > 0) {
    const openedBadge = document.createElement("div");
    openedBadge.className = "badge-opened";
    if (openedAccounts.length === 1) {
      openedBadge.textContent = `${openedAccounts[0].broker}`;
    } else {
      openedBadge.textContent = `🔵 계좌 ${openedAccounts.length}개`;
    }
    eventsContainer.appendChild(openedBadge);
    
    const openedDot = document.createElement("span");
    openedDot.className = "dot dot-opened";
    dotsContainer.appendChild(openedDot);
  }
  
  // D-Day 표시
  if (ddayAccounts.length > 0) {
    const ddayBadge = document.createElement("div");
    ddayBadge.className = "badge-dday";
    ddayBadge.textContent = `계좌개설일!`;
    eventsContainer.appendChild(ddayBadge);
    
    const ddayDot = document.createElement("span");
    ddayDot.className = "dot dot-dday";
    dotsContainer.appendChild(ddayDot);
  }
  
  cell.appendChild(eventsContainer);
  cell.appendChild(dotsContainer);
  
  // 클릭 이벤트
  cell.addEventListener("click", () => {
    openModalForDay(dateStr, openedAccounts);
  });
  
  // 날짜 숫자 라벨 추가
  const numSpan = document.createElement("span");
  numSpan.className = "day-number";
  numSpan.textContent = dayNum;
  cell.appendChild(numSpan);
  
  calendarDaysGrid.appendChild(cell);
}

// 6. 계좌 정보 모달 작동
function openModalForAdd(dateStr) {
  // 모달 초기화 (신규 추가용)
  modalTitle.textContent = "새 계좌 개설 정보 등록";
  accountIdInput.value = "";
  openedDateInput.value = dateStr;
  
  brokerSelect.value = "";
  brokerInput.value = "";
  brokerInput.classList.remove("show");
  brokerInput.removeAttribute("required");
  
  accountTypeSelect.value = "";
  accountTypeInput.value = "";
  accountTypeInput.classList.remove("show");
  accountTypeInput.removeAttribute("required");
  
  accountNumberInput.value = "";
  memoInput.value = "";
  
  btnDeleteAccount.style.display = "none";
  accountModal.classList.add("active");
}

function openModalForEdit(account) {
  modalTitle.textContent = "계좌 개설 정보 수정";
  accountIdInput.value = account.id;
  openedDateInput.value = account.openedDate;
  
  // 증권사 프리셋 검사
  const brokerOptions = Array.from(brokerSelect.options).map(opt => opt.value);
  if (brokerOptions.includes(account.broker)) {
    brokerSelect.value = account.broker;
    brokerInput.classList.remove("show");
    brokerInput.removeAttribute("required");
  } else {
    brokerSelect.value = "custom";
    brokerInput.value = account.broker;
    brokerInput.classList.add("show");
    brokerInput.setAttribute("required", "required");
  }
  
  // 계좌종류 프리셋 검사
  const typeOptions = Array.from(accountTypeSelect.options).map(opt => opt.value);
  if (typeOptions.includes(account.accountType)) {
    accountTypeSelect.value = account.accountType;
    accountTypeInput.classList.remove("show");
    accountTypeInput.removeAttribute("required");
  } else {
    accountTypeSelect.value = "custom";
    accountTypeInput.value = account.accountType;
    accountTypeInput.classList.add("show");
    accountTypeInput.setAttribute("required", "required");
  }
  
  accountNumberInput.value = account.accountNumber || "";
  memoInput.value = account.memo || "";
  
  btnDeleteAccount.style.display = "block";
  accountModal.classList.add("active");
}

// 달력 날짜 클릭 시 처리
function openModalForDay(dateStr, existingAccounts) {
  if (existingAccounts.length === 0) {
    openModalForAdd(dateStr);
  } else if (existingAccounts.length === 1) {
    // 이미 계좌가 1개 있으면 즉시 수정 모드
    openModalForEdit(existingAccounts[0]);
  } else {
    // 해당 날짜에 여러 계좌가 등록되어 있는 경우, 유저가 선택하게 하거나 목록을 띄우는 프리미엄 조치
    // 여기서는 깔끔하게 선택용 다이얼로그나 목록 중 첫 번째 항목을 바로 수정하되,
    // 유저가 다른 계좌들도 볼 수 있는 하단 테이블 뷰로 자연스럽게 시선을 유도하거나
    // 셀 클릭 시 신규 등록과 기존 수정을 선택할 수 있는 사용자 친화적인 선택 팝업 구현
    const selection = confirm(
      `이 날짜(${dateStr})에는 이미 ${existingAccounts.length}개의 계좌가 등록되어 있습니다.\n\n` +
      `[확인]을 누르면 새 계좌를 추가 등록하고,\n` +
      `[취소]를 누르면 아래 계좌 목록에서 기존 계좌를 직접 선택하여 수정/삭제할 수 있습니다.`
    );
    if (selection) {
      openModalForAdd(dateStr);
    } else {
      // 해당 날짜의 계좌들이 잘 보이도록 테이블 스크롤 이동
      const card = document.querySelector(".accounts-card");
      card.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function closeModal() {
  accountModal.classList.remove("active");
}

function handleFormSubmit() {
  const id = accountIdInput.value;
  const openedDate = openedDateInput.value;
  
  // 증권사명 추출
  let broker = brokerSelect.value;
  if (broker === "custom") {
    broker = brokerInput.value.trim();
  }
  
  // 계좌종류 추출
  let accountType = accountTypeSelect.value;
  if (accountType === "custom") {
    accountType = accountTypeInput.value.trim();
  }
  
  const accountNumber = accountNumberInput.value.trim();
  const memo = memoInput.value.trim();
  
  const accountData = {
    id: id || null,
    openedDate,
    broker,
    accountType,
    accountNumber,
    memo
  };
  
  saveAccount(accountData);
  closeModal();
  updateApp();
}

// 7. 계좌 목록 테이블 및 모바일 카드 리스트 렌더링
function renderAccountsTable() {
  const accounts = getAccounts();
  accountsTableBody.innerHTML = "";
  accountsMobileList.innerHTML = "";
  
  if (accounts.length === 0) {
    accountsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">등록된 계좌가 없습니다. 캘린더의 날짜를 클릭하여 추가해 보세요.</td>
      </tr>
    `;
    accountsMobileList.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-style: italic; font-size: 0.9rem;">
        등록된 계좌가 없습니다. 캘린더의 날짜를 클릭하여 추가해 보세요.
      </div>
    `;
    return;
  }
  
  accounts.forEach(acc => {
    // [1] 데스크톱용 테이블 렌더링
    const tr = document.createElement("tr");
    
    const tdOpened = document.createElement("td");
    tdOpened.textContent = acc.openedDate;
    tr.appendChild(tdOpened);
    
    const tdBroker = document.createElement("td");
    tdBroker.innerHTML = `
      <span class="table-badge-broker">${acc.broker}</span>
      <span class="table-badge-type">${acc.accountType}</span>
    `;
    tr.appendChild(tdBroker);
    
    const tdNumber = document.createElement("td");
    tdNumber.textContent = acc.accountNumber || "-";
    tr.appendChild(tdNumber);
    
    const tdDday = document.createElement("td");
    const diff = calculateCalendarDaysDiff(acc.nextDueDate, todayStr);
    
    let ddayHtml = "";
    let ddayText = "";
    if (diff > 0) {
      ddayHtml = `<span class="table-dday-highlight">${acc.nextDueDate} (D-${diff})</span>`;
      ddayText = `${acc.nextDueDate} (D-${diff})`;
    } else if (diff === 0) {
      ddayHtml = `<span class="table-dday-highlight" style="color: var(--color-primary);">오늘 (${acc.nextDueDate})</span>`;
      ddayText = `오늘 (${acc.nextDueDate})`;
    } else {
      ddayHtml = `<span style="color: var(--text-muted); font-size: 0.85rem;">해제 완료 (${acc.nextDueDate})</span>`;
      ddayText = `해제 완료 (${acc.nextDueDate})`;
    }
    tdDday.innerHTML = ddayHtml;
    tr.appendChild(tdDday);
    
    const tdActions = document.createElement("td");
    tdActions.className = "table-actions";
    
    const btnEditTable = document.createElement("button");
    btnEditTable.type = "button";
    btnEditTable.className = "btn-icon";
    btnEditTable.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    btnEditTable.setAttribute("aria-label", "수정");
    btnEditTable.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModalForEdit(acc);
    });
    
    const btnDelTable = document.createElement("button");
    btnDelTable.type = "button";
    btnDelTable.className = "btn-icon delete";
    btnDelTable.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    btnDelTable.setAttribute("aria-label", "삭제");
    btnDelTable.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(`정말 ${acc.broker} (${acc.accountType}) 계좌 정보를 삭제하시겠습니까?`)) {
        deleteAccount(acc.id);
        updateApp();
      }
    });
    
    tdActions.appendChild(btnEditTable);
    tdActions.appendChild(btnDelTable);
    tr.appendChild(tdActions);
    
    accountsTableBody.appendChild(tr);

    // [2] 모바일용 카드 리스트 렌더링
    const card = document.createElement("div");
    card.className = "mobile-account-card";
    
    card.innerHTML = `
      <div class="mobile-card-header">
        <span class="mobile-broker-name">${acc.broker}</span>
        <span class="mobile-account-type">${acc.accountType}</span>
      </div>
      <div class="mobile-card-body">
        <div class="mobile-account-number">
          ${acc.accountNumber || '계좌번호 없음'}
        </div>
        ${acc.memo ? `<div class="mobile-memo">${acc.memo.replace(/\n/g, '<br>')}</div>` : ''}
      </div>
      <div class="mobile-card-footer">
        <div class="mobile-dates">
          <div class="mobile-opened-date">개설일: ${acc.openedDate}</div>
        </div>
        <div class="mobile-actions"></div>
      </div>
    `;
    
    const mobileActions = card.querySelector(".mobile-actions");
    
    const btnEditMobile = document.createElement("button");
    btnEditMobile.type = "button";
    btnEditMobile.className = "btn-icon";
    btnEditMobile.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    btnEditMobile.setAttribute("aria-label", "수정");
    btnEditMobile.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModalForEdit(acc);
    });
    
    const btnDelMobile = document.createElement("button");
    btnDelMobile.type = "button";
    btnDelMobile.className = "btn-icon delete";
    btnDelMobile.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    btnDelMobile.setAttribute("aria-label", "삭제");
    btnDelMobile.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(`정말 ${acc.broker} (${acc.accountType}) 계좌 정보를 삭제하시겠습니까?`)) {
        deleteAccount(acc.id);
        updateApp();
      }
    });
    
    mobileActions.appendChild(btnEditMobile);
    mobileActions.appendChild(btnDelMobile);
    
    accountsMobileList.appendChild(card);
  });
}

// 8. 상단 D-Day 배너 업데이트 로직
function updateDDayBanner() {
  const accounts = getAccounts();
  
  if (accounts.length === 0) {
    bannerText.innerHTML = "개설된 계좌가 없습니다. <strong>오늘 즉시 개설 가능</strong>합니다.";
    ddayBanner.style.borderColor = "var(--color-primary)";
    const badge = ddayBanner.querySelector(".banner-badge");
    badge.style.backgroundColor = "var(--color-primary)";
    badge.innerHTML = `<i class="fa-solid fa-check-circle"></i> 개설 가능`;
    return;
  }
  
  // 현재 날짜 기준으로 제한이 남아있는 계좌들 추출
  // nextDueDate가 todayStr보다 큰 경우 제한 상태
  const activeRestrictions = accounts.filter(acc => acc.nextDueDate > todayStr);
  
  if (activeRestrictions.length === 0) {
    bannerText.innerHTML = "진행 중인 20일 제한이 없습니다. <strong>오늘 즉시 개설 가능</strong>합니다.";
    ddayBanner.style.borderColor = "var(--color-primary)";
    const badge = ddayBanner.querySelector(".banner-badge");
    badge.style.backgroundColor = "var(--color-primary)";
    badge.innerHTML = `<i class="fa-solid fa-check-circle"></i> 개설 가능`;
  } else {
    // 제한 계좌들 중 가장 늦은 nextDueDate를 구함 (이 날이 되어야 비로소 신규 개설 가능)
    const nextAvailableDate = activeRestrictions.reduce((latest, acc) => {
      return acc.nextDueDate > latest ? acc.nextDueDate : latest;
    }, "");
    
    const diff = calculateCalendarDaysDiff(nextAvailableDate, todayStr);
    
    const [year, month, day] = nextAvailableDate.split('-');
    
    bannerText.innerHTML = `다음 개설 가능일: <strong>${parseInt(month)}월 ${parseInt(day)}일 (D-${diff})</strong>입니다. (${nextAvailableDate})`;
    ddayBanner.style.borderColor = "var(--border-color)";
    const badge = ddayBanner.querySelector(".banner-badge");
    badge.style.backgroundColor = "var(--color-dday)";
    badge.innerHTML = `<i class="fa-solid fa-clock"></i> 개설 제한`;
  }
}

// 9. 프리미엄 기능: CSV 파일 다운로드 기능
function exportToCSV() {
  const accounts = getAccounts();
  if (accounts.length === 0) {
    alert("내보낼 계좌 정보가 없습니다.");
    return;
  }
  
  // CSV 헤더 정의
  let csvContent = "\uFEFF"; // Excel 한글 깨짐 방지용 BOM
  csvContent += "계좌 개설일,증권사,계좌 종류,계좌 번호,다음 개설 가능일(D-Day),메모\n";
  
  accounts.forEach(acc => {
    const openedDate = acc.openedDate;
    const broker = `"${acc.broker.replace(/"/g, '""')}"`;
    const accountType = `"${acc.accountType.replace(/"/g, '""')}"`;
    const accountNumber = `"${(acc.accountNumber || '').replace(/"/g, '""')}"`;
    const nextDueDate = acc.nextDueDate;
    const memo = `"${(acc.memo || '').replace(/"/g, '""')}"`;
    
    csvContent += `${openedDate},${broker},${accountType},${accountNumber},${nextDueDate},${memo}\n`;
  });
  
  // 블롭 생성 및 파일 다운로드 트리거
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const dateStr = formatLocalDate(new Date());
  link.setAttribute("href", url);
  link.setAttribute("download", `공모주_계좌_목록_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
