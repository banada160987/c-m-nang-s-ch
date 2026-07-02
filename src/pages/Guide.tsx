import React from 'react';

export const Guide: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="text-center py-10 relative">
        <div className="text-5xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>🧭</div>
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-4 drop-shadow-sm">Hướng Dẫn Sử Dụng</h1>
        <p className="text-lg text-muted font-semibold">Khám phá cách sử dụng Cẩm Nang Sách thật hiệu quả nhé!</p>
      </div>

      <div className="space-y-8">
        {/* Phần Dành Cho Học Sinh */}
        <section className="bg-surface p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-2xl font-serif font-bold text-accent mb-6 flex items-center gap-3">
            <span className="text-3xl">🎒</span> Dành Cho Độc Giả (Học Sinh)
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold">1</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Khám Phá Kho Sách & Cẩm Nang</h3>
                <p className="text-muted leading-relaxed">Tại <strong className="text-ink">Kho Sách</strong>, bạn có thể tìm kiếm mọi tựa sách. Nếu không biết đọc gì, hãy mở <strong className="text-ink">Cẩm Nang Sách</strong> và chọn độ tuổi của mình để nhận những gợi ý sách tuyệt vời nhất nhé!</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold">2</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Trải Nghiệm Đọc Sách & Nghe AI</h3>
                <p className="text-muted leading-relaxed">Bấm vào bất kỳ cuốn sách nào để bắt đầu đọc. Bạn có thể phóng to/thu nhỏ chữ, hoặc bật chế độ ban đêm 🌙. Đặc biệt, hãy bấm nút <strong className="text-accent">🔊 Nghe AI Đọc</strong> để hệ thống tự động đọc truyện cho bạn nghe!</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold">3</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Cộng Đồng Đọc Sách 💬</h3>
                <p className="text-muted leading-relaxed">Không chỉ đọc một mình, bạn có thể để lại <strong>Cảm Nhận (Review)</strong> ở cuối mỗi cuốn sách để chia sẻ với bạn bè! Đừng quên đặt cho mình một <strong>Biệt danh</strong> thật hay ở trang Bảng Vàng để mọi người nhận ra bạn nhé.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold">4</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Đua Top Bảng Vàng 🏆</h3>
                <p className="text-muted leading-relaxed">Mỗi phút bạn đọc sách đều được tính điểm! Hãy chăm chỉ "Nuôi Cây Tri Thức" để xem tên mình vươn lên <strong>Bảng Vàng Thi Đua</strong> toàn trường nhé. Cây càng to, hạng càng cao!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Phần Dành Cho Quản Trị Viên */}
        <section className="bg-surface p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
          <h2 className="text-2xl font-serif font-bold text-secondary mb-6 flex items-center gap-3">
            <span className="text-3xl">🛡️</span> Dành Cho Quản Trị Viên (Admin)
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center text-2xl font-bold">1</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Đăng nhập hệ thống</h3>
                <p className="text-muted leading-relaxed">Chọn mục <strong className="text-ink">Cài đặt/Admin</strong> ở thanh Menu. Hệ thống yêu cầu đăng nhập bằng tài khoản Firebase (Email: nphuong25071988@gmail.com). Đăng nhập thành công, bảng điều khiển sẽ mở ra.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center text-2xl font-bold">2</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Phân loại sách khi tải lên</h3>
                <p className="text-muted leading-relaxed">Khi thêm sách, nếu chọn <strong className="text-ink">Kho sách chung</strong>, bạn sẽ có tùy chọn gán "Độ tuổi phù hợp". Sách có độ tuổi sẽ tự động được hiển thị ở cả Trang chủ và mục Cẩm Nang tương ứng.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center text-2xl font-bold">3</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Tùy chọn định dạng sách</h3>
                <ul className="list-disc list-inside text-muted leading-relaxed mt-2 space-y-2">
                  <li><strong>File PDF:</strong> Kéo thả file PDF để tải thẳng lên Đám mây (Storage). Sách sẽ hiển thị dạng đồ hoạ.</li>
                  <li><strong>Văn bản (Text):</strong> Dán trực tiếp văn bản chữ. Khi chọn định dạng này, tính năng AI Đọc Truyện (Text-to-Speech) sẽ phát huy tối đa công dụng.</li>
                  <li><strong>Link Google Drive:</strong> Hữu ích khi sách PDF quá nặng, hệ thống sẽ tự động nhúng link vào khung đọc.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
