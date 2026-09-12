<div align="center">

# 🎯 PlayEng Studio
### Ứng Dụng Học Tiếng Anh Hàng Ngày Tự Động Hóa Qua Playwright (No API Key Required)

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-Core-2EAD33.svg)](https://playwright.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

<p align="center">
  <b>Học tiếng Anh thông minh mỗi ngày với sự hỗ trợ của các mô hình AI đỉnh cao (Gemini Web, ChatGPT Web).</b><br/>
  Không cần đăng ký API Key, không tốn phí Token hàng tháng, tự động hóa 1-Click qua Playwright.
</p>

</div>

---

## 🌟 Tính Năng Nổi Bật

### 1. 🔥 Chế Độ Học Hàng Ngày (Daily Habit Hub - 5–10 Phút)
- **✨ Bài Học 5 Phút Hôm Nay (Daily Spark)**: Tự động trích xuất 1 cụm từ vàng (Golden Phrase) theo chủ đề quen thuộc (Giao tiếp, Công sở, Du lịch, Cà phê), kèm phiên âm IPA, nút 🔊 **Nghe phát âm chuẩn Web Speech API**, ý nghĩa và 2 ví dụ thực tế.
- **⚡ Sửa Nhanh 1 Câu Của Tôi (Daily Quick-Fix)**: Nhập 1 câu tiếng Anh bất kỳ bạn muốn nói hôm nay $\to$ AI sửa thành câu tự nhiên chuẩn người bản xứ (Native Polish), chỉ rõ lỗi sai ngữ pháp và nâng cấp từ vựng C1.
- **🎯 Thử Thách Phản Xạ 1 Phút (Mini Quiz)**: 3 câu trắc nghiệm nhanh kiểm tra phản xạ và tránh bẫy dịch từng từ (Word-by-word trap).
- **Streak Tracker**: Tự động theo dõi chuỗi ngày học liên tiếp để duy trì thói quen bền vững.

### 2. 🛠️ Chế Độ Chuyên Sâu (Studio Mode)
- **✍️ Writing Examiner**: Chấm chữa bài luận dài chuẩn CEFR & IELTS Band, phân tích lỗi chi tiết và viết lại toàn bộ bài văn.
- **📖 Lexical & Deep Idiom**: Tra cứu và bóc tách chuyên sâu sắc thái từ ngữ, ngữ cảnh sử dụng và các lỗi thường gặp.
- **💬 Roleplay Scenario**: Đóng vai hội thoại 2 chiều theo kịch bản thực tế, tích hợp bộ đánh giá phát âm giọng nói (`speechEvaluator.ts`).
- **🎯 Smart Quiz Generator**: Tạo đề thi trắc nghiệm ngữ pháp và từ vựng 5 câu có đáp án và giải thích chi tiết.

### 3. 🤖 Kiến Trúc Playwright Chatbot Bridge (No API Key)
- Tận dụng `launchPersistentContext` với profile `.playwright-profile` để giữ phiên đăng nhập Google / OpenAI, vượt qua cơ chế chặn bot.
- Tự động nhận diện trình duyệt **Google Chrome** và **Microsoft Edge** có sẵn trên Windows mà không cần cài đặt thêm.
- Server-Sent Events (SSE) stream trực tiếp tiến trình tự động hóa về giao diện người dùng theo thời gian thực.
- Bộ dự phòng thông minh (Fallback Generator) đảm bảo ứng dụng luôn hoạt động ngay cả khi ngoại tuyến.

---

## 🚀 Cài Đặt & Khởi Chạy 1-Click

### ⚡ Chạy Ngay 1-Click Trên Windows (Khuyên Dùng):
Nhấp đúp chuột vào file **`start_app.bat`**. Ứng dụng sẽ tự động kiểm tra môi trường, cài đặt thư viện và mở trình duyệt tại:
👉 **`http://localhost:3000`**

### 💻 Khởi Chạy Thủ Công Qua Terminal:
```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev
```

### 📦 Build Sản Phẩm Đóng Gói (Production Bundle):
```bash
npm run build
npm start
```

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
playeng-studio/
├── server/
│   ├── playwrightEngine.ts     # Engine Playwright tự động hóa Web Chatbot
│   ├── promptBuilders.ts       # Bộ xây dựng prompt chuyên biệt theo nhiệm vụ
│   ├── speechEvaluator.ts      # Bộ chấm điểm phát âm cục bộ
│   └── fallbackGenerator.ts    # Bộ sinh dữ liệu mẫu dự phòng khi offline
├── src/
│   ├── components/
│   │   ├── DailyHabitView.tsx  # Giao diện học tiếng Anh hàng ngày tinh gọn
│   │   ├── Navbar.tsx          # Thanh điều hướng & nút chuyển chế độ Daily / Studio
│   │   ├── AutomationModal.tsx # Cửa sổ terminal theo dõi Playwright
│   │   ├── forms/              # Các biểu mẫu Studio chuyên sâu (Writing, Vocab, Roleplay, Quiz)
│   │   └── results/            # Các khung hiển thị kết quả chi tiết
│   ├── types.ts                # Khai báo TypeScript types & interfaces
│   ├── translations.ts         # Song ngữ Anh - Việt
│   ├── App.tsx                 # Thành phần chính quản lý State & điều hướng
│   └── index.css               # Tailwind CSS styling
├── server.ts                   # Express Backend tích hợp Vite middleware & SSE Stream
├── start_app.bat               # Script chạy nhanh 1-click trên Windows
├── package.json
└── vite.config.ts
```

---

## 👨‍💻 Tác Giả & Giấy Phép

- Phát triển bởi **Tonton Yuta**.
- Giấy phép: **MIT License**.
