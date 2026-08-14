import { useState, useEffect, useMemo, useRef } from "react";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, App as AntApp, Button as AntBtn, Input as AntInput, Card as AntCard, Alert as AntAlert, Segmented, Typography, Select as AntSelect, Checkbox as AntCheckbox, Badge as AntBadge, Tag as AntTag, Tooltip as AntTooltip, Modal as AntModal, Drawer as AntDrawer, Tabs as AntTabs, Progress as AntProgress, Empty as AntEmpty, Slider as AntSlider, Switch as AntSwitch, Popover as AntPopover } from "antd";
import {
  Plus, Search, LayoutList, LayoutGrid, CalendarDays, LayoutDashboard,
  X, Check, Trash2, Flag, Clock, Tag as TagIcon, Folder, Globe,
  ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertTriangle,
  CircleDot, Filter, Inbox, Sparkles, Users, MessageSquare, Send,
  Crown, Pencil, RefreshCw, UserPlus, Lock, LogOut, Share2,
  History, ScrollText, Mail, Bell, Star, UserCheck, Percent,
  Wallet, Banknote, TrendingUp, TrendingDown, Receipt, Settings,
  Gauge, Download, Network, CalendarRange, ArrowRight, ListChecks,
} from "lucide-react";

/* ----------------------------- i18n ----------------------------- */
const T = {
  vi: {
    appName: "Trạm Dự Án", tagline: "Quản lý công việc",
    myWork: "Việc của tôi", dashboard: "Tổng quan", projects: "Dự án",
    newProject: "Dự án mới", projectName: "Tên dự án", create: "Tạo",
    cancel: "Hủy", addTask: "Thêm việc", searchPlaceholder: "Tìm việc...",
    list: "Danh sách", board: "Bảng", calendar: "Lịch",
    noTasks: "Chưa có việc nào ở đây.", noTasksHint: "Nhấn “Thêm việc” để bắt đầu.",
    addSection: "Thêm cột", sectionName: "Tên cột",
    done: "Hoàn thành", showCompleted: "Hiện việc đã xong",
    filter: "Lọc", allPriorities: "Mọi mức ưu tiên",
    allAssignees: "Mọi người", clearFilters: "Xóa bộ lọc",
    title: "Tiêu đề", description: "Mô tả", priority: "Ưu tiên",
    assignee: "Người làm", dueDate: "Hạn chót", tagsLabel: "Nhãn",
    section: "Cột", subtasks: "Việc con", addSubtask: "Thêm việc con",
    delete: "Xóa", edit: "Sửa", untitled: "Việc chưa đặt tên",
    addTagPlaceholder: "Thêm nhãn + Enter",
    priorities: { low: "Thấp", medium: "Trung bình", high: "Cao", urgent: "Khẩn cấp" },
    defaultSections: ["Cần làm", "Đang làm", "Hoàn thành"],
    overdue: "Quá hạn", today: "Hôm nay", tomorrow: "Ngày mai", noDate: "Chưa đặt hạn",
    statTotal: "Tổng việc", statDone: "Đã xong", statOverdue: "Quá hạn",
    statProgress: "Tiến độ", byPriority: "Theo mức ưu tiên",
    upcoming: "Sắp tới hạn", projectProgress: "Tiến độ dự án",
    nothingUpcoming: "Không có việc nào sắp tới hạn.",
    welcome: "Chọn một dự án để bắt đầu", welcomeHint: "Tạo dự án mới ở thanh bên trái.",
    deleteProject: "Xóa dự án", confirmDeleteProject: "Xóa dự án này cùng toàn bộ công việc?",
    unassigned: "Chưa giao",
    weekdays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    months: ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"],
    allTasksDone: "Tất cả việc đã hoàn thành 🎉",
    quickAdd: "Tên việc rồi Enter...",
    members: "Thành viên", manageMembers: "Quản lý thành viên",
    role: "Vai trò", addMember: "Thêm thành viên", memberName: "Tên thành viên",
    roles: { owner: "Chủ sở hữu", member: "Thành viên", manager: "Quản lý", employee: "Nhân viên" },
    roleHints: {
      owner: "Toàn quyền: chỉnh sửa, giao việc, chi phí, quản lý thành viên, cài đặt.",
      member: "Thành viên: quyền hạn do Chủ sở hữu cấp qua các ô bên dưới.",
    },
    caps: { canAssign: "Giao việc", canViewFinance: "Chi phí", canViewHistory: "Lịch sử", canViewWorkload: "Khối lượng", canManageMembers: "Tạo tài khoản", isLeader: "Lãnh đạo", isTeamlead: "Teamlead", noReport: "Miễn báo cáo" },
    capHints: {
      canAssign: "Giao việc: tạo/sửa công việc, giao người, đặt nhắc việc, quản lý cột & dự án.",
      canViewFinance: "Chi phí: xem và cập nhật mục Chi phí (hợp đồng, thanh toán, dòng tiền).",
      canViewHistory: "Lịch sử: xem nhật ký thay đổi.",
      canViewWorkload: "Khối lượng: xem công suất làm việc của các thành viên.",
      canManageMembers: "Tạo tài khoản: được vào mục Thành viên để tạo tài khoản và phân quyền (chỉ Chủ sở hữu mới cấp được quyền này).",
    },
    baseMemberNote: "Mọi thành viên đều có thể: xem công việc, bình luận, và cập nhật % hoàn thành ở việc mình phụ trách chính.",
    you: "Bạn", removeMember: "Gỡ", lastOwnerWarn: "Phải còn ít nhất một Chủ sở hữu.",
    readOnly: "Bạn chỉ được cập nhật khối lượng hoàn thành ở việc mình phụ trách chính.",
    email: "Email", emailPlaceholder: "ten@congty.com", emailRequired: "Vui lòng nhập email hợp lệ.",
    // identity
    whoAreYou: "Bạn là ai?", pickIdentity: "Chọn tên hoặc đăng ký bằng email để bắt đầu.",
    // login / accounts (server)
    signIn: "Đăng nhập", password: "Mật khẩu", passwordPlaceholder: "Mật khẩu",
    login: "Đăng nhập", logout: "Đăng xuất", wrongLogin: "Email hoặc mật khẩu không đúng.",
    setupTitle: "Tạo tài khoản Chủ sở hữu", setupHint: "Đây là lần chạy đầu tiên. Hãy tạo tài khoản chủ sở hữu cho chính bạn — bạn sẽ là người quản lý toàn bộ hệ thống.",
    setupFailed: "Không tạo được tài khoản. Thử lại.",
    createOwnerBtn: "Tạo & bắt đầu", setPassword: "Đặt mật khẩu",
    resetPassword: "Đặt lại mật khẩu", resetPwPrompt: "Mật khẩu mới cho",
    changePassword: "Đổi mật khẩu", oldPassword: "Mật khẩu hiện tại", newPassword: "Mật khẩu mới",
    pwChanged: "Đã đổi mật khẩu.", pwWrong: "Mật khẩu hiện tại không đúng.",
    emailExistsErr: "Email này đã có tài khoản.", profile: "Tài khoản",
    ownerCreatesAccounts: "Chỉ Chủ sở hữu tạo tài khoản (tên, email, mật khẩu). Người dùng đăng nhập bằng email + mật khẩu.",
    loginWelcome: "Đăng nhập để tiếp tục",
    // settings
    settings: "Cài đặt", settingsSaved: "Đã lưu cài đặt.",
    settingsHint: "Email gửi đi (SMTP) dùng cho nhắc việc và sao lưu. Email nhận sao lưu nhận file dữ liệu mỗi thứ Bảy.",
    appUrlLabel: "Địa chỉ phần mềm (cho link trong email)", appNameLabel: "Tên hiển thị",
    backupSection: "Sao lưu tự động (mỗi thứ Bảy)", backupEmailLabel: "Email nhận sao lưu",
    backupNote: "Mỗi thứ Bảy, hệ thống gửi file dữ liệu (công việc, tài khoản, chi phí) vào email này. Cần cấu hình SMTP bên dưới.",
    smtpSection: "Email gửi đi (SMTP)", smtpHost: "Máy chủ SMTP", smtpPort: "Cổng", smtpSecure: "SSL/TLS",
    smtpUser: "Tài khoản", smtpPass: "Mật khẩu", smtpFrom: "Gửi từ (From)",
    smtpHelp: "Ví dụ Gmail: smtp.gmail.com, cổng 587, mật khẩu dùng App Password 16 ký tự.",
    // finance
    finance: "Chi phí", financeLocked: "Bạn không có quyền xem chi phí.",
    canViewFinance: "Xem chi phí", manageFinanceHint: "Chỉ Chủ sở hữu và Quản lý được cấp quyền mới thấy mục Chi phí.",
    finTabInvestor: "Chủ đầu tư", finTabSub: "Thầu phụ / NCC", finTabCashflow: "Dòng tiền",
    cfIn: "Thu vào", cfOut: "Chi ra", cfNet: "Dòng tiền ròng", cfCumulative: "Lũy kế ròng",
    cfPending: "Đang chờ thu", cfByMonth: "Dòng tiền theo tháng", cfCumTitle: "Dòng tiền ròng lũy kế",
    cfMonth: "Tháng", cfNoData: "Chưa có dữ liệu dòng tiền. Hãy nhập các đợt đã thanh toán ở 2 tab kia.",
    // departments
    deptLabel: "Bộ phận", deptNone: "—", roleLabel: "Vai trò", permissionsLabel: "Phân quyền",
    depts: { QS: "QS", Coordinator: "Điều phối", Design: "Thiết kế", Site: "Công trường", Accountant: "Kế toán", Lead: "Lãnh đạo" },
    // workload
    workload: "Khối lượng", workloadLocked: "Bạn không có quyền xem khối lượng công việc.",
    workloadHint: "Số việc chưa hoàn thành đang giao cho mỗi người (tính theo người được giao). Đỏ = quá tải, xanh = còn rảnh.",
    capacity: "Sức chứa", overloaded: "Quá tải", lightLoad: "Còn rảnh", balanced: "Vừa phải",
    tasksOpen: "việc đang mở", primaryTasks: "phụ trách chính", overdueTasks: "quá hạn",
    // timeline / gantt
    timeline: "Dòng thời gian", ganttHint: "Kéo thanh để dời lịch (đổi ngày bắt đầu & hạn). Đường nối thể hiện phụ thuộc.",
    criticalPath: "Đường găng", criticalBadge: "Găng", normalTask: "Việc thường", depLine: "Phụ thuộc",
    criticalTip: "ĐƯỜNG GĂNG — việc này trễ ngày nào, cả dự án trễ ngày đó", slackDays: "Dự trữ", daysUnit: "ngày",
    depViolation: "Bắt đầu trước khi việc phụ thuộc hoàn thành — kiểm tra lại lịch!",
    undatedHint: "việc chưa đặt ngày (không hiển thị trên sơ đồ)", cycleWarn: "Phụ thuộc vòng tròn — không tính được đường găng.",
    noTimelineData: "Chưa có công việc nào có ngày để vẽ. Hãy đặt Ngày bắt đầu và Hạn chót.",
    startDate: "Ngày bắt đầu", plannedDays: "Tiến độ dự kiến (ngày)", today2: "Hôm nay", statuses: { todo: "Cần làm", doing: "Đang làm", review: "Chờ phê duyệt", onhold: "On hold / Blocked", done: "Hoàn thành" }, statusLabel: "Trạng thái", approver: "Người phê duyệt", byLeader: "Lãnh đạo phê duyệt", byTeamlead: "Teamlead phê duyệt", approveBtn: "Phê duyệt", dailyReport: "Báo cáo ngày", todayReport: "Báo cáo hôm nay", myReports: "Của tôi", reportTracking: "Theo dõi nộp", submitReport: "Gửi báo cáo", reportSubmitted: "Đã gửi", reportMissing: "Chưa gửi", reportAddLine: "Thêm dòng", reportWhatDone: "Đã làm gì", reportPct: "% phần mình", reportIssue: "Vướng mắc / đề xuất", reportOf: "Báo cáo của", reportNone: "Chưa có báo cáo.", reportDeadlineNote: "Hạn nộp: trong 48 giờ kể từ 17:30 của ngày báo cáo.", reportSel: "Chọn công tác...", reportComment: "Bình luận báo cáo...", constructionSite: "Nhật ký thi công", siteTab: "Nhật ký", recordsTab: "Biên bản", addSiteLog: "Thêm nhật ký", siteDate: "Ngày", siteWeather: "Thời tiết", siteAM: "Sáng", sitePM: "Chiều", wSun: "Nắng", wRain: "Mưa", siteManpower: "Nhân lực", siteWork: "Hạng mục + khối lượng", siteEquip: "Thiết bị & vật tư", siteIssues: "Vướng mắc ảnh hưởng tiến độ", siteNext: "Kế hoạch ngày tiếp theo", sitePhotos: "Ảnh hiện trường", siteNoLogs: "Chưa có nhật ký.", siteAssign: "Chỉ định người lập", siteSave: "Lưu nhật ký", siteRequired: "Cần điền Hạng mục và ít nhất 1 ảnh.", positionLabel: "Chức vụ", featuresTitle: "Tính năng", featuresHint: "Bật/tắt nhóm tính năng cho công ty này; tắt sẽ ẩn khỏi mọi người dùng.", presetLabel: "Cấu hình nhanh", presetFull: "Đầy đủ", presetTask: "Chỉ công việc", presetDesign: "Thiết kế", trashTitle: "Thùng rác", trashEmpty: "Thùng rác trống.", restore: "Khôi phục", deleteForever: "Xóa vĩnh viễn", movedToTrash: "Đã chuyển vào thùng rác", undo: "Hoàn tác", trashHint: "Dự án đã xóa được giữ ở đây; chỉ Chủ sở hữu mới xóa vĩnh viễn.", searchAll: "Tìm kiếm", searchAllPlaceholder: "Tìm công việc trong mọi dự án...", resultsFound: "kết quả", noResults: "Không tìm thấy công việc nào.", attachments: "Tệp đính kèm", posLeader: "Lãnh đạo", posStaff: "Nhân viên", posTeamlead: "Teamlead (trưởng bộ phận)", posDeputy: "Phó giám đốc", posCustom: "Tùy chỉnh", advancedPerms: "Tùy chỉnh nâng cao", recur: "Lặp lại", recurNone: "Không lặp", recurWeekly: "Hàng tuần", recurMonthly: "Hàng tháng",
    records: "Biên bản", addRecord: "Thêm biên bản", noRecords: "Chưa có biên bản nào.", allTypes: "Tất cả loại", more: "khác", recDate: "Ngày", recType: "Loại biên bản", recNumber: "Số biên bản (tùy chọn)", recNumberPh: "Ví dụ: 06", recNote: "Ghi chú nội dung (bắt buộc)", recFiles: "Tệp (PDF / ảnh)", recFilesChosen: "tệp đã chọn", recFieldType: "Biên bản hiện trường", recMeetingType: "Biên bản họp", recDirectiveType: "Chỉ thị công trường", recSaving: "Đang lưu...", confirmDeleteRecord: "Xóa biên bản này (kèm các tệp)?", saveFailed: "Lưu thất bại.",
    // dependencies
    dependencies: "Phụ thuộc", waitingOn: "Đang chờ", blocking: "Đang chặn",
    addDependency: "Thêm việc phải xong trước", dependsHint: "Việc này chỉ nên bắt đầu sau khi các việc “đang chờ” hoàn thành.",
    blocked: "Bị chặn", noDeps: "Không có phụ thuộc.",
    // time tracking
    assignedAt: "Được giao lúc", completedAt: "Hoàn thành lúc", createdAtLabel: "Tạo lúc", notCompleted: "Chưa hoàn thành", timeTracking: "Theo dõi thời gian",
    // download
    download: "Tải báo cáo", downloadReport: "Tải báo cáo (HTML)", downloadAll: "Toàn bộ dự án", reportFor: "Báo cáo",
    generatedAt: "Lập lúc",
    // dashboard charts
    chartStatus: "Trạng thái công việc", chartByProject: "Công việc theo dự án", chartByAssignee: "Phân bổ theo nhân sự",
    chartByDept: "Phân bổ theo bộ phận", statusDone: "Hoàn thành", statusActive: "Đang làm", statusOverdue: "Quá hạn",
    viewProjectLabel: "Xem dự án", allProjectsLabel: "Tất cả dự án", realtimeNote: "Cập nhật theo thời gian thực",
    // project template
    useTemplate: "Mẫu dự án (tùy chọn)", templateNone: "Trống — không dùng mẫu",
    templateHint: "Sao chép các cột & công việc từ một dự án có sẵn (KHÔNG sao chép phần giao việc, tiến độ, bình luận).",
    // finance per project
    financeProject: "Dự án", financeAllProjects: "Tất cả dự án", financeNoProject: "Chưa gắn dự án",
    // BOQ – khối lượng – chi phí
    finTabBoq: "BOQ & Khối lượng", boqCode: "Mã", boqName: "Tên công tác", boqUnit: "ĐVT",
    boqQty: "KL hợp đồng", boqPrice: "Đơn giá", boqAmount: "Thành tiền", boqDoneQty: "KL thực hiện",
    boqDoneVal: "Giá trị thực hiện", boqPercent: "%KL", boqLinkTasks: "Công việc liên kết",
    boqAddItem: "Thêm hạng mục", boqImport: "Nhập từ Excel (CSV)",
    boqImportHint: "Dán các cột theo thứ tự: Mã, Tên công tác, Đơn vị, Khối lượng, Đơn giá — có thể kèm dòng tiêu đề. Chấp nhận số kiểu VN (1.234,56) và kiểu Anh (1,234.56).",
    boqImportDo: "Nhập vào BOQ", boqSumValue: "Giá trị BOQ", boqSumDone: "Đã thực hiện", boqSumLeft: "Còn lại", boqSumPct: "% giá trị",
    boqSuggest: "Lấy KL theo % tiến độ các công việc liên kết", boqEmpty: "Chưa có hạng mục BOQ cho dự án này.",
    boqEmptyAll: "Chưa có BOQ. Chọn một dự án ở trên để bắt đầu nhập.", boqPickProject: "Chọn một dự án ở trên để nhập / sửa BOQ chi tiết.",
    boqVsContract: "Giá trị hợp đồng CĐT", boqDelta: "Chênh lệch BOQ − hợp đồng", boqDeleteConfirm: "Xóa hạng mục này?", boqCount: "hạng mục",
    contract: "Hợp đồng", appendix: "Phụ lục", kindLabel: "Loại", contractItems: "hợp đồng/PL",
    contractValue: "Giá trị hợp đồng", contractCode: "Số / Tên hợp đồng",
    parentContract: "Thuộc hợp đồng", none: "—", notLinked: "Không liên kết",
    linkedInvestorContract: "Theo HĐ chủ đầu tư",
    billedSent: "Đề nghị thanh toán đã gửi", investorPaid: "Chủ đầu tư đã thanh toán",
    subPaid: "Đã thanh toán cho thầu phụ",
    supplierName: "Tên thầu phụ / nhà cung cấp",
    addContract: "Thêm hợp đồng", addSubContract: "Thêm hợp đồng thầu phụ",
    addInstallment: "Thêm đợt", installmentDate: "Ngày", installmentAmount: "Số tiền",
    total: "Tổng", remaining: "Còn lại", received: "Đã thu", paidOut: "Đã trả",
    sumInvValue: "Giá trị HĐ (CĐT)", sumBilled: "Đã đề nghị TT", sumReceived: "CĐT đã trả",
    sumToCollect: "Còn phải thu", sumSubValue: "Giá trị HĐ thầu phụ", sumSubPaid: "Đã trả thầu phụ",
    sumToPay: "Còn phải trả NCC",
    noInvContracts: "Chưa có hợp đồng với chủ đầu tư.", noSubContracts: "Chưa có hợp đồng thầu phụ / NCC.",
    valuePlaceholder: "Số tiền (₫)", deleteContractConfirm: "Xóa hợp đồng này cùng các đợt thanh toán?",
    addEntry: "Thêm", category: "Hạng mục", note: "Ghi chú", notePlaceholder: "Ghi chú (tuỳ chọn)",
    joinAs: "Tham gia với tên này", orCreate: "Hoặc đăng ký người mới",
    yourName: "Họ tên", join: "Tham gia", switchUser: "Đổi người dùng",
    // assignees / workdone
    assignees: "Người được giao", primary: "Phụ trách chính", setPrimary: "Đặt làm chính",
    workdone: "Khối lượng hoàn thành", workdoneShort: "Hoàn thành",
    workdoneHint: "Chỉ người phụ trách chính cập nhật phần trăm này.",
    noAssignees: "Chưa giao cho ai.",
    // reminder
    reminder: "Nhắc việc qua email", reminderSet: "Nhắc trước hạn",
    remindBefore: "Nhắc trước deadline", noReminder: "Tắt", save: "Lưu",
    unitHour: "giờ", unitDay: "ngày", reminderOnServer: "Email chỉ được gửi ở bản máy chủ (NAS/LAN) sau khi cấu hình email gửi đi.",
    // comments
    comments: "Bình luận", noComments: "Chưa có bình luận nào.",
    writeComment: "Viết bình luận...", postComment: "Gửi",
    justNow: "vừa xong",
    minAgo: (n) => `${n} phút trước`, hrAgo: (n) => `${n} giờ trước`, dayAgo: (n) => `${n} ngày trước`,
    // sync / collaborate
    collaborate: "Cộng tác", invite: "Mời người khác",
    synced: "Đã đồng bộ", syncNow: "Đồng bộ ngay", syncing: "Đang đồng bộ...",
    offline: "Không lưu được — chạy ở chế độ tạm.",
    howToConnect: "Cách kết nối nhiều người",
    connectSteps: [
      "Nhấn nút Chia sẻ của ứng dụng (góc trên) để lấy đường link, hoặc dùng bản máy chủ NAS/LAN.",
      "Gửi link/địa chỉ cho đồng nghiệp. Khi mở, họ đăng ký bằng họ tên và email.",
      "Mọi thay đổi được đồng bộ tự động mỗi vài giây.",
      "Chủ sở hữu vào “Quản lý thành viên” để đặt vai trò Quản lý hoặc Nhân viên.",
    ],
    connectNote: "Phân quyền là quy ước phối hợp trên giao diện. Dữ liệu đồng bộ “ai lưu sau ghi đè”, nên tránh hai người sửa cùng một việc cùng lúc.",
    close: "Đóng", activeMembers: "thành viên",
    history: "Lịch sử thay đổi", noHistory: "Chưa có thay đổi nào được ghi nhận.",
    historyLocked: "Bạn không có quyền xem lịch sử thay đổi.",
    canViewHistory: "Xem lịch sử", allProjects: "Tất cả dự án", inProject: "ở dự án",
    field: { title: "Tiêu đề", description: "Mô tả", priority: "Ưu tiên", dueDate: "Hạn chót", assignee: "Người làm", section: "Cột", tags: "Nhãn", subtasks: "Việc con" },
    act: {
      task_create: "đã tạo công việc", task_delete: "đã xóa công việc",
      task_complete: "đã đánh dấu hoàn thành", task_reopen: "đã mở lại công việc",
      task_field: "đã đổi", comment_add: "đã bình luận ở",
      section_add: "đã thêm cột", project_create: "đã tạo dự án", project_delete: "đã xóa dự án",
      member_add: "đã thêm thành viên", member_remove: "đã gỡ thành viên",
      member_role: "đã đổi vai trò của", member_cap: "đã đổi quyền của", history_grant: "đã cấp quyền xem lịch sử cho", history_revoke: "đã thu hồi quyền xem lịch sử của",
      task_assign: "đã giao việc", task_workdone: "đã cập nhật hoàn thành", task_reminder: "đã đặt nhắc việc cho",
    },
    emptyVal: "(trống)",
  },
  en: {
    appName: "Project Hub", tagline: "Work management",
    myWork: "My Work", dashboard: "Dashboard", projects: "Projects",
    newProject: "New project", projectName: "Project name", create: "Create",
    cancel: "Cancel", addTask: "Add task", searchPlaceholder: "Search tasks...",
    list: "List", board: "Board", calendar: "Calendar",
    noTasks: "No tasks here yet.", noTasksHint: "Click “Add task” to begin.",
    addSection: "Add column", sectionName: "Column name",
    done: "Done", showCompleted: "Show completed",
    filter: "Filter", allPriorities: "All priorities",
    allAssignees: "Everyone", clearFilters: "Clear filters",
    title: "Title", description: "Description", priority: "Priority",
    assignee: "Assignee", dueDate: "Due date", tagsLabel: "Tags",
    section: "Column", subtasks: "Subtasks", addSubtask: "Add subtask",
    delete: "Delete", edit: "Edit", untitled: "Untitled task",
    addTagPlaceholder: "Add tag + Enter",
    priorities: { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" },
    defaultSections: ["To do", "In progress", "Done"],
    overdue: "Overdue", today: "Today", tomorrow: "Tomorrow", noDate: "No due date",
    statTotal: "Total tasks", statDone: "Completed", statOverdue: "Overdue",
    statProgress: "Progress", byPriority: "By priority",
    upcoming: "Upcoming", projectProgress: "Project progress",
    nothingUpcoming: "Nothing due soon.",
    welcome: "Pick a project to start", welcomeHint: "Create a new project in the sidebar.",
    deleteProject: "Delete project", confirmDeleteProject: "Delete this project and all its tasks?",
    unassigned: "Unassigned",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    allTasksDone: "All tasks complete 🎉",
    quickAdd: "Task name then Enter...",
    members: "Members", manageMembers: "Manage members",
    role: "Role", addMember: "Add member", memberName: "Member name",
    roles: { owner: "Owner", member: "Member", manager: "Manager", employee: "Employee" },
    roleHints: {
      owner: "Full access: edit, assign, costs, manage members, settings.",
      member: "Member: capabilities granted by the Owner via the toggles below.",
    },
    caps: { canAssign: "Assign work", canViewFinance: "Costs", canViewHistory: "History", canViewWorkload: "Workload", canManageMembers: "Create accounts", isLeader: "Leader", isTeamlead: "Team lead", noReport: "No report" },
    capHints: {
      canAssign: "Assign work: create/edit tasks, assign people, reminders, manage columns & projects.",
      canViewFinance: "Costs: view and edit the Costs section (contracts, payments, cashflow).",
      canViewHistory: "History: view the change log.",
      canViewWorkload: "Workload: view each member\u2019s capacity.",
      canManageMembers: "Create accounts: access Members to create accounts and assign permissions (only the Owner can grant this).",
    },
    baseMemberNote: "Every member can: view tasks, comment, and update % done on tasks they are primary for.",
    you: "You", removeMember: "Remove", lastOwnerWarn: "At least one Owner is required.",
    readOnly: "You can only update work-done on tasks you are primary for.",
    email: "Email", emailPlaceholder: "name@company.com", emailRequired: "Please enter a valid email.",
    whoAreYou: "Who are you?", pickIdentity: "Pick your name or register with email to start.",
    signIn: "Sign in", password: "Password", passwordPlaceholder: "Password",
    login: "Log in", logout: "Log out", wrongLogin: "Wrong email or password.",
    setupTitle: "Create the Owner account", setupHint: "This is the first run. Create the owner account for yourself — you'll administer the whole system.",
    setupFailed: "Could not create the account. Try again.",
    createOwnerBtn: "Create & start", setPassword: "Set password",
    resetPassword: "Reset password", resetPwPrompt: "New password for",
    changePassword: "Change password", oldPassword: "Current password", newPassword: "New password",
    pwChanged: "Password changed.", pwWrong: "Current password is wrong.",
    emailExistsErr: "An account with this email already exists.", profile: "Account",
    ownerCreatesAccounts: "Only the Owner creates accounts (name, email, password). Users log in with email + password.",
    loginWelcome: "Sign in to continue",
    settings: "Settings", settingsSaved: "Settings saved.",
    settingsHint: "The sending email (SMTP) powers reminders and backups. The backup email receives data files every Saturday.",
    appUrlLabel: "App URL (for links in emails)", appNameLabel: "Display name",
    backupSection: "Automatic backup (every Saturday)", backupEmailLabel: "Backup recipient email",
    backupNote: "Every Saturday the system emails the data files (tasks, accounts, costs) to this address. Requires SMTP below.",
    smtpSection: "Sending email (SMTP)", smtpHost: "SMTP host", smtpPort: "Port", smtpSecure: "SSL/TLS",
    smtpUser: "Username", smtpPass: "Password", smtpFrom: "From",
    smtpHelp: "Gmail example: smtp.gmail.com, port 587, use a 16-char App Password.",
    finance: "Costs", financeLocked: "You don't have access to costs.",
    canViewFinance: "View costs", manageFinanceHint: "Only the Owner and permitted Managers can see the Costs section.",
    finTabInvestor: "Investor / Client", finTabSub: "Subcontractor / Supplier", finTabCashflow: "Cashflow",
    cfIn: "Cash in", cfOut: "Cash out", cfNet: "Net cash", cfCumulative: "Cumulative net",
    cfPending: "Pending to collect", cfByMonth: "Cash flow by month", cfCumTitle: "Cumulative net cash",
    cfMonth: "Month", cfNoData: "No cashflow yet. Add paid installments in the other two tabs.",
    deptLabel: "Department", deptNone: "—", roleLabel: "Role", permissionsLabel: "Permissions",
    depts: { QS: "QS", Coordinator: "Coordinator", Design: "Design", Site: "Site", Accountant: "Accountant", Lead: "Leadership" },
    workload: "Workload", workloadLocked: "You don't have access to workload.",
    workloadHint: "Open tasks assigned to each person. Red = overloaded, green = light.",
    capacity: "Capacity", overloaded: "Overloaded", lightLoad: "Light", balanced: "Balanced",
    tasksOpen: "open tasks", primaryTasks: "primary", overdueTasks: "overdue",
    timeline: "Timeline", ganttHint: "Drag a bar to reschedule (start & due). Lines show dependencies.",
    criticalPath: "Critical path", criticalBadge: "Critical", normalTask: "Normal task", depLine: "Dependency",
    criticalTip: "CRITICAL PATH — any delay here delays the whole project", slackDays: "Slack", daysUnit: "days",
    depViolation: "Starts before its dependency finishes — check the schedule!",
    undatedHint: "task(s) without dates (hidden from chart)", cycleWarn: "Circular dependencies — cannot compute critical path.",
    noTimelineData: "No tasks with dates yet. Set Start date and Due date.",
    startDate: "Start date", plannedDays: "Planned duration (days)", today2: "Today", statuses: { todo: "To do", doing: "In progress", review: "Pending approval", onhold: "On hold / Blocked", done: "Done" }, statusLabel: "Status", approver: "Approver", byLeader: "Leader approves", byTeamlead: "Teamlead approves", approveBtn: "Approve", dailyReport: "Daily report", todayReport: "Today\u2019s report", myReports: "Mine", reportTracking: "Submission tracking", submitReport: "Submit report", reportSubmitted: "Submitted", reportMissing: "Not submitted", reportAddLine: "Add line", reportWhatDone: "What you did", reportPct: "My %", reportIssue: "Issues / suggestions", reportOf: "Report of", reportNone: "No report yet.", reportDeadlineNote: "Deadline: within 48h from 5:30 PM of the report day.", reportSel: "Select task...", reportComment: "Comment on report...", constructionSite: "Site log", siteTab: "Site log", recordsTab: "Records", addSiteLog: "Add log", siteDate: "Date", siteWeather: "Weather", siteAM: "AM", sitePM: "PM", wSun: "Sunny", wRain: "Rain", siteManpower: "Manpower", siteWork: "Work + quantity", siteEquip: "Equipment & materials", siteIssues: "Issues affecting progress", siteNext: "Next-day plan", sitePhotos: "Site photos", siteNoLogs: "No log yet.", siteAssign: "Assign loggers", siteSave: "Save log", siteRequired: "Fill Work and at least 1 photo.", positionLabel: "Position", featuresTitle: "Features", featuresHint: "Enable/disable feature groups for this company; disabling hides them from everyone.", presetLabel: "Quick preset", presetFull: "Full", presetTask: "Tasks only", presetDesign: "Design", trashTitle: "Trash", trashEmpty: "Trash is empty.", restore: "Restore", deleteForever: "Delete forever", movedToTrash: "Moved to trash", undo: "Undo", trashHint: "Deleted projects are kept here; only the owner can delete forever.", searchAll: "Search", searchAllPlaceholder: "Search tasks across all projects...", resultsFound: "results", noResults: "No matching tasks.", attachments: "Attachments", posLeader: "Leader", posStaff: "Staff", posTeamlead: "Teamlead", posDeputy: "Deputy director", posCustom: "Custom", advancedPerms: "Advanced permissions", recur: "Repeat", recurNone: "No repeat", recurWeekly: "Weekly", recurMonthly: "Monthly",
    records: "Records", addRecord: "Add record", noRecords: "No records yet.", allTypes: "All types", more: "more", recDate: "Date", recType: "Record type", recNumber: "Record no. (optional)", recNumberPh: "e.g. 06", recNote: "Content note (required)", recFiles: "Files (PDF / photos)", recFilesChosen: "file(s) chosen", recFieldType: "Site record", recMeetingType: "Meeting minutes", recDirectiveType: "Site directive", recSaving: "Saving...", confirmDeleteRecord: "Delete this record (with its files)?", saveFailed: "Save failed.",
    dependencies: "Dependencies", waitingOn: "Waiting on", blocking: "Blocking",
    addDependency: "Add a prerequisite task", dependsHint: "This task should start after its “waiting on” tasks are done.",
    blocked: "Blocked", noDeps: "No dependencies.",
    assignedAt: "Assigned at", completedAt: "Completed at", createdAtLabel: "Created at", notCompleted: "Not completed", timeTracking: "Time tracking",
    download: "Download report", downloadReport: "Download report (HTML)", downloadAll: "All projects", reportFor: "Report",
    generatedAt: "Generated at",
    chartStatus: "Task status", chartByProject: "Tasks by project", chartByAssignee: "By assignee",
    chartByDept: "By department", statusDone: "Done", statusActive: "Active", statusOverdue: "Overdue",
    viewProjectLabel: "View project", allProjectsLabel: "All projects", realtimeNote: "Updates in real time",
    useTemplate: "Project template (optional)", templateNone: "Empty — no template",
    templateHint: "Copy columns & tasks from an existing project (does NOT copy assignments, progress, comments).",
    financeProject: "Project", financeAllProjects: "All projects", financeNoProject: "No project",
    // BOQ – quantities – cost
    finTabBoq: "BOQ & Quantities", boqCode: "Code", boqName: "Work item", boqUnit: "Unit",
    boqQty: "Contract qty", boqPrice: "Unit price", boqAmount: "Amount", boqDoneQty: "Done qty",
    boqDoneVal: "Executed value", boqPercent: "%Qty", boqLinkTasks: "Linked tasks",
    boqAddItem: "Add item", boqImport: "Import from Excel (CSV)",
    boqImportHint: "Paste columns in order: Code, Work item, Unit, Quantity, Unit price — a header row is OK. Accepts VN (1.234,56) and EN (1,234.56) number formats.",
    boqImportDo: "Import to BOQ", boqSumValue: "BOQ value", boqSumDone: "Executed", boqSumLeft: "Remaining", boqSumPct: "% of value",
    boqSuggest: "Fill qty from linked tasks' progress", boqEmpty: "No BOQ items for this project yet.",
    boqEmptyAll: "No BOQ yet. Pick a project above to start.", boqPickProject: "Pick a project above to enter / edit the detailed BOQ.",
    boqVsContract: "Investor contract value", boqDelta: "BOQ − contract delta", boqDeleteConfirm: "Delete this item?", boqCount: "items",
    contract: "Contract", appendix: "Appendix", kindLabel: "Type", contractItems: "items",
    contractValue: "Contract value", contractCode: "Contract no. / name",
    parentContract: "Belongs to", none: "—", notLinked: "Not linked",
    linkedInvestorContract: "Under investor contract",
    billedSent: "Payment requests sent", investorPaid: "Investor has paid",
    subPaid: "Paid to subcontractor",
    supplierName: "Subcontractor / supplier name",
    addContract: "Add contract", addSubContract: "Add subcontractor contract",
    addInstallment: "Add installment", installmentDate: "Date", installmentAmount: "Amount",
    total: "Total", remaining: "Remaining", received: "Received", paidOut: "Paid",
    sumInvValue: "Investor contract value", sumBilled: "Billed", sumReceived: "Received",
    sumToCollect: "To collect", sumSubValue: "Sub contract value", sumSubPaid: "Paid to subs",
    sumToPay: "To pay subs",
    noInvContracts: "No investor contracts yet.", noSubContracts: "No subcontractor / supplier contracts yet.",
    valuePlaceholder: "Amount (₫)", deleteContractConfirm: "Delete this contract and its installments?",
    addEntry: "Add", category: "Category", note: "Note", notePlaceholder: "Note (optional)",
    joinAs: "Join as this person", orCreate: "Or register a new person",
    yourName: "Full name", join: "Join", switchUser: "Switch user",
    assignees: "Assignees", primary: "Primary", setPrimary: "Set as primary",
    workdone: "Work done", workdoneShort: "Done",
    workdoneHint: "Only the primary assignee updates this percentage.",
    noAssignees: "Not assigned yet.",
    reminder: "Email reminder", reminderSet: "Remind before due",
    remindBefore: "Remind before deadline", noReminder: "Off", save: "Save",
    unitHour: "hours", unitDay: "days", reminderOnServer: "Emails are only sent by the server build (NAS/LAN) once the sending email is configured.",
    comments: "Comments", noComments: "No comments yet.",
    writeComment: "Write a comment...", postComment: "Post",
    justNow: "just now",
    minAgo: (n) => `${n}m ago`, hrAgo: (n) => `${n}h ago`, dayAgo: (n) => `${n}d ago`,
    collaborate: "Collaborate", invite: "Invite others",
    synced: "Synced", syncNow: "Sync now", syncing: "Syncing...",
    offline: "Can't save — running in temporary mode.",
    howToConnect: "How to connect multiple people",
    connectSteps: [
      "Click the app's Share button (top corner) for a link, or use the NAS/LAN server build.",
      "Send the link/address to teammates. On open, they register with name and email.",
      "Every change syncs automatically every few seconds.",
      "The Owner opens “Manage members” to set each person as Manager or Employee.",
    ],
    connectNote: "Roles are a cooperative UI convention. Data syncs last-write-wins, so avoid two people editing the same task at once.",
    close: "Close", activeMembers: "members",
    history: "Change history", noHistory: "No changes recorded yet.",
    historyLocked: "You don't have access to the change history.",
    canViewHistory: "View history", allProjects: "All projects", inProject: "in",
    field: { title: "Title", description: "Description", priority: "Priority", dueDate: "Due date", assignee: "Assignee", section: "Column", tags: "Tags", subtasks: "Subtasks" },
    act: {
      task_create: "created task", task_delete: "deleted task",
      task_complete: "completed", task_reopen: "reopened",
      task_field: "changed", comment_add: "commented on",
      section_add: "added column", project_create: "created project", project_delete: "deleted project",
      member_add: "added member", member_remove: "removed member",
      member_role: "changed role of", member_cap: "changed capability of", history_grant: "granted history access to", history_revoke: "revoked history access from",
      task_assign: "assigned", task_workdone: "updated progress on", task_reminder: "set a reminder for",
    },
    emptyVal: "(empty)",
  },
};

/* --------------------------- constants -------------------------- */
const PRIORITY_META = {
  urgent: { color: "#ef4444", bg: "#fef2f2", ring: "#fecaca" },
  high:   { color: "#f97316", bg: "#fff7ed", ring: "#fed7aa" },
  medium: { color: "#3b82f6", bg: "#eff6ff", ring: "#bfdbfe" },
  low:    { color: "#64748b", bg: "#f8fafc", ring: "#e2e8f0" },
};
const PRIORITY_ORDER = ["urgent", "high", "medium", "low"];
const STATUS_ORDER = ["todo", "doing", "review", "onhold", "done"];
const PROJECT_COLORS = ["#3b82f6","#ec4899","#f59e0b","#10b981","#0ea5e9","#8b5cf6","#ef4444","#14b8a6"];
const AVATAR_COLORS = ["#3b82f6","#ec4899","#f59e0b","#10b981","#0ea5e9","#8b5cf6","#ef4444","#14b8a6","#f43f5e","#84cc16"];
const TAG_PALETTE = [["#ede9fe","#6d28d9"],["#e0f2fe","#0369a1"],["#dcfce7","#15803d"],["#fef3c7","#b45309"],["#fce7f3","#be185d"],["#e0e7ff","#4338ca"],["#ccfbf1","#0f766e"],["#ffedd5","#c2410c"]];
function tagStyle(s) { let h = 0; for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; const c = TAG_PALETTE[h % TAG_PALETTE.length]; return { background: c[0], color: c[1] }; }
const ROLE_META = {
  owner:  { color: "#d97706", bg: "#fffbeb", icon: Crown },
  member: { color: "#f97316", bg: "#fff7ed", icon: UserCheck },
};
const DEPTS = ["QS", "Coordinator", "Design", "Site", "Accountant", "Lead"];
const FEATURE_LIST = [
  { key: "finance", vi: "Chi phí (hợp đồng, dòng tiền)", en: "Finance (contracts, cashflow)" },
  { key: "dailyReport", vi: "Báo cáo ngày", en: "Daily reports" },
  { key: "workload", vi: "Khối lượng", en: "Workload" },
  { key: "sitelog", vi: "Nhật ký thi công", en: "Site logs" },
  { key: "records", vi: "Biên bản", en: "Records / minutes" },
  { key: "history", vi: "Lịch sử thay đổi", en: "Change history" },
  { key: "notifications", vi: "Nhắc nhở & Email", en: "Reminders & Email" },
  { key: "viewBoard", vi: "Xem dạng Bảng (Kanban)", en: "Board (Kanban) view" },
  { key: "viewCalendar", vi: "Xem dạng Lịch", en: "Calendar view" },
  { key: "viewTimeline", vi: "Xem dạng Timeline", en: "Timeline view" },
];
const FEATURE_ALL_ON = FEATURE_LIST.reduce((o, f) => { o[f.key] = true; return o; }, {});
const FEATURE_PRESETS = {
  full: { ...FEATURE_ALL_ON },
  task: { ...FEATURE_ALL_ON, finance: false, dailyReport: false, workload: false, sitelog: false, records: false },
  design: { ...FEATURE_ALL_ON, sitelog: false, records: false },
};
const BLANK_CAPS = { canAssign: false, canViewFinance: false, canViewHistory: false, canViewWorkload: false, canManageMembers: false, isLeader: false, isTeamlead: false, noReport: false, position: "" };
const POSITION_PRESETS = {
  leader:   { position: "leader",   isLeader: true,  noReport: true,  canViewFinance: true, canViewWorkload: true, canViewHistory: true },
  deputy:   { position: "deputy",   isLeader: true,  canAssign: true, canViewFinance: true, canViewWorkload: true, canViewHistory: true },
  teamlead: { position: "teamlead", isTeamlead: true, canAssign: true, canViewWorkload: true },
  staff:    { position: "" },
};
const DEPT_META = {
  QS:          { abbr: "QS", color: "#0891b2" },
  Coordinator: { abbr: "CO", color: "#7c3aed" },
  Design:      { abbr: "DS", color: "#db2777" },
  Site:        { abbr: "ST", color: "#ea580c" },
  Accountant:  { abbr: "AC", color: "#059669" },
  Lead:        { abbr: "LĐ", color: "#d97706" },
};
const SHARED_KEY = "pm_shared_v3";
const IDENTITY_KEY = "pm_identity_v3";

/* ---------------------------- helpers --------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10);
function parseCSV(text) {
  text = String(text || "").replace(/^\uFEFF/, "");
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else { if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; } else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; } else if (c === "\r") {} else cur += c; }
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}
function normDateCell(v) { const w = String(v || "").trim(); let m; if ((m = w.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return m[1] + "-" + String(m[2]).padStart(2, "0") + "-" + String(m[3]).padStart(2, "0"); if ((m = w.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/))) return m[3] + "-" + String(m[2]).padStart(2, "0") + "-" + String(m[1]).padStart(2, "0"); return ""; }
const today0 = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || "").trim());

function avatarColor(name) {
  if (!name) return "#94a3b8";
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function dueMeta(iso, lang) {
  if (!iso) return null;
  const t = T[lang];
  const d = new Date(iso + "T00:00:00");
  const diff = Math.round((d - today0()) / 86400000);
  let label, overdue = false;
  if (diff < 0) { overdue = true; label = t.overdue; }
  else if (diff === 0) label = t.today;
  else if (diff === 1) label = t.tomorrow;
  else label = `${d.getDate()}/${d.getMonth() + 1}`;
  return { label, overdue, soon: diff >= 0 && diff <= 2 };
}
function relTime(ts, lang) {
  const t = T[lang]; const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return t.justNow;
  const m = Math.floor(s / 60); if (m < 60) return t.minAgo(m);
  const h = Math.floor(m / 60); if (h < 24) return t.hrAgo(h);
  return t.dayAgo(Math.floor(h / 24));
}
// reminder lead helpers
function leadToText(min, t) {
  if (!min) return t.noReminder;
  if (min % 1440 === 0) return `${min / 1440} ${t.unitDay}`;
  if (min % 60 === 0) return `${min / 60} ${t.unitHour}`;
  return `${min} min`;
}
function fmtMoney(n, lang) {
  const v = Number(n) || 0;
  try { return new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US").format(v) + " ₫"; }
  catch { return v + " ₫"; }
}
function normalizeFinance(f) {
  f = f || {};
  return { investorContracts: Array.isArray(f.investorContracts) ? f.investorContracts : [],
    subContracts: Array.isArray(f.subContracts) ? f.subContracts : [],
    boq: (f.boq && typeof f.boq === "object" && !Array.isArray(f.boq)) ? f.boq : {} }; // { projectId: [hạng mục] }
}
const sumItems = (arr) => (arr || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
// money input grouping (vi uses '.', en uses ',')
function groupDigits(str, lang) {
  const neg = String(str).trim().startsWith("-");
  const digits = String(str).replace(/[^\d]/g, "");
  if (!digits) return neg ? "-" : "";
  const sep = lang === "vi" ? "." : ",";
  return (neg ? "-" : "") + digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}
// date helpers

/* -------------------------- seed data --------------------------- */
function seed(lang) {
  const ds = T[lang].defaultSections;
  const pid = uid();
  const s = ds.map((name, i) => ({ id: uid(), projectId: pid, name, order: i }));
  const members = lang === "vi"
    ? [
        { id: uid(), name: "Khương", email: "khuong@congty.com", role: "owner", dept: "Lead", canAssign: true, canViewHistory: true, canViewFinance: true, canViewWorkload: true },
        { id: uid(), name: "Minh", email: "minh@congty.com", role: "member", dept: "Coordinator", canAssign: true, canViewHistory: false, canViewFinance: false, canViewWorkload: true },
        { id: uid(), name: "Lan", email: "lan@congty.com", role: "member", dept: "Design", canAssign: false, canViewHistory: false, canViewFinance: false, canViewWorkload: false },
      ]
    : [
        { id: uid(), name: "Alex", email: "alex@company.com", role: "owner", dept: "Lead", canAssign: true, canViewHistory: true, canViewFinance: true, canViewWorkload: true },
        { id: uid(), name: "Sam", email: "sam@company.com", role: "member", dept: "Coordinator", canAssign: true, canViewHistory: false, canViewFinance: false, canViewWorkload: true },
        { id: uid(), name: "Lee", email: "lee@company.com", role: "member", dept: "Design", canAssign: false, canViewHistory: false, canViewFinance: false, canViewWorkload: false },
      ];
  const samples = lang === "vi"
    ? [
        ["Khảo sát hiện trạng & đo đạc khu đất", "Đo đạc lô đất 5×20m.", "high", 0, 0, ["khảo sát"], 100, 2],
        ["Phác thảo mặt bằng tầng trệt", "Bố trí phòng khách, bếp, vệ sinh, giếng trời.", "urgent", 0, 1, ["thiết kế"], 60, 1],
        ["Vẽ mặt đứng & mặt cắt", "Hoàn thiện bộ bản vẽ kỹ thuật.", "high", 1, 1, ["bản vẽ"], 30, 1],
        ["Lập bảng thống kê cửa", "Bảng thống kê cửa đi và cửa sổ.", "medium", 2, 2, ["hồ sơ"], 0, 2],
        ["Xuất bộ bản vẽ 4 khổ A1", "Gộp thành file DXF trình bày chuẩn.", "low", 0, 2, ["bàn giao"], 0, 1],
      ]
    : [
        ["Site survey & land measurement", "Measure the 5×20m plot.", "high", 0, 0, ["survey"], 100, 2],
        ["Draft ground floor plan", "Living room, kitchen, bathroom, skylight.", "urgent", 0, 1, ["design"], 60, 1],
        ["Draw elevations & sections", "Finish the technical drawing set.", "high", 1, 1, ["drawing"], 30, 1],
        ["Build door & window schedule", "Schedule for all doors and windows.", "medium", 2, 2, ["docs"], 0, 2],
        ["Export 4-sheet A1 set", "Consolidate into a standard DXF file.", "low", 0, 2, ["handover"], 0, 1],
      ];
  const tasks = samples.map(([title, description, priority, mi, si, tags, workdone, leadDays], i) => {
    const due = new Date(); due.setDate(due.getDate() + (i * 2 - 1));
    const primary = members[mi].id;
    const assignees = mi === 1 ? [members[1].id, members[2].id] : [members[mi].id];
    return {
      id: uid(), projectId: pid, sectionId: s[si].id, title, description,
      priority, assignees, primaryAssigneeId: primary, workdone,
      tags, completed: workdone >= 100, subtasks: [], comments: [],
      dueDate: due.toISOString().slice(0, 10), reminderLead: leadDays ? leadDays * 1440 : null,
      reminderSentKey: "", createdAt: Date.now() + i, order: i,
    };
  });
  return {
    projects: [{ id: pid, name: lang === "vi" ? "Thiết kế nhà phố 5×20m" : "Townhouse design 5×20m", color: PROJECT_COLORS[0] }],
    sections: s, tasks, members,
    history: [{ id: uid(), ts: Date.now(), actor: members[0].name, action: "project_create", projectId: pid, projectName: lang === "vi" ? "Thiết kế nhà phố 5×20m" : "Townhouse design 5×20m" }],
    rev: 1,
  };
}

// normalize a task possibly coming from older versions
function normalizeTask(x, members) {
  let assignees = Array.isArray(x.assignees) ? x.assignees : null;
  let primary = x.primaryAssigneeId || null;
  if (!assignees) {
    if (x.assignee && members) { const m = members.find((mm) => mm.name === x.assignee); assignees = m ? [m.id] : []; primary = m ? m.id : null; }
    else assignees = [];
  }
  if (!primary && assignees.length) primary = assignees[0];
  const workdone = typeof x.workdone === "number" ? x.workdone : (x.completed ? 100 : 0);
  return {
    subtasks: [], comments: [], tags: [], ...x,
    assignees, primaryAssigneeId: primary, workdone,
    reminderLead: x.reminderLead ?? null, reminderSentKey: x.reminderSentKey || "", recur: x.recur || "none", recurSpawned: !!x.recurSpawned,
    startDate: x.startDate || "", duration: x.duration || null,
    status: (STATUS_ORDER.includes(x.status) ? x.status : ((x.completed || workdone >= 100) ? "done" : (workdone > 0 ? "doing" : "todo"))),
    approver: x.approver === "leader" ? "leader" : "teamlead",
    dependsOn: Array.isArray(x.dependsOn) ? x.dependsOn : [],
    assignedAt: x.assignedAt || null, completedAt: x.completedAt || null,
    completed: (STATUS_ORDER.includes(x.status) ? x.status : ((x.completed || workdone >= 100) ? "done" : (workdone > 0 ? "doing" : "todo"))) === "done",
  };
}
function normMember(m) {
  const role = m.role === "owner" ? "owner" : "member";
  let canAssign = m.canAssign;
  if (canAssign === undefined) canAssign = (m.role === "owner" || m.role === "manager" || m.role === "editor");
  return { dept: "", email: "", ...m, role,
    canAssign: role === "owner" ? true : !!canAssign,
    canViewHistory: role === "owner" ? true : !!m.canViewHistory,
    canViewFinance: role === "owner" ? true : !!m.canViewFinance,
    canViewWorkload: role === "owner" ? true : !!m.canViewWorkload,
    canManageMembers: role === "owner" ? true : !!m.canManageMembers };
}

/* ---- server auth helpers (inert in Claude artifact / demo mode) ---- */
function getToken() { try { return localStorage.getItem("pm_token"); } catch { return null; } }
function setToken(v) { try { v ? localStorage.setItem("pm_token", v) : localStorage.removeItem("pm_token"); } catch {} }
async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const tok = getToken(); if (tok) headers["Authorization"] = "Bearer " + tok;
  try {
    const r = await fetch(path, { ...opts, headers });
    let body = null; try { body = await r.json(); } catch {}
    return { ok: r.ok, status: r.status, body };
  } catch { return { ok: false, status: 0, body: null }; }
}
// server fresh seed: projects/sections/tasks (no member binding), no members
function seedServer(lang) {
  const base = seed(lang);
  return { projects: base.projects, sections: base.sections,
    tasks: base.tasks.map((tk) => ({ ...tk, assignees: [], primaryAssigneeId: null, workdone: 0, completed: false, reminderLead: null })),
    history: [], dailyReports: [], rev: 1 };
}

/* ===================================================================
   MAIN
=================================================================== */
const AUTHOR_CREDIT = "Phần mềm do Khuong Doan phát triển — © 2026";

const ANTD_THEME = { token: { colorPrimary: "#f97316", colorInfo: "#f97316", colorLink: "#ea580c", colorPrimaryHover: "#fb923c", borderRadius: 10, fontFamily: "inherit", controlHeight: 38 }, components: { Button: { fontWeight: 500, primaryShadow: "none" } } };
export default function ProjectManager() {
  return <ConfigProvider theme={ANTD_THEME}><AntApp><ProjectManagerInner /></AntApp></ConfigProvider>;
}
function ProjectManagerInner() {
  const { message: antMessage } = AntApp.useApp();
  const [lang, setLang] = useState("vi");
  const t = T[lang];

  const [projects, setProjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [finance, setFinance] = useState({ investorContracts: [], subContracts: [] });
  const [dailyReports, setDailyReports] = useState([]);
  const [trash, setTrash] = useState([]);
  const [undoInfo, setUndoInfo] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState(() => { try { return Number(localStorage.getItem("pm_notif_seen")) || 0; } catch (e) { return 0; } });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState("");

  const [activeProject, setActiveProject] = useState(() => { try { return localStorage.getItem("pm_nav_project") || "dashboard"; } catch (e) { return "dashboard"; } });
  const [view, setView] = useState(() => { try { return localStorage.getItem("pm_nav_view") || "list"; } catch (e) { return "list"; } });
  useEffect(() => { try { localStorage.setItem("pm_nav_project", activeProject); localStorage.setItem("pm_nav_view", view); } catch (e) {} }, [activeProject, view]);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [detailTask, setDetailTask] = useState(null);
  const [modal, setModal] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [license, setLicense] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [storageOK, setStorageOK] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // server auth
  const [serverMode, setServerMode] = useState(false);
  const [features, setFeatures] = useState({});
  const [appVersion, setAppVersion] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  const localRev = useRef(0);
  const suppressSave = useRef(false);
  // Chuỗi JSON của lần lưu/đồng bộ gần nhất — dùng để bỏ qua các lần "lưu" không có thay đổi thực
  // (tránh bơm rev mới vô cớ làm người khác bị báo "conflict" và mất thao tác oan).
  const lastSavedRef = useRef("");
  const buildCore = (o, includeLocal) => {
    const core = { projects: o.projects, sections: o.sections, tasks: o.tasks, history: o.history, dailyReports: o.dailyReports, trash: o.trash };
    if (includeLocal) { core.members = o.members; core.finance = o.finance; }
    return JSON.stringify(core);
  };

  const applyState = (s, keepMembers) => {
    const mem = keepMembers ? null : (s.members || []).map(normMember);
    const normTasks = (s.tasks || []).map((x) => normalizeTask(x, mem || members));
    const fin = keepMembers ? null : normalizeFinance(s.finance);
    setProjects(s.projects || []); setSections(s.sections || []);
    setTasks(normTasks);
    if (!keepMembers) setMembers(mem);
    if (!keepMembers) setFinance(fin);
    lastSavedRef.current = buildCore({ projects: s.projects || [], sections: s.sections || [], tasks: normTasks, history: s.history || [], dailyReports: s.dailyReports || [], trash: s.trash || [], members: mem, finance: fin }, !keepMembers);
    setHistory(s.history || []); setDailyReports(s.dailyReports || []); setTrash(s.trash || []); localRev.current = s.rev || 0;
    const SPECIAL = ["dashboard", "mywork", "dailyreport", "history", "finance", "workload", "search"];
    setActiveProject((cur) => (SPECIAL.includes(cur) || (s.projects || []).some((x) => x.id === cur)) ? cur : ((s.projects && s.projects[0] && s.projects[0].id) || "dashboard"));
  };

  const refreshAccounts = async () => {
    const a = await api("/api/accounts");
    if (a.ok) setMembers((a.body.accounts || []).map(normMember));
  };

  const refreshLicense = async () => { const r = await api("/api/license"); if (r.ok) setLicense(r.body); return r.body; };
  const activateLicense = async (code) => {
    const r = await api("/api/license/activate", { method: "POST", body: JSON.stringify({ code }) });
    if (r.ok) setLicense((prev) => ({ ...(prev || {}), expiry: r.body.expiry, daysLeft: r.body.daysLeft, readOnly: false }));
    return r;
  };

  const afterLogin = async (user) => {
    setAuthUser(user); setCurrentUserId(user.id);
    const a = await api("/api/accounts");
    const accts = (a.body?.accounts || []).map(normMember);
    setMembers(accts);
    refreshLicense();
    if (user.role === "owner" || user.canViewFinance) {
      const f = await api("/api/finance"); if (f.ok) setFinance(normalizeFinance(f.body));
    } else setFinance({ investorContracts: [], subContracts: [] });
    let state = null;
    try { const r = await window.storage.get(SHARED_KEY, true); if (r?.value) state = JSON.parse(r.value); } catch {}
    if (!state) { state = seedServer("vi"); try { await window.storage.set(SHARED_KEY, JSON.stringify(state), true); } catch {} }
    applyState(state, true);
    setAuthReady(true); setLoaded(true); setLastSync(Date.now());
  };

  const doSetup = async (name, email, password, code) => {
    setAuthError("");
    const r = await api("/api/setup", { method: "POST", body: JSON.stringify({ name, email, password, code }) });
    if (r.ok) { setToken(r.body.token); setNeedsSetup(false); await afterLogin(r.body.user); }
    else setAuthError((r.body && r.body.message) || t.setupFailed);
  };
  const doLogin = async (email, password) => {
    setAuthError("");
    const r = await api("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (r.ok) { setToken(r.body.token); await afterLogin(r.body.user); }
    else setAuthError((r.body && r.body.message) || t.wrongLogin);
  };
  const doLogout = async () => {
    try { await api("/api/logout", { method: "POST" }); } catch {}
    setToken(null); setAuthUser(null); setCurrentUserId(null); setAuthReady(true);
    setProjects([]); setSections([]); setTasks([]); setHistory([]); setActiveProject("dashboard");
  };
  const changeOwnPassword = async (oldPassword, newPassword) => {
    const r = await api("/api/password", { method: "POST", body: JSON.stringify({ oldPassword, newPassword }) });
    return r.ok;
  };

  /* load: detect server mode, otherwise demo */
  useEffect(() => {
    (async () => {
      const c = await api("/api/config");
      if (c.ok && c.body && c.body.serverMode) {
        setServerMode(true);
        if (c.body.features) setFeatures(c.body.features);
        if (c.body.version) setAppVersion(c.body.version);
        if (!c.body.hasAccounts) { setNeedsSetup(true); setAuthReady(true); setLoaded(true); return; }
        const tok = getToken();
        if (tok) { const m = await api("/api/me"); if (m.ok) { await afterLogin(m.body.user); return; } setToken(null); }
        setAuthReady(true); setLoaded(true); // show login
        return;
      }
      // ---- demo mode (Claude artifact / no server) ----
      if (!window.storage) { applyState(seed("vi")); setStorageOK(false); setLoaded(true); return; }
      let myId = null;
      try { const r = await window.storage.get(IDENTITY_KEY, false); if (r?.value) myId = r.value; } catch {}
      let state = null;
      try { const r = await window.storage.get(SHARED_KEY, true); if (r?.value) state = JSON.parse(r.value); } catch {}
      if (!state) { try { const r = await window.storage.get("pm_shared_v2", true); if (r?.value) state = JSON.parse(r.value); } catch {} }
      let fresh = false;
      if (!state) { state = seed("vi"); fresh = true; }
      applyState(state);
      if (fresh) {
        const owner = state.members.find((m) => m.role === "owner");
        myId = owner?.id || null;
        try { await window.storage.set(IDENTITY_KEY, myId, false); } catch {}
        try { await window.storage.set(SHARED_KEY, JSON.stringify(state), true); } catch {}
      }
      setCurrentUserId(myId);
      if (!myId || !(state.members || []).some((m) => m.id === myId)) setModal("identity");
      setLastSync(Date.now()); setLoaded(true);
    })();
  }, []);

  /* save */
  useEffect(() => {
    if (!loaded || !storageOK) return;
    if (license && license.readOnly) return; // giấy phép hết hạn -> chỉ đọc, ngừng đồng bộ
    if (suppressSave.current) { suppressSave.current = false; return; }
    const id = setTimeout(() => {
      const coreStr = buildCore({ projects, sections, tasks, history, dailyReports, trash, members, finance }, !serverMode);
      if (coreStr === lastSavedRef.current) return; // không có thay đổi thực (vd chỉ refresh danh sách thành viên) -> không bơm rev mới
      const rev = localRev.current + 1; localRev.current = rev;
      lastSavedRef.current = coreStr;
      const meNow = members.find((m) => m.id === currentUserId);
      const payload = { projects, sections, tasks, history, dailyReports, trash, rev, updatedBy: meNow?.name || "", updatedAt: Date.now() };
      if (!serverMode) { payload.members = members; payload.finance = finance; }
      window.storage.set(SHARED_KEY, JSON.stringify(payload), true)
        .then((resKv) => {
          if (resKv === "conflict") { pullRemote(true); antMessage.warning(lang === "vi" ? "Có người khác vừa cập nhật — đã tải lại dữ liệu mới, vui lòng thao tác lại." : "Someone else just updated — reloaded latest data, please redo."); }
          else if (resKv && typeof resKv === "object" && resKv.error) { pullRemote(true); antMessage.error(resKv.error); } // máy chủ từ chối (vượt quyền / hết hạn giấy phép) -> tải lại dữ liệu đúng
          else setLastSync(Date.now());
        })
        .catch(() => setStorageOK(false));
    }, 500);
    return () => clearTimeout(id);
  }, [projects, sections, tasks, members, history, finance, dailyReports, trash]); // eslint-disable-line

  /* finance: server mode persists separately (gated endpoint) */
  const financeReady = useRef(false);
  useEffect(() => {
    if (!loaded || !serverMode || !canFinance) return;
    if (!financeReady.current) { financeReady.current = true; return; }
    const id = setTimeout(() => { api("/api/finance", { method: "POST", body: JSON.stringify(finance) }); }, 600);
    return () => clearTimeout(id);
  }, [finance]); // eslint-disable-line

  /* poll */
  const pullRemote = async (force) => {
    if (!storageOK || !window.storage) return;
    try {
      // Poll nhẹ: hỏi rev trước, chỉ tải cả khối dữ liệu khi có bản mới (giảm hẳn băng thông với NAS)
      if (serverMode && !force) {
        const rv = await api("/api/kv/rev");
        if (rv.ok && typeof rv.body?.rev === "number" && rv.body.rev <= localRev.current) { setLastSync(Date.now()); return; }
      }
      const r = await window.storage.get(SHARED_KEY, true);
      if (r?.value) {
        const remote = JSON.parse(r.value);
        if (force || (remote.rev || 0) > localRev.current) {
          suppressSave.current = true; localRev.current = remote.rev;
          setProjects(remote.projects || []); setSections(remote.sections || []);
          let normTasks, mem = members, fin = finance;
          if (serverMode) {
            normTasks = (remote.tasks || []).map((x) => normalizeTask(x, members));
            setTasks(normTasks);
          } else {
            mem = (remote.members || []).map(normMember);
            fin = normalizeFinance(remote.finance);
            normTasks = (remote.tasks || []).map((x) => normalizeTask(x, mem));
            setTasks(normTasks);
            setMembers(mem); setFinance(fin);
          }
          lastSavedRef.current = buildCore({ projects: remote.projects || [], sections: remote.sections || [], tasks: normTasks, history: remote.history || [], dailyReports: remote.dailyReports || [], trash: remote.trash || [], members: mem, finance: fin }, !serverMode);
          setDailyReports(remote.dailyReports || []); setHistory(remote.history || []); setTrash(remote.trash || []); setLastSync(Date.now());
        }
      }
    } catch {}
  };
  useEffect(() => {
    if (!loaded || !storageOK) return;
    if (serverMode && !authUser) return; // chưa đăng nhập thì không poll (tránh spam 401 lên máy chủ)
    const iv = setInterval(pullRemote, 4000);
    return () => clearInterval(iv);
  }, [loaded, storageOK, serverMode, authUser]); // eslint-disable-line
  const syncNow = async () => { setSyncing(true); await pullRemote(); setTimeout(() => setSyncing(false), 400); };

  /* identity / permissions */
  const memberById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);
  const me = members.find((m) => m.id === currentUserId);
  const effRole = (m) => (m && ownerEmail && (m.email || "").toLowerCase() === ownerEmail) ? "owner" : (m?.role === "owner" ? "owner" : "member");
  const myRole = effRole(me);
  const canEdit = myRole === "owner" || !!me?.canAssign;             // create/edit/assign tasks
  const myWorkCount = tasks.filter((x) => (x.assignees || []).includes(currentUserId) && (x.status === "todo" || x.status === "doing")).length
    + tasks.filter((x) => x.status === "review" && (myRole === "owner" || (x.approver === "leader" ? !!me?.isLeader : !!me?.isTeamlead))).length;
  const assignAllTeams = myRole === "owner" || !!me?.isLeader;
  const assignableIds = new Set((assignAllTeams ? members : members.filter((m) => me && (m.dept || "") === (me.dept || ""))).map((m) => m.id));
  const canManageMembers = myRole === "owner" || !!me?.canManageMembers; // view Members + assign permissions
  const canManage = myRole === "owner";                              // settings (owner only)
  const feat = (k) => features[k] !== false;
  const canViewHistory = (myRole === "owner" || !!me?.canViewHistory) && feat("history");
  const canFinance = (myRole === "owner" || !!me?.canViewFinance) && feat("finance");
  const canViewWorkload = (myRole === "owner" || !!me?.canViewWorkload) && feat("workload");
  const viewAllowed = (v) => v === "board" ? feat("viewBoard") : v === "calendar" ? feat("viewCalendar") : v === "timeline" ? feat("viewTimeline") : v === "construction" ? (feat("sitelog") || feat("records")) : true;
  useEffect(() => { if (!viewAllowed(view)) setView("list"); }, [features, view]); // eslint-disable-line
  const canWorkdone = (task) => canEdit || (me && task.primaryAssigneeId === me.id);
  const workMembers = useMemo(() => members.filter((m) => effRole(m) !== "owner"), [members, ownerEmail]); // owner is admin, not a worker

  const projName = (pid) => projects.find((p) => p.id === pid)?.name || "";
  const secName = (sid) => sections.find((s) => s.id === sid)?.name || "";
  const memName = (id) => memberById[id]?.name || "";

  const setIdentity = async (id) => {
    setCurrentUserId(id);
    try { await window.storage?.set(IDENTITY_KEY, id, false); } catch {}
    setModal(null);
  };
  const createAndJoin = (name, email) => {
    if (!name.trim() || !isEmail(email)) return;
    const existing = members.find((m) => (m.email || "").toLowerCase() === email.trim().toLowerCase());
    if (existing) { setIdentity(existing.id); return; }
    const isOwner = members.length === 0 || (ownerEmail && email.trim().toLowerCase() === ownerEmail);
    const m = { id: uid(), name: name.trim(), email: email.trim(), role: isOwner ? "owner" : "member", canAssign: !!isOwner, canViewHistory: !!isOwner, canViewFinance: !!isOwner };
    setMembers((p) => [...p, m]); log({ action: "member_add", to: name.trim() }); setIdentity(m.id);
  };

  /* logging */
  const log = (entry) => {
    if (!me) return;
    setHistory((prev) => {
      const top = prev[0];
      if (entry.action === "task_field" && top && top.action === "task_field" && top.actor === me.name &&
          top.taskId === entry.taskId && top.field === entry.field && Date.now() - top.ts < 120000) {
        return [{ ...top, to: entry.to, toKey: entry.toKey, ts: Date.now(), taskTitle: entry.taskTitle ?? top.taskTitle }, ...prev.slice(1)];
      }
      return [{ id: uid(), ts: Date.now(), actor: me.name, ...entry }, ...prev].slice(0, 500);
    });
  };

  const deleteHistoryEntry = (id) => { if (myRole !== "owner") return; setHistory((p) => p.filter((e) => e.id !== id)); };

  /* mutations */
  const logPatch = (before, patch) => {
    const base = { projectId: before.projectId, projectName: projName(before.projectId), taskId: before.id, taskTitle: before.title };
    for (const k of Object.keys(patch)) {
      if (k === "completed" && patch.completed !== before.completed) log({ ...base, action: patch.completed ? "task_complete" : "task_reopen" });
      else if (k === "sectionId" && patch.sectionId !== before.sectionId) log({ ...base, action: "task_field", field: "section", from: secName(before.sectionId), to: secName(patch.sectionId) });
      else if (k === "priority" && patch.priority !== before.priority) log({ ...base, action: "task_field", field: "priority", fromKey: before.priority, toKey: patch.priority });
      else if (k === "dueDate" && patch.dueDate !== before.dueDate) log({ ...base, action: "task_field", field: "dueDate", from: before.dueDate, to: patch.dueDate });
      else if (k === "title" && patch.title !== before.title) log({ ...base, taskTitle: patch.title, action: "task_field", field: "title", from: before.title, to: patch.title });
      else if (k === "description" && patch.description !== before.description) log({ ...base, action: "task_field", field: "description" });
      else if (k === "tags") log({ ...base, action: "task_field", field: "tags" });
      else if (k === "subtasks") log({ ...base, action: "task_field", field: "subtasks" });
    }
  };
  const patchTask = (id, patch) => {
    if (!canEdit) return;
    const before = tasks.find((x) => x.id === id);
    setTasks((p) => p.map((x) => {
      if (x.id !== id) return x;
      const next = { ...x, ...patch };
      if (patch.completed === true && !x.completed) next.completedAt = Date.now();
      if (patch.completed === false && x.completed) next.completedAt = null;
      return next;
    }));
    if (before) logPatch(before, patch);
  };
  const deptHasTeamlead = (dept) => members.some((m) => m.isTeamlead && (m.dept || "") === (dept || ""));
  const setAssign = (id, assignees, primaryId) => {
    if (!canEdit) return;
    const prim = assignees.includes(primaryId) ? primaryId : (assignees[0] || null);
    const tk = tasks.find((x) => x.id === id);
    setTasks((p) => p.map((x) => {
      if (x.id !== id) return x;
      const nx = { ...x, assignees, primaryAssigneeId: prim, assignedAt: x.assignedAt || (assignees.length ? Date.now() : null) };
      if (!x.primaryAssigneeId && prim) { const pm = memberById[prim]; nx.approver = (pm && deptHasTeamlead(pm.dept)) ? "teamlead" : "leader"; }
      return nx;
    }));
    if (tk) log({ action: "task_assign", projectId: tk.projectId, projectName: projName(tk.projectId), taskId: id, taskTitle: tk.title, to: assignees.map(memName).join(", ") || t.unassigned, primaryName: memName(prim) });
  };
  const setWorkdone = (id, val) => {
    const tk = tasks.find((x) => x.id === id); if (!tk || !canWorkdone(tk)) return;
    const v = Math.max(0, Math.min(100, Math.round(val)));
    setTasks((p) => p.map((x) => {
      if (x.id !== id) return x;
      let status = x.status, completed = x.completed, completedAt = x.completedAt, approvedBy = x.approvedBy || "";
      if (v >= 100) {
        const prim = memberById[x.primaryAssigneeId];
        const auto = (x.approver === "teamlead" && prim && prim.isTeamlead) || x.status === "done";
        if (auto) { status = "done"; completed = true; completedAt = x.completedAt || Date.now(); approvedBy = prim ? prim.name : approvedBy; }
        else { status = "review"; completed = false; completedAt = null; approvedBy = ""; }
      } else { completed = false; completedAt = null; approvedBy = ""; if (x.status === "review" || x.status === "done") status = "doing"; }
      return { ...x, workdone: v, status, completed, completedAt, approvedBy };
    }));
    log({ action: "task_workdone", projectId: tk.projectId, projectName: projName(tk.projectId), taskId: id, taskTitle: tk.title, from: tk.workdone + "%", to: v + "%" });
  };
  const canApproveTask = (tk) => !!me && (myRole === "owner" || (tk.approver === "leader" ? !!me.isLeader : !!me.isTeamlead));
  const approveTask = (id) => {
    const tk = tasks.find((x) => x.id === id); if (!tk || !canApproveTask(tk)) return;
    setTasks((p) => p.map((x) => x.id === id ? { ...x, status: "done", completed: true, workdone: 100, completedAt: x.completedAt || Date.now(), approvedBy: me ? me.name : "" } : x));
    log({ action: "task_workdone", projectId: tk.projectId, projectName: projName(tk.projectId), taskId: id, taskTitle: tk.title, from: "chờ duyệt", to: "hoàn thành" });
  };
  const setStatus = (id, status) => {
    if (!canEdit || !STATUS_ORDER.includes(status)) return;
    setTasks((p) => p.map((x) => x.id === id ? { ...x, status, completed: status === "done", completedAt: status === "done" ? (x.completedAt || Date.now()) : null, workdone: status === "done" ? 100 : x.workdone, approvedBy: status === "done" ? (x.approvedBy || (me ? me.name : "")) : "" } : x));
  };
  const setApprover = (id, approver) => { if (!canEdit) return; setTasks((p) => p.map((x) => x.id === id ? { ...x, approver: approver === "leader" ? "leader" : "teamlead" } : x)); };
  const promoteStarted = () => {
    const nd = new Date();
    const today = nd.getFullYear() + "-" + String(nd.getMonth() + 1).padStart(2, "0") + "-" + String(nd.getDate()).padStart(2, "0");
    const fmt = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const addD = (iso, k) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + k); return fmt(d); };
    setTasks((p) => {
      let ch = false; const byId = {}; p.forEach((t2) => { byId[t2.id] = t2; });
      const n = p.map((x) => {
        let nx = x;
        if ((nx.dependsOn || []).length && !nx.startDate) {
          const deps = nx.dependsOn.map((id) => byId[id]).filter(Boolean);
          if (deps.length && deps.every((d) => d.completed)) {
            const ends = deps.map((d) => d.dueDate || (d.completedAt ? fmt(new Date(d.completedAt)) : "")).filter(Boolean).sort();
            if (ends.length) { const st = addD(ends[ends.length - 1], 1); nx = { ...nx, startDate: st }; if (nx.duration && !nx.dueDate) nx = { ...nx, dueDate: addD(st, nx.duration) }; ch = true; }
          }
        }
        if (nx.status === "todo" && nx.startDate && nx.startDate <= today && !nx.completed) { nx = { ...nx, status: "doing" }; ch = true; }
        return nx;
      });
      return ch ? n : p;
    });
  };
  useEffect(() => { if (!loaded) return; promoteStarted(); const iv = setInterval(promoteStarted, 60000); return () => clearInterval(iv); }, [loaded]); // eslint-disable-line
  useEffect(() => { if (!loaded) return; const cutoff = Date.now() - 90 * 86400000; setTrash((tr) => { const kept = tr.filter((e) => (e.deletedAt || 0) >= cutoff); return kept.length === tr.length ? tr : kept; }); }, [loaded]); // eslint-disable-line
  useEffect(() => {
    if (!loaded) return;
    const toSpawn = tasks.filter((x) => x.status === "done" && x.recur && x.recur !== "none" && !x.recurSpawned);
    if (!toSpawn.length) return;
    const shift = (iso, rc) => { if (!iso) return ""; const d = new Date(iso + "T00:00:00"); if (isNaN(d.getTime())) return ""; if (rc === "weekly") d.setDate(d.getDate() + 7); else if (rc === "monthly") d.setMonth(d.getMonth() + 1); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    const next = toSpawn.map((x) => ({ ...x, id: uid(), status: "todo", completed: false, completedAt: null, approvedBy: "", workdone: 0, reminderSentKey: "", recurSpawned: false, startDate: shift(x.startDate, x.recur), dueDate: shift(x.dueDate, x.recur), comments: [], createdAt: Date.now() }));
    setTasks((pp) => pp.map((x) => toSpawn.some((sp) => sp.id === x.id) ? { ...x, recurSpawned: true } : x).concat(next));
  }, [tasks, loaded]); // eslint-disable-line
  const reportDeadline = (dateISO) => new Date(dateISO + "T17:30:00").getTime() + 48 * 3600 * 1000;
  const notifications = useMemo(() => {
    if (!me) return [];
    const out = []; const today = today0();
    tasks.forEach((tk) => { if (tk.status === "review" && canApproveTask(tk)) out.push({ id: "ap-" + tk.id, type: "approve", ts: tk.assignedAt || tk.createdAt || 0, taskId: tk.id, text: (lang === "vi" ? "Chờ bạn duyệt: " : "Awaiting approval: ") + (tk.title || t.untitled) }); });
    tasks.forEach((tk) => { if ((tk.assignees || []).includes(currentUserId) && !tk.completed && tk.dueDate && new Date(tk.dueDate + "T00:00:00") < today) out.push({ id: "od-" + tk.id, type: "overdue", ts: new Date(tk.dueDate + "T00:00:00").getTime(), taskId: tk.id, text: (lang === "vi" ? "Trễ hạn: " : "Overdue: ") + (tk.title || t.untitled) }); });
    (dailyReports || []).forEach((r) => { (r.comments || []).forEach((c) => { if (c.authorId !== currentUserId && (r.memberId === currentUserId || c.reviewerId === currentUserId)) out.push({ id: "cm-" + c.id, type: "comment", ts: c.ts || 0, report: true, text: (lang === "vi" ? "Bình luận báo cáo từ " : "Report comment from ") + c.author }); }); });
    return out.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 40);
  }, [tasks, dailyReports, me, currentUserId, lang]); // eslint-disable-line
  const notifUnread = notifications.filter((n) => (n.ts || 0) > notifSeen).length;
  const markNotifSeen = () => { const now = Date.now(); setNotifSeen(now); try { localStorage.setItem("pm_notif_seen", String(now)); } catch (e) {} };
  const saveDailyReport = (date, items) => {
    if (!me) return; const now = Date.now();
    setDailyReports((p) => {
      const ex = p.find((r) => r.memberId === currentUserId && r.date === date);
      const rep2 = { id: ex ? ex.id : uid(), memberId: currentUserId, memberName: me.name, dept: me.dept || "", date, items: items.filter((it) => (it.moTa || "").trim() || it.taskId).map((it) => ({ id: it.id || uid(), taskId: it.taskId || "", taskTitle: it.taskTitle || "", moTa: it.moTa || "", pct: (it.pct === "" || it.pct == null) ? null : Math.max(0, Math.min(100, Number(it.pct) || 0)), vuongMac: it.vuongMac || "" })), comments: ex ? ex.comments : [], submittedAt: ex && ex.submittedAt ? ex.submittedAt : now, updatedAt: now };
      return ex ? p.map((r) => r.id === rep2.id ? rep2 : r) : [...p, rep2];
    });
    items.forEach((it) => { if (it.taskId && it.pct != null && it.pct !== "") { const tk = tasks.find((x) => x.id === it.taskId); if (tk && tk.primaryAssigneeId === currentUserId) setWorkdone(it.taskId, Math.max(0, Math.min(100, Number(it.pct) || 0))); } });
  };
  const addReportComment = (reportId, text, reviewerId) => {
    if (!me || !text.trim()) return;
    setDailyReports((p) => p.map((r) => r.id === reportId ? { ...r, comments: [...(r.comments || []), { id: uid(), author: me.name, authorId: currentUserId, role: myRole, text: text.trim(), ts: Date.now(), reviewerId: reviewerId || currentUserId }] } : r));
  };
  const setDepends = (id, deps) => {
    if (!canEdit) return;
    const tk = tasks.find((x) => x.id === id);
    setTasks((p) => p.map((x) => x.id === id ? { ...x, dependsOn: deps } : x));
    if (tk) log({ action: "task_field", field: "dependencies", projectId: tk.projectId, projectName: projName(tk.projectId), taskId: id, taskTitle: tk.title });
  };
  const setReminder = (id, lead) => {
    if (!canEdit) return;
    const tk = tasks.find((x) => x.id === id);
    setTasks((p) => p.map((x) => x.id === id ? { ...x, reminderLead: lead, reminderSentKey: "" } : x));
    if (tk) log({ action: "task_reminder", projectId: tk.projectId, projectName: projName(tk.projectId), taskId: id, taskTitle: tk.title, to: leadToText(lead, t) });
  };
  const removeTask = (id) => {
    if (!canEdit) return;
    const tk = tasks.find((x) => x.id === id);
    setTasks((p) => p.filter((x) => x.id !== id)); setDetailTask(null);
    if (tk) log({ action: "task_delete", projectId: tk.projectId, projectName: projName(tk.projectId), taskTitle: tk.title });
  };
  const addComment = (id, text) => {
    if (!me || !text.trim()) return;
    const tk = tasks.find((x) => x.id === id);
    setTasks((p) => p.map((x) => x.id === id ? { ...x, comments: [...(x.comments || []), { id: uid(), author: me.name, role: myRole, text: text.trim(), ts: Date.now() }] } : x));
    if (tk) log({ action: "comment_add", projectId: tk.projectId, projectName: projName(tk.projectId), taskId: tk.id, taskTitle: tk.title });
  };
  const addTask = (status, title = "") => {
    if (!canEdit) return;
    const st = STATUS_ORDER.includes(status) ? status : "todo";
    const order = Math.max(0, ...tasks.filter((x) => x.status === st).map((x) => x.order || 0)) + 1;
    const task = { id: uid(), projectId: activeProject, status: st, approver: "teamlead", title, description: "", priority: "medium", assignees: [], primaryAssigneeId: null, workdone: 0, tags: [], completed: st === "done", subtasks: [], comments: [], dueDate: "", startDate: "", duration: null, dependsOn: [], assignedAt: null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none", createdAt: Date.now(), order };
    setTasks((p) => [...p, task]);
    log({ action: "task_create", projectId: activeProject, projectName: projName(activeProject), taskId: task.id, taskTitle: title });
    return task;
  };
  const setProjectSiteLoggers = (pid, ids) => { if (!(myRole === "owner" || me?.isLeader)) return; setProjects((pp) => pp.map((x) => x.id === pid ? { ...x, siteLoggers: ids } : x)); };
  const setMemberPosition = (id, pos) => {
    if (myRole !== "owner") return;
    const preset = { ...BLANK_CAPS, ...(POSITION_PRESETS[pos] || {}) };
    const tgt = members.find((m) => m.id === id);
    if (preset.isTeamlead && tgt) { const other = members.find((m) => m.id !== id && m.isTeamlead && (m.dept || "") === (tgt.dept || "")); if (other && !window.confirm((lang === "vi" ? "Bộ phận này đã có Teamlead: " : "This dept already has a teamlead: ") + other.name + (lang === "vi" ? ". Vẫn đặt?" : ". Still set?"))) return; }
    if (serverMode) { api("/api/accounts/update", { method: "POST", body: JSON.stringify({ id, ...preset }) }).then((r) => { if (r.ok) { refreshAccounts(); if (tgt) log({ action: "member_cap", to: tgt.name, capKey: "position", val: pos }); } }); return; }
    setMembers((pm) => pm.map((m) => m.id === id ? { ...m, ...preset } : m));
  };
  const addSection = (name) => { if (!canEdit || !name?.trim()) return;
    const order = Math.max(0, ...projSections.map((s) => s.order)) + 1;
    setSections((p) => [...p, { id: uid(), projectId: activeProject, name: name.trim(), order }]);
    log({ action: "section_add", projectId: activeProject, projectName: projName(activeProject), to: name.trim() }); };
  const addProject = (name, templateId) => { if (!canEdit || !name?.trim()) return;
    const pid = uid(); const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    if (templateId && projects.some((p) => p.id === templateId)) {
      // copy columns + tasks from template, WITHOUT assignment/progress/comments/dates
      const srcSecs = sections.filter((s) => s.projectId === templateId).sort((a, b) => a.order - b.order);
      const secMap = {};
      const newSecs = srcSecs.map((s, i) => { const nid = uid(); secMap[s.id] = nid; return { id: nid, projectId: pid, name: s.name, order: i }; });
      const srcTasks = tasks.filter((x) => x.projectId === templateId);
      const newTasks = srcTasks.map((x) => ({
        id: uid(), projectId: pid, sectionId: secMap[x.sectionId] || newSecs[0]?.id,
        title: x.title, description: x.description, priority: x.priority,
        assignees: [], primaryAssigneeId: null, workdone: 0, completed: false,
        tags: [...(x.tags || [])], subtasks: (x.subtasks || []).map((s) => ({ id: uid(), title: s.title, done: false })),
        comments: [], dueDate: "", startDate: "", duration: null, dependsOn: [], assignedAt: null, completedAt: null,
        reminderLead: x.reminderLead || null, reminderSentKey: "", createdAt: Date.now(), order: x.order || 0,
      }));
      setProjects((p) => [...p, { id: pid, name: name.trim(), color }]);
      setSections((p) => [...p, ...newSecs]); setTasks((p) => [...p, ...newTasks]);
      log({ action: "project_create", projectId: pid, projectName: name.trim() });
      setActiveProject(pid); setView("list"); return;
    }
    const secs = t.defaultSections.map((n, i) => ({ id: uid(), projectId: pid, name: n, order: i }));
    setProjects((p) => [...p, { id: pid, name: name.trim(), color }]); setSections((p) => [...p, ...secs]);
    log({ action: "project_create", projectId: pid, projectName: name.trim() });
    setActiveProject(pid); setView("list"); };
  const deleteProject = (pid) => { if (!canManage) return;
    const proj = projects.find((x) => x.id === pid); if (!proj) return;
    const entry = { id: pid, name: proj.name, deletedAt: Date.now(), deletedBy: me?.name || "", project: proj, sections: sections.filter((s) => s.projectId === pid), tasks: tasks.filter((y) => y.projectId === pid) };
    setTrash((tr) => [entry, ...tr]);
    setProjects((p) => p.filter((x) => x.id !== pid)); setSections((s) => s.filter((x) => x.projectId !== pid));
    setTasks((x) => x.filter((y) => y.projectId !== pid)); setActiveProject("dashboard");
    log({ action: "project_delete", projectName: proj.name });
    setUndoInfo({ id: pid, name: proj.name });
    setTimeout(() => setUndoInfo((u) => (u && u.id === pid ? null : u)), 8000); };
  const restoreProject = (pid) => {
    const entry = trash.find((e) => e.id === pid); if (!entry) return;
    setProjects((p) => [...p, entry.project]);
    setSections((sx) => [...sx, ...(entry.sections || [])]);
    setTasks((x) => [...x, ...(entry.tasks || [])]);
    setTrash((tr) => tr.filter((e) => e.id !== pid));
    setUndoInfo((u) => (u && u.id === pid ? null : u));
    setActiveProject(pid); };
  const purgeProject = (pid) => { if (myRole !== "owner") return; setTrash((tr) => tr.filter((e) => e.id !== pid)); };
  const importFromCSV = (text) => {
    if (!canEdit || !project) return;
    const rows = parseCSV(text); if (!rows.length) return;
    const first = rows[0].map((c) => String(c).trim().toLowerCase());
    const isHead = first.some((c) => ["công việc","tên","title","task","ưu tiên","priority","người phụ trách","người","assignee","deadline","due","hạn","mô tả","description","bắt đầu","start"].includes(c));
    const col = { title: 0, priority: -1, assignee: -1, due: -1, start: -1, desc: -1 };
    let data = rows;
    if (isHead) { data = rows.slice(1); first.forEach((c, i) => {
      if (["công việc","tên","title","task"].includes(c)) col.title = i;
      else if (["ưu tiên","priority"].includes(c)) col.priority = i;
      else if (["người phụ trách","người","assignee"].includes(c)) col.assignee = i;
      else if (["deadline","due","hạn"].includes(c)) col.due = i;
      else if (["bắt đầu","start"].includes(c)) col.start = i;
      else if (["mô tả","description"].includes(c)) col.desc = i;
    }); }
    const prioMap = {}; PRIORITY_ORDER.forEach((pk) => { prioMap[String(t.priorities[pk]).toLowerCase()] = pk; prioMap[pk] = pk; });
    const nameToId = {}; members.forEach((m) => { nameToId[String(m.name || "").trim().toLowerCase()] = m.id; });
    let order = tasks.filter((x) => x.projectId === activeProject).length;
    const add = [];
    data.forEach((r) => {
      const title = String(r[col.title] || "").trim(); if (!title) return;
      const prio = col.priority >= 0 ? (prioMap[String(r[col.priority] || "").trim().toLowerCase()] || "medium") : "medium";
      const aid = col.assignee >= 0 ? (nameToId[String(r[col.assignee] || "").trim().toLowerCase()] || null) : null;
      add.push({ id: uid(), projectId: activeProject, status: "todo", approver: "teamlead", title, description: col.desc >= 0 ? String(r[col.desc] || "").trim() : "", priority: prio, assignees: aid ? [aid] : [], primaryAssigneeId: aid || null, workdone: 0, tags: [], completed: false, subtasks: [], comments: [], dueDate: col.due >= 0 ? normDateCell(r[col.due]) : "", startDate: col.start >= 0 ? normDateCell(r[col.start]) : "", duration: null, dependsOn: [], assignedAt: aid ? Date.now() : null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none", createdAt: Date.now(), order: order++ });
    });
    if (add.length) { setTasks((pp) => [...pp, ...add]); log({ action: "csv_import", projectId: activeProject, projectName: projName(activeProject), to: add.length + (lang === "vi" ? " công việc" : " tasks") }); antMessage.success((lang === "vi" ? "Đã nhập " : "Imported ") + add.length + (lang === "vi" ? " công việc." : " tasks.")); }
    else antMessage.warning(lang === "vi" ? "Không đọc được công việc nào từ file." : "No tasks found in file.");
  };

  const setMemberCap = (id, key, val) => { if (!canManageMembers) return;   // canAssign | canViewFinance | canViewHistory
    const tgt = members.find((m) => m.id === id);
    if (key === "isTeamlead" && val && tgt) { const other = members.find((m) => m.id !== id && m.isTeamlead && (m.dept || "") === (tgt.dept || "")); if (other && !window.confirm((lang === "vi" ? "Bộ phận này đã có Teamlead: " : "This department already has a teamlead: ") + other.name + (lang === "vi" ? ". Vẫn đặt người này làm Teamlead?" : ". Still set as teamlead?"))) return; }
    if (serverMode) {
      api("/api/accounts/update", { method: "POST", body: JSON.stringify({ id, [key]: val }) }).then((r) => { if (r.ok) { refreshAccounts(); if (tgt) log({ action: "member_cap", to: tgt.name, capKey: key, val }); } });
      return;
    }
    setMembers((p) => p.map((m) => m.id === id ? { ...m, [key]: val } : m));
    if (tgt) log({ action: "member_cap", to: tgt.name, capKey: key, val }); };
  const addMember = (name, email, password, caps) => { if (!canManageMembers || !name.trim() || !isEmail(email)) return;
    const c = caps || {};
    if (c.isTeamlead) { const other = members.find((m) => m.isTeamlead && (m.dept || "") === (c.dept || "")); if (other && !window.confirm((lang === "vi" ? "Bộ phận này đã có Teamlead: " : "This department already has a teamlead: ") + other.name + (lang === "vi" ? ". Vẫn thêm người này làm Teamlead?" : ". Still add as teamlead?"))) return; }
    const payload = { name: name.trim(), email: email.trim(), role: c.role || "member", dept: c.dept || "", canAssign: !!c.canAssign, canViewFinance: !!c.canViewFinance, canViewHistory: !!c.canViewHistory, canViewWorkload: !!c.canViewWorkload, canManageMembers: !!c.canManageMembers, isLeader: !!c.isLeader, isTeamlead: !!c.isTeamlead, noReport: !!c.noReport, position: c.position || "" };
    if (serverMode) {
      if (!password) return;
      api("/api/accounts", { method: "POST", body: JSON.stringify({ ...payload, password }) }).then((r) => {
        if (r.ok) { refreshAccounts(); log({ action: "member_add", to: name.trim() }); }
        else if (r.status === 409) alert(t.emailExistsErr);
      });
      return;
    }
    setMembers((p) => [...p, normMember({ id: uid(), ...payload })]);
    log({ action: "member_add", to: name.trim() }); };
  const resetMemberPassword = (id, password) => { if (!canManageMembers || !serverMode || !password) return;
    api("/api/accounts/update", { method: "POST", body: JSON.stringify({ id, password }) }); };
  const removeMember = (id) => { if (!canManageMembers) return;
    const tgt = members.find((m) => m.id === id);
    if (serverMode) {
      api("/api/accounts/delete", { method: "POST", body: JSON.stringify({ id }) }).then((r) => {
        if (r.ok) { refreshAccounts(); if (tgt) log({ action: "member_remove", to: tgt.name }); }
        else if (r.status === 400) alert(t.lastOwnerWarn);
      });
      return;
    }
    setMembers((p) => { const next = p.filter((m) => m.id !== id);
      if (!next.some((m) => effRole(m) === "owner")) { alert(t.lastOwnerWarn); return p; } return next; });
    if (tgt) log({ action: "member_remove", to: tgt.name }); };

  // settings (owner)
  const loadSettings = async () => { const r = await api("/api/settings"); return r.ok ? r.body : null; };
  const saveSettings = async (s) => { const r = await api("/api/settings", { method: "POST", body: JSON.stringify(s) }); return r.ok; };

  const downloadReport = (scopeId) => {
    const proj = scopeId ? projects.find((p) => p.id === scopeId) : null;
    const html = buildReportHTML({ t, lang, project: proj, projects, tasks, members, finance, canFinance });
    try {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ((proj ? proj.name : t.reportFor) + "-" + new Date().toISOString().slice(0, 10) + ".html").replace(/[\\/:*?"<>|]+/g, "_");
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {}
  };
  const downloadCSV = (scopeId) => {
    const proj = scopeId ? projects.find((p) => p.id === scopeId) : null;
    const rows = tasks.filter((x) => !scopeId || x.projectId === scopeId);
    const header = ["Dự án", "Trạng thái", "Công việc", "Ưu tiên", "Người phụ trách", "Bắt đầu", "Deadline", "% hoàn thành", "Mô tả"];
    // Chống "CSV formula injection": ô bắt đầu bằng = + - @ sẽ bị Excel hiểu là công thức khi mở file
    const esc = (v) => { let w = String(v == null ? "" : v); if (/^[=+\-@]/.test(w)) w = "'" + w; w = w.replace(/"/g, '""'); return /[",\n;]/.test(w) ? '"' + w + '"' : w; };
    const lines = [header.map(esc).join(",")];
    rows.forEach((x) => { const who = (x.assignees || []).map(memName).filter(Boolean).join(", ");
      lines.push([projName(x.projectId), t.statuses[x.status] || x.status, x.title || "", t.priorities[x.priority] || x.priority, who, x.startDate || "", x.dueDate || "", (x.workdone || 0) + "%", (x.description || "").replace(/\n/g, " ")].map(esc).join(",")); });
    const csv = "\uFEFF" + lines.join("\r\n");
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = ((proj ? proj.name : t.download) + "-" + new Date().toISOString().slice(0, 10) + ".csv").replace(/[\\/:*?"<>|]+/g, "_");
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {}
  };
  const doExport = (scopeId, fmt) => fmt === "csv" ? downloadCSV(scopeId) : downloadReport(scopeId);

  // finance (owner + permitted member). FinanceView builds the next object.
  const setFinanceData = (next) => { if (!canFinance) return; setFinance(typeof next === "function" ? next : next); };

  /* derived */
  const project = projects.find((p) => p.id === activeProject);
  const projSections = useMemo(() => sections.filter((s) => s.projectId === activeProject).sort((a, b) => a.order - b.order), [sections, activeProject]);
  const passesFilter = (x) => {
    if (search && !x.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && x.priority !== filterPriority) return false;
    if (filterAssignee && !(x.assignees || []).includes(filterAssignee)) return false;
    if (!showCompleted && x.completed) return false;
    return true;
  };
  const projectTasks = useMemo(() => tasks.filter((x) => x.projectId === activeProject && passesFilter(x)),
    [tasks, activeProject, search, filterPriority, filterAssignee, showCompleted]);
  const hasFilters = filterPriority || filterAssignee || search;
  const taskById = useMemo(() => Object.fromEntries(tasks.map((x) => [x.id, x])), [tasks]);
  const blockedIds = useMemo(() => {
    const set = new Set();
    for (const x of tasks) {
      if (x.completed) continue;
      const deps = x.dependsOn || [];
      if (deps.some((id) => taskById[id] && !taskById[id].completed)) set.add(x.id);
    }
    return set;
  }, [tasks, taskById]);
  const isBoardlessView = ["dashboard", "mywork", "history", "finance", "workload", "dailyreport", "search"].includes(activeProject);

  if (!loaded) return <div className="h-screen flex items-center justify-center text-slate-400">…</div>;

  if (serverMode && needsSetup) return <AuthScreen mode="setup" t={t} lang={lang} setLang={setLang} error={authError} onSubmit={(n, e, p, c) => doSetup(n, e, p, c)} />;
  if (serverMode && !authUser) return <AuthScreen mode="login" t={t} lang={lang} setLang={setLang} error={authError} onSubmit={(e, p) => doLogin(e, p)} />;

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 antialiased overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* MOBILE NAV BACKDROP */}
      {navOpen && <div className="fixed inset-0 bg-slate-900/50 z-30 md:hidden" onClick={() => setNavOpen(false)} />}
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-white text-slate-600 border-r border-slate-200 flex flex-col transform transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}><Sparkles size={17} /></div>
          <div className="leading-tight flex-1"><div className="text-slate-800 font-semibold text-sm">{t.appName}</div><div className="text-xs text-slate-400">{t.tagline}</div></div>
          <button onClick={() => setNavOpen(false)} className="md:hidden text-slate-400 hover:text-slate-700 p-1"><X size={18} /></button>
        </div>
        <nav className="px-3 py-3 space-y-0.5">
          <SideItem active={activeProject === "dashboard"} onClick={() => { setActiveProject("dashboard"); setNavOpen(false); }} icon={<LayoutDashboard size={17} />} label={t.dashboard} />
          <SideItem active={activeProject === "mywork"} onClick={() => { setActiveProject("mywork"); setNavOpen(false); }} icon={<Inbox size={17} />} label={t.myWork} badge={myWorkCount || null} />
          <SideItem active={activeProject === "search"} onClick={() => { setActiveProject("search"); setNavOpen(false); }} icon={<Search size={17} />} label={t.searchAll} />
          {feat("dailyReport") && <SideItem active={activeProject === "dailyreport"} onClick={() => { setActiveProject("dailyreport"); setNavOpen(false); }} icon={<CalendarDays size={17} />} label={t.dailyReport} />}
          {canViewHistory && <SideItem active={activeProject === "history"} onClick={() => { setActiveProject("history"); setNavOpen(false); }} icon={<History size={17} />} label={t.history} />}
          {canFinance && <SideItem active={activeProject === "finance"} onClick={() => { setActiveProject("finance"); setNavOpen(false); }} icon={<Wallet size={17} />} label={t.finance} />}
          {canViewWorkload && <SideItem active={activeProject === "workload"} onClick={() => { setActiveProject("workload"); setNavOpen(false); }} icon={<Gauge size={17} />} label={t.workload} />}
          {canManageMembers && !canManage && <SideItem active={false} onClick={() => { setModal("members"); setNavOpen(false); }} icon={<Users size={17} />} label={t.members} badge={members.length} />}
          <SideItem active={false} onClick={() => { setModal("export"); setNavOpen(false); }} icon={<Download size={17} />} label={t.download} />
          {canManage && serverMode && <SideItem active={false} onClick={() => { setModal("settings"); setNavOpen(false); }} icon={<Settings size={17} />} label={t.settings} />}
          <SideItem active={false} onClick={() => { setModal("connect"); setNavOpen(false); }} icon={<Share2 size={17} />} label={t.collaborate} />
          {canManage && <SideItem active={false} onClick={() => { setModal("trash"); setNavOpen(false); }} icon={<Trash2 size={17} />} label={t.trashTitle} badge={trash.length || null} />}
        </nav>
        <div className="px-5 mt-1 mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.projects}</span>
          {canEdit && <button onClick={() => setModal("newProject")} className="text-slate-400 hover:text-orange-600 transition-colors" title={t.newProject}><Plus size={16} /></button>}
        </div>
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {projects.map((p) => {
            const count = tasks.filter((x) => x.projectId === p.id && !x.completed).length;
            return (
              <button key={p.id} onClick={() => { setActiveProject(p.id); setView("list"); setNavOpen(false); }}
                className={`group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${activeProject === p.id ? "text-white" : "hover:bg-slate-100 text-slate-600"}`} style={activeProject === p.id ? { background: "#f97316" } : undefined}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="flex-1 text-left truncate">{p.name}</span>
                {count > 0 && <span className="text-xs text-slate-400">{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="border-t border-slate-100 p-3 space-y-2">
          <button onClick={() => setModal(serverMode ? "profile" : "identity")} className="w-full flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-slate-100 transition group">
            <Avatar name={me?.name} size={30} />
            <div className="flex-1 text-left leading-tight min-w-0">
              <div className="text-sm text-slate-800 truncate flex items-center gap-1.5">{me?.name || "—"} {!me?.isLeader && <DeptTag dept={me?.dept} t={t} />}</div>
              {me && myRole === "owner" && <RoleTag role={myRole} t={t} mini />}
            </div>
            <LogOut size={15} className="text-slate-400 group-hover:text-slate-600" />
          </button>
          <button onClick={syncNow} className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition">
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {!storageOK ? t.offline : syncing ? t.syncing : `${t.synced}${lastSync ? " · " + new Date(lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}`}
          </button>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <Globe size={15} className="text-slate-400 ml-1.5" />
            {["vi", "en"].map((l) => (<button key={l} onClick={() => setLang(l)} className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${lang === l ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{l === "vi" ? "Tiếng Việt" : "English"}</button>))}
          </div>
          <p className="text-xs text-slate-500 text-center leading-tight pt-1">{AUTHOR_CREDIT}{appVersion ? " · v" + appVersion : ""}</p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-3 md:px-6 flex items-center gap-2 md:gap-4">
          <button onClick={() => setNavOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800 p-1 -ml-1 shrink-0" title="Menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
          {activeProject === "dashboard" ? (
            <h1 className="text-lg font-semibold flex items-center gap-2"><LayoutDashboard size={20} className="text-orange-500" />{t.dashboard}</h1>
          ) : activeProject === "history" ? (
            <h1 className="text-lg font-semibold flex items-center gap-2"><History size={20} className="text-orange-500" />{t.history}</h1>
          ) : activeProject === "finance" ? (
            <h1 className="text-lg font-semibold flex items-center gap-2"><Wallet size={20} className="text-orange-500" />{t.finance}</h1>
          ) : activeProject === "workload" ? (
            <h1 className="text-lg font-semibold flex items-center gap-2"><Gauge size={20} className="text-orange-500" />{t.workload}</h1>
          ) : activeProject === "search" ? (
            <h1 className="text-lg font-semibold flex items-center gap-2"><Search size={20} className="text-orange-500" />{t.searchAll}</h1>
          ) : activeProject === "mywork" ? (
            <h1 className="text-lg font-semibold flex items-center gap-2"><Inbox size={20} className="text-orange-500" />{t.myWork}</h1>
          ) : project ? (
            <h1 className="text-lg font-semibold flex items-center gap-2 min-w-0"><span className="w-3 h-3 rounded-full shrink-0" style={{ background: project.color }} /><span className="truncate">{project.name}</span></h1>
          ) : <h1 className="text-lg font-semibold text-slate-400">{t.welcome}</h1>}
          <div className="flex-1" />
          {feat("notifications") && (
            <AntPopover trigger="click" placement="bottomRight" open={notifOpen} onOpenChange={(o) => { setNotifOpen(o); if (o) markNotifSeen(); }}
              content={<NotifPanel t={t} lang={lang} items={notifications} onOpen={(n) => { setNotifOpen(false); if (n.taskId) setDetailTask(n.taskId); else if (n.report) setActiveProject("dailyreport"); }} />}>
              <button className="relative p-2 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-slate-50" title={lang === "vi" ? "Thông báo" : "Notifications"}>
                <AntBadge count={notifUnread} size="small"><Bell size={19} /></AntBadge>
              </button>
            </AntPopover>
          )}
          {!canEdit && <AntTag className="hidden sm:inline-flex items-center gap-1" style={{ margin: 0 }}><Lock size={12} />{t.roles[myRole]}</AntTag>}
          {!isBoardlessView && project && (
            <>
              <AntInput allowClear value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} prefix={<Search size={15} className="text-slate-400" />} style={{ width: 180 }} />
              <AntBadge dot={hasFilters}><AntBtn icon={<Filter size={15} />} onClick={() => setShowFilters((v) => !v)} type={hasFilters ? "primary" : "default"} ghost={hasFilters}>{t.filter}</AntBtn></AntBadge>
              {canEdit && <AntBtn type="primary" icon={<Plus size={16} />} onClick={() => { const nt = addTask("todo"); if (nt) setDetailTask(nt.id); }}>{t.addTask}</AntBtn>}
            </>
          )}
        </header>

        {license && (license.readOnly || (typeof license.daysLeft === "number" && license.daysLeft <= 30)) && (
          <div className={`px-3 md:px-6 py-2 text-sm flex items-center gap-2 border-b border-amber-200 ${license.readOnly ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
            <Lock size={15} className="shrink-0" />
            <span className="flex-1">
              {license.readOnly
                ? "Giấy phép đã hết hạn — phần mềm đang ở chế độ CHỈ ĐỌC (thay đổi sẽ không được lưu/đồng bộ). Liên hệ tác giả để gia hạn."
                : "Giấy phép còn " + license.daysLeft + " ngày. Liên hệ tác giả để gia hạn."}
            </span>
            {canManage && <AntBtn size="small" type="primary" onClick={() => setModal("license")}>Nhập mã gia hạn</AntBtn>}
          </div>
        )}

        {showFilters && !isBoardlessView && project && (
          <div className="bg-white border-b border-slate-200 px-3 md:px-6 py-3 flex flex-wrap items-center gap-3">
            <AntSelect value={filterPriority} onChange={(v) => setFilterPriority(v)} style={{ minWidth: 150 }} options={[{ value: "", label: t.allPriorities }, ...PRIORITY_ORDER.map((p) => ({ value: p, label: t.priorities[p] }))]} />
            <AntSelect value={filterAssignee} onChange={(v) => setFilterAssignee(v)} style={{ minWidth: 160 }} showSearch optionFilterProp="label" options={[{ value: "", label: t.allAssignees }, ...members.map((m) => ({ value: m.id, label: m.name }))]} />
            <AntCheckbox checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)}>{t.showCompleted}</AntCheckbox>
            {hasFilters && <AntBtn type="link" size="small" onClick={() => { setFilterPriority(""); setFilterAssignee(""); setSearch(""); }}>{t.clearFilters}</AntBtn>}
          </div>
        )}

        {!isBoardlessView && project && (
          <div className="bg-white border-b border-slate-200 px-3 md:px-6">
            <AntTabs activeKey={view} onChange={setView} tabBarStyle={{ marginBottom: 0 }}
              tabBarExtraContent={canManage ? <button onClick={() => deleteProject(project.id)} className="text-slate-400 hover:text-red-500 transition p-2" title={t.deleteProject}><Trash2 size={15} /></button> : undefined}
              items={[["list", LayoutList, t.list], ["board", LayoutGrid, t.board], ["calendar", CalendarDays, t.calendar], ["timeline", CalendarRange, t.timeline], ["construction", ScrollText, t.constructionSite]].filter(([v]) => viewAllowed(v)).map(([v, Icon, label]) => ({ key: v, label: <span className="flex items-center gap-1.5"><Icon size={16} />{label}</span> }))} />
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {activeProject === "dashboard" && <Dashboard t={t} lang={lang} projects={projects} tasks={tasks} members={workMembers} memberById={memberById} onOpenProject={(id) => { setActiveProject(id); setView("list"); }} onOpenTask={(id) => setDetailTask(id)} />}
          {activeProject === "history" && (canViewHistory
            ? <HistoryView t={t} lang={lang} history={history} projects={projects} canDelete={myRole === "owner"} onDelete={deleteHistoryEntry} />
            : <div className="h-full flex flex-col items-center justify-center text-slate-400"><Lock size={44} className="mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.historyLocked}</p></div>)}
          {activeProject === "mywork" && <MyWork t={t} lang={lang} me={me} tasks={tasks} projects={projects} memberById={memberById} onOpenTask={(id) => setDetailTask(id)} />}
          {activeProject === "search" && <SearchView t={t} tasks={tasks} projects={projects} memberById={memberById} onOpenTask={(id) => setDetailTask(id)} />}
          {activeProject === "dailyreport" && <DailyReportView t={t} lang={lang} me={me} myRole={myRole} currentUserId={currentUserId} members={members} memberById={memberById} tasks={tasks} projects={projects} dailyReports={dailyReports} onSave={saveDailyReport} onComment={addReportComment} reportDeadline={reportDeadline} onOpenTask={(id) => setDetailTask(id)} />}
          {activeProject === "finance" && (canFinance
            ? <FinanceView t={t} lang={lang} finance={finance} projects={projects} tasks={tasks} onChange={setFinanceData} />
            : <div className="h-full flex flex-col items-center justify-center text-slate-400"><Lock size={44} className="mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.financeLocked}</p></div>)}
          {activeProject === "workload" && (canViewWorkload
            ? <WorkloadView t={t} lang={lang} members={workMembers} tasks={tasks} projects={projects} />
            : <div className="h-full flex flex-col items-center justify-center text-slate-400"><Lock size={44} className="mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.workloadLocked}</p></div>)}
          {project && view === "list" && <ListView t={t} lang={lang} canEdit={canEdit} memberById={memberById} sections={STATUS_ORDER.map((s) => ({ id: s, name: t.statuses[s] }))} tasks={projectTasks} blockedIds={blockedIds} onToggle={(id, c) => c ? setWorkdone(id, 100) : setWorkdone(id, 0)} onOpenTask={(id) => setDetailTask(id)} onQuickAdd={(sid, title) => addTask(sid, title)} onImport={importFromCSV} />}
          {project && view === "board" && <BoardView t={t} lang={lang} canEdit={canEdit} memberById={memberById} sections={STATUS_ORDER.map((s) => ({ id: s, name: t.statuses[s] }))} tasks={projectTasks} blockedIds={blockedIds} onMove={(id, sid) => setStatus(id, sid)} onOpenTask={(id) => setDetailTask(id)} onQuickAdd={(sid, title) => addTask(sid, title)} />}
          {project && view === "calendar" && <CalendarView t={t} lang={lang} tasks={projectTasks} onOpenTask={(id) => setDetailTask(id)} />}
          {project && view === "timeline" && <TimelineView t={t} lang={lang} canEdit={canEdit} tasks={projectTasks} memberById={memberById} onOpenTask={(id) => setDetailTask(id)} onReschedule={(id, sd, dd) => patchTask(id, { startDate: sd, dueDate: dd })} />}
          {project && view === "construction" && <ConstructionSiteView t={t} lang={lang} project={project} me={me} myRole={myRole} members={members} features={features} canEdit={canEdit} readOnly={!!(license && license.readOnly)} onSetLoggers={(ids) => setProjectSiteLoggers(project.id, ids)} />}
          {!project && !isBoardlessView && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400"><Folder size={48} className="mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.welcome}</p><p className="text-sm">{t.welcomeHint}</p></div>
          )}
        </div>
      </main>

      {detailTask && (() => {
        const task = tasks.find((x) => x.id === detailTask);
        if (!task) return null;
        return <TaskDetail t={t} lang={lang} task={task} members={workMembers} memberById={memberById} me={me}
          canEdit={canEdit} canWorkdone={canWorkdone(task)}
          sections={sections.filter((s) => s.projectId === task.projectId)}
          projTasks={tasks.filter((x) => x.projectId === task.projectId)}
          onClose={() => setDetailTask(null)} onPatch={(patch) => patchTask(detailTask, patch)}
          onAssign={(a, p) => setAssign(detailTask, a, p)} onWorkdone={(v) => setWorkdone(detailTask, v)}
          onDepends={(deps) => setDepends(detailTask, deps)}
          onReminder={(l) => setReminder(detailTask, l)} onDelete={() => removeTask(detailTask)} onComment={(text) => addComment(detailTask, text)} onStatus={(st) => setStatus(detailTask, st)} onApprove={() => approveTask(detailTask)} onApprover={(a) => setApprover(detailTask, a)} canApprove={canApproveTask(task)} assignableIds={assignableIds} canRemind={feat("notifications")} serverMode={serverMode} />;
      })()}

      {modal === "newProject" && <NewProjectModal t={t} projects={projects} onClose={() => setModal(null)} onCreate={(n, tpl) => { addProject(n, tpl); setModal(null); }} />}
      {modal === "identity" && !serverMode && <IdentityModal t={t} members={members} currentUserId={currentUserId} onPick={setIdentity} onCreate={createAndJoin} onClose={() => currentUserId && setModal(null)} closable={!!currentUserId} effRole={effRole} />}
      {modal === "members" && canManageMembers && <MembersModal t={t} members={members} meId={currentUserId} canManage={canManageMembers} actorIsOwner={myRole === "owner"} serverMode={serverMode} features={features} effRole={effRole} onSetCap={setMemberCap} onSetPosition={setMemberPosition} onAdd={addMember} onRemove={removeMember} onResetPassword={resetMemberPassword} onClose={() => setModal(null)} />}
      {modal === "connect" && <ConnectModal t={t} members={members} storageOK={storageOK} onClose={() => setModal(null)} />}
      {modal === "profile" && <ProfileModal t={t} me={me} myRole={myRole} onChangePassword={changeOwnPassword} onLogout={() => { setModal(null); doLogout(); }} onClose={() => setModal(null)} />}
      {modal === "export" && <ExportModal t={t} projects={projects} onDownload={doExport} onClose={() => setModal(null)} />}
      {modal === "trash" && <TrashModal t={t} lang={lang} trash={trash} isOwner={myRole === "owner"} onRestore={restoreProject} onPurge={purgeProject} onClose={() => setModal(null)} />}
      {undoInfo && (
        <div style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", zIndex: 60 }} className="flex items-center gap-3 bg-slate-800 text-white rounded-xl px-4 py-2.5 shadow-lg">
          <span className="text-sm">{t.movedToTrash}: {undoInfo.name}</span>
          <button onClick={() => restoreProject(undoInfo.id)} className="text-sm font-semibold text-orange-300 hover:text-orange-200">{t.undo}</button>
        </div>
      )}
      {modal === "settings" && <SettingsModal t={t} lang={lang} onLoad={loadSettings} onSave={saveSettings} onFeatures={setFeatures} onClose={() => setModal(null)} membersCount={members.length} onOpenMembers={() => setModal("members")} onOpenLicense={() => setModal("license")} />}
      {modal === "license" && <LicenseModal t={t} license={license} onActivate={activateLicense} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ============================ shared bits ============================ */
function RecordsView({ t, lang, project, canEdit, readOnly }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("");
  const load = async () => { setLoading(true); const r = await api("/api/records?projectId=" + encodeURIComponent(project.id)); if (r.ok) setRecords(r.body.records || []); setLoading(false); };
  useEffect(() => { load(); }, [project.id]); // eslint-disable-line
  const openFile = async (rec, f) => {
    try {
      const tok = getToken();
      const res = await fetch("/api/records/file?recordId=" + rec.id + "&idx=" + f.idx, { headers: tok ? { Authorization: "Bearer " + tok } : {} });
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {}
  };
  const del = async (rec) => { if (!window.confirm(t.confirmDeleteRecord)) return; await api("/api/records/delete", { method: "POST", body: JSON.stringify({ id: rec.id }) }); load(); };
  const types = Array.from(new Set(records.map((r) => r.type).filter(Boolean)));
  const shown = filter ? records.filter((r) => r.type === filter) : records;
  const fmt = (d) => d ? d.split("-").reverse().join("/") : "";
  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><ScrollText size={20} className="text-orange-500" />{t.records}</h2>
        <div className="flex items-center gap-2">
          {types.length > 0 && <AntSelect value={filter} onChange={(v) => setFilter(v)} size="small" style={{ minWidth: 150 }} options={[{ value: "", label: t.allTypes }, ...types.map((ty) => ({ value: ty, label: ty }))]} />}
          {canEdit && !readOnly && <AntBtn type="primary" icon={<Plus size={16} />} onClick={() => setModal(true)}>{t.addRecord}</AntBtn>}
        </div>
      </div>
      {loading ? <p className="text-slate-400 text-sm">…</p> : shown.length === 0 ? (
        <div className="text-center text-slate-400 py-16"><ScrollText size={44} className="mx-auto mb-3 opacity-40" /><p className="text-slate-500">{t.noRecords}</p></div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((rec) => (
            <div key={rec.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{fmt(rec.date)}</span>
                    {rec.type && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">{rec.type}</span>}
                    {rec.number && <span className="text-xs text-slate-400">#{rec.number}</span>}
                  </div>
                  {rec.note && <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap break-words">{rec.note}</p>}
                  {rec.createdBy && <p className="text-xs text-slate-400 mt-1">{rec.createdBy}</p>}
                </div>
                {canEdit && !readOnly && <button onClick={() => del(rec)} className="text-slate-300 hover:text-red-500 p-1 shrink-0" title={t.delete}><Trash2 size={15} /></button>}
              </div>
              {rec.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {rec.files.map((f) => (
                    <button key={f.idx} onClick={() => openFile(rec, f)} className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 min-w-0" style={{ maxWidth: "100%" }}><Download size={14} className="text-slate-400 shrink-0" /><span className="truncate">{f.name}</span></button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {modal && <RecordModal t={t} project={project} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); }} />}
    </div>
  );
}
function RecordModal({ t, project, onClose, onSaved }) {
  const now = new Date();
  const iso = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  const [date, setDate] = useState(iso);
  const [type, setType] = useState(t.recFieldType);
  const [number, setNumber] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    if (busy) return; setBusy(true); setErr("");
    const r = await api("/api/records", { method: "POST", body: JSON.stringify({ projectId: project.id, projectName: project.name, date, type, number, note }) });
    if (!r.ok) { setErr((r.body && r.body.message) || t.saveFailed); setBusy(false); return; }
    const rid = r.body.record.id;
    for (const f of files) {
      try {
        const tok = getToken();
        await fetch("/api/records/file?recordId=" + rid + "&filename=" + encodeURIComponent(f.name), { method: "POST", headers: { ...(tok ? { Authorization: "Bearer " + tok } : {}), "Content-Type": f.type || "application/octet-stream" }, body: f });
      } catch {}
    }
    setBusy(false); onSaved();
  };
  const inp = "w-full mt-0.5 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400";
  return (
    <AntModal open onCancel={onClose} width={480}
      title={<span className="flex items-center gap-2"><ScrollText size={19} className="text-orange-500" />{t.addRecord}</span>}
      footer={<AntBtn type="primary" loading={busy} disabled={!note.trim()} onClick={submit}>{busy ? t.recSaving : t.save}</AntBtn>}>
      <div className="space-y-3" style={{ maxHeight: "68vh", overflowY: "auto" }}>
        <label className="block"><span className="text-xs text-slate-500">{t.recDate}</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} /></label>
        <label className="block"><span className="text-xs text-slate-500">{t.recType}</span><AntSelect value={type} onChange={(v) => setType(v)} style={{ width: "100%", marginTop: 2 }} options={[{ value: t.recFieldType, label: t.recFieldType }, { value: t.recMeetingType, label: t.recMeetingType }, { value: t.recDirectiveType, label: t.recDirectiveType }]} /></label>
        <label className="block"><span className="text-xs text-slate-500">{t.recNumber}</span><AntInput value={number} onChange={(e) => setNumber(e.target.value)} placeholder={t.recNumberPh} /></label>
        <label className="block"><span className="text-xs text-slate-500">{t.recNote}</span><AntInput.TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></label>
        <div><span className="text-xs text-slate-500">{t.recFiles}</span><input type="file" multiple accept="image/*,application/pdf" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="w-full mt-0.5 text-sm" />{files.length > 0 && <p className="text-xs text-slate-400 mt-1">{files.length} {t.recFilesChosen}</p>}</div>
      </div>
      {err && <p className="text-sm text-red-500 mt-2">{err}</p>}
    </AntModal>
  );
}

function ConstructionSiteView({ t, lang, project, me, myRole, members, features, canEdit, readOnly, onSetLoggers }) {
  const cfeat = (k) => (features || {})[k] !== false;
  const [tab, setTab] = useState(cfeat("sitelog") ? "site" : "records");
  const loggers = project.siteLoggers || [];
  const canManage = myRole === "owner" || !!(me && me.isLeader);
  const canRecord = canManage || canEdit || (me && loggers.includes(me.id));
  return (
    <div>
      <div className="max-w-4xl mx-auto px-3 md:px-6 pt-4">
        <AntTabs activeKey={tab} onChange={setTab} tabBarStyle={{ marginBottom: 0 }} items={[{ key: "site", label: t.siteTab, show: cfeat("sitelog") }, { key: "records", label: t.recordsTab, show: cfeat("records") }].filter((x) => x.show).map(({ key, label }) => ({ key, label }))} />
      </div>
      {(tab === "site" && cfeat("sitelog")) ? <SiteLogView t={t} lang={lang} project={project} me={me} myRole={myRole} members={members} readOnly={readOnly} onSetLoggers={onSetLoggers} /> : <RecordsView t={t} lang={lang} project={project} canEdit={canRecord} readOnly={readOnly} />}
    </div>
  );
}
function SiteLogView({ t, lang, project, me, myRole, members, readOnly, onSetLoggers }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const loggers = project.siteLoggers || [];
  const canManage = myRole === "owner" || !!(me && me.isLeader);
  const canLog = !readOnly && (canManage || (me && loggers.includes(me.id)));
  const load = async () => { setLoading(true); const r = await api("/api/sitelogs?projectId=" + encodeURIComponent(project.id)); if (r.ok) setLogs(r.body.logs || []); setLoading(false); };
  useEffect(() => { load(); }, [project.id]); // eslint-disable-line
  const openPhoto = async (log, f) => { try { const tok = getToken(); const res = await fetch("/api/sitelogs/photo?logId=" + log.id + "&idx=" + f.idx, { headers: tok ? { Authorization: "Bearer " + tok } : {} }); const blob = await res.blob(); const url = URL.createObjectURL(blob); window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 60000); } catch {} };
  const del = async (log) => { if (!window.confirm(lang === "vi" ? "Xóa nhật ký ngày này?" : "Delete this log?")) return; await api("/api/sitelogs/delete", { method: "POST", body: JSON.stringify({ id: log.id }) }); load(); };
  const fmt = (d) => d ? d.split("-").reverse().join("/") : "";
  const printLog = (log) => {
    const w2 = window.open("", "_blank"); if (!w2) return;
    const esc = (x) => String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const row = (lb, val) => "<tr><td class=\"l\">" + esc(lb) + "</td><td>" + esc(val).replace(/\n/g, "<br>") + "</td></tr>";
    const html = "<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><title>Nhat ky " + esc(fmt(log.date)) + "</title>" +
      "<style>body{font-family:'Times New Roman',serif;font-size:13pt;color:#000;padding:24px;max-width:760px;margin:auto}h1{text-align:center;font-size:15pt;margin:6px 0}.c{text-align:center}.m{font-size:11pt}table{width:100%;border-collapse:collapse;margin-top:14px}td{border:1px solid #000;padding:6px 8px;vertical-align:top}td.l{width:34%;font-weight:bold;background:#f2f2f2}.sign{display:flex;justify-content:space-around;margin-top:40px;text-align:center}.sign div{width:45%}@media print{body{padding:0}}</style></head><body>" +
      "<div class=\"c m\">CÔNG TRÌNH: <b>" + esc(project.name) + "</b></div>" +
      "<h1>NHẬT KÝ THI CÔNG XÂY DỰNG</h1><div class=\"c m\">(Theo Nghị định 06/2021/NĐ-CP)</div><table>" +
      row("Ngày", fmt(log.date)) +
      row("Thời tiết", t.siteAM + ": " + (log.weatherAM || "—") + " · " + t.sitePM + ": " + (log.weatherPM || "—")) +
      row("Nhân lực", log.manpower || "") +
      row("Công việc & khối lượng thực hiện", log.work || "") +
      row("Thiết bị & vật tư", log.equipment || "") +
      row("Vướng mắc / sự cố ảnh hưởng tiến độ", log.issues || "") +
      row("Kế hoạch ngày tiếp theo", log.nextPlan || "") +
      row("Số ảnh hiện trường kèm theo", (log.photos ? log.photos.length : 0)) +
      row("Người lập", log.createdBy || "") +
      "</table><div class=\"sign\"><div>NGƯỜI LẬP<br><span class=\"m\">(Ký, ghi rõ họ tên)</span><br><br><br>" + esc(log.createdBy || "") + "</div><div>CHỈ HUY TRƯỞNG CÔNG TRÌNH<br><span class=\"m\">(Ký, ghi rõ họ tên)</span></div></div>" +
      "<script>window.onload=function(){setTimeout(function(){window.print();},200);}</script></body></html>";
    w2.document.write(html); w2.document.close();
  };
  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><ScrollText size={20} className="text-orange-500" />{t.constructionSite}</h2>
        <div className="flex items-center gap-2">
          {canManage && <button onClick={() => setAssignOpen(true)} className="text-sm text-slate-500 hover:text-orange-600 flex items-center gap-1"><UserCheck size={15} />{t.siteAssign}</button>}
          {canLog && <AntBtn type="primary" icon={<Plus size={16} />} onClick={() => setModal("new")}>{t.addSiteLog}</AntBtn>}
        </div>
      </div>
      {loading ? <p className="text-slate-400 text-sm">…</p> : logs.length === 0 ? (
        <div className="text-center text-slate-400 py-16"><ScrollText size={44} className="mx-auto mb-3 opacity-40" /><p className="text-slate-500">{t.siteNoLogs}</p></div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{fmt(log.date)}</span>
                    {(log.weatherAM || log.weatherPM) && <span className="text-xs text-slate-500">{t.siteAM}: {log.weatherAM || "—"} · {t.sitePM}: {log.weatherPM || "—"}</span>}
                  </div>
                  {log.work && <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap break-words">{log.work}</p>}
                  {log.manpower && <p className="text-xs text-slate-500 mt-0.5">{t.siteManpower}: {log.manpower}</p>}
                  {log.equipment && <p className="text-xs text-slate-500">{t.siteEquip}: {log.equipment}</p>}
                  {log.issues && <p className="text-xs text-amber-600 mt-0.5">⚠ {log.issues}</p>}
                  {log.nextPlan && <p className="text-xs text-slate-500 mt-0.5">{t.siteNext}: {log.nextPlan}</p>}
                  <p className="text-xs text-slate-400 mt-1">{log.createdBy}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0"><button onClick={() => printLog(log)} className="text-xs font-semibold text-slate-400 hover:text-orange-500 px-1.5 py-1 rounded border border-slate-200" title="In PDF (NĐ 06/2021)">PDF</button>{canLog && <><button onClick={() => setModal(log)} className="text-slate-300 hover:text-orange-500 p-1"><Pencil size={15} /></button><button onClick={() => del(log)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={15} /></button></>}</div>
              </div>
              {log.photos.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{log.photos.map((f) => <button key={f.idx} onClick={() => openPhoto(log, f)} className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 min-w-0" style={{ maxWidth: "100%" }}><Download size={14} className="text-slate-400 shrink-0" /><span className="truncate">{f.name}</span></button>)}</div>}
            </div>
          ))}
        </div>
      )}
      {modal && <SiteLogModal t={t} lang={lang} project={project} log={modal === "new" ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {assignOpen && <SiteAssignModal t={t} lang={lang} project={project} members={members} onClose={() => setAssignOpen(false)} onSave={(ids) => { onSetLoggers(ids); setAssignOpen(false); }} />}
    </div>
  );
}
function SiteLogModal({ t, lang, project, log, onClose, onSaved }) {
  const now = new Date(); const iso = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  const [date, setDate] = useState(log ? log.date : iso);
  const [wAM, setWAM] = useState(log ? log.weatherAM : "");
  const [wPM, setWPM] = useState(log ? log.weatherPM : "");
  const [manpower, setManpower] = useState(log ? log.manpower : "");
  const [work, setWork] = useState(log ? log.work : "");
  const [equipment, setEquipment] = useState(log ? log.equipment : "");
  const [issues, setIssues] = useState(log ? log.issues : "");
  const [nextPlan, setNextPlan] = useState(log ? log.nextPlan : "");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inp = "w-full mt-0.5 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400";
  const hasPhotos = (log && log.photos && log.photos.length > 0) || files.length > 0;
  const wBtn = (cur, set) => <div className="flex gap-1.5 mt-0.5">{[["", "—"], [t.wSun, t.wSun], [t.wRain, t.wRain]].map(([v, lbl]) => <button key={v} onClick={() => set(v)} className={`flex-1 text-xs py-1.5 rounded-lg border transition ${cur === v ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{lbl}</button>)}</div>;
  const submit = async () => {
    if (busy) return;
    if (!work.trim() || !hasPhotos) { setErr(t.siteRequired); return; }
    setBusy(true); setErr("");
    const body = { id: log ? log.id : undefined, projectId: project.id, projectName: project.name, date, weatherAM: wAM, weatherPM: wPM, manpower, work, equipment, issues, nextPlan };
    const r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify(body) });
    if (!r.ok) { setErr((r.body && r.body.message) || t.siteRequired); setBusy(false); return; }
    const lid = r.body.log.id;
    for (const f of files) { try { const tok = getToken(); await fetch("/api/sitelogs/photo?logId=" + lid + "&filename=" + encodeURIComponent(f.name), { method: "POST", headers: { ...(tok ? { Authorization: "Bearer " + tok } : {}), "Content-Type": f.type || "application/octet-stream" }, body: f }); } catch {} }
    setBusy(false); onSaved();
  };
  return (
    <AntModal open onCancel={onClose} width={480}
      title={<span className="flex items-center gap-2"><ScrollText size={19} className="text-orange-500" />{t.constructionSite}</span>}
      footer={<AntBtn type="primary" loading={busy} onClick={submit}>{busy ? (lang === "vi" ? "Đang lưu..." : "Saving...") : t.siteSave}</AntBtn>}>
        <div className="space-y-3" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <label className="block"><span className="text-xs text-slate-500">{t.siteDate}</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} /></label>
          <div><span className="text-xs text-slate-500">{t.siteWeather} — {t.siteAM}</span>{wBtn(wAM, setWAM)}</div>
          <div><span className="text-xs text-slate-500">{t.siteWeather} — {t.sitePM}</span>{wBtn(wPM, setWPM)}</div>
          <label className="block"><span className="text-xs text-slate-500">{t.siteManpower}</span><AntInput.TextArea value={manpower} onChange={(e) => setManpower(e.target.value)} rows={2} /></label>
          <label className="block"><span className="text-xs text-slate-500">{t.siteWork} *</span><AntInput.TextArea value={work} onChange={(e) => setWork(e.target.value)} rows={2} /></label>
          <label className="block"><span className="text-xs text-slate-500">{t.siteEquip}</span><AntInput.TextArea value={equipment} onChange={(e) => setEquipment(e.target.value)} rows={2} /></label>
          <label className="block"><span className="text-xs text-slate-500">{t.siteIssues}</span><AntInput.TextArea value={issues} onChange={(e) => setIssues(e.target.value)} rows={2} /></label>
          <label className="block"><span className="text-xs text-slate-500">{t.siteNext}</span><AntInput.TextArea value={nextPlan} onChange={(e) => setNextPlan(e.target.value)} rows={2} /></label>
          <div><span className="text-xs text-slate-500">{t.sitePhotos} *</span><input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="w-full mt-0.5 text-sm" />{files.length > 0 && <p className="text-xs text-slate-400 mt-1">{files.length} {lang === "vi" ? "ảnh mới" : "new photos"}</p>}{log && log.photos && log.photos.length > 0 && <p className="text-xs text-slate-400 mt-1">{log.photos.length} {lang === "vi" ? "ảnh đã có" : "existing"}</p>}</div>
        </div>
        {err && <p className="text-sm text-red-500 mt-2">{err}</p>}
    </AntModal>
  );
}
function SiteAssignModal({ t, lang, project, members, onClose, onSave }) {
  const [sel, setSel] = useState(project.siteLoggers || []);
  const toggle = (id) => setSel((pp) => pp.includes(id) ? pp.filter((x) => x !== id) : [...pp, id]);
  return (
    <AntModal open onCancel={onClose} width={400}
      title={<span className="flex items-center gap-2"><UserCheck size={18} className="text-orange-500" />{t.siteAssign}</span>}
      footer={<AntBtn type="primary" onClick={() => onSave(sel)}>{t.save}</AntBtn>}>
      <p className="text-xs text-slate-400 mb-2">{lang === "vi" ? "Chọn người được lập/sửa nhật ký cho dự án này." : "Pick who can create/edit logs for this project."}</p>
      <div style={{ maxHeight: "50vh", overflowY: "auto" }} className="space-y-1">
        {members.map((m) => <label key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"><AntCheckbox checked={sel.includes(m.id)} onChange={() => toggle(m.id)} /><Avatar name={m.name} size={24} /><span className="text-sm text-slate-700">{m.name}</span></label>)}
      </div>
    </AntModal>
  );
}

function SideItem({ active, onClick, icon, label, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${active ? "text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"}`} style={active ? { background: "#f97316" } : undefined}>
      {icon}<span className="flex-1 text-left">{label}</span>{badge != null && <AntBadge count={badge} size="small" style={{ backgroundColor: active ? "#fff" : "#f97316", color: active ? "#f97316" : "#fff", boxShadow: "none", fontWeight: 600 }} />}
    </button>
  );
}
function Avatar({ name, size = 24, ring }) {
  if (!name) return <span className="rounded-full bg-slate-200 flex items-center justify-center text-slate-400 shrink-0" style={{ width: size, height: size, fontSize: size * 0.42 }}>?</span>;
  return <span className="rounded-full flex items-center justify-center text-white font-semibold shrink-0" style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.4, boxShadow: ring ? "0 0 0 2px #fff, 0 0 0 4px " + ring : "none" }} title={name}>{initials(name)}</span>;
}
function AssigneeStack({ task, memberById, size = 24 }) {
  const ids = task.assignees || [];
  if (ids.length === 0) return null;
  const shown = ids.slice(0, 3);
  return (
    <span className="flex items-center" style={{ paddingLeft: 4 }}>
      {shown.map((id, i) => (
        <span key={id} style={{ marginLeft: i ? -8 : 0, zIndex: 10 - i }} className="inline-block">
          <Avatar name={memberById[id]?.name} size={size} ring={id === task.primaryAssigneeId ? "#f59e0b" : "#fff"} />
        </span>
      ))}
      {ids.length > 3 && <span className="text-xs text-slate-400 ml-1">+{ids.length - 3}</span>}
    </span>
  );
}
function RoleTag({ role, t, mini }) {
  const m = ROLE_META[role] || ROLE_META.member; const Icon = m.icon;
  return <span className="inline-flex items-center gap-1 rounded font-medium" style={{ color: m.color, background: mini ? "transparent" : m.bg, fontSize: mini ? 11 : 12, padding: mini ? 0 : "2px 6px" }}><Icon size={mini ? 11 : 12} />{t.roles[role]}</span>;
}
function DeptTag({ dept, t, size = "sm" }) {
  if (!dept || !DEPT_META[dept]) return null;
  const m = DEPT_META[dept];
  return <span title={t.depts[dept] || dept} className="inline-flex items-center justify-center rounded-full font-semibold align-middle" style={{ color: "#fff", background: m.color, fontSize: size === "sm" ? 9.5 : 10.5, padding: size === "sm" ? "2px 7px" : "2px 8px", letterSpacing: 0.4 }}>{m.abbr}</span>;
}
function MoneyInput({ value, onChange, lang, placeholder, className, onEnter }) {
  return <input value={groupDigits(value === 0 || value ? String(value) : "", lang)} inputMode="numeric" placeholder={placeholder}
    onChange={(e) => { const digits = e.target.value.replace(/[^\d]/g, ""); onChange(digits ? Number(digits) : 0); }}
    onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }} className={className} />;
}
function PriorityFlag({ p, t }) {
  const m = PRIORITY_META[p];
  return <AntTag bordered={false} icon={<Flag size={10} fill={m.color} stroke={m.color} style={{ marginRight: 3 }} />} style={{ background: m.bg, color: m.color, margin: 0, display: "inline-flex", alignItems: "center" }}>{t.priorities[p]}</AntTag>;
}
function DueBadge({ iso, lang }) {
  const m = dueMeta(iso, lang); if (!m) return null;
  return <AntTag bordered={false} color={m.overdue ? "error" : m.soon ? "warning" : "default"} icon={<Clock size={10} style={{ marginRight: 3 }} />} style={{ margin: 0, display: "inline-flex", alignItems: "center" }}>{m.label}</AntTag>;
}
function CommentCount({ n }) { if (!n) return null; return <span className="inline-flex items-center gap-0.5 text-xs text-slate-400"><MessageSquare size={11} />{n}</span>; }
function SubtaskBadge({ subtasks, mini }) {
  if (!subtasks || subtasks.length === 0) return null;
  const done = subtasks.filter((s) => s.done).length, total = subtasks.length;
  const all = done === total;
  const color = all ? "#10b981" : "#f97316";
  return <AntTag bordered={false} icon={<CheckCircle2 size={mini ? 11 : 12} style={{ marginRight: 3 }} />} style={{ background: all ? "#ecfdf5" : "#fff7ed", color, margin: 0, display: "inline-flex", alignItems: "center", fontWeight: 600 }} title={`${done}/${total}`}>{done}/{total}</AntTag>;
}
function DepBadge({ blocked }) {
  if (!blocked) return null;
  return <AntTag bordered={false} color="warning" icon={<Network size={11} />} style={{ margin: 0 }} title="blocked" />;
}
function WorkBar({ v, w = 56 }) {
  const c = v >= 100 ? "#10b981" : v > 0 ? "#f97316" : "#cbd5e1";
  return (
    <span className="inline-flex items-center gap-1" title={"Workdone " + v + "%"}>
      <span style={{ width: w, display: "inline-block" }}><AntProgress percent={v} showInfo={false} strokeColor={c} size="small" /></span>
      <span className="text-xs tabular-nums" style={{ color: c, minWidth: 30 }}>{v}%</span>
    </span>
  );
}

/* ============================ LIST VIEW ============================ */
function ListView({ t, lang, canEdit, memberById, sections, tasks, blockedIds, onToggle, onOpenTask, onQuickAdd, onAddSection, onImport }) {
  const [adding, setAdding] = useState({});
  const [newSection, setNewSection] = useState(false);
  const [sectionName, setSectionName] = useState("");
  if (sections.length === 0) return <Empty t={t} />;
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {sections.map((sec) => {
        const items = tasks.filter((x) => x.status === sec.id).sort((a, b) => (a.completed - b.completed) || (a.order - b.order));
        return (
          <section key={sec.id}>
            <div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-slate-700">{sec.name}</h3><span className="text-xs text-slate-400">{items.length}</span></div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {items.map((task) => <TaskRow key={task.id} task={task} t={t} lang={lang} canEdit={canEdit} memberById={memberById} blocked={blockedIds && blockedIds.has(task.id)} onToggle={onToggle} onOpen={() => onOpenTask(task.id)} />)}
              {items.length === 0 && <div className="px-4 py-3 text-sm text-slate-400">{t.allTasksDone}</div>}
              {canEdit && (adding[sec.id] ? (
                <AntInput autoFocus placeholder={t.quickAdd} variant="borderless" style={{ padding: "8px 16px" }}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) { onQuickAdd(sec.id, e.target.value.trim()); e.target.value = ""; } if (e.key === "Escape") setAdding((a) => ({ ...a, [sec.id]: false })); }}
                  onBlur={() => setAdding((a) => ({ ...a, [sec.id]: false }))} />
              ) : (
                <button onClick={() => setAdding((a) => ({ ...a, [sec.id]: true }))} className="w-full px-4 py-2.5 text-sm text-slate-400 hover:text-orange-600 hover:bg-slate-50 text-left flex items-center gap-1.5 transition"><Plus size={15} />{t.addTask}</button>
              ))}
            </div>
          </section>
        );
      })}
      {canEdit && onAddSection && (newSection ? (
        <div className="flex gap-2">
          <AntInput autoFocus value={sectionName} onChange={(e) => setSectionName(e.target.value)} placeholder={t.sectionName} style={{ width: 220 }}
            onKeyDown={(e) => { if (e.key === "Enter") { onAddSection(sectionName); setSectionName(""); setNewSection(false); } if (e.key === "Escape") setNewSection(false); }} />
          <AntBtn type="primary" onClick={() => { onAddSection(sectionName); setSectionName(""); setNewSection(false); }}>{t.create}</AntBtn>
        </div>
      ) : (
        <button onClick={() => setNewSection(true)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 transition"><Plus size={15} />{t.addSection}</button>
      ))}
      {canEdit && onImport && <label className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 cursor-pointer"><Download size={15} style={{ transform: "rotate(180deg)" }} />{lang === "vi" ? "Nhập CSV" : "Import CSV"}<input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) { const rd = new FileReader(); rd.onload = () => onImport(String(rd.result || "")); rd.readAsText(f, "utf-8"); e.target.value = ""; } }} /></label>}
    </div>
  );
}
function TaskRow({ task, t, lang, canEdit, memberById, blocked, onToggle, onOpen }) {
  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition" onClick={onOpen}>
      <button onClick={(e) => { e.stopPropagation(); if (canEdit) onToggle(task.id, !task.completed); }} className="shrink-0" disabled={!canEdit}>
        {task.completed ? <CheckCircle2 size={19} className="text-green-500" /> : <Circle size={19} className={`text-slate-300 ${canEdit ? "group-hover:text-orange-400" : ""} transition`} />}
      </button>
      <span className={`flex-1 text-sm truncate ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{task.title || <span className="italic text-slate-400">{t.untitled}</span>}</span>
      <div className="flex items-center gap-2 shrink-0">
        <WorkBar v={task.workdone || 0} />
        <SubtaskBadge subtasks={task.subtasks} />
        <DepBadge blocked={blocked} />
        <CommentCount n={task.comments?.length} />
        {task.reminderLead ? <Bell size={13} className="text-amber-500" /> : null}
        {task.dueDate && <DueBadge iso={task.dueDate} lang={lang} />}
        <PriorityFlag p={task.priority} t={t} />
        <AssigneeStack task={task} memberById={memberById} size={24} />
      </div>
    </div>
  );
}

/* ============================ BOARD VIEW ============================ */
function BoardView({ t, lang, canEdit, memberById, sections, tasks, blockedIds, onMove, onOpenTask, onQuickAdd, onAddSection }) {
  const [dragId, setDragId] = useState(null);
  const [overSec, setOverSec] = useState(null);
  const [adding, setAdding] = useState({});
  const [newSecName, setNewSecName] = useState("");
  const [addingSec, setAddingSec] = useState(false);
  if (sections.length === 0) return <Empty t={t} />;
  return (
    <div className="p-4 md:p-6 h-full">
      <div className="flex gap-4 h-full items-start overflow-x-auto pb-4">
        {sections.map((sec) => {
          const items = tasks.filter((x) => x.status === sec.id).sort((a, b) => (a.completed - b.completed) || (a.order - b.order));
          return (
            <div key={sec.id}
              onDragOver={(e) => { if (canEdit) { e.preventDefault(); setOverSec(sec.id); } }}
              onDragLeave={() => setOverSec((s) => (s === sec.id ? null : s))}
              onDrop={() => { if (dragId && canEdit) onMove(dragId, sec.id); setDragId(null); setOverSec(null); }}
              className={`w-72 shrink-0 bg-slate-100 rounded-xl flex flex-col max-h-full transition ${overSec === sec.id ? "ring-2 ring-orange-400 bg-orange-50/50" : ""}`}>
              <div className="px-3 py-2.5 flex items-center gap-2"><h3 className="font-semibold text-sm text-slate-700">{sec.name}</h3><span className="text-xs text-slate-400">{items.length}</span></div>
              <div className="px-2 flex-1 overflow-y-auto space-y-2" style={{ minHeight: 40 }}>
                {items.map((task) => { const overdue = task.dueDate && !task.completed && new Date(task.dueDate + "T00:00:00") < today0(); return (
                  <div key={task.id} draggable={canEdit} onDragStart={() => setDragId(task.id)} onDragEnd={() => { setDragId(null); setOverSec(null); }}
                    onClick={() => onOpenTask(task.id)} style={overdue ? { borderLeft: "3px solid #ef4444" } : undefined} className={`bg-white rounded-xl border border-slate-200 shadow-sm p-3 cursor-pointer hover:shadow-md transition ${dragId === task.id ? "opacity-40" : ""}`}>
                    <div className="h-1.5 rounded-full mb-2.5" style={{ width: 46, background: (PRIORITY_META[task.priority] || PRIORITY_META.medium).color }} />
                    <p className={`text-sm font-medium ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{task.title || <span className="italic text-slate-400">{t.untitled}</span>}</p>
                    {task.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{task.tags.map((tag) => <AntTag key={tag} bordered={false} style={{ ...tagStyle(tag), margin: 0, borderRadius: 10 }}>{tag}</AntTag>)}</div>}
                    <div className="mt-2 flex items-center gap-2"><WorkBar v={task.workdone || 0} w={72} /><SubtaskBadge subtasks={task.subtasks} mini /><DepBadge blocked={blockedIds && blockedIds.has(task.id)} /></div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <PriorityFlag p={task.priority} t={t} />
                      {task.dueDate && <DueBadge iso={task.dueDate} lang={lang} />}
                      {task.reminderLead ? <Bell size={12} className="text-amber-500" /> : null}
                      <CommentCount n={task.comments?.length} />
                      <div className="flex-1" />
                      <AssigneeStack task={task} memberById={memberById} size={22} />
                    </div>
                    {task.status === "done" && task.approvedBy && <div className="mt-2 text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} className="shrink-0" /><span className="truncate">{lang === "vi" ? "Duyệt" : "Approved"}: {task.approvedBy}{task.completedAt ? " · " + new Date(task.completedAt).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}</span></div>}
                  </div>
                ); })}
              </div>
              {canEdit && (
                <div className="p-2">
                  {adding[sec.id] ? (
                    <AntInput autoFocus placeholder={t.quickAdd}
                      onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) { onQuickAdd(sec.id, e.target.value.trim()); e.target.value = ""; } if (e.key === "Escape") setAdding((a) => ({ ...a, [sec.id]: false })); }}
                      onBlur={() => setAdding((a) => ({ ...a, [sec.id]: false }))} />
                  ) : (
                    <button onClick={() => setAdding((a) => ({ ...a, [sec.id]: true }))} className="w-full flex items-center gap-1.5 px-2.5 py-2 text-sm text-slate-500 hover:text-orange-600 hover:bg-white rounded-lg transition"><Plus size={15} />{t.addTask}</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {canEdit && onAddSection && (
          <div className="w-72 shrink-0">
            {addingSec ? (
              <div className="bg-slate-100 rounded-xl p-2 flex gap-2">
                <AntInput autoFocus value={newSecName} onChange={(e) => setNewSecName(e.target.value)} placeholder={t.sectionName} style={{ flex: 1 }}
                  onKeyDown={(e) => { if (e.key === "Enter") { onAddSection(newSecName); setNewSecName(""); setAddingSec(false); } if (e.key === "Escape") setAddingSec(false); }} />
              </div>
            ) : (
              <button onClick={() => setAddingSec(true)} className="w-full flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"><Plus size={15} />{t.addSection}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ CALENDAR VIEW ============================ */
function CalendarView({ t, lang, tasks, onOpenTask }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [dayModal, setDayModal] = useState(null);
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = []; for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const tasksOn = (d) => { const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; return tasks.filter((x) => x.dueDate === iso); };
  const td = today0();
  const isToday = (d) => td.getFullYear() === year && td.getMonth() === month && td.getDate() === d;
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t.months[month]} {year}</h3>
        <div className="flex gap-1">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-slate-100"><ChevronLeft size={18} /></button>
          <button onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }} className="px-3 py-2 text-sm rounded-lg hover:bg-slate-100">{t.today}</button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-slate-100"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
        {t.weekdays.map((w) => <div key={w} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500">{w}</div>)}
        {cells.map((d, i) => (
          <div key={i} className="bg-white p-1.5" style={{ minHeight: 96 }}>
            {d && (<>
              <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(d) ? "bg-orange-600 text-white" : "text-slate-500"}`}>{d}</div>
              <div className="space-y-1">
                {tasksOn(d).slice(0, 3).map((task) => { const m = PRIORITY_META[task.priority]; return (
                  <button key={task.id} onClick={() => onOpenTask(task.id)} className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate hover:opacity-80 ${task.completed ? "line-through opacity-50" : ""}`} style={{ background: m.bg, color: m.color }} title={task.title}>{task.title || t.untitled}</button>
                ); })}
                {tasksOn(d).length > 3 && <button onClick={() => setDayModal({ d, items: tasksOn(d) })} className="w-full text-left text-xs text-orange-600 hover:underline px-1.5 font-medium">+{tasksOn(d).length - 3} {t.more}</button>}
              </div>
            </>)}
          </div>
        ))}
      </div>
      {dayModal && (
        <AntModal open onCancel={() => setDayModal(null)} footer={null} width={400}
          title={dayModal.d + " " + t.months[month] + " " + year + " · " + dayModal.items.length}>
          <div className="space-y-1.5" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {dayModal.items.map((task) => { const m = PRIORITY_META[task.priority]; return (
              <button key={task.id} onClick={() => { onOpenTask(task.id); setDayModal(null); }} className={`w-full text-left text-sm px-3 py-2 rounded-lg hover:opacity-90 break-words ${task.completed ? "line-through opacity-50" : ""}`} style={{ background: m.bg, color: m.color }}>{task.title || t.untitled}</button>
            ); })}
          </div>
        </AntModal>
      )}
    </div>
  );
}

/* ============================ DASHBOARD ============================ */
function Dashboard({ t, lang, projects, tasks, onOpenProject, onOpenTask, members, memberById }) {
  const [dashProject, setDashProject] = useState("");
  const scope = dashProject ? tasks.filter((x) => x.projectId === dashProject) : tasks;
  const total = scope.length, done = scope.filter((x) => x.completed).length;
  const overdue = scope.filter((x) => !x.completed && x.dueDate && new Date(x.dueDate + "T00:00:00") < today0()).length;
  const active = total - done - overdue;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const byPriority = PRIORITY_ORDER.map((p) => ({ p, n: scope.filter((x) => x.priority === p && !x.completed).length }));
  const maxP = Math.max(1, ...byPriority.map((x) => x.n));
  const upTasks = scope.filter((x) => !x.completed && x.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upMap = {}; upTasks.forEach((tk) => { (upMap[tk.projectId] = upMap[tk.projectId] || []).push(tk); });
  const upGroups = Object.keys(upMap).map((pid) => ({ proj: projects.find((p) => p.id === pid), items: upMap[pid] })).filter((g) => g.proj).sort((a, b) => a.items[0].dueDate.localeCompare(b.items[0].dueDate));
  const cards = [
    { label: t.statTotal, val: total, icon: <LayoutList size={20} />, c: "#f97316" },
    { label: t.statDone, val: done, icon: <CheckCircle2 size={20} />, c: "#10b981" },
    { label: t.statOverdue, val: overdue, icon: <AlertTriangle size={20} />, c: "#ef4444" },
    { label: t.statProgress, val: pct + "%", icon: <CircleDot size={20} />, c: "#f59e0b" },
  ];
  const statusSegs = [
    { label: t.statusDone, value: done, color: "#10b981" },
    { label: t.statusActive, value: active < 0 ? 0 : active, color: "#f97316" },
    { label: t.statusOverdue, value: overdue, color: "#ef4444" },
  ];
  // distribution by person (open tasks per assignee)
  const personRows = (members || []).map((m) => ({
    label: m.name, color: avatarColor(m.name), dept: m.dept,
    value: scope.filter((x) => !x.completed && (x.assignees || []).includes(m.id)).length,
  })).filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  const unassigned = scope.filter((x) => !x.completed && (!x.assignees || x.assignees.length === 0)).length;
  if (unassigned > 0) personRows.push({ label: t.unassigned, color: "#cbd5e1", value: unassigned });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs text-slate-400 flex items-center gap-1.5"><RefreshCw size={12} />{t.realtimeNote}</span>
        <AntSelect value={dashProject} onChange={(v) => setDashProject(v)} style={{ minWidth: 190 }} options={[{ value: "", label: t.allProjectsLabel }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.c + "1a", color: c.c }}>{c.icon}</span>
            <div className="text-3xl font-bold mt-3" style={{ color: c.c }}>{c.val}</div>
            <div className="text-sm text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">{t.chartStatus}</h3>
          {total === 0 ? <p className="text-sm text-slate-400">{t.nothingUpcoming}</p> : (
            <div className="flex flex-col items-center">
              <Donut segments={statusSegs} size={170} thickness={26} centerLabel={pct + "%"} centerSub={t.statDone} />
              <ChartLegend items={statusSegs} />
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">{t.chartByAssignee}</h3>
          {personRows.length === 0 ? <p className="text-sm text-slate-400">{t.nothingUpcoming}</p> : <HBars rows={personRows} lang={lang} t={t} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">{t.byPriority}</h3>
          <div className="space-y-3">
            {byPriority.map(({ p, n }) => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-20 text-sm text-slate-600">{t.priorities[p]}</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(n / maxP) * 100}%`, background: PRIORITY_META[p].color }} /></div>
                <span className="w-6 text-right text-sm font-medium text-slate-600">{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">{t.upcoming}</h3>
          {upGroups.length === 0 ? <p className="text-sm text-slate-400">{t.nothingUpcoming}</p> : (
            <div className="space-y-4" style={{ maxHeight: 340, overflowY: "auto" }}>{upGroups.map((g) => (
              <div key={g.proj.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.proj.color }} />
                  <button onClick={() => onOpenProject(g.proj.id)} className="text-sm font-semibold text-slate-700 hover:text-orange-600 transition truncate">{g.proj.name}</button>
                  <span className="text-xs text-slate-400 shrink-0">{g.items.length}</span>
                </div>
                <div className="space-y-1 pl-3 ml-1 border-l-2" style={{ borderColor: g.proj.color + "55" }}>
                  {g.items.map((task) => { const sd = (task.subtasks || []).filter((s) => s.done).length; return (
                    <button key={task.id} onClick={() => onOpenTask(task.id)} className="w-full flex items-center gap-2.5 text-left p-2 -mx-2 rounded-lg hover:bg-slate-50 transition">
                      {task.completed ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> : <Circle size={14} className="text-slate-300 shrink-0" />}
                      <span className="flex-1 text-sm text-slate-700 truncate">{task.title || t.untitled}</span>
                      {(task.subtasks || []).length > 0 && <span className="text-xs text-slate-400 flex items-center gap-0.5 shrink-0"><ListChecks size={12} />{sd}/{task.subtasks.length}</span>}
                      <DueBadge iso={task.dueDate} lang={lang} />
                    </button>
                  ); })}
                </div>
              </div>
            ))}</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold mb-4">{t.projectProgress}</h3>
        <div className="space-y-4">
          {projects.map((p) => {
            const ptasks = tasks.filter((x) => x.projectId === p.id); const pd = ptasks.filter((x) => x.completed).length;
            const ppct = ptasks.length ? Math.round((pd / ptasks.length) * 100) : 0;
            return (
              <button key={p.id} onClick={() => onOpenProject(p.id)} className="w-full text-left group">
                <div className="flex items-center gap-2 mb-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} /><span className="text-sm font-medium text-slate-700 group-hover:text-orange-600 transition">{p.name}</span><span className="text-xs text-slate-400">{pd}/{ptasks.length}</span><span className="ml-auto text-xs font-medium text-slate-500">{ppct}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${ppct}%`, background: p.color }} /></div>
              </button>
            );
          })}
          {projects.length === 0 && <p className="text-sm text-slate-400">{t.welcomeHint}</p>}
        </div>
      </div>
    </div>
  );
}

/* ============================ MY WORK ============================ */
function MyWork({ t, lang, me, tasks, projects, memberById, onOpenTask }) {
  const mineAll = me ? tasks.filter((x) => (x.assignees || []).includes(me.id)) : [];
  const pendingApproval = me ? tasks.filter((x) => x.status === "review" && (me.role === "owner" || (x.approver === "leader" ? me.isLeader : me.isTeamlead))) : [];
  const mine = mineAll.filter((x) => !x.completed && x.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const groups = { overdue: [], today: [], upcoming: [] };
  mine.forEach((x) => { const d = new Date(x.dueDate + "T00:00:00");
    if (d < today0()) groups.overdue.push(x); else if (d.getTime() === today0().getTime()) groups.today.push(x); else groups.upcoming.push(x); });
  const noDate = mineAll.filter((x) => !x.completed && !x.dueDate);
  const Section = ({ label, items, color }) => items.length === 0 ? null : (
    <section>
      <div className="flex items-center gap-2 mb-2"><span className="w-2 h-2 rounded-full" style={{ background: color }} /><h3 className="font-semibold text-slate-700">{label}</h3><span className="text-xs text-slate-400">{items.length}</span></div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {items.map((task) => { const proj = projects.find((p) => p.id === task.projectId); const isPrimary = task.primaryAssigneeId === me?.id; return (
          <div key={task.id} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition" onClick={() => onOpenTask(task.id)}>
            {isPrimary ? <Star size={16} className="text-amber-500 shrink-0" fill="#f59e0b" /> : <span className="w-4 shrink-0" />}
            <span className="flex-1 text-sm text-slate-700 truncate">{task.title || t.untitled}</span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2 h-2 rounded-full" style={{ background: proj?.color }} />{proj?.name}</span>
            <WorkBar v={task.workdone || 0} />
            <DueBadge iso={task.dueDate} lang={lang} /><PriorityFlag p={task.priority} t={t} />
          </div>); })}
      </div>
    </section>
  );
  const empty = mineAll.filter((x) => !x.completed).length === 0 && pendingApproval.length === 0;
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {!me && <p className="text-sm text-slate-400">{t.pickIdentity}</p>}
      {me && empty && <div className="text-center py-16 text-slate-400"><CheckCircle2 size={48} className="mx-auto mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.allTasksDone}</p></div>}
      <Section label={t.statuses.review} items={pendingApproval} color="#d97706" />
      <Section label={t.overdue} items={groups.overdue} color="#ef4444" />
      <Section label={t.today} items={groups.today} color="#f59e0b" />
      <Section label={t.upcoming} items={groups.upcoming} color="#f97316" />
      <Section label={t.noDate} items={noDate} color="#94a3b8" />
    </div>
  );
}


function DailyReportView({ t, lang, me, myRole, currentUserId, members, memberById, tasks, projects, dailyReports, onSave, onComment, reportDeadline, onOpenTask }) {
  const projNameOf = (taskId) => { const tk = tasks.find((x) => x.id === taskId); const pr = tk && (projects || []).find((p) => p.id === tk.projectId); return pr ? pr.name : ""; };
  const projColorOf = (taskId) => { const tk = tasks.find((x) => x.id === taskId); const pr = tk && (projects || []).find((p) => p.id === tk.projectId); return pr ? pr.color : "#94a3b8"; };
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const todayISO = () => iso(new Date());
  const [selDate, setSelDate] = useState(todayISO());
  const [selMember, setSelMember] = useState(currentUserId);
  const [cmt, setCmt] = useState("");
  const [ym, setYm] = useState(() => todayISO().slice(0, 7));
  const canViewAll = myRole === "owner" || (me && me.position === "leader");
  const viewable = canViewAll ? members : ((me && me.position === "deputy") ? members.filter((m) => m.isTeamlead || m.id === currentUserId) : (me && me.isTeamlead ? members.filter((m) => (m.dept || "") === (me.dept || "") || m.id === currentUserId) : members.filter((m) => m.id === currentUserId)));
  const reportOf = (mid, date) => dailyReports.find((r) => r.memberId === mid && r.date === date);
  const isTodayTs = (ts) => { if (!ts) return false; const d = new Date(ts); return iso(d) === todayISO(); };
  const isOwn = selMember === currentUserId;
  const editable = isOwn && Date.now() <= reportDeadline(selDate);
  const existing = reportOf(currentUserId, selDate);
  const myProjectTasks = tasks.filter((x) => (x.assignees || []).includes(currentUserId));
  const autoTasks = tasks.filter((x) => (x.assignees || []).includes(currentUserId) && (x.status === "todo" || x.status === "doing" || x.status === "review"));
  const buildItems = () => {
    const its = (existing && existing.items ? existing.items : []).map((it) => ({ ...it })).filter((it) => { if (!it.taskId) return true; const tk = tasks.find((x) => x.id === it.taskId); return !tk || tk.status !== "done"; });
    const have = new Set(its.map((it) => it.taskId).filter(Boolean));
    autoTasks.forEach((tk) => { if (!have.has(tk.id)) its.push({ id: uid(), taskId: tk.id, taskTitle: tk.title, moTa: "", pct: tk.primaryAssigneeId === currentUserId ? (tk.workdone || 0) : null, vuongMac: "" }); });
    if (its.length === 0) its.push({ id: uid(), taskId: "", taskTitle: "", moTa: "", pct: null, vuongMac: "" });
    return its;
  };
  const [items, setItems] = useState(buildItems);
  useEffect(() => { setItems(buildItems()); }, [selDate, selMember, dailyReports.length]); // eslint-disable-line
  const setItem = (id, k, v) => setItems((p) => p.map((it) => it.id === id ? { ...it, [k]: v } : it));
  const addLine = () => setItems((p) => [...p, { id: uid(), taskId: "", taskTitle: "", moTa: "", pct: null, vuongMac: "" }]);
  const removeLine = (id) => setItems((p) => p.filter((it) => it.id !== id));
  const canSubmit = items.some((it) => (it.moTa || "").trim());
  const submit = () => { if (!canSubmit) return; onSave(selDate, items.map((it) => ({ ...it, taskTitle: it.taskId ? ((tasks.find((x) => x.id === it.taskId) || {}).title || it.taskTitle) : it.taskTitle }))); };
  const viewRep = reportOf(selMember, selDate);
  const fmtDate = (d) => d.split("-").reverse().join("/");
  const [Y, Mo] = ym.split("-").map(Number);
  const dim = new Date(Y, Mo, 0).getDate();
  const WD = lang === "vi" ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const mdays = []; for (let d = 1; d <= dim; d++) { const dd = new Date(Y, Mo - 1, d); const wd = dd.getDay(); mdays.push({ d, iso: ym + "-" + String(d).padStart(2, "0"), wd, weekend: wd === 0 }); }
  const shiftMonth = (k) => { const dd = new Date(Y, Mo - 1 + k, 1); setYm(dd.getFullYear() + "-" + String(dd.getMonth() + 1).padStart(2, "0")); };
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><CalendarDays size={20} className="text-orange-500" />{t.dailyReport}</h2>
        <div className="flex-1" />
        <AntSelect value={selMember} onChange={(v) => setSelMember(v)} showSearch optionFilterProp="label" style={{ minWidth: 180 }} options={viewable.map((m) => ({ value: m.id, label: m.id === currentUserId ? t.myReports : m.name }))} />
        <input type="date" value={selDate} onChange={(e) => setSelDate(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5" />
      </div>

      {viewable.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-slate-700">{t.reportTracking}</span>
            <div className="flex-1" />
            <button onClick={() => shiftMonth(-1)} className="p-1 rounded hover:bg-slate-100"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium">{lang === "vi" ? "Tháng " + Mo : "" + Mo} / {Y}</span>
            <button onClick={() => shiftMonth(1)} className="p-1 rounded hover:bg-slate-100"><ChevronRight size={16} /></button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ position: "sticky", left: 0, background: "#fff", textAlign: "left", padding: "3px 8px", color: "#64748b", fontWeight: 500, minWidth: 120 }}>{lang === "vi" ? "Thành viên" : "Member"}</th>
                  {mdays.map((day) => <th key={day.d} style={{ padding: "2px 0", width: 22, color: day.weekend ? "#cbd5e1" : "#94a3b8", fontWeight: 500, background: day.weekend ? "#f1f5f9" : "#fff" }}>{WD[day.wd]}<div style={{ color: day.weekend ? "#cbd5e1" : "#475569" }}>{day.d}</div></th>)}
                </tr>
              </thead>
              <tbody>
                {viewable.filter((m) => !(m.noReport === true || m.role === "owner")).map((m) => (
                  <tr key={m.id}>
                    <td style={{ position: "sticky", left: 0, background: "#fff", padding: "3px 8px", color: "#334155", whiteSpace: "nowrap", borderTop: "1px solid #f1f5f9" }}>{m.name}</td>
                    {mdays.map((day) => { const r = reportOf(m.id, day.iso); const past = Date.now() > reportDeadline(day.iso); const future = day.iso > todayISO();
                      let mark = null, bg = "#fff";
                      if (day.weekend) { bg = "#f1f5f9"; }
                      else if (r) { mark = <CheckCircle2 size={13} style={{ color: "#22c55e" }} />; }
                      else if (past) { mark = <span style={{ color: "#ef4444", fontWeight: 700 }}>✕</span>; }
                      return <td key={day.d} onClick={() => { if (!day.weekend) { setSelMember(m.id); setSelDate(day.iso); } }} style={{ textAlign: "center", padding: "3px 0", background: bg, borderTop: "1px solid #f1f5f9", cursor: day.weekend ? "default" : "pointer" }}>{mark}</td>; })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500"><span className="flex items-center gap-1"><CheckCircle2 size={12} style={{ color: "#22c55e" }} />{t.reportSubmitted}</span><span className="flex items-center gap-1"><span style={{ color: "#ef4444", fontWeight: 700 }}>✕</span>{t.reportMissing}</span></div>
        </div>
      )}

      {editable ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">{selDate === todayISO() ? t.todayReport : (t.dailyReport + " " + fmtDate(selDate))}</h3>
            {existing && existing.submittedAt ? <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={13} />{t.reportSubmitted}</span> : null}
          </div>
          <p className="text-xs text-slate-400">{t.reportDeadlineNote}</p>
          {items.map((it) => { const tk = tasks.find((x) => x.id === it.taskId); const isPrim = tk && tk.primaryAssigneeId === currentUserId; return (
            <div key={it.id} className="rounded-lg border border-slate-200 p-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <AntSelect value={it.taskId} onChange={(v) => setItem(it.id, "taskId", v)} style={{ flex: 1 }} showSearch optionFilterProp="label"
                  options={[{ value: "", label: t.reportSel }, ...(projects || []).map((pr) => ({ label: pr.name, title: pr.name, options: myProjectTasks.filter((tk2) => tk2.projectId === pr.id).map((tk2) => ({ value: tk2.id, label: (tk2.title || t.untitled) })) })).filter((g) => g.options.length > 0)]} />
                {isPrim && <span className="text-xs text-amber-600 whitespace-nowrap flex items-center gap-0.5"><Star size={11} fill="#f59e0b" />{t.primary}</span>}
                <button onClick={() => removeLine(it.id)} className="text-slate-300 hover:text-red-500 p-1"><X size={15} /></button>
              </div>
              <AntInput.TextArea value={it.moTa} onChange={(e) => setItem(it.id, "moTa", e.target.value)} rows={2} placeholder={t.reportWhatDone + " *"} />
              <div className="flex items-center gap-2">
                <AntInput type="number" min="0" max="100" value={it.pct == null ? "" : it.pct} onChange={(e) => setItem(it.id, "pct", e.target.value)} placeholder={t.reportPct} style={{ width: 112 }} />
                <AntInput value={it.vuongMac} onChange={(e) => setItem(it.id, "vuongMac", e.target.value)} placeholder={t.reportIssue} style={{ flex: 1 }} />
              </div>
            </div>
          ); })}
          <button onClick={addLine} className="text-sm text-orange-600 hover:underline flex items-center gap-1"><Plus size={15} />{t.reportAddLine}</button>
          <AntBtn type="primary" size="large" block onClick={submit} disabled={!canSubmit}>{t.submitReport}</AntBtn>
          {existing && <ReportComments t={t} lang={lang} report={existing} me={me} currentUserId={currentUserId} memberById={memberById} onComment={onComment} />}
        </div>
      ) : viewRep ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-slate-700">{t.reportOf} {viewRep.memberName} · {fmtDate(selDate)}</h3>
          {(() => {
            const groups = [], idx = {};
            (viewRep.items || []).forEach((it) => { const tk = it.taskId ? tasks.find((x) => x.id === it.taskId) : null; const pid = tk ? tk.projectId : "__none__"; if (idx[pid] == null) { idx[pid] = groups.length; groups.push({ pid, items: [] }); } groups[idx[pid]].items.push(it); });
            return groups.map((g) => { const pr = (projects || []).find((x) => x.id === g.pid); return (
              <div key={g.pid} className="space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b-2 border-orange-100">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: pr ? pr.color : "#94a3b8" }} />
                  <h4 className="text-base font-bold text-slate-800 truncate flex-1">{pr ? pr.name : (lang === "vi" ? "Không thuộc dự án" : "No project")}</h4>
                  <span className="text-xs text-slate-400 shrink-0">{g.items.length} {lang === "vi" ? "việc" : "tasks"}</span>
                </div>
                {g.items.map((it) => (
                  <div key={it.id} className="rounded-lg border border-slate-200 p-2.5 ml-1">
                    {it.taskId ? <button onClick={() => onOpenTask(it.taskId)} className="text-sm font-medium text-orange-600 hover:underline text-left">{it.taskTitle || ((tasks.find((x) => x.id === it.taskId) || {}).title) || t.untitled}</button> : null}
                    <p className="text-sm text-slate-700 whitespace-pre-wrap mt-0.5">{it.moTa}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">{it.pct != null && <span>{it.pct}%</span>}{it.vuongMac && <span className="text-amber-600">⚠ {it.vuongMac}</span>}</div>
                  </div>
                ))}
              </div>
            ); });
          })()}
          <ReportComments t={t} lang={lang} report={viewRep} me={me} currentUserId={currentUserId} memberById={memberById} onComment={onComment} />
        </div>
      ) : (
        <div className="text-center text-slate-400 py-16"><CalendarDays size={44} className="mx-auto mb-3 opacity-40" /><p className="text-slate-500">{(isOwn ? (Date.now() > reportDeadline(selDate) ? t.reportMissing : t.reportNone) : t.reportMissing)}</p></div>
      )}
    </div>
  );
}
function ReportComments({ t, lang, report, me, currentUserId, memberById, onComment }) {
  const [text, setText] = useState({});
  if (!me) return null;
  const isOwner = currentUserId === report.memberId;
  const all = report.comments || [];
  const visible = all.filter((c) => isOwner || c.reviewerId === currentUserId || c.authorId === currentUserId);
  const threadIds = isOwner ? Array.from(new Set(visible.map((c) => c.reviewerId).filter(Boolean))) : [currentUserId];
  const send = (rid) => { const v = (text[rid] || "").trim(); if (v) { onComment(report.id, v, rid); setText((p) => ({ ...p, [rid]: "" })); } };
  const nameOf = (id) => (memberById && memberById[id] ? memberById[id].name : "?");
  return (
    <div className="pt-3 border-t border-slate-100 space-y-2.5">
      <p className="text-xs text-slate-400">{lang === "vi" ? "🔒 Trao đổi riêng tư — chỉ bạn và người kia đọc được" : "🔒 Private thread — only you two can read"}</p>
      {threadIds.length === 0 && isOwner && <p className="text-xs text-slate-400">{lang === "vi" ? "Chưa có trao đổi." : "No messages yet."}</p>}
      {threadIds.map((rid) => {
        const thread = visible.filter((c) => c.reviewerId === rid);
        return (
          <div key={rid} className="rounded-xl bg-slate-50 p-2.5">
            {isOwner && <div className="text-xs font-semibold text-slate-500 mb-1.5">{nameOf(rid)}</div>}
            <div className="space-y-2 mb-2">
              {thread.map((c) => (
                <div key={c.id} className="flex gap-2"><Avatar name={c.author} size={22} /><div className="flex-1 min-w-0"><div className="flex items-baseline gap-2"><span className="text-sm font-medium text-slate-700">{c.author}</span><span className="text-xs text-slate-400">{relTime(c.ts, lang)}</span></div><p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{c.text}</p></div></div>
              ))}
              {thread.length === 0 && <p className="text-xs text-slate-400">—</p>}
            </div>
            <div className="flex gap-2 items-end"><Avatar name={me.name} size={22} /><AntInput value={text[rid] || ""} onChange={(e) => setText((p) => ({ ...p, [rid]: e.target.value }))} onPressEnter={() => send(rid)} placeholder={t.reportComment} /><AntBtn type="primary" icon={<Send size={16} />} disabled={!(text[rid] || "").trim()} onClick={() => send(rid)} /></div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================ FINANCE VIEW ============================ */

function InstallmentList({ items, t, lang, label, color, onAdd, onDelete, onEdit }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState(null);
  const [eDate, setEDate] = useState(""); const [eAmount, setEAmount] = useState(0); const [eNote, setENote] = useState("");
  const add = () => { const a = Number(amount) || 0; if (a === 0) return; onAdd({ id: uid(), date, amount: a, note: note.trim() }); setAmount(0); setNote(""); };
  const startEdit = (it) => { setEditId(it.id); setEDate(it.date || ""); setEAmount(it.amount || 0); setENote(it.note || ""); };
  const saveEdit = () => { const a = Number(eAmount) || 0; if (a === 0) return; onEdit && onEdit(editId, { date: eDate, amount: a, note: eNote.trim() }); setEditId(null); };
  const total = sumItems(items);
  return (
    <div className="rounded-lg border border-slate-200 p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold" style={{ color }}>{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>{fmtMoney(total, lang)}</span>
      </div>
      <div className="space-y-1 mb-2">
        {(items || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((it) => (
          editId === it.id ? (
            <div key={it.id} className="flex flex-wrap items-center gap-1.5 bg-orange-50/60 rounded px-1.5 py-1.5">
              <input type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} className="text-xs border border-slate-200 rounded px-1.5 py-1 focus:outline-none" />
              <MoneyInput value={eAmount} onChange={setEAmount} lang={lang} onEnter={saveEdit} className="w-28 text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-300" />
              <AntInput size="small" value={eNote} onChange={(e) => setENote(e.target.value)} placeholder={t.note} onPressEnter={saveEdit} style={{ flex: 1, minWidth: 80 }} />
              <button onClick={saveEdit} className="p-1 text-green-600 hover:text-green-700" title={t.save}><Check size={15} /></button>
              <button onClick={() => setEditId(null)} className="p-1 text-slate-400 hover:text-slate-600" title={t.cancel}><X size={15} /></button>
            </div>
          ) : (
            <div key={it.id} className="group flex items-center gap-2 text-xs">
              <span className="text-slate-400 tabular-nums shrink-0" style={{ width: 76 }}>{it.date}</span>
              <span className="font-medium text-slate-700 tabular-nums shrink-0" style={{ minWidth: 96 }}>{fmtMoney(it.amount, lang)}</span>
              <span className="flex-1 text-slate-400 truncate">{it.note}</span>
              <button onClick={() => startEdit(it)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-orange-500 shrink-0" title={t.edit}><Pencil size={12} /></button>
              <button onClick={() => onDelete(it.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 shrink-0" title={t.delete}><X size={13} /></button>
            </div>
          )
        ))}
        {(!items || items.length === 0) && <p className="text-xs text-slate-300">{t.none}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-xs border border-slate-200 rounded px-1.5 py-1 focus:outline-none" />
        <MoneyInput value={amount} onChange={setAmount} lang={lang} placeholder={t.installmentAmount + " (₫)"} onEnter={add} className="w-32 text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-300" />
        <AntInput size="small" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} onPressEnter={add} style={{ flex: 1, minWidth: 96 }} />
        <AntBtn size="small" type="primary" onClick={add}>{t.addInstallment}</AntBtn>
      </div>
    </div>
  );
}

function ContractForm({ side, initial, investorContracts, projects, t, onSave, onCancel }) {
  const [code, setCode] = useState(initial?.code || "");
  const [kind, setKind] = useState(initial?.kind || "contract");
  const [parentId, setParentId] = useState(initial?.parentId || "");
  const [value, setValue] = useState(initial?.value || 0);
  const [note, setNote] = useState(initial?.note || "");
  const [invLink, setInvLink] = useState(initial?.investorContractId || "");
  const [projectId, setProjectId] = useState(initial?.projectId || "");
  const parents = (side === "investor" ? investorContracts : []).filter((c) => c.kind === "contract" && c.id !== initial?.id);
  const save = () => {
    if (!code.trim()) return;
    const base = { code: code.trim(), kind, parentId: kind === "appendix" ? parentId : "", value: Number(value) || 0, note: note.trim(), projectId };
    if (side === "sub") base.investorContractId = invLink;
    onSave(base);
  };
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <AntInput value={code} onChange={(e) => setCode(e.target.value)} placeholder={side === "sub" ? t.supplierName + " / " + t.contractCode : t.contractCode} style={{ flex: 1, minWidth: 160 }} />
        <AntSelect value={kind} onChange={(v) => setKind(v)} style={{ minWidth: 110 }} options={[{ value: "contract", label: t.contract }, { value: "appendix", label: t.appendix }]} />
        <MoneyInput value={value} onChange={setValue} lang="vi" placeholder={t.valuePlaceholder} className="w-40 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
      </div>
      <div className="flex flex-wrap gap-2">
        <AntSelect value={projectId} onChange={(v) => setProjectId(v)} style={{ minWidth: 180 }} options={[{ value: "", label: t.financeProject + ": " + t.financeNoProject }, ...(projects || []).map((pp) => ({ value: pp.id, label: pp.name }))]} />
        {kind === "appendix" && (
          <AntSelect value={parentId} onChange={(v) => setParentId(v)} style={{ minWidth: 180 }} options={[{ value: "", label: t.parentContract + ": " + t.none }, ...parents.map((c) => ({ value: c.id, label: c.code }))]} />
        )}
        {side === "sub" && (
          <AntSelect value={invLink} onChange={(v) => setInvLink(v)} style={{ minWidth: 180 }} options={[{ value: "", label: t.linkedInvestorContract + ": " + t.notLinked }, ...investorContracts.map((c) => ({ value: c.id, label: (c.kind === "appendix" ? t.appendix + " · " : "") + c.code }))]} />
        )}
        <AntInput value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} style={{ flex: 1, minWidth: 128 }} />
        <AntBtn type="primary" onClick={save}>{initial ? t.save : t.create}</AntBtn>
        {onCancel && <AntBtn onClick={onCancel}>{t.cancel}</AntBtn>}
      </div>
    </div>
  );
}

function ContractCard({ side, c, investorContracts, projects, projName, t, lang, onEdit, onDelete, children }) {
  const [editing, setEditing] = useState(false);
  const KindBadge = () => (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium" style={c.kind === "appendix" ? { background: "#eff6ff", color: "#3b82f6" } : { background: "#fff7ed", color: "#f97316" }}>{c.kind === "appendix" ? t.appendix : t.contract}</span>
  );
  const link = side === "sub" && c.investorContractId ? investorContracts.find((x) => x.id === c.investorContractId) : null;
  const pname = c.projectId && projName ? projName(c.projectId) : null;
  if (editing) return <div className="mb-3"><ContractForm side={side} initial={c} investorContracts={investorContracts} projects={projects} t={t} onSave={(d) => { onEdit(d); setEditing(false); }} onCancel={() => setEditing(false)} /></div>;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <KindBadge /><span className="font-semibold text-slate-800 truncate">{c.code}</span>
            {pname && <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5"><Folder size={11} />{pname}</span>}
          </div>
          {link && <div className="text-xs text-slate-400 mt-0.5">{t.linkedInvestorContract}: {link.code}</div>}
          {c.note && <div className="text-xs text-slate-400 mt-0.5">{c.note}</div>}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-slate-400">{t.contractValue}</div>
          <div className="font-bold text-slate-800 tabular-nums">{fmtMoney(c.value, lang)}</div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={() => setEditing(true)} className="p-1 text-slate-300 hover:text-orange-500"><Pencil size={14} /></button>
          <button onClick={() => { if (window.confirm(t.deleteContractConfirm)) onDelete(); }} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function FinanceView({ t, lang, finance, projects, tasks, onChange }) {
  const [tab, setTab] = useState("investor");
  const [adding, setAdding] = useState(false);
  const [proj, setProj] = useState("");
  const inv = finance.investorContracts || [];
  const sub = finance.subContracts || [];
  const byProj = (c) => !proj || c.projectId === proj;
  const fInv = inv.filter(byProj);
  const fSub = sub.filter(byProj);

  const setInv = (next) => onChange({ ...finance, investorContracts: next });
  const setSub = (next) => onChange({ ...finance, subContracts: next });
  const updInv = (id, fn) => setInv(inv.map((c) => c.id === id ? fn(c) : c));
  const updSub = (id, fn) => setSub(sub.map((c) => c.id === id ? fn(c) : c));

  const invValue = fInv.reduce((s, c) => s + (Number(c.value) || 0), 0);
  const billed = fInv.reduce((s, c) => s + sumItems(c.billed), 0);
  const received = fInv.reduce((s, c) => s + sumItems(c.paid), 0);
  const subValue = fSub.reduce((s, c) => s + (Number(c.value) || 0), 0);
  const subPaid = fSub.reduce((s, c) => s + sumItems(c.paid), 0);

  const invCards = [
    { label: t.sumInvValue, val: invValue, c: "#f97316", icon: <Receipt size={18} /> },
    { label: t.sumBilled, val: billed, c: "#0ea5e9", icon: <Send size={18} /> },
    { label: t.sumReceived, val: received, c: "#10b981", icon: <TrendingUp size={18} /> },
    { label: t.sumToCollect, val: invValue - received, c: "#f59e0b", icon: <Banknote size={18} /> },
  ];
  const subCards = [
    { label: t.sumSubValue, val: subValue, c: "#f97316", icon: <Receipt size={18} /> },
    { label: t.sumSubPaid, val: subPaid, c: "#ef4444", icon: <TrendingDown size={18} /> },
    { label: t.sumToPay, val: subValue - subPaid, c: "#8b5cf6", icon: <Banknote size={18} /> },
  ];
  // thẻ tổng cho tab BOQ: giá trị hợp đồng (BOQ) / lũy kế nghiệm thu / % giá trị
  const boqScope = proj ? [[proj, (finance.boq || {})[proj]]] : Object.entries(finance.boq || {});
  let boqVal = 0, boqLuyKe = 0;
  for (const [, bRaw] of boqScope) {
    const bb = boqOf(bRaw);
    for (const it of bb.items) {
      if (it.laNhom) continue;
      const dg = Number(it.donGia) || 0;
      boqVal += (Number(it.khoiLuong) || 0) * dg;
      boqLuyKe += bb.kys.reduce((s, k) => s + (Number((k.kl || {})[it.id]) || 0), 0) * dg;
    }
  }
  const boqCards = [
    { label: t.boqSumValue, val: boqVal, c: "#f97316", icon: <Receipt size={18} /> },
    { label: t.boqSumDone, val: boqLuyKe, c: "#10b981", icon: <TrendingUp size={18} /> },
    { label: t.boqSumLeft, val: boqVal - boqLuyKe, c: "#f59e0b", icon: <Banknote size={18} /> },
    { label: t.boqSumPct, text: (boqVal > 0 ? Math.round(boqLuyKe / boqVal * 100) : 0) + "%", c: "#0ea5e9", icon: <Percent size={18} /> },
  ];
  const cards = tab === "investor" ? invCards : tab === "boq" ? boqCards : subCards;
  const projName = (id) => projects.find((p) => p.id === id)?.name;
  const orderWithAppendix = (list) => {
    const cs = list.filter((c) => c.kind !== "appendix");
    const aps = list.filter((c) => c.kind === "appendix");
    const out = [];
    cs.forEach((c) => { out.push(c); aps.filter((a) => a.parentId === c.id).forEach((a) => out.push(a)); });
    aps.filter((a) => !cs.some((c) => c.id === a.parentId)).forEach((a) => out.push(a));
    return out;
  };
  const wrapCard = (c, node) => <div key={c.id} className={c.kind === "appendix" ? "ml-4 md:ml-8" : ""}>{node}</div>;
  const renderList = (list, renderCard) => {
    if (proj) return orderWithAppendix(list).map((c) => wrapCard(c, renderCard(c)));
    const groups = {};
    list.forEach((c) => { const k = c.projectId || "__none__"; (groups[k] = groups[k] || []).push(c); });
    const ids = Object.keys(groups).sort((a, b) => (a === "__none__" ? 1 : b === "__none__" ? -1 : (projName(a) || "").localeCompare(projName(b) || "")));
    return ids.map((pid) => {
      const total = groups[pid].reduce((sm, c) => sm + (Number(c.value) || 0), 0);
      return (
        <div key={pid} className="mb-5">
          <div className="flex items-center gap-2 mb-2.5 pb-1.5 border-b-2 border-orange-100">
            <Folder size={15} className="text-orange-500 shrink-0" />
            <h3 className="text-sm font-bold text-slate-700 truncate">{pid === "__none__" ? t.financeNoProject : (projName(pid) || t.financeNoProject)}</h3>
            <span className="text-xs text-slate-400 whitespace-nowrap">{groups[pid].length} {t.contractItems}</span>
            <span className="text-xs font-semibold text-slate-500 tabular-nums ml-auto whitespace-nowrap">{fmtMoney(total, lang)}</span>
          </div>
          {orderWithAppendix(groups[pid]).map((c) => wrapCard(c, renderCard(c)))}
        </div>
      );
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">{t.financeProject}:</span>
        <AntSelect value={proj} onChange={(v) => setProj(v)} style={{ minWidth: 200 }} options={[{ value: "", label: t.financeAllProjects }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
      </div>

      {tab !== "cashflow" && (
        <div className={`grid grid-cols-2 gap-3 ${tab === "sub" ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: c.c + "1a", color: c.c }}>{c.icon}</span>
              <div className="text-lg font-bold mt-2 tabular-nums" style={{ color: c.c }}>{c.text != null ? c.text : fmtMoney(c.val, lang)}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <AntTabs activeKey={tab} onChange={(k) => { setTab(k); setAdding(false); }} tabBarStyle={{ marginBottom: 0 }}
        items={[{ key: "investor", label: t.finTabInvestor }, { key: "sub", label: t.finTabSub }, { key: "boq", label: t.finTabBoq }, { key: "cashflow", label: t.finTabCashflow }]}
        tabBarExtraContent={(tab === "investor" || tab === "sub") ? <AntBtn type="primary" icon={<Plus size={15} />} onClick={() => setAdding((v) => !v)}>{tab === "investor" ? t.addContract : t.addSubContract}</AntBtn> : undefined} />

      {tab === "cashflow" && <CashflowTab inv={fInv} sub={fSub} t={t} lang={lang} />}
      {tab === "boq" && <BOQTab t={t} lang={lang} finance={finance} onChange={onChange} projects={projects} proj={proj} tasks={tasks || []} inv={inv} />}

      {(tab === "investor" || tab === "sub") && adding && (
        <ContractForm side={tab} investorContracts={inv} projects={projects} initial={proj ? { projectId: proj } : null} t={t}
          onSave={(d) => {
            const item = { id: uid(), createdAt: Date.now(), billed: [], paid: [], ...d };
            if (tab === "investor") setInv([{ ...item }, ...inv]); else setSub([{ ...item }, ...sub]);
            setAdding(false);
          }} onCancel={() => setAdding(false)} />
      )}

      {tab === "investor" && (
        fInv.length === 0 && !adding ? <Empty2 icon={<Receipt size={44} />} text={t.noInvContracts} /> :
        renderList(fInv, (c) => (
          <ContractCard key={c.id} side="investor" c={c} investorContracts={inv} projects={projects} projName={projName} t={t} lang={lang}
            onEdit={(d) => updInv(c.id, (x) => ({ ...x, ...d }))} onDelete={() => setInv(inv.filter((x) => x.id !== c.id))}>
            <InstallmentList items={c.billed} t={t} lang={lang} label={t.billedSent} color="#0ea5e9"
              onAdd={(it) => updInv(c.id, (x) => ({ ...x, billed: [...(x.billed || []), it] }))}
              onDelete={(iid) => updInv(c.id, (x) => ({ ...x, billed: (x.billed || []).filter((i) => i.id !== iid) }))}
              onEdit={(iid, patch) => updInv(c.id, (x) => ({ ...x, billed: (x.billed || []).map((i) => i.id === iid ? { ...i, ...patch } : i) }))} />
            <InstallmentList items={c.paid} t={t} lang={lang} label={t.investorPaid} color="#10b981"
              onAdd={(it) => updInv(c.id, (x) => ({ ...x, paid: [...(x.paid || []), it] }))}
              onDelete={(iid) => updInv(c.id, (x) => ({ ...x, paid: (x.paid || []).filter((i) => i.id !== iid) }))}
              onEdit={(iid, patch) => updInv(c.id, (x) => ({ ...x, paid: (x.paid || []).map((i) => i.id === iid ? { ...i, ...patch } : i) }))} />
          </ContractCard>
        ))
      )}
      {tab === "sub" && (
        fSub.length === 0 && !adding ? <Empty2 icon={<Receipt size={44} />} text={t.noSubContracts} /> :
        renderList(fSub, (c) => (
          <ContractCard key={c.id} side="sub" c={c} investorContracts={inv} projects={projects} projName={projName} t={t} lang={lang}
            onEdit={(d) => updSub(c.id, (x) => ({ ...x, ...d }))} onDelete={() => setSub(sub.filter((x) => x.id !== c.id))}>
            <InstallmentList items={c.paid} t={t} lang={lang} label={t.subPaid} color="#ef4444"
              onAdd={(it) => updSub(c.id, (x) => ({ ...x, paid: [...(x.paid || []), it] }))}
              onDelete={(iid) => updSub(c.id, (x) => ({ ...x, paid: (x.paid || []).filter((i) => i.id !== iid) }))}
              onEdit={(iid, patch) => updSub(c.id, (x) => ({ ...x, paid: (x.paid || []).map((i) => i.id === iid ? { ...i, ...patch } : i) }))} />
            <div className="rounded-lg border border-slate-100 p-2.5 flex flex-col justify-center">
              <div className="flex items-center justify-between text-xs"><span className="text-slate-400">{t.remaining}</span><span className="font-semibold tabular-nums text-slate-700">{fmtMoney((Number(c.value) || 0) - sumItems(c.paid), lang)}</span></div>
            </div>
          </ContractCard>
        ))
      )}
    </div>
  );
}
/* ============== BOQ – KHỐI LƯỢNG – CHI PHÍ ==============
   Tham khảo mô hình CostManager (D:\CostManager): KHÔNG lưu số lũy kế —
   khối lượng nhập theo từng KỲ nghiệm thu, lũy kế luôn tính lại từ các kỳ,
   nên sửa kỳ cũ thì các kỳ sau tự đúng. Cột hiển thị đối chiếu 1-1 với form
   thanh toán: Lũy kế trước / Kỳ này / Tổng lũy kế. Dòng nhóm (laNhom) không có tiền. */
function boqOf(raw) {
  if (!raw) return { items: [], kys: [] };
  if (Array.isArray(raw)) return { items: raw, kys: [] }; // tương thích dữ liệu cũ (nếu có)
  return { items: Array.isArray(raw.items) ? raw.items : [], kys: Array.isArray(raw.kys) ? raw.kys : [] };
}
// Ô nhập đặt ở cấp module để React giữ nguyên identity — định nghĩa trong render sẽ mất focus mỗi lần gõ.
const boqCellStyle = { border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 6px", minWidth: 0, background: "#fff" };
function BoqTxt({ v, onCh, w, bold, ph }) {
  return <input value={v ?? ""} placeholder={ph || ""} onChange={(e) => onCh(e.target.value)} className="text-sm" style={{ ...boqCellStyle, width: w, fontWeight: bold ? 600 : 400 }} />;
}
function BoqNum({ v, onCh, w }) {
  return <input type="number" step="any" value={v ?? ""} onChange={(e) => onCh(e.target.value)} className="text-sm tabular-nums" style={{ ...boqCellStyle, width: w, textAlign: "right" }} />;
}
function BOQTab({ t, lang, finance, onChange, projects, proj, tasks, inv }) {
  const { message: antMessage } = AntApp.useApp();
  const [kySel, setKySel] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const boqAll = finance.boq || {};
  const fmtQty = (n) => { const v = Number(n) || 0; try { return new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 3 }).format(v); } catch { return String(v); } };
  // Đọc số cả kiểu VN (1.234,56) lẫn kiểu Anh (1,234.56)
  const num = (v) => {
    let w = String(v == null ? "" : v).replace(/[^\d.,-]/g, ""); if (!w) return 0;
    const d = w.lastIndexOf("."), c = w.lastIndexOf(",");
    if (d !== -1 && c !== -1) { if (d > c) w = w.replace(/,/g, ""); else w = w.replace(/\./g, "").replace(",", "."); }
    else if (c !== -1) { const after = w.length - c - 1; w = after === 3 ? w.replace(/,/g, "") : w.replace(",", "."); }
    const n = parseFloat(w); return isNaN(n) ? 0 : n;
  };
  const projName = (id) => projects.find((p) => p.id === id)?.name || "";

  // ---- chưa chọn dự án: bảng tổng hợp mọi dự án ----
  if (!proj) {
    const rowsAll = projects.map((p) => {
      const bb = boqOf(boqAll[p.id]);
      if (!bb.items.length) return null;
      let val = 0, lk = 0;
      for (const it of bb.items) { if (it.laNhom) continue; const dg = Number(it.donGia) || 0;
        val += (Number(it.khoiLuong) || 0) * dg;
        lk += bb.kys.reduce((s, k) => s + (Number((k.kl || {})[it.id]) || 0), 0) * dg; }
      return { p, n: bb.items.length, kyN: bb.kys.length, val, lk };
    }).filter(Boolean);
    if (!rowsAll.length) return <Empty2 icon={<Receipt size={44} />} text={t.boqEmptyAll} />;
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-xs text-slate-400 mb-3">{t.boqPickProject}</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr className="text-xs text-slate-400 text-left">
            <th style={{ padding: "6px 8px" }}>{t.financeProject}</th><th style={{ padding: "6px 8px", textAlign: "right" }}>{t.boqCount}</th>
            <th style={{ padding: "6px 8px", textAlign: "right" }}>{t.boqSumValue}</th><th style={{ padding: "6px 8px", textAlign: "right" }}>{t.boqSumDone}</th>
            <th style={{ padding: "6px 8px", textAlign: "right" }}>{t.boqSumPct}</th>
          </tr></thead>
          <tbody>{rowsAll.map((r) => (
            <tr key={r.p.id} className="border-t border-slate-100 text-sm">
              <td style={{ padding: "8px" }} className="font-medium text-slate-700">{r.p.name}</td>
              <td style={{ padding: "8px", textAlign: "right" }} className="tabular-nums">{r.n}</td>
              <td style={{ padding: "8px", textAlign: "right" }} className="tabular-nums">{fmtMoney(r.val, lang)}</td>
              <td style={{ padding: "8px", textAlign: "right" }} className="tabular-nums text-emerald-600">{fmtMoney(r.lk, lang)}</td>
              <td style={{ padding: "8px", textAlign: "right" }} className="tabular-nums font-semibold">{r.val > 0 ? Math.round(r.lk / r.val * 100) : 0}%</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }

  // ---- một dự án cụ thể ----
  const b = boqOf(boqAll[proj]);
  const items = b.items;
  const kys = [...b.kys].sort((x, y) => (x.soKy || 0) - (y.soKy || 0));
  const write = (nb) => onChange({ ...finance, boq: { ...boqAll, [proj]: nb } });
  const ky = kys.find((k) => k.id === kySel) || kys[kys.length - 1] || null;
  const kyIdx = ky ? kys.findIndex((k) => k.id === ky.id) : -1;
  const luyKeTruoc = (itemId) => kys.slice(0, kyIdx < 0 ? kys.length : kyIdx).reduce((s, k) => s + (Number((k.kl || {})[itemId]) || 0), 0);
  const klKyNay = (itemId) => (ky ? Number((ky.kl || {})[itemId]) || 0 : 0);
  const setKlKyNay = (itemId, v) => { if (!ky) return; write({ items, kys: kys.map((k) => k.id === ky.id ? { ...k, kl: { ...(k.kl || {}), [itemId]: v } } : k) }); };

  const addItem = () => write({ items: [...items, { id: uid(), stt: "", ten: "", donVi: "", laNhom: false, khoiLuong: "", donGia: "", taskIds: [] }], kys });
  const updItem = (id, patch) => write({ items: items.map((it) => it.id === id ? { ...it, ...patch } : it), kys });
  const delItem = (id) => { if (!window.confirm(t.boqDeleteConfirm)) return;
    write({ items: items.filter((it) => it.id !== id), kys: kys.map((k) => { const kl = { ...(k.kl || {}) }; delete kl[id]; return { ...k, kl }; }) }); };
  const addKy = () => { const soKy = kys.length ? Math.max(...kys.map((k) => Number(k.soKy) || 0)) + 1 : 1;
    const nk = { id: uid(), soKy, denNgay: new Date().toISOString().slice(0, 10), kl: {} };
    write({ items, kys: [...kys, nk] }); setKySel(nk.id); };
  const delKy = () => { if (!ky) return; if (!window.confirm((lang === "vi" ? "Xóa kỳ nghiệm thu " : "Delete period ") + "#" + ky.soKy + "?")) return;
    write({ items, kys: kys.filter((k) => k.id !== ky.id) }); setKySel(""); };

  const projTasks = tasks.filter((x) => x.projectId === proj);
  const taskOpts = projTasks.map((x) => ({ value: x.id, label: x.title || t.untitled }));
  // Gợi ý KL kỳ này từ % tiến độ các công việc liên kết: KL_HĐ × TB(workdone) − lũy kế trước
  const suggestKyNay = (it) => {
    const linked = projTasks.filter((x) => (it.taskIds || []).includes(x.id));
    if (!linked.length || !ky) return null;
    const avg = linked.reduce((s, x) => s + (Number(x.workdone) || 0), 0) / linked.length;
    const v = Math.max(0, (Number(it.khoiLuong) || 0) * avg / 100 - luyKeTruoc(it.id));
    return Math.round(v * 1000) / 1000;
  };

  const rows = items.filter((it) => !it.laNhom);
  const totVal = rows.reduce((s, it) => s + (Number(it.khoiLuong) || 0) * (Number(it.donGia) || 0), 0);
  const totTruoc = rows.reduce((s, it) => s + luyKeTruoc(it.id) * (Number(it.donGia) || 0), 0);
  const totKyNay = rows.reduce((s, it) => s + klKyNay(it.id) * (Number(it.donGia) || 0), 0);
  const totLuyKe = totTruoc + totKyNay;
  const invVal = inv.filter((c) => c.projectId === proj).reduce((s, c) => s + (Number(c.value) || 0), 0);

  const doImport = () => {
    const rowsCsv = parseCSV(csvText); if (!rowsCsv.length) return;
    const head = rowsCsv[0].map((c) => String(c).trim().toLowerCase());
    const isHead = head.some((c) => ["stt", "mã", "ma", "code", "tên", "ten", "tên công tác", "ten cong tac", "work item", "name", "đơn vị", "don vi", "dvt", "unit", "khối lượng", "khoi luong", "kl", "qty", "quantity", "đơn giá", "don gia", "price", "unit price"].includes(c));
    const data = isHead ? rowsCsv.slice(1) : rowsCsv;
    const add = data.map((r) => {
      const stt = String(r[0] || "").trim(), ten = String(r[1] || "").trim(), donVi = String(r[2] || "").trim();
      const kl = num(r[3]), dg = num(r[4]);
      if (!ten && !stt) return null;
      const laNhom = !donVi && !kl && !dg; // dòng chỉ có mã/tên -> coi là dòng nhóm (phần I, II...)
      return { id: uid(), stt, ten: ten || stt, donVi, laNhom, khoiLuong: kl || "", donGia: dg || "", taskIds: [] };
    }).filter(Boolean);
    if (!add.length) return;
    write({ items: [...items, ...add], kys });
    setCsvText(""); setImportOpen(false);
    antMessage.success((lang === "vi" ? "Đã nhập " : "Imported ") + add.length + " " + t.boqCount);
  };

  const th = (label, right) => <th style={{ padding: "6px 6px", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{label}</th>;
  const tdR = (node, cls) => <td style={{ padding: "4px 6px", textAlign: "right", whiteSpace: "nowrap" }} className={"tabular-nums text-sm " + (cls || "")}>{node}</td>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">{lang === "vi" ? "Kỳ nghiệm thu:" : "Period:"}</span>
        {kys.length > 0 && <AntSelect size="small" value={ky ? ky.id : undefined} onChange={(v) => setKySel(v)} style={{ minWidth: 150 }}
          options={kys.map((k) => ({ value: k.id, label: (lang === "vi" ? "Kỳ " : "IPC ") + k.soKy + (k.denNgay ? " · " + k.denNgay.split("-").reverse().join("/") : "") }))} />}
        {ky && <input type="date" value={ky.denNgay || ""} onChange={(e) => write({ items, kys: kys.map((k) => k.id === ky.id ? { ...k, denNgay: e.target.value } : k) })} className="text-sm" style={boqCellStyle} />}
        <AntBtn size="small" icon={<Plus size={13} />} onClick={addKy}>{lang === "vi" ? "Kỳ mới" : "New period"}</AntBtn>
        {ky && <AntBtn size="small" danger onClick={delKy}>{t.delete}</AntBtn>}
        <span className="ml-auto flex items-center gap-2">
          <AntBtn size="small" icon={<Download size={13} />} onClick={() => setImportOpen((v) => !v)}>{t.boqImport}</AntBtn>
          <AntBtn size="small" type="primary" icon={<Plus size={13} />} onClick={addItem}>{t.boqAddItem}</AntBtn>
        </span>
      </div>

      {invVal > 0 && (
        <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
          <span>{t.boqVsContract}: <b className="tabular-nums text-slate-700">{fmtMoney(invVal, lang)}</b></span>
          <span>{t.boqDelta}: <b className="tabular-nums" style={{ color: totVal - invVal > 0 ? "#dc2626" : "#10b981" }}>{fmtMoney(totVal - invVal, lang)}</b></span>
        </div>
      )}

      {importOpen && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <p className="text-xs text-slate-500">{t.boqImportHint}</p>
          <textarea rows={6} value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder={"I,PHẦN MÓNG,,,\n1,Bê tông lót đá 4x6 M100,m3,\"12,5\",\"1.250.000\""}
            style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8, fontFamily: "monospace", fontSize: 12 }} />
          <div className="flex justify-end gap-2"><AntBtn size="small" onClick={() => setImportOpen(false)}>{t.cancel}</AntBtn>
            <AntBtn size="small" type="primary" disabled={!csvText.trim()} onClick={doImport}>{t.boqImportDo}</AntBtn></div>
        </div>
      )}

      {items.length === 0 ? <Empty2 icon={<Receipt size={44} />} text={t.boqEmpty} /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: ky ? 1120 : 760 }}>
            <thead><tr className="text-xs text-slate-400 border-b border-slate-200">
              {th(t.boqCode)}{th(t.boqName)}{th(t.boqUnit)}{th(t.boqQty, 1)}{th(t.boqPrice, 1)}{th(t.boqAmount, 1)}
              {ky && <>{th(lang === "vi" ? "LK trước" : "Prev cum.", 1)}{th((lang === "vi" ? "Kỳ " : "IPC ") + ky.soKy, 1)}{th(lang === "vi" ? "Lũy kế" : "Cumul.", 1)}{th(t.boqPercent, 1)}{th(t.boqDoneVal, 1)}</>}
              {th(t.boqLinkTasks)}{th("")}
            </tr></thead>
            <tbody>
              {items.map((it) => {
                const dg = Number(it.donGia) || 0, klHd = Number(it.khoiLuong) || 0;
                const lkTr = luyKeTruoc(it.id), kn = klKyNay(it.id), lk = lkTr + kn;
                const sg = suggestKyNay(it);
                const acts = (
                  <td style={{ padding: "4px 6px", whiteSpace: "nowrap" }}>
                    {!it.laNhom && ky && (it.taskIds || []).length > 0 && (
                      <button title={t.boqSuggest + (sg != null ? " → " + fmtQty(sg) : "")} onClick={() => sg != null && setKlKyNay(it.id, sg)} className="text-sky-500 hover:text-sky-700" style={{ padding: 3 }}><Gauge size={14} /></button>
                    )}
                    <button title={lang === "vi" ? "Dòng nhóm (không có tiền)" : "Group row (no money)"} onClick={() => updItem(it.id, { laNhom: !it.laNhom })} style={{ padding: 3, color: it.laNhom ? "#f97316" : "#cbd5e1" }}><Folder size={14} /></button>
                    <button title={t.delete} onClick={() => delItem(it.id)} className="text-slate-300 hover:text-red-500" style={{ padding: 3 }}><Trash2 size={14} /></button>
                  </td>
                );
                if (it.laNhom) return (
                  <tr key={it.id} style={{ background: "#f8fafc" }} className="border-b border-slate-100">
                    <td style={{ padding: "4px 6px" }}><BoqTxt v={it.stt} onCh={(v) => updItem(it.id, { stt: v })} w={64} bold /></td>
                    <td style={{ padding: "4px 6px" }} colSpan={(ky ? 10 : 5) + 1}><BoqTxt v={it.ten} onCh={(v) => updItem(it.id, { ten: v })} w="100%" bold /></td>
                    {acts}
                  </tr>
                );
                return (
                  <tr key={it.id} className="border-b border-slate-50">
                    <td style={{ padding: "4px 6px" }}><BoqTxt v={it.stt} onCh={(v) => updItem(it.id, { stt: v })} w={64} /></td>
                    <td style={{ padding: "4px 6px", minWidth: 200 }}><BoqTxt v={it.ten} onCh={(v) => updItem(it.id, { ten: v })} w="100%" /></td>
                    <td style={{ padding: "4px 6px" }}><BoqTxt v={it.donVi} onCh={(v) => updItem(it.id, { donVi: v })} w={54} /></td>
                    <td style={{ padding: "4px 6px" }}><BoqNum v={it.khoiLuong} onCh={(v) => updItem(it.id, { khoiLuong: v })} w={86} /></td>
                    <td style={{ padding: "4px 6px" }}><BoqNum v={it.donGia} onCh={(v) => updItem(it.id, { donGia: v })} w={108} /></td>
                    {tdR(fmtMoney(klHd * dg, lang), "text-slate-700")}
                    {ky && <>
                      {tdR(fmtQty(lkTr), "text-slate-400")}
                      <td style={{ padding: "4px 6px", textAlign: "right" }}><BoqNum v={(ky.kl || {})[it.id]} onCh={(v) => setKlKyNay(it.id, v)} w={80} /></td>
                      {tdR(fmtQty(lk), "font-medium text-slate-700")}
                      {tdR((klHd > 0 ? Math.round(lk / klHd * 100) : 0) + "%", (klHd > 0 && lk > klHd) ? "text-red-500 font-semibold" : "text-slate-500")}
                      {tdR(fmtMoney(lk * dg, lang), "text-emerald-600")}
                    </>}
                    <td style={{ padding: "4px 6px", minWidth: 150 }}>
                      <AntSelect mode="multiple" size="small" maxTagCount={1} value={it.taskIds || []} onChange={(v) => updItem(it.id, { taskIds: v })}
                        style={{ width: "100%", minWidth: 140 }} placeholder="—" options={taskOpts} optionFilterProp="label" />
                    </td>
                    {acts}
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr className="border-t-2 border-slate-200 text-sm font-semibold text-slate-700">
              <td style={{ padding: "6px" }} colSpan={5}>{lang === "vi" ? "Tổng cộng" : "Total"}</td>
              {tdR(fmtMoney(totVal, lang))}
              {ky && <>
                {tdR(fmtMoney(totTruoc, lang), "text-slate-400")}
                {tdR(fmtMoney(totKyNay, lang), "text-sky-600")}
                {tdR("")}
                {tdR((totVal > 0 ? Math.round(totLuyKe / totVal * 100) : 0) + "%")}
                {tdR(fmtMoney(totLuyKe, lang), "text-emerald-600")}
              </>}
              <td colSpan={2} />
            </tr></tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

function NotifPanel({ t, lang, items, onOpen }) {
  const icon = (ty) => ty === "approve" ? <CheckCircle2 size={15} className="text-orange-500" /> : ty === "overdue" ? <AlertTriangle size={15} className="text-red-500" /> : <MessageSquare size={15} className="text-sky-500" />;
  return (
    <div style={{ width: 320, maxHeight: 380, overflowY: "auto" }}>
      <div className="text-sm font-semibold text-slate-700 px-1 pb-2">{lang === "vi" ? "Thông báo" : "Notifications"}</div>
      {items.length === 0 ? <p className="text-sm text-slate-400 px-1 py-6 text-center">{lang === "vi" ? "Không có thông báo." : "No notifications."}</p> :
        items.map((n) => (
          <button key={n.id} onClick={() => onOpen(n)} className="w-full flex items-start gap-2 text-left px-2 py-2 rounded-lg hover:bg-slate-50">
            <span className="mt-0.5 shrink-0">{icon(n.type)}</span>
            <span className="flex-1 text-sm text-slate-600">{n.text}</span>
          </button>
        ))}
    </div>
  );
}
function TrashModal({ t, lang, trash, isOwner, onRestore, onPurge, onClose }) {
  return (
    <AntModal open onCancel={onClose} footer={null} width={520}
      title={<span className="flex items-center gap-2"><Trash2 size={18} className="text-orange-500" />{t.trashTitle}</span>}>
      <p className="text-xs text-slate-500 mb-3">{t.trashHint}</p>
      {(!trash || trash.length === 0) ? <Empty2 icon={<Trash2 size={40} />} text={t.trashEmpty} /> : (
        <div className="space-y-2" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {trash.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: (e.project && e.project.color) || "#94a3b8" }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{e.name}</div>
                <div className="text-xs text-slate-400">{(e.tasks || []).length} {lang === "vi" ? "công việc" : "tasks"} · {new Date(e.deletedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US")}{e.deletedBy ? " · " + e.deletedBy : ""}</div>
              </div>
              <AntBtn size="small" onClick={() => onRestore(e.id)}>{t.restore}</AntBtn>
              {isOwner && <AntBtn size="small" danger onClick={() => { if (window.confirm(t.deleteForever + " \"" + e.name + "\"?")) onPurge(e.id); }}>{t.deleteForever}</AntBtn>}
            </div>
          ))}
        </div>
      )}
    </AntModal>
  );
}
function SearchView({ t, tasks, projects, memberById, onOpenTask }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = query.length < 1 ? [] : tasks.filter((x) => (x.title || "").toLowerCase().includes(query) || (x.description || "").toLowerCase().includes(query) || (x.tags || []).some((tg) => String(tg).toLowerCase().includes(query)));
  const byProj = {}; results.forEach((x) => { const k = x.projectId || "__none__"; (byProj[k] = byProj[k] || []).push(x); });
  const prj = (id) => projects.find((p) => p.id === id) || {};
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <AntInput size="large" allowClear autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchAllPlaceholder} prefix={<Search size={16} className="text-slate-400" />} />
      {query && <p className="text-sm text-slate-500">{results.length} {t.resultsFound}</p>}
      {Object.keys(byProj).map((pid) => (
        <div key={pid}>
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b-2 border-orange-100"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: prj(pid).color || "#94a3b8" }} /><h4 className="text-sm font-bold text-slate-800 truncate flex-1">{prj(pid).name || "—"}</h4><span className="text-xs text-slate-400">{byProj[pid].length}</span></div>
          <div className="space-y-1.5">
            {byProj[pid].map((x) => (
              <button key={x.id} onClick={() => onOpenTask(x.id)} className="w-full text-left bg-white rounded-lg border border-slate-200 p-2.5 hover:border-orange-300 hover:bg-orange-50/30 transition">
                <div className="flex items-center gap-2"><span className={`flex-1 text-sm font-medium truncate ${x.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{x.title || t.untitled}</span><WorkBar v={x.workdone || 0} w={48} /><PriorityFlag p={x.priority} t={t} /></div>
              </button>
            ))}
          </div>
        </div>
      ))}
      {query && results.length === 0 && <Empty2 icon={<Search size={44} />} text={t.noResults} />}
    </div>
  );
}
function Empty2({ icon, text }) {
  return <div className="py-16"><AntEmpty image={AntEmpty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-400 text-sm">{text}</span>} /></div>;
}

/* ---- cashflow ---- */
function fmtCompact(n, lang) {
  const v = Number(n) || 0; const a = Math.abs(v); const sign = v < 0 ? "-" : "";
  const tidy = (x) => x.toFixed(1).replace(/\.0$/, "");
  if (lang === "vi") {
    if (a >= 1e9) return sign + tidy(a / 1e9) + " tỷ";
    if (a >= 1e6) return sign + tidy(a / 1e6) + " tr";
    if (a >= 1e3) return sign + Math.round(a / 1e3) + " ng";
    return sign + a;
  }
  if (a >= 1e9) return sign + tidy(a / 1e9) + "B";
  if (a >= 1e6) return sign + tidy(a / 1e6) + "M";
  if (a >= 1e3) return sign + Math.round(a / 1e3) + "K";
  return sign + a;
}
function monthLabel(ym) { const [y, m] = ym.split("-"); return m + "/" + y.slice(2); }

function CashflowTab({ inv, sub, t, lang }) {
  const map = {}; // ym -> {in, out}
  const bump = (date, field, amt) => { if (!date) return; const ym = String(date).slice(0, 7); if (!/^\d{4}-\d{2}$/.test(ym)) return; (map[ym] = map[ym] || { in: 0, out: 0 })[field] += Number(amt) || 0; };
  inv.forEach((c) => (c.paid || []).forEach((i) => bump(i.date, "in", i.amount)));
  sub.forEach((c) => (c.paid || []).forEach((i) => bump(i.date, "out", i.amount)));
  const months = Object.keys(map).sort();
  let cum = 0;
  const data = months.map((ym) => { const r = map[ym]; const net = r.in - r.out; cum += net; return { ym, label: monthLabel(ym), in: r.in, out: r.out, net, cum }; });

  const totalIn = inv.reduce((s, c) => s + sumItems(c.paid), 0);
  const totalOut = sub.reduce((s, c) => s + sumItems(c.paid), 0);
  const billed = inv.reduce((s, c) => s + sumItems(c.billed), 0);
  const cards = [
    { label: t.cfIn, val: totalIn, c: "#10b981", icon: <TrendingUp size={18} /> },
    { label: t.cfOut, val: totalOut, c: "#ef4444", icon: <TrendingDown size={18} /> },
    { label: t.cfNet, val: totalIn - totalOut, c: totalIn - totalOut >= 0 ? "#0ea5e9" : "#f97316", icon: <Banknote size={18} /> },
    { label: t.cfPending, val: Math.max(0, billed - totalIn), c: "#f59e0b", icon: <Send size={18} /> },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: c.c + "1a", color: c.c }}>{c.icon}</span>
            <div className="text-lg font-bold mt-2 tabular-nums" style={{ color: c.c }}>{fmtMoney(c.val, lang)}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {data.length === 0 ? <Empty2 icon={<Wallet size={44} />} text={t.cfNoData} /> : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{t.cfByMonth}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#10b981" }} />{t.cfIn}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#ef4444" }} />{t.cfOut}</span>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}><CashBars data={data} lang={lang} /></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{t.cfCumTitle}</h3>
              <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f97316" }} />{t.cfCumulative}</span>
            </div>
            <div style={{ overflowX: "auto" }}><CashLine data={data} lang={lang} /></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 520 }}>
              <thead><tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-4 py-2">{t.cfMonth}</th>
                <th className="text-right font-medium px-4 py-2">{t.cfIn}</th>
                <th className="text-right font-medium px-4 py-2">{t.cfOut}</th>
                <th className="text-right font-medium px-4 py-2">{t.cfNet}</th>
                <th className="text-right font-medium px-4 py-2">{t.cfCumulative}</th>
              </tr></thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.ym} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-600">{d.label}</td>
                    <td className="px-4 py-2 text-right tabular-nums" style={{ color: "#10b981" }}>{d.in ? fmtMoney(d.in, lang) : "—"}</td>
                    <td className="px-4 py-2 text-right tabular-nums" style={{ color: "#ef4444" }}>{d.out ? fmtMoney(d.out, lang) : "—"}</td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium" style={{ color: d.net >= 0 ? "#0ea5e9" : "#f97316" }}>{fmtMoney(d.net, lang)}</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold text-slate-700">{fmtMoney(d.cum, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function CashBars({ data, lang }) {
  const W = 720, H = 240, padL = 56, padR = 14, padT = 14, padB = 36;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const yMax = Math.max(1, ...data.map((d) => Math.max(d.in, d.out)));
  const n = data.length, gw = plotW / n;
  const bw = Math.min(16, gw / 3);
  const y = (v) => padT + plotH * (1 - v / yMax);
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((k) => yMax * k);
  const labelStep = Math.ceil(n / 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: Math.max(320, n * 36), height: "auto" }}>
      {gridVals.map((gv, i) => (
        <g key={i}>
          <line x1={padL} y1={y(gv)} x2={W - padR} y2={y(gv)} stroke="#eef2f7" />
          <text x={padL - 6} y={y(gv) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{fmtCompact(gv, lang)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = padL + gw * i + gw / 2;
        const inH = plotH * (d.in / yMax), outH = plotH * (d.out / yMax);
        return (
          <g key={d.ym}>
            <rect x={cx - bw - 1} y={y(d.in)} width={bw} height={inH} rx="2" fill="#10b981" />
            <rect x={cx + 1} y={y(d.out)} width={bw} height={outH} rx="2" fill="#ef4444" />
            {i % labelStep === 0 && <text x={cx} y={H - padB + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>}
          </g>
        );
      })}
      <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="#cbd5e1" />
    </svg>
  );
}

function CashLine({ data, lang }) {
  const W = 720, H = 210, padL = 56, padR = 14, padT = 14, padB = 36;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const cums = data.map((d) => d.cum);
  const maxV = Math.max(0, ...cums), minV = Math.min(0, ...cums);
  const range = (maxV - minV) || 1;
  const n = data.length;
  const x = (i) => n === 1 ? padL + plotW / 2 : padL + plotW * (i / (n - 1));
  const y = (v) => padT + plotH * (1 - (v - minV) / range);
  const pts = data.map((d, i) => `${x(i)},${y(d.cum)}`).join(" ");
  const area = `${padL},${y(0)} ${pts} ${x(n - 1)},${y(0)}`;
  const labelStep = Math.ceil(n / 12);
  const gridVals = [minV, minV + range / 2, maxV];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: Math.max(320, n * 36), height: "auto" }}>
      {gridVals.map((gv, i) => (
        <g key={i}>
          <line x1={padL} y1={y(gv)} x2={W - padR} y2={y(gv)} stroke="#eef2f7" />
          <text x={padL - 6} y={y(gv) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{fmtCompact(gv, lang)}</text>
        </g>
      ))}
      <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="#cbd5e1" />
      <polygon points={area} fill="#f9731633" />
      <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="2" />
      {data.map((d, i) => (
        <g key={d.ym}>
          <circle cx={x(i)} cy={y(d.cum)} r="3" fill="#f97316" />
          {i % labelStep === 0 && <text x={x(i)} y={H - padB + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>}
        </g>
      ))}
    </svg>
  );
}

/* ============================ SMALL CHARTS ============================ */
function Donut({ segments, size = 150, thickness = 22, centerLabel, centerSub }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef2f7" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const frac = s.value / total; const dash = frac * C;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
          strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-off} transform={`rotate(-90 ${cx} ${cy})`} />;
        off += dash; return el;
      })}
      {centerLabel != null && <text x={cx} y={cy - 2} textAnchor="middle" fontSize="22" fontWeight="700" fill="#334155">{centerLabel}</text>}
      {centerSub && <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="#94a3b8">{centerSub}</text>}
    </svg>
  );
}
function HBars({ rows, lang, t }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="text-xs text-slate-600 truncate flex items-center gap-1" style={{ width: 130 }}>{r.label}{r.dept && t ? <DeptTag dept={r.dept} t={t} /> : null}</span>
          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: r.color || "#f97316" }} /></div>
          <span className="text-xs font-medium text-slate-600 tabular-nums" style={{ width: 28, textAlign: "right" }}>{r.value}</span>
        </div>
      ))}
      {rows.length === 0 && <p className="text-xs text-slate-400">—</p>}
    </div>
  );
}
function ChartLegend({ items }) {
  return <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">{items.map((i) => (
    <span key={i.label} className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: i.color }} />{i.label}: <b className="text-slate-700">{i.value}</b></span>
  ))}</div>;
}

/* ============================ WORKLOAD VIEW ============================ */
function WorkloadView({ t, lang, members, tasks, projects }) {
  const [proj, setProj] = useState("");
  const scope = proj ? tasks.filter((x) => x.projectId === proj) : tasks;
  const rows = members.map((m) => {
    const mine = scope.filter((x) => (x.assignees || []).includes(m.id) && !x.completed);
    const primary = mine.filter((x) => x.primaryAssigneeId === m.id);
    const overdue = mine.filter((x) => x.dueDate && new Date(x.dueDate + "T00:00:00") < today0());
    return { m, open: mine.length, primary: primary.length, overdue: overdue.length };
  }).sort((a, b) => b.open - a.open);
  const maxOpen = Math.max(1, ...rows.map((r) => r.open));
  const avg = rows.length ? rows.reduce((s, r) => s + r.open, 0) / rows.length : 0;
  const band = (open) => open >= Math.max(6, avg * 1.5) ? { label: t.overloaded, c: "#ef4444" } : open <= avg * 0.5 ? { label: t.lightLoad, c: "#10b981" } : { label: t.balanced, c: "#0ea5e9" };
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{t.workloadHint}</p>
        <AntSelect value={proj} onChange={(v) => setProj(v)} style={{ minWidth: 190 }} className="shrink-0" options={[{ value: "", label: t.allProjectsLabel }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {rows.map(({ m, open, primary, overdue }) => {
          const b = band(open);
          return (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={m.name} size={34} />
              <div style={{ width: 150 }} className="min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate flex items-center gap-1.5">{m.name} {!m.isLeader && <DeptTag dept={m.dept} t={t} />}</div>
                <div className="text-xs" style={{ color: b.c }}>{b.label}</div>
              </div>
              <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${(open / maxOpen) * 100}%`, background: b.c, minWidth: open ? 24 : 0 }}>{open > 0 && <span className="text-xs text-white font-medium">{open}</span>}</div></div>
              <div className="text-xs text-slate-400 shrink-0" style={{ width: 150 }}>
                <span className="text-slate-600 font-medium">{open}</span> {t.tasksOpen} · <Star size={10} className="inline -mt-0.5 text-amber-500" fill="#f59e0b" />{primary}{overdue > 0 && <> · <span className="text-red-500">{overdue} {t.overdueTasks}</span></>}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">—</div>}
      </div>
    </div>
  );
}

/* ============================ TIMELINE (GANTT) ============================ */
const DAY_MS = 86400000;
function isoOf(d) { return d.toISOString().slice(0, 10); }
function parseISO(s) { return s ? new Date(s + "T00:00:00") : null; }
function TimelineView({ t, lang, canEdit, tasks, memberById, onOpenTask, onReschedule }) {
  const [drag, setDrag] = useState(null); // {id, startX, origStart, origEnd, deltaDays}
  const PX = 26, ROW = 38, LABEL_W = 224;

  // (hooks phải chạy trước mọi early-return — bản cũ đặt effect sau return khi rỗng, vi phạm rules of hooks)
  useEffect(() => {
    if (!drag) return;
    const move = (ev) => { const dx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - drag.startX; setDrag((d) => d ? { ...d, deltaDays: Math.round(dx / PX) } : d); };
    const up = () => {
      setDrag((d) => {
        if (d && d.deltaDays) {
          const ns = new Date(d.origStart.getTime() + d.deltaDays * DAY_MS);
          const ne = new Date(d.origEnd.getTime() + d.deltaDays * DAY_MS);
          onReschedule(d.id, isoOf(ns), isoOf(ne));
        }
        return null;
      });
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move); window.addEventListener("touchend", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
  }, [drag, onReschedule]);

  const undated = tasks.filter((tk) => !parseISO(tk.startDate) && !parseISO(tk.dueDate)).length;
  const items = tasks.map((tk) => {
    let s = parseISO(tk.startDate) || parseISO(tk.dueDate);
    let e = parseISO(tk.dueDate) || parseISO(tk.startDate);
    if (!s || !e) return null;
    if (e < s) e = s;
    return { tk, start: s, end: e };
  }).filter(Boolean).sort((a, b) => (a.start - b.start) || (a.end - b.end) || String(a.tk.title || "").localeCompare(String(b.tk.title || "")));
  if (items.length === 0) return <div className="p-6"><Empty2 icon={<CalendarRange size={44} />} text={t.noTimelineData} /></div>;

  let min = items[0].start, max = items[0].end;
  items.forEach((it) => { if (it.start < min) min = it.start; if (it.end > max) max = it.end; });
  min = new Date(min.getTime() - 2 * DAY_MS); max = new Date(max.getTime() + 3 * DAY_MS);
  const totalDays = Math.round((max - min) / DAY_MS) + 1;
  const dayOf = (d) => Math.round((d - min) / DAY_MS);

  /* ---- CPM (Critical Path Method) trên lịch thực tế ----
     ES = muộn nhất giữa ngày bắt đầu tự đặt và lúc các việc phụ thuộc xong (ràng buộc "không sớm hơn").
     Dự trữ (slack) = LS - ES. Slack = 0 => nằm trên ĐƯỜNG GĂNG: trễ 1 ngày là cả dự án trễ 1 ngày. */
  const nodeById = {};
  items.forEach((it, i) => { nodeById[it.tk.id] = { i, startDay: dayOf(it.start), dur: Math.round((it.end - it.start) / DAY_MS) + 1, deps: [] }; });
  items.forEach((it) => { nodeById[it.tk.id].deps = (it.tk.dependsOn || []).filter((d) => nodeById[d]); });
  const succ = {}; Object.keys(nodeById).forEach((id) => { succ[id] = []; });
  Object.keys(nodeById).forEach((id) => nodeById[id].deps.forEach((d) => succ[d].push(id)));
  const indeg = {}; Object.keys(nodeById).forEach((id) => { indeg[id] = nodeById[id].deps.length; });
  const topo = []; const tq = Object.keys(nodeById).filter((id) => !indeg[id]);
  while (tq.length) { const id = tq.shift(); topo.push(id); for (const s of succ[id]) if (--indeg[s] === 0) tq.push(s); }
  const hasCycle = topo.length !== items.length; // có phụ thuộc vòng tròn -> bỏ tính đường găng, chỉ cảnh báo
  const es = {}, ef = {}, ls = {}, lf = {}, slackOf = {}; const violated = new Set();
  if (!hasCycle) {
    for (const id of topo) {
      const n = nodeById[id];
      const depEnd = n.deps.length ? Math.max(...n.deps.map((d) => ef[d])) : 0;
      es[id] = Math.max(n.startDay, depEnd); ef[id] = es[id] + n.dur;
      for (const d of n.deps) { const dn = nodeById[d]; if (n.startDay < dn.startDay + dn.dur - 1) { violated.add(id); break; } } // bắt đầu khi việc phụ thuộc còn đang chạy
    }
    const projEnd = Math.max(...Object.values(ef));
    for (const id of [...topo].reverse()) {
      lf[id] = succ[id].length ? Math.min(...succ[id].map((s) => ls[s])) : projEnd;
      ls[id] = lf[id] - nodeById[id].dur; slackOf[id] = ls[id] - es[id];
    }
  }
  const isCritical = (id) => !hasCycle && slackOf[id] === 0;

  const geo = {};
  items.forEach((it, i) => { const so = dayOf(it.start); const sp = Math.round((it.end - it.start) / DAY_MS) + 1; geo[it.tk.id] = { i, so, sp }; });
  const depLines = [];
  items.forEach((it) => { (it.tk.dependsOn || []).forEach((dep) => {
    const a = geo[dep], b = geo[it.tk.id]; if (!a || !b) return;
    const tight = isCritical(dep) && isCritical(it.tk.id) && ef[dep] === es[it.tk.id]; // cạnh nằm trên đường găng
    const dn = nodeById[dep];
    const bad = !hasCycle && nodeById[it.tk.id].startDay < dn.startDay + dn.dur - 1; // vi phạm lịch
    depLines.push({ x1: (a.so + a.sp) * PX, y1: a.i * ROW + 19, x2: b.so * PX, y2: b.i * ROW + 19, tight, bad });
  }); });

  // month header ticks
  const ticks = []; let cur = new Date(min);
  while (cur <= max) { const dayOffset = Math.round((cur - min) / DAY_MS); ticks.push({ off: dayOffset, label: `${cur.getDate()}/${cur.getMonth() + 1}` }); cur = new Date(cur.getTime() + 7 * DAY_MS); }
  const now0 = new Date();
  const todayOff = dayOf(new Date(now0.getFullYear(), now0.getMonth(), now0.getDate()));
  const showToday = todayOff >= 0 && todayOff <= totalDays;

  return (
    <div className="p-6">
      <p className="text-sm text-slate-500 mb-2">{t.ganttHint}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 rounded-sm" style={{ height: 10, background: "#dc2626" }} />{t.criticalPath}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 rounded-sm" style={{ height: 10, background: "#f97316" }} />{t.normalTask}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 rounded-sm" style={{ height: 10, background: "#10b981" }} />{t.done}</span>
        <span className="flex items-center gap-1.5"><svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" /></svg>{t.depLine}</span>
        {showToday && <span className="flex items-center gap-1.5"><span className="inline-block" style={{ width: 2, height: 12, background: "#0ea5e9" }} />{t.today}</span>}
        {undated > 0 && <span className="text-slate-400">• {undated} {t.undatedHint}</span>}
        {hasCycle && <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={13} />{t.cycleWarn}</span>}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <div style={{ minWidth: LABEL_W + totalDays * PX }}>
          {/* header */}
          <div className="flex border-b border-slate-200 sticky top-0 bg-white" style={{ height: 28 }}>
            <div style={{ width: LABEL_W }} className="shrink-0 border-r border-slate-100" />
            <div className="relative flex-1">
              {ticks.map((tk, i) => <div key={i} className="absolute text-xs text-slate-400" style={{ left: tk.off * PX, top: 6 }}>{tk.label}</div>)}
            </div>
          </div>
          {/* rows */}
          <div style={{ position: "relative" }}>
            {showToday && <div style={{ position: "absolute", left: LABEL_W + todayOff * PX, top: 0, height: items.length * ROW, width: 2, background: "#0ea5e9", opacity: 0.45, zIndex: 4, pointerEvents: "none" }} />}
            <svg width={totalDays * PX} height={items.length * ROW} style={{ position: "absolute", left: LABEL_W, top: 0, pointerEvents: "none", overflow: "visible", zIndex: 5 }}>
              {depLines.map((l, i) => {
                const color = l.bad ? "#ef4444" : l.tight ? "#dc2626" : "#f59e0b";
                return (
                  <g key={i}>
                    <path d={`M ${l.x1} ${l.y1} C ${l.x1 + 16} ${l.y1}, ${l.x2 - 16} ${l.y2}, ${l.x2} ${l.y2}`} fill="none" stroke={color} strokeWidth={l.tight ? 2.5 : l.bad ? 2 : 1.5} strokeDasharray={l.tight ? undefined : l.bad ? "4 3" : "3 2"} />
                    <polygon points={`${l.x2},${l.y2} ${l.x2 - 6},${l.y2 - 3} ${l.x2 - 6},${l.y2 + 3}`} fill={color} />
                  </g>
                );
              })}
            </svg>
            {items.map((it) => {
            const isDrag = drag && drag.id === it.tk.id;
            const delta = isDrag ? drag.deltaDays : 0;
            const startOff = Math.round((it.start - min) / DAY_MS) + delta;
            const span = Math.round((it.end - it.start) / DAY_MS) + 1;
            const m = it.tk.primaryAssigneeId ? memberById[it.tk.primaryAssigneeId] : null;
            const wd = it.tk.workdone || 0;
            const critical = isCritical(it.tk.id) && !it.tk.completed;
            const barColor = it.tk.completed ? "#10b981" : critical ? "#dc2626" : "#f97316";
            const slackDays = !hasCycle && !it.tk.completed ? slackOf[it.tk.id] : null;
            const barTip = critical ? t.criticalTip : (slackDays != null ? t.slackDays + ": " + slackDays + " " + t.daysUnit : "");
            const depCount = (it.tk.dependsOn || []).length;
            const isBad = violated.has(it.tk.id);
            return (
              <div key={it.tk.id} className="flex items-center border-b border-slate-50" style={{ height: ROW }}>
                <div style={{ width: LABEL_W }} className="shrink-0 px-3 border-r border-slate-100 flex items-center gap-1.5">
                  <button onClick={() => onOpenTask(it.tk.id)} className="text-sm text-slate-700 truncate hover:text-orange-600 text-left flex-1">{it.tk.title || t.untitled}</button>
                  {critical && <span className="text-[10px] font-bold text-red-600 bg-red-50 rounded px-1 py-0.5 shrink-0">{t.criticalBadge}</span>}
                  {isBad && <span title={t.depViolation} className="text-red-500 shrink-0 flex items-center"><AlertTriangle size={13} /></span>}
                  {depCount > 0 && <span title={t.waitingOn} className="text-xs text-amber-500 flex items-center shrink-0"><Network size={12} />{depCount}</span>}
                </div>
                <div className="relative flex-1" style={{ height: "100%" }}>
                  <div onMouseDown={(ev) => canEdit && setDrag({ id: it.tk.id, startX: ev.clientX, origStart: it.start, origEnd: it.end, deltaDays: 0 })}
                    onTouchStart={(ev) => canEdit && setDrag({ id: it.tk.id, startX: ev.touches[0].clientX, origStart: it.start, origEnd: it.end, deltaDays: 0 })}
                    onClick={() => { if (!isDrag) onOpenTask(it.tk.id); }}
                    title={barTip}
                    className="absolute rounded-md flex items-center px-2 gap-1 text-white shadow-sm"
                    style={{ left: startOff * PX, width: Math.max(span * PX - 3, 18), top: 7, height: 24, background: barColor, cursor: canEdit ? "grab" : "pointer", opacity: isDrag ? 0.8 : 1 }}>
                    <span className="absolute left-0 top-0 bottom-0 rounded-md" style={{ width: `${wd}%`, background: "rgba(255,255,255,0.25)" }} />
                    {m && <span className="relative"><Avatar name={m.name} size={16} /></span>}
                    <span className="relative text-xs truncate">{wd > 0 ? wd + "%" : ""}</span>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ REPORT (download) ============================ */
function buildReportHTML({ t, lang, project, projects, tasks, members, finance, canFinance }) {
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const memName = (id) => (members.find((m) => m.id === id) || {}).name || "";
  const scopeProjects = project ? projects.filter((p) => p.id === project.id) : projects;
  const now = new Date();
  const fmtMoney2 = (n) => { try { return new Intl.NumberFormat("vi-VN").format(Number(n) || 0) + " ₫"; } catch { return (n || 0) + " ₫"; } };
  let body = "";
  scopeProjects.forEach((p) => {
    const pts = tasks.filter((x) => x.projectId === p.id);
    const done = pts.filter((x) => x.completed).length;
    const pct = pts.length ? Math.round((done / pts.length) * 100) : 0;
    body += `<h2 style="margin:24px 0 4px;color:#ea580c">${esc(p.name)}</h2>`;
    body += `<div style="color:#64748b;margin-bottom:8px">${t.statProgress}: <b>${pct}%</b> · ${done}/${pts.length} ${t.done}</div>`;
    body += `<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#f1f5f9;text-align:left">
      <th style="padding:6px 8px">${t.title}</th><th style="padding:6px 8px">${t.assignee}</th>
      <th style="padding:6px 8px">${t.workdoneShort}</th><th style="padding:6px 8px">${t.dueDate}</th><th style="padding:6px 8px">${t.priority}</th></tr></thead><tbody>`;
    pts.forEach((x) => {
      const who = (x.assignees || []).map(memName).filter(Boolean).join(", ");
      body += `<tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:6px 8px">${x.completed ? "✓ " : ""}${esc(x.title) || "—"}</td>
        <td style="padding:6px 8px">${esc(who)}</td>
        <td style="padding:6px 8px">${x.workdone || 0}%</td>
        <td style="padding:6px 8px">${esc(x.dueDate) || "—"}</td>
        <td style="padding:6px 8px">${esc(t.priorities[x.priority] || x.priority)}</td></tr>`;
    });
    body += `</tbody></table>`;
  });
  if (canFinance && finance) {
    const inv = finance.investorContracts || [], sub = finance.subContracts || [];
    const invV = inv.reduce((s, c) => s + (Number(c.value) || 0), 0);
    const recv = inv.reduce((s, c) => s + sumItems(c.paid), 0);
    const subPaid = sub.reduce((s, c) => s + sumItems(c.paid), 0);
    body += `<h2 style="margin:24px 0 4px;color:#0d9488">${t.finance}</h2>
      <div style="font-size:13px;color:#334155">
      ${t.sumInvValue}: <b>${fmtMoney2(invV)}</b> · ${t.sumReceived}: <b>${fmtMoney2(recv)}</b> · ${t.sumSubPaid}: <b>${fmtMoney2(subPaid)}</b></div>`;
  }
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(t.reportFor)} — ${esc(t.appName)}</title></head>
    <body style="font-family:Arial,system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#1e293b">
    <h1 style="color:#ea580c;margin-bottom:0">${esc(t.appName)} — ${esc(t.reportFor)}</h1>
    <div style="color:#94a3b8;font-size:12px">${t.generatedAt}: ${now.toLocaleString(lang === "vi" ? "vi-VN" : "en-US")}</div>
    ${body}</body></html>`;
}

/* ============================ HISTORY VIEW ============================ */
function HistoryView({ t, lang, history, projects, canDelete, onDelete }) {
  const [proj, setProj] = useState("");
  const q = (s) => `“${s || t.untitled}”`;
  const describe = (e) => {
    const A = t.act; const where = e.projectName ? ` ${t.inProject} ${e.projectName}` : "";
    switch (e.action) {
      case "task_create": case "task_delete": case "task_complete": case "task_reopen":
        return `${A[e.action]} ${q(e.taskTitle)}${where}`;
      case "comment_add": return `${A.comment_add} ${q(e.taskTitle)}${where}`;
      case "task_assign": return `${A.task_assign} ${q(e.taskTitle)} → ${e.to}${e.primaryName ? ` (★ ${e.primaryName})` : ""}${where}`;
      case "task_workdone": return `${A.task_workdone} ${q(e.taskTitle)}: ${e.from} → ${e.to}${where}`;
      case "task_reminder": return `${A.task_reminder} ${q(e.taskTitle)}: ${e.to}${where}`;
      case "section_add": return `${A.section_add} “${e.to}”${where}`;
      case "project_create": return `${A.project_create} “${e.projectName}”`;
      case "project_delete": return `${A.project_delete} “${e.projectName}”`;
      case "member_add": return `${A.member_add} ${e.to}`;
      case "member_remove": return `${A.member_remove} ${e.to}`;
      case "history_grant": return `${A.history_grant} ${e.to}`;
      case "history_revoke": return `${A.history_revoke} ${e.to}`;
      case "member_role": return `${A.member_role} ${e.to}: ${t.roles[e.fromKey] || e.fromKey} → ${t.roles[e.toKey] || e.toKey}`;
      case "member_cap": return `${A.member_cap} ${e.to}: ${(t.caps && t.caps[e.capKey]) || e.capKey} ${e.val ? "✓" : "✕"}`;
      case "task_field": {
        const fname = t.field[e.field] || e.field; let detail = "";
        if (e.field === "priority") detail = `: ${t.priorities[e.fromKey]} → ${t.priorities[e.toKey]}`;
        else if (e.field === "section" || e.field === "dueDate" || e.field === "title") detail = `: ${e.from || t.emptyVal} → ${e.to || t.emptyVal}`;
        return `${A.task_field} ${fname}${detail} · ${q(e.taskTitle)}${where}`;
      }
      default: return e.action;
    }
  };
  const rows = history.filter((e) => !proj || e.projectId === proj);
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{rows.length} {lang === "vi" ? "thay đổi" : "changes"}</p>
        <AntSelect value={proj} onChange={(v) => setProj(v)} style={{ minWidth: 190 }} options={[{ value: "", label: t.allProjects }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
      </div>
      {rows.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><ScrollText size={44} className="mx-auto mb-3 opacity-40" /><p className="text-sm">{t.noHistory}</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {rows.map((e) => (
            <div key={e.id} className="flex gap-3 px-4 py-3">
              <Avatar name={e.actor} size={30} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700"><span className="font-semibold">{e.actor}</span> {describe(e)}</p>
                <p className="text-xs text-slate-400 mt-0.5" title={new Date(e.ts).toLocaleString()}>{relTime(e.ts, lang)} · {new Date(e.ts).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              {canDelete && <button onClick={() => { if (window.confirm(lang === "vi" ? "Xóa dòng lịch sử này?" : "Delete this history entry?")) onDelete(e.id); }} className="text-slate-300 hover:text-red-500 p-1 shrink-0 self-center" title={t.delete}><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ TASK DETAIL ============================ */
function TaskFiles({ t, lang, task, canEdit }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const load = async () => { const r = await api("/api/taskfiles?taskId=" + encodeURIComponent(task.id)); if (r.ok) setFiles(r.body.files || []); };
  useEffect(() => { load(); }, [task.id]); // eslint-disable-line
  const openFile = async (idx) => { try { const tok = getToken(); const r = await fetch("/api/taskfiles/file?taskId=" + encodeURIComponent(task.id) + "&idx=" + idx, { headers: tok ? { Authorization: "Bearer " + tok } : {} }); if (!r.ok) return; const blob = await r.blob(); const url = URL.createObjectURL(blob); window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 30000); } catch (e) {} };
  const upload = async (fileList) => { setBusy(true); for (const f of Array.from(fileList || [])) { try { const tok = getToken(); await fetch("/api/taskfiles/upload?taskId=" + encodeURIComponent(task.id) + "&filename=" + encodeURIComponent(f.name), { method: "POST", headers: { ...(tok ? { Authorization: "Bearer " + tok } : {}), "Content-Type": f.type || "application/octet-stream" }, body: f }); } catch (e) {} } setBusy(false); load(); };
  const del = async (idx) => { if (!window.confirm((lang === "vi" ? "Xóa tệp này?" : "Delete this file?"))) return; const tok = getToken(); await fetch("/api/taskfiles/delete?taskId=" + encodeURIComponent(task.id) + "&idx=" + idx, { method: "POST", headers: tok ? { Authorization: "Bearer " + tok } : {} }); load(); };
  return (
    <div>
      <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-1.5"><ScrollText size={15} />{t.attachments} {files.length > 0 && <span className="text-xs text-slate-400">{files.length}</span>}</label>
      <div className="space-y-1.5">
        {files.map((f) => (
          <div key={f.idx} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
            <Download size={15} className="text-slate-400 shrink-0" />
            <button onClick={() => openFile(f.idx)} className="flex-1 text-left text-sm text-orange-600 hover:underline truncate">{f.name}</button>
            <span className="text-xs text-slate-400 shrink-0">{Math.round((f.size || 0) / 1024)} KB</span>
            {canEdit && <button onClick={() => del(f.idx)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>}
          </div>
        ))}
        {files.length === 0 && <p className="text-xs text-slate-400">{lang === "vi" ? "Chưa có tệp." : "No files."}</p>}
      </div>
      {canEdit && <label className="mt-2 inline-flex items-center gap-1.5 text-sm text-orange-600 hover:underline cursor-pointer"><Plus size={14} />{busy ? (lang === "vi" ? "Đang tải..." : "Uploading...") : (lang === "vi" ? "Thêm tệp" : "Add files")}<input type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} /></label>}
    </div>
  );
}
function TaskDetail({ t, lang, task, members, memberById, me, canEdit, canWorkdone, sections, projTasks, onClose, onPatch, onAssign, onWorkdone, onReminder, onDepends, onDelete, onComment, onStatus, onApprove, onApprover, canApprove, assignableIds, canRemind, serverMode }) {
  const [tagInput, setTagInput] = useState("");
  const [subInput, setSubInput] = useState("");
  const [comment, setComment] = useState("");
  const ro = !canEdit;
  const addTag = () => { const v = tagInput.trim(); if (v && !task.tags.includes(v)) onPatch({ tags: [...task.tags, v] }); setTagInput(""); };
  const addSub = () => { const v = subInput.trim(); if (v) onPatch({ subtasks: [...task.subtasks, { id: uid(), title: v, done: false }] }); setSubInput(""); };
  const toggleSub = (id) => onPatch({ subtasks: task.subtasks.map((s) => s.id === id ? { ...s, done: !s.done } : s) });
  const removeSub = (id) => onPatch({ subtasks: task.subtasks.filter((s) => s.id !== id) });
  const addDays = (iso, n) => { if (!iso) return ""; const d = new Date(iso + "T00:00:00"); if (isNaN(d.getTime())) return ""; d.setDate(d.getDate() + n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const applyDates = (field, value) => {
    let start = task.startDate || "", due = task.dueDate || "", dur = task.duration || 0;
    if (field === "start") start = value;
    else if (field === "due") due = value;
    else if (field === "dur") dur = Math.max(0, parseInt(value, 10) || 0);
    if (field === "dur") { if (start && dur > 0) due = addDays(start, dur); else if (due && dur > 0) start = addDays(due, -dur); }
    else if (field === "start") { if (start && dur > 0) due = addDays(start, dur); }
    else if (field === "due") { if (due && dur > 0) start = addDays(due, -dur); }
    onPatch({ startDate: start, dueDate: due, duration: dur || null });
  };
  const subDone = task.subtasks.filter((s) => s.done).length;
  const send = () => { if (comment.trim()) { onComment(comment); setComment(""); } };
  const toggleAssignee = (id) => {
    const has = task.assignees.includes(id);
    const next = has ? task.assignees.filter((a) => a !== id) : [...task.assignees, id];
    let prim = task.primaryAssigneeId;
    if (has && prim === id) prim = next[0] || null;
    if (!has && !prim) prim = id;
    onAssign(next, prim);
  };
  // reminder editing state
  const initUnit = task.reminderLead && task.reminderLead % 1440 === 0 ? "day" : "hour";
  const initVal = task.reminderLead ? (initUnit === "day" ? task.reminderLead / 1440 : task.reminderLead / 60) : "";
  const [remOn, setRemOn] = useState(!!task.reminderLead);
  const [remVal, setRemVal] = useState(initVal);
  const [remUnit, setRemUnit] = useState(initUnit);
  useEffect(() => { setRemOn(!!task.reminderLead); setRemVal(task.reminderLead ? (task.reminderLead % 1440 === 0 ? task.reminderLead / 1440 : task.reminderLead / 60) : ""); setRemUnit(task.reminderLead && task.reminderLead % 1440 === 0 ? "day" : "hour"); }, [task.id]); // eslint-disable-line
  const applyReminder = () => {
    if (!remOn || !remVal) { onReminder(null); return; }
    const mins = Math.max(1, parseInt(remVal, 10) || 0) * (remUnit === "day" ? 1440 : 60);
    onReminder(mins);
  };

  return (
    <AntDrawer open onClose={onClose} placement="right" width={480} styles={{ body: { padding: 0 } }}
      title={<div className="flex items-center gap-2"><span className="text-sm text-slate-500">{t.workdoneShort}</span><span className="text-sm font-semibold" style={{ color: task.workdone >= 100 ? "#10b981" : "#f97316" }}>{task.workdone || 0}%</span></div>}
      extra={!ro ? <AntBtn type="text" danger icon={<Trash2 size={18} />} onClick={onDelete} /> : undefined}>
        {ro && <div className="px-5 py-2 bg-slate-50 text-xs text-slate-500 flex items-center gap-1.5 border-b border-slate-100"><Lock size={12} />{t.readOnly}</div>}
        <div className="px-5 py-5 space-y-5">
          <AntInput.TextArea value={task.title} readOnly={ro} onChange={(e) => onPatch({ title: e.target.value })} placeholder={t.untitled} variant="borderless" autoSize
            className={task.completed ? "line-through text-slate-400" : "text-slate-800"} style={{ fontSize: "1.25rem", fontWeight: 600, padding: 0, resize: "none" }} />

          {/* WORKDONE */}
          <div className="rounded-xl border border-slate-200 p-3.5" style={{ background: "#fafbff" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5"><Percent size={15} />{t.workdone}</span>
              <span className="text-sm font-bold" style={{ color: task.workdone >= 100 ? "#10b981" : "#f97316" }}>{task.workdone || 0}%</span>
            </div>
            <AntSlider min={0} max={100} step={5} value={task.workdone || 0} disabled={!canWorkdone} onChange={(v) => onWorkdone(v)} />
            <div className="flex gap-1 mt-2">
              {[0, 25, 50, 75, 100].map((v) => (
                <button key={v} disabled={!canWorkdone} onClick={() => onWorkdone(v)} className={`flex-1 text-xs py-1 rounded border transition ${task.workdone === v ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`} style={{ opacity: canWorkdone ? 1 : 0.5 }}>{v}%</button>
              ))}
            </div>
            {!canWorkdone && <p className="text-xs text-slate-400 mt-2">{t.workdoneHint}</p>}
          </div>

          <div className="space-y-3">
            <Field icon={<ListChecks size={15} />} label={t.statusLabel}>
              <AntSelect value={task.status || "todo"} disabled={ro} onChange={(v) => onStatus(v)} style={{ width: "100%" }} options={STATUS_ORDER.map((st) => ({ value: st, label: t.statuses[st] }))} />
            </Field>
            {!ro && <Field icon={<UserCheck size={15} />} label={t.approver}>
              <div className="flex gap-1.5">{[["teamlead", t.byTeamlead], ["leader", t.byLeader]].map(([a, lbl]) => (
                <button key={a} onClick={() => onApprover(a)} className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition ${(task.approver || "teamlead") === a ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{lbl}</button>
              ))}</div>
            </Field>}
            {task.status === "review" && canApprove && <button onClick={onApprove} style={{ background: "#16a34a" }} className="w-full py-2 text-sm font-semibold text-white rounded-lg transition flex items-center justify-center gap-1.5"><Check size={16} />{t.approveBtn}</button>}
            <Field icon={<Flag size={15} />} label={t.priority}>
              <div className="flex gap-1.5">{PRIORITY_ORDER.map((p) => { const m = PRIORITY_META[p]; const active = task.priority === p; return (
                <button key={p} disabled={ro} onClick={() => onPatch({ priority: p })} className="flex-1 text-xs font-medium py-1.5 rounded-lg border transition" style={active ? { background: m.bg, color: m.color, borderColor: m.ring } : { borderColor: "#e2e8f0", color: "#64748b" }}>{t.priorities[p]}</button>); })}</div>
            </Field>
          {/* DEPENDENCIES */}
          {(() => {
            const others = (projTasks || []).filter((x) => x.id !== task.id);
            const byId = (id) => others.find((x) => x.id === id);
            const deps = task.dependsOn || [];
            const blockingList = others.filter((x) => (x.dependsOn || []).includes(task.id));
            const unmet = deps.map(byId).filter((x) => x && !x.completed);
            const toggle = (id) => { const cur = task.dependsOn || []; onDepends(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]); };
            return (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: "#f8fafc" }}>
                  <Network size={16} className="text-orange-500" /><span className="text-sm font-semibold text-slate-700">{t.dependencies}</span>
                  {unmet.length > 0 && <span className="ml-auto text-xs font-medium text-amber-600 flex items-center gap-1"><AlertTriangle size={12} />{t.blocked}</span>}
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-amber-600 mb-1.5 flex items-center gap-1"><Clock size={12} />{t.waitingOn}</div>
                    {ro ? (
                      <div className="text-sm text-slate-600">{deps.map((id) => byId(id)?.title).filter(Boolean).join(", ") || t.none}</div>
                    ) : others.length === 0 ? <p className="text-xs text-slate-400">{t.none}</p> : (
                      <div className="space-y-0.5" style={{ maxHeight: 150, overflowY: "auto" }}>
                        {others.map((o) => { const checked = deps.includes(o.id); return (
                          <label key={o.id} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                            <input type="checkbox" checked={checked} onChange={() => toggle(o.id)} className="accent-orange-600" />
                            <span className={`flex-1 text-sm truncate ${o.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{o.title || t.untitled}</span>
                            {o.completed && <CheckCircle2 size={13} className="text-green-500 shrink-0" />}
                          </label>
                        ); })}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-orange-600 mb-1.5 flex items-center gap-1"><ArrowRight size={12} />{t.blocking}</div>
                    <div className="text-sm text-slate-600">{blockingList.length ? blockingList.map((x) => x.title || t.untitled).join(", ") : t.none}</div>
                  </div>
                </div>
              </div>
            );
          })()}

            <Field icon={<CalendarDays size={15} />} label={t.startDate}>
              <input type="date" value={task.startDate || ""} disabled={ro} onChange={(e) => applyDates("start", e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-slate-50" />
            </Field>
            <Field icon={<Clock size={15} />} label={t.plannedDays}>
              <AntInput type="number" min="0" value={task.duration || ""} disabled={ro} onChange={(e) => applyDates("dur", e.target.value)} placeholder="0" style={{ width: "100%" }} />
            </Field>
            <Field icon={<CalendarRange size={15} />} label={t.dueDate}>
              <input type="date" value={task.dueDate || ""} disabled={ro} onChange={(e) => applyDates("due", e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-slate-50" />
            </Field>
            <p className="text-xs text-slate-400">{lang === "vi" ? "Nhập 2 trong 3 ô — hệ thống tự tính ô còn lại." : "Fill any 2 of 3 — the third is computed."}</p>
          </div>

          {/* ASSIGNEES */}
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-1.5"><Users size={15} />{t.assignees}</label>
            <div className="space-y-1">
              {(ro ? members.filter((mm) => task.assignees.includes(mm.id)) : [...members].sort((a, b) => {
                const rank = (mm) => task.assignees.includes(mm.id) ? 0 : (assignableIds && assignableIds.has(mm.id) ? 1 : 2);
                return rank(a) - rank(b) || String(a.name || "").localeCompare(String(b.name || ""));
              })).map((m, _idx, _arr) => {
                const checked = task.assignees.includes(m.id);
                const isPrimary = task.primaryAssigneeId === m.id;
                const showDivider = !ro && _idx > 0 && task.assignees.includes(_arr[_idx - 1].id) && !checked;
                return (
                  <div key={m.id}>
                    {showDivider && <div className="text-xs text-slate-400 px-2 pt-2 pb-1 border-t border-slate-100 mt-1">{lang === "vi" ? "Chưa / không được phân công" : "Not assigned"}</div>}
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${checked ? "border-orange-200 bg-orange-50/40" : "border-transparent"}`}>
                    <input type="checkbox" disabled={ro || (assignableIds && !assignableIds.has(m.id))} checked={checked} onChange={() => toggleAssignee(m.id)} className="accent-orange-600" />
                    <Avatar name={m.name} size={24} ring={isPrimary ? "#f59e0b" : undefined} />
                    <span className="flex-1 text-sm text-slate-700 truncate flex items-center gap-1.5">{m.name} {!m.isLeader && <DeptTag dept={m.dept} t={t} />}</span>
                    {checked && (
                      <button disabled={ro || (assignableIds && !assignableIds.has(m.id))} onClick={() => onAssign(task.assignees, m.id)} title={t.setPrimary}
                        className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${isPrimary ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-500"}`}>
                        <Star size={13} fill={isPrimary ? "#f59e0b" : "none"} />{isPrimary ? t.primary : ""}
                      </button>
                    )}
                  </div>
                  </div>
                );
              })}
              {task.assignees.length === 0 && <p className="text-xs text-slate-400 px-2">{t.noAssignees}</p>}
            </div>
          </div>

          {!ro && <div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-600 flex items-center gap-1.5"><RefreshCw size={15} />{t.recur}:</span><AntSelect value={task.recur || "none"} onChange={(v) => onPatch({ recur: v })} size="small" style={{ minWidth: 130 }} options={[{ value: "none", label: t.recurNone }, { value: "weekly", label: t.recurWeekly }, { value: "monthly", label: t.recurMonthly }]} /></div>}
          {/* REMINDER */}
          {canRemind && (<div className="rounded-xl border border-slate-200 p-3.5">
            <label className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1.5"><Bell size={15} />{t.reminder}</label>
            {ro ? (
              <p className="text-sm text-slate-500">{task.reminderLead ? `${t.reminderSet}: ${leadToText(task.reminderLead, t)}` : t.noReminder}</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-sm text-slate-600"><input type="checkbox" checked={remOn} onChange={(e) => setRemOn(e.target.checked)} className="accent-orange-600" />{t.remindBefore}</label>
                </div>
                {remOn && (
                  <div className="flex items-center gap-2 mt-2">
                    <AntInput type="number" min="1" value={remVal} onChange={(e) => setRemVal(e.target.value)} style={{ width: 80 }} />
                    <AntSelect value={remUnit} onChange={(v) => setRemUnit(v)} style={{ minWidth: 90 }} options={[{ value: "hour", label: t.unitHour }, { value: "day", label: t.unitDay }]} />
                    <AntBtn type="primary" onClick={applyReminder}>{t.save}</AntBtn>
                  </div>
                )}
                {!remOn && task.reminderLead && <button onClick={() => { onReminder(null); }} className="mt-2 text-xs text-slate-400 hover:text-red-500">{t.noReminder}</button>}
                <p className="text-xs text-slate-400 mt-2">{t.reminderOnServer}</p>
              </>
            )}
          </div>)}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">{t.description}</label>
            <AntInput.TextArea value={task.description} readOnly={ro} onChange={(e) => onPatch({ description: e.target.value })} rows={4} />
          </div>

          {serverMode && <div className="rounded-xl border border-slate-200 p-3.5"><TaskFiles t={t} lang={lang} task={task} canEdit={!ro} /></div>}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-1.5"><TagIcon size={15} />{t.tagsLabel}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">{task.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={tagStyle(tag)}>{tag}{!ro && <button onClick={() => onPatch({ tags: task.tags.filter((x) => x !== tag) })} className="hover:opacity-60"><X size={12} /></button>}</span>
            ))}</div>
            {!ro && <AntInput value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder={t.addTagPlaceholder} onPressEnter={addTag} />}
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: "#f8fafc" }}>
              <ListChecks size={16} className="text-orange-500" />
              <span className="text-sm font-semibold text-slate-700">{t.subtasks}</span>
              {task.subtasks.length > 0 && <span className="text-xs font-medium text-slate-500 ml-auto">{subDone}/{task.subtasks.length}</span>}
            </div>
            {task.subtasks.length > 0 && (
              <div className="px-3.5 pt-2.5">
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: (task.subtasks.length ? Math.round((subDone / task.subtasks.length) * 100) : 0) + "%", background: subDone === task.subtasks.length ? "#10b981" : "#f97316" }} /></div>
              </div>
            )}
            <div className="p-2">
              {task.subtasks.map((s) => (
                <div key={s.id} className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50">
                  <button onClick={() => !ro && toggleSub(s.id)} disabled={ro} className="shrink-0">{s.done ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-slate-300" />}</button>
                  <span className={`flex-1 text-sm ${s.done ? "line-through text-slate-400" : "text-slate-700"}`}>{s.title}</span>
                  {!ro && <button onClick={() => removeSub(s.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition shrink-0"><X size={15} /></button>}
                </div>
              ))}
              {task.subtasks.length === 0 && <p className="text-xs text-slate-400 px-2 py-1">{lang === "vi" ? "Chưa có việc con." : "No subtasks yet."}</p>}
              {!ro && <AntInput value={subInput} onChange={(e) => setSubInput(e.target.value)} placeholder={t.addSubtask} onPressEnter={addSub} style={{ marginTop: 4 }} />}
            </div>
          </div>

          {/* TIME TRACKING */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: "#f8fafc" }}>
              <Clock size={15} className="text-orange-500" /><span className="text-sm font-semibold text-slate-700">{t.timeTracking}</span>
            </div>
            <div className="p-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-500 flex items-center gap-1.5"><Plus size={13} />{t.createdAtLabel}</span><span className="text-slate-700">{task.createdAt ? new Date(task.createdAt).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500 flex items-center gap-1.5"><UserCheck size={13} />{t.assignedAt}</span><span className="text-slate-700">{task.assignedAt ? new Date(task.assignedAt).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500 flex items-center gap-1.5"><CheckCircle2 size={13} />{t.completedAt}</span><span style={{ color: task.completedAt ? "#10b981" : "#94a3b8" }}>{task.completedAt ? new Date(task.completedAt).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : t.notCompleted}</span></div>
            </div>
          </div>

          {/* COMMENTS */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1.5"><MessageSquare size={15} />{t.comments} {task.comments?.length > 0 && <span className="text-xs text-slate-400">{task.comments.length}</span>}</label>
            <div className="space-y-3 mb-3">
              {(!task.comments || task.comments.length === 0) && <p className="text-sm text-slate-400">{t.noComments}</p>}
              {task.comments?.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.author} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2"><span className="text-sm font-medium text-slate-700">{c.author}</span><span className="text-xs text-slate-400">{relTime(c.ts, lang)}</span></div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {me ? (
              <div className="flex gap-2 items-end">
                <Avatar name={me.name} size={28} />
                <AntInput value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t.writeComment} onPressEnter={send} />
                <AntBtn type="primary" icon={<Send size={16} />} disabled={!comment.trim()} onClick={send} />
              </div>
            ) : <p className="text-xs text-slate-400">{t.pickIdentity}</p>}
          </div>
        </div>
    </AntDrawer>
  );
}
function Field({ icon, label, children }) {
  return <div className="flex items-center gap-3"><span className="w-28 shrink-0 flex items-center gap-2 text-sm text-slate-500">{icon}{label}</span><div className="flex-1">{children}</div></div>;
}

/* ============================ IDENTITY MODAL ============================ */
function IdentityModal({ t, members, currentUserId, onPick, onCreate, onClose, closable, effRole }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const submit = () => { if (!name.trim()) return; if (!isEmail(email)) { setErr(t.emailRequired); return; } onCreate(name, email); };
  return (
    <AntModal open onCancel={() => closable && onClose()} closable={closable} maskClosable={closable} footer={null} width={400}
      title={<div><div className="text-base font-semibold">{t.whoAreYou}</div><div className="text-xs text-slate-500 font-normal mt-0.5">{t.pickIdentity}</div></div>}>
      <div className="space-y-1.5 mb-4 overflow-y-auto" style={{ maxHeight: 220 }}>
        {members.map((m) => (
          <button key={m.id} onClick={() => onPick(m.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition text-left ${currentUserId === m.id ? "border-orange-300 bg-orange-50" : "border-slate-200 hover:bg-slate-50"}`}>
            <Avatar name={m.name} size={32} />
            <div className="flex-1 min-w-0"><div className="text-sm font-medium text-slate-700 truncate">{m.name}</div><div className="text-xs text-slate-400 truncate">{m.email}</div></div>
            <RoleTag role={effRole(m)} t={t} />
          </button>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-4 space-y-2">
        <label className="text-xs font-medium text-slate-500 block">{t.orCreate}</label>
        <AntInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t.yourName} onPressEnter={submit} />
        <AntInput prefix={<Mail size={15} className="text-slate-400" />} value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder={t.emailPlaceholder} type="email" onPressEnter={submit} />
        {err && <p className="text-xs text-red-500">{err}</p>}
        <AntBtn type="primary" block icon={<UserPlus size={15} />} disabled={!name.trim() || !email.trim()} onClick={submit}>{t.join}</AntBtn>
      </div>
    </AntModal>
  );
}

/* ============================ MEMBERS MODAL ============================ */
function MembersModal({ t, members, meId, canManage, actorIsOwner, serverMode, features, effRole, onSetCap, onSetPosition, onAdd, onRemove, onResetPassword, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [dept, setDept] = useState("");
  const [caps, setCaps] = useState({ canAssign: false, canViewFinance: false, canViewHistory: false, canViewWorkload: false, canManageMembers: false, isLeader: false, isTeamlead: false, noReport: false });
  const [position, setPosition] = useState("staff");
  const [showAdv, setShowAdv] = useState(false);
  const CAP_KEYS = ["canAssign", "canViewFinance", "canViewHistory", "canViewWorkload", "canManageMembers", "isLeader", "isTeamlead", "noReport"];
  const OWNER_ONLY_CAPS = ["canManageMembers", "isLeader", "isTeamlead", "noReport"]; // only the owner may grant these
  const F = features || {};
  const visibleCaps = CAP_KEYS.filter((k) => !((k === "canViewFinance" && F.finance === false) || (k === "canViewWorkload" && F.workload === false) || (k === "canViewHistory" && F.history === false)));
  const CAP_ICON = { canAssign: Pencil, canViewFinance: Wallet, canViewHistory: History, canViewWorkload: Gauge, canManageMembers: UserPlus, isLeader: Crown, isTeamlead: UserCheck, noReport: Send };
  const CAP_COLOR = { canAssign: "#f97316", canViewFinance: "#0d9488", canViewHistory: "#d97706", canViewWorkload: "#0284c7", canManageMembers: "#db2777", isLeader: "#9333ea", isTeamlead: "#0891b2", noReport: "#64748b" };
  const canAdd = name.trim() && isEmail(email) && (!serverMode || pw.length >= 4);
  const doAdd = () => { if (!canAdd) return; const c = { ...caps }; if (!actorIsOwner) { delete c.canManageMembers; delete c.isLeader; delete c.isTeamlead; } onAdd(name, email, pw, { role: "member", dept, ...c }); setName(""); setEmail(""); setPw(""); setDept(""); setCaps({ canAssign: false, canViewFinance: false, canViewHistory: false, canViewWorkload: false, canManageMembers: false, isLeader: false, isTeamlead: false, noReport: false }); };
  const CapBox = ({ k, val, on, disabled }) => { const Icon = CAP_ICON[k]; return (
    <label className="flex items-center gap-1 text-xs cursor-pointer" title={t.capHints[k]} style={{ color: val ? CAP_COLOR[k] : "#94a3b8" }}>
      <input type="checkbox" checked={val} disabled={disabled} onChange={(e) => on(e.target.checked)} style={{ accentColor: CAP_COLOR[k] }} />
      <Icon size={13} />{t.caps[k]}
    </label>
  ); };
  const visible = members.filter((m) => actorIsOwner || effRole(m) !== "owner"); // hide owner from delegated managers
  const addCaps = visibleCaps.filter((k) => actorIsOwner || !OWNER_ONLY_CAPS.includes(k));
  return (
    <AntModal open onCancel={onClose} footer={null} width={720} styles={{ body: { padding: 0 } }}
      title={<span className="flex items-center gap-2"><Users size={20} className="text-orange-500" />{t.members}<span className="text-sm font-normal text-slate-400">({visible.length})</span></span>}>
        <div className="overflow-y-auto px-6 py-4 space-y-2.5" style={{ maxHeight: "56vh" }}>
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{t.baseMemberNote}</div>
          {visible.map((m) => {
            const er = effRole(m); const isOwner = er === "owner";
            return (
              <div key={m.id} className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1.5">{m.name} {!m.isLeader && <DeptTag dept={m.dept} t={t} />} {m.id === meId && <span className="text-xs text-orange-500 font-normal">({t.you})</span>}</div>
                    <div className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5"><Mail size={11} />{m.email || "—"}</div>
                  </div>
                  {isOwner ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RoleTag role="owner" t={t} />
                      {serverMode && m.id === meId && <button onClick={() => { const np = window.prompt(`${t.resetPwPrompt} ${m.name}:`); if (np) onResetPassword(m.id, np); }} className="p-1.5 text-slate-300 hover:text-orange-500 transition" title={t.resetPassword}><Lock size={15} /></button>}
                    </div>
                  ) : canManage ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {actorIsOwner && onSetPosition && <AntSelect size="small" value={m.position || (m.isTeamlead ? "teamlead" : "staff")} onChange={(v) => onSetPosition(m.id, v)} style={{ minWidth: 112 }} title={t.positionLabel} options={[{ value: "leader", label: t.posLeader }, { value: "deputy", label: t.posDeputy }, { value: "teamlead", label: t.posTeamlead }, { value: "staff", label: t.posStaff }]} />}
                      <AntSelect size="small" value={m.dept || ""} onChange={(v) => onSetCap(m.id, "dept", v)} style={{ minWidth: 112 }} title={t.deptLabel} options={[{ value: "", label: t.deptNone }, ...DEPTS.map((d) => ({ value: d, label: t.depts[d] }))]} />
                      {serverMode && <button onClick={() => { const np = window.prompt(`${t.resetPwPrompt} ${m.name}:`); if (np) onResetPassword(m.id, np); }} className="p-1.5 text-slate-300 hover:text-orange-500 transition" title={t.resetPassword}><Lock size={15} /></button>}
                      {m.id !== meId && <button onClick={() => onRemove(m.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition" title={t.removeMember}><Trash2 size={15} /></button>}
                    </div>
                  ) : <RoleTag role="member" t={t} />}
                </div>
                {!isOwner && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pl-1">
                    {visibleCaps.map((k) => (
                      <CapBox key={k} k={k} val={!!m[k]} disabled={!canManage || (OWNER_ONLY_CAPS.includes(k) && !actorIsOwner)} on={(v) => onSetCap(m.id, k, v)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {canManage && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 rounded-b-2xl">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-3"><UserPlus size={16} className="text-orange-500" />{t.addMember}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block"><span className="text-xs text-slate-500">{t.memberName}</span>
                <AntInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t.memberName} style={{ marginTop: 4 }} /></label>
              <label className="block"><span className="text-xs text-slate-500">{t.emailPlaceholder}</span>
                <AntInput prefix={<Mail size={15} className="text-slate-400" />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@congty.com" type="email" style={{ marginTop: 4 }} /></label>
              <label className="block"><span className="text-xs text-slate-500">{t.deptLabel}</span>
                <AntSelect value={dept} onChange={(v) => setDept(v)} style={{ width: "100%", marginTop: 4 }} options={[{ value: "", label: t.deptNone }, ...DEPTS.map((d) => ({ value: d, label: t.depts[d] }))]} /></label>
              {serverMode && <label className="block"><span className="text-xs text-slate-500">{t.setPassword}</span>
                <AntInput prefix={<Lock size={15} className="text-slate-400" />} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t.setPassword} style={{ marginTop: 4 }} /></label>}
            </div>
            <div className="mt-3">
              <span className="text-xs text-slate-500 block mb-1.5">{t.positionLabel}</span>
              <AntSelect value={position} onChange={(pos) => { setPosition(pos); if (pos !== "custom") setCaps({ ...BLANK_CAPS, ...(POSITION_PRESETS[pos] || {}) }); }} style={{ width: "100%" }}
                options={[...(actorIsOwner ? [{ value: "leader", label: t.posLeader }, { value: "deputy", label: t.posDeputy }, { value: "teamlead", label: t.posTeamlead }] : []), { value: "staff", label: t.posStaff }, { value: "custom", label: t.posCustom }]} />
              <button onClick={() => setShowAdv((x) => !x)} className="text-xs text-slate-400 hover:text-orange-600 mt-2">{t.advancedPerms} {showAdv ? "▴" : "▾"}</button>
              {showAdv && <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 mt-1.5">
                {addCaps.map((k) => <CapBox key={k} k={k} val={caps[k]} on={(v) => { setPosition("custom"); setCaps((c) => ({ ...c, [k]: v, position: "" })); }} />)}
              </div>}
            </div>
            <AntBtn type="primary" block onClick={doAdd} disabled={!canAdd} style={{ marginTop: 16 }}>{t.create}</AntBtn>
          </div>
        )}
    </AntModal>
  );
}

/* ============================ SETTINGS MODAL ============================ */
function SettingsModal({ t, lang, onLoad, onSave, onFeatures, onClose, membersCount, onOpenMembers, onOpenLicense }) {
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState("");
  const [feats, setFeats] = useState(FEATURE_ALL_ON);
  const setFeat = (k, v) => setFeats((pr) => ({ ...pr, [k]: v }));
  useEffect(() => { onLoad().then((d) => { setS(d || { appName: "", appUrl: "", backup: { email: "" }, smtp: {} }); setFeats({ ...FEATURE_ALL_ON, ...((d && d.features) || {}) }); }); }, []); // eslint-disable-line
  if (!s) return (
    <AntModal open onCancel={onClose} footer={null} width={480} title={t.settings}><div className="text-slate-400 text-sm py-6 text-center">…</div></AntModal>
  );
  const smtp = s.smtp || {}; const backup = s.backup || {};
  const setSmtp = (k, v) => setS((p) => ({ ...p, smtp: { ...(p.smtp || {}), [k]: v } }));
  const setBackup = (k, v) => setS((p) => ({ ...p, backup: { ...(p.backup || {}), [k]: v } }));
  const save = async () => { const ok = await onSave({ appName: s.appName, appUrl: s.appUrl, backup: { email: backup.email || "" }, smtp, features: feats }); if (ok && onFeatures) onFeatures(feats); setMsg(ok ? t.settingsSaved : t.setupFailed); };
  const Inp = ({ label, value, onChange, type = "text", ph = "" }) => (
    <label className="block"><span className="text-xs text-slate-500">{label}</span>
      <input value={value || ""} type={type} placeholder={ph} onChange={(e) => onChange(e.target.value)} className="w-full mt-0.5 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" /></label>
  );
  return (
    <AntModal open onCancel={onClose} width={480}
      title={<span className="flex items-center gap-2"><Settings size={19} className="text-orange-500" />{t.settings}</span>}
      footer={<AntBtn type="primary" onClick={save}>{t.save}</AntBtn>}>
      <p className="text-xs text-slate-500 mb-3">{t.settingsHint}</p>
      <div className="space-y-3" style={{ maxHeight: "64vh", overflowY: "auto" }}>
        {onOpenMembers && (
          <button onClick={onOpenMembers} className="w-full flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50 transition">
            <Users size={16} className="text-orange-500" />
            <span className="flex-1 text-sm font-medium text-slate-700">{t.manageMembers}</span>
            <span className="text-xs text-slate-400">{membersCount}</span>
            <ArrowRight size={16} className="text-slate-400" />
          </button>
        )}
        {onOpenLicense && (
          <button onClick={onOpenLicense} className="w-full flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50 transition">
            <Lock size={16} className="text-orange-500" />
            <span className="flex-1 text-sm font-medium text-slate-700">Gia hạn giấy phép</span>
            <ArrowRight size={16} className="text-slate-400" />
          </button>
        )}
        <div className="rounded-lg border border-orange-200 bg-orange-50/40 p-3 space-y-2.5">
          <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Sparkles size={15} className="text-orange-500" />{t.featuresTitle}</div>
          <p className="text-xs text-slate-500">{t.featuresHint}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500">{t.presetLabel}:</span>
            <AntBtn size="small" onClick={() => setFeats({ ...FEATURE_PRESETS.full })}>{t.presetFull}</AntBtn>
            <AntBtn size="small" onClick={() => setFeats({ ...FEATURE_PRESETS.task })}>{t.presetTask}</AntBtn>
            <AntBtn size="small" onClick={() => setFeats({ ...FEATURE_PRESETS.design })}>{t.presetDesign}</AntBtn>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
            {FEATURE_LIST.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <AntSwitch size="small" checked={feats[f.key] !== false} onChange={(v) => setFeat(f.key, v)} />
                <span className="flex-1">{lang === "vi" ? f.vi : f.en}</span>
              </label>
            ))}
          </div>
        </div>
        <Inp label={t.appNameLabel} value={s.appName} onChange={(v) => setS((p) => ({ ...p, appName: v }))} />
        <Inp label={t.appUrlLabel} value={s.appUrl} onChange={(v) => setS((p) => ({ ...p, appUrl: v }))} ph="http://192.168.1.x:3000" />
        {feats.notifications !== false && (<>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
          <div className="text-sm font-semibold text-amber-700 flex items-center gap-1.5"><Banknote size={15} />{t.backupSection}</div>
          <p className="text-xs text-amber-700/80">{t.backupNote}</p>
          <Inp label={t.backupEmailLabel} value={backup.email} type="email" onChange={(v) => setBackup("email", v)} ph="ten@congty.com" />
        </div>
        <div className="rounded-lg border border-slate-200 p-3 space-y-2">
          <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Mail size={15} />{t.smtpSection}</div>
          <p className="text-xs text-slate-400">{t.smtpHelp}</p>
          <div className="grid grid-cols-2 gap-2">
            <Inp label={t.smtpHost} value={smtp.host} onChange={(v) => setSmtp("host", v)} ph="smtp.gmail.com" />
            <Inp label={t.smtpPort} value={smtp.port} type="number" onChange={(v) => setSmtp("port", Number(v) || 587)} ph="587" />
          </div>
          <Inp label={t.smtpUser} value={smtp.user} onChange={(v) => setSmtp("user", v)} ph="no-reply@congty.com" />
          <Inp label={t.smtpPass} value={smtp.pass} type="password" onChange={(v) => setSmtp("pass", v)} />
          <Inp label={t.smtpFrom} value={smtp.from} onChange={(v) => setSmtp("from", v)} ph="Trạm Dự Án <no-reply@congty.com>" />
          <label className="flex items-center gap-2 text-sm text-slate-600"><AntCheckbox checked={!!smtp.secure} onChange={(e) => setSmtp("secure", e.target.checked)} />{t.smtpSecure}</label>
        </div>
        </>)}
      </div>
      {msg && <p className={`text-sm mt-2 ${msg === t.settingsSaved ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
    </AntModal>
  );
}

/* ============================ LICENSE MODAL ============================ */
function LicenseModal({ t, license, onActivate, onClose }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const exp = license && license.expiry ? new Date(license.expiry) : null;
  const submit = async () => {
    if (!code.trim()) return;
    setBusy(true); setMsg("");
    const r = await onActivate(code.trim());
    setBusy(false);
    if (r && r.ok) { setMsg("ok"); setTimeout(onClose, 1200); }
    else setMsg((r && r.body && r.body.message) || "Mã không hợp lệ.");
  };
  return (
    <AntModal open onCancel={onClose} footer={null} width={480}
      title={<span className="flex items-center gap-2"><Lock size={19} className="text-orange-500" />Gia hạn giấy phép</span>}>
      <p className="text-xs text-slate-500 mb-3">
        {license && license.readOnly
          ? "Giấy phép đã hết hạn, phần mềm đang ở chế độ chỉ đọc. "
          : (exp ? ("Giấy phép hiện có hiệu lực đến " + exp.toLocaleDateString("vi-VN") + ". ") : "")}
        Liên hệ tác giả để nhận mã gia hạn rồi dán vào ô dưới.
      </p>
      <AntInput.TextArea value={code} onChange={(e) => setCode(e.target.value)} rows={3} placeholder="Dán mã gia hạn (bắt đầu bằng TDA1...)" />
      {msg && <p className={`text-sm mt-2 ${msg === "ok" ? "text-green-600" : "text-red-500"}`}>{msg === "ok" ? "Đã gia hạn thành công!" : msg}</p>}
      <AntBtn type="primary" block size="large" loading={busy} disabled={!code.trim()} onClick={submit} style={{ marginTop: 12 }}>{busy ? "Đang kiểm tra..." : "Kích hoạt"}</AntBtn>
      <p className="text-xs text-slate-400 mt-3 text-center">{AUTHOR_CREDIT}</p>
    </AntModal>
  );
}

/* ============================ AUTH SCREEN (setup / login) ============================ */
function AuthScreen({ mode, t, lang, setLang, error, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const isSetup = mode === "setup";
  const ok = isSetup ? (name.trim() && isEmail(email) && password.length >= 8 && code.trim()) : (isEmail(email) && password);
  const submit = () => { if (!ok) return; isSetup ? onSubmit(name, email, password, code.trim()) : onSubmit(email, password); };
  return (
    <div className="h-screen w-full flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#fff7ed,#fdf2f8)" }}>
      <AntCard variant="borderless" style={{ width: "100%", maxWidth: 384, boxShadow: "0 12px 44px rgba(234,88,12,0.12)", borderRadius: 18 }} styles={{ body: { padding: 28 } }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}><Sparkles size={20} /></div>
          <div><div className="font-semibold text-slate-800">{t.appName}</div><div className="text-xs text-slate-400">{t.tagline}</div></div>
        </div>
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>{isSetup ? t.setupTitle : t.loginWelcome}</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 18 }}>{isSetup ? t.setupHint : t.ownerCreatesAccounts}</Typography.Paragraph>
        <div className="space-y-2.5">
          {isSetup && <AntInput size="large" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.yourName} onPressEnter={submit} />}
          <AntInput size="large" prefix={<Mail size={16} className="text-slate-400" />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} type="email" onPressEnter={submit} />
          <AntInput.Password size="large" prefix={<Lock size={16} className="text-slate-400" />} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSetup ? t.setPassword : t.passwordPlaceholder} onPressEnter={submit} />
          {isSetup && <AntInput size="large" prefix={<Lock size={16} className="text-slate-400" />} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onPressEnter={submit} placeholder={lang === "vi" ? "MÃ CÀI ĐẶT" : "SETUP CODE"} style={{ letterSpacing: 2 }} />}
          {isSetup && <p className="text-xs text-slate-400 -mt-1">{lang === "vi" ? "Xem mã trong cửa sổ máy chủ (Terminal / Log của container)." : "Find the code in the server console / container log."}</p>}
          {error && <AntAlert type="error" showIcon message={error} />}
          <AntBtn type="primary" size="large" block disabled={!ok} onClick={submit}>{isSetup ? t.createOwnerBtn : t.signIn}</AntBtn>
          <p className="text-xs text-slate-400 mt-4 text-center">{AUTHOR_CREDIT}</p>
        </div>
        <div className="flex items-center justify-center mt-5">
          <Segmented size="small" value={lang} onChange={(v) => setLang(v)} options={[{ label: "Tiếng Việt", value: "vi" }, { label: "English", value: "en" }]} />
        </div>
      </AntCard>
    </div>
  );
}

/* ============================ PROFILE MODAL ============================ */
function ProfileModal({ t, me, myRole, onChangePassword, onLogout, onClose }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const submit = async () => {
    if (!oldPw || newPw.length < 4) return;
    const ok = await onChangePassword(oldPw, newPw);
    if (ok) { setMsg(t.pwChanged); setOldPw(""); setNewPw(""); } else setMsg(t.pwWrong);
  };
  return (
    <AntModal open onCancel={onClose} footer={null} width={400}
      title={<span className="flex items-center gap-2"><UserCheck size={18} className="text-orange-500" />{t.profile}</span>}>
      <div className="flex items-center gap-3 mb-5">
        <Avatar name={me?.name} size={44} />
        <div className="min-w-0"><div className="text-sm font-semibold text-slate-700 truncate">{me?.name}</div><div className="text-xs text-slate-400 truncate">{me?.email}</div><RoleTag role={myRole} t={t} /></div>
      </div>
      <label className="text-xs font-medium text-slate-500 block mb-2">{t.changePassword}</label>
      <div className="space-y-2">
        <AntInput.Password value={oldPw} onChange={(e) => { setOldPw(e.target.value); setMsg(""); }} placeholder={t.oldPassword} />
        <AntInput.Password value={newPw} onChange={(e) => { setNewPw(e.target.value); setMsg(""); }} placeholder={t.newPassword} onPressEnter={submit} />
        {msg && <p className={`text-xs ${msg === t.pwChanged ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
        <AntBtn type="primary" block disabled={!oldPw || newPw.length < 4} onClick={submit}>{t.save}</AntBtn>
      </div>
      <AntBtn danger block icon={<LogOut size={15} />} onClick={onLogout} style={{ marginTop: 16 }}>{t.logout}</AntBtn>
    </AntModal>
  );
}

/* ============================ CONNECT MODAL ============================ */
function ConnectModal({ t, members, storageOK, onClose }) {
  return (
    <AntModal open onCancel={onClose} width={560}
      title={<span className="flex items-center gap-2"><Share2 size={19} className="text-orange-500" />{t.collaborate}</span>}
      footer={<AntBtn type="primary" onClick={onClose}>{t.close}</AntBtn>}>
      <p className="text-sm text-slate-500 mb-4">{members.length} {t.activeMembers}{!storageOK && " · " + t.offline}</p>
      <h4 className="font-semibold text-sm mb-2">{t.howToConnect}</h4>
      <ol className="space-y-2.5 mb-4">
        {t.connectSteps.map((sp, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-slate-600"><span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center">{i + 1}</span><span>{sp}</span></li>
        ))}
      </ol>
      <div className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 flex gap-2"><AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" /><span>{t.connectNote}</span></div>
    </AntModal>
  );
}

/* ============================ NEW PROJECT ============================ */
function NewProjectModal({ t, projects, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("");
  const submit = () => { if (name.trim()) onCreate(name, template); };
  return (
    <AntModal open onCancel={onClose} width={400} title={t.newProject}
      footer={<><AntBtn onClick={onClose}>{t.cancel}</AntBtn><AntBtn type="primary" disabled={!name.trim()} onClick={submit}>{t.create}</AntBtn></>}>
      <AntInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t.projectName} onPressEnter={() => name.trim() && submit()} />
      {projects && projects.length > 0 && (
        <div className="mt-3">
          <label className="text-xs font-medium text-slate-500 block mb-1">{t.useTemplate}</label>
          <AntSelect value={template} onChange={(v) => setTemplate(v)} style={{ width: "100%" }} options={[{ value: "", label: t.templateNone }, ...projects.map((pp) => ({ value: pp.id, label: pp.name }))]} />
          {template && <p className="text-xs text-slate-400 mt-1.5">{t.templateHint}</p>}
        </div>
      )}
    </AntModal>
  );
}

function Empty({ t }) {
  return <div className="h-full flex items-center justify-center"><AntEmpty image={AntEmpty.PRESENTED_IMAGE_SIMPLE} description={<div><div className="text-slate-500 font-medium">{t.noTasks}</div><div className="text-xs text-slate-400 mt-0.5">{t.noTasksHint}</div></div>} /></div>;
}

function ExportModal({ t, projects, onDownload, onClose }) {
  const [fmt, setFmt] = useState("html");
  const Row = ({ label, color, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition text-left">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: (color || "#f97316") + "1a", color: color || "#f97316" }}><Download size={16} /></span>
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">{label}</span>
      <span className="text-xs text-slate-400">{fmt === "csv" ? "CSV" : "HTML"}</span>
    </button>
  );
  return (
    <AntModal open onCancel={onClose} footer={null} width={400}
      title={<span className="flex items-center gap-2"><Download size={19} className="text-orange-500" />{t.download}</span>}>
      <p className="text-xs text-slate-500 mb-3">{t.downloadReport}</p>
      <Segmented value={fmt} onChange={setFmt} block style={{ marginBottom: 12 }} options={[{ label: "HTML (báo cáo)", value: "html" }, { label: "Excel (.csv)", value: "csv" }]} />
      <div className="space-y-2" style={{ maxHeight: "56vh", overflowY: "auto" }}>
        <Row label={t.downloadAll} color="#ea580c" onClick={() => onDownload("", fmt)} />
        {projects.map((pp) => <Row key={pp.id} label={pp.name} color={pp.color} onClick={() => onDownload(pp.id, fmt)} />)}
      </div>
    </AntModal>
  );
}
