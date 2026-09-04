/* Trạm Dự Án — phần mềm quản lý thi công cho công ty xây dựng
   Copyright (C) 2026 Khuong Doan <https://khuongdoan.com/>
   SPDX-License-Identifier: AGPL-3.0-or-later

   Phần mềm tự do theo GNU AGPL v3 trở lên. Kèm điều khoản bổ sung theo mục 7(b):
   dòng ghi danh tác giả PHẢI được giữ ở chân thanh bên, banner máy chủ, /api/config
   và chân biểu mẫu in. Xóa ghi danh là mất quyền sử dụng (mục 8).
   Điều khoản bổ sung: DIEU-KHOAN-BO-SUNG.txt · Toàn văn giấy phép: LICENSE.txt
   Giải thích tiếng Việt: docs/Giay-phep-tieng-Viet.md */

import { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, App as AntApp, Button as AntBtn, Input as AntInput, Card as AntCard, Alert as AntAlert, Segmented, Typography, Select as AntSelect, Checkbox as AntCheckbox, Badge as AntBadge, Tag as AntTag, Tooltip as AntTooltip, Modal as AntModal, Drawer as AntDrawer, Tabs as AntTabs, Progress as AntProgress, Empty as AntEmpty, Slider as AntSlider, Switch as AntSwitch, Popover as AntPopover } from "antd";
import {
  Plus, Search, LayoutList, LayoutGrid, CalendarDays, LayoutDashboard,
  X, Check, Trash2, Flag, Clock, Tag as TagIcon, Folder, Globe,
  ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertTriangle,
  CircleDot, Filter, Inbox, Sparkles, Users, MessageSquare, Send,
  Crown, Pencil, RefreshCw, UserPlus, Lock, LogOut, Share2, Mic, Camera, ClipboardCheck,
  History, ScrollText, Mail, Bell, Star, UserCheck, Percent,
  Wallet, Banknote, TrendingUp, TrendingDown, Receipt, Settings,
  Gauge, Download, Network, CalendarRange, ArrowRight, ListChecks,
} from "lucide-react";

/* ----------------------------- i18n ----------------------------- */
const T = {
  vi: {
    __ma: "vi",
    srcLink: "Mã nguồn (AGPL-3.0)",
    e_bad_code: "Mã cài đặt không đúng.",
    e_bad_type: "Loại tệp này không được phép tải lên (nguy cơ bảo mật).",
    e_bad_value: "Dữ liệu không hợp lệ.",
    e_bad_key: "Khóa dữ liệu không hợp lệ.",
    e_already_setup: "Hệ thống đã có tài khoản Chủ sở hữu.",
    e_conflict: "Người khác vừa lưu thay đổi. Hãy tải lại và thao tác lại.",
    e_email_exists: "Email này đã được dùng.",
    e_forbidden: "Bạn không có quyền làm việc này.",
    e_forbidden_change: "Bạn không có quyền đổi mục này.",
    e_log_exists: "Ngày này đã có nhật ký thi công.",
    e_missing: "Còn thiếu thông tin bắt buộc.",
    e_need_owner: "Việc này cần quyền Chủ sở hữu.",
    e_no_task: "Công việc không tồn tại.",
    e_not_found: "Không tìm thấy mục này.",
    e_notfound: "Không tìm thấy mục này.",
    e_owner_only: "Chỉ Chủ sở hữu mới làm được việc này.",
    e_period_locked: "Kỳ nghiệm thu đã khóa, không sửa được.",
    e_scope_merge_failed: "Máy chủ không ghép được dữ liệu theo phạm vi dự án. Vui lòng báo quản trị.",
    e_server_error: "Máy chủ gặp lỗi khi xử lý yêu cầu này.",
    e_too_large: "Tệp hoặc dữ liệu gửi lên quá lớn.",
    e_unauthorized: "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.",
    e_weak_password: "Mật khẩu phải dài ít nhất 8 ký tự, có cả chữ và số.",
    e_write_failed: "Máy chủ không ghi được dữ liệu.",
    appName: "Trạm Dự Án", tagline: "Quản lý công việc",
    myWork: "Việc của tôi", dashboard: "Tổng quan", projects: "Dự án",
    newProject: "Dự án mới", projectName: "Tên dự án", create: "Tạo",
    cancel: "Hủy", addTask: "Thêm việc", searchPlaceholder: "Tìm việc...",
    list: "Danh sách", board: "Bảng", calendar: "Lịch",
    noTasks: "Chưa có việc nào ở đây.", noTasksHint: "Nhấn “Thêm việc” để bắt đầu.",
    addSection: "Thêm giai đoạn", sectionName: "Tên giai đoạn",
    groupBy: "Nhóm theo", groupStatus: "Trạng thái", groupSection: "Giai đoạn",
    takePhoto: "Chụp ảnh", pickPhoto: "Chọn ảnh có sẵn", compressing: "Đang thu nhỏ ảnh…",
    defects: "Lỗi tồn đọng", defectAdd: "Ghi nhận lỗi", defectNone: "Chưa có lỗi tồn đọng nào.",
    recAcceptType: "Nghiệm thu nội bộ",
    recTrash: "Thùng rác hồ sơ", close: "Đóng",
    recTrashHint: "Biên bản và nhật ký đã xóa được giữ 90 ngày rồi mới xóa hẳn. Khôi phục lại trong thời gian đó.",
    deletedBy: "Người xóa", purgeIn: "còn {n} ngày trước khi xóa hẳn",
    purgeConfirm: "Xóa VĨNH VIỄN hồ sơ này cùng toàn bộ tệp/ảnh kèm theo? Không lấy lại được.", recSafetyType: "An toàn đầu giờ", recPermitType: "Giấy phép làm việc",
    hseTab: "An toàn (HSE)",
    hseDaysSafe: "Ngày không tai nạn", hseLastIncident: "Sự cố gần nhất:", hseNoIncidentYet: "Chưa ghi nhận sự cố nào",
    hseIncidents: "Số sự cố đã ghi", hseToolbox: "Họp an toàn đầu giờ", hseThisWeek: "trong 7 ngày qua",
    hsePermits: "Giấy phép làm việc",
    hseIncidentLog: "Sổ sự cố / mất an toàn", hseNoIncident: "Chưa có sự cố nào được ghi trong nhật ký thi công.",
    hseChecks: "Biên bản an toàn & giấy phép", hseNoChecks: "Chưa lập biên bản an toàn nào.",
    hseHint: "Sự cố lấy từ mục “Sự cố / mất an toàn” của nhật ký thi công. Họp an toàn đầu giờ và giấy phép làm việc lập ở tab Biên bản, chọn loại tương ứng rồi dùng mẫu bảng kiểm có sẵn.",
    lagDays: "ngày trễ",
    projMembers: "Thành viên dự án",
    finTabCost: "Chi phí thực tế",
    mergeOk: "Có người khác vừa lưu — thay đổi của bạn đã được gộp vào bản mới, không mất gì.",
    mergeConflict: "Đã gộp xong, nhưng {n} mục bị người khác sửa cùng lúc nên giữ bản của họ: {ten}. Hãy kiểm tra lại các mục này.",
    mergeFallback: "Có người khác vừa cập nhật — đã tải lại dữ liệu mới, vui lòng kiểm tra lại thao tác vừa rồi.",
    payReq: "Đề nghị thanh toán", payReqNo: "Số đề nghị",
    payPeriodValue: "Giá trị thực hiện trong kỳ (chưa VAT)",
    payRetention: "Giữ lại bảo hành", payAdvance: "Khấu trừ tạm ứng", payVAT: "Thuế VAT",
    payBeforeVAT: "Cộng trước thuế", payTotal: "SỐ TIỀN ĐỀ NGHỊ THANH TOÁN",
    payHint: "Giá trị kỳ lấy thẳng từ cột “Kỳ này” của bảng BOQ ở trên — không phải nhập lại tay.",
    voAdd: "Thêm phát sinh (VO)", voToggle: "Chuyển thành dòng phát sinh / dòng gốc",
    voPending: "{n} dòng phát sinh chưa được duyệt, tổng",
    voPendingHint: "chưa cộng vào giá trị hợp đồng cho tới khi Chủ đầu tư duyệt.",
    periodLock: "Khóa kỳ", periodLocked: "Kỳ đã khóa", periodUnlock: "Mở khóa kỳ",
    periodLockedHint: "Kỳ này đã nộp Chủ đầu tư và được khóa — số liệu chỉ xem, muốn sửa phải mở khóa (có ghi lý do).",
    periodUnlockWarn: "Mở khóa một kỳ đã nộp sẽ cho phép sửa số liệu thanh toán. Việc này được ghi vào nhật ký kiểm toán.",
    periodUnlockReason: "Lý do mở khóa…",
    costPickProject: "Chọn một dự án ở trên để xem ngân sách và chi phí.",
    costRevenue: "Doanh thu đã nghiệm thu", costBudget: "Ngân sách", costCommitted: "Đã cam kết (thầu phụ)",
    costActual: "Chi phí thực tế", costGross: "Lãi gộp tạm tính", costLeft: "Còn lại",
    costGroup: "Nhóm chi phí", costLedger: "Sổ chi phí thực tế", costAdd: "Ghi một khoản chi",
    costNone: "Chưa ghi khoản chi nào cho dự án này.",
    costSupplier: "Nhà cung cấp / thầu phụ", costDoc: "Chứng từ", costAmount: "Số tiền",
    costHint: "Doanh thu lấy từ khối lượng đã nghiệm thu trong BOQ; lãi gộp = doanh thu − chi phí thực tế. Cam kết là tổng giá trị hợp đồng thầu phụ đã ký của dự án.",
    finReadOnly: "Bạn chỉ có quyền XEM số liệu tài chính.",
    projMembersLocked: "Dự án đã giới hạn thành viên",
    projMembersOpen: "Mở cho cả công ty",
    projMembersHintOpen: "Đang MỞ: mọi người trong công ty đều xem được dự án này. Chọn người bên dưới để giới hạn lại.",
    projMembersHintLocked: "Chỉ những người được tích mới xem được dự án, công việc, tệp và hồ sơ của dự án này.",
    projMembersNote: "Chủ sở hữu và Lãnh đạo luôn xem được mọi dự án.",
    people: "người", hours: "giờ", qty: "SL", unit: "ĐVT",
    temp: "Nhiệt độ", rainHours: "Giờ mưa", stopHours: "Giờ ngừng việc",
    manpowerTable: "Nhân lực theo tổ đội / nghề", crewName: "Tổ đội / nghề", addCrew: "Thêm tổ đội",
    equipTable: "Máy móc – thiết bị", equipName: "Loại máy", addEquip: "Thêm máy",
    qtyTable: "Khối lượng thi công trong ngày", qtyItem: "Hạng mục", qtyToday: "KL hôm nay",
    addQty: "Thêm dòng khối lượng", pickBoq: "— Lấy từ hạng mục BOQ —",
    qtyHint: "Khối lượng nhập ở đây là số, nên cộng dồn được theo hạng mục khi lập kỳ nghiệm thu.",
    incident: "Có sự cố / mất an toàn trong ngày", incLow: "Nhẹ", incMed: "Trung bình", incHigh: "Nghiêm trọng",
    incWhat: "Diễn biến sự cố", incFix: "Biện pháp khắc phục đã làm", incWho: "Người liên quan",
    supervisorNote: "Ý kiến TVGS / Chủ đầu tư", supervisorNoteHint: "Ghi lại chỉ đạo tại hiện trường trong ngày…",
    siteStatus: "Trạng thái", siteDraft: "Nháp", siteSubmitted: "Đã nộp", siteApproved: "Chỉ huy trưởng đã duyệt",
    siteLockedHint: "Đã duyệt — khóa sửa", saveDraft: "Lưu nháp", submitLog: "Nộp nhật ký",
    approveLog: "Duyệt nhật ký", unlockLog: "Mở khóa để sửa",
    depTypeHint: "FS: xong việc trước mới bắt đầu · SS: cùng bắt đầu · FF: cùng kết thúc · SF: hiếm dùng. Số ngày trễ dương = chờ thêm, âm = làm chồng lấn.",
    zoomDay: "Ngày", zoomWeek: "Tuần", zoomMonth: "Tháng",
    workCalendar: "Lịch làm việc", weeklyOff: "Ngày nghỉ hằng tuần", holidays: "Ngày lễ / ngày nghỉ riêng", add: "Thêm",
    workCalendarHint: "Đường găng và dự trữ được tính theo ngày thi công thật, bỏ qua các ngày nghỉ ở trên.",
    chkTemplate: "Mẫu bảng kiểm", chkPickTemplate: "— Chọn mẫu công tác —",
    chkPass: "Đạt", chkFail: "Không đạt", chkNotePh: "Mô tả chỗ không đạt…",
    chkAddItem: "Thêm mục kiểm tra", chkResult: "Kết quả nghiệm thu",
    chkPassAll: "ĐẠT — tất cả các mục", chkFailN: "KHÔNG ĐẠT — {n} mục", chkPending: "Còn {n} mục chưa chấm",
    chkWillCreateDefects: "sẽ tự tạo {n} lỗi tồn đọng khi lưu",
    chkDefectsMade: "Đã tạo {n} lỗi tồn đọng từ các mục không đạt.",
    trashReason: "Lý do xóa (ghi vào nhật ký)", trashKept90: "Hồ sơ được giữ trong thùng rác 90 ngày trước khi xóa hẳn.",
    defectArea: "Vị trí", defectAreaHint: "VD: Tầng 3 – trục C2 – phòng ngủ",
    defectDesc: "Mô tả lỗi", defectDescHint: "VD: Tường bị rỗ, lộ cốt liệu",
    defectSeverity: "Mức độ", defectSev: { high: "Nặng", med: "Trung bình", low: "Nhẹ" },
    defectContractor: "Nhà thầu chịu trách nhiệm", defectDue: "Hạn khắc phục",
    defectOpen: "Đang mở", defectFixed: "Đã sửa – chờ xác nhận", defectVerified: "Đã xác nhận đóng", defectOverdue: "Quá hạn khắc phục",
    defectAllAreas: "Mọi vị trí", defectAllContractors: "Mọi nhà thầu", defectAllStates: "Mọi trạng thái",
    defectFlowHint: "Vòng đời: Cần làm = đang mở · Chờ phê duyệt = nhà thầu báo đã sửa · Hoàn thành = QC đã xác nhận đóng. Mở một dòng để giao người, đính ảnh trước/sau và bình luận.",
    photoBefore: "Ảnh trước khắc phục", photoAfter: "Ảnh sau khắc phục",
    micHint: "Bấm rồi nói — máy tự ghi thành chữ",
    noSection: "Chưa xếp giai đoạn",
    groupPctHint: "% hoàn thành của giai đoạn, tính theo trọng số thời lượng từng việc",
    milestone: "Mốc", milestoneHint: "Việc thời lượng 0 ngày — mốc bàn giao/nghiệm thu",
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
    caps: { canAssign: "Giao việc", canViewFinance: "Chi phí", canEditFinance: "Sửa chi phí", canViewHistory: "Lịch sử", canViewWorkload: "Khối lượng", canManageMembers: "Tạo tài khoản", isLeader: "Lãnh đạo", isTeamlead: "Teamlead", noReport: "Miễn báo cáo" },
    capHints: {
      canAssign: "Giao việc: tạo/sửa công việc, giao người, đặt nhắc việc, quản lý cột & dự án.",
      canViewFinance: "Chi phí: XEM mục Chi phí (hợp đồng, BOQ, thanh toán, dòng tiền).",
      canEditFinance: "Sửa chi phí: được nhập/sửa số liệu. Bỏ tích để Kế toán hoặc Lãnh đạo CHỈ XEM, không sửa được.",
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
    timeline: "Dòng thời gian", ganttHint: "Kéo thanh để dời lịch; kéo MÉP trái/phải để đổi ngày bắt đầu / hạn chót. Đường nối thể hiện phụ thuộc.",
    dlgConfirm: "Xác nhận", dlgContinue: "Vẫn tiếp tục", dlgResetPwTitle: "Đặt lại mật khẩu cho",
    dlgNewPw: "Mật khẩu mới (tối thiểu 8 ký tự, có chữ và số)", dlgSave: "Lưu",
    taskKind: "Công việc", restoreNoProject: "Dự án của việc này không còn — hãy khôi phục dự án trước.",
    builtinTemplates: "Mẫu có sẵn (xây dựng)", copyFromProject: "Sao chép từ dự án",
    baselineSave: "Lưu kế hoạch gốc", baselineUpdate: "Cập nhật kế hoạch gốc", baselineLabel: "Kế hoạch gốc",
    baselineConfirm: "Ghi đè kế hoạch gốc đã lưu? Mốc so sánh trễ/sớm sẽ tính theo lịch hiện tại.",
    baselineSaved: "Đã lưu kế hoạch gốc.", baselineLate: "trễ", baselineEarly: "sớm", baselineDays: "ngày so với kế hoạch gốc",
    sCurveTitle: "Đường cong S — % giá trị", sPlanned: "Kế hoạch (theo hạn công việc liên kết)", sActual: "Thực hiện (theo kỳ nghiệm thu)",
    rejectBtn: "Trả về", rejectReason: "Lý do trả về (bắt buộc)...", rejectSend: "Trả về làm lại",
    criticalPath: "Đường găng", criticalBadge: "Găng", normalTask: "Việc thường", depLine: "Phụ thuộc",
    criticalTip: "ĐƯỜNG GĂNG — việc này trễ ngày nào, cả dự án trễ ngày đó", slackDays: "Dự trữ", daysUnit: "ngày",
    depViolation: "Bắt đầu trước khi việc phụ thuộc hoàn thành — kiểm tra lại lịch!",
    undatedHint: "việc chưa đặt ngày (không hiển thị trên sơ đồ)", ganttFiltered: "đang lọc — đường găng vẫn tính trên toàn dự án", cycleWarn: "Phụ thuộc vòng tròn — không tính được đường găng.",
    noTimelineData: "Chưa có công việc nào có ngày để vẽ. Hãy đặt Ngày bắt đầu và Hạn chót.",
    startDate: "Ngày bắt đầu", plannedDays: "Tiến độ dự kiến (ngày)", today2: "Hôm nay", statuses: { todo: "Cần làm", doing: "Đang làm", review: "Chờ phê duyệt", onhold: "On hold / Blocked", done: "Hoàn thành" }, statusLabel: "Trạng thái", approver: "Người phê duyệt", byLeader: "Lãnh đạo phê duyệt", byTeamlead: "Teamlead phê duyệt", approveBtn: "Phê duyệt", dailyReport: "Báo cáo ngày", todayReport: "Báo cáo hôm nay", myReports: "Của tôi", reportTracking: "Theo dõi nộp", submitReport: "Gửi báo cáo", reportSubmitted: "Đã gửi", reportMissing: "Chưa gửi", reportAddLine: "Thêm dòng", reportWhatDone: "Đã làm gì", reportPct: "% phần mình", reportIssue: "Vướng mắc / đề xuất", reportOf: "Báo cáo của", reportNone: "Chưa có báo cáo.", reportDeadlineNote: "Hạn nộp: trong 48 giờ kể từ 17:30 của ngày báo cáo.", reportSel: "Chọn công tác...", reportComment: "Bình luận báo cáo...", constructionSite: "Nhật ký thi công", siteTab: "Nhật ký", recordsTab: "Biên bản", addSiteLog: "Thêm nhật ký", siteDate: "Ngày", siteWeather: "Thời tiết", siteAM: "Sáng", sitePM: "Chiều", wSun: "Nắng", wRain: "Mưa", siteManpower: "Nhân lực", siteWork: "Hạng mục + khối lượng", siteEquip: "Thiết bị & vật tư", siteIssues: "Vướng mắc ảnh hưởng tiến độ", siteNext: "Kế hoạch ngày tiếp theo", sitePhotos: "Ảnh hiện trường", siteNoLogs: "Chưa có nhật ký.", siteAssign: "Chỉ định người lập", siteSave: "Lưu nhật ký", siteRequired: "Cần điền Hạng mục và ít nhất 1 ảnh.", sitePhotoFail: "Nhật ký đã lưu nhưng {n} ảnh KHÔNG tải lên được — mở lại nhật ký để thêm ảnh.", positionLabel: "Chức vụ", featuresTitle: "Tính năng", featuresHint: "Bật/tắt nhóm tính năng cho công ty này; tắt sẽ ẩn khỏi mọi người dùng.", presetLabel: "Cấu hình nhanh", presetFull: "Đầy đủ", presetTask: "Chỉ công việc", presetDesign: "Thiết kế", trashTitle: "Thùng rác", trashEmpty: "Thùng rác trống.", restore: "Khôi phục", deleteForever: "Xóa vĩnh viễn", movedToTrash: "Đã chuyển vào thùng rác", undo: "Hoàn tác", trashHint: "Dự án đã xóa được giữ ở đây; chỉ Chủ sở hữu mới xóa vĩnh viễn.", searchAll: "Tìm kiếm", searchAllPlaceholder: "Tìm công việc trong mọi dự án...", resultsFound: "kết quả", noResults: "Không tìm thấy công việc nào.", attachments: "Tệp đính kèm", posLeader: "Lãnh đạo", posStaff: "Nhân viên", posTeamlead: "Teamlead (trưởng bộ phận)", posDeputy: "Phó giám đốc", posCustom: "Tùy chỉnh", advancedPerms: "Tùy chỉnh nâng cao", recur: "Lặp lại", recurNone: "Không lặp", recurWeekly: "Hàng tuần", recurMonthly: "Hàng tháng",
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
    boqExportKy: "Xuất CSV kỳ này", boqExportKyTip: "Bảng nghiệm thu khối lượng của kỳ đang chọn — nộp CĐT hoặc nhập sang CostManager",
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
    unsaved: "CHƯA LƯU — mất kết nối", unsavedRetry: "Đang thử gửi lại...",
    unsavedWarn: "Có thay đổi chưa lưu do mất kết nối. Giữ trang này mở cho tới khi lưu được.",
    unsavedGone: "Thay đổi ngoại tuyến đã bị bỏ vì trên máy chủ có bản mới hơn. Vui lòng kiểm tra và nhập lại.",
    savedBack: "Đã kết nối lại — thay đổi của bạn đã được lưu.",
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
      task_reject: "đã trả về việc", baseline_save: "đã lưu kế hoạch gốc cho", trash_purge: "đã xóa vĩnh viễn", project_members: "đã đổi thành viên dự án",
      task_assign: "đã giao việc", task_workdone: "đã cập nhật hoàn thành", task_reminder: "đã đặt nhắc việc cho",
    },
    emptyVal: "(trống)",
    loading: "Đang tải…",
    histApp: "Lịch sử ứng dụng",
    histServer: "Nhật ký máy chủ",
    histServerHint: "Do máy chủ tự ghi — không sửa/xóa được từ ứng dụng.",
    histServerHead: "500 vết gần nhất",
    auditNoServer: "Chỉ có khi chạy chế độ máy chủ (LAN/NAS), và chỉ Chủ sở hữu / Lãnh đạo xem được.",
    auditEntity: { project: "dự án", task: "công việc", boq: "khối lượng (BOQ)", contract: "hợp đồng", report: "báo cáo", trash: "thùng rác" },
    auditField: { "tạo mới": "đã tạo", "xóa": "đã xóa", "xóa vĩnh viễn": "đã xóa vĩnh viễn", workdone: "sửa % hoàn thành", dueDate: "sửa hạn chót", startDate: "sửa ngày bắt đầu", duration: "sửa thời lượng", status: "đổi trạng thái", title: "đổi tên", priority: "đổi ưu tiên", assignees: "đổi người làm", section: "chuyển hạng mục", donGia: "sửa đơn giá", khoiLuong: "sửa khối lượng hợp đồng", khoiLuongKy: "sửa khối lượng kỳ nghiệm thu", giaTri: "sửa giá trị hợp đồng" },
  },
  en: {
    __ma: "en",
    srcLink: "Source code (AGPL-3.0)",
    e_bad_code: "Wrong setup code.",
    e_bad_type: "This file type is not allowed (security risk).",
    e_bad_value: "Invalid data.",
    e_bad_key: "Invalid data key.",
    e_already_setup: "An Owner account already exists.",
    e_conflict: "Someone else just saved a change. Reload and try again.",
    e_email_exists: "That email is already in use.",
    e_forbidden: "You are not allowed to do this.",
    e_forbidden_change: "You are not allowed to change this field.",
    e_log_exists: "A site log already exists for this date.",
    e_missing: "Some required information is missing.",
    e_need_owner: "This action requires the Owner account.",
    e_no_task: "That task no longer exists.",
    e_not_found: "Not found.",
    e_notfound: "Not found.",
    e_owner_only: "Only the Owner can do this.",
    e_period_locked: "This acceptance period is locked and cannot be edited.",
    e_scope_merge_failed: "The server could not merge data for your project scope. Please tell your administrator.",
    e_server_error: "The server hit an error handling this request.",
    e_too_large: "The file or data you sent is too large.",
    e_unauthorized: "Your session expired. Please sign in again.",
    e_weak_password: "Password must be at least 8 characters and contain both letters and digits.",
    e_write_failed: "The server could not save the data.",
    appName: "Project Hub", tagline: "Work management",
    myWork: "My Work", dashboard: "Dashboard", projects: "Projects",
    newProject: "New project", projectName: "Project name", create: "Create",
    cancel: "Cancel", addTask: "Add task", searchPlaceholder: "Search tasks...",
    list: "List", board: "Board", calendar: "Calendar",
    noTasks: "No tasks here yet.", noTasksHint: "Click “Add task” to begin.",
    addSection: "Add phase", sectionName: "Phase name",
    groupBy: "Group by", groupStatus: "Status", groupSection: "Phase",
    takePhoto: "Take photo", pickPhoto: "Choose photos", compressing: "Shrinking photos…",
    defects: "Punch list", defectAdd: "Log a defect", defectNone: "No open defects.",
    recAcceptType: "Internal acceptance check",
    recTrash: "Records trash", close: "Close",
    recTrashHint: "Deleted records and site logs are kept for 90 days before being purged. Restore them within that window.",
    deletedBy: "Deleted by", purgeIn: "{n} days left before purge",
    purgeConfirm: "Permanently delete this record and all its files/photos? This cannot be undone.", recSafetyType: "Toolbox talk", recPermitType: "Permit to work",
    hseTab: "Safety (HSE)",
    hseDaysSafe: "Days without incident", hseLastIncident: "Last incident:", hseNoIncidentYet: "No incident recorded yet",
    hseIncidents: "Incidents recorded", hseToolbox: "Toolbox talks", hseThisWeek: "in the last 7 days",
    hsePermits: "Permits to work",
    hseIncidentLog: "Incident / near-miss log", hseNoIncident: "No incident recorded in the site logs.",
    hseChecks: "Safety records & permits", hseNoChecks: "No safety record yet.",
    hseHint: "Incidents come from the site log's incident section. Toolbox talks and permits are created in the Records tab using the matching checklist template.",
    lagDays: "days lag",
    projMembers: "Project members",
    finTabCost: "Actual cost",
    mergeOk: "Someone else saved at the same time — your changes were merged in, nothing was lost.",
    mergeConflict: "Merged, but {n} item(s) were edited by someone else at the same time, so theirs were kept: {ten}. Please re-check those.",
    mergeFallback: "Someone else just updated — reloaded the latest data, please re-check your last action.",
    payReq: "Payment application", payReqNo: "Application no.",
    payPeriodValue: "Work done this period (excl. VAT)",
    payRetention: "Retention", payAdvance: "Advance recovery", payVAT: "VAT",
    payBeforeVAT: "Net before VAT", payTotal: "AMOUNT APPLIED FOR",
    payHint: "The period value comes straight from the \u201cThis period\u201d column of the BOQ above - no retyping.",
    voAdd: "Add variation (VO)", voToggle: "Toggle variation / original line",
    voPending: "{n} variation line(s) not yet approved, worth",
    voPendingHint: "not counted in the contract value until the client approves.",
    periodLock: "Lock period", periodLocked: "Period locked", periodUnlock: "Unlock period",
    periodLockedHint: "This period was submitted to the client and locked - figures are read-only; unlock (with a reason) to edit.",
    periodUnlockWarn: "Unlocking a submitted period allows payment figures to be changed. This is written to the audit log.",
    periodUnlockReason: "Reason for unlocking...",
    costPickProject: "Pick a project above to see its budget and costs.",
    costRevenue: "Certified revenue", costBudget: "Budget", costCommitted: "Committed (subcontracts)",
    costActual: "Actual cost", costGross: "Gross margin (indicative)", costLeft: "Remaining",
    costGroup: "Cost group", costLedger: "Actual cost ledger", costAdd: "Record a cost",
    costNone: "No costs recorded for this project yet.",
    costSupplier: "Supplier / subcontractor", costDoc: "Document", costAmount: "Amount",
    costHint: "Revenue comes from certified BOQ quantities; gross margin = revenue - actual cost. Committed is the total signed subcontract value for the project.",
    finReadOnly: "You have view-only access to financial figures.",
    projMembersLocked: "Project restricted to its members",
    projMembersOpen: "Open to everyone",
    projMembersHintOpen: "Currently OPEN: everyone in the company can see this project. Tick people below to restrict it.",
    projMembersHintLocked: "Only the people ticked can see this project's tasks, files and records.",
    projMembersNote: "Owner and Leaders can always see every project.",
    people: "people", hours: "h", qty: "Qty", unit: "Unit",
    temp: "Temperature", rainHours: "Rain hours", stopHours: "Work stopped (h)",
    manpowerTable: "Manpower by crew / trade", crewName: "Crew / trade", addCrew: "Add crew",
    equipTable: "Plant & equipment", equipName: "Equipment", addEquip: "Add equipment",
    qtyTable: "Quantities placed today", qtyItem: "Item", qtyToday: "Qty today",
    addQty: "Add quantity line", pickBoq: "— Pick from BOQ —",
    qtyHint: "These quantities are numbers, so they roll up per BOQ item when you draw up an acceptance period.",
    incident: "Incident / safety event today", incLow: "Minor", incMed: "Moderate", incHigh: "Serious",
    incWhat: "What happened", incFix: "Corrective action taken", incWho: "People involved",
    supervisorNote: "Supervisor / client remarks", supervisorNoteHint: "Instructions given on site today…",
    siteStatus: "Status", siteDraft: "Draft", siteSubmitted: "Submitted", siteApproved: "Approved by site manager",
    siteLockedHint: "Approved — locked", saveDraft: "Save draft", submitLog: "Submit log",
    approveLog: "Approve log", unlockLog: "Unlock for editing",
    depTypeHint: "FS: start after the predecessor finishes · SS: start together · FF: finish together · SF: rarely used. Positive lag waits; negative lag overlaps.",
    zoomDay: "Day", zoomWeek: "Week", zoomMonth: "Month",
    workCalendar: "Work calendar", weeklyOff: "Weekly days off", holidays: "Holidays / other days off", add: "Add",
    workCalendarHint: "Critical path and float are computed in real working days, skipping the days off above.",
    chkTemplate: "Checklist template", chkPickTemplate: "— Pick a work type —",
    chkPass: "Pass", chkFail: "Fail", chkNotePh: "Describe what failed…",
    chkAddItem: "Add check item", chkResult: "Acceptance result",
    chkPassAll: "PASS — all items", chkFailN: "FAIL — {n} item(s)", chkPending: "{n} item(s) not scored",
    chkWillCreateDefects: "will create {n} punch-list item(s) on save",
    chkDefectsMade: "Created {n} punch-list item(s) from the failed checks.",
    trashReason: "Reason for deletion (goes to the log)", trashKept90: "Records stay in the trash for 90 days before being purged.",
    defectArea: "Location", defectAreaHint: "e.g. L3 – grid C2 – bedroom",
    defectDesc: "Defect", defectDescHint: "e.g. Honeycombing, aggregate exposed",
    defectSeverity: "Severity", defectSev: { high: "High", med: "Medium", low: "Low" },
    defectContractor: "Responsible contractor", defectDue: "Rectify by",
    defectOpen: "Open", defectFixed: "Fixed – awaiting check", defectVerified: "Closed out", defectOverdue: "Past rectify date",
    defectAllAreas: "All locations", defectAllContractors: "All contractors", defectAllStates: "All states",
    defectFlowHint: "Lifecycle: To do = open · Pending approval = contractor reports fixed · Done = QC closed it out. Open a row to assign, attach before/after photos and comment.",
    photoBefore: "Before photos", photoAfter: "After photos",
    micHint: "Tap and speak — dictation to text",
    noSection: "No phase",
    groupPctHint: "Phase completion, weighted by each task's duration",
    milestone: "Milestone", milestoneHint: "Zero-duration task — a handover/acceptance milestone",
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
    caps: { canAssign: "Assign work", canViewFinance: "Costs", canEditFinance: "Edit costs", canViewHistory: "History", canViewWorkload: "Workload", canManageMembers: "Create accounts", isLeader: "Leader", isTeamlead: "Team lead", noReport: "No report" },
    capHints: {
      canAssign: "Assign work: create/edit tasks, assign people, reminders, manage columns & projects.",
      canViewFinance: "Costs: VIEW the Costs section (contracts, BOQ, payments, cashflow).",
      canEditFinance: "Edit costs: may enter and change figures. Untick for view-only access (accountants, leaders).",
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
    timeline: "Timeline", ganttHint: "Drag a bar to reschedule; drag its LEFT/RIGHT edge to change start / due date. Lines show dependencies.",
    dlgConfirm: "Confirm", dlgContinue: "Continue anyway", dlgResetPwTitle: "Reset password for",
    dlgNewPw: "New password (min 8 chars, letters + digits)", dlgSave: "Save",
    taskKind: "Task", restoreNoProject: "This task's project is gone — restore the project first.",
    builtinTemplates: "Built-in templates (construction)", copyFromProject: "Copy from a project",
    baselineSave: "Save baseline", baselineUpdate: "Update baseline", baselineLabel: "Baseline",
    baselineConfirm: "Overwrite the saved baseline? Late/early comparison will use the current schedule.",
    baselineSaved: "Baseline saved.", baselineLate: "late", baselineEarly: "early", baselineDays: "day(s) vs baseline",
    sCurveTitle: "S-curve — % of value", sPlanned: "Planned (by linked tasks' due dates)", sActual: "Executed (by acceptance periods)",
    rejectBtn: "Return", rejectReason: "Reason for returning (required)...", rejectSend: "Return for rework",
    criticalPath: "Critical path", criticalBadge: "Critical", normalTask: "Normal task", depLine: "Dependency",
    criticalTip: "CRITICAL PATH — any delay here delays the whole project", slackDays: "Slack", daysUnit: "days",
    depViolation: "Starts before its dependency finishes — check the schedule!",
    undatedHint: "task(s) without dates (hidden from chart)", ganttFiltered: "filtered view — critical path still computed on the whole project", cycleWarn: "Circular dependencies — cannot compute critical path.",
    noTimelineData: "No tasks with dates yet. Set Start date and Due date.",
    startDate: "Start date", plannedDays: "Planned duration (days)", today2: "Today", statuses: { todo: "To do", doing: "In progress", review: "Pending approval", onhold: "On hold / Blocked", done: "Done" }, statusLabel: "Status", approver: "Approver", byLeader: "Leader approves", byTeamlead: "Teamlead approves", approveBtn: "Approve", dailyReport: "Daily report", todayReport: "Today\u2019s report", myReports: "Mine", reportTracking: "Submission tracking", submitReport: "Submit report", reportSubmitted: "Submitted", reportMissing: "Not submitted", reportAddLine: "Add line", reportWhatDone: "What you did", reportPct: "My %", reportIssue: "Issues / suggestions", reportOf: "Report of", reportNone: "No report yet.", reportDeadlineNote: "Deadline: within 48h from 5:30 PM of the report day.", reportSel: "Select task...", reportComment: "Comment on report...", constructionSite: "Site log", siteTab: "Site log", recordsTab: "Records", addSiteLog: "Add log", siteDate: "Date", siteWeather: "Weather", siteAM: "AM", sitePM: "PM", wSun: "Sunny", wRain: "Rain", siteManpower: "Manpower", siteWork: "Work + quantity", siteEquip: "Equipment & materials", siteIssues: "Issues affecting progress", siteNext: "Next-day plan", sitePhotos: "Site photos", siteNoLogs: "No log yet.", siteAssign: "Assign loggers", siteSave: "Save log", siteRequired: "Fill Work and at least 1 photo.", sitePhotoFail: "Log saved but {n} photo(s) failed to upload — reopen the log to add them.", positionLabel: "Position", featuresTitle: "Features", featuresHint: "Enable/disable feature groups for this company; disabling hides them from everyone.", presetLabel: "Quick preset", presetFull: "Full", presetTask: "Tasks only", presetDesign: "Design", trashTitle: "Trash", trashEmpty: "Trash is empty.", restore: "Restore", deleteForever: "Delete forever", movedToTrash: "Moved to trash", undo: "Undo", trashHint: "Deleted projects are kept here; only the owner can delete forever.", searchAll: "Search", searchAllPlaceholder: "Search tasks across all projects...", resultsFound: "results", noResults: "No matching tasks.", attachments: "Attachments", posLeader: "Leader", posStaff: "Staff", posTeamlead: "Teamlead", posDeputy: "Deputy director", posCustom: "Custom", advancedPerms: "Advanced permissions", recur: "Repeat", recurNone: "No repeat", recurWeekly: "Weekly", recurMonthly: "Monthly",
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
    boqExportKy: "Export period CSV", boqExportKyTip: "Quantity acceptance sheet for the selected period — submit to investor or key into CostManager",
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
    unsaved: "NOT SAVED — no connection", unsavedRetry: "Retrying...",
    unsavedWarn: "Unsaved changes because the connection dropped. Keep this page open until they are saved.",
    unsavedGone: "Offline changes were dropped because the server has a newer version. Please check and re-enter.",
    savedBack: "Back online — your changes have been saved.",
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
      task_reject: "returned task", baseline_save: "saved baseline for", trash_purge: "permanently deleted", project_members: "changed project members",
      task_assign: "assigned", task_workdone: "updated progress on", task_reminder: "set a reminder for",
    },
    emptyVal: "(empty)",
    loading: "Loading…",
    histApp: "App history",
    histServer: "Server audit log",
    histServerHint: "Written by the server — cannot be edited or deleted from the app.",
    histServerHead: "latest 500 entries",
    auditNoServer: "Available only in server mode (LAN/NAS), and only to Owner / Leader.",
    auditEntity: { project: "project", task: "task", boq: "BOQ item", contract: "contract", report: "report", trash: "trash" },
    auditField: { "tạo mới": "created", "xóa": "deleted", "xóa vĩnh viễn": "purged", workdone: "changed progress", dueDate: "changed due date", startDate: "changed start date", duration: "changed duration", status: "changed status", title: "renamed", priority: "changed priority", assignees: "changed assignees", section: "moved section", donGia: "changed unit price", khoiLuong: "changed contract quantity", khoiLuongKy: "changed period quantity", giaTri: "changed contract value" },
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
  { key: "defects", vi: "Lỗi tồn đọng (punch list)", en: "Punch list / defects" },
  { key: "history", vi: "Lịch sử thay đổi", en: "Change history" },
  { key: "notifications", vi: "Nhắc nhở & Email", en: "Reminders & Email" },
  { key: "viewBoard", vi: "Xem dạng Bảng (Kanban)", en: "Board (Kanban) view" },
  { key: "viewCalendar", vi: "Xem dạng Lịch", en: "Calendar view" },
  { key: "viewTimeline", vi: "Xem dạng Timeline", en: "Timeline view" },
  { key: "fileByProject", vi: "Chỉ người trong dự án xem được tệp / biên bản / nhật ký", en: "Only project members can view files / records / logs" },
];
const FEATURE_ALL_ON = FEATURE_LIST.reduce((o, f) => { o[f.key] = true; return o; }, {});

/* ---- Bộ mẫu dự án xây dựng đóng gói sẵn (v3.11) ----
   Mỗi mẫu: các cột + danh sách công việc chuẩn ngành, task dạng [chỉ số cột, tiêu đề, ưu tiên?].
   Chọn trong hộp "Dự án mới" — tạo xong sửa thoải mái như dự án thường. */
const BUILTIN_TEMPLATES = [
  { id: "tpl:nha-pho", vi: "Thi công nhà phố", en: "Townhouse construction",
    sections: ["Chuẩn bị", "Phần móng", "Phần thân", "Hoàn thiện", "Điện nước (MEP)", "Nghiệm thu & bàn giao"],
    tasks: [
      [0, "Xin phép xây dựng / thông báo khởi công", "high"], [0, "Dọn dẹp mặt bằng, rào chắn, lán trại"], [0, "Định vị tim mốc, cao độ chuẩn", "high"], [0, "Ký hợp đồng điện nước thi công"],
      [1, "Ép cọc / khoan cọc nhồi", "high"], [1, "Đào đất hố móng, hầm tự hoại"], [1, "Bê tông lót, cốt thép móng"], [1, "Đổ bê tông móng, giằng móng", "high"], [1, "Xây bể tự hoại, lấp đất tôn nền"],
      [2, "Cốt thép, cốp pha, đổ cột tầng trệt"], [2, "Cốp pha, cốt thép, đổ sàn lầu 1", "high"], [2, "Cột + sàn các lầu tiếp theo"], [2, "Đổ sàn mái, chống thấm sàn mái", "high"], [2, "Xây tường bao che, tường ngăn"], [2, "Cầu thang bê tông + xây bậc"],
      [3, "Tô trát trong ngoài"], [3, "Cán nền, chống thấm WC, ban công", "high"], [3, "Ốp lát gạch nền, WC"], [3, "Trần thạch cao"], [3, "Sơn nước trong ngoài"], [3, "Lắp cửa chính, cửa sổ, cửa WC"], [3, "Lan can, tay vịn cầu thang"],
      [4, "Đi ống điện, nước âm tường âm sàn", "high"], [4, "Kéo dây điện, lắp tủ điện"], [4, "Lắp đặt thiết bị vệ sinh"], [4, "Lắp đèn, công tắc, ổ cắm"], [4, "Bồn nước, máy bơm, năng lượng mặt trời"],
      [5, "Vệ sinh công nghiệp toàn nhà"], [5, "Nghiệm thu khối lượng với chủ đầu tư", "high"], [5, "Hoàn công, bàn giao hồ sơ", "high"],
    ] },
  { id: "tpl:fitout", vi: "Fit-out văn phòng / nội thất", en: "Office fit-out / interior",
    sections: ["Khảo sát & thiết kế", "Tháo dỡ & xây sửa", "Trần – vách – sàn", "Điện – nước – ĐHKK", "Nội thất & hoàn thiện", "Nghiệm thu & bàn giao"],
    tasks: [
      [0, "Khảo sát hiện trạng, đo đạc", "high"], [0, "Chốt layout, phối cảnh với khách", "high"], [0, "Hồ sơ kỹ thuật thi công, bảng vật liệu"], [0, "Xin phép tòa nhà / đăng ký thi công"],
      [1, "Tháo dỡ hiện trạng, vận chuyển xà bần"], [1, "Xây / sửa tường ngăn theo layout"],
      [2, "Khung xương, thả trần thạch cao"], [2, "Vách thạch cao, vách kính", "high"], [2, "Sàn nâng / trải thảm / sàn gỗ"],
      [3, "Đi ống ĐHKK, ống gió", "high"], [3, "Điện động lực + chiếu sáng, tủ điện"], [3, "Mạng LAN, camera, access control"], [3, "PCCC: đầu báo, sprinkler (nếu có)", "high"],
      [4, "Sơn nước, giấy dán tường"], [4, "Sản xuất & lắp đồ gỗ cố định", "high"], [4, "Bàn ghế, đồ rời, cây xanh"], [4, "Logo, chữ ký hiệu, phim dán kính"],
      [5, "Vệ sinh công nghiệp"], [5, "Nghiệm thu với khách + tòa nhà", "high"], [5, "Bàn giao hồ sơ, bảo hành"],
    ] },
  { id: "tpl:thiet-ke", vi: "Thiết kế nhà (hồ sơ)", en: "House design (documents)",
    sections: ["Concept", "Hồ sơ cơ sở", "Hồ sơ kỹ thuật", "Xin phép", "Bàn giao"],
    tasks: [
      [0, "Nhận nhiệm vụ thiết kế, khảo sát khu đất", "high"], [0, "Phương án mặt bằng các tầng", "high"], [0, "Phối cảnh ngoại thất 3D"], [0, "Chốt phương án với chủ đầu tư", "high"],
      [1, "Kiến trúc: mặt bằng, mặt đứng, mặt cắt"], [1, "Kết cấu sơ bộ, phương án móng"], [1, "Dự toán sơ bộ"],
      [2, "Kiến trúc chi tiết + khai triển"], [2, "Kết cấu: móng, cột, dầm, sàn, thang", "high"], [2, "Điện – nước – ĐHKK chi tiết"], [2, "Nội thất (nếu có trong hợp đồng)"], [2, "Dự toán chi tiết theo hồ sơ"],
      [3, "Hồ sơ xin phép xây dựng", "high"], [3, "Nộp và theo dõi kết quả"],
      [4, "In ấn, đóng bộ hồ sơ"], [4, "Bàn giao + hướng dẫn giám sát tác giả"],
    ] },
];
const FEATURE_PRESETS = {
  full: { ...FEATURE_ALL_ON },
  task: { ...FEATURE_ALL_ON, finance: false, dailyReport: false, workload: false, sitelog: false, records: false },
  design: { ...FEATURE_ALL_ON, sitelog: false, records: false },
};
const BLANK_CAPS = { canAssign: false, canViewFinance: false, canEditFinance: true, canViewHistory: false, canViewWorkload: false, canManageMembers: false, isLeader: false, isTeamlead: false, noReport: false, position: "" };
const POSITION_PRESETS = {
  leader:   { position: "leader",   isLeader: true,  noReport: true,  canViewFinance: true, canEditFinance: false, canViewWorkload: true, canViewHistory: true },
  deputy:   { position: "deputy",   isLeader: true,  canAssign: true, canViewFinance: true, canViewWorkload: true, canViewHistory: true },
  teamlead: { position: "teamlead", isTeamlead: true, canAssign: true, canViewWorkload: true },
  staff:    { position: "" },
};
/* Màu thẻ bộ phận: chọn tông đậm để chữ trắng cỡ nhỏ đạt tương phản WCAG AA (>= 4,5:1) */
const DEPT_META = {
  QS:          { abbr: "QS", color: "#0e7490" },
  Coordinator: { abbr: "CO", color: "#6d28d9" },
  Design:      { abbr: "DS", color: "#be185d" },
  Site:        { abbr: "ST", color: "#c2410c" },
  Accountant:  { abbr: "AC", color: "#047857" },
  Lead:        { abbr: "LĐ", color: "#b45309" },
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
  return { label, overdue, soon: diff >= 0 && diff <= 2, date: d.getDate() + "/" + (d.getMonth() + 1) };
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
  /* PHẢI giữ ĐỦ mọi khối mà máy chủ lưu. Thiếu một khối ở đây là mất dữ liệu thật:
     máy trạm tải về bản đã cắt rồi lưu ngược lên, máy chủ ghi đè thành rỗng. */
  const obj = (x) => (x && typeof x === "object" && !Array.isArray(x)) ? x : {};
  return { investorContracts: Array.isArray(f.investorContracts) ? f.investorContracts : [],
    subContracts: Array.isArray(f.subContracts) ? f.subContracts : [],
    boq: obj(f.boq),            // { projectId: { items, kys } }
    nganSach: obj(f.nganSach),  // { projectId: { nhóm chi phí: số tiền } }
    chiPhi: obj(f.chiPhi),      // { projectId: [khoản chi thực tế] }
    deNghi: obj(f.deNghi) };    // { projectId: { kyId: đề nghị thanh toán } }
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
    startDate: x.startDate || "", duration: x.duration || null, milestone: !!x.milestone,
    kind: x.kind === "defect" ? "defect" : "task",
    defect: x.kind === "defect" ? { viTri: (x.defect && x.defect.viTri) || "", mucDo: (x.defect && x.defect.mucDo) || "med", nhaThau: (x.defect && x.defect.nhaThau) || "" } : undefined,
    status: (STATUS_ORDER.includes(x.status) ? x.status : ((x.completed || workdone >= 100) ? "done" : (workdone > 0 ? "doing" : "todo"))),
    approver: x.approver === "leader" ? "leader" : "teamlead",
    dependsOn: Array.isArray(x.dependsOn) ? x.dependsOn.filter((d) => typeof d === "string" ? !!d : !!(d && d.id)) : [],
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

/* ---- Hộp thoại trong app (thay window.confirm/alert/prompt — audit UX U2) ----
   Dùng modal từ AntApp.useApp() để hộp thoại theo đúng giao diện, không chặn luồng trình duyệt. */
function askDanger(modal, t, title, okText) {
  return new Promise((resolve) => modal.confirm({
    title, okText: okText || t.delete, cancelText: t.cancel, centered: true, maskClosable: true,
    okButtonProps: { danger: true }, onOk: () => resolve(true), onCancel: () => resolve(false),
  }));
}
function askConfirm(modal, t, title) {
  return new Promise((resolve) => modal.confirm({
    title: t.dlgConfirm, content: title, okText: t.dlgContinue, cancelText: t.cancel, centered: true, maskClosable: true,
    onOk: () => resolve(true), onCancel: () => resolve(false),
  }));
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
/* Máy chủ luôn trả thông báo tiếng Việt vì nó không biết người dùng đang để ngôn ngữ nào.
   Ở chế độ English thì dịch theo mã lỗi; mã nào không có bản dịch (thường là câu kèm số
   liệu động) thì dùng nguyên câu máy chủ — thà tiếng Việt còn hơn mất mất chi tiết. */
function loiMayChu(r, t, macDinh) {
  const b = (r && r.body) || {};
  /* English: bản dịch theo mã -> câu mặc định của chỗ gọi -> đành lấy câu tiếng Việt.
     Tiếng Việt: câu của máy chủ trước, vì nó cụ thể nhất (kèm số phút khóa, ngày...). */
  if (t.__ma !== "vi") return (b.error && t["e_" + b.error]) || macDinh || b.message;
  return b.message || macDinh;
}

const AUTHOR_CREDIT = "Phần mềm do Khuong Doan phát triển — © 2026";
const AUTHOR_URL = "https://khuongdoan.com/";
const SOURCE_URL = "https://github.com/2ez4gcx/Project-hub";
/* Dòng ghi danh tác giả + link trang web, đặt ở góc dưới (sidebar và màn đăng nhập).
   Điều khoản bổ sung 7(b) của giấy phép bắt buộc giữ khối này — được thêm ghi danh của
   mình bên cạnh, không được thay thế hay giấu đi.
   Liên kết "Mã nguồn" là để người vận hành tự động đúng mục 13 AGPL: ai cho người ngoài
   dùng qua mạng thì phải mời họ xem mã nguồn bản đang chạy. Máy chủ truyền sourceUrl
   xuống, sửa mã thì trỏ vào kho của mình. */
function AuthorCredit({ suffix, className, sourceUrl, t }) {
  return (
    <p className={className || "text-xs text-slate-500 text-center leading-tight pt-1"}>
      {AUTHOR_CREDIT}{suffix || ""}
      {" · "}
      <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:underline">khuongdoan.com</a>
      {" · "}
      <a href={sourceUrl || SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:underline">{(t && t.srcLink) || "Mã nguồn (AGPL-3.0)"}</a>
    </p>
  );
}

const ANTD_THEME = { token: { colorPrimary: "#f97316", colorInfo: "#f97316", colorLink: "#ea580c", colorPrimaryHover: "#fb923c", borderRadius: 10, fontFamily: "inherit", controlHeight: 38 }, components: { Button: { fontWeight: 600, primaryShadow: "none", colorPrimary: "#c2410c", colorPrimaryHover: "#9a3412", colorPrimaryActive: "#7c2d12" } } };
export default function ProjectManager() {
  return <ConfigProvider theme={ANTD_THEME}><AntApp><ProjectManagerInner /></AntApp></ConfigProvider>;
}
function ProjectManagerInner() {
  const { message: antMessage, modal: antModal } = AntApp.useApp();
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
  const [loaded, setLoaded] = useState(false);
  const [storageOK, setStorageOK] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [offlinePending, setOfflinePending] = useState(false); // còn thay đổi chưa gửi được lên máy chủ
  const pendingRef = useRef(null);
  const goc3Chieu = useRef(null);   // U5: bản đồng bộ gần nhất, dùng làm gốc khi gộp xung đột                              // { value } — bản chờ gửi
  const PENDING_KEY = "pm_pending_v4";
  const [syncing, setSyncing] = useState(false);

  // server auth
  const [serverMode, setServerMode] = useState(false);
  const [features, setFeatures] = useState({});
  const [appVersion, setAppVersion] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");     // mục 13 AGPL: mã nguồn của bản ĐANG chạy
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
    /* U5: mốc chung để gộp khi xung đột — đây là bản MÁY CHỦ mà cả hai bên cùng xuất phát. */
    goc3Chieu.current = { projects: s.projects || [], sections: s.sections || [], tasks: normTasks,
                          history: s.history || [], dailyReports: s.dailyReports || [], trash: s.trash || [] };
    setHistory(s.history || []); setDailyReports(s.dailyReports || []); setTrash(s.trash || []); localRev.current = s.rev || 0;
    const SPECIAL = ["dashboard", "mywork", "dailyreport", "history", "finance", "workload", "search"];
    setActiveProject((cur) => (SPECIAL.includes(cur) || (s.projects || []).some((x) => x.id === cur)) ? cur : ((s.projects && s.projects[0] && s.projects[0].id) || "dashboard"));
  };

  const refreshAccounts = async () => {
    const a = await api("/api/accounts");
    if (a.ok) setMembers((a.body.accounts || []).map(normMember));
  };

  const afterLogin = async (user) => {
    setAuthUser(user); setCurrentUserId(user.id);
    const a = await api("/api/accounts");
    const accts = (a.body?.accounts || []).map(normMember);
    setMembers(accts);
    if (user.role === "owner" || user.canViewFinance) {
      const f = await api("/api/finance"); if (f.ok) { setFinance(normalizeFinance(f.body)); financeRev.current = f.body.rev || 0; }
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
    else setAuthError(loiMayChu(r, t, t.setupFailed));
  };
  const doLogin = async (email, password) => {
    setAuthError("");
    const r = await api("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (r.ok) { setToken(r.body.token); await afterLogin(r.body.user); }
    else setAuthError(loiMayChu(r, t, t.wrongLogin));
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
        if (c.body.sourceUrl) setSourceUrl(c.body.sourceUrl);
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
          if (resKv === "conflict") { gopKhiXungDot(payload); }
          else if (resKv === "offline") { markPending(JSON.stringify(payload)); antMessage.error(t.unsavedWarn); } // mất mạng: giữ lại để gửi sau
          else if (resKv && typeof resKv === "object" && resKv.error) { pullRemote(true); antMessage.error(resKv.error); } // máy chủ từ chối (vượt quyền) -> tải lại dữ liệu đúng
          else {
            clearPending(); setLastSync(Date.now());
            /* U5: lưu thành công -> máy chủ và máy trạm lại giống nhau, đây là mốc gộp mới. */
            goc3Chieu.current = { projects: payload.projects, sections: payload.sections, tasks: payload.tasks,
                                  history: payload.history, dailyReports: payload.dailyReports, trash: payload.trash };
          }
        })
        .catch(() => { markPending(JSON.stringify(payload)); });
    }, 500);
    return () => clearTimeout(id);
  }, [projects, sections, tasks, members, history, finance, dailyReports, trash]); // eslint-disable-line

  /* ---- Hàng đợi khi mất kết nối (audit 04/09 B2) ----
     Trước đây mất mạng vẫn hiện "Đã đồng bộ" và thao tác chỉ nằm trong RAM: tải lại trang là mất.
     Nay: giữ bản chờ trong localStorage, tự gửi lại khi có mạng, và chặn đóng tab khi còn nợ. */
  const markPending = (value) => {
    pendingRef.current = { value };
    try { localStorage.setItem(PENDING_KEY, value); } catch {}
    setOfflinePending(true);
  };
  const clearPending = () => {
    pendingRef.current = null;
    try { localStorage.removeItem(PENDING_KEY); } catch {}
    setOfflinePending(false);
  };
  const flushPending = async () => {
    const p = pendingRef.current;
    if (!p || !window.storage) return;
    const res = await window.storage.set(SHARED_KEY, p.value, true).catch(() => "offline");
    if (res === "offline") return;                       // vẫn mất mạng — giữ nguyên hàng đợi
    if (res === "conflict" || (res && res.error)) {      // máy chủ có bản mới hơn hoặc từ chối -> phải bỏ
      clearPending(); pullRemote(true);
      antMessage.warning(res === "conflict" ? t.unsavedGone : res.error);
      return;
    }
    clearPending(); setLastSync(Date.now()); antMessage.success(t.savedBack);
  };
  useEffect(() => {
    if (!loaded || !serverMode) return;
    try { const v = localStorage.getItem(PENDING_KEY); if (v && !pendingRef.current) { pendingRef.current = { value: v }; setOfflinePending(true); } } catch {}
  }, [loaded, serverMode]); // eslint-disable-line
  useEffect(() => {
    if (!offlinePending) return;
    const iv = setInterval(() => { flushPending(); }, 15000);
    const onOnline = () => flushPending();
    const onLeave = (e) => { e.preventDefault(); e.returnValue = ""; return ""; };
    window.addEventListener("online", onOnline);
    window.addEventListener("beforeunload", onLeave);
    return () => { clearInterval(iv); window.removeEventListener("online", onOnline); window.removeEventListener("beforeunload", onLeave); };
  }, [offlinePending]); // eslint-disable-line

  /* finance: server mode persists separately (gated endpoint), có CAS chống ghi đè đồng thời */
  const financeReady = useRef(false);
  const financeRev = useRef(0);
  useEffect(() => {
    if (!loaded || !serverMode || !canFinance) return;
    if (!financeReady.current) { financeReady.current = true; return; }
    const id = setTimeout(async () => {
      const r = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...finance, expectedRev: financeRev.current }) });
      if (r.ok) { financeRev.current = r.body.rev || financeRev.current + 1; return; }
      if (r.status === 409) { // người khác vừa lưu -> tải bản mới, bỏ thay đổi cục bộ, báo người dùng làm lại
        const f = await api("/api/finance");
        if (f.ok) { financeRev.current = f.body.rev || 0; financeReady.current = false; setFinance(normalizeFinance(f.body)); }
        antMessage.warning(lang === "vi" ? "Chi phí vừa được người khác cập nhật — đã tải bản mới, vui lòng thao tác lại." : "Finance was just updated by someone else — reloaded, please redo.");
      }
    }, 600);
    return () => clearTimeout(id);
  }, [finance]); // eslint-disable-line

  /* poll */
  /* U5: xung đột -> tải bản mới của máy chủ rồi GỘP thay đổi của mình lên, thay vì bỏ hết. */
  const gopKhiXungDot = async (cuaToi) => {
    const goc = goc3Chieu.current;
    if (!goc) { pullRemote(true); antMessage.warning(t.mergeFallback); return; }
    let cuaHo = null;
    try { const r = await window.storage.get(SHARED_KEY, true); if (r?.value) cuaHo = JSON.parse(r.value); } catch {}
    if (!cuaHo) { pullRemote(true); antMessage.warning(t.mergeFallback); return; }

    const gDA = gopBaChieu(goc.projects, cuaToi.projects, cuaHo.projects);
    const gGD = gopBaChieu(goc.sections, cuaToi.sections, cuaHo.sections);
    const gCV = gopBaChieu(goc.tasks, cuaToi.tasks, cuaHo.tasks);
    const gBC = gopBaChieu(goc.dailyReports, cuaToi.dailyReports, cuaHo.dailyReports);
    const gTR = gopBaChieu(goc.trash, cuaToi.trash, cuaHo.trash);
    /* R5: lịch sử là danh sách CHỈ THÊM, mới nhất đứng trước. TUYỆT ĐỐI không sắp lại theo
       thời gian: luật phía máy chủ đòi đúng khuôn [mục mới của tôi] + [nguyên văn lịch sử
       máy chủ]. Sắp theo ts làm mục của tôi rơi xuống giữa khi tôi thao tác TRƯỚC nhưng lưu
       SAU người kia — và cả lần gộp đó bị máy chủ từ chối, mất trắng thao tác. */
    const idsHo = new Set((cuaHo.history || []).map((x) => x.id));
    const cuaToiMoi = (cuaToi.history || []).filter((x) => x && !idsHo.has(x.id));
    const lichSu = [...cuaToiMoi, ...(cuaHo.history || [])].slice(0, 500);

    const gop = { projects: gDA.ket, sections: gGD.ket, tasks: gCV.ket, dailyReports: gBC.ket, trash: gTR.ket,
                  history: lichSu, rev: (cuaHo.rev || 0) + 1, updatedBy: cuaToi.updatedBy, updatedAt: Date.now() };
    if (!serverMode) { gop.members = cuaToi.members; gop.finance = cuaToi.finance; }

    const res = await window.storage.set(SHARED_KEY, JSON.stringify(gop), true);
    if (res !== true) { pullRemote(true); antMessage.warning(t.mergeFallback); return; }

    suppressSave.current = true;
    localRev.current = gop.rev;
    setProjects(gop.projects); setSections(gop.sections);
    setTasks(gop.tasks.map((x) => normalizeTask(x, members)));
    setHistory(gop.history); setDailyReports(gop.dailyReports); setTrash(gop.trash);
    goc3Chieu.current = { projects: gop.projects, sections: gop.sections, tasks: gop.tasks,
                          history: gop.history, dailyReports: gop.dailyReports, trash: gop.trash };
    lastSavedRef.current = buildCore({ ...gop, members, finance }, !serverMode);
    setLastSync(Date.now()); clearPending();

    const va = [...gCV.xungDot, ...gDA.xungDot, ...gGD.xungDot];
    if (va.length) antMessage.warning(t.mergeConflict.replace("{n}", String(va.length)).replace("{ten}", va.slice(0, 3).map((x) => x.title || x.name || x.id).join(", ")), 8);
    else antMessage.success(t.mergeOk);
  };

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
          /* U5: vừa kéo bản mới về -> đây là mốc gộp mới. */
          goc3Chieu.current = { projects: remote.projects || [], sections: remote.sections || [], tasks: normTasks,
                                history: remote.history || [], dailyReports: remote.dailyReports || [], trash: remote.trash || [] };
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
  const viewAllowed = (v) => v === "board" ? feat("viewBoard") : v === "calendar" ? feat("viewCalendar") : v === "timeline" ? feat("viewTimeline") : v === "construction" ? (feat("sitelog") || feat("records")) : v === "defects" ? feat("defects") : true;
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
      else if (k === "startDate" && patch.startDate !== before.startDate) log({ ...base, action: "task_field", field: "startDate", from: before.startDate, to: patch.startDate });
      else if (k === "duration" && patch.duration !== before.duration) log({ ...base, action: "task_field", field: "duration", from: String(before.duration || ""), to: String(patch.duration || "") });
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
    { const tk0 = tasks.find((x) => x.id === id);   // A9: đổi trạng thái trước đây không được ghi lịch sử
      if (tk0 && tk0.status !== status) log({ action: "task_field", field: "status", projectId: tk0.projectId, projectName: projName(tk0.projectId), taskId: id, taskTitle: tk0.title, from: t.statuses[tk0.status] || tk0.status, to: t.statuses[status] || status }); }
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
          const deps = idsPhuThuoc(nx).map((id) => byId[id]).filter(Boolean);
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
    if (!tk) return;
    // Xóa việc -> vào THÙNG RÁC (như dự án), không mất vĩnh viễn; máy chủ cũng bắt buộc điều này.
    setTrash((tr) => [{ id: tk.id, kind: "task", name: tk.title || t.untitled, projectId: tk.projectId, deletedAt: Date.now(), deletedBy: me?.name || "", task: tk }, ...tr]);
    setTasks((p) => p.filter((x) => x.id !== id)); setDetailTask(null);
    log({ action: "task_delete", projectId: tk.projectId, projectName: projName(tk.projectId), taskTitle: tk.title });
  };
  const rejectTask = (id, reason) => {
    const tk = tasks.find((x) => x.id === id);
    const rs = String(reason || "").trim();
    if (!tk || !canApproveTask(tk) || !rs) return;
    setTasks((p) => p.map((x) => x.id === id ? { ...x, status: "doing", completed: false, completedAt: null, approvedBy: "",
      comments: [...(x.comments || []), { id: uid(), author: me.name, role: myRole, text: "⛔ " + (lang === "vi" ? "Trả về: " : "Returned: ") + rs, ts: Date.now() }],
      lastReturn: { by: me.name, reason: rs, ts: Date.now() } } : x)); // lastReturn: máy chủ nhìn thấy để gửi email báo người làm
    log({ action: "task_reject", projectId: tk.projectId, projectName: projName(tk.projectId), taskId: id, taskTitle: tk.title, to: rs });
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
  /* A6: danh sách thành viên dự án. Rỗng = mở cho cả công ty. Máy chủ lọc dữ liệu theo đây. */
  const setProjectMembers = (pid, ids) => {
    if (!(myRole === "owner" || me?.isLeader)) return;
    const p0 = projects.find((x) => x.id === pid);
    setProjects((pp) => pp.map((x) => x.id === pid ? { ...x, members: ids } : x));
    log({ action: "project_members", projectId: pid, projectName: p0 ? p0.name : pid,
          from: String(((p0 && p0.members) || []).length), to: String(ids.length) });
  };
  // Lưu lịch hiện tại của dự án làm KẾ HOẠCH GỐC (baseline) để Gantt so trễ/sớm. Chỉ Chủ sở hữu / Lãnh đạo.
  const saveBaseline = (pid) => {
    if (!(myRole === "owner" || me?.isLeader)) return;
    const map = {};
    tasks.filter((x) => x.projectId === pid).forEach((x) => { const s = x.startDate || x.dueDate, e = x.dueDate || x.startDate; if (s && e) map[x.id] = { s, e }; });
    setProjects((pp) => pp.map((p) => p.id === pid ? { ...p, baseline: { savedAt: Date.now(), by: me?.name || "", tasks: map } } : p));
    log({ action: "baseline_save", projectId: pid, projectName: projName(pid), to: String(Object.keys(map).length) });
    antMessage.success(t.baselineSaved);
  };
  const setMemberPosition = async (id, pos) => {
    if (myRole !== "owner") return;
    const preset = { ...BLANK_CAPS, ...(POSITION_PRESETS[pos] || {}) };
    const tgt = members.find((m) => m.id === id);
    if (preset.isTeamlead && tgt) { const other = members.find((m) => m.id !== id && m.isTeamlead && (m.dept || "") === (tgt.dept || "")); if (other && !(await askConfirm(antModal, t, (lang === "vi" ? "Bộ phận này đã có Teamlead: " : "This dept already has a teamlead: ") + other.name + (lang === "vi" ? ". Vẫn đặt người này?" : ". Still set this person?")))) return; }
    if (serverMode) { api("/api/accounts/update", { method: "POST", body: JSON.stringify({ id, ...preset }) }).then((r) => { if (r.ok) { refreshAccounts(); if (tgt) log({ action: "member_cap", to: tgt.name, capKey: "position", val: pos }); } }); return; }
    setMembers((pm) => pm.map((m) => m.id === id ? { ...m, ...preset } : m));
  };
  /* Khi đang gom theo giai đoạn, "Thêm việc" phải rơi vào giai đoạn đó chứ không phải cột trạng thái. */
  const addTaskInSection = (sid, title) => {
    const nt = addTask("todo", title);
    if (nt && sid) patchTask(nt.id, { sectionId: sid });
    return nt;
  };
  /* Tạo một lỗi tồn đọng. Dùng chung addTask nên thừa hưởng luật phân quyền + lưu vết. */
  const addDefect = (thongTin) => {
    if (!canEdit) return null;
    const nt = addTask("todo", thongTin.title || "");
    if (!nt) return null;
    patchTask(nt.id, { kind: "defect", defect: { viTri: thongTin.viTri || "", mucDo: thongTin.mucDo || "med", nhaThau: thongTin.nhaThau || "" },
                       description: thongTin.description || "", dueDate: thongTin.dueDate || "", priority: thongTin.mucDo === "high" ? "high" : thongTin.mucDo === "low" ? "low" : "medium" });
    return nt;
  };
  const addSection = (name) => { if (!canEdit || !name?.trim()) return;
    const order = Math.max(0, ...projSections.map((s) => s.order)) + 1;
    setSections((p) => [...p, { id: uid(), projectId: activeProject, name: name.trim(), order }]);
    log({ action: "section_add", projectId: activeProject, projectName: projName(activeProject), to: name.trim() }); };
  const addProject = (name, templateId) => { if (!canEdit || !name?.trim()) return;
    const pid = uid(); const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    const tpl = templateId && String(templateId).startsWith("tpl:") ? BUILTIN_TEMPLATES.find((x) => x.id === templateId) : null;
    if (tpl) { // mẫu xây dựng đóng gói sẵn
      const secs = tpl.sections.map((n, i) => ({ id: uid(), projectId: pid, name: n, order: i }));
      const newTasks = tpl.tasks.map(([si, title, pr], i) => ({
        id: uid(), projectId: pid, sectionId: (secs[si] || secs[0]).id, status: "todo", approver: "teamlead",
        title, description: "", priority: pr || "medium", assignees: [], primaryAssigneeId: null, workdone: 0,
        tags: [], completed: false, subtasks: [], comments: [], dueDate: "", startDate: "", duration: null,
        dependsOn: [], assignedAt: null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none",
        createdAt: Date.now(), order: i,
      }));
      setProjects((p) => [...p, { id: pid, name: name.trim(), color }]);
      setSections((p) => [...p, ...secs]); setTasks((p) => [...p, ...newTasks]);
      log({ action: "project_create", projectId: pid, projectName: name.trim() });
      setActiveProject(pid); setView("list"); return;
    }
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
    if (entry.kind === "task") { // khôi phục một CÔNG VIỆC từ thùng rác
      if (!projects.some((p) => p.id === entry.projectId)) { antMessage.warning(t.restoreNoProject); return; }
      setTasks((x) => [...x, entry.task]);
      setTrash((tr) => tr.filter((e) => e.id !== pid));
      return;
    }
    setProjects((p) => [...p, entry.project]);
    setSections((sx) => [...sx, ...(entry.sections || [])]);
    setTasks((x) => [...x, ...(entry.tasks || [])]);
    setTrash((tr) => tr.filter((e) => e.id !== pid));
    setUndoInfo((u) => (u && u.id === pid ? null : u));
    setActiveProject(pid); };
  const purgeProject = (pid) => {
    if (myRole !== "owner") return;
    const e0 = trash.find((e) => e.id === pid);
    setTrash((tr) => tr.filter((e) => e.id !== pid));
    log({ action: "trash_purge", projectName: e0 ? e0.name : pid, to: e0 && e0.kind === "task" ? t.taskKind : t.projects });
  };
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

  const setMemberCap = async (id, key, val) => { if (!canManageMembers) return;   // canAssign | canViewFinance | canViewHistory
    const tgt = members.find((m) => m.id === id);
    if (key === "isTeamlead" && val && tgt) { const other = members.find((m) => m.id !== id && m.isTeamlead && (m.dept || "") === (tgt.dept || "")); if (other && !(await askConfirm(antModal, t, (lang === "vi" ? "Bộ phận này đã có Teamlead: " : "This department already has a teamlead: ") + other.name + (lang === "vi" ? ". Vẫn đặt người này làm Teamlead?" : ". Still set as teamlead?")))) return; }
    if (serverMode) {
      api("/api/accounts/update", { method: "POST", body: JSON.stringify({ id, [key]: val }) }).then((r) => { if (r.ok) { refreshAccounts(); if (tgt) log({ action: "member_cap", to: tgt.name, capKey: key, val }); } });
      return;
    }
    setMembers((p) => p.map((m) => m.id === id ? { ...m, [key]: val } : m));
    if (tgt) log({ action: "member_cap", to: tgt.name, capKey: key, val }); };
  const addMember = async (name, email, password, caps) => { if (!canManageMembers || !name.trim() || !isEmail(email)) return;
    const c = caps || {};
    if (c.isTeamlead) { const other = members.find((m) => m.isTeamlead && (m.dept || "") === (c.dept || "")); if (other && !(await askConfirm(antModal, t, (lang === "vi" ? "Bộ phận này đã có Teamlead: " : "This department already has a teamlead: ") + other.name + (lang === "vi" ? ". Vẫn thêm người này làm Teamlead?" : ". Still add as teamlead?")))) return; }
    const payload = { name: name.trim(), email: email.trim(), role: c.role || "member", dept: c.dept || "", canAssign: !!c.canAssign, canViewFinance: !!c.canViewFinance, canViewHistory: !!c.canViewHistory, canViewWorkload: !!c.canViewWorkload, canManageMembers: !!c.canManageMembers, isLeader: !!c.isLeader, isTeamlead: !!c.isTeamlead, noReport: !!c.noReport, position: c.position || "" };
    if (serverMode) {
      if (!password) return;
      api("/api/accounts", { method: "POST", body: JSON.stringify({ ...payload, password }) }).then((r) => {
        if (r.ok) { refreshAccounts(); log({ action: "member_add", to: name.trim() }); }
        else if (r.status === 409) antMessage.error(t.emailExistsErr);
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
        else if (r.status === 400) antMessage.error(t.lastOwnerWarn);
      });
      return;
    }
    setMembers((p) => { const next = p.filter((m) => m.id !== id);
      if (!next.some((m) => effRole(m) === "owner")) { antMessage.error(t.lastOwnerWarn); return p; } return next; });
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
  /* P1: gom việc theo trạng thái (mặc định, kiểu Asana) hay theo giai đoạn thi công (WBS).
     Dữ liệu `sections` đã có sẵn từ mẫu dự án — trước đây chỉ dùng để ghi lịch sử. */
  const [memberModal, setMemberModal] = useState(false);
  const [groupBy, setGroupBy] = useState(() => { try { return localStorage.getItem("pm_groupby") || "status"; } catch { return "status"; } });
  useEffect(() => { try { localStorage.setItem("pm_groupby", groupBy); } catch {} }, [groupBy]);
  const groups = useMemo(() => groupBy === "section"
    ? [...projSections.map((x, i) => ({ id: x.id, name: x.name, wbs: String(i + 1) })), { id: "", name: t.noSection, wbs: "" }]
    : STATUS_ORDER.map((x) => ({ id: x, name: t.statuses[x], wbs: "" })), [groupBy, projSections, t]);
  const groupOf = (task) => groupBy === "section" ? (projSections.some((x) => x.id === task.sectionId) ? task.sectionId : "") : task.status;

  const passesFilter = (x) => {
    if (search && !x.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && x.priority !== filterPriority) return false;
    if (filterAssignee && !(x.assignees || []).includes(filterAssignee)) return false;
    if (!showCompleted && x.completed) return false;
    return true;
  };
  /* Lỗi tồn đọng là một loại việc riêng — không trộn vào Danh sách/Bảng/Gantt tiến độ. */
  const projectTasksAll = useMemo(() => tasks.filter((x) => x.projectId === activeProject && x.kind !== "defect"), [tasks, activeProject]);
  const projectDefects = useMemo(() => tasks.filter((x) => x.projectId === activeProject && x.kind === "defect"), [tasks, activeProject]);
  const projectTasks = useMemo(() => tasks.filter((x) => x.projectId === activeProject && x.kind !== "defect" && passesFilter(x)),
    [tasks, activeProject, search, filterPriority, filterAssignee, showCompleted]);
  /* A1: tập id đang hiển thị phải là cùng một Set giữa các lần render, nếu không mọi useMemo bên trong Gantt vô tác dụng. */
  const visibleTaskIds = useMemo(() => new Set(projectTasks.map((x) => x.id)), [projectTasks]);
  const openTaskCb = useCallback((id) => setDetailTask(id), []);
  const rescheduleCb = useCallback((id, sd, dd) => patchTask(id, { startDate: sd, dueDate: dd }), [patchTask]);
  const hasFilters = filterPriority || filterAssignee || search;
  const taskById = useMemo(() => Object.fromEntries(tasks.map((x) => [x.id, x])), [tasks]);
  const blockedIds = useMemo(() => {
    const set = new Set();
    for (const x of tasks) {
      if (x.completed) continue;
      const deps = idsPhuThuoc(x);
      if (deps.some((id) => taskById[id] && !taskById[id].completed)) set.add(x.id);
    }
    return set;
  }, [tasks, taskById]);
  const isBoardlessView = ["dashboard", "mywork", "history", "finance", "workload", "dailyreport", "search"].includes(activeProject);

  if (!loaded) return <div className="h-screen flex items-center justify-center text-slate-500">…</div>;

  if (serverMode && needsSetup) return <AuthScreen mode="setup" t={t} lang={lang} setLang={setLang} error={authError} sourceUrl={sourceUrl} onSubmit={(n, e, p, c) => doSetup(n, e, p, c)} />;
  if (serverMode && !authUser) return <AuthScreen mode="login" t={t} lang={lang} setLang={setLang} error={authError} sourceUrl={sourceUrl} onSubmit={(e, p) => doLogin(e, p)} />;

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 antialiased overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* MOBILE NAV BACKDROP */}
      {navOpen && <div className="fixed inset-0 bg-slate-900/50 z-30 md:hidden" onClick={() => setNavOpen(false)} />}
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-white text-slate-600 border-r border-slate-200 flex flex-col transform transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}><Sparkles size={17} /></div>
          <div className="leading-tight flex-1"><div className="text-slate-800 font-semibold text-sm">{t.appName}</div><div className="text-xs text-slate-500">{t.tagline}</div></div>
          <button onClick={() => setNavOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700 p-1"><X size={18} /></button>
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
          {canEdit && <button onClick={() => setModal("newProject")} className="text-slate-500 hover:text-orange-600 transition-colors" title={t.newProject}><Plus size={16} /></button>}
        </div>
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {projects.map((p) => {
            const count = tasks.filter((x) => x.projectId === p.id && !x.completed).length;
            return (
              <button key={p.id} onClick={() => { setActiveProject(p.id); setView("list"); setNavOpen(false); }}
                className={`group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${activeProject === p.id ? "text-white" : "hover:bg-slate-100 text-slate-600"}`} style={activeProject === p.id ? { background: "#c2410c" } : undefined}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="flex-1 text-left truncate">{p.name}</span>
                {count > 0 && <span className="text-xs text-slate-500">{count}</span>}
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
            <LogOut size={15} className="text-slate-500 group-hover:text-slate-600" />
          </button>
          <button onClick={syncNow} className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition">
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {offlinePending ? t.unsaved : !storageOK ? t.offline : syncing ? t.syncing : `${t.synced}${lastSync ? " · " + new Date(lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}`}
          </button>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <Globe size={15} className="text-slate-500 ml-1.5" />
            {["vi", "en"].map((l) => (<button key={l} onClick={() => setLang(l)} className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${lang === l ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{l === "vi" ? "Tiếng Việt" : "English"}</button>))}
          </div>
          <AuthorCredit suffix={appVersion ? " · v" + appVersion : ""} sourceUrl={sourceUrl} t={t} />
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
            <h1 className="text-lg font-semibold flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: project.color }} />
              <span className="truncate">{project.name}</span>
              {(project.members || []).length > 0 && <AntTag color="orange" style={{ margin: 0 }} title={t.projMembersLocked}><Lock size={11} style={{ verticalAlign: "-1px" }} /> {(project.members || []).length}</AntTag>}
            </h1>
          ) : <h1 className="text-lg font-semibold text-slate-500">{t.welcome}</h1>}
          <div className="flex-1" />
          {feat("notifications") && (
            <AntPopover trigger="click" placement="bottomRight" open={notifOpen} onOpenChange={(o) => { setNotifOpen(o); if (o) markNotifSeen(); }}
              content={<NotifPanel t={t} lang={lang} items={notifications} onOpen={(n) => { setNotifOpen(false); if (n.taskId) setDetailTask(n.taskId); else if (n.report) setActiveProject("dailyreport"); }} />}>
              <button className="relative p-2 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-slate-50" title={lang === "vi" ? "Thông báo" : "Notifications"}>
                <AntBadge count={notifUnread} size="small" style={{ backgroundColor: "#c2410c" }}><Bell size={19} /></AntBadge>
              </button>
            </AntPopover>
          )}
          {!canEdit && <AntTag className="hidden sm:inline-flex items-center gap-1" style={{ margin: 0 }}><Lock size={12} />{t.roles[myRole]}</AntTag>}
          {!isBoardlessView && project && (
            <>
              <AntInput allowClear value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} prefix={<Search size={15} className="text-slate-500" />} style={{ width: 180 }} />
              {(myRole === "owner" || me?.isLeader) && <AntBtn icon={<UserCheck size={15} />} onClick={() => setMemberModal(true)} title={t.projMembers} />}
              <AntBadge dot={hasFilters}><AntBtn icon={<Filter size={15} />} onClick={() => setShowFilters((v) => !v)} type={hasFilters ? "primary" : "default"} ghost={hasFilters}>{t.filter}</AntBtn></AntBadge>
              {canEdit && <AntBtn type="primary" icon={<Plus size={16} />} onClick={() => { const nt = addTask("todo"); if (nt) setDetailTask(nt.id); }}>{t.addTask}</AntBtn>}
            </>
          )}
        </header>

        {showFilters && !isBoardlessView && project && (
          <div className="bg-white border-b border-slate-200 px-3 md:px-6 py-3 flex flex-wrap items-center gap-3">
            <AntSelect value={filterPriority} onChange={(v) => setFilterPriority(v)} style={{ minWidth: 150 }} options={[{ value: "", label: t.allPriorities }, ...PRIORITY_ORDER.map((p) => ({ value: p, label: t.priorities[p] }))]} />
            <AntSelect value={filterAssignee} onChange={(v) => setFilterAssignee(v)} style={{ minWidth: 160 }} showSearch optionFilterProp="label" options={[{ value: "", label: t.allAssignees }, ...members.map((m) => ({ value: m.id, label: m.name }))]} />
            <AntCheckbox checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)}>{t.showCompleted}</AntCheckbox>
            <span className="flex items-center gap-2 text-sm text-slate-600">{t.groupBy}
              <Segmented value={groupBy} onChange={(v) => setGroupBy(v)} size="small"
                options={[{ value: "status", label: t.groupStatus }, { value: "section", label: t.groupSection }]} />
            </span>
            {hasFilters && <AntBtn type="link" size="small" onClick={() => { setFilterPriority(""); setFilterAssignee(""); setSearch(""); }}>{t.clearFilters}</AntBtn>}
          </div>
        )}

        {!isBoardlessView && project && (
          <div className="bg-white border-b border-slate-200 px-3 md:px-6">
            <AntTabs activeKey={view} onChange={setView} tabBarStyle={{ marginBottom: 0 }}
              tabBarExtraContent={canManage ? <button onClick={() => deleteProject(project.id)} className="text-slate-500 hover:text-red-500 transition p-2" title={t.deleteProject}><Trash2 size={15} /></button> : undefined}
              items={[["list", LayoutList, t.list], ["board", LayoutGrid, t.board], ["calendar", CalendarDays, t.calendar], ["timeline", CalendarRange, t.timeline], ["defects", ClipboardCheck, t.defects], ["construction", ScrollText, t.constructionSite]].filter(([v]) => viewAllowed(v)).map(([v, Icon, label]) => ({ key: v, label: <span className="flex items-center gap-1.5"><Icon size={16} />{label}</span> }))} />
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {activeProject === "dashboard" && <Dashboard t={t} lang={lang} projects={projects} tasks={tasks} members={workMembers} memberById={memberById} onOpenProject={(id) => { setActiveProject(id); setView("list"); }} onOpenTask={(id) => setDetailTask(id)} />}
          {activeProject === "history" && (canViewHistory
            ? <HistoryView t={t} lang={lang} history={history} projects={projects} canDelete={myRole === "owner"} canAudit={myRole === "owner" || !!me?.isLeader} onDelete={deleteHistoryEntry} />
            : <div className="h-full flex flex-col items-center justify-center text-slate-500"><Lock size={44} className="mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.historyLocked}</p></div>)}
          {activeProject === "mywork" && <MyWork t={t} lang={lang} me={me} tasks={tasks} projects={projects} memberById={memberById} onOpenTask={(id) => setDetailTask(id)} />}
          {activeProject === "search" && <SearchView t={t} tasks={tasks} projects={projects} memberById={memberById} onOpenTask={(id) => setDetailTask(id)} />}
          {activeProject === "dailyreport" && <DailyReportView t={t} lang={lang} me={me} myRole={myRole} currentUserId={currentUserId} members={members} memberById={memberById} tasks={tasks} projects={projects} dailyReports={dailyReports} onSave={saveDailyReport} onComment={addReportComment} reportDeadline={reportDeadline} onOpenTask={(id) => setDetailTask(id)} />}
          {activeProject === "finance" && (canFinance
            ? <FinanceView t={t} lang={lang} finance={finance} projects={projects} tasks={tasks} onChange={setFinanceData} canEditFin={myRole === "owner" || me?.canEditFinance !== false} />
            : <div className="h-full flex flex-col items-center justify-center text-slate-500"><Lock size={44} className="mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.financeLocked}</p></div>)}
          {activeProject === "workload" && (canViewWorkload
            ? <WorkloadView t={t} lang={lang} members={workMembers} tasks={tasks} projects={projects} />
            : <div className="h-full flex flex-col items-center justify-center text-slate-500"><Lock size={44} className="mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.workloadLocked}</p></div>)}
          {project && view === "list" && <ListView t={t} lang={lang} canEdit={canEdit} memberById={memberById} sections={groups} groupBy={groupBy} groupOf={groupOf} tasks={projectTasks} blockedIds={blockedIds} onToggle={(id, c) => c ? setWorkdone(id, 100) : setWorkdone(id, 0)} onOpenTask={(id) => setDetailTask(id)} onQuickAdd={(sid, title) => groupBy === "section" ? addTaskInSection(sid, title) : addTask(sid, title)} onAddSection={groupBy === "section" && canEdit ? addSection : undefined} onImport={importFromCSV} />}
          {project && view === "board" && <BoardView t={t} lang={lang} canEdit={canEdit} memberById={memberById} sections={groups} groupBy={groupBy} groupOf={groupOf} tasks={projectTasks} blockedIds={blockedIds} onMove={(id, sid) => groupBy === "section" ? patchTask(id, { sectionId: sid }) : setStatus(id, sid)} onOpenTask={(id) => setDetailTask(id)} onQuickAdd={(sid, title) => groupBy === "section" ? addTaskInSection(sid, title) : addTask(sid, title)} onAddSection={groupBy === "section" && canEdit ? addSection : undefined} />}
          {project && view === "calendar" && <CalendarView t={t} lang={lang} tasks={projectTasks} onOpenTask={(id) => setDetailTask(id)} />}
          {project && view === "defects" && <DefectView t={t} lang={lang} canEdit={canEdit} memberById={memberById} members={workMembers} defects={projectDefects} onAdd={addDefect} onOpenTask={(id) => setDetailTask(id)} />}
          {project && view === "timeline" && <TimelineView t={t} lang={lang} canEdit={canEdit} tasks={projectTasksAll} visibleIds={visibleTaskIds} memberById={memberById} project={project} canBaseline={myRole === "owner" || !!me?.isLeader} onSaveBaseline={async () => { if (!project.baseline || await askConfirm(antModal, t, t.baselineConfirm)) saveBaseline(project.id); }} onSaveLich={(l) => setProjects((pp) => pp.map((p) => p.id === project.id ? { ...p, lich: l } : p))} onOpenTask={openTaskCb} onReschedule={rescheduleCb} />}
          {project && view === "construction" && <ConstructionSiteView t={t} lang={lang} project={project} me={me} myRole={myRole} members={members} features={features} canEdit={canEdit} boqItems={((finance.boq || {})[project.id] || {}).items || []} onSetLoggers={(ids) => setProjectSiteLoggers(project.id, ids)} onDefects={(ds) => { ds.forEach(addDefect); antMessage.success(t.chkDefectsMade.replace("{n}", String(ds.length))); }} />}
          {!project && !isBoardlessView && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500"><Folder size={48} className="mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.welcome}</p><p className="text-sm">{t.welcomeHint}</p></div>
          )}
        </div>
      </main>

      {memberModal && project && (
        <ProjectMembersModal t={t} lang={lang} project={project} members={workMembers}
          onClose={() => setMemberModal(false)}
          onSave={(ids) => { setProjectMembers(project.id, ids); setMemberModal(false); }} />
      )}
      {detailTask && (() => {
        const task = tasks.find((x) => x.id === detailTask);
        if (!task) return null;
        return <TaskDetail t={t} lang={lang} task={task} members={workMembers} memberById={memberById} me={me}
          canEdit={canEdit} canWorkdone={canWorkdone(task)}
          sections={sections.filter((s) => s.projectId === task.projectId)}
          projTasks={tasks.filter((x) => x.projectId === task.projectId && x.kind !== "defect")}
          onClose={() => setDetailTask(null)} onPatch={(patch) => patchTask(detailTask, patch)}
          onAssign={(a, p) => setAssign(detailTask, a, p)} onWorkdone={(v) => setWorkdone(detailTask, v)}
          onDepends={(deps) => setDepends(detailTask, deps)}
          onReminder={(l) => setReminder(detailTask, l)} onDelete={() => removeTask(detailTask)} onComment={(text) => addComment(detailTask, text)} onStatus={(st) => setStatus(detailTask, st)} onApprove={() => approveTask(detailTask)} onReject={(reason) => rejectTask(detailTask, reason)} onApprover={(a) => setApprover(detailTask, a)} canApprove={canApproveTask(task)} assignableIds={assignableIds} canRemind={feat("notifications")} serverMode={serverMode} />;
      })()}

      {modal === "newProject" && <NewProjectModal t={t} lang={lang} projects={projects} onClose={() => setModal(null)} onCreate={(n, tpl) => { addProject(n, tpl); setModal(null); }} />}
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
      {modal === "settings" && <SettingsModal t={t} lang={lang} onLoad={loadSettings} onSave={saveSettings} onFeatures={setFeatures} onClose={() => setModal(null)} membersCount={members.length} onOpenMembers={() => setModal("members")} />}
    </div>
  );
}

/* ============================ shared bits ============================ */
/* H5: hộp xác nhận xóa hồ sơ — bắt ghi lý do, nói rõ giữ 90 ngày.
   Trả về chuỗi lý do nếu đồng ý, null nếu hủy. */
function hoiLyDoXoa(antModal, t) {
  return new Promise((resolve) => {
    let lyDo = "";
    antModal.confirm({
      title: t.confirmDeleteRecord,
      okText: t.delete, cancelText: t.cancel, okButtonProps: { danger: true },
      content: (
        <div className="space-y-2 pt-1">
          <p className="text-sm text-slate-600">{t.trashKept90}</p>
          <AntInput autoFocus placeholder={t.trashReason} onChange={(e) => { lyDo = e.target.value; }} />
        </div>
      ),
      onOk: () => resolve(lyDo),
      onCancel: () => resolve(null),
    });
  });
}

/* R6: xem và khôi phục hồ sơ đã xóa (biên bản / nhật ký thi công) trong 90 ngày.
   loai = records | sitelogs — hai đường API cùng khuôn. */
function ThungRacHoSo({ t, lang, project, loai, onClose, onDoi }) {
  const { modal: antModal } = AntApp.useApp();
  const [ds, setDs] = useState(null);
  const [busy, setBusy] = useState("");
  const duong = loai === "records" ? "/api/records" : "/api/sitelogs";
  const khoa = loai === "records" ? "records" : "logs";
  const nap = async () => {
    const r = await api(duong + "?projectId=" + encodeURIComponent(project.id) + "&trash=1");
    setDs(r.ok ? (r.body[khoa] || []) : []);
  };
  useEffect(() => { nap(); }, [project.id, loai]); // eslint-disable-line
  const khoiPhuc = async (x) => {
    setBusy(x.id);
    const r = await api(duong + "/restore", { method: "POST", body: JSON.stringify({ id: x.id }) });
    setBusy("");
    if (!r.ok) { antModal.warning({ title: t.restore, content: loiMayChu(r, t, t.saveFailed) }); return; }
    await nap(); onDoi && onDoi();
  };
  const xoaHan = async (x) => {
    if (!(await askDanger(antModal, t, t.purgeConfirm))) return;
    setBusy(x.id);
    const r = await api(duong + "/delete", { method: "POST", body: JSON.stringify({ id: x.id, purge: true }) });
    setBusy("");
    if (!r.ok) { antModal.warning({ title: t.deleteForever, content: loiMayChu(r, t, t.saveFailed) }); return; }
    nap();
  };
  const fmtD = (d) => d ? d.split("-").reverse().join("/") : "—";
  const conLai = (x) => Math.max(0, 90 - Math.floor((Date.now() - (x.deletedAt || 0)) / 86400000));
  return (
    <AntModal open onCancel={onClose} width={560} footer={<AntBtn onClick={onClose}>{t.close || "Đóng"}</AntBtn>}
      title={<span className="flex items-center gap-2"><Trash2 size={18} className="text-orange-500" />{t.recTrash}</span>}>
      <p className="text-xs text-slate-500 mb-2">{t.recTrashHint}</p>
      {ds === null ? <p className="text-sm text-slate-500">{t.loading}</p>
        : ds.length === 0 ? <p className="text-sm text-slate-500">{t.trashEmpty}</p> : (
        <div className="space-y-1.5" style={{ maxHeight: "55vh", overflowY: "auto" }}>
          {ds.map((x) => (
            <div key={x.id} className="rounded-lg border border-slate-200 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-700">{fmtD(x.date)}</span>
                {x.type && <span className="text-xs text-slate-500">{x.type}</span>}
                <span className="text-sm text-slate-600 flex-1 min-w-[40%] truncate">{x.note || x.work || x.number || "—"}</span>
                <AntBtn size="small" loading={busy === x.id} onClick={() => khoiPhuc(x)}>{t.restore}</AntBtn>
                <AntBtn size="small" danger loading={busy === x.id} onClick={() => xoaHan(x)}>{t.deleteForever}</AntBtn>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.deletedBy}: {x.deletedBy || "—"}
                {x.deleteReason ? " · " + t.trashReason.replace(" (ghi vào nhật ký)", "") + ": " + x.deleteReason : ""}
                {" · " + t.purgeIn.replace("{n}", String(conLai(x)))}
              </p>
            </div>
          ))}
        </div>
      )}
    </AntModal>
  );
}

function RecordsView({ t, lang, project, canEdit, onDefects }) {
  const { modal: antModal } = AntApp.useApp();
  const [racMo, setRacMo] = useState(false);        // R6: hộp thùng rác hồ sơ
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
  const del = async (rec) => {
    const lyDo = await hoiLyDoXoa(antModal, t);            // H5: hồ sơ chất lượng — phải ghi lý do
    if (lyDo === null) return;
    await api("/api/records/delete", { method: "POST", body: JSON.stringify({ id: rec.id, reason: lyDo }) });
    load();
  };
  const types = Array.from(new Set(records.map((r) => r.type).filter(Boolean)));
  const shown = filter ? records.filter((r) => r.type === filter) : records;
  const fmt = (d) => d ? d.split("-").reverse().join("/") : "";
  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><ScrollText size={20} className="text-orange-500" />{t.records}</h2>
        <div className="flex items-center gap-2">
          {types.length > 0 && <AntSelect value={filter} onChange={(v) => setFilter(v)} size="small" style={{ minWidth: 150 }} options={[{ value: "", label: t.allTypes }, ...types.map((ty) => ({ value: ty, label: ty }))]} />}
          {canEdit && <button onClick={() => setRacMo(true)} className="text-sm text-slate-500 hover:text-orange-600 flex items-center gap-1"><Trash2 size={15} />{t.recTrash}</button>}
          {canEdit && <AntBtn type="primary" icon={<Plus size={16} />} onClick={() => setModal(true)}>{t.addRecord}</AntBtn>}
        </div>
      </div>
      {loading ? <p className="text-slate-500 text-sm">…</p> : shown.length === 0 ? (
        <div className="text-center text-slate-500 py-16"><ScrollText size={44} className="mx-auto mb-3 opacity-40" /><p className="text-slate-500">{t.noRecords}</p></div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((rec) => (
            <div key={rec.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{fmt(rec.date)}</span>
                    {rec.type && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">{rec.type}</span>}
                    {rec.number && <span className="text-xs text-slate-500">#{rec.number}</span>}
                  </div>
                  {rec.note && <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap break-words">{rec.note}</p>}
                  {rec.createdBy && <p className="text-xs text-slate-500 mt-1">{rec.createdBy}</p>}
                </div>
                {canEdit && <button onClick={() => del(rec)} className="text-slate-500 hover:text-red-500 p-1 shrink-0" title={t.delete}><Trash2 size={15} /></button>}
              </div>
              {rec.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {rec.files.map((f) => (
                    <button key={f.idx} onClick={() => openFile(rec, f)} className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 min-w-0" style={{ maxWidth: "100%" }}><Download size={14} className="text-slate-500 shrink-0" /><span className="truncate">{f.name}</span></button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {modal && <RecordModal t={t} lang={lang} project={project} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); }} onDefects={onDefects} />}
      {racMo && <ThungRacHoSo t={t} lang={lang} project={project} loai="records" onClose={() => setRacMo(false)} onDoi={load} />}
    </div>
  );
}
function RecordModal({ t, lang, project, onClose, onSaved, onDefects }) {
  const now = new Date();
  const iso = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  const [date, setDate] = useState(iso);
  const [type, setType] = useState(t.recFieldType);
  const [number, setNumber] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  /* H2: bảng kiểm nghiệm thu — chỉ hiện khi chọn loại "Nghiệm thu nội bộ" */
  const [mauId, setMauId] = useState("");
  const [bangKiem, setBangKiem] = useState([]);
  const laNghiemThu = type === t.recAcceptType || type === t.recSafetyType || type === t.recPermitType;   // H3: an toàn cũng dùng bảng kiểm
  const chonMau = (id) => {
    setMauId(id);
    const m = MAU_KIEM.find((x) => x.id === id);
    setBangKiem(m ? m.items.map((x) => ({ text: x, ketQua: "", ghiChu: "" })) : []);
  };
  const datMuc = (i, k, v) => setBangKiem((bk) => bk.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const soKhongDat = bangKiem.filter((x) => x.ketQua === "khongdat").length;
  const soChuaCham = bangKiem.filter((x) => !x.ketQua).length;
  const ketQuaTong = !bangKiem.length ? "" : soChuaCham ? "chua" : soKhongDat ? "khongdat" : "dat";
  const submit = async () => {
    if (busy) return; setBusy(true); setErr("");
    const r = await api("/api/records", { method: "POST", body: JSON.stringify({ projectId: project.id, projectName: project.name, date, type, number, note, checklist: laNghiemThu ? bangKiem : undefined }) });
    if (!r.ok) { setErr(loiMayChu(r, t, t.saveFailed)); setBusy(false); return; }
    const rid = r.body.record.id;
    for (const f of files) {
      try {
        const tok = getToken();
        await fetch("/api/records/file?recordId=" + rid + "&filename=" + encodeURIComponent(f.name), { method: "POST", headers: { ...(tok ? { Authorization: "Bearer " + tok } : {}), "Content-Type": f.type || "application/octet-stream" }, body: f });
      } catch {}
    }
    setBusy(false);
    /* Mục KHÔNG ĐẠT thành lỗi tồn đọng — đây là chỗ nối bảng kiểm với punch list. */
    if (laNghiemThu && soKhongDat && onDefects) onDefects(bangKiem.filter((x) => x.ketQua === "khongdat").map((x) => ({ title: x.text + (x.ghiChu ? " — " + x.ghiChu : ""), viTri: number || "", mucDo: "med" })));
    onSaved();
  };
  const inp = "w-full mt-0.5 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400";
  const nhanKQ = { dat: t.chkPass, khongdat: t.chkFail, na: "N/A" };
  const mauKQ = { dat: "#16a34a", khongdat: "#dc2626", na: "#64748b" };
  return (
    <AntModal open onCancel={onClose} width={laNghiemThu ? 640 : 480}
      title={<span className="flex items-center gap-2"><ScrollText size={19} className="text-orange-500" />{t.addRecord}</span>}
      footer={<AntBtn type="primary" loading={busy} disabled={!note.trim() && !bangKiem.length} onClick={submit}>{busy ? t.recSaving : t.save}</AntBtn>}>
      <div className="space-y-3" style={{ maxHeight: "68vh", overflowY: "auto" }}>
        <label className="block"><span className="text-xs text-slate-500">{t.recDate}</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} /></label>
        <label className="block"><span className="text-xs text-slate-500">{t.recType}</span><AntSelect value={type} onChange={(v) => setType(v)} style={{ width: "100%", marginTop: 2 }} options={[{ value: t.recFieldType, label: t.recFieldType }, { value: t.recMeetingType, label: t.recMeetingType }, { value: t.recDirectiveType, label: t.recDirectiveType }, { value: t.recAcceptType, label: t.recAcceptType }, { value: t.recSafetyType, label: t.recSafetyType }, { value: t.recPermitType, label: t.recPermitType }]} /></label>
        {laNghiemThu && (
          <div className="rounded-xl border border-slate-200 p-3 space-y-2.5">
            <label className="block"><span className="text-xs text-slate-500">{t.chkTemplate}</span>
              <AntSelect value={mauId} onChange={chonMau} style={{ width: "100%", marginTop: 2 }}
                options={[{ value: "", label: t.chkPickTemplate }, ...MAU_KIEM.map((m) => ({ value: m.id, label: lang === "vi" ? m.vi : m.en }))]} /></label>
            {bangKiem.length > 0 && (
              <>
                <div className="space-y-2">
                  {bangKiem.map((it, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 px-2.5 py-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-slate-500 tabular-nums pt-1 w-5 shrink-0">{i + 1}.</span>
                        <AntInput.TextArea autoSize value={it.text} onChange={(e) => datMuc(i, "text", e.target.value)} style={{ flex: 1 }} />
                        <button onClick={() => setBangKiem((bk) => bk.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 pt-1" aria-label={t.delete}><X size={13} /></button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 pl-7">
                        {KET_QUA.map((k) => (
                          <button key={k} onClick={() => datMuc(i, "ketQua", it.ketQua === k ? "" : k)}
                            className="text-xs px-2.5 py-1 rounded-lg border transition"
                            style={it.ketQua === k ? { borderColor: mauKQ[k], background: mauKQ[k] + "18", color: mauKQ[k], fontWeight: 600 } : { borderColor: "#e2e8f0", color: "#64748b" }}>{nhanKQ[k]}</button>
                        ))}
                        {it.ketQua === "khongdat" && (
                          <AntInput size="small" value={it.ghiChu} onChange={(e) => datMuc(i, "ghiChu", e.target.value)} placeholder={t.chkNotePh} style={{ flex: 1, minWidth: 140 }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setBangKiem((bk) => [...bk, { text: "", ketQua: "", ghiChu: "" }])} className="text-sm text-orange-600 hover:underline flex items-center gap-1"><Plus size={14} />{t.chkAddItem}</button>
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{t.chkResult}:</span>
                  <span className="text-sm font-semibold" style={{ color: ketQuaTong === "dat" ? "#16a34a" : ketQuaTong === "khongdat" ? "#dc2626" : "#64748b" }}>
                    {ketQuaTong === "dat" ? t.chkPassAll : ketQuaTong === "khongdat" ? t.chkFailN.replace("{n}", String(soKhongDat)) : t.chkPending.replace("{n}", String(soChuaCham))}
                  </span>
                  {soKhongDat > 0 && <span className="text-xs text-slate-500">· {t.chkWillCreateDefects.replace("{n}", String(soKhongDat))}</span>}
                </div>
              </>
            )}
          </div>
        )}
        <label className="block"><span className="text-xs text-slate-500">{t.recNumber}</span><AntInput value={number} onChange={(e) => setNumber(e.target.value)} placeholder={t.recNumberPh} /></label>
        <label className="block"><span className="text-xs text-slate-500">{t.recNote}</span><AntInput.TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></label>
        <div><span className="text-xs text-slate-500">{t.recFiles}</span>
          <input type="file" multiple accept="image/*,application/pdf" className="w-full mt-0.5 text-sm"
            onChange={async (e) => { const arr = Array.from(e.target.files || []); const nen = []; for (const f of arr) nen.push(await nenAnh(f)); setFiles(nen); }} />
          {files.length > 0 && <p className="text-xs text-slate-500 mt-1">{files.length} {t.recFilesChosen} · {kichCo(files.reduce((a, f) => a + f.size, 0))}</p>}</div>
      </div>
      {err && <p className="text-sm text-red-500 mt-2">{err}</p>}
    </AntModal>
  );
}

function ConstructionSiteView({ t, lang, project, me, myRole, members, features, canEdit, boqItems, onSetLoggers, onDefects }) {
  const cfeat = (k) => (features || {})[k] !== false;
  const [tab, setTab] = useState(cfeat("sitelog") ? "site" : "records");
  const loggers = project.siteLoggers || [];
  const canManage = myRole === "owner" || !!(me && me.isLeader);
  // khớp đúng luật máy chủ (canRecordProject): owner/leader, teamlead bộ phận Site, hoặc người được chỉ định
  const canRecord = canManage || !!(me && ((me.isTeamlead && (me.dept || "") === "Site") || loggers.includes(me.id)));
  return (
    <div>
      <div className="max-w-4xl mx-auto px-3 md:px-6 pt-4">
        <AntTabs activeKey={tab} onChange={setTab} tabBarStyle={{ marginBottom: 0 }} items={[{ key: "site", label: t.siteTab, show: cfeat("sitelog") }, { key: "records", label: t.recordsTab, show: cfeat("records") }, { key: "hse", label: t.hseTab, show: cfeat("sitelog") || cfeat("records") }].filter((x) => x.show).map(({ key, label }) => ({ key, label }))} />
      </div>
      {tab === "hse" ? <HSEView t={t} lang={lang} project={project} />
        : (tab === "site" && cfeat("sitelog")) ? <SiteLogView t={t} lang={lang} project={project} me={me} myRole={myRole} members={members} boqItems={boqItems} onSetLoggers={onSetLoggers} />
        : <RecordsView t={t} lang={lang} project={project} canEdit={canRecord} onDefects={onDefects} />}
    </div>
  );
}
function SiteLogView({ t, lang, project, me, myRole, members, boqItems, onSetLoggers }) {
  const { modal: antModal } = AntApp.useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [racMo, setRacMo] = useState(false);        // R6: hộp thùng rác hồ sơ
  const loggers = project.siteLoggers || [];
  const canManage = myRole === "owner" || !!(me && me.isLeader);
  const canLog = (canManage || !!(me && ((me.isTeamlead && (me.dept || "") === "Site") || loggers.includes(me.id))));
  const load = async () => { setLoading(true); const r = await api("/api/sitelogs?projectId=" + encodeURIComponent(project.id)); if (r.ok) setLogs(r.body.logs || []); setLoading(false); };
  useEffect(() => { load(); }, [project.id]); // eslint-disable-line
  const openPhoto = async (log, f) => { try { const tok = getToken(); const res = await fetch("/api/sitelogs/photo?logId=" + log.id + "&idx=" + f.idx, { headers: tok ? { Authorization: "Bearer " + tok } : {} }); const blob = await res.blob(); const url = URL.createObjectURL(blob); window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 60000); } catch {} };
  const del = async (log) => {
    const lyDo = await hoiLyDoXoa(antModal, t);
    if (lyDo === null) return;
    await api("/api/sitelogs/delete", { method: "POST", body: JSON.stringify({ id: log.id, reason: lyDo }) });
    load();
  };
  /* P5: Chỉ huy trưởng ký duyệt (hoặc mở khóa cho người lập sửa tiếp). */
  const duyet = async (log, co) => { await api("/api/sitelogs/approve", { method: "POST", body: JSON.stringify({ id: log.id, duyet: co }) }); load(); };
  const fmt = (d) => d ? d.split("-").reverse().join("/") : "";
  const printLog = (log) => {
    const w2 = window.open("", "_blank"); if (!w2) return;
    const esc = (x) => String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const row = (lb, val) => "<tr><td class=\"l\">" + esc(lb) + "</td><td>" + esc(val).replace(/\n/g, "<br>") + "</td></tr>";
    const html = "<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><title>Nhat ky " + esc(fmt(log.date)) + "</title>" +
      "<style>body{font-family:'Times New Roman',serif;font-size:13pt;color:#000;padding:24px;max-width:760px;margin:auto}h1{text-align:center;font-size:15pt;margin:6px 0}.c{text-align:center}.m{font-size:11pt}table{width:100%;border-collapse:collapse;margin-top:14px}td{border:1px solid #000;padding:6px 8px;vertical-align:top}td.l{width:34%;font-weight:bold;background:#f2f2f2}table.in{margin:0}table.in td,table.in th{border:1px solid #999;padding:3px 6px;font-size:11pt}table.in th{background:#fafafa;text-align:left}table.in td.n{text-align:right;width:70px}.sign{display:flex;justify-content:space-around;margin-top:40px;text-align:center}.sign div{width:45%}@media print{body{padding:0}}</style></head><body>" +
      "<div class=\"c m\">CÔNG TRÌNH: <b>" + esc(project.name) + "</b></div>" +
      "<h1>NHẬT KÝ THI CÔNG XÂY DỰNG</h1><div class=\"c m\">(Theo Nghị định 06/2021/NĐ-CP)</div><table>" +
      row("Ngày", fmt(log.date)) +
      row("Thời tiết", t.siteAM + ": " + (log.weatherAM || "—") + " · " + t.sitePM + ": " + (log.weatherPM || "—")
        + (log.thoiTiet ? ((log.thoiTiet.nhietDo ? " · " + log.thoiTiet.nhietDo : "")
            + (log.thoiTiet.gioMua ? " · mưa " + log.thoiTiet.gioMua + "h" : "")
            + (log.thoiTiet.gioNgungViec ? " · ngừng việc " + log.thoiTiet.gioNgungViec + "h" : "")) : "")) +
      /* P5: bảng nhân lực theo tổ đội, có dòng tổng */
      (log.nhanLuc && log.nhanLuc.length
        ? "<tr><td class=\"l\">Nhân lực</td><td><table class=\"in\"><tr><th>Tổ đội / nghề</th><th>Số người</th><th>Giờ</th></tr>"
          + log.nhanLuc.map((r) => "<tr><td>" + esc(r.to) + "</td><td class=\"n\">" + (r.soNguoi || 0) + "</td><td class=\"n\">" + (r.gio || "") + "</td></tr>").join("")
          + "<tr><td><b>Tổng</b></td><td class=\"n\"><b>" + log.nhanLuc.reduce((a2, r) => a2 + (Number(r.soNguoi) || 0), 0) + "</b></td><td></td></tr></table>"
          + (log.manpower ? "<div>" + esc(log.manpower).replace(/\n/g, "<br>") + "</div>" : "") + "</td></tr>"
        : row("Nhân lực", log.manpower || "")) +
      /* P5: bảng máy móc thiết bị */
      (log.thietBi && log.thietBi.length
        ? "<tr><td class=\"l\">Máy móc – thiết bị</td><td><table class=\"in\"><tr><th>Loại máy</th><th>SL</th><th>Giờ</th></tr>"
          + log.thietBi.map((r) => "<tr><td>" + esc(r.ten) + "</td><td class=\"n\">" + (r.soLuong || "") + "</td><td class=\"n\">" + (r.gio || "") + "</td></tr>").join("")
          + "</table>" + (log.equipment ? "<div>" + esc(log.equipment).replace(/\n/g, "<br>") + "</div>" : "") + "</td></tr>"
        : row("Thiết bị & vật tư", log.equipment || "")) +
      /* P5: khối lượng thi công trong ngày theo hạng mục */
      (log.khoiLuong && log.khoiLuong.length
        ? "<tr><td class=\"l\">Khối lượng thực hiện</td><td><table class=\"in\"><tr><th>Hạng mục</th><th>ĐVT</th><th>KL</th></tr>"
          + log.khoiLuong.map((r) => "<tr><td>" + esc(r.ten) + "</td><td class=\"n\">" + esc(r.donVi) + "</td><td class=\"n\">" + (r.kl || 0) + "</td></tr>").join("")
          + "</table>" + (log.work ? "<div>" + esc(log.work).replace(/\n/g, "<br>") + "</div>" : "") + "</td></tr>"
        : row("Công việc & khối lượng thực hiện", log.work || "")) +
      row("Vướng mắc ảnh hưởng tiến độ", log.issues || "") +
      /* P5: sự cố / mất an toàn tách riêng */
      (log.suCo && log.suCo.co
        ? row("SỰ CỐ / MẤT AN TOÀN (" + ({ nhe: "Nhẹ", trungbinh: "Trung bình", nghiemtrong: "Nghiêm trọng" }[log.suCo.mucDo] || "—") + ")",
              (log.suCo.moTa || "") + (log.suCo.khacPhuc ? "\nKhắc phục: " + log.suCo.khacPhuc : "") + (log.suCo.nguoiLienQuan ? "\nNgười liên quan: " + log.suCo.nguoiLienQuan : ""))
        : row("Sự cố / mất an toàn", "Không")) +
      (log.ykienGiamSat ? row("Ý kiến TVGS / Chủ đầu tư", log.ykienGiamSat) : "") +
      row("Kế hoạch ngày tiếp theo", log.nextPlan || "") +
      row("Số ảnh hiện trường kèm theo", (log.photos ? log.photos.length : 0)) +
      row("Người lập", log.createdBy || "") +
      row("Trạng thái", log.trangThai === "daduyet" ? ("Chỉ huy trưởng đã duyệt" + (log.duyetBoi ? " — " + log.duyetBoi : "") + (log.duyetLuc ? " (" + new Date(log.duyetLuc).toLocaleDateString("vi-VN") + ")" : "")) : log.trangThai === "danop" ? "Đã nộp, chờ duyệt" : "Nháp") +
      "</table><div class=\"sign\"><div>NGƯỜI LẬP<br><span class=\"m\">(Ký, ghi rõ họ tên)</span><br><br><br>" + esc(log.createdBy || "") + "</div><div>CHỈ HUY TRƯỞNG CÔNG TRÌNH<br><span class=\"m\">(Ký, ghi rõ họ tên)</span><br><br><br>" + esc(log.trangThai === "daduyet" ? (log.duyetBoi || "") : "") + "</div></div>" +
      "<script>window.onload=function(){setTimeout(function(){window.print();},200);}</script></body></html>";
    w2.document.write(html); w2.document.close();
  };
  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><ScrollText size={20} className="text-orange-500" />{t.constructionSite}</h2>
        <div className="flex items-center gap-2">
          {canManage && <button onClick={() => setAssignOpen(true)} className="text-sm text-slate-500 hover:text-orange-600 flex items-center gap-1"><UserCheck size={15} />{t.siteAssign}</button>}
          {canLog && <button onClick={() => setRacMo(true)} className="text-sm text-slate-500 hover:text-orange-600 flex items-center gap-1"><Trash2 size={15} />{t.recTrash}</button>}
          {canLog && <AntBtn type="primary" icon={<Plus size={16} />} onClick={() => setModal("new")}>{t.addSiteLog}</AntBtn>}
        </div>
      </div>
      {loading ? <p className="text-slate-500 text-sm">…</p> : logs.length === 0 ? (
        <div className="text-center text-slate-500 py-16"><ScrollText size={44} className="mx-auto mb-3 opacity-40" /><p className="text-slate-500">{t.siteNoLogs}</p></div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{fmt(log.date)}</span>
                    {/* P5: trạng thái ký duyệt */}
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={
                      log.trangThai === "daduyet" ? { color: "#166534", background: "#dcfce7" }
                      : log.trangThai === "danop" ? { color: "#9a3412", background: "#ffedd5" }
                      : { color: "#475569", background: "#f1f5f9" }}>
                      {log.trangThai === "daduyet" ? t.siteApproved : log.trangThai === "danop" ? t.siteSubmitted : t.siteDraft}
                    </span>
                    {log.suCo && log.suCo.co && <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ color: "#991b1b", background: "#fee2e2" }}>{t.incident}</span>}
                    {(log.weatherAM || log.weatherPM) && <span className="text-xs text-slate-500">{t.siteAM}: {log.weatherAM || "—"} · {t.sitePM}: {log.weatherPM || "—"}</span>}
                  </div>
                  {log.work && <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap break-words">{log.work}</p>}
                  {log.manpower && <p className="text-xs text-slate-500 mt-0.5">{t.siteManpower}: {log.manpower}</p>}
                  {log.equipment && <p className="text-xs text-slate-500">{t.siteEquip}: {log.equipment}</p>}
                  {log.issues && <p className="text-xs text-amber-600 mt-0.5">⚠ {log.issues}</p>}
                  {log.nextPlan && <p className="text-xs text-slate-500 mt-0.5">{t.siteNext}: {log.nextPlan}</p>}
                  <p className="text-xs text-slate-500 mt-1">{log.createdBy}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {canManage && (log.trangThai === "daduyet"
                    ? <button onClick={() => duyet(log, false)} className="text-xs text-slate-500 hover:text-orange-600 px-1.5 py-1 rounded border border-slate-200">{t.unlockLog}</button>
                    : <button onClick={() => duyet(log, true)} className="text-xs font-medium text-green-700 hover:bg-green-50 px-1.5 py-1 rounded border border-green-200">{t.approveLog}</button>)}
                  <button onClick={() => printLog(log)} className="text-xs font-semibold text-slate-500 hover:text-orange-500 px-1.5 py-1 rounded border border-slate-200" title="In PDF (NĐ 06/2021)">PDF</button>{canLog && <><button onClick={() => setModal(log)} className="text-slate-500 hover:text-orange-500 p-1"><Pencil size={15} /></button><button onClick={() => del(log)} className="text-slate-500 hover:text-red-500 p-1"><Trash2 size={15} /></button></>}</div>
              </div>
              {log.photos.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{log.photos.map((f) => <button key={f.idx} onClick={() => openPhoto(log, f)} className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 min-w-0" style={{ maxWidth: "100%" }}><Download size={14} className="text-slate-500 shrink-0" /><span className="truncate">{f.name}</span></button>)}</div>}
            </div>
          ))}
        </div>
      )}
      {modal && <SiteLogModal t={t} lang={lang} project={project} log={modal === "new" ? null : modal} boqItems={boqItems} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {assignOpen && <SiteAssignModal t={t} lang={lang} project={project} members={members} onClose={() => setAssignOpen(false)} onSave={(ids) => { onSetLoggers(ids); setAssignOpen(false); }} />}
      {racMo && <ThungRacHoSo t={t} lang={lang} project={project} loai="sitelogs" onClose={() => setRacMo(false)} onDoi={load} />}
    </div>
  );
}
/* U2: nén ảnh ngay trên máy/điện thoại trước khi tải lên.
   Ảnh máy ảnh điện thoại thường 3-8 MB; sau khi thu về cạnh dài ≤ 1600 px và JPEG chất
   lượng 0,8 còn khoảng 200-400 KB — tải nhanh hơn cả chục lần qua sóng ngoài công trường,
   vẫn đủ nét để đọc được biển báo / vết nứt. Tệp không phải ảnh (PDF...) giữ nguyên. */
const ANH_CANH_TOI_DA = 1600, ANH_CHAT_LUONG = 0.8;
async function nenAnh(file) {
  try {
    if (!file || !/^image\//.test(file.type) || /svg/.test(file.type)) return file;
    if (file.size < 300 * 1024) return file;                       // đã nhỏ thì thôi
    const bmp = await createImageBitmap(file);
    const tyLe = Math.min(1, ANH_CANH_TOI_DA / Math.max(bmp.width, bmp.height));
    if (tyLe === 1 && file.size < 1.5 * 1024 * 1024) { if (bmp.close) bmp.close(); return file; }
    const w = Math.round(bmp.width * tyLe), h = Math.round(bmp.height * tyLe);
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    cv.getContext("2d").drawImage(bmp, 0, 0, w, h);
    if (bmp.close) bmp.close();
    const blob = await new Promise((res) => cv.toBlob(res, "image/jpeg", ANH_CHAT_LUONG));
    if (!blob || blob.size >= file.size) return file;              // nén mà to hơn thì giữ bản gốc
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg", lastModified: Date.now() });
  } catch (e) { return file; }                                     // trình duyệt cũ -> gửi ảnh gốc
}
const kichCo = (b) => b < 1024 * 1024 ? Math.round(b / 1024) + " KB" : (b / 1024 / 1024).toFixed(1) + " MB";

/* U2: nút micro — đọc thành chữ (Web Speech API: Chrome/Edge; trình duyệt khác thì ẩn nút). */
function NutMicro({ lang, onText, title }) {
  const [dangNghe, setDangNghe] = useState(false);
  const refSR = useRef(null);
  useEffect(() => () => { try { if (refSR.current) refSR.current.stop(); } catch (e) {} }, []);
  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  if (!SR) return null;
  const bam = () => {
    if (dangNghe) { try { if (refSR.current) refSR.current.stop(); } catch (e) {} return; }
    const sr = new SR();
    sr.lang = lang === "vi" ? "vi-VN" : "en-US";
    sr.interimResults = false; sr.continuous = false;
    sr.onresult = (ev) => { const txt = Array.from(ev.results).map((r) => r[0].transcript).join(" ").trim(); if (txt) onText(txt); };
    sr.onend = () => setDangNghe(false);
    sr.onerror = () => setDangNghe(false);
    refSR.current = sr;
    try { sr.start(); setDangNghe(true); } catch (e) { setDangNghe(false); }
  };
  return (
    <button type="button" onClick={bam} title={title} aria-label={title}
      className={`shrink-0 rounded-lg border px-2 py-2 transition ${dangNghe ? "border-red-300 bg-red-50 text-red-600 animate-pulse" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
      <Mic size={15} />
    </button>
  );
}

/* P5: bảng nhập gọn cho hiện trường — thêm/xóa dòng, có dòng tổng.
   cot = [{key, nhan, kieu, rong}] · kieu: text | so */
function BangHienTruong({ t, cot, hang, onChange, themNhan, tong, readOnly }) {
  const doi = (i, k, v) => onChange(hang.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const xoa = (i) => onChange(hang.filter((_, j) => j !== i));
  const them = () => onChange([...hang, Object.fromEntries(cot.map((c) => [c.key, c.kieu === "so" ? 0 : ""]))]);
  return (
    <div className="space-y-1">
      {hang.length > 0 && (
        <div className="flex gap-1 text-[11px] text-slate-500 px-1">
          {cot.map((c) => <span key={c.key} style={{ flex: c.rong || 1 }}>{c.nhan}</span>)}
          {!readOnly && <span style={{ width: 22 }} />}
        </div>
      )}
      {hang.map((r, i) => (
        <div key={i} className="flex gap-1 items-center">
          {cot.map((c) => (
            <span key={c.key} style={{ flex: c.rong || 1 }}>
              <AntInput size="small" type={c.kieu === "so" ? "number" : "text"} disabled={readOnly}
                value={r[c.key] === 0 && c.kieu === "so" ? "" : r[c.key]}
                placeholder={c.nhan}
                onChange={(e) => doi(i, c.key, c.kieu === "so" ? (Number(e.target.value) || 0) : e.target.value)} />
            </span>
          ))}
          {!readOnly && <button onClick={() => xoa(i)} className="text-slate-400 hover:text-red-500 shrink-0" style={{ width: 22 }} aria-label={t.delete}><X size={13} /></button>}
        </div>
      ))}
      <div className="flex items-center gap-3">
        {!readOnly && <button onClick={them} className="text-sm text-orange-600 hover:underline flex items-center gap-1"><Plus size={13} />{themNhan}</button>}
        {tong != null && hang.length > 0 && <span className="text-xs text-slate-600 ml-auto">{t.total}: <b>{tong}</b></span>}
      </div>
    </div>
  );
}

/* H3: bảng theo dõi an toàn của dự án. Không đẻ thêm thực thể mới — tổng hợp lại từ
   nhật ký thi công (mục sự cố) và biên bản loại An toàn / Giấy phép làm việc. */
function HSEView({ t, lang, project }) {
  const [logs, setLogs] = useState(null);
  const [recs, setRecs] = useState([]);
  useEffect(() => {
    let huy = false;
    (async () => {
      const [a, b] = await Promise.all([
        api("/api/sitelogs?projectId=" + encodeURIComponent(project.id)),
        api("/api/records?projectId=" + encodeURIComponent(project.id)),
      ]);
      if (huy) return;
      setLogs(a.ok ? (a.body.logs || []) : []);
      setRecs(b.ok ? (b.body.records || []) : []);
    })();
    return () => { huy = true; };
  }, [project.id]);
  if (logs === null) return <div className="text-center py-16 text-slate-500 text-sm">{t.loading}</div>;

  const suCo = logs.filter((l) => l.suCo && l.suCo.co).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const ngayGanNhat = suCo.length ? suCo[0].date : null;
  const soNgayKhongTaiNan = (() => {
    if (!logs.length) return null;
    const moc = ngayGanNhat || logs.map((l) => l.date).sort()[0];
    if (!moc) return null;
    return Math.max(0, Math.round((today0() - new Date(moc + "T00:00:00")) / 86400000));
  })();
  const laAnToan = (r) => r.type === t.recSafetyType;
  const laGiayPhep = (r) => r.type === t.recPermitType;
  const tuanNay = (r) => { const d = new Date((r.date || "") + "T00:00:00"); return !isNaN(d) && (today0() - d) / 86400000 <= 7; };
  const toolbox = recs.filter(laAnToan);
  const giayPhep = recs.filter(laGiayPhep);
  const khongDat = (r) => (r.checklist || []).filter((x) => x.ketQua === "khongdat").length;

  const the = (nhan, so, mau, phu) => (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex-1 min-w-[150px]">
      <p className="text-2xl font-semibold" style={{ color: mau }}>{so}</p>
      <p className="text-xs text-slate-500 mt-0.5">{nhan}</p>
      {phu && <p className="text-xs text-slate-500">{phu}</p>}
    </div>
  );
  const fmtD = (d) => d ? d.split("-").reverse().join("/") : "—";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3">
        {the(t.hseDaysSafe, soNgayKhongTaiNan == null ? "—" : soNgayKhongTaiNan, soNgayKhongTaiNan > 30 ? "#16a34a" : "#ea580c",
             ngayGanNhat ? t.hseLastIncident + " " + fmtD(ngayGanNhat) : t.hseNoIncidentYet)}
        {the(t.hseIncidents, suCo.length, suCo.length ? "#dc2626" : "#64748b")}
        {the(t.hseToolbox, toolbox.filter(tuanNay).length, "#0ea5e9", t.hseThisWeek)}
        {the(t.hsePermits, giayPhep.length, "#f59e0b")}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">{t.hseIncidentLog}</h3>
        {suCo.length === 0 ? <p className="text-sm text-slate-500">{t.hseNoIncident}</p> : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {suCo.map((l) => (
              <div key={l.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{fmtD(l.date)}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{
                    color: l.suCo.mucDo === "nghiemtrong" ? "#991b1b" : l.suCo.mucDo === "trungbinh" ? "#9a3412" : "#475569",
                    background: l.suCo.mucDo === "nghiemtrong" ? "#fee2e2" : l.suCo.mucDo === "trungbinh" ? "#ffedd5" : "#f1f5f9" }}>
                    {l.suCo.mucDo === "nghiemtrong" ? t.incHigh : l.suCo.mucDo === "trungbinh" ? t.incMed : t.incLow}
                  </span>
                  <span className="text-xs text-slate-500">{l.createdBy}</span>
                </div>
                {l.suCo.moTa && <p className="text-sm text-slate-700 mt-1">{l.suCo.moTa}</p>}
                {l.suCo.khacPhuc && <p className="text-xs text-slate-600 mt-0.5"><b>{t.incFix}:</b> {l.suCo.khacPhuc}</p>}
                {l.suCo.nguoiLienQuan && <p className="text-xs text-slate-500 mt-0.5">{t.incWho}: {l.suCo.nguoiLienQuan}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">{t.hseChecks}</h3>
        {[...toolbox, ...giayPhep].length === 0 ? <p className="text-sm text-slate-500">{t.hseNoChecks}</p> : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {[...toolbox, ...giayPhep].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((r) => {
              const kd = khongDat(r);
              return (
                <div key={r.id} className="px-4 py-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-700 tabular-nums">{fmtD(r.date)}</span>
                  <span className="text-xs text-slate-500">{r.type}</span>
                  <span className="text-sm text-slate-700 flex-1 min-w-[40%] truncate">{r.note || r.number || "—"}</span>
                  {(r.checklist || []).length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={kd
                      ? { color: "#991b1b", background: "#fee2e2" }
                      : { color: "#166534", background: "#dcfce7" }}>
                      {kd ? t.chkFailN.replace("{n}", String(kd)) : t.chkPassAll}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">{r.createdBy}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">{t.hseHint}</p>
    </div>
  );
}

function SiteLogModal({ t, lang, project, log, boqItems, onClose, onSaved }) {
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
  const [dangNen, setDangNen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  /* P5: các mục có cấu trúc */
  const [thoiTiet, setThoiTiet] = useState((log && log.thoiTiet) || { nhietDo: "", gioMua: 0, gioNgungViec: 0 });
  const [nhanLuc, setNhanLuc] = useState((log && log.nhanLuc) || []);
  const [thietBi, setThietBi] = useState((log && log.thietBi) || []);
  const [khoiLuong, setKhoiLuong] = useState((log && log.khoiLuong) || []);
  const [suCo, setSuCo] = useState((log && log.suCo) || { co: false, mucDo: "", moTa: "", khacPhuc: "", nguoiLienQuan: "" });
  const [ykienGiamSat, setYkien] = useState((log && log.ykienGiamSat) || "");
  const trangThai = (log && log.trangThai) || "nhap";
  const daDuyet = trangThai === "daduyet";
  const tongNguoi = nhanLuc.reduce((a, r) => a + (Number(r.soNguoi) || 0), 0);
  const tongGioMay = thietBi.reduce((a, r) => a + (Number(r.gio) || 0), 0);
  const inp = "w-full mt-0.5 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400";
  const hasPhotos = (log && log.photos && log.photos.length > 0) || files.length > 0;
  /* U2: nén ngay khi chọn ảnh, để người dùng thấy dung lượng thật trước khi bấm Lưu. */
  const themAnh = async (fl) => {
    const arr = Array.from(fl || []); if (!arr.length) return;
    setDangNen(true);
    const nen = [];
    for (const f of arr) nen.push(await nenAnh(f));
    setFiles((cu) => [...cu, ...nen]);
    setDangNen(false);
  };
  const goc = (fl) => Array.from(fl || []).reduce((a, f) => a + f.size, 0);
  const tongAnh = files.reduce((a, f) => a + f.size, 0);
  const wBtn = (cur, set) => <div className="flex gap-1.5 mt-0.5">{[["", "—"], [t.wSun, t.wSun], [t.wRain, t.wRain]].map(([v, lbl]) => <button key={v} onClick={() => set(v)} className={`flex-1 text-xs py-1.5 rounded-lg border transition ${cur === v ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{lbl}</button>)}</div>;
  const submit = async (napLuon) => {
    if (busy) return;
    if (!work.trim() || !hasPhotos) { setErr(t.siteRequired); return; }
    setBusy(true); setErr("");
    const body = { id: log ? log.id : undefined, projectId: project.id, projectName: project.name, date,
      weatherAM: wAM, weatherPM: wPM, manpower, work, equipment, issues, nextPlan,
      thoiTiet, nhanLuc, thietBi, khoiLuong, suCo, ykienGiamSat, trangThai: napLuon ? "danop" : trangThai };
    const r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify(body) });
    if (!r.ok) { setErr(loiMayChu(r, t, t.siteRequired)); setBusy(false); return; }   // 409: ngày đã có nhật ký của người khác
    const lid = r.body.log.id;
    let anhLoi = 0;   // trước đây lỗi tải ảnh bị nuốt -> nhật ký lưu KHÔNG kèm ảnh mà không ai biết
    for (const f of files) {
      try {
        const tok = getToken();
        const up = await fetch("/api/sitelogs/photo?logId=" + lid + "&filename=" + encodeURIComponent(f.name), { method: "POST", headers: { ...(tok ? { Authorization: "Bearer " + tok } : {}), "Content-Type": f.type || "application/octet-stream" }, body: f });
        if (!up.ok) anhLoi++;
      } catch { anhLoi++; }
    }
    if (anhLoi) { setErr(t.sitePhotoFail.replace("{n}", String(anhLoi))); setBusy(false); return; }
    setBusy(false); onSaved();
  };
  return (
    <AntModal open onCancel={onClose} width={480}
      title={<span className="flex items-center gap-2"><ScrollText size={19} className="text-orange-500" />{t.constructionSite}</span>}
      footer={daDuyet ? <span className="text-sm text-slate-500">{t.siteLockedHint}</span> : (
        <span className="flex items-center gap-2 justify-end">
          <AntBtn loading={busy} onClick={() => submit(false)}>{t.saveDraft}</AntBtn>
          <AntBtn type="primary" loading={busy} onClick={() => submit(true)}>{t.submitLog}</AntBtn>
        </span>
      )}>
        <div className="space-y-3" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <label className="block"><span className="text-xs text-slate-500">{t.siteDate}</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} /></label>
          <div><span className="text-xs text-slate-500">{t.siteWeather} — {t.siteAM}</span>{wBtn(wAM, setWAM)}</div>
          <div><span className="text-xs text-slate-500">{t.siteWeather} — {t.sitePM}</span>{wBtn(wPM, setWPM)}</div>
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
            <span className="text-xs text-slate-500">{t.siteStatus}:</span>
            <span className="text-sm font-medium" style={{ color: daDuyet ? "#16a34a" : trangThai === "danop" ? "#ea580c" : "#64748b" }}>
              {daDuyet ? t.siteApproved : trangThai === "danop" ? t.siteSubmitted : t.siteDraft}
            </span>
            {daDuyet && log.duyetBoi && <span className="text-xs text-slate-500">· {log.duyetBoi}{log.duyetLuc ? " · " + new Date(log.duyetLuc).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US") : ""}</span>}
            {daDuyet && <span className="text-xs text-amber-600 flex items-center gap-1"><Lock size={11} />{t.siteLockedHint}</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="block"><span className="text-xs text-slate-500">{t.temp}</span><AntInput disabled={daDuyet} value={thoiTiet.nhietDo} onChange={(e) => setThoiTiet({ ...thoiTiet, nhietDo: e.target.value })} placeholder="28–34°C" /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.rainHours}</span><AntInput type="number" disabled={daDuyet} value={thoiTiet.gioMua || ""} onChange={(e) => setThoiTiet({ ...thoiTiet, gioMua: Number(e.target.value) || 0 })} /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.stopHours}</span><AntInput type="number" disabled={daDuyet} value={thoiTiet.gioNgungViec || ""} onChange={(e) => setThoiTiet({ ...thoiTiet, gioNgungViec: Number(e.target.value) || 0 })} /></label>
          </div>
          <div><span className="text-xs text-slate-500">{t.manpowerTable}</span>
            <BangHienTruong t={t} readOnly={daDuyet} hang={nhanLuc} onChange={setNhanLuc} themNhan={t.addCrew} tong={tongNguoi ? tongNguoi + " " + t.people : null}
              cot={[{ key: "to", nhan: t.crewName, kieu: "text", rong: 3 }, { key: "soNguoi", nhan: t.people, kieu: "so", rong: 1 }, { key: "gio", nhan: t.hours, kieu: "so", rong: 1 }]} />
          </div>
          <div><span className="text-xs text-slate-500">{t.equipTable}</span>
            <BangHienTruong t={t} readOnly={daDuyet} hang={thietBi} onChange={setThietBi} themNhan={t.addEquip} tong={tongGioMay ? tongGioMay + " " + t.hours : null}
              cot={[{ key: "ten", nhan: t.equipName, kieu: "text", rong: 3 }, { key: "soLuong", nhan: t.qty, kieu: "so", rong: 1 }, { key: "gio", nhan: t.hours, kieu: "so", rong: 1 }]} />
          </div>
          <div>
            <span className="text-xs text-slate-500">{t.qtyTable}</span>
            {boqItems && boqItems.length > 0 && !daDuyet && (
              <AntSelect size="small" style={{ width: "100%", marginTop: 2 }} value="" onChange={(v) => { const it = boqItems.find((x) => x.id === v); if (it) setKhoiLuong([...khoiLuong, { boqId: it.id, ten: it.ten, donVi: it.donVi, kl: 0 }]); }}
                options={[{ value: "", label: t.pickBoq }, ...boqItems.filter((x) => !khoiLuong.some((k) => k.boqId === x.id)).map((x) => ({ value: x.id, label: (x.stt ? x.stt + ". " : "") + x.ten }))]} />
            )}
            <BangHienTruong t={t} readOnly={daDuyet} hang={khoiLuong} onChange={setKhoiLuong} themNhan={t.addQty} tong={null}
              cot={[{ key: "ten", nhan: t.qtyItem, kieu: "text", rong: 3 }, { key: "donVi", nhan: t.unit, kieu: "text", rong: 1 }, { key: "kl", nhan: t.qtyToday, kieu: "so", rong: 1 }]} />
            <p className="text-xs text-slate-500 mt-0.5">{t.qtyHint}</p>
          </div>
          {[[t.siteManpower, manpower, setManpower, false], [t.siteWork + " *", work, setWork, true],
            [t.siteEquip, equipment, setEquipment, false], [t.siteIssues, issues, setIssues, false],
            [t.siteNext, nextPlan, setNextPlan, false]].map(([nhan, giaTri, dat]) => (
            <div key={nhan} className="block">
              <span className="text-xs text-slate-500">{nhan}</span>
              <div className="flex items-start gap-1.5 mt-0.5">
                <AntInput.TextArea value={giaTri} onChange={(e) => dat(e.target.value)} rows={2} style={{ flex: 1 }} />
                <NutMicro lang={lang} title={t.micHint} onText={(txt) => dat(giaTri ? giaTri + " " + txt : txt)} />
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!suCo.co} disabled={daDuyet} onChange={(e) => setSuCo({ ...suCo, co: e.target.checked })} className="accent-red-600" />
              <span className="text-sm font-medium text-red-700">{t.incident}</span>
            </label>
            {suCo.co && (
              <>
                <div className="flex gap-1.5">
                  {[["nhe", t.incLow], ["trungbinh", t.incMed], ["nghiemtrong", t.incHigh]].map(([k, nhan]) => (
                    <button key={k} disabled={daDuyet} onClick={() => setSuCo({ ...suCo, mucDo: k })}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition ${suCo.mucDo === k ? "border-red-300 bg-red-100 text-red-700 font-medium" : "border-slate-200 text-slate-500 bg-white hover:bg-slate-50"}`}>{nhan}</button>
                  ))}
                </div>
                <label className="block"><span className="text-xs text-slate-500">{t.incWhat}</span><AntInput.TextArea disabled={daDuyet} value={suCo.moTa} onChange={(e) => setSuCo({ ...suCo, moTa: e.target.value })} rows={2} /></label>
                <label className="block"><span className="text-xs text-slate-500">{t.incFix}</span><AntInput.TextArea disabled={daDuyet} value={suCo.khacPhuc} onChange={(e) => setSuCo({ ...suCo, khacPhuc: e.target.value })} rows={2} /></label>
                <label className="block"><span className="text-xs text-slate-500">{t.incWho}</span><AntInput disabled={daDuyet} value={suCo.nguoiLienQuan} onChange={(e) => setSuCo({ ...suCo, nguoiLienQuan: e.target.value })} /></label>
              </>
            )}
          </div>
          <label className="block"><span className="text-xs text-slate-500">{t.supervisorNote}</span>
            <AntInput.TextArea disabled={daDuyet} value={ykienGiamSat} onChange={(e) => setYkien(e.target.value)} rows={2} placeholder={t.supervisorNoteHint} /></label>
          <div>
            <span className="text-xs text-slate-500">{t.sitePhotos} *</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {/* U2: nút này mở THẲNG camera sau trên điện thoại (capture="environment") */}
              <label className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 cursor-pointer hover:bg-orange-100 transition">
                <Camera size={16} />{t.takePhoto}
                <input type="file" accept="image/*" capture="environment" multiple className="hidden"
                  onChange={(e) => { themAnh(e.target.files); e.target.value = ""; }} />
              </label>
              <label className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 cursor-pointer hover:bg-slate-50 transition">
                <Plus size={16} />{t.pickPhoto}
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { themAnh(e.target.files); e.target.value = ""; }} />
              </label>
            </div>
            {dangNen && <p className="text-xs text-orange-600 mt-1">{t.compressing}</p>}
            {files.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2 py-1">
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="tabular-nums shrink-0">{kichCo(f.size)}</span>
                    <button type="button" onClick={() => setFiles((c) => c.filter((_, k) => k !== i))} className="text-slate-500 hover:text-red-500" aria-label={t.delete}><X size={13} /></button>
                  </div>
                ))}
                <p className="text-xs text-slate-500">{files.length} {lang === "vi" ? "ảnh mới" : "new photos"} · {kichCo(tongAnh)}</p>
              </div>
            )}
            {log && log.photos && log.photos.length > 0 && <p className="text-xs text-slate-500 mt-1">{log.photos.length} {lang === "vi" ? "ảnh đã có" : "existing"}</p>}
          </div>
        </div>
        {err && <p className="text-sm text-red-500 mt-2">{err}</p>}
    </AntModal>
  );
}
/* A6: chọn ai được vào dự án này. Bỏ trống = cả công ty (như trước khi có tính năng). */
function ProjectMembersModal({ t, lang, project, members, onClose, onSave }) {
  const [sel, setSel] = useState(project.members || []);
  const toggle = (id) => setSel((pp) => pp.includes(id) ? pp.filter((x) => x !== id) : [...pp, id]);
  return (
    <AntModal open onCancel={onClose} width={420}
      title={<span className="flex items-center gap-2"><UserCheck size={18} className="text-orange-500" />{t.projMembers}</span>}
      footer={
        <span className="flex items-center gap-2 justify-end">
          {sel.length > 0 && <AntBtn onClick={() => setSel([])}>{t.projMembersOpen}</AntBtn>}
          <AntBtn type="primary" onClick={() => onSave(sel)}>{t.save}</AntBtn>
        </span>
      }>
      <p className="text-xs text-slate-500 mb-2">{sel.length === 0 ? t.projMembersHintOpen : t.projMembersHintLocked}</p>
      <div style={{ maxHeight: "50vh", overflowY: "auto" }} className="space-y-1">
        {members.map((m) => (
          <label key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <AntCheckbox checked={sel.includes(m.id)} onChange={() => toggle(m.id)} />
            <Avatar name={m.name} size={24} />
            <span className="text-sm text-slate-700 flex-1">{m.name}</span>
            {m.role === "owner" && <span className="text-xs text-slate-500">{t.roles.owner}</span>}
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">{t.projMembersNote}</p>
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
      <p className="text-xs text-slate-500 mb-2">{lang === "vi" ? "Chọn người được lập/sửa nhật ký cho dự án này." : "Pick who can create/edit logs for this project."}</p>
      <div style={{ maxHeight: "50vh", overflowY: "auto" }} className="space-y-1">
        {members.map((m) => <label key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"><AntCheckbox checked={sel.includes(m.id)} onChange={() => toggle(m.id)} /><Avatar name={m.name} size={24} /><span className="text-sm text-slate-700">{m.name}</span></label>)}
      </div>
    </AntModal>
  );
}

function SideItem({ active, onClick, icon, label, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${active ? "text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"}`} style={active ? { background: "#c2410c" } : undefined}>
      {icon}<span className="flex-1 text-left">{label}</span>{badge != null && <AntBadge count={badge} size="small" style={{ backgroundColor: active ? "#fff" : "#f97316", color: active ? "#f97316" : "#fff", boxShadow: "none", fontWeight: 600 }} />}
    </button>
  );
}
function Avatar({ name, size = 24, ring }) {
  if (!name) return <span className="rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0" style={{ width: size, height: size, fontSize: size * 0.42 }}>?</span>;
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
      {ids.length > 3 && <span className="text-xs text-slate-500 ml-1">+{ids.length - 3}</span>}
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
function DueBadge({ iso, lang, done }) {
  const m = dueMeta(iso, lang); if (!m) return null;
  /* Việc đã xong thì hạn chót chỉ còn là thông tin, không phải cảnh báo:
     không tô đỏ "Quá hạn" nữa, chỉ hiện ngày cho ai cần đối chiếu. */
  const mau = done ? "default" : m.overdue ? "error" : m.soon ? "warning" : "default";
  return <AntTag bordered={false} color={mau} icon={<Clock size={10} style={{ marginRight: 3 }} />} style={{ margin: 0, display: "inline-flex", alignItems: "center" }}>{done ? m.date || m.label : m.label}</AntTag>;
}
function CommentCount({ n }) { if (!n) return null; return <span className="inline-flex items-center gap-0.5 text-xs text-slate-500"><MessageSquare size={11} />{n}</span>; }
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
/* % của một nhóm việc, có trọng số theo thời lượng (việc 20 ngày nặng gấp 10 lần việc 2 ngày).
   Trước đây tiến độ chỉ là "số việc xong / tổng số việc" nên một giai đoạn dài coi như một việc nhỏ. */
function tienDoNhom(items) {
  let tong = 0, dat = 0;
  for (const x of items) {
    if (x.milestone) continue;   // mốc không có khối lượng công việc -> không tính trọng số
    const w = Math.max(1, Number(x.duration) || 1);
    tong += w;
    dat += w * (x.completed ? 100 : Math.max(0, Math.min(100, Number(x.workdone) || 0))) / 100;
  }
  return tong ? Math.round((dat / tong) * 100) : 0;
}
function NhanNhom({ t, name, wbs, items }) {
  const pct = tienDoNhom(items);
  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      {wbs && <span className="text-xs font-mono text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{wbs}</span>}
      <h3 className="font-semibold text-slate-700">{name}</h3>
      <span className="text-xs text-slate-500">{items.length}</span>
      {items.length > 0 && (
        <span className="flex items-center gap-1.5" title={t.groupPctHint}>
          <span className="h-1.5 w-20 rounded-full bg-slate-200 overflow-hidden"><span className="block h-full bg-orange-500" style={{ width: pct + "%" }} /></span>
          <span className="text-xs text-slate-600 tabular-nums">{pct}%</span>
        </span>
      )}
    </div>
  );
}
function ListView({ t, lang, canEdit, memberById, sections, groupBy, groupOf, tasks, blockedIds, onToggle, onOpenTask, onQuickAdd, onAddSection, onImport }) {
  const [adding, setAdding] = useState({});
  const [newSection, setNewSection] = useState(false);
  const [sectionName, setSectionName] = useState("");
  if (sections.length === 0) return <Empty t={t} />;
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {sections.map((sec) => {
        const items = tasks.filter((x) => (groupOf ? groupOf(x) : x.status) === sec.id).sort((a, b) => (a.completed - b.completed) || (a.order - b.order));
        if (groupBy === "section" && sec.id === "" && items.length === 0) return null;   // ẩn nhóm "Chưa xếp giai đoạn" khi rỗng
        return (
          <section key={sec.id || "_none"}>
            <NhanNhom t={t} name={sec.name} wbs={sec.wbs} items={items} />
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {items.map((task) => <TaskRow key={task.id} task={task} t={t} lang={lang} canEdit={canEdit} memberById={memberById} blocked={blockedIds && blockedIds.has(task.id)} onToggle={onToggle} onOpen={() => onOpenTask(task.id)} />)}
              {items.length === 0 && <div className="px-4 py-3 text-sm text-slate-500">{t.allTasksDone}</div>}
              {canEdit && (adding[sec.id] ? (
                <AntInput autoFocus placeholder={t.quickAdd} variant="borderless" style={{ padding: "8px 16px" }}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) { onQuickAdd(sec.id, e.target.value.trim()); e.target.value = ""; } if (e.key === "Escape") setAdding((a) => ({ ...a, [sec.id]: false })); }}
                  onBlur={() => setAdding((a) => ({ ...a, [sec.id]: false }))} />
              ) : (
                <button onClick={() => setAdding((a) => ({ ...a, [sec.id]: true }))} className="w-full px-4 py-2.5 text-sm text-slate-500 hover:text-orange-600 hover:bg-slate-50 text-left flex items-center gap-1.5 transition"><Plus size={15} />{t.addTask}</button>
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
    <div className="group flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition" onClick={onOpen}>
      <button onClick={(e) => { e.stopPropagation(); if (canEdit) onToggle(task.id, !task.completed); }} className="shrink-0" disabled={!canEdit}>
        {task.completed ? <CheckCircle2 size={19} className="text-green-500" /> : <Circle size={19} className={`text-slate-400 ${canEdit ? "group-hover:text-orange-400" : ""} transition`} />}
      </button>
      <span className={`flex-1 min-w-[55%] sm:min-w-0 text-sm truncate ${task.completed ? "line-through text-slate-500" : "text-slate-700"}`}>{task.title || <span className="italic text-slate-500">{t.untitled}</span>}</span>
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pl-8 sm:pl-0">
        <WorkBar v={task.workdone || 0} />
        <SubtaskBadge subtasks={task.subtasks} />
        <DepBadge blocked={blocked} />
        <CommentCount n={task.comments?.length} />
        {task.reminderLead ? <Bell size={13} className="text-amber-500" /> : null}
        {task.dueDate && <DueBadge iso={task.dueDate} lang={lang} done={task.completed || task.status === "done"} />}
        <PriorityFlag p={task.priority} t={t} />
        <AssigneeStack task={task} memberById={memberById} size={24} />
      </div>
    </div>
  );
}

/* ============================ BOARD VIEW ============================ */
function BoardView({ t, lang, canEdit, memberById, sections, groupBy, groupOf, tasks, blockedIds, onMove, onOpenTask, onQuickAdd, onAddSection }) {
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
          const items = tasks.filter((x) => (groupOf ? groupOf(x) : x.status) === sec.id).sort((a, b) => (a.completed - b.completed) || (a.order - b.order));
          if (groupBy === "section" && sec.id === "" && items.length === 0) return null;   // ẩn cột "Chưa xếp giai đoạn" khi rỗng
          return (
            <div key={sec.id || "_none"}
              onDragOver={(e) => { if (canEdit) { e.preventDefault(); setOverSec(sec.id); } }}
              onDragLeave={() => setOverSec((s) => (s === sec.id ? null : s))}
              onDrop={() => { if (dragId && canEdit) onMove(dragId, sec.id); setDragId(null); setOverSec(null); }}
              className={`w-72 shrink-0 bg-slate-100 rounded-xl flex flex-col max-h-full transition ${overSec === sec.id ? "ring-2 ring-orange-400 bg-orange-50/50" : ""}`}>
              <div className="px-3 pt-2.5 pb-0.5"><NhanNhom t={t} name={sec.name} wbs={sec.wbs} items={items} /></div>
              <div className="px-2 flex-1 overflow-y-auto space-y-2" style={{ minHeight: 40 }}>
                {items.map((task) => { const overdue = task.dueDate && !task.completed && new Date(task.dueDate + "T00:00:00") < today0(); return (
                  <div key={task.id} draggable={canEdit} onDragStart={() => setDragId(task.id)} onDragEnd={() => { setDragId(null); setOverSec(null); }}
                    onClick={() => onOpenTask(task.id)} style={overdue ? { borderLeft: "3px solid #ef4444" } : undefined} className={`bg-white rounded-xl border border-slate-200 shadow-sm p-3 cursor-pointer hover:shadow-md transition ${dragId === task.id ? "opacity-40" : ""}`}>
                    <div className="h-1.5 rounded-full mb-2.5" style={{ width: 46, background: (PRIORITY_META[task.priority] || PRIORITY_META.medium).color }} />
                    <p className={`text-sm font-medium ${task.completed ? "line-through text-slate-500" : "text-slate-700"}`}>{task.title || <span className="italic text-slate-500">{t.untitled}</span>}</p>
                    {task.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{task.tags.map((tag) => <AntTag key={tag} bordered={false} style={{ ...tagStyle(tag), margin: 0, borderRadius: 10 }}>{tag}</AntTag>)}</div>}
                    <div className="mt-2 flex items-center gap-2"><WorkBar v={task.workdone || 0} w={72} /><SubtaskBadge subtasks={task.subtasks} mini /><DepBadge blocked={blockedIds && blockedIds.has(task.id)} /></div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <PriorityFlag p={task.priority} t={t} />
                      {task.dueDate && <DueBadge iso={task.dueDate} lang={lang} done={task.completed || task.status === "done"} />}
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

/* H2: mẫu bảng kiểm nghiệm thu nội bộ theo công tác.
   Nội dung bám các mục kiểm tra thường gặp trên công trường dân dụng Việt Nam;
   người dùng sửa/thêm dòng thoải mái trước khi lưu. */
const MAU_KIEM = [
  { id: "copha", vi: "Nghiệm thu cốp pha", en: "Formwork check", items: [
    "Tim, cốt, kích thước hình học đúng bản vẽ",
    "Cốp pha kín khít, không hở chân, không mất nước xi măng",
    "Cây chống, giằng đủ số lượng, chân chống trên nền cứng",
    "Bề mặt cốp pha sạch, đã quét chống dính",
    "Sai lệch cho phép: tim ≤ 10 mm, cao độ ≤ 10 mm, độ thẳng đứng ≤ h/500",
    "Có lỗ chờ kỹ thuật (điện, nước) đúng vị trí"] },
  { id: "cotthep", vi: "Nghiệm thu cốt thép", en: "Rebar check", items: [
    "Chủng loại, đường kính, số lượng thanh đúng bản vẽ",
    "Khoảng cách cốt đai, vị trí nối chồng đúng quy định",
    "Chiều dài neo, chiều dài nối đủ theo thiết kế",
    "Con kê bảo vệ đủ, đúng chiều dày lớp bê tông bảo vệ",
    "Thép sạch, không gỉ nặng, không dính dầu mỡ",
    "Có chứng chỉ vật liệu / kết quả thí nghiệm thép"] },
  { id: "betong", vi: "Nghiệm thu bê tông", en: "Concrete check", items: [
    "Cấp phối / mác bê tông đúng thiết kế, có phiếu giao hàng",
    "Độ sụt kiểm tra tại hiện trường trong giới hạn cho phép",
    "Đã lấy mẫu thí nghiệm đúng số tổ mẫu quy định",
    "Đầm kỹ, không rỗ tổ ong, không phân tầng",
    "Mạch ngừng đúng vị trí thiết kế, đã xử lý bề mặt",
    "Có kế hoạch bảo dưỡng (tưới nước / phủ giữ ẩm) sau khi đổ"] },
  { id: "hoanthien", vi: "Nghiệm thu hoàn thiện", en: "Finishes check", items: [
    "Tường phẳng, không nứt chân chim, không rỗ",
    "Ốp lát đúng cao độ, mạch đều, không bộp",
    "Sơn đủ lớp, màu đồng đều, không loang",
    "Cửa đóng mở êm, khóa và phụ kiện đủ",
    "Chống thấm khu vệ sinh đã ngâm thử đạt",
    "Vệ sinh sạch, không còn vật liệu thừa"] },
  { id: "antoan", vi: "An toàn đầu giờ (toolbox talk)", en: "Toolbox talk", items: [
    "Đã họp an toàn đầu giờ, phổ biến công việc trong ngày",
    "Toàn bộ công nhân đội mũ, đeo dây an toàn khi làm trên cao",
    "Giày bảo hộ, găng tay, kính/mặt nạ đúng công việc",
    "Giàn giáo có lan can, sàn thao tác chắc chắn, chân đế ổn định",
    "Lỗ mở, hố sâu có che chắn và biển cảnh báo",
    "Dây điện thi công không ngâm nước, có aptomat chống giật",
    "Lối thoát hiểm, bình chữa cháy sẵn sàng",
    "Công nhân mới đã được huấn luyện an toàn trước khi vào ca"] },
  { id: "gianngiao", vi: "Kiểm tra giàn giáo / cốp pha treo", en: "Scaffold check", items: [
    "Chân giàn giáo đặt trên nền cứng, có đế kê",
    "Đủ giằng ngang, giằng chéo theo thiết kế",
    "Sàn thao tác kín, không kênh, không thiếu tấm",
    "Lan can bảo vệ đủ 2 thanh + tấm chặn chân",
    "Thang lên xuống cố định, không leo trèo tay",
    "Có thẻ kiểm tra ghi ngày và người kiểm tra"] },
  { id: "giayphep", vi: "Giấy phép làm việc nguy hiểm", en: "Permit to work", items: [
    "Đã xác định rõ vị trí, thời gian và phạm vi công việc",
    "Người thực hiện có chứng chỉ phù hợp (hàn, điện, trên cao…)",
    "Đã cắt điện / khóa van / treo biển cảnh báo (LOTO)",
    "Có người cảnh giới trong suốt thời gian làm việc",
    "Có bình chữa cháy và bạt chống văng xỉ tại chỗ (hàn cắt)",
    "Khu vực bên dưới đã rào chắn, cấm người qua lại",
    "Đã bàn giao hiện trường sạch sau khi kết thúc"] },
  { id: "mep", vi: "Nghiệm thu điện nước (MEP)", en: "MEP check", items: [
    "Đường ống nước đã thử áp, không rò rỉ",
    "Dây dẫn đúng tiết diện thiết kế, đúng màu quy ước",
    "Đã đo cách điện, tiếp địa đạt yêu cầu",
    "Thiết bị đúng chủng loại, đúng vị trí bản vẽ",
    "Ống luồn dây đầy đủ, có dây mồi",
    "Bản vẽ hoàn công cập nhật đúng thực tế"] },
];
const KET_QUA = ["dat", "khongdat", "na"];

/* ---- P2: phụ thuộc có LOẠI và ĐỘ TRỄ ----
   FS (Finish→Start, mặc định): việc sau bắt đầu sau khi việc trước xong.
   SS (Start→Start): hai việc chạy song song, cách nhau lag ngày.
   FF (Finish→Finish): việc sau phải xong sau việc trước lag ngày.
   SF (Start→Finish): hiếm, việc sau phải xong sau khi việc trước bắt đầu lag ngày.
   lag > 0 là chờ thêm; lag < 0 (lead) là chồng lấn.
   Dữ liệu cũ lưu chuỗi id -> hiểu là FS lag 0; ghi lại vẫn dùng chuỗi nếu vẫn là FS lag 0. */
const LOAI_PT = ["FS", "SS", "FF", "SF"];
const chuanDep = (d) => typeof d === "string"
  ? { id: d, type: "FS", lag: 0 }
  : { id: String((d && d.id) || ""), type: LOAI_PT.includes(d && d.type) ? d.type : "FS", lag: Math.round(Number(d && d.lag) || 0) };
const depsCua = (tk) => ((tk && tk.dependsOn) || []).map(chuanDep).filter((d) => d.id);
const idsPhuThuoc = (tk) => depsCua(tk).map((d) => d.id);
const nenDep = (d) => (d.type === "FS" && !d.lag) ? d.id : { id: d.id, type: d.type, lag: d.lag };

/* ---- P2: lịch làm việc của dự án ----
   ngayNghi: các thứ nghỉ hằng tuần (0 = Chủ nhật … 6 = Thứ Bảy). Mặc định nghỉ Chủ nhật.
   ngayLe:   danh sách ngày nghỉ cụ thể ("YYYY-MM-DD"), dùng cho lễ tết / ngày mưa nghỉ việc. */
const LICH_MAC_DINH = { ngayNghi: [0], ngayLe: [] };
const lichCua = (project) => {
  const L = (project && project.lich) || null;
  if (!L) return LICH_MAC_DINH;
  return { ngayNghi: Array.isArray(L.ngayNghi) ? L.ngayNghi.map(Number).filter((x) => x >= 0 && x <= 6) : [0],
           ngayLe: Array.isArray(L.ngayLe) ? L.ngayLe.filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)) : [] };
};

/* ============================ PUNCH LIST (lỗi tồn đọng) ============================ */
const MUC_DO = ["high", "med", "low"];
const MUC_DO_MAU = { high: "#dc2626", med: "#f59e0b", low: "#64748b" };
/* Vòng đời lỗi bám đúng luồng duyệt sẵn có của công việc, không đẻ thêm trạng thái mới. */
const trangThaiLoi = (tk) => tk.completed || tk.status === "done" ? "verified" : tk.status === "review" ? "fixed" : "open";

function DefectView({ t, lang, canEdit, memberById, members, defects, onAdd, onOpenTask }) {
  const [mo, setMo] = useState(false);
  const [locViTri, setLocViTri] = useState("");
  const [locNhaThau, setLocNhaThau] = useState("");
  const [locTrangThai, setLocTrangThai] = useState("");
  const [f, setF] = useState({ title: "", viTri: "", mucDo: "med", nhaThau: "", dueDate: "", description: "" });

  const viTris = [...new Set(defects.map((x) => (x.defect && x.defect.viTri) || "").filter(Boolean))].sort();
  const nhaThaus = [...new Set(defects.map((x) => (x.defect && x.defect.nhaThau) || "").filter(Boolean))].sort();
  const rows = defects.filter((x) => (!locViTri || (x.defect && x.defect.viTri) === locViTri)
    && (!locNhaThau || (x.defect && x.defect.nhaThau) === locNhaThau)
    && (!locTrangThai || trangThaiLoi(x) === locTrangThai));
  const dem = (tt) => defects.filter((x) => trangThaiLoi(x) === tt).length;
  const quaHan = defects.filter((x) => x.dueDate && trangThaiLoi(x) !== "verified" && new Date(x.dueDate + "T00:00:00") < today0()).length;

  const luu = () => { if (!f.title.trim()) return; onAdd(f); setMo(false); setF({ title: "", viTri: "", mucDo: "med", nhaThau: "", dueDate: "", description: "" }); };
  const the = (nhan, so, mau) => (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex-1 min-w-[130px]">
      <p className="text-2xl font-semibold" style={{ color: mau }}>{so}</p>
      <p className="text-xs text-slate-500 mt-0.5">{nhan}</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap gap-3 mb-4">
        {the(t.defectOpen, dem("open"), "#dc2626")}
        {the(t.defectFixed, dem("fixed"), "#f59e0b")}
        {the(t.defectVerified, dem("verified"), "#16a34a")}
        {the(t.defectOverdue, quaHan, quaHan ? "#dc2626" : "#64748b")}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <AntSelect value={locViTri} onChange={setLocViTri} style={{ minWidth: 150 }} options={[{ value: "", label: t.defectAllAreas }, ...viTris.map((v) => ({ value: v, label: v }))]} />
        <AntSelect value={locNhaThau} onChange={setLocNhaThau} style={{ minWidth: 160 }} options={[{ value: "", label: t.defectAllContractors }, ...nhaThaus.map((v) => ({ value: v, label: v }))]} />
        <AntSelect value={locTrangThai} onChange={setLocTrangThai} style={{ minWidth: 150 }} options={[{ value: "", label: t.defectAllStates }, { value: "open", label: t.defectOpen }, { value: "fixed", label: t.defectFixed }, { value: "verified", label: t.defectVerified }]} />
        <div className="flex-1" />
        {canEdit && <AntBtn type="primary" icon={<Plus size={16} />} onClick={() => setMo(true)}>{t.defectAdd}</AntBtn>}
      </div>

      {rows.length === 0 ? (
        <Empty2 icon={<ClipboardCheck size={44} />} text={t.defectNone} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 760 }}>
            <thead><tr className="bg-slate-50 text-left text-slate-600">
              <th className="px-3 py-2 font-medium">{t.defectArea}</th>
              <th className="px-3 py-2 font-medium">{t.defectDesc}</th>
              <th className="px-3 py-2 font-medium">{t.defectSeverity}</th>
              <th className="px-3 py-2 font-medium">{t.defectContractor}</th>
              <th className="px-3 py-2 font-medium">{t.dueDate}</th>
              <th className="px-3 py-2 font-medium">{t.statusLabel}</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((x) => {
                const tt = trangThaiLoi(x);
                const tre = x.dueDate && tt !== "verified" && new Date(x.dueDate + "T00:00:00") < today0();
                return (
                  <tr key={x.id} onClick={() => onOpenTask(x.id)} className="cursor-pointer hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-600">{(x.defect && x.defect.viTri) || "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{x.title || t.untitled}</td>
                    <td className="px-3 py-2"><span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: MUC_DO_MAU[(x.defect && x.defect.mucDo) || "med"], background: MUC_DO_MAU[(x.defect && x.defect.mucDo) || "med"] + "18" }}>{t.defectSev[(x.defect && x.defect.mucDo) || "med"]}</span></td>
                    <td className="px-3 py-2 text-slate-600">{(x.defect && x.defect.nhaThau) || "—"}</td>
                    <td className={`px-3 py-2 tabular-nums ${tre ? "text-red-600 font-medium" : "text-slate-600"}`}>{x.dueDate ? x.dueDate.split("-").reverse().join("/") : "—"}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        color: tt === "verified" ? "#166534" : tt === "fixed" ? "#92400e" : "#991b1b",
                        background: tt === "verified" ? "#dcfce7" : tt === "fixed" ? "#fef3c7" : "#fee2e2" }}>
                        {tt === "verified" ? t.defectVerified : tt === "fixed" ? t.defectFixed : t.defectOpen}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500 mt-3">{t.defectFlowHint}</p>

      {mo && (
        <AntModal open onCancel={() => setMo(false)} width={460} title={t.defectAdd}
          footer={<AntBtn type="primary" onClick={luu} disabled={!f.title.trim()}>{t.create}</AntBtn>}>
          <div className="space-y-3">
            <label className="block"><span className="text-xs text-slate-500">{t.defectDesc} *</span><AntInput autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={t.defectDescHint} /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.defectArea}</span><AntInput value={f.viTri} onChange={(e) => setF({ ...f, viTri: e.target.value })} placeholder={t.defectAreaHint} list="pm-vitri" /></label>
            <datalist id="pm-vitri">{viTris.map((v) => <option key={v} value={v} />)}</datalist>
            <div><span className="text-xs text-slate-500">{t.defectSeverity}</span>
              <div className="flex gap-1.5 mt-0.5">{MUC_DO.map((m) => (
                <button key={m} onClick={() => setF({ ...f, mucDo: m })} className={`flex-1 text-xs py-1.5 rounded-lg border transition ${f.mucDo === m ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{t.defectSev[m]}</button>
              ))}</div>
            </div>
            <label className="block"><span className="text-xs text-slate-500">{t.defectContractor}</span><AntInput value={f.nhaThau} onChange={(e) => setF({ ...f, nhaThau: e.target.value })} list="pm-nhathau" /></label>
            <datalist id="pm-nhathau">{nhaThaus.map((v) => <option key={v} value={v} />)}</datalist>
            <label className="block"><span className="text-xs text-slate-500">{t.defectDue}</span><input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} className="w-full mt-0.5 text-sm border border-slate-200 rounded-lg px-3 py-2" /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.description}</span><AntInput.TextArea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} /></label>
          </div>
        </AntModal>
      )}
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
    { label: t.statTotal, val: total, icon: <LayoutList size={20} />, c: "#ea580c" },
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
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs text-slate-500 flex items-center gap-1.5"><RefreshCw size={12} />{t.realtimeNote}</span>
        <AntSelect value={dashProject} onChange={(v) => setDashProject(v)} style={{ minWidth: 190 }} options={[{ value: "", label: t.allProjectsLabel }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5 min-w-0">
            <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.c + "1a", color: c.c }}>{c.icon}</span>
            <div className="text-3xl font-bold mt-3" style={{ color: c.c }}>{c.val}</div>
            <div className="text-sm text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 min-w-0">
          <h3 className="font-semibold mb-4">{t.chartStatus}</h3>
          {total === 0 ? <p className="text-sm text-slate-500">{t.nothingUpcoming}</p> : (
            <div className="flex flex-col items-center">
              <Donut segments={statusSegs} size={170} thickness={26} centerLabel={pct + "%"} centerSub={t.statDone} />
              <ChartLegend items={statusSegs} />
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 min-w-0">
          <h3 className="font-semibold mb-4">{t.chartByAssignee}</h3>
          {personRows.length === 0 ? <p className="text-sm text-slate-500">{t.nothingUpcoming}</p> : <HBars rows={personRows} lang={lang} t={t} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 min-w-0">
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 min-w-0">
          <h3 className="font-semibold mb-4">{t.upcoming}</h3>
          {upGroups.length === 0 ? <p className="text-sm text-slate-500">{t.nothingUpcoming}</p> : (
            <div className="space-y-4" style={{ maxHeight: 340, overflowY: "auto" }}>{upGroups.map((g) => (
              <div key={g.proj.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.proj.color }} />
                  <button onClick={() => onOpenProject(g.proj.id)} className="min-w-0 flex-1 text-left text-sm font-semibold text-slate-700 hover:text-orange-600 transition truncate">{g.proj.name}</button>
                  <span className="text-xs text-slate-500 shrink-0">{g.items.length}</span>
                </div>
                <div className="space-y-1 pl-3 ml-1 border-l-2" style={{ borderColor: g.proj.color + "55" }}>
                  {g.items.map((task) => { const sd = (task.subtasks || []).filter((s) => s.done).length; return (
                    <button key={task.id} onClick={() => onOpenTask(task.id)} className="w-full flex items-center gap-2.5 text-left p-2 -mx-2 rounded-lg hover:bg-slate-50 transition">
                      {task.completed ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> : <Circle size={14} className="text-slate-400 shrink-0" />}
                      <span className="flex-1 min-w-0 text-sm text-slate-700 truncate">{task.title || t.untitled}</span>
                      {(task.subtasks || []).length > 0 && <span className="text-xs text-slate-500 flex items-center gap-0.5 shrink-0"><ListChecks size={12} />{sd}/{task.subtasks.length}</span>}
                      <DueBadge iso={task.dueDate} lang={lang} done={task.completed || task.status === "done"} />
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
                <div className="flex items-center gap-2 mb-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} /><span className="text-sm font-medium text-slate-700 group-hover:text-orange-600 transition">{p.name}</span><span className="text-xs text-slate-500">{pd}/{ptasks.length}</span><span className="ml-auto text-xs font-medium text-slate-500">{ppct}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${ppct}%`, background: p.color }} /></div>
              </button>
            );
          })}
          {projects.length === 0 && <p className="text-sm text-slate-500">{t.welcomeHint}</p>}
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
      <div className="flex items-center gap-2 mb-2"><span className="w-2 h-2 rounded-full" style={{ background: color }} /><h3 className="font-semibold text-slate-700">{label}</h3><span className="text-xs text-slate-500">{items.length}</span></div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {items.map((task) => { const proj = projects.find((p) => p.id === task.projectId); const isPrimary = task.primaryAssigneeId === me?.id; return (
          <div key={task.id} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition" onClick={() => onOpenTask(task.id)}>
            {isPrimary ? <Star size={16} className="text-amber-500 shrink-0" fill="#f59e0b" /> : <span className="w-4 shrink-0" />}
            <span className="flex-1 min-w-0 text-sm text-slate-700 truncate">{task.title || t.untitled}</span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full" style={{ background: proj?.color }} />{proj?.name}</span>
            <WorkBar v={task.workdone || 0} />
            <DueBadge iso={task.dueDate} lang={lang} done={task.completed || task.status === "done"} /><PriorityFlag p={task.priority} t={t} />
          </div>); })}
      </div>
    </section>
  );
  const empty = mineAll.filter((x) => !x.completed).length === 0 && pendingApproval.length === 0;
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {!me && <p className="text-sm text-slate-500">{t.pickIdentity}</p>}
      {me && empty && <div className="text-center py-16 text-slate-500"><CheckCircle2 size={48} className="mx-auto mb-3 opacity-40" /><p className="text-lg font-medium text-slate-500">{t.allTasksDone}</p></div>}
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
          <p className="text-xs text-slate-500">{t.reportDeadlineNote}</p>
          {items.map((it) => { const tk = tasks.find((x) => x.id === it.taskId); const isPrim = tk && tk.primaryAssigneeId === currentUserId; return (
            <div key={it.id} className="rounded-lg border border-slate-200 p-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <AntSelect value={it.taskId} onChange={(v) => setItem(it.id, "taskId", v)} style={{ flex: 1 }} showSearch optionFilterProp="label"
                  options={[{ value: "", label: t.reportSel }, ...(projects || []).map((pr) => ({ label: pr.name, title: pr.name, options: myProjectTasks.filter((tk2) => tk2.projectId === pr.id).map((tk2) => ({ value: tk2.id, label: (tk2.title || t.untitled) })) })).filter((g) => g.options.length > 0)]} />
                {isPrim && <span className="text-xs text-amber-600 whitespace-nowrap flex items-center gap-0.5"><Star size={11} fill="#f59e0b" />{t.primary}</span>}
                <button onClick={() => removeLine(it.id)} className="text-slate-500 hover:text-red-500 p-1"><X size={15} /></button>
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
                  <span className="text-xs text-slate-500 shrink-0">{g.items.length} {lang === "vi" ? "việc" : "tasks"}</span>
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
        <div className="text-center text-slate-500 py-16"><CalendarDays size={44} className="mx-auto mb-3 opacity-40" /><p className="text-slate-500">{(isOwn ? (Date.now() > reportDeadline(selDate) ? t.reportMissing : t.reportNone) : t.reportMissing)}</p></div>
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
      <p className="text-xs text-slate-500">{lang === "vi" ? "🔒 Trao đổi riêng tư — chỉ bạn và người kia đọc được" : "🔒 Private thread — only you two can read"}</p>
      {threadIds.length === 0 && isOwner && <p className="text-xs text-slate-500">{lang === "vi" ? "Chưa có trao đổi." : "No messages yet."}</p>}
      {threadIds.map((rid) => {
        const thread = visible.filter((c) => c.reviewerId === rid);
        return (
          <div key={rid} className="rounded-xl bg-slate-50 p-2.5">
            {isOwner && <div className="text-xs font-semibold text-slate-500 mb-1.5">{nameOf(rid)}</div>}
            <div className="space-y-2 mb-2">
              {thread.map((c) => (
                <div key={c.id} className="flex gap-2"><Avatar name={c.author} size={22} /><div className="flex-1 min-w-0"><div className="flex items-baseline gap-2"><span className="text-sm font-medium text-slate-700">{c.author}</span><span className="text-xs text-slate-500">{relTime(c.ts, lang)}</span></div><p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{c.text}</p></div></div>
              ))}
              {thread.length === 0 && <p className="text-xs text-slate-500">—</p>}
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
              <button onClick={() => setEditId(null)} className="p-1 text-slate-500 hover:text-slate-600" title={t.cancel}><X size={15} /></button>
            </div>
          ) : (
            <div key={it.id} className="group flex items-center gap-2 text-xs">
              <span className="text-slate-500 tabular-nums shrink-0" style={{ width: 76 }}>{it.date}</span>
              <span className="font-medium text-slate-700 tabular-nums shrink-0" style={{ minWidth: 96 }}>{fmtMoney(it.amount, lang)}</span>
              <span className="flex-1 text-slate-500 truncate">{it.note}</span>
              <button onClick={() => startEdit(it)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-orange-500 shrink-0" title={t.edit}><Pencil size={12} /></button>
              <button onClick={() => onDelete(it.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 shrink-0" title={t.delete}><X size={13} /></button>
            </div>
          )
        ))}
        {(!items || items.length === 0) && <p className="text-xs text-slate-400">{t.none}</p>}
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
  const { modal: antModal } = AntApp.useApp();
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
          {link && <div className="text-xs text-slate-500 mt-0.5">{t.linkedInvestorContract}: {link.code}</div>}
          {c.note && <div className="text-xs text-slate-500 mt-0.5">{c.note}</div>}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500">{t.contractValue}</div>
          <div className="font-bold text-slate-800 tabular-nums">{fmtMoney(c.value, lang)}</div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={() => setEditing(true)} className="p-1 text-slate-500 hover:text-orange-500"><Pencil size={14} /></button>
          <button onClick={async () => { if (await askDanger(antModal, t, t.deleteContractConfirm)) onDelete(); }} className="p-1 text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function FinanceView({ t, lang, finance, projects, tasks, onChange, canEditFin = true }) {
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
    { label: t.sumInvValue, val: invValue, c: "#ea580c", icon: <Receipt size={18} /> },
    { label: t.sumBilled, val: billed, c: "#0ea5e9", icon: <Send size={18} /> },
    { label: t.sumReceived, val: received, c: "#10b981", icon: <TrendingUp size={18} /> },
    { label: t.sumToCollect, val: invValue - received, c: "#f59e0b", icon: <Banknote size={18} /> },
  ];
  const subCards = [
    { label: t.sumSubValue, val: subValue, c: "#ea580c", icon: <Receipt size={18} /> },
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
    { label: t.boqSumValue, val: boqVal, c: "#ea580c", icon: <Receipt size={18} /> },
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
            <span className="text-xs text-slate-500 whitespace-nowrap">{groups[pid].length} {t.contractItems}</span>
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

      {!canEditFin && <div className="text-xs rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-slate-600 flex items-center gap-1.5"><Lock size={12} />{t.finReadOnly}</div>}
      <AntTabs activeKey={tab} onChange={(k) => { setTab(k); setAdding(false); }} tabBarStyle={{ marginBottom: 0 }}
        items={[{ key: "investor", label: t.finTabInvestor }, { key: "sub", label: t.finTabSub }, { key: "boq", label: t.finTabBoq }, { key: "cost", label: t.finTabCost }, { key: "cashflow", label: t.finTabCashflow }]}
        tabBarExtraContent={(tab === "investor" || tab === "sub") ? <AntBtn type="primary" icon={<Plus size={15} />} onClick={() => setAdding((v) => !v)}>{tab === "investor" ? t.addContract : t.addSubContract}</AntBtn> : undefined} />

      {tab === "cashflow" && <CashflowTab inv={fInv} sub={fSub} t={t} lang={lang} />}
      {tab === "boq" && <BOQTab t={t} lang={lang} finance={finance} onChange={onChange} projects={projects} proj={proj} tasks={tasks || []} inv={inv} canEdit={canEditFin} />}
      {tab === "cost" && <CostTab t={t} lang={lang} finance={finance} onChange={onChange} projects={projects} proj={proj} canEdit={canEditFin} />}

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
              <div className="flex items-center justify-between text-xs"><span className="text-slate-500">{t.remaining}</span><span className="font-semibold tabular-nums text-slate-700">{fmtMoney((Number(c.value) || 0) - sumItems(c.paid), lang)}</span></div>
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
/* Đường cong S — % giá trị theo thời gian: KẾ HOẠCH lấy từ hạn chót các công việc
   liên kết với từng hạng mục (hạn muộn nhất = lúc hạng mục xong theo kế hoạch);
   THỰC HIỆN lấy từ giá trị lũy kế các kỳ nghiệm thu (theo ngày chốt kỳ). */
function BoqSCurve({ t, lang, items, kys, projTasks, totVal }) {
  if (!totVal) return null;
  const pts = (list) => list.filter((p) => p.d).sort((a, b) => a.d.localeCompare(b.d));
  // thực hiện: lũy kế theo kỳ
  let cum = 0;
  const actual = pts(kys.map((k) => {
    const v = items.filter((it) => !it.laNhom).reduce((s, it) => s + (Number((k.kl || {})[it.id]) || 0) * (Number(it.donGia) || 0), 0);
    cum += v; return { d: k.denNgay || "", pct: Math.min(150, cum / totVal * 100) };
  }));
  // kế hoạch: hạng mục xong khi công việc liên kết muộn nhất đến hạn
  const planRaw = items.filter((it) => !it.laNhom && (it.taskIds || []).length).map((it) => {
    const dues = projTasks.filter((x) => (it.taskIds || []).includes(x.id)).map((x) => x.dueDate).filter(Boolean);
    return dues.length ? { d: dues.sort()[dues.length - 1], v: (Number(it.khoiLuong) || 0) * (Number(it.donGia) || 0) } : null;
  }).filter(Boolean).sort((a, b) => a.d.localeCompare(b.d));
  let cumP = 0;
  const planned = planRaw.map((p) => { cumP += p.v; return { d: p.d, pct: Math.min(150, cumP / totVal * 100) }; });
  if (actual.length < 1 && planned.length < 2) return null;
  const dates = [...actual.map((p) => p.d), ...planned.map((p) => p.d)].sort();
  const d0 = Date.parse(dates[0]) - 5 * 86400000, d1 = Date.parse(dates[dates.length - 1]) + 5 * 86400000;
  const W = 640, H = 200, L = 40, B = 26, T = 12, R = 12;
  const X = (d) => L + (Date.parse(d) - d0) / (d1 - d0) * (W - L - R);
  const Y = (pct) => T + (1 - Math.min(pct, 110) / 110) * (H - T - B);
  const line = (ps, withStart) => (withStart ? [{ d: new Date(d0).toISOString().slice(0, 10), pct: 0 }, ...ps] : ps).map((p, i) => (i ? "L" : "M") + " " + X(p.d).toFixed(1) + " " + Y(p.pct).toFixed(1)).join(" ");
  const fmtD = (ms) => { const d = new Date(ms); return d.getDate() + "/" + (d.getMonth() + 1); };
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => d0 + (d1 - d0) * f);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
        <span className="text-sm font-semibold text-slate-700">{t.sCurveTitle}</span>
        {planned.length > 1 && <span className="text-xs text-slate-500 flex items-center gap-1.5"><svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" /></svg>{t.sPlanned}</span>}
        {actual.length > 0 && <span className="text-xs text-slate-500 flex items-center gap-1.5"><svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="#10b981" strokeWidth="2.5" /></svg>{t.sActual}</span>}
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", minWidth: 480, display: "block" }}>
          {[0, 25, 50, 75, 100].map((p) => (
            <g key={p}>
              <line x1={L} y1={Y(p)} x2={W - R} y2={Y(p)} stroke={p === 100 ? "#cbd5e1" : "#f1f5f9"} strokeWidth="1" strokeDasharray={p === 100 ? "4 3" : undefined} />
              <text x={L - 6} y={Y(p) + 3.5} textAnchor="end" fontSize="10" fill="#64748b">{p}%</text>
            </g>
          ))}
          {ticks.map((ms, i) => <text key={i} x={L + (W - L - R) * i / 4} y={H - 8} textAnchor="middle" fontSize="10" fill="#64748b">{fmtD(ms)}</text>)}
          {planned.length > 1 && <path d={line(planned, true)} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 4" />}
          {actual.length > 0 && <path d={line(actual, true)} fill="none" stroke="#10b981" strokeWidth="2.5" />}
          {actual.map((p, i) => <circle key={i} cx={X(p.d)} cy={Y(p.pct)} r="3.5" fill="#10b981"><title>{p.d.split("-").reverse().join("/") + " · " + Math.round(p.pct) + "%"}</title></circle>)}
        </svg>
      </div>
    </div>
  );
}

/* Q2: nhóm chi phí chuẩn cho công trình dân dụng. Người dùng thêm nhóm riêng thoải mái. */
const NHOM_CHI_PHI = [
  { id: "vattu", vi: "Vật tư", en: "Materials" },
  { id: "nhancong", vi: "Nhân công", en: "Labour" },
  { id: "may", vi: "Máy thi công", en: "Plant" },
  { id: "thauphu", vi: "Thầu phụ", en: "Subcontractors" },
  { id: "chung", vi: "Chi phí chung / quản lý", en: "Overheads" },
  { id: "khac", vi: "Khác", en: "Other" },
];

/* Q2: Ngân sách – Cam kết – Thực tế cho một dự án.
   Cam kết = tổng giá trị hợp đồng thầu phụ đã ký (tiền đã hứa chi, dù chưa trả).
   Thực tế = sổ chi phí nhập tay (ngày, nhóm, số tiền, chứng từ, nhà cung cấp). */
function CostTab({ t, lang, finance, onChange, projects, proj, canEdit }) {
  const [themMo, setThemMo] = useState(false);
  const [f, setF] = useState({ ngay: "", nhom: "vattu", moTa: "", soTien: "", chungTu: "", ncc: "" });
  const pid = proj || (projects[0] && projects[0].id) || "";
  const nganSach = ((finance.nganSach || {})[pid]) || {};
  const chiPhi = ((finance.chiPhi || {})[pid]) || [];
  const tenNhom = (id) => { const g = NHOM_CHI_PHI.find((x) => x.id === id); return g ? (lang === "vi" ? g.vi : g.en) : id; };

  const datNganSach = (nhom, v) => onChange({ ...finance, nganSach: { ...(finance.nganSach || {}), [pid]: { ...nganSach, [nhom]: Number(v) || 0 } } });
  const themChiPhi = () => {
    if (!f.ngay || !(Number(f.soTien) > 0)) return;
    onChange({ ...finance, chiPhi: { ...(finance.chiPhi || {}), [pid]: [...chiPhi, { id: uid(), ...f, soTien: Number(f.soTien) || 0 }] } });
    setF({ ngay: "", nhom: "vattu", moTa: "", soTien: "", chungTu: "", ncc: "" }); setThemMo(false);
  };
  const xoaChiPhi = (id) => onChange({ ...finance, chiPhi: { ...(finance.chiPhi || {}), [pid]: chiPhi.filter((x) => x.id !== id) } });

  /* Cam kết lấy từ hợp đồng thầu phụ của chính dự án này. */
  const camKetThauPhu = (finance.subContracts || []).filter((c) => c.projectId === pid).reduce((a, c) => a + (Number(c.value) || 0), 0);
  const thucTe = (nhom) => chiPhi.filter((x) => x.nhom === nhom).reduce((a, x) => a + (Number(x.soTien) || 0), 0);

  const tongNS = NHOM_CHI_PHI.reduce((a, g) => a + (Number(nganSach[g.id]) || 0), 0);
  const tongTT = chiPhi.reduce((a, x) => a + (Number(x.soTien) || 0), 0);
  /* Doanh thu ghi nhận = giá trị lũy kế đã nghiệm thu của BOQ dự án này. */
  const bq = ((finance.boq || {})[pid]) || { items: [], kys: [] };
  /* R11: chỉ tính dòng gốc và phát sinh ĐÃ DUYỆT — giống hệt cách tab BOQ tính, nếu không
     thì lãi gộp bị thổi lên bằng giá trị các VO còn đang chờ Chủ đầu tư duyệt.
     Kỳ đã khóa dùng đơn giá đã chốt (dgKhoa) theo R3. */
  const doanhThu = (bq.items || []).filter(voTinhTien).reduce((a, it) =>
    a + (bq.kys || []).reduce((s, k) => s + (Number((k.kl || {})[it.id]) || 0) * giaTrongKy(k, it), 0), 0);
  const laiGop = doanhThu - tongTT;

  if (!pid) return <Empty2 icon={<Wallet size={44} />} text={t.costPickProject} />;
  const the = (nhan, val, mau) => (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex-1 min-w-[150px]">
      <p className="text-lg font-semibold tabular-nums" style={{ color: mau }}>{fmtMoney(val, lang)}</p>
      <p className="text-xs text-slate-500 mt-0.5">{nhan}</p>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {the(t.costRevenue, doanhThu, "#0ea5e9")}
        {the(t.costBudget, tongNS, "#ea580c")}
        {the(t.costCommitted, camKetThauPhu, "#f59e0b")}
        {the(t.costActual, tongTT, "#dc2626")}
        {the(t.costGross, laiGop, laiGop >= 0 ? "#16a34a" : "#dc2626")}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 620 }}>
          <thead><tr className="bg-slate-50 text-left text-slate-600">
            <th className="px-3 py-2 font-medium">{t.costGroup}</th>
            <th className="px-3 py-2 font-medium text-right">{t.costBudget}</th>
            <th className="px-3 py-2 font-medium text-right">{t.costActual}</th>
            <th className="px-3 py-2 font-medium text-right">{t.costLeft}</th>
            <th className="px-3 py-2 font-medium text-right">%</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {NHOM_CHI_PHI.map((g) => {
              const ns = Number(nganSach[g.id]) || 0, tt = thucTe(g.id);
              const pct = ns > 0 ? Math.round(tt / ns * 100) : 0;
              return (
                <tr key={g.id}>
                  <td className="px-3 py-2 text-slate-700">{tenNhom(g.id)}</td>
                  <td className="px-3 py-1.5 text-right">
                    {canEdit
                      ? <AntInput size="small" type="number" value={ns || ""} onChange={(e) => datNganSach(g.id, e.target.value)} style={{ width: 130, textAlign: "right" }} />
                      : <span className="tabular-nums">{fmtMoney(ns, lang)}</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(tt, lang)}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: ns - tt < 0 ? "#dc2626" : undefined }}>{fmtMoney(ns - tt, lang)}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: pct > 100 ? "#dc2626" : undefined }}>{ns > 0 ? pct + "%" : "—"}</td>
                </tr>
              );
            })}
            <tr className="font-semibold bg-slate-50">
              <td className="px-3 py-2">{t.total}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(tongNS, lang)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(tongTT, lang)}</td>
              <td className="px-3 py-2 text-right tabular-nums" style={{ color: tongNS - tongTT < 0 ? "#dc2626" : undefined }}>{fmtMoney(tongNS - tongTT, lang)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{tongNS > 0 ? Math.round(tongTT / tongNS * 100) + "%" : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-700">{t.costLedger}</h3>
          <span className="text-xs text-slate-500">{chiPhi.length}</span>
          <div className="flex-1" />
          {canEdit && <AntBtn size="small" type="primary" icon={<Plus size={14} />} onClick={() => setThemMo(true)}>{t.costAdd}</AntBtn>}
        </div>
        {chiPhi.length === 0 ? <p className="text-sm text-slate-500">{t.costNone}</p> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 700 }}>
              <thead><tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-3 py-2 font-medium">{t.recDate}</th>
                <th className="px-3 py-2 font-medium">{t.costGroup}</th>
                <th className="px-3 py-2 font-medium">{t.description}</th>
                <th className="px-3 py-2 font-medium">{t.costSupplier}</th>
                <th className="px-3 py-2 font-medium">{t.costDoc}</th>
                <th className="px-3 py-2 font-medium text-right">{t.costAmount}</th>
                {canEdit && <th />}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {[...chiPhi].sort((a, b) => (b.ngay || "").localeCompare(a.ngay || "")).map((x) => (
                  <tr key={x.id}>
                    <td className="px-3 py-2 tabular-nums text-slate-600">{x.ngay ? x.ngay.split("-").reverse().join("/") : "—"}</td>
                    <td className="px-3 py-2 text-slate-600">{tenNhom(x.nhom)}</td>
                    <td className="px-3 py-2 text-slate-700">{x.moTa || "—"}</td>
                    <td className="px-3 py-2 text-slate-600">{x.ncc || "—"}</td>
                    <td className="px-3 py-2 text-slate-600">{x.chungTu || "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(x.soTien, lang)}</td>
                    {canEdit && <td className="px-2"><button onClick={() => xoaChiPhi(x.id)} className="text-slate-400 hover:text-red-500" aria-label={t.delete}><X size={14} /></button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {themMo && (
        <AntModal open onCancel={() => setThemMo(false)} width={440} title={t.costAdd}
          footer={<AntBtn type="primary" onClick={themChiPhi} disabled={!f.ngay || !(Number(f.soTien) > 0)}>{t.save}</AntBtn>}>
          <div className="space-y-3">
            <label className="block"><span className="text-xs text-slate-500">{t.recDate} *</span><input type="date" value={f.ngay} onChange={(e) => setF({ ...f, ngay: e.target.value })} className="w-full mt-0.5 text-sm border border-slate-200 rounded-lg px-3 py-2" /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.costGroup}</span><AntSelect value={f.nhom} onChange={(v) => setF({ ...f, nhom: v })} style={{ width: "100%", marginTop: 2 }} options={NHOM_CHI_PHI.map((g) => ({ value: g.id, label: lang === "vi" ? g.vi : g.en }))} /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.description}</span><AntInput value={f.moTa} onChange={(e) => setF({ ...f, moTa: e.target.value })} /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.costSupplier}</span><AntInput value={f.ncc} onChange={(e) => setF({ ...f, ncc: e.target.value })} /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.costDoc}</span><AntInput value={f.chungTu} onChange={(e) => setF({ ...f, chungTu: e.target.value })} placeholder="HĐ 0001234 / PC 05" /></label>
            <label className="block"><span className="text-xs text-slate-500">{t.costAmount} *</span><AntInput type="number" value={f.soTien} onChange={(e) => setF({ ...f, soTien: e.target.value })} /></label>
          </div>
        </AntModal>
      )}
      <p className="text-xs text-slate-500">{t.costHint}</p>
    </div>
  );
}

/* U5: gộp ba chiều theo id.
   goc    = bản đồng bộ gần nhất (điểm chung của hai bên)
   cuaToi = bản đang có trên máy tôi
   cuaHo  = bản mới nhất trên máy chủ
   Quy tắc: ai đổi thì lấy của người đó; cả hai cùng đổi một bản ghi thì NHƯỜNG MÁY CHỦ và
   trả bản ghi đó về trong xungDot để báo cho người dùng biết đúng chỗ nào cần nhập lại. */
function gopBaChieu(goc, cuaToi, cuaHo, keyOf) {
  const K = keyOf || ((x) => x.id);
  const bang = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const mGoc = new Map((goc || []).map((x) => [K(x), x]));
  const mToi = new Map((cuaToi || []).map((x) => [K(x), x]));
  const mHo = new Map((cuaHo || []).map((x) => [K(x), x]));
  const ra = new Map(mHo);                       // xuất phát từ sự thật của máy chủ
  const xungDot = [];
  for (const [id, toi] of mToi) {
    const g = mGoc.get(id), ho = mHo.get(id);
    if (g && bang(g, toi)) continue;             // tôi không đổi gì -> giữ bản máy chủ
    if (!ho) { if (!g) ra.set(id, toi); continue; }   // tôi tạo mới -> thêm; họ xóa mà tôi sửa -> tôn trọng việc xóa
    if (!g || bang(g, ho)) ra.set(id, toi);      // chỉ mình tôi đổi -> lấy bản của tôi
    else xungDot.push(toi);                      // cả hai cùng đổi -> nhường máy chủ
  }
  for (const [id, g] of mGoc) {                  // tôi xóa: chỉ xóa nếu họ không đụng vào
    if (mToi.has(id)) continue;
    const ho = mHo.get(id);
    if (ho && bang(ho, g)) ra.delete(id);
  }
  return { ket: [...ra.values()], xungDot };
}

/* Q5: công thức đề nghị thanh toán từ một kỳ nghiệm thu.
   Thứ tự đúng theo thông lệ hợp đồng xây dựng Việt Nam:
     1) giá trị thực hiện trong kỳ (chưa VAT)
     2) trừ giữ lại bảo hành (thường 5%)
     3) trừ khấu trừ tạm ứng (theo tỷ lệ tạm ứng đã nhận)
     4) cộng VAT tính trên phần còn lại sau khấu trừ  */
function tinhDeNghi({ giaTriKy, tlGiuLai, tlKhauTru, tlVAT }) {
  const gt = Number(giaTriKy) || 0;
  const giuLai = gt * (Number(tlGiuLai) || 0) / 100;
  const khauTru = gt * (Number(tlKhauTru) || 0) / 100;
  const truocVAT = gt - giuLai - khauTru;
  const vat = truocVAT * (Number(tlVAT) || 0) / 100;
  return { giaTriKy: gt, giuLai, khauTru, truocVAT, vat, tong: truocVAT + vat };
}

/* Q1: dòng BOQ phát sinh. voTrangThai: "" (gốc) | "dexuat" | "duyet" | "tuchoi".
   Chỉ dòng gốc và dòng phát sinh ĐÃ DUYỆT mới được tính vào giá trị hợp đồng. */
const VO_TT = { dexuat: { vi: "Đề xuất", en: "Proposed", mau: "#f59e0b" },
                duyet: { vi: "Đã duyệt", en: "Approved", mau: "#16a34a" },
                tuchoi: { vi: "Từ chối", en: "Rejected", mau: "#dc2626" } };
const laVO = (it) => !!it.voSo || !!it.voTrangThai;
const voTinhTien = (it) => !laVO(it) || it.voTrangThai === "duyet";
/* R3: kỳ đã khóa được máy chủ chụp lại đơn giá tại thời điểm khóa (dgKhoa). Giá trị kỳ đó
   phải tính theo bản chụp, để sửa đơn giá về sau không làm đổi con số đã nộp Chủ đầu tư. */
const giaTrongKy = (ky, it) => (ky && ky.khoa && ky.dgKhoa && ky.dgKhoa[it.id] != null)
  ? Number(ky.dgKhoa[it.id]) || 0
  : Number(it.donGia) || 0;

/* Q3: mở khóa một kỳ đã nộp phải ghi lý do — số liệu thanh toán không được sửa lặng lẽ. */
function hoiLyDoMoKhoa(antModal, t) {
  return new Promise((resolve) => {
    let lyDo = "";
    antModal.confirm({
      title: t.periodUnlock, okText: t.periodUnlock, cancelText: t.cancel, okButtonProps: { danger: true },
      content: (
        <div className="space-y-2 pt-1">
          <p className="text-sm text-slate-600">{t.periodUnlockWarn}</p>
          <AntInput autoFocus placeholder={t.periodUnlockReason} onChange={(e) => { lyDo = e.target.value; }} />
        </div>
      ),
      onOk: () => resolve(lyDo), onCancel: () => resolve(null),
    });
  });
}

/* Q5: Đề nghị thanh toán của một kỳ nghiệm thu. Lưu trong finance.deNghi[projectId][kyId]. */
function DeNghiThanhToan({ t, lang, finance, onChange, proj, ky, giaTriKy, canEdit }) {
  const tatCa = finance.deNghi || {};
  const cuaDA = tatCa[proj] || {};
  const dn = cuaDA[ky.id] || { tlGiuLai: 5, tlKhauTru: 0, tlVAT: 8, soHieu: "", ngay: "", ghiChu: "" };
  const dat = (patch) => onChange({ ...finance, deNghi: { ...tatCa, [proj]: { ...cuaDA, [ky.id]: { ...dn, ...patch } } } });
  const kq = tinhDeNghi({ giaTriKy, tlGiuLai: dn.tlGiuLai, tlKhauTru: dn.tlKhauTru, tlVAT: dn.tlVAT });
  const oSo = (nhan, key, hau) => (
    <label className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500 whitespace-nowrap">{nhan}</span>
      <AntInput size="small" type="number" disabled={!canEdit} value={dn[key] === 0 ? 0 : (dn[key] || "")}
        onChange={(e) => dat({ [key]: Number(e.target.value) || 0 })} style={{ width: 66 }} suffix={hau} />
    </label>
  );
  const dong = (nhan, val, mau, dam) => (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className={"text-sm " + (dam ? "font-semibold text-slate-700" : "text-slate-600")}>{nhan}</span>
      <span className={"tabular-nums " + (dam ? "text-base font-semibold" : "text-sm")} style={{ color: mau }}>{fmtMoney(val, lang)}</span>
    </div>
  );
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h3 className="text-sm font-semibold text-slate-700">{t.payReq} — {(lang === "vi" ? "Kỳ " : "IPC ") + ky.soKy}</h3>
        <label className="flex items-center gap-1.5"><span className="text-xs text-slate-500">{t.payReqNo}</span>
          <AntInput size="small" disabled={!canEdit} value={dn.soHieu || ""} onChange={(e) => dat({ soHieu: e.target.value })} style={{ width: 120 }} /></label>
        <label className="flex items-center gap-1.5"><span className="text-xs text-slate-500">{t.recDate}</span>
          <input type="date" disabled={!canEdit} value={dn.ngay || ""} onChange={(e) => dat({ ngay: e.target.value })} className="text-sm border border-slate-200 rounded px-1.5 py-0.5" /></label>
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-2">
        {oSo(t.payRetention, "tlGiuLai", "%")}
        {oSo(t.payAdvance, "tlKhauTru", "%")}
        {oSo(t.payVAT, "tlVAT", "%")}
      </div>
      <div className="divide-y divide-slate-100">
        {dong(t.payPeriodValue, kq.giaTriKy, "#0f172a")}
        {dong(t.payRetention + " (" + (dn.tlGiuLai || 0) + "%)", -kq.giuLai, "#dc2626")}
        {dong(t.payAdvance + " (" + (dn.tlKhauTru || 0) + "%)", -kq.khauTru, "#dc2626")}
        {dong(t.payBeforeVAT, kq.truocVAT, "#0f172a")}
        {dong(t.payVAT + " (" + (dn.tlVAT || 0) + "%)", kq.vat, "#0ea5e9")}
        {dong(t.payTotal, kq.tong, "#16a34a", true)}
      </div>
      <p className="text-xs text-slate-500 mt-2">{t.payHint}</p>
    </div>
  );
}

function BOQTab({ t, lang, finance, onChange, projects, proj, tasks, inv, canEdit = true }) {
  const { message: antMessage, modal: antModal } = AntApp.useApp();
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
        <p className="text-xs text-slate-500 mb-3">{t.boqPickProject}</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr className="text-xs text-slate-500 text-left">
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
  /* Q8: ô nhập trả về CHUỖI ("1.234,5"). Chuẩn hóa về số ngay khi ghi để cộng dồn không sai
     và để tệp dữ liệu không lẫn hai kiểu. Chuỗi rỗng giữ nguyên rỗng (nghĩa là "chưa nhập"). */
  const soHoa = (v) => (v === "" || v === null || v === undefined) ? "" : (typeof v === "number" ? v : num(v));
  const chuanHoaBoq = (nb) => ({
    ...nb,
    items: (nb.items || []).map((it) => ({ ...it, khoiLuong: soHoa(it.khoiLuong), donGia: soHoa(it.donGia) })),
    kys: (nb.kys || []).map((k) => ({ ...k, kl: Object.fromEntries(Object.entries(k.kl || {}).map(([id, v]) => [id, soHoa(v)])) })),
  });
  const write = (nb) => onChange({ ...finance, boq: { ...boqAll, [proj]: chuanHoaBoq(nb) } });
  const ky = kys.find((k) => k.id === kySel) || kys[kys.length - 1] || null;
  const kyIdx = ky ? kys.findIndex((k) => k.id === ky.id) : -1;
  const luyKeTruoc = (itemId) => kys.slice(0, kyIdx < 0 ? kys.length : kyIdx).reduce((s, k) => s + (Number((k.kl || {})[itemId]) || 0), 0);
  const klKyNay = (itemId) => (ky ? Number((ky.kl || {})[itemId]) || 0 : 0);
  const setKlKyNay = (itemId, v) => { if (!ky) return; write({ items, kys: kys.map((k) => k.id === ky.id ? { ...k, kl: { ...(k.kl || {}), [itemId]: v } } : k) }); };

  const addItem = () => write({ items: [...items, { id: uid(), stt: "", ten: "", donVi: "", laNhom: false, khoiLuong: "", donGia: "", taskIds: [] }], kys });
  /* Q1: thêm một dòng PHÁT SINH — mặc định ở trạng thái Đề xuất, chưa tính vào tổng. */
  const addVO = () => {
    const soVO = "VO-" + String(items.filter(laVO).length + 1).padStart(2, "0");
    write({ items: [...items, { id: uid(), stt: "", ten: "", donVi: "", laNhom: false, khoiLuong: "", donGia: "", taskIds: [], voSo: soVO, voTrangThai: "dexuat" }], kys });
  };
  const datVO = (id, patch) => write({ items: items.map((it) => it.id === id ? { ...it, ...patch } : it), kys });
  const updItem = (id, patch) => write({ items: items.map((it) => it.id === id ? { ...it, ...patch } : it), kys });
  const delItem = async (id) => { if (!(await askDanger(antModal, t, t.boqDeleteConfirm))) return;
    write({ items: items.filter((it) => it.id !== id), kys: kys.map((k) => { const kl = { ...(k.kl || {}) }; delete kl[id]; return { ...k, kl }; }) }); };
  const addKy = () => { const soKy = kys.length ? Math.max(...kys.map((k) => Number(k.soKy) || 0)) + 1 : 1;
    const nk = { id: uid(), soKy, denNgay: new Date().toISOString().slice(0, 10), kl: {} };
    write({ items, kys: [...kys, nk] }); setKySel(nk.id); };
  const delKy = async () => { if (!ky) return; if (!(await askDanger(antModal, t, (lang === "vi" ? "Xóa kỳ nghiệm thu " : "Delete period ") + "#" + ky.soKy + "?"))) return;
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

  const kyKhoa = !!(ky && ky.khoa);                                   // Q3: kỳ đã nộp CĐT thì khóa số
  const doiKhoa = async (co) => {
    if (!ky) return;
    if (!co) { const lyDo = await hoiLyDoMoKhoa(antModal, t); if (lyDo === null) return;
               write({ items, kys: kys.map((k) => k.id === ky.id ? { ...k, khoa: false, moKhoaLyDo: lyDo, moKhoaLuc: Date.now() } : k) }); return; }
    write({ items, kys: kys.map((k) => k.id === ky.id ? { ...k, khoa: true, khoaLuc: Date.now() } : k) });
  };

  const rows = items.filter((it) => !it.laNhom && voTinhTien(it));    // Q1: VO chưa duyệt không tính tiền
  const rowsVOCho = items.filter((it) => !it.laNhom && laVO(it) && it.voTrangThai !== "duyet");
  const giaTriVOCho = rowsVOCho.reduce((s, it) => s + (Number(it.khoiLuong) || 0) * (Number(it.donGia) || 0), 0);
  const totVal = rows.reduce((s, it) => s + (Number(it.khoiLuong) || 0) * (Number(it.donGia) || 0), 0);
  const totTruoc = rows.reduce((s, it) => s + luyKeTruoc(it.id) * (Number(it.donGia) || 0), 0);
  const totKyNay = rows.reduce((s, it) => s + klKyNay(it.id) * giaTrongKy(ky, it), 0);   // R3: kỳ khóa dùng đơn giá đã chốt
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

  // Xuất bảng nghiệm thu khối lượng của kỳ đang chọn (CSV mở được bằng Excel).
  // Cột khớp thói quen của importer CostManager: chỉ dòng có STT là dòng công tác.
  const exportKyCSV = () => {
    if (!ky) return;
    const esc = (v) => { let w = String(v == null ? "" : v); if (/^[=+\-@]/.test(w)) w = "'" + w; w = w.replace(/"/g, '""'); return /[",\n;]/.test(w) ? '"' + w + '"' : w; };
    const kyLabel = (lang === "vi" ? "KL kỳ " : "Period qty ") + ky.soKy;
    const header = lang === "vi"
      ? ["STT", "Tên công tác", "ĐVT", "KL hợp đồng", "Lũy kế kỳ trước", kyLabel, "Lũy kế đến kỳ này", "% KL"]
      : ["No.", "Work item", "Unit", "Contract qty", "Prev. cumulative", kyLabel, "Cumulative", "% Qty"];
    const lines = [header.map(esc).join(",")];
    items.forEach((it) => {
      if (it.laNhom) { lines.push([it.stt, it.ten, "", "", "", "", "", ""].map(esc).join(",")); return; }
      const lkTr = luyKeTruoc(it.id), kn = klKyNay(it.id), lk = lkTr + kn, klHd = Number(it.khoiLuong) || 0;
      lines.push([it.stt, it.ten, it.donVi, klHd || "", lkTr || "", kn || "", lk || "", klHd > 0 ? Math.round(lk / klHd * 100) + "%" : ""].map(esc).join(","));
    });
    const csv = "﻿" + lines.join("\r\n"); // BOM để Excel mở đúng tiếng Việt
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = ((projName(proj) || "BOQ") + " - nghiem thu ky " + ky.soKy + (ky.denNgay ? " - " + ky.denNgay : "") + ".csv").replace(/[\\/:*?"<>|]+/g, "_");
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {}
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
        <AntBtn size="small" icon={<Plus size={13} />} onClick={addKy} disabled={!canEdit}>{lang === "vi" ? "Kỳ mới" : "New period"}</AntBtn>
        {ky && !kyKhoa && <AntBtn size="small" danger onClick={delKy} disabled={!canEdit}>{t.delete}</AntBtn>}
        {ky && (kyKhoa
          ? <AntTag color="green" style={{ margin: 0 }}><Lock size={11} style={{ verticalAlign: "-1px" }} /> {t.periodLocked}</AntTag>
          : <AntBtn size="small" icon={<Lock size={13} />} onClick={() => doiKhoa(true)} disabled={!canEdit}>{t.periodLock}</AntBtn>)}
        {ky && kyKhoa && <AntBtn size="small" onClick={() => doiKhoa(false)} disabled={!canEdit}>{t.periodUnlock}</AntBtn>}
        <span className="ml-auto flex items-center gap-2">
          {ky && items.length > 0 && <AntTooltip title={t.boqExportKyTip}><AntBtn size="small" icon={<Download size={13} />} onClick={exportKyCSV}>{t.boqExportKy}</AntBtn></AntTooltip>}
          <AntBtn size="small" icon={<Inbox size={13} />} onClick={() => setImportOpen((v) => !v)}>{t.boqImport}</AntBtn>
          <AntBtn size="small" icon={<Plus size={13} />} onClick={addVO} disabled={!canEdit}>{t.voAdd}</AntBtn>
          <AntBtn size="small" type="primary" icon={<Plus size={13} />} onClick={addItem} disabled={!canEdit}>{t.boqAddItem}</AntBtn>
        </span>
      </div>

      {rowsVOCho.length > 0 && (
        <div className="text-xs rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-800">
          {t.voPending.replace("{n}", String(rowsVOCho.length))} <b className="tabular-nums">{fmtMoney(giaTriVOCho, lang)}</b> — {t.voPendingHint}
        </div>
      )}
      {kyKhoa && <div className="text-xs rounded-lg bg-green-50 border border-green-200 px-2.5 py-1.5 text-green-800">{t.periodLockedHint}</div>}
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

      {ky && rows.length > 0 && (
        <DeNghiThanhToan t={t} lang={lang} finance={finance} onChange={onChange} proj={proj}
          ky={ky} giaTriKy={totKyNay} canEdit={canEdit} />
      )}
      {items.length === 0 ? <Empty2 icon={<Receipt size={44} />} text={t.boqEmpty} /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: ky ? 1120 : 760 }}>
            <thead><tr className="text-xs text-slate-500 border-b border-slate-200">
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
                    {!it.laNhom && <button title={t.voToggle} onClick={() => datVO(it.id, laVO(it) ? { voSo: "", voTrangThai: "" } : { voSo: "VO-" + String(items.filter(laVO).length + 1).padStart(2, "0"), voTrangThai: "dexuat" })} style={{ padding: 3, color: laVO(it) ? "#f59e0b" : "#cbd5e1" }}><Receipt size={14} /></button>}
                    <button title={t.delete} onClick={() => delItem(it.id)} className="text-slate-500 hover:text-red-500" style={{ padding: 3 }}><Trash2 size={14} /></button>
                  </td>
                );
                if (it.laNhom) return (
                  <tr key={it.id} style={{ background: "#f8fafc" }} className="border-b border-slate-100">
                    <td style={{ padding: "4px 6px" }}><BoqTxt v={it.stt} onCh={(v) => updItem(it.id, { stt: v })} w={64} bold /></td>
                    <td style={{ padding: "4px 6px" }} colSpan={(ky ? 10 : 5) + 1}><BoqTxt v={it.ten} onCh={(v) => updItem(it.id, { ten: v })} w="100%" bold /></td>
                    {acts}
                  </tr>
                );
                const vo = laVO(it);
                const voMo = vo && it.voTrangThai !== "duyet";        // Q1: chưa duyệt -> làm mờ, không tính tiền
                return (
                  <tr key={it.id} className="border-b border-slate-50" style={voMo ? { opacity: 0.65, background: "#fffbeb" } : vo ? { background: "#f0fdf4" } : undefined}>
                    <td style={{ padding: "4px 6px" }}>
                      {vo
                        ? <BoqTxt v={it.voSo} onCh={(v) => datVO(it.id, { voSo: v })} w={64} bold />
                        : <BoqTxt v={it.stt} onCh={(v) => updItem(it.id, { stt: v })} w={64} />}
                    </td>
                    <td style={{ padding: "4px 6px", minWidth: 200 }}>
                      <BoqTxt v={it.ten} onCh={(v) => updItem(it.id, { ten: v })} w="100%" />
                      {vo && (
                        <span className="flex items-center gap-1 mt-0.5">
                          {["dexuat", "duyet", "tuchoi"].map((k) => (
                            <button key={k} onClick={() => canEdit && datVO(it.id, { voTrangThai: k })}
                              className="text-[10px] px-1.5 py-0.5 rounded border"
                              style={it.voTrangThai === k
                                ? { borderColor: VO_TT[k].mau, color: VO_TT[k].mau, background: VO_TT[k].mau + "18", fontWeight: 600 }
                                : { borderColor: "#e2e8f0", color: "#94a3b8" }}>
                              {lang === "vi" ? VO_TT[k].vi : VO_TT[k].en}
                            </button>
                          ))}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "4px 6px" }}><BoqTxt v={it.donVi} onCh={(v) => updItem(it.id, { donVi: v })} w={54} /></td>
                    <td style={{ padding: "4px 6px" }}><BoqNum v={it.khoiLuong} onCh={(v) => updItem(it.id, { khoiLuong: v })} w={86} /></td>
                    <td style={{ padding: "4px 6px" }}><BoqNum v={it.donGia} onCh={(v) => updItem(it.id, { donGia: v })} w={108} /></td>
                    {tdR(fmtMoney(klHd * dg, lang), "text-slate-700")}
                    {ky && <>
                      {tdR(fmtQty(lkTr), "text-slate-500")}
                      <td style={{ padding: "4px 6px", textAlign: "right" }}>
                        {kyKhoa || !canEdit
                          ? <span className="tabular-nums text-slate-600 pr-1">{fmtQty(kn)}</span>
                          : <BoqNum v={(ky.kl || {})[it.id]} onCh={(v) => setKlKyNay(it.id, v)} w={80} />}
                      </td>
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
                {tdR(fmtMoney(totTruoc, lang), "text-slate-500")}
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
      {items.length > 0 && <BoqSCurve t={t} lang={lang} items={items} kys={kys} projTasks={projTasks} totVal={totVal} />}
    </div>
  );
}

function NotifPanel({ t, lang, items, onOpen }) {
  const icon = (ty) => ty === "approve" ? <CheckCircle2 size={15} className="text-orange-500" /> : ty === "overdue" ? <AlertTriangle size={15} className="text-red-500" /> : <MessageSquare size={15} className="text-sky-500" />;
  return (
    <div style={{ width: 320, maxHeight: 380, overflowY: "auto" }}>
      <div className="text-sm font-semibold text-slate-700 px-1 pb-2">{lang === "vi" ? "Thông báo" : "Notifications"}</div>
      {items.length === 0 ? <p className="text-sm text-slate-500 px-1 py-6 text-center">{lang === "vi" ? "Không có thông báo." : "No notifications."}</p> :
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
  const { modal: antModal } = AntApp.useApp();
  return (
    <AntModal open onCancel={onClose} footer={null} width={520}
      title={<span className="flex items-center gap-2"><Trash2 size={18} className="text-orange-500" />{t.trashTitle}</span>}>
      <p className="text-xs text-slate-500 mb-3">{t.trashHint}</p>
      {(!trash || trash.length === 0) ? <Empty2 icon={<Trash2 size={40} />} text={t.trashEmpty} /> : (
        <div className="space-y-2" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {trash.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: e.kind === "task" ? "#f59e0b" : (e.project && e.project.color) || "#94a3b8" }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{e.name}</div>
                <div className="text-xs text-slate-500">{e.kind === "task" ? t.taskKind : ((e.tasks || []).length + " " + (lang === "vi" ? "công việc" : "tasks"))} · {new Date(e.deletedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US")}{e.deletedBy ? " · " + e.deletedBy : ""}</div>
              </div>
              <AntBtn size="small" onClick={() => onRestore(e.id)}>{t.restore}</AntBtn>
              {isOwner && <AntBtn size="small" danger onClick={async () => { if (await askDanger(antModal, t, t.deleteForever + " \"" + e.name + "\"?", t.deleteForever)) onPurge(e.id); }}>{t.deleteForever}</AntBtn>}
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
      <AntInput size="large" allowClear autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchAllPlaceholder} prefix={<Search size={16} className="text-slate-500" />} />
      {query && <p className="text-sm text-slate-500">{results.length} {t.resultsFound}</p>}
      {Object.keys(byProj).map((pid) => (
        <div key={pid}>
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b-2 border-orange-100"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: prj(pid).color || "#94a3b8" }} /><h4 className="text-sm font-bold text-slate-800 truncate flex-1">{prj(pid).name || "—"}</h4><span className="text-xs text-slate-500">{byProj[pid].length}</span></div>
          <div className="space-y-1.5">
            {byProj[pid].map((x) => (
              <button key={x.id} onClick={() => onOpenTask(x.id)} className="w-full text-left bg-white rounded-lg border border-slate-200 p-2.5 hover:border-orange-300 hover:bg-orange-50/30 transition">
                <div className="flex items-center gap-2"><span className={`flex-1 text-sm font-medium truncate ${x.completed ? "line-through text-slate-500" : "text-slate-700"}`}>{x.title || t.untitled}</span><WorkBar v={x.workdone || 0} w={48} /><PriorityFlag p={x.priority} t={t} /></div>
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
  return <div className="py-16"><AntEmpty image={AntEmpty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-500 text-sm">{text}</span>} /></div>;
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
          <text x={padL - 6} y={y(gv) + 3} textAnchor="end" fontSize="10" fill="#64748b">{fmtCompact(gv, lang)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = padL + gw * i + gw / 2;
        const inH = plotH * (d.in / yMax), outH = plotH * (d.out / yMax);
        return (
          <g key={d.ym}>
            <rect x={cx - bw - 1} y={y(d.in)} width={bw} height={inH} rx="2" fill="#10b981" />
            <rect x={cx + 1} y={y(d.out)} width={bw} height={outH} rx="2" fill="#ef4444" />
            {i % labelStep === 0 && <text x={cx} y={H - padB + 14} textAnchor="middle" fontSize="10" fill="#64748b">{d.label}</text>}
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
          <text x={padL - 6} y={y(gv) + 3} textAnchor="end" fontSize="10" fill="#64748b">{fmtCompact(gv, lang)}</text>
        </g>
      ))}
      <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="#cbd5e1" />
      <polygon points={area} fill="#f9731633" />
      <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="2" />
      {data.map((d, i) => (
        <g key={d.ym}>
          <circle cx={x(i)} cy={y(d.cum)} r="3" fill="#f97316" />
          {i % labelStep === 0 && <text x={x(i)} y={H - padB + 14} textAnchor="middle" fontSize="10" fill="#64748b">{d.label}</text>}
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
      {centerSub && <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="#64748b">{centerSub}</text>}
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
      {rows.length === 0 && <p className="text-xs text-slate-500">—</p>}
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
              <div className="text-xs text-slate-500 shrink-0" style={{ width: 150 }}>
                <span className="text-slate-600 font-medium">{open}</span> {t.tasksOpen} · <Star size={10} className="inline -mt-0.5 text-amber-500" fill="#f59e0b" />{primary}{overdue > 0 && <> · <span className="text-red-500">{overdue} {t.overdueTasks}</span></>}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-500">—</div>}
      </div>
    </div>
  );
}

/* ============================ TIMELINE (GANTT) ============================ */
const DAY_MS = 86400000;
/* Định dạng ngày theo LỊCH ĐỊA PHƯƠNG. Trước đây dùng toISOString (giờ UTC) nên ở
   Việt Nam (UTC+7) mọi lần kéo thanh Gantt đều rơi về TRƯỚC 1 ngày so với chỗ thả. */
function isoOf(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function parseISO(s) { return s ? new Date(s + "T00:00:00") : null; }
/* A1: một dòng Gantt. React.memo -> khi kéo thanh chỉ dòng đang kéo vẽ lại. */
const GanttRow = memo(function GanttRow({ it, top, t, lang, canEdit, memberById, min, PX, ROW, LABEL_W, daCuonNgang,
                                          critIn, slackIn, badIn, blIn, isDrag, dragMode, dragDelta, setDrag, onOpenTask }) {
          const delta = isDrag ? dragDelta : 0;
          const spanGap = Math.round((it.end - it.start) / DAY_MS);
          let startOff = Math.round((it.start - min) / DAY_MS);
          let span = spanGap + 1;
          if (isDrag) {
            if (dragMode === "left") { const dd = Math.min(delta, spanGap); startOff += dd; span -= dd; }
            else if (dragMode === "right") { span += Math.max(delta, -spanGap); }
            else startOff += delta;
          }
          const m = it.tk.primaryAssigneeId ? memberById[it.tk.primaryAssigneeId] : null;
          const wd = it.tk.workdone || 0;
          const critical = !!critIn && !it.tk.completed;
          const barColor = it.tk.completed ? "#10b981" : critical ? "#dc2626" : "#f97316";
          const slackDays = slackIn != null && !it.tk.completed ? slackIn : null;
          const depCount = depsCua(it.tk).length;
          const isBad = !!badIn;
          // kế hoạch gốc: thanh xám mảnh + số ngày lệch so với hạn gốc
          const bl = blIn || null;
          const blS = bl && parseISO(bl.s), blE = bl && parseISO(bl.e);
          const drift = blE ? Math.round((it.end - blE) / DAY_MS) : 0;
          const driftTxt = bl && drift !== 0 ? ((drift > 0 ? "+" : "") + drift + (lang === "vi" ? "ng " : "d ") + (drift > 0 ? t.baselineLate : t.baselineEarly) + " " + t.baselineDays) : "";
          const barTip = (critical ? t.criticalTip : (slackDays != null ? t.slackDays + ": " + slackDays + " " + t.daysUnit : "")) + (driftTxt ? " · " + driftTxt : "");
          return (
            <div className="flex items-center border-b border-slate-50" style={{ height: ROW, position: "absolute", top, left: 0, right: 0 }}>
              <div style={{ width: LABEL_W, position: "sticky", left: 0, zIndex: 7, background: "#fff",
                            boxShadow: daCuonNgang ? "6px 0 6px -4px rgba(15,23,42,.18)" : "none" }}
                   className="shrink-0 px-3 border-r border-slate-100 flex items-center gap-1.5">
                <button onClick={() => onOpenTask(it.tk.id)} className="text-sm text-slate-700 truncate hover:text-orange-600 text-left flex-1">{it.tk.milestone ? "◆ " : ""}{it.tk.title || t.untitled}</button>
                {critical && <span className="text-[10px] font-bold text-red-600 bg-red-50 rounded px-1 py-0.5 shrink-0">{t.criticalBadge}</span>}
                {bl && drift > 0 && <span title={driftTxt} className="text-[10px] font-bold shrink-0" style={{ color: "#dc2626" }}>+{drift}{lang === "vi" ? "ng" : "d"}</span>}
                {isBad && <span title={t.depViolation} className="text-red-500 shrink-0 flex items-center"><AlertTriangle size={13} /></span>}
                {depCount > 0 && <span title={t.waitingOn} className="text-xs text-amber-500 flex items-center shrink-0"><Network size={12} />{depCount}</span>}
              </div>
              <div className="relative flex-1" style={{ height: "100%" }}>
                {blS && blE && <div title={t.baselineLabel + ": " + bl.s.split("-").reverse().join("/") + " → " + bl.e.split("-").reverse().join("/")}
                  style={{ position: "absolute", left: Math.round((blS - min) / DAY_MS) * PX, width: Math.max((Math.round((blE - blS) / DAY_MS) + 1) * PX - 3, 8), top: 32, height: 4, borderRadius: 2, background: "#64748b", opacity: 0.85 }} />}
                {it.tk.milestone ? (
                  <div onMouseDown={(ev) => canEdit && setDrag({ id: it.tk.id, startX: ev.clientX, origStart: it.start, origEnd: it.end, deltaDays: 0, mode: "move" })}
                    onTouchStart={(ev) => canEdit && setDrag({ id: it.tk.id, startX: ev.touches[0].clientX, origStart: it.start, origEnd: it.end, deltaDays: 0, mode: "move" })}
                    onClick={() => { if (!isDrag) onOpenTask(it.tk.id); }}
                    title={t.milestone + ": " + (it.tk.title || t.untitled) + (barTip ? " · " + barTip : "")}
                    className="absolute flex items-center justify-center"
                    style={{ left: startOff * PX, width: PX, top: 9, height: 20, cursor: canEdit ? "grab" : "pointer", opacity: isDrag ? 0.8 : 1 }}>
                    <span style={{ width: 15, height: 15, transform: "rotate(45deg)", background: it.tk.completed ? "#16a34a" : barColor, borderRadius: 3, boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
                  </div>
                ) : (
                <div onMouseDown={(ev) => canEdit && setDrag({ id: it.tk.id, startX: ev.clientX, origStart: it.start, origEnd: it.end, deltaDays: 0, mode: "move" })}
                  onTouchStart={(ev) => canEdit && setDrag({ id: it.tk.id, startX: ev.touches[0].clientX, origStart: it.start, origEnd: it.end, deltaDays: 0, mode: "move" })}
                  onClick={() => { if (!isDrag) onOpenTask(it.tk.id); }}
                  title={barTip}
                  className="absolute rounded-md flex items-center px-2 gap-1 text-white shadow-sm"
                  style={{ left: startOff * PX, width: Math.max(span * PX - 3, 18), top: 7, height: 24, background: barColor, cursor: canEdit ? "grab" : "pointer", opacity: isDrag ? 0.8 : 1 }}>
                  <span className="absolute left-0 top-0 bottom-0 rounded-md" style={{ width: `${wd}%`, background: "rgba(255,255,255,0.25)" }} />
                  {m && <span className="relative"><Avatar name={m.name} size={16} /></span>}
                  <span className="relative text-xs truncate">{wd > 0 ? wd + "%" : ""}</span>
                  {/* tay cầm kéo giãn 2 mép: đổi ngày bắt đầu / hạn chót (đổi thời lượng) */}
                  {canEdit && <span
                    onMouseDown={(ev) => { ev.stopPropagation(); setDrag({ id: it.tk.id, startX: ev.clientX, origStart: it.start, origEnd: it.end, deltaDays: 0, mode: "left" }); }}
                    onTouchStart={(ev) => { ev.stopPropagation(); setDrag({ id: it.tk.id, startX: ev.touches[0].clientX, origStart: it.start, origEnd: it.end, deltaDays: 0, mode: "left" }); }}
                    onClick={(ev) => ev.stopPropagation()}
                    style={{ position: "absolute", left: -2, top: -3, bottom: -3, width: 9, cursor: "col-resize" }} />}
                  {canEdit && <span
                    onMouseDown={(ev) => { ev.stopPropagation(); setDrag({ id: it.tk.id, startX: ev.clientX, origStart: it.start, origEnd: it.end, deltaDays: 0, mode: "right" }); }}
                    onTouchStart={(ev) => { ev.stopPropagation(); setDrag({ id: it.tk.id, startX: ev.touches[0].clientX, origStart: it.start, origEnd: it.end, deltaDays: 0, mode: "right" }); }}
                    onClick={(ev) => ev.stopPropagation()}
                    style={{ position: "absolute", right: -2, top: -3, bottom: -3, width: 9, cursor: "col-resize" }} />}
                  {isDrag && dragMode !== "move" && <span className="relative text-xs font-semibold" style={{ marginLeft: "auto" }}>{span}{lang === "vi" ? "ng" : "d"}</span>}
                </div>
                )}
              </div>
            </div>
          );
});

function TimelineView({ t, lang, canEdit, tasks, visibleIds, memberById, project, canBaseline, onSaveBaseline, onSaveLich, onOpenTask, onReschedule }) {
  const [drag, setDrag] = useState(null); // {id, startX, origStart, origEnd, deltaDays, mode: "move"|"left"|"right"}
  /* P7: thang thời gian. "ngày" giữ như cũ; "tuần"/"tháng" thu nhỏ bề ngang để nhìn được
     cả dự án dài mà không phải cuộn ngang mãi. */
  const [zoom, setZoom] = useState(() => { try { return localStorage.getItem("pm_gantt_zoom") || "ngay"; } catch { return "ngay"; } });
  useEffect(() => { try { localStorage.setItem("pm_gantt_zoom", zoom); } catch {} }, [zoom]);
  const PX = zoom === "thang" ? 4 : zoom === "tuan" ? 10 : 26;
  const ROW = 38, LABEL_W = 224;
  const KHUNG_H = 560, DEM = 6;            // chiều cao khung nhìn biểu đồ + số dòng đệm trên/dưới
  const [cuon, setCuon] = useState(0);     // vị trí cuộn dọc -> chỉ vẽ dòng đang nhìn thấy (ảo hóa)
  const [daCuonNgang, setDaCuonNgang] = useState(false);   // đã cuộn ngang chưa -> đổ bóng mép cột nhãn

  // (hooks phải chạy trước mọi early-return — bản cũ đặt effect sau return khi rỗng, vi phạm rules of hooks)
  useEffect(() => {
    if (!drag) return;
    const move = (ev) => { const dx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - drag.startX; setDrag((d) => d ? { ...d, deltaDays: Math.round(dx / PX) } : d); };
    const up = () => {
      setDrag((d) => {
        if (d && d.deltaDays) {
          const spanGap = Math.round((d.origEnd - d.origStart) / DAY_MS); // số ngày giữa bắt đầu và hạn
          let ns = d.origStart, ne = d.origEnd;
          if (d.mode === "left") { const dd = Math.min(d.deltaDays, spanGap); ns = new Date(d.origStart.getTime() + dd * DAY_MS); }        // đổi ngày bắt đầu, không vượt qua hạn
          else if (d.mode === "right") { const dd = Math.max(d.deltaDays, -spanGap); ne = new Date(d.origEnd.getTime() + dd * DAY_MS); }   // đổi hạn, không lùi trước ngày bắt đầu
          else { ns = new Date(d.origStart.getTime() + d.deltaDays * DAY_MS); ne = new Date(d.origEnd.getTime() + d.deltaDays * DAY_MS); } // dời cả thanh
          onReschedule(d.id, isoOf(ns), isoOf(ne));
        }
        return null;
      });
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move); window.addEventListener("touchend", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
  }, [drag, onReschedule]);

  const baseline = (project && project.baseline && project.baseline.tasks) || null;

  /* A1: CPM + khung thời gian chỉ phụ thuộc DỮ LIỆU việc, không phụ thuộc thao tác kéo.
     Đưa vào useMemo nên kéo thanh không còn tính lại đường găng mỗi khung hình.
     allItems = TOÀN BỘ việc của dự án (đường găng phải đúng dù đang bật bộ lọc — lỗi B4).  */
  const lich = useMemo(() => lichCua(project), [project]);
  const nen = useMemo(() => {
    const allItems = tasks.map((tk) => {
      let s = parseISO(tk.startDate) || parseISO(tk.dueDate);
      let e = parseISO(tk.dueDate) || parseISO(tk.startDate);
      if (!s || !e) return null;
      if (e < s) e = s;
      return { tk, start: s, end: e };
    }).filter(Boolean).sort((a, b) => (a.start - b.start) || (a.end - b.end) || String(a.tk.title || "").localeCompare(String(b.tk.title || "")));
    if (!allItems.length) return null;

    let min = allItems[0].start, max = allItems[0].end;
    allItems.forEach((it) => { if (it.start < min) min = it.start; if (it.end > max) max = it.end; });
    if (baseline) for (const id in baseline) { const b = baseline[id]; const bs = parseISO(b.s), be = parseISO(b.e); if (bs && bs < min) min = bs; if (be && be > max) max = be; }
    min = new Date(min.getTime() - 2 * DAY_MS); max = new Date(max.getTime() + 3 * DAY_MS);
    const totalDays = Math.round((max - min) / DAY_MS) + 1;
    const dayOf = (d) => Math.round((d - min) / DAY_MS);

    /* ---- CPM (Critical Path Method) trên lịch thực tế ----
       ES = muộn nhất giữa ngày bắt đầu tự đặt và lúc các việc phụ thuộc xong (ràng buộc "không sớm hơn").
       Dự trữ (slack) = LS - ES. Slack = 0 => nằm trên ĐƯỜNG GĂNG: trễ 1 ngày là cả dự án trễ 1 ngày. */
    /* P2: trục NGÀY LÀM VIỆC. lamViec[k] = ngày lịch thứ k (tính từ min) có làm không.
       viTri[k] = số ngày làm việc trước mốc k -> đổi ngày lịch sang toạ độ ngày làm việc.
       Nhờ vậy Chủ nhật / ngày lễ không còn được tính là ngày thi công khi tìm đường găng. */
    const nghiTuan = new Set(lich.ngayNghi);
    const ngayLe = new Set(lich.ngayLe);
    const lamViec = new Array(totalDays + 2).fill(true);
    const viTri = new Array(totalDays + 3).fill(0);
    for (let k = 0; k <= totalDays + 1; k++) {
      const d = new Date(min.getTime() + k * DAY_MS);
      const isoNgay = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      lamViec[k] = !nghiTuan.has(d.getDay()) && !ngayLe.has(isoNgay);
      viTri[k + 1] = viTri[k] + (lamViec[k] ? 1 : 0);
    }
    const wOf = (k) => viTri[Math.max(0, Math.min(totalDays + 1, k))];        // ngày lịch -> toạ độ ngày làm việc
    const soNgayLam = (a, b) => Math.max(1, wOf(b + 1) - wOf(a));             // số ngày LÀM VIỆC trong [a, b]

    const nodeById = {};
    allItems.forEach((it, i) => {
      const a = dayOf(it.start), b = dayOf(it.end);
      /* R12: mốc (milestone) là một thời điểm, không tiêu tốn ngày công — để dur = 0 thì
         việc phụ thuộc vào mốc không bị đẩy lùi thêm 1 ngày. */
      nodeById[it.tk.id] = { i, startDay: a, endDay: b, startW: wOf(a),
                             dur: it.tk.milestone ? 0 : soNgayLam(a, b), deps: [] };
    });
    allItems.forEach((it) => { nodeById[it.tk.id].deps = depsCua(it.tk).filter((d) => nodeById[d.id]); });
    const succ = {}; Object.keys(nodeById).forEach((id) => { succ[id] = []; });
    Object.keys(nodeById).forEach((id) => nodeById[id].deps.forEach((d) => succ[d.id].push({ id, type: d.type, lag: d.lag })));
    const indeg = {}; Object.keys(nodeById).forEach((id) => { indeg[id] = nodeById[id].deps.length; });
    const topo = []; const tq = Object.keys(nodeById).filter((id) => !indeg[id]);
    while (tq.length) { const id = tq.shift(); topo.push(id); for (const sc of succ[id]) if (--indeg[sc.id] === 0) tq.push(sc.id); }
    const hasCycle = topo.length !== allItems.length; // có phụ thuộc vòng tròn -> bỏ tính đường găng, chỉ cảnh báo
    const es = {}, ef = {}, ls = {}, lf = {}, slackOf = {}; const violated = new Set();
    if (!hasCycle) {
      /* Ràng buộc sớm nhất, viết về dạng "ES của việc sau ≥ ..." (đơn vị: ngày làm việc):
         FS: ES_sau ≥ EF_truoc + lag   ·   SS: ES_sau ≥ ES_truoc + lag
         FF: EF_sau ≥ EF_truoc + lag   ·   SF: EF_sau ≥ ES_truoc + lag                       */
      const rangBuoc = (d, dur) => {
        const p = nodeById[d.id];
        if (d.type === "SS") return es[d.id] + d.lag;
        if (d.type === "FF") return ef[d.id] + d.lag - dur;
        if (d.type === "SF") return es[d.id] + d.lag - dur;
        return ef[d.id] + d.lag;                                    // FS
      };
      for (const id of topo) {
        const nd = nodeById[id];
        const somNhat = nd.deps.length ? Math.max(...nd.deps.map((d) => rangBuoc(d, nd.dur))) : -Infinity;
        es[id] = Math.max(nd.startW, somNhat === -Infinity ? 0 : somNhat);
        ef[id] = es[id] + nd.dur;
        // lịch đang đặt có vi phạm ràng buộc không (dùng ngày THẬT chứ không phải ngày sớm nhất)
        for (const d of nd.deps) {
          const p = nodeById[d.id];
          const viPham = d.type === "SS" ? nd.startW < p.startW + d.lag
            : d.type === "FF" ? nd.startW + nd.dur < p.startW + p.dur + d.lag
            : d.type === "SF" ? nd.startW + nd.dur < p.startW + d.lag
            : nd.startW < p.startW + p.dur + d.lag;                 // FS
          if (viPham) { violated.add(id); break; }
        }
      }
      const projEnd = Math.max(...Object.values(ef));
      /* Ràng buộc muộn nhất: đảo ngược đúng 4 công thức trên. */
      for (const id of [...topo].reverse()) {
        const dur = nodeById[id].dur;
        const ss = succ[id];
        ls[id] = ss.length ? Math.min(...ss.map((sc) => sc.type === "SS" ? ls[sc.id] - sc.lag
          : sc.type === "FF" ? ls[sc.id] + nodeById[sc.id].dur - dur - sc.lag
          : sc.type === "SF" ? ls[sc.id] + nodeById[sc.id].dur - sc.lag
          : ls[sc.id] - dur - sc.lag)) : projEnd - dur;              // FS
        lf[id] = ls[id] + dur;
        slackOf[id] = ls[id] - es[id];
      }
    }

    /* P7: mốc thời gian theo mức phóng — ngày: mỗi tuần một mốc; tuần: 2 tuần; tháng: đầu tháng. */
    const ticks = [];
    if (zoom === "thang") {
      let c2 = new Date(min.getFullYear(), min.getMonth(), 1);
      while (c2 <= max) { const off = Math.round((c2 - min) / DAY_MS); if (off >= 0) ticks.push({ off, label: (c2.getMonth() + 1) + "/" + String(c2.getFullYear()).slice(2) }); c2 = new Date(c2.getFullYear(), c2.getMonth() + 1, 1); }
    } else {
      const buoc = zoom === "tuan" ? 14 : 7;
      let c2 = new Date(min);
      while (c2 <= max) { ticks.push({ off: Math.round((c2 - min) / DAY_MS), label: c2.getDate() + "/" + (c2.getMonth() + 1) }); c2 = new Date(c2.getTime() + buoc * DAY_MS); }
    }
    const now0 = new Date();
    const todayOff = dayOf(new Date(now0.getFullYear(), now0.getMonth(), now0.getDate()));
    return { allItems, min, max, totalDays, dayOf, nodeById, es, ef, slackOf, violated, hasCycle, ticks, todayOff,
             showToday: todayOff >= 0 && todayOff <= totalDays };
  }, [tasks, baseline, lich, zoom]);

  const undated = tasks.filter((tk) => !parseISO(tk.startDate) && !parseISO(tk.dueDate)).length;
  const allItems = nen ? nen.allItems : [];
  const items = useMemo(() => visibleIds ? allItems.filter((it) => visibleIds.has(it.tk.id)) : allItems, [allItems, visibleIds]);
  const isCritical = (id) => !!nen && !nen.hasCycle && nen.slackOf[id] === 0;

  /* hình học các dòng + dây phụ thuộc: chỉ đổi khi tập việc hiển thị đổi, không đổi khi kéo */
  const veDay = useMemo(() => {
    if (!nen) return { geo: {}, depLines: [] };
    const { nodeById, es, ef, hasCycle, dayOf } = nen;
    const geo = {};
    items.forEach((it, i) => { geo[it.tk.id] = { i, so: dayOf(it.start), sp: Math.round((it.end - it.start) / DAY_MS) + 1 }; });
    const depLines = [];
    items.forEach((it) => { depsCua(it.tk).forEach((d) => {
      const a = geo[d.id], b = geo[it.tk.id]; if (!a || !b) return;
      const crit = (id) => !hasCycle && nen.slackOf[id] === 0;
      const tight = crit(d.id) && crit(it.tk.id) && ef[d.id] === es[it.tk.id]; // cạnh nằm trên đường găng
      const bad = !hasCycle && nen.violated.has(it.tk.id);                     // lịch đang đặt vi phạm ràng buộc
      /* SS/SF nối từ ĐẦU việc trước; FF/SF nối vào CUỐI việc sau */
      const tuDau = d.type === "SS" || d.type === "SF";
      const denCuoi = d.type === "FF" || d.type === "SF";
      depLines.push({ x1: (tuDau ? a.so : a.so + a.sp) * PX, y1: a.i * ROW + 19,
                      x2: (denCuoi ? b.so + b.sp : b.so) * PX, y2: b.i * ROW + 19, tight, bad, type: d.type, lag: d.lag });
    }); });
    return { geo, depLines };
  }, [nen, items, PX]);
  const depLines = veDay.depLines;

  const dangLoc = visibleIds && items.length !== allItems.length;
  if (!nen || items.length === 0) return <div className="p-6"><Empty2 icon={<CalendarRange size={44} />} text={t.noTimelineData} /></div>;
  const { min, totalDays, slackOf, violated, hasCycle, ticks, todayOff, showToday } = nen;
  const tuDong = Math.max(0, Math.floor(cuon / ROW) - DEM);
  const denDong = Math.min(items.length, Math.ceil((cuon + KHUNG_H) / ROW) + DEM);

  return (
    <div className="p-6">
      <p className="text-sm text-slate-500 mb-2">{t.ganttHint}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 rounded-sm" style={{ height: 10, background: "#dc2626" }} />{t.criticalPath}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 rounded-sm" style={{ height: 10, background: "#f97316" }} />{t.normalTask}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 rounded-sm" style={{ height: 10, background: "#10b981" }} />{t.done}</span>
        <span className="flex items-center gap-1.5"><svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" /></svg>{t.depLine}</span>
        {showToday && <span className="flex items-center gap-1.5"><span className="inline-block" style={{ width: 2, height: 12, background: "#0ea5e9" }} />{t.today}</span>}
        {baseline && <span className="flex items-center gap-1.5"><span className="inline-block w-4 rounded-sm" style={{ height: 4, background: "#94a3b8" }} />{t.baselineLabel}</span>}
        {dangLoc && <span className="text-slate-500">• {t.ganttFiltered}</span>}
        {undated > 0 && <span className="text-slate-500">• {undated} {t.undatedHint}</span>}
        {hasCycle && <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={13} />{t.cycleWarn}</span>}
        <span className="ml-auto flex items-center gap-2">
          <Segmented size="small" value={zoom} onChange={setZoom}
            options={[{ value: "ngay", label: t.zoomDay }, { value: "tuan", label: t.zoomWeek }, { value: "thang", label: t.zoomMonth }]} />
          <AntPopover trigger="click" placement="bottomRight" content={<LichLamViec t={t} lang={lang} lich={lich} canEdit={canBaseline} onChange={onSaveLich} />}>
            <AntBtn size="small" icon={<CalendarDays size={14} />}>{t.workCalendar}</AntBtn>
          </AntPopover>
        </span>
        {canBaseline && <span><AntBtn size="small" onClick={onSaveBaseline}>{baseline ? t.baselineUpdate : t.baselineSave}</AntBtn>{baseline && project.baseline.savedAt ? <span className="text-slate-500 ml-2">{new Date(project.baseline.savedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US")}</span> : null}</span>}
      </div>
      <div className="bg-white rounded-xl border border-slate-200" style={{ overflow: "auto", maxHeight: KHUNG_H }}
        onScroll={(e) => {
          const v = e.currentTarget.scrollTop;
          setCuon((c) => Math.abs(c - v) >= ROW / 2 ? v : c);
          const ngang = e.currentTarget.scrollLeft > 0;      // chỉ đặt lại state khi BẬT/TẮT, không phải mỗi pixel
          setDaCuonNgang((cu) => cu === ngang ? cu : ngang);
        }}>
        <div style={{ minWidth: LABEL_W + totalDays * PX }}>
          {/* header */}
          <div className="flex border-b border-slate-200 sticky top-0 bg-white" style={{ height: 28, zIndex: 8 }}>
            {/* ô góc: ghim cả trên (theo tiêu đề) lẫn trái (theo cột nhãn) */}
            <div style={{ width: LABEL_W, position: "sticky", left: 0, zIndex: 9, background: "#fff",
                          boxShadow: daCuonNgang ? "6px 0 6px -4px rgba(15,23,42,.18)" : "none" }}
                 className="shrink-0 border-r border-slate-100" />
            <div className="relative flex-1">
              {ticks.map((tk, i) => <div key={i} className="absolute text-xs text-slate-500" style={{ left: tk.off * PX, top: 6 }}>{tk.label}</div>)}
            </div>
          </div>
          {/* rows */}
          <div style={{ position: "relative", height: items.length * ROW }}>
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
            {items.slice(tuDong, denDong).map((it, k) => (
              <GanttRow key={it.tk.id} it={it} top={(tuDong + k) * ROW} t={t} lang={lang} canEdit={canEdit} memberById={memberById}
                min={min} PX={PX} ROW={ROW} LABEL_W={LABEL_W} daCuonNgang={daCuonNgang}
                critIn={isCritical(it.tk.id)} slackIn={hasCycle ? null : slackOf[it.tk.id]}
                badIn={violated.has(it.tk.id)} blIn={baseline ? baseline[it.tk.id] : null}
                isDrag={!!drag && drag.id === it.tk.id} dragMode={drag ? drag.mode : null} dragDelta={drag ? drag.deltaDays : 0}
                setDrag={setDrag} onOpenTask={onOpenTask} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* P2: hộp cấu hình lịch làm việc của dự án — ngày nghỉ hằng tuần + ngày lễ.
   CPM dùng lịch này nên đường găng và dự trữ tính theo NGÀY THI CÔNG THẬT. */
function LichLamViec({ t, lang, lich, canEdit, onChange }) {
  const [le, setLe] = useState("");
  const THU = lang === "vi" ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const doiThu = (i) => {
    if (!canEdit) return;
    const cur = lich.ngayNghi;
    onChange({ ...lich, ngayNghi: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort() });
  };
  const themLe = () => { if (!canEdit || !le || lich.ngayLe.includes(le)) return; onChange({ ...lich, ngayLe: [...lich.ngayLe, le].sort() }); setLe(""); };
  return (
    <div style={{ width: 280 }} className="space-y-3">
      <div>
        <p className="text-xs text-slate-500 mb-1">{t.weeklyOff}</p>
        <div className="flex gap-1">
          {THU.map((nhan, i) => (
            <button key={i} disabled={!canEdit} onClick={() => doiThu(i)}
              className={`flex-1 text-xs py-1.5 rounded-lg border transition ${lich.ngayNghi.includes(i) ? "border-orange-300 bg-orange-50 text-orange-600 font-medium" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{nhan}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-1">{t.holidays} {lich.ngayLe.length > 0 && <span>({lich.ngayLe.length})</span>}</p>
        {lich.ngayLe.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5" style={{ maxHeight: 90, overflowY: "auto" }}>
            {lich.ngayLe.map((d) => (
              <span key={d} className="text-xs bg-slate-100 rounded px-1.5 py-0.5 flex items-center gap-1">
                {d.split("-").reverse().join("/")}
                {canEdit && <button onClick={() => onChange({ ...lich, ngayLe: lich.ngayLe.filter((x) => x !== d) })} className="text-slate-400 hover:text-red-500" aria-label={t.delete}><X size={11} /></button>}
              </span>
            ))}
          </div>
        )}
        {canEdit && (
          <div className="flex gap-1.5">
            <input type="date" value={le} onChange={(e) => setLe(e.target.value)} className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1" />
            <AntBtn size="small" onClick={themLe} disabled={!le}>{t.add}</AntBtn>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">{t.workCalendarHint}</p>
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

    // ---- BOQ – khối lượng – chi phí của dự án (chỉ khi người xuất có quyền tài chính) ----
    if (canFinance && finance) {
      const bb = boqOf((finance.boq || {})[p.id]);
      if (bb.items.length) {
        const kys = [...bb.kys].sort((a, b) => (Number(a.soKy) || 0) - (Number(b.soKy) || 0));
        const cumOf = (id) => kys.reduce((s, k) => s + (Number((k.kl || {})[id]) || 0), 0);
        const fmtQty = (n) => { const v = Number(n) || 0; try { return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(v); } catch { return String(v); } };
        const last = kys[kys.length - 1];
        const kyInfo = kys.length
          ? (lang === "vi" ? kys.length + " kỳ nghiệm thu" : kys.length + " acceptance period(s)") + (last && last.denNgay ? " · " + (lang === "vi" ? "kỳ mới nhất" : "latest") + ": " + esc(String(last.denNgay).split("-").reverse().join("/")) : "")
          : (lang === "vi" ? "chưa có kỳ nghiệm thu" : "no acceptance periods yet");
        const thR = 'style="padding:6px 8px;text-align:right"';
        const tdR = 'style="padding:6px 8px;text-align:right;font-variant-numeric:tabular-nums"';
        let totVal = 0, totDone = 0;
        let rowsHtml = "";
        bb.items.forEach((it) => {
          if (it.laNhom) { rowsHtml += `<tr style="background:#f8fafc;font-weight:600"><td style="padding:6px 8px">${esc(it.stt)}</td><td style="padding:6px 8px" colspan="8">${esc(it.ten)}</td></tr>`; return; }
          const klHd = Number(it.khoiLuong) || 0, dg = Number(it.donGia) || 0, cum = cumOf(it.id);
          totVal += klHd * dg; totDone += cum * dg;
          const pctKl = klHd > 0 ? Math.round(cum / klHd * 100) : 0;
          rowsHtml += `<tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:6px 8px">${esc(it.stt)}</td><td style="padding:6px 8px">${esc(it.ten)}</td><td style="padding:6px 8px">${esc(it.donVi)}</td>
            <td ${tdR}>${fmtQty(klHd)}</td><td ${tdR}>${fmtMoney2(dg)}</td><td ${tdR}>${fmtMoney2(klHd * dg)}</td>
            <td ${tdR}>${fmtQty(cum)}</td><td style="padding:6px 8px;text-align:right;font-variant-numeric:tabular-nums${pctKl > 100 ? ";color:#dc2626;font-weight:700" : ""}">${pctKl}%</td><td ${tdR}>${fmtMoney2(cum * dg)}</td></tr>`;
        });
        const totPct = totVal > 0 ? Math.round(totDone / totVal * 100) : 0;
        body += `<h3 style="margin:16px 0 2px;color:#0d9488">${esc(t.finTabBoq)}</h3>
          <div style="color:#64748b;font-size:12px;margin-bottom:6px">${kyInfo}</div>
          <table style="width:100%;border-collapse:collapse;font-size:12.5px"><thead><tr style="background:#f0fdfa;text-align:left">
          <th style="padding:6px 8px">${esc(t.boqCode)}</th><th style="padding:6px 8px">${esc(t.boqName)}</th><th style="padding:6px 8px">${esc(t.boqUnit)}</th>
          <th ${thR}>${esc(t.boqQty)}</th><th ${thR}>${esc(t.boqPrice)}</th><th ${thR}>${esc(t.boqAmount)}</th>
          <th ${thR}>${esc(t.boqDoneQty)}</th><th ${thR}>${esc(t.boqPercent)}</th><th ${thR}>${esc(t.boqDoneVal)}</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot><tr style="border-top:2px solid #cbd5e1;font-weight:700">
          <td style="padding:6px 8px" colspan="5">${lang === "vi" ? "Tổng cộng" : "Total"}</td>
          <td ${tdR}>${fmtMoney2(totVal)}</td><td></td><td ${tdR}>${totPct}%</td><td style="padding:6px 8px;text-align:right;font-variant-numeric:tabular-nums;color:#059669">${fmtMoney2(totDone)}</td></tr></tfoot></table>`;
        const invValP = (finance.investorContracts || []).filter((c) => c.projectId === p.id).reduce((s, c) => s + (Number(c.value) || 0), 0);
        if (invValP > 0) {
          const delta = totVal - invValP;
          body += `<div style="font-size:12px;color:#64748b;margin-top:4px">${esc(t.boqVsContract)}: <b>${fmtMoney2(invValP)}</b> · ${esc(t.boqDelta)}: <b style="color:${delta > 0 ? "#dc2626" : "#059669"}">${fmtMoney2(delta)}</b></div>`;
        }
      }
    }
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
    <div style="color:#64748b;font-size:12px">${t.generatedAt}: ${now.toLocaleString(lang === "vi" ? "vi-VN" : "en-US")}</div>
    <div style="color:#94a3b8;font-size:11px;margin-top:2px">Phần mềm do Khuong Doan phát triển · <a href="https://khuongdoan.com/" style="color:#c2410c">khuongdoan.com</a> · AGPL-3.0</div>
    ${body}</body></html>`;
}

/* ============================ HISTORY VIEW ============================ */
/* Nhật ký do MÁY CHỦ ghi: mọi thay đổi qua API đều để lại vết, kể cả khi máy trạm
   không ghi "Lịch sử". Chỉ đọc — không có đường nào sửa/xóa từ giao diện. */
function AuditView({ t, lang, projects, proj }) {
  const [rows, setRows] = useState(null);
  const [loi, setLoi] = useState("");
  useEffect(() => {
    let huy = false;
    (async () => {
      setRows(null); setLoi("");
      const r = await api("/api/audit?limit=500" + (proj ? "&projectId=" + encodeURIComponent(proj) : ""));
      if (huy) return;
      if (!r.ok) { setLoi(t.auditNoServer); setRows([]); return; }
      setRows(r.body.entries || []);
    })();
    return () => { huy = true; };
  }, [proj]); // eslint-disable-line
  if (rows === null) return <div className="text-center py-16 text-slate-500 text-sm">{t.loading}</div>;
  if (loi) return <div className="text-center py-16 text-slate-500 text-sm">{loi}</div>;
  if (!rows.length) return <div className="text-center py-16 text-slate-500"><Lock size={44} className="mx-auto mb-3 opacity-40" /><p className="text-sm">{t.noHistory}</p></div>;
  const nhan = (e) => (t.auditEntity[e.entity] || e.entity) + (e.name ? " “" + e.name + "”" : "");
  const truong = (e) => t.auditField[e.field] || t.field[e.field] || e.field;
  const rutGon = (v) => { const x = String(v == null ? "" : v); return x.length > 60 ? x.slice(0, 60) + "…" : (x || t.emptyVal); };
  return (
    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
      {rows.map((e, i) => (
        <div key={i} className="px-4 py-2.5">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">{e.actor || "?"}</span>{" "}
            <span className="text-slate-600">{truong(e)}</span>{" "}
            <span className="text-slate-500">· {nhan(e)}</span>
          </p>
          {e.field !== "tạo mới" && e.field !== "xóa" && (
            <p className="text-xs text-slate-600 mt-0.5 break-words"><span className="line-through opacity-70">{rutGon(e.from)}</span> → <span className="font-medium">{rutGon(e.to)}</span></p>
          )}
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date(e.ts).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            {e.ip ? " · " + e.ip : ""}{e.rev ? " · rev " + e.rev : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

function HistoryView({ t, lang, history, projects, canDelete, canAudit, onDelete }) {
  const { modal: antModal } = AntApp.useApp();
  const [proj, setProj] = useState("");
  const [tab, setTab] = useState("app");   // "app" = lịch sử ứng dụng ghi, "server" = nhật ký máy chủ ghi
  const q = (s) => `“${s || t.untitled}”`;
  const describe = (e) => {
    const A = t.act; const where = e.projectName ? ` ${t.inProject} ${e.projectName}` : "";
    switch (e.action) {
      case "task_create": case "task_delete": case "task_complete": case "task_reopen":
        return `${A[e.action]} ${q(e.taskTitle)}${where}`;
      case "comment_add": return `${A.comment_add} ${q(e.taskTitle)}${where}`;
      case "task_assign": return `${A.task_assign} ${q(e.taskTitle)} → ${e.to}${e.primaryName ? ` (★ ${e.primaryName})` : ""}${where}`;
      case "task_workdone": return `${A.task_workdone} ${q(e.taskTitle)}: ${e.from} → ${e.to}${where}`;
      case "task_reject": return `${A.task_reject} ${q(e.taskTitle)}: “${e.to}”${where}`;
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
  const nutTab = (k, nhan) => (
    <button key={k} onClick={() => setTab(k)}
      className={`px-3 py-1.5 text-sm rounded-lg border ${tab === k ? "bg-orange-50 border-orange-300 text-orange-700 font-medium" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{nhan}</button>
  );
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {canAudit && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {nutTab("app", t.histApp)}
          {nutTab("server", t.histServer)}
          <span className="text-xs text-slate-500 basis-full sm:basis-auto">{tab === "server" ? t.histServerHint : ""}</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{tab === "app" ? rows.length + " " + (lang === "vi" ? "thay đổi" : "changes") : t.histServerHead}</p>
        <AntSelect value={proj} onChange={(v) => setProj(v)} style={{ minWidth: 190 }} options={[{ value: "", label: t.allProjects }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
      </div>
      {tab === "server" && canAudit ? <AuditView t={t} lang={lang} projects={projects} proj={proj} /> : rows.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><ScrollText size={44} className="mx-auto mb-3 opacity-40" /><p className="text-sm">{t.noHistory}</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {rows.map((e) => (
            <div key={e.id} className="flex gap-3 px-4 py-3">
              <Avatar name={e.actor} size={30} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700"><span className="font-semibold">{e.actor}</span> {describe(e)}</p>
                <p className="text-xs text-slate-500 mt-0.5" title={new Date(e.ts).toLocaleString()}>{relTime(e.ts, lang)} · {new Date(e.ts).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              {canDelete && <button onClick={async () => { if (await askDanger(antModal, t, lang === "vi" ? "Xóa dòng lịch sử này?" : "Delete this history entry?")) onDelete(e.id); }} className="text-slate-500 hover:text-red-500 p-1 shrink-0 self-center" title={t.delete}><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ TASK DETAIL ============================ */
function TaskFiles({ t, lang, task, canEdit }) {
  const laLoi = task.kind === "defect";
  const { modal: antModal } = AntApp.useApp();
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const load = async () => { const r = await api("/api/taskfiles?taskId=" + encodeURIComponent(task.id)); if (r.ok) setFiles(r.body.files || []); };
  useEffect(() => { load(); }, [task.id]); // eslint-disable-line
  const openFile = async (idx) => { try { const tok = getToken(); const r = await fetch("/api/taskfiles/file?taskId=" + encodeURIComponent(task.id) + "&idx=" + idx, { headers: tok ? { Authorization: "Bearer " + tok } : {} }); if (!r.ok) return; const blob = await r.blob(); const url = URL.createObjectURL(blob); window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 30000); } catch (e) {} };
  const upload = async (fileList, nhan) => {
    setBusy(true);
    for (const f0 of Array.from(fileList || [])) {
      const f = await nenAnh(f0);
      const ten = nhan ? nhan + "_" + f.name : f.name;   // TRUOC_ / SAU_ : nhìn tên tệp là biết ảnh nào
      try {
        const tok = getToken();
        await fetch("/api/taskfiles/upload?taskId=" + encodeURIComponent(task.id) + "&filename=" + encodeURIComponent(ten), { method: "POST", headers: { ...(tok ? { Authorization: "Bearer " + tok } : {}), "Content-Type": f.type || "application/octet-stream" }, body: f });
      } catch (e) {}
    }
    setBusy(false); load();
  };
  const del = async (idx) => { if (!(await askDanger(antModal, t, lang === "vi" ? "Xóa tệp này?" : "Delete this file?"))) return; const tok = getToken(); await fetch("/api/taskfiles/delete?taskId=" + encodeURIComponent(task.id) + "&idx=" + idx, { method: "POST", headers: tok ? { Authorization: "Bearer " + tok } : {} }); load(); };
  return (
    <div>
      <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-1.5"><ScrollText size={15} />{t.attachments} {files.length > 0 && <span className="text-xs text-slate-500">{files.length}</span>}</label>
      <div className="space-y-1.5">
        {files.map((f) => (
          <div key={f.idx} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
            <Download size={15} className="text-slate-500 shrink-0" />
            <button onClick={() => openFile(f.idx)} className="flex-1 text-left text-sm text-orange-600 hover:underline truncate">{f.name}</button>
            <span className="text-xs text-slate-500 shrink-0">{Math.round((f.size || 0) / 1024)} KB</span>
            {canEdit && <button onClick={() => del(f.idx)} className="text-slate-500 hover:text-red-500"><X size={14} /></button>}
          </div>
        ))}
        {files.length === 0 && <p className="text-xs text-slate-500">{lang === "vi" ? "Chưa có tệp." : "No files."}</p>}
      </div>
      {canEdit && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:underline cursor-pointer"><Plus size={14} />{busy ? (lang === "vi" ? "Đang tải..." : "Uploading...") : (lang === "vi" ? "Thêm tệp" : "Add files")}<input type="file" multiple className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} /></label>
          {laLoi && <>
            <label className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-orange-600 cursor-pointer"><Camera size={14} />{t.photoBefore}<input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => { upload(e.target.files, "TRUOC"); e.target.value = ""; }} /></label>
            <label className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-orange-600 cursor-pointer"><Camera size={14} />{t.photoAfter}<input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => { upload(e.target.files, "SAU"); e.target.value = ""; }} /></label>
          </>}
        </div>
      )}
    </div>
  );
}
function TaskDetail({ t, lang, task, members, memberById, me, canEdit, canWorkdone, sections, projTasks, onClose, onPatch, onAssign, onWorkdone, onReminder, onDepends, onDelete, onComment, onStatus, onApprove, onReject, onApprover, canApprove, assignableIds, canRemind, serverMode }) {
  const [tagInput, setTagInput] = useState("");
  const [subInput, setSubInput] = useState("");
  const [comment, setComment] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
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
            className={task.completed ? "line-through text-slate-500" : "text-slate-800"} style={{ fontSize: "1.25rem", fontWeight: 600, padding: 0, resize: "none" }} />

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
            {!canWorkdone && <p className="text-xs text-slate-500 mt-2">{t.workdoneHint}</p>}
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
            {task.status === "review" && canApprove && !rejecting && (
              <button onClick={() => setRejecting(true)} className="w-full py-2 text-sm font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-1.5"><X size={15} />{t.rejectBtn}</button>
            )}
            {task.status === "review" && canApprove && rejecting && (
              <div className="space-y-1.5">
                <AntInput.TextArea rows={2} autoFocus value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={t.rejectReason} />
                <div className="flex gap-2">
                  <AntBtn size="small" className="flex-1" onClick={() => { setRejecting(false); setRejectReason(""); }}>{t.cancel}</AntBtn>
                  <AntBtn size="small" danger type="primary" className="flex-1" disabled={!rejectReason.trim()} onClick={() => { onReject(rejectReason); setRejecting(false); setRejectReason(""); }}>{t.rejectSend}</AntBtn>
                </div>
              </div>
            )}
            <Field icon={<Flag size={15} />} label={t.priority}>
              <div className="flex gap-1.5">{PRIORITY_ORDER.map((p) => { const m = PRIORITY_META[p]; const active = task.priority === p; return (
                <button key={p} disabled={ro} onClick={() => onPatch({ priority: p })} className="flex-1 text-xs font-medium py-1.5 rounded-lg border transition" style={active ? { background: m.bg, color: m.color, borderColor: m.ring } : { borderColor: "#e2e8f0", color: "#64748b" }}>{t.priorities[p]}</button>); })}</div>
            </Field>
          {/* DEPENDENCIES */}
          {(() => {
            const others = (projTasks || []).filter((x) => x.id !== task.id);
            const byId = (id) => others.find((x) => x.id === id);
            const deps = depsCua(task);
            const depIds = deps.map((d) => d.id);
            const blockingList = others.filter((x) => idsPhuThuoc(x).includes(task.id));
            const unmet = depIds.map(byId).filter((x) => x && !x.completed);
            const ghi = (ds) => onDepends(ds.map(nenDep));
            const toggle = (id) => ghi(depIds.includes(id) ? deps.filter((d) => d.id !== id) : [...deps, { id, type: "FS", lag: 0 }]);
            const doiLoai = (id, type) => ghi(deps.map((d) => d.id === id ? { ...d, type } : d));
            const doiLag = (id, lag) => ghi(deps.map((d) => d.id === id ? { ...d, lag: Math.round(Number(lag) || 0) } : d));
            return (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: "#f8fafc" }}>
                  <Network size={16} className="text-orange-500" /><span className="text-sm font-semibold text-slate-700">{t.dependencies}</span>
                  {unmet.length > 0 && <span className="ml-auto text-xs font-medium text-amber-600 flex items-center gap-1"><AlertTriangle size={12} />{t.blocked}</span>}
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-amber-600 mb-1.5 flex items-center gap-1"><Clock size={12} />{t.waitingOn}</div>
                    {/* P2: mỗi liên kết đã chọn có LOẠI (FS/SS/FF/SF) và ĐỘ TRỄ riêng */}
                    {!ro && deps.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {deps.map((d) => (
                          <div key={d.id} className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
                            <span className="flex-1 min-w-[45%] text-sm text-slate-700 truncate">{byId(d.id)?.title || t.untitled}</span>
                            <AntSelect size="small" value={d.type} onChange={(v) => doiLoai(d.id, v)} style={{ width: 78 }}
                              options={LOAI_PT.map((k) => ({ value: k, label: k }))} />
                            <span className="flex items-center gap-1">
                              <AntInput size="small" type="number" value={d.lag} onChange={(e) => doiLag(d.id, e.target.value)} style={{ width: 62 }} />
                              <span className="text-xs text-slate-500">{t.lagDays}</span>
                            </span>
                          </div>
                        ))}
                        <p className="text-xs text-slate-500">{t.depTypeHint}</p>
                      </div>
                    )}
                    {ro ? (
                      <div className="text-sm text-slate-600">{deps.map((d) => (byId(d.id)?.title || "") + (d.type !== "FS" || d.lag ? " (" + d.type + (d.lag ? (d.lag > 0 ? "+" : "") + d.lag + "d" : "") + ")" : "")).filter(Boolean).join(", ") || t.none}</div>
                    ) : others.length === 0 ? <p className="text-xs text-slate-500">{t.none}</p> : (
                      <div className="space-y-0.5" style={{ maxHeight: 150, overflowY: "auto" }}>
                        {others.map((o) => { const checked = depIds.includes(o.id); return (
                          <label key={o.id} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                            <input type="checkbox" checked={checked} onChange={() => toggle(o.id)} className="accent-orange-600" />
                            <span className={`flex-1 text-sm truncate ${o.completed ? "line-through text-slate-500" : "text-slate-700"}`}>{o.title || t.untitled}</span>
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
              <AntInput type="number" min="0" value={task.milestone ? "" : (task.duration || "")} disabled={ro || task.milestone} onChange={(e) => applyDates("dur", e.target.value)} placeholder={task.milestone ? "—" : "0"} style={{ width: "100%" }} />
              <AntCheckbox className="mt-1.5" checked={!!task.milestone} disabled={ro}
                onChange={(e) => onPatch(e.target.checked ? { milestone: true, duration: null, startDate: task.dueDate || task.startDate || "" } : { milestone: false })}>
                <span className="text-xs" title={t.milestoneHint}>◆ {t.milestone}</span>
              </AntCheckbox>
            </Field>
            <Field icon={<CalendarRange size={15} />} label={t.dueDate}>
              <input type="date" value={task.dueDate || ""} disabled={ro} onChange={(e) => applyDates("due", e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-slate-50" />
            </Field>
            <p className="text-xs text-slate-500">{lang === "vi" ? "Nhập 2 trong 3 ô — hệ thống tự tính ô còn lại." : "Fill any 2 of 3 — the third is computed."}</p>
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
                    {showDivider && <div className="text-xs text-slate-500 px-2 pt-2 pb-1 border-t border-slate-100 mt-1">{lang === "vi" ? "Chưa / không được phân công" : "Not assigned"}</div>}
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${checked ? "border-orange-200 bg-orange-50/40" : "border-transparent"}`}>
                    <input type="checkbox" disabled={ro || (assignableIds && !assignableIds.has(m.id))} checked={checked} onChange={() => toggleAssignee(m.id)} className="accent-orange-600" />
                    <Avatar name={m.name} size={24} ring={isPrimary ? "#f59e0b" : undefined} />
                    <span className="flex-1 text-sm text-slate-700 truncate flex items-center gap-1.5">{m.name} {!m.isLeader && <DeptTag dept={m.dept} t={t} />}</span>
                    {checked && (
                      <button disabled={ro || (assignableIds && !assignableIds.has(m.id))} onClick={() => onAssign(task.assignees, m.id)} title={t.setPrimary}
                        className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${isPrimary ? "text-amber-600 bg-amber-50" : "text-slate-500 hover:text-amber-500"}`}>
                        <Star size={13} fill={isPrimary ? "#f59e0b" : "none"} />{isPrimary ? t.primary : ""}
                      </button>
                    )}
                  </div>
                  </div>
                );
              })}
              {task.assignees.length === 0 && <p className="text-xs text-slate-500 px-2">{t.noAssignees}</p>}
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
                {!remOn && task.reminderLead && <button onClick={() => { onReminder(null); }} className="mt-2 text-xs text-slate-500 hover:text-red-500">{t.noReminder}</button>}
                <p className="text-xs text-slate-500 mt-2">{t.reminderOnServer}</p>
              </>
            )}
          </div>)}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">{t.description}</label>
            <AntInput.TextArea value={task.description} readOnly={ro} onChange={(e) => onPatch({ description: e.target.value })} rows={4} />
          </div>

          {task.kind === "defect" && (
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5 space-y-3">
              <p className="text-sm font-medium text-red-700 flex items-center gap-1.5"><ClipboardCheck size={15} />{t.defects}</p>
              <label className="block"><span className="text-xs text-slate-500">{t.defectArea}</span>
                <AntInput value={(task.defect && task.defect.viTri) || ""} disabled={ro}
                  onChange={(e) => onPatch({ defect: { ...(task.defect || {}), viTri: e.target.value } })} placeholder={t.defectAreaHint} /></label>
              <div><span className="text-xs text-slate-500">{t.defectSeverity}</span>
                <div className="flex gap-1.5 mt-0.5">{["high", "med", "low"].map((m) => (
                  <button key={m} disabled={ro} onClick={() => onPatch({ defect: { ...(task.defect || {}), mucDo: m }, priority: m === "high" ? "high" : m === "low" ? "low" : "medium" })}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition ${((task.defect && task.defect.mucDo) || "med") === m ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-500 hover:bg-white"}`}>{t.defectSev[m]}</button>
                ))}</div>
              </div>
              <label className="block"><span className="text-xs text-slate-500">{t.defectContractor}</span>
                <AntInput value={(task.defect && task.defect.nhaThau) || ""} disabled={ro}
                  onChange={(e) => onPatch({ defect: { ...(task.defect || {}), nhaThau: e.target.value } })} /></label>
              <p className="text-xs text-slate-500">{t.defectFlowHint}</p>
            </div>
          )}
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
                  <button onClick={() => !ro && toggleSub(s.id)} disabled={ro} className="shrink-0">{s.done ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-slate-400" />}</button>
                  <span className={`flex-1 text-sm ${s.done ? "line-through text-slate-500" : "text-slate-700"}`}>{s.title}</span>
                  {!ro && <button onClick={() => removeSub(s.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition shrink-0"><X size={15} /></button>}
                </div>
              ))}
              {task.subtasks.length === 0 && <p className="text-xs text-slate-500 px-2 py-1">{lang === "vi" ? "Chưa có việc con." : "No subtasks yet."}</p>}
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
            <label className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1.5"><MessageSquare size={15} />{t.comments} {task.comments?.length > 0 && <span className="text-xs text-slate-500">{task.comments.length}</span>}</label>
            <div className="space-y-3 mb-3">
              {(!task.comments || task.comments.length === 0) && <p className="text-sm text-slate-500">{t.noComments}</p>}
              {task.comments?.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.author} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2"><span className="text-sm font-medium text-slate-700">{c.author}</span><span className="text-xs text-slate-500">{relTime(c.ts, lang)}</span></div>
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
            ) : <p className="text-xs text-slate-500">{t.pickIdentity}</p>}
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
            <div className="flex-1 min-w-0"><div className="text-sm font-medium text-slate-700 truncate">{m.name}</div><div className="text-xs text-slate-500 truncate">{m.email}</div></div>
            <RoleTag role={effRole(m)} t={t} />
          </button>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-4 space-y-2">
        <label className="text-xs font-medium text-slate-500 block">{t.orCreate}</label>
        <AntInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t.yourName} onPressEnter={submit} />
        <AntInput prefix={<Mail size={15} className="text-slate-500" />} value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder={t.emailPlaceholder} type="email" onPressEnter={submit} />
        {err && <p className="text-xs text-red-500">{err}</p>}
        <AntBtn type="primary" block icon={<UserPlus size={15} />} disabled={!name.trim() || !email.trim()} onClick={submit}>{t.join}</AntBtn>
      </div>
    </AntModal>
  );
}

/* ============================ MEMBERS MODAL ============================ */
function MembersModal({ t, members, meId, canManage, actorIsOwner, serverMode, features, effRole, onSetCap, onSetPosition, onAdd, onRemove, onResetPassword, onClose }) {
  const [pwFor, setPwFor] = useState(null); // đặt lại mật khẩu: thành viên đang chọn
  const [pwVal, setPwVal] = useState("");
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
      title={<span className="flex items-center gap-2"><Users size={20} className="text-orange-500" />{t.members}<span className="text-sm font-normal text-slate-500">({visible.length})</span></span>}>
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
                    <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5"><Mail size={11} />{m.email || "—"}</div>
                  </div>
                  {isOwner ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RoleTag role="owner" t={t} />
                      {serverMode && m.id === meId && <button onClick={() => { setPwVal(""); setPwFor(m); }} className="p-1.5 text-slate-500 hover:text-orange-500 transition" title={t.resetPassword}><Lock size={15} /></button>}
                    </div>
                  ) : canManage ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {actorIsOwner && onSetPosition && <AntSelect size="small" value={m.position || (m.isTeamlead ? "teamlead" : "staff")} onChange={(v) => onSetPosition(m.id, v)} style={{ minWidth: 112 }} title={t.positionLabel} options={[{ value: "leader", label: t.posLeader }, { value: "deputy", label: t.posDeputy }, { value: "teamlead", label: t.posTeamlead }, { value: "staff", label: t.posStaff }]} />}
                      <AntSelect size="small" value={m.dept || ""} onChange={(v) => onSetCap(m.id, "dept", v)} style={{ minWidth: 112 }} title={t.deptLabel} options={[{ value: "", label: t.deptNone }, ...DEPTS.map((d) => ({ value: d, label: t.depts[d] }))]} />
                      {serverMode && <button onClick={() => { setPwVal(""); setPwFor(m); }} className="p-1.5 text-slate-500 hover:text-orange-500 transition" title={t.resetPassword}><Lock size={15} /></button>}
                      {m.id !== meId && <button onClick={() => onRemove(m.id)} className="p-1.5 text-slate-500 hover:text-red-500 transition" title={t.removeMember}><Trash2 size={15} /></button>}
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
                <AntInput prefix={<Mail size={15} className="text-slate-500" />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@congty.com" type="email" style={{ marginTop: 4 }} /></label>
              <label className="block"><span className="text-xs text-slate-500">{t.deptLabel}</span>
                <AntSelect value={dept} onChange={(v) => setDept(v)} style={{ width: "100%", marginTop: 4 }} options={[{ value: "", label: t.deptNone }, ...DEPTS.map((d) => ({ value: d, label: t.depts[d] }))]} /></label>
              {serverMode && <label className="block"><span className="text-xs text-slate-500">{t.setPassword}</span>
                <AntInput prefix={<Lock size={15} className="text-slate-500" />} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t.setPassword} style={{ marginTop: 4 }} /></label>}
            </div>
            <div className="mt-3">
              <span className="text-xs text-slate-500 block mb-1.5">{t.positionLabel}</span>
              <AntSelect value={position} onChange={(pos) => { setPosition(pos); if (pos !== "custom") setCaps({ ...BLANK_CAPS, ...(POSITION_PRESETS[pos] || {}) }); }} style={{ width: "100%" }}
                options={[...(actorIsOwner ? [{ value: "leader", label: t.posLeader }, { value: "deputy", label: t.posDeputy }, { value: "teamlead", label: t.posTeamlead }] : []), { value: "staff", label: t.posStaff }, { value: "custom", label: t.posCustom }]} />
              <button onClick={() => setShowAdv((x) => !x)} className="text-xs text-slate-500 hover:text-orange-600 mt-2">{t.advancedPerms} {showAdv ? "▴" : "▾"}</button>
              {showAdv && <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 mt-1.5">
                {addCaps.map((k) => <CapBox key={k} k={k} val={caps[k]} on={(v) => { setPosition("custom"); setCaps((c) => ({ ...c, [k]: v, position: "" })); }} />)}
              </div>}
            </div>
            <AntBtn type="primary" block onClick={doAdd} disabled={!canAdd} style={{ marginTop: 16 }}>{t.create}</AntBtn>
          </div>
        )}
      {pwFor && (
        <AntModal open centered width={380} title={t.dlgResetPwTitle + " " + pwFor.name} okText={t.dlgSave} cancelText={t.cancel}
          okButtonProps={{ disabled: !(pwVal.length >= 8 && /[A-Za-z]/.test(pwVal) && /[0-9]/.test(pwVal)) }}
          onCancel={() => { setPwFor(null); setPwVal(""); }}
          onOk={() => { onResetPassword(pwFor.id, pwVal); setPwFor(null); setPwVal(""); }}>
          <AntInput.Password autoFocus value={pwVal} onChange={(e) => setPwVal(e.target.value)} placeholder={t.dlgNewPw} />
        </AntModal>
      )}
    </AntModal>
  );
}

/* ============================ SETTINGS MODAL ============================ */
function SettingsModal({ t, lang, onLoad, onSave, onFeatures, onClose, membersCount, onOpenMembers }) {
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState("");
  const [feats, setFeats] = useState(FEATURE_ALL_ON);
  const setFeat = (k, v) => setFeats((pr) => ({ ...pr, [k]: v }));
  useEffect(() => { onLoad().then((d) => { setS(d || { appName: "", appUrl: "", backup: { email: "" }, smtp: {} }); setFeats({ ...FEATURE_ALL_ON, ...((d && d.features) || {}) }); }); }, []); // eslint-disable-line
  if (!s) return (
    <AntModal open onCancel={onClose} footer={null} width={480} title={t.settings}><div className="text-slate-500 text-sm py-6 text-center">…</div></AntModal>
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
            <span className="text-xs text-slate-500">{membersCount}</span>
            <ArrowRight size={16} className="text-slate-500" />
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
          <p className="text-xs text-slate-500">{t.smtpHelp}</p>
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

/* ============================ AUTH SCREEN (setup / login) ============================ */
function AuthScreen({ mode, t, lang, setLang, error, onSubmit, sourceUrl }) {
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
          <div><div className="font-semibold text-slate-800">{t.appName}</div><div className="text-xs text-slate-500">{t.tagline}</div></div>
        </div>
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>{isSetup ? t.setupTitle : t.loginWelcome}</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 18 }}>{isSetup ? t.setupHint : t.ownerCreatesAccounts}</Typography.Paragraph>
        <div className="space-y-2.5">
          {isSetup && <AntInput size="large" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.yourName} onPressEnter={submit} />}
          <AntInput size="large" prefix={<Mail size={16} className="text-slate-500" />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} type="email" onPressEnter={submit} />
          <AntInput.Password size="large" prefix={<Lock size={16} className="text-slate-500" />} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSetup ? t.setPassword : t.passwordPlaceholder} onPressEnter={submit} />
          {isSetup && <AntInput size="large" prefix={<Lock size={16} className="text-slate-500" />} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onPressEnter={submit} placeholder={lang === "vi" ? "MÃ CÀI ĐẶT" : "SETUP CODE"} style={{ letterSpacing: 2 }} />}
          {isSetup && <p className="text-xs text-slate-500 -mt-1">{lang === "vi" ? "Xem mã trong cửa sổ máy chủ (Terminal / Log của container)." : "Find the code in the server console / container log."}</p>}
          {error && <AntAlert type="error" showIcon message={error} />}
          <AntBtn type="primary" size="large" block disabled={!ok} onClick={submit}>{isSetup ? t.createOwnerBtn : t.signIn}</AntBtn>
          <AuthorCredit className="text-xs text-slate-500 mt-4 text-center" sourceUrl={sourceUrl} t={t} />
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
        <div className="min-w-0"><div className="text-sm font-semibold text-slate-700 truncate">{me?.name}</div><div className="text-xs text-slate-500 truncate">{me?.email}</div><RoleTag role={myRole} t={t} /></div>
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
function NewProjectModal({ t, lang, projects, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("");
  const submit = () => { if (name.trim()) onCreate(name, template); };
  return (
    <AntModal open onCancel={onClose} width={400} title={t.newProject}
      footer={<><AntBtn onClick={onClose}>{t.cancel}</AntBtn><AntBtn type="primary" disabled={!name.trim()} onClick={submit}>{t.create}</AntBtn></>}>
      <AntInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t.projectName} onPressEnter={() => name.trim() && submit()} />
      <div className="mt-3">
        <label className="text-xs font-medium text-slate-500 block mb-1">{t.useTemplate}</label>
        <AntSelect value={template} onChange={(v) => setTemplate(v)} style={{ width: "100%" }} options={[
          { value: "", label: t.templateNone },
          { label: t.builtinTemplates, options: BUILTIN_TEMPLATES.map((tp) => ({ value: tp.id, label: lang === "vi" ? tp.vi : tp.en })) },
          ...(projects && projects.length > 0 ? [{ label: t.copyFromProject, options: projects.map((pp) => ({ value: pp.id, label: pp.name })) }] : []),
        ]} />
        {template && !String(template).startsWith("tpl:") && <p className="text-xs text-slate-500 mt-1.5">{t.templateHint}</p>}
      </div>
    </AntModal>
  );
}

function Empty({ t }) {
  return <div className="h-full flex items-center justify-center"><AntEmpty image={AntEmpty.PRESENTED_IMAGE_SIMPLE} description={<div><div className="text-slate-500 font-medium">{t.noTasks}</div><div className="text-xs text-slate-500 mt-0.5">{t.noTasksHint}</div></div>} /></div>;
}

function ExportModal({ t, projects, onDownload, onClose }) {
  const [fmt, setFmt] = useState("html");
  const Row = ({ label, color, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition text-left">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: (color || "#f97316") + "1a", color: color || "#f97316" }}><Download size={16} /></span>
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">{label}</span>
      <span className="text-xs text-slate-500">{fmt === "csv" ? "CSV" : "HTML"}</span>
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
