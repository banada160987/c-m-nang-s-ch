import React, { useState, useEffect } from 'react';
import { addBook, uploadPdf } from '../services/bookService';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock } from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  
  const [collection, setCollection] = useState('readable_books');
  const [format, setFormat] = useState('pdf_file');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'nphuong25071988@gmail.com') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error(error);
      alert('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-muted">Đang kiểm tra quyền truy cập...</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        alert('Vui lòng chỉ chọn file PDF.');
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setLoading(true);
    setStatus('Đang bắt đầu...');
    setProgress(0);

    try {
      let pdfUrl = formData.get('pdfUrl') as string;
      const content = formData.get('content') as string;

      if (format === 'pdf_file') {
        if (!file) throw new Error('Vui lòng chọn file PDF');
        setStatus('Đang tải file lên đám mây...');
        pdfUrl = await uploadPdf(file, setProgress);
        setStatus('Hoàn tất tải file!');
      }

      let targetCol = 'suggested_books';
      if (collection === 'readable_books') {
        targetCol = 'readable_books';
      }

      const newBook = {
        title: formData.get('title') as string,
        author: formData.get('author') as string,
        cat: formData.get('cat') as string,
        desc: formData.get('desc') as string,
        ...(targetCol === 'suggested_books' ? { age: collection } : {}),
        ...(targetCol === 'readable_books' && formData.get('age') !== 'None' ? { age: formData.get('age') as string } : {}),
        ...(format === 'text' ? { content } : { pdfUrl })
      };

      await addBook(targetCol, newBook);
      alert('Đã tải sách lên hệ thống thành công! Hãy tải lại trang để thấy thay đổi.');
      navigate(targetCol === 'readable_books' ? '/' : '/suggestions');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Lỗi khi tải sách lên');
    } finally {
      setLoading(false);
      setProgress(0);
      setStatus('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 max-w-md mx-auto min-h-[70vh] flex flex-col justify-center animate-in zoom-in-95 duration-500">
        <div className="bg-surface p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
          <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-ink mb-2">Đăng Nhập Quản Trị</h1>
          <p className="text-muted mb-8">Khu vực dành riêng cho Quản trị viên</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="Email quản trị viên" 
              required
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors mb-4 text-center text-lg" 
            />
            <input 
              type="password" 
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              placeholder="Nhập mật khẩu..." 
              required
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors mb-6 text-center text-lg tracking-widest" 
            />
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold text-xl py-4 rounded-xl shadow-lg shadow-primary/30 transition-transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <Unlock size={20} />
              Mở Khoá
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-10 relative">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-4">Quản Trị Viên</h1>
        <p className="text-lg text-muted italic">Thêm sách mới vào hệ thống</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột trái */}
          <div className="bg-surface p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
              <span>📝</span> Thông tin sách
            </h3>
            
            <div className="mb-4">
              <label className="block font-bold mb-2">Mục lưu sách</label>
              <select name="collection" value={collection} onChange={e => setCollection(e.target.value)} className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors">
                <option value="readable_books">Kho sách chung (Trang chủ)</option>
                <option value="5-7">Gợi ý: Làm Quen & Yêu Sách (5-7 tuổi)</option>
                <option value="8-10">Gợi ý: Tư Duy & Thói Quen (8-10 tuổi)</option>
                <option value="11-15">Gợi ý: Mở Rộng Nhận Thức (11-15 tuổi)</option>
              </select>
            </div>

            {collection === 'readable_books' && (
              <div className="mb-4 animate-in fade-in">
                <label className="block font-bold mb-2">Độ tuổi phù hợp (Tuỳ chọn)</label>
                <select name="age" className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors">
                  <option value="None">Dành cho mọi lứa tuổi</option>
                  <option value="5-7">5-7 tuổi</option>
                  <option value="8-10">8-10 tuổi</option>
                  <option value="11-15">11-15 tuổi</option>
                </select>
                <p className="text-sm text-muted mt-1">Sách sẽ được tự động phân loại vào Cẩm nang theo độ tuổi này.</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block font-bold mb-2">Tên sách</label>
              <input name="title" type="text" required placeholder="VD: Hoàng Tử Bé" className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors" />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Tác giả</label>
              <input name="author" type="text" required placeholder="VD: Antoine de Saint-Exupéry" className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors" />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Thể loại</label>
              <select name="cat" className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors">
                <option value="Văn học">Văn học</option>
                <option value="Khoa học">Khoa học</option>
                <option value="Lịch sử">Lịch sử</option>
                <option value="Kỹ năng">Kỹ năng</option>
                <option value="Phiêu lưu">Phiêu lưu</option>
                <option value="Tâm lý">Tâm lý</option>
                <option value="Cổ tích">Cổ tích</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Mô tả ngắn gọn</label>
              <textarea name="desc" required rows={3} placeholder="Sách kể về..." className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors"></textarea>
            </div>
          </div>

          {/* Cột phải */}
          <div className="bg-surface p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
              <span>📄</span> Nội dung sách
            </h3>
            
            <div className="mb-4">
              <label className="block font-bold mb-2">Định dạng nội dung</label>
              <select value={format} onChange={e => setFormat(e.target.value)} className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors">
                <option value="pdf_file">Tải lên File PDF từ máy</option>
                <option value="pdf_link">Đường link Google Drive (PDF)</option>
                <option value="text">Văn bản (Text/HTML)</option>
              </select>
            </div>

            {format === 'pdf_file' && (
              <div className="mb-4">
                <label className="block font-bold mb-2">Chọn File PDF</label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[200px]
                    ${file ? 'border-primary bg-primary/10' : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5'}
                  `}
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                >
                  <div className="text-4xl mb-3 opacity-70">📄</div>
                  <div>Kéo thả file vào đây hoặc <strong>bấm để chọn file</strong></div>
                  {file && <div className="text-primary font-bold mt-3 break-all">{file.name}</div>}
                </div>
                <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                
                {loading && progress > 0 && (
                  <div className="mt-4">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: progress + '%' }}></div>
                    </div>
                    <div className="text-center text-sm text-muted font-bold mt-2">{status}</div>
                  </div>
                )}
              </div>
            )}

            {format === 'text' && (
              <div className="mb-4 animate-in fade-in">
                <label className="block font-bold mb-2">Nội dung văn bản</label>
                <textarea name="content" rows={12} placeholder="Dán nội dung truyện vào đây..." className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors"></textarea>
              </div>
            )}

            {format === 'pdf_link' && (
              <div className="mb-4 animate-in fade-in">
                <label className="block font-bold mb-2">Link Google Drive</label>
                <input name="pdfUrl" type="url" placeholder="https://drive.google.com/file/d/..." className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-primary transition-colors" />
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-8 w-full bg-gradient-to-r from-primary to-accent text-white font-bold text-xl py-4 rounded-2xl shadow-lg shadow-primary/30 transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Đang xử lý...' : '🚀 Tải Sách Lên Hệ Thống'}
        </button>
      </form>
    </div>
  );
};
