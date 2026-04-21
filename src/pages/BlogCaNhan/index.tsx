import React, { useState, useEffect, useMemo, FC } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDocs, 
  query, onSnapshot, addDoc, updateDoc, deleteDoc, increment,
  DocumentData, QuerySnapshot, CollectionReference
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User as FirebaseUser
} from 'firebase/auth';
import { 
  Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, 
  Tag as TagIcon, Clock, Eye, User as UserIcon, Github, Linkedin, Mail, ArrowUpRight,
  Save, X, Layout, Book, Info, Home, ArrowLeft,
  Calendar, Share2, Sparkles, Command, Zap
} from 'lucide-react';

// --- Interfaces & Types ---
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: 'published' | 'draft';
  createdAt: number;
  views: number;
  author: string;
  authorAvatar: string;
}

interface Tag {
  name: string;
  count: number;
}

interface EditForm extends Omit<Post, 'id' | 'createdAt' | 'views' | 'author' | 'authorAvatar'> {
  id?: string;
  createdAt?: number;
  views?: number;
  author?: string;
  authorAvatar?: string;
}

// --- Cấu hình Firebase ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'vivid-blog-ts';

// --- Component hiển thị nội dung Markdown ---
const MarkdownRenderer: FC<{ content: string }> = ({ content }) => {
  const html = content
    .replace(/^# (.*$)/gim, '<h1 class="text-5xl font-black text-slate-900 mt-12 mb-6 tracking-tight">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-slate-800 mt-10 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-slate-800 mt-8 mb-3">$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-slate-900">$1</strong>')
    .replace(/\*(.*)\*/gim, '<em class="italic text-slate-700">$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-rose-600 hover:text-rose-700 underline underline-offset-4 decoration-2 transition-colors font-medium">$1</a>')
    .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc text-slate-600 mb-2">$1</li>')
    .replace(/\n/gim, '<p class="mb-6 text-slate-600 leading-relaxed text-lg"></p>');

  return <div className="prose prose-slate max-w-none selection:bg-rose-100 selection:text-rose-900" dangerouslySetInnerHTML={{ __html: html }} />;
};

// --- Navbar tinh gọn ---
interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Navbar: FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'admin', label: 'Quản trị', icon: Layout },
    { id: 'about', label: 'Cá nhân', icon: UserIcon },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => setActivePage('home')}
        >
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform duration-300">
            V
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
            Vivid<span className="font-light text-slate-400">Space</span>
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activePage === item.id || (activePage === 'post-detail' && item.id === 'home')
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={16} className="mr-2" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activePage, setActivePage] = useState<string>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Admin State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '', slug: '', content: '', coverImage: '', tags: [], status: 'published'
  });

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (user) => setUser(user));
  }, []);

  useEffect(() => {
    if (!user) return;
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const unsub = onSnapshot(postsRef, 
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        setPosts(data.sort((a, b) => b.createdAt - a.createdAt));
        
        const tagCounts: Record<string, number> = {};
        data.forEach(p => p.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1));
        setTags(Object.entries(tagCounts).map(([name, count]) => ({ name, count })));
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? p.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const postData: any = {
      ...editForm,
      createdAt: editForm.id ? editForm.createdAt : Date.now(),
      views: editForm.id ? editForm.views : 0,
      author: 'Admin User',
      authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Felix'
    };

    try {
      if (editForm.id) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', editForm.id), postData);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), postData);
      }
      setIsEditing(false);
      setEditForm({ title: '', slug: '', content: '', coverImage: '', tags: [], status: 'published' });
    } catch (err) { 
      console.error("Save error:", err); 
    }
  };

  const deletePost = async (id: string) => {
    if (window.confirm('Xóa bài viết này?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', id));
    }
  };

  // --- UI Components ---

  const renderHome = () => (
    <div className="space-y-16 py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Section */}
      <div className="max-w-3xl">
        <h1 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
          Nơi lưu trữ <span className="text-rose-600">tư duy</span> và những dòng code.
        </h1>
        <p className="text-slate-500 text-xl font-medium leading-relaxed mb-8">
          Viết về công nghệ, phong cách sống và hành trình phát triển bản thân của một lập trình viên mơ mộng.
        </p>
        
        <div className="relative group max-w-md">
          <div className="absolute inset-0 bg-rose-500/10 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-rose-500/50 shadow-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tags Scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setSelectedTag(null)}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border ${!selectedTag ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
        >
          Tất cả
        </button>
        {tags.map(t => (
          <button 
            key={t.name}
            onClick={() => setSelectedTag(t.name)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${selectedTag === t.name ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
          >
            #{t.name} <span className="ml-1 opacity-40 font-normal">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {filteredPosts.map((post) => (
          <div 
            key={post.id} 
            className="group cursor-pointer flex flex-col gap-6"
            onClick={() => {
              setSelectedPost(post);
              setActivePage('post-detail');
              updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id), { views: increment(1) });
              window.scrollTo(0, 0);
            }}
          >
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-100 aspect-[16/10]">
              <img 
                src={post.coverImage || 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&q=80'} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={post.title}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 group-hover:to-black/40 transition-colors"></div>
              <div className="absolute top-6 left-6 flex gap-2">
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-widest">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="px-1 space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="flex items-center gap-1.5"><Eye size={12}/> {post.views} lượt xem</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 leading-tight group-hover:text-rose-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-slate-500 line-clamp-2 text-lg leading-relaxed">
                {post.content.replace(/[#*]/g, '').substring(0, 150)}...
              </p>
              <div className="flex items-center gap-2 text-rose-600 font-bold group-hover:translate-x-2 transition-transform">
                Đọc bài viết <ArrowUpRight size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPostDetail = () => (
    selectedPost && (
      <div className="max-w-3xl mx-auto pt-10 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="fixed top-0 left-0 w-full h-1 z-[60]">
          <div className="h-full bg-rose-600 transition-all duration-200" style={{ width: `${scrollProgress}%` }}></div>
        </div>

        <button 
          onClick={() => setActivePage('home')}
          className="flex items-center text-slate-400 hover:text-slate-900 transition-colors font-bold text-sm mb-12 uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="mr-2" /> Quay lại trang chủ
        </button>

        <header className="mb-16 space-y-8">
          <div className="flex gap-2">
            {selectedPost.tags.map(t => (
              <span key={t} className="px-4 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full">#{t}</span>
            ))}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
            {selectedPost.title}
          </h1>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-3">
              <img src={selectedPost.authorAvatar} className="w-12 h-12 rounded-2xl bg-slate-100 p-0.5 border border-slate-100" />
              <div>
                <p className="font-bold text-slate-900">{selectedPost.author}</p>
                <p className="text-xs text-slate-400 font-medium">Đã đăng ngày {new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-100"></div>
            <div className="flex gap-4">
              <button className="text-slate-400 hover:text-rose-600 transition-colors"><Share2 size={20}/></button>
              <button className="text-slate-400 hover:text-rose-600 transition-colors"><Zap size={20}/></button>
            </div>
          </div>
        </header>

        <div className="aspect-[16/9] rounded-[3rem] overflow-hidden mb-16 shadow-2xl shadow-slate-100">
          <img src={selectedPost.coverImage} className="w-full h-full object-cover" alt={selectedPost.title} />
        </div>

        <div className="bg-white">
          <MarkdownRenderer content={selectedPost.content} />
        </div>

        <footer className="mt-24 pt-12 border-t border-slate-100">
          <div className="p-10 bg-slate-50 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <img src={selectedPost.authorAvatar} className="w-24 h-24 rounded-3xl bg-white p-1 shadow-sm" />
            <div className="space-y-3">
              <h4 className="text-2xl font-black text-slate-900">Viết bởi {selectedPost.author}</h4>
              <p className="text-slate-500 font-medium leading-relaxed">Một lập trình viên yêu thích cái đẹp và sự tối giản. Những bài viết tại đây là nơi đúc kết trải nghiệm trong hành trình gõ phím.</p>
              <div className="flex justify-center md:justify-start gap-4 pt-2">
                <Github size={20} className="text-slate-400 hover:text-slate-900 cursor-pointer" />
                <Linkedin size={20} className="text-slate-400 hover:text-slate-900 cursor-pointer" />
                <Mail size={20} className="text-slate-400 hover:text-slate-900 cursor-pointer" />
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  );

  const renderAdmin = () => (
    <div className="animate-in fade-in duration-700 space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900">Dashboard</h2>
          <p className="text-slate-400 font-medium mt-1">Quản lý các bài viết của bạn tại đây.</p>
        </div>
        <button 
          onClick={() => {
            setEditForm({ title: '', slug: '', content: '', coverImage: '', tags: [], status: 'published' });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={20} /> Bài viết mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Tổng lượt xem</p>
           <h3 className="text-5xl font-black text-slate-900">{posts.reduce((a, b) => a + (b.views || 0), 0)}</h3>
        </div>
        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Bài viết</p>
           <h3 className="text-5xl font-black text-slate-900">{posts.length}</h3>
        </div>
        <div className="p-8 bg-rose-600 rounded-[2.5rem] shadow-xl shadow-rose-100 text-white">
           <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-4">Truyền cảm hứng</p>
           <h3 className="text-3xl font-black">Let's Create!</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Tiêu đề</th>
                <th className="px-8 py-6">Ngày đăng</th>
                <th className="px-8 py-6">Lượt xem</th>
                <th className="px-8 py-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-900">{p.title}</span>
                    <div className="flex gap-1 mt-1">
                      {p.tags.map(t => <span key={t} className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">#{t}</span>)}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900">{p.views || 0}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditForm(p); setIsEditing(true); }}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => deletePost(p.id)}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 transition-colors shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-right duration-500 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-16">
            <div className="flex justify-between items-center mb-16">
               <h3 className="text-4xl font-black text-slate-900">{editForm.id ? 'Sửa bài viết' : 'Viết bài mới'}</h3>
               <button onClick={() => setIsEditing(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                 <X size={24} />
               </button>
            </div>
            <form onSubmit={savePost} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tiêu đề bài viết</label>
                    <input 
                      required className="w-full px-6 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-rose-500/20 text-slate-900 font-bold outline-none"
                      value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Đường dẫn (Slug)</label>
                    <input 
                      required className="w-full px-6 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-rose-500/20 text-slate-500 font-bold outline-none"
                      value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value.replace(/\s+/g, '-').toLowerCase()})}
                    />
                  </div>
               </div>
               
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Link ảnh bìa</label>
                  <input 
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-rose-500/20 text-slate-900 font-bold outline-none"
                    value={editForm.coverImage} onChange={e => setEditForm({...editForm, coverImage: e.target.value})}
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Thẻ (ngăn cách bằng dấu phẩy)</label>
                  <input 
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-rose-500/20 text-slate-900 font-bold outline-none"
                    value={editForm.tags.join(', ')} 
                    onChange={e => setEditForm({...editForm, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nội dung (Hỗ trợ Markdown)</label>
                  <textarea 
                    rows={15} required className="w-full px-8 py-8 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-rose-500/20 text-slate-900 font-medium outline-none font-mono text-lg leading-relaxed"
                    value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})}
                  />
               </div>

               <div className="flex justify-end gap-4 pt-10">
                 <button type="button" onClick={() => setIsEditing(false)} className="px-10 py-5 bg-white text-slate-400 font-bold hover:text-slate-900 transition-all">Huỷ bỏ</button>
                 <button type="submit" className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-rose-600 shadow-2xl shadow-slate-200 transition-all active:scale-95">
                   <Save size={20} /> Lưu và Xuất bản
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white selection:bg-rose-100 selection:text-rose-900">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="max-w-6xl mx-auto px-6 pt-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-rose-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] animate-pulse">Đang nạp dữ liệu...</p>
          </div>
        ) : (
          <>
            {activePage === 'home' && renderHome()}
            {activePage === 'post-detail' && renderPostDetail()}
            {activePage === 'admin' && renderAdmin()}
            {activePage === 'about' && (
              <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-700">
                <div className="p-16 bg-slate-900 text-white rounded-[4rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full blur-[100px]"></div>
                  <div className="relative z-10 space-y-10">
                    <img src="https://api.dicebear.com/7.x/micah/svg?seed=Felix" className="w-32 h-32 bg-white rounded-[2rem] p-2" alt="Avatar" />
                    <div className="space-y-4">
                      <h2 className="text-6xl font-black tracking-tight">Felix Tran</h2>
                      <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">Full-stack Developer & Blogger mải mê đi tìm những giao diện người dùng hoàn hảo. Tôi tin rằng công nghệ chỉ thực sự đẹp khi nó giải quyết được vấn đề một cách tinh tế nhất.</p>
                    </div>
                    <div className="flex gap-3">
                      {['React.js', 'Firebase', 'Tailwind', 'Three.js'].map(s => <span key={s} className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold">{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 pt-40 pb-20">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-20 border-t border-slate-100 pt-20">
            <div className="space-y-6">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-slate-900 rounded-md"></div>
                 <span className="text-lg font-bold tracking-tight text-slate-900">VividSpace</span>
               </div>
               <p className="text-slate-400 font-medium leading-relaxed max-w-sm">Tận hưởng hành trình khám phá kiến thức và phong cách sống của chúng tôi mỗi ngày.</p>
            </div>
            <div className="flex flex-col md:items-end justify-between py-2">
               <div className="flex gap-8">
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Twitter</a>
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Github</a>
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Email</a>
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-8 md:mt-0">© 2024 VIVIDSPACE • DESIGNED FOR MINIMALISTS</p>
            </div>
         </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          scroll-behavior: smooth;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .prose blockquote {
          border-left: 2px solid #E11D48;
          padding-left: 2rem;
          font-style: italic;
          font-weight: 500;
          color: #475569;
          margin: 3rem 0;
        }

        @keyframes in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom { from { transform: translateY(1.5rem); } to { transform: translateY(0); } }
        .animate-in { animation: in var(--duration, 500ms) ease-out forwards; }
        .slide-in-from-bottom-4 { animation-name: in, slide-in-from-bottom; --duration: 700ms; }
        .slide-in-from-bottom-8 { animation-name: in, slide-in-from-bottom; --duration: 1000ms; }
      `}} />
    </div>
  );
}