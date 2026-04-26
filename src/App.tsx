import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Music, 
  MessageCircleQuestion, 
  Send, 
  Play, 
  Volume2, 
  Loader2,
  X,
  History,
  Save,
  Tag,
  Type as TypeIcon,
  Pause,
  GitBranch,
  Eye,
  EyeOff
} from 'lucide-react';
import { processText, ReadingMaterial } from './services/apiService';

const AVATAR_URL = "/src/assets/images/cute_teacher_avatar_1777014170457.png";

type Category = '知识画报' | '博物课堂' | '杂志好奇号' | '自定义分类';

interface SavedArticle {
  id: string;
  title: string;
  category: string;
  material: ReadingMaterial;
  createdAt: number;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('知识画报');
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [material, setMaterial] = useState<ReadingMaterial | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'library'>('home');
  const [library, setLibrary] = useState<SavedArticle[]>([]);
  const [revealedQa, setRevealedQa] = useState<number[]>([]);
  const [revealedCt, setRevealedCt] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('teacher_library');
    if (saved) setLibrary(JSON.parse(saved));
  }, []);

  const saveToLibrary = () => {
    if (!material || !title.trim()) {
      setErrorMsg("请先填写文章标题哦！");
      return;
    }
    const finalCategory = category === '自定义分类' ? customCategory : category;
    const newArticle: SavedArticle = {
      id: Date.now().toString(),
      title,
      category: finalCategory || '未分类',
      material,
      createdAt: Date.now()
    };
    const newLibrary = [newArticle, ...library];
    setLibrary(newLibrary);
    localStorage.setItem('teacher_library', JSON.stringify(newLibrary));
    setErrorMsg(null);
    alert("文章已存入书架啦！");
  };

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setRevealedQa([]);
    setRevealedCt([]);
    try {
      const result = await processText(inputText);
      setMaterial(result);
    } catch (error: any) {
      console.error("Error processing text:", error);
      setErrorMsg("处理失败，请检查网络或者是 API KEY 是否正确（设置 -> 环境变量 -> DEEPSEEK_API_KEY）。");
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setPlayingAudioId(null);
  };

  const handlePlayAudio = (text: string, id: string) => {
    if (playingAudioId === id) {
      stopAudio();
      return;
    }

    stopAudio();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8; // Slow down for kids
    utterance.pitch = 1.1; // Slightly higher pitch for warmth
    
    utterance.onend = () => {
      setPlayingAudioId(null);
    };
    
    setPlayingAudioId(id);
    window.speechSynthesis.speak(utterance);
  };

  const clear = () => {
    setMaterial(null);
    setInputText('');
    setTitle('');
  };

  const deleteFromLibrary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("确定要移出书架吗？")) {
      const newLibrary = library.filter(a => a.id !== id);
      setLibrary(newLibrary);
      localStorage.setItem('teacher_library', JSON.stringify(newLibrary));
    }
  };

  const toggleQa = (idx: number) => {
    setRevealedQa(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const toggleCt = (idx: number) => {
    setRevealedCt(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF5]">
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-[#F0E6D2] shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('home'); setMaterial(null); }}>
          <div className="w-12 h-12 bg-[#FFD93D] rounded-full flex items-center justify-center shadow-inner overflow-hidden">
            <img src={AVATAR_URL} alt="Teacher" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#2D2D2D] child-text">美文精读小老师</h1>
            <span className="text-xs text-[#888]">| 小学1-2年级版</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setView('library')}
            className={`px-6 py-2 rounded-full border transition-all flex items-center gap-2 font-bold ${view === 'library' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-[#D1D1D1] text-slate-600 hover:bg-gray-50'}`}
          >
            <History className="w-4 h-4" /> 我的精读本
          </button>
          <button className="hidden md:block px-6 py-2 rounded-full border border-[#D1D1D1] text-sm font-medium hover:bg-gray-50 transition-all">阅读设置</button>
        </div>
      </header>

      <main className="flex-1 max-w-[1240px] mx-auto w-full p-6">
        <AnimatePresence mode="wait">
          {view === 'library' ? (
             <motion.div 
               key="library"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
             >
               {library.length === 0 ? (
                 <div className="col-span-full py-20 text-center text-slate-400">
                   <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                   <p className="text-xl font-bold child-text italic">书架空空如也，快去精读文章吧！</p>
                 </div>
               ) : (
                 library.map(article => (
                   <motion.div 
                     key={article.id}
                     whileHover={{ y: -5 }}
                     onClick={() => { setMaterial(article.material); setTitle(article.title); setView('home'); }}
                     className="bg-white p-6 rounded-3xl border-2 border-[#F0E6D2] cursor-pointer relative group"
                   >
                     <div className="flex justify-between items-start mb-2">
                       <span className="bg-sky-100 text-sky-600 text-[10px] px-2 py-0.5 rounded font-bold">{article.category}</span>
                       <button 
                         onClick={(e) => deleteFromLibrary(article.id, e)}
                         className="opacity-0 group-hover:opacity-100 p-2 text-red-300 hover:text-red-500 transition-all"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                     <h3 className="text-xl font-bold text-slate-800 child-text line-clamp-1">{article.title}</h3>
                     <p className="text-slate-400 text-xs mt-2">{new Date(article.createdAt).toLocaleDateString()}</p>
                   </motion.div>
                 ))
               )}
             </motion.div>
          ) : !material ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-container max-w-2xl mx-auto mt-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-[#FF6B6B] step-badge">第一步</span>
                  <h2 className="text-xl font-bold text-[#FF6B6B] child-text">基本信息：</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 flex items-center gap-1">
                      <TypeIcon className="w-4 h-4" /> 文章标题
                    </label>
                    <input 
                      type="text" 
                      placeholder="给这篇文章起个名字吧"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#FDFDFD] border border-[#DDD] focus:border-[#FF6B6B] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 flex items-center gap-1">
                      <Tag className="w-4 h-4" /> 选择分类
                    </label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full p-3 rounded-xl bg-[#FDFDFD] border border-[#DDD] focus:border-[#FF6B6B] outline-none"
                    >
                      <option value="知识画报">知识画报</option>
                      <option value="博物课堂">博物课堂</option>
                      <option value="杂志好奇号">杂志好奇号</option>
                      <option value="自定义分类">自定义分类</option>
                    </select>
                  </div>
                </div>

                {category === '自定义分类' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <input 
                      type="text" 
                      placeholder="输入你想定义的分类"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#FDFDFD] border border-[#DDD] focus:border-[#FF6B6B] outline-none mt-2"
                    />
                  </motion.div>
                )}

                <div className="flex items-center gap-3 mt-8">
                  <span className="bg-[#4D96FF] step-badge">第二步</span>
                  <h2 className="text-xl font-bold text-[#4D96FF] child-text">粘贴正文：</h2>
                </div>
                <textarea
                  className="w-full h-64 p-6 rounded-2xl bg-[#FDFDFD] border border-dashed border-[#DDD] focus:border-[#4D96FF] focus:outline-none text-lg leading-relaxed"
                  placeholder="在这里粘贴你要读的文章内容..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 p-4 rounded-xl text-red-600 text-sm font-bold border border-red-100 mt-4 text-center"
                >
                  {errorMsg}
                </motion.div>
              )}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleProcess}
                  disabled={loading || !inputText.trim() || !title.trim()}
                  className={`
                    flex items-center px-12 py-5 rounded-full text-white text-2xl font-bold transition-all
                    ${loading || !inputText.trim() || !title.trim()
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-[#6BCB77] hover:scale-105 active:scale-95 shadow-xl shadow-[#6BCB77]/20'}
                  `}
                >
                  {loading ? <Loader2 className="w-8 h-8 mr-3 animate-spin" /> : <Sparkles className="w-8 h-8 mr-3" />}
                  {loading ? '精读中...' : '开始精读'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1 bg-sky-100 text-sky-600 rounded-full text-xs font-bold">{category === '自定义分类' ? customCategory : category}</div>
                  <h2 className="text-3xl font-bold text-slate-800 child-text">{title}</h2>
                </div>
                <button 
                  onClick={saveToLibrary}
                  className="px-6 py-2 bg-orange-100 text-orange-600 rounded-full font-bold flex items-center gap-2 hover:bg-orange-200 transition-all border border-orange-200"
                >
                  <Save className="w-4 h-4" /> 保存到精读本
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <section className="md:col-span-12 lg:col-span-12">
                   <div className="card-container h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="bg-[#FF6B6B] step-badge">Step 1</span>
                        <h2 className="text-xl font-bold text-[#FF6B6B] child-text">【文章朗读版】</h2>
                        <button 
                          onClick={() => handlePlayAudio(material.originalText, 'original')}
                          className="ml-auto flex items-center gap-2 text-[#6BCB77] px-4 py-2 border-2 border-[#6BCB77]/20 rounded-full hover:bg-[#6BCB77]/5 transition-all"
                        >
                          {playingAudioId === 'original' ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          <span className="text-sm font-bold">{playingAudioId === 'original' ? '播音中...' : '播音朗读'}</span>
                        </button>
                      </div>
                      <div className="flex-1 bg-[#FDFDFD] rounded-2xl p-8 border border-dashed border-[#DDD] overflow-y-auto">
                        <p className="text-2xl leading-relaxed text-[#2D2D2D] indent-10 writing-text whitespace-pre-wrap">
                          {material.originalText}
                        </p>
                      </div>
                   </div>
                </section>

                <section className="md:col-span-12 lg:col-span-6 flex flex-col gap-6">
                  <div className="bg-[#E8F1F2] rounded-[32px] p-8 flex flex-col shadow-sm border-2 border-[#D1E5E8]">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#4D96FF] step-badge">Step 2</span>
                      <h2 className="text-xl font-bold text-[#4D96FF] child-text">【故事朗读版】</h2>
                      <button 
                         onClick={() => handlePlayAudio(material.storyVersion, 'story')}
                         className="ml-auto text-xs text-[#4D96FF] font-bold hover:underline py-2 px-3 bg-white/50 rounded-full"
                      >
                        {playingAudioId === 'story' ? '🔊 正在讲故事' : '▶ 温柔讲故事'}
                      </button>
                    </div>
                    <div className="bg-white/80 rounded-2xl p-6 flex-1">
                      <p className="text-[#4A4A4A] text-lg leading-relaxed italic whitespace-pre-wrap">
                        {material.storyVersion}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="md:col-span-12 lg:col-span-6 flex flex-col gap-6">
                  <div className="bg-[#FFF5E4] rounded-[32px] p-8 flex flex-col shadow-sm border-2 border-[#F2E8D1]">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#FF9F43] step-badge">Step 3</span>
                      <h2 className="text-xl font-bold text-[#FF9F43] child-text">【儿歌背诵版】</h2>
                      <button 
                         onClick={() => handlePlayAudio(material.rhymeVersion, 'rhyme')}
                         className="ml-auto text-xs text-[#FF9F43] font-bold hover:underline py-2 px-3 bg-white/50 rounded-full"
                      >
                        {playingAudioId === 'rhyme' ? '🔊 正在读儿歌' : '▶ 朗读儿歌'}
                      </button>
                    </div>
                    <div className="flex-1 flex flex-wrap items-center justify-center gap-8">
                       <div className="text-center px-4 w-full">
                         <pre className="text-2xl font-bold text-[#D35400] whitespace-pre-wrap font-sans leading-loose child-text">
                           {material.rhymeVersion}
                         </pre>
                       </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="bg-[#EBF5FF] rounded-[32px] p-8 flex flex-col shadow-sm border-2 border-[#D1E8FF]">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#4D96FF] step-badge">Step 4</span>
                    <h2 className="text-xl font-bold text-[#4D96FF] child-text flex items-center gap-2">
                       <GitBranch className="w-6 h-6" /> 【精读思维导图】
                    </h2>
                  </div>
                  <div className="bg-white/80 rounded-2xl p-8 border border-[#D1E8FF] shadow-inner">
                    <pre className="text-lg text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {material.mindMap}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="bg-[#F0FFEB] rounded-[32px] p-8 flex flex-col shadow-sm border-2 border-[#D6EFD6]">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#6BCB77] step-badge">Step 5</span>
                    <h2 className="text-xl font-bold text-[#6BCB77] child-text">【百科问答版】</h2>
                    <span className="text-xs text-[#6BCB77] opacity-60 ml-2">提示：点击气泡显示解析</span>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {material.qaVersion.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white/80 rounded-2xl p-5 border border-[#E0EFE0] shadow-sm cursor-pointer hover:bg-white transition-all group"
                        onClick={() => toggleQa(idx)}
                      >
                        <p className="text-xs font-bold text-[#888] mb-1">老师问：</p>
                        <p className="text-lg font-bold text-[#2D2D2D] mb-2">{item.question}</p>
                        <p className="text-xs font-bold text-[#6BCB77] mb-1">宝贝答：</p>
                        <div className="relative min-h-[40px]">
                          <AnimatePresence mode="wait">
                            {revealedQa.includes(idx) ? (
                              <motion.p 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-base text-[#4A4A4A] italic bg-[#F0FFEB]/30 p-2 rounded-lg"
                              >
                                {item.answer}
                              </motion.p>
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm font-bold gap-2"
                              >
                                <Eye className="w-4 h-4" /> 点击看答案
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* New Section: Reading Notes */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card-container bg-white"
              >
                <div className="flex items-center gap-3 mb-8">
                  <span className="bg-[#9C27B0] step-badge">NEW</span>
                  <h2 className="text-3xl font-bold text-[#9C27B0] child-text flex items-center gap-2">
                    <BookOpen className="w-8 h-8" /> 【精读笔记工具包】
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Left: Summaries & Good Words */}
                   <div className="space-y-8">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-6 bg-blue-400 rounded-full" /> 文章主要内容
                        </h4>
                        <p className="bg-blue-50/50 p-4 rounded-xl text-slate-700 leading-relaxed border border-blue-100">
                          {material.readingNotes.summary}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-6 bg-emerald-400 rounded-full" /> 自然段秘密（大意）
                        </h4>
                        <div className="space-y-3">
                          {material.readingNotes.paragraphSummaries.map((s, idx) => (
                            <div key={idx} className="flex gap-3">
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                              <p className="text-slate-600 text-base">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-6 bg-pink-400 rounded-full" /> 好词好句（能量包）
                        </h4>
                        <div className="grid gap-3">
                          {material.readingNotes.goodWordsSentences.map((item, idx) => (
                            <div key={idx} className="bg-pink-50/30 p-4 rounded-xl border border-pink-100">
                              <p className="font-bold text-pink-700 mb-1">“{item.text}”</p>
                              <p className="text-slate-500 text-sm italic">💡 小贴士：{item.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>

                   {/* Right: Idioms, Main Idea, CT, Reflection */}
                   <div className="space-y-8">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-6 bg-orange-400 rounded-full" /> 成语排排坐
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {material.readingNotes.idioms.map((item, idx) => (
                            <div key={idx} className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                              <span className="font-bold text-orange-700">{item.text}</span>
                              <p className="text-xs text-orange-600 mt-1">{item.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100">
                        <h4 className="text-xl font-bold text-purple-700 mb-2">🌟 中心大道理</h4>
                        <p className="text-purple-900 font-medium italic">“{material.readingNotes.mainIdea}”</p>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-6 bg-red-400 rounded-full" /> 思辨小问答
                          <span className="text-[10px] text-slate-400 font-normal ml-2">点击查看解析</span>
                        </h4>
                        <div className="space-y-4">
                          {material.readingNotes.criticalThinking.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="bg-slate-50 p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-red-200 transition-all"
                              onClick={() => toggleCt(idx)}
                            >
                              <p className="font-bold text-slate-700 mb-1">Q: {item.question}</p>
                              <AnimatePresence mode="wait">
                                {revealedCt.includes(idx) ? (
                                  <motion.p 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-slate-500 text-sm italic mt-2 pt-2 border-t border-slate-200"
                                  >
                                    A: {item.answer}
                                  </motion.p>
                                ) : (
                                  <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] text-red-300 font-bold flex items-center gap-1 mt-2"
                                  >
                                    <EyeOff className="w-3 h-3" /> 点击显示思考提示
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                         <h4 className="text-xl font-bold text-slate-800 mb-2">✍️ 我的读后感思路</h4>
                         <p className="bg-yellow-50 p-4 rounded-xl text-slate-700 border border-yellow-200 leading-relaxed italic">
                           {material.readingNotes.reflectionTips}
                         </p>
                      </div>
                   </div>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Bar */}
      <footer className="h-20 px-8 flex items-center justify-between bg-[#2D2D2D] text-white mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 ${loading ? 'bg-yellow-400' : 'bg-[#6BCB77]'} rounded-full animate-pulse`}></div>
            <span className="text-xs uppercase tracking-widest font-bold opacity-80">
              {loading ? '小老师正在精读文章...' : '当前状态：学习就绪'}
            </span>
          </div>
        </div>
        <div className="hidden md:flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-60 uppercase">Verbatim</span>
            <span className="text-xs font-bold">100% 贴合原文</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-60 uppercase">Level</span>
            <span className="text-xs font-bold">L1 小学低年级</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-60 uppercase">System</span>
            <span className="text-xs font-bold">AI 精读笔记</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ResultCard({ title, icon, bgColor, content, onPlay, isPlaying, isLoading, textClassName = "" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${bgColor} border-2 rounded-3xl p-6 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-white rounded-xl mr-3 shadow-sm">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-slate-700 child-text">{title}</h3>
        </div>
        <button 
          onClick={onPlay}
          disabled={isLoading}
          className={`
            flex items-center px-4 py-2 rounded-full transition-all
            ${isLoading ? 'bg-slate-200' : isPlaying ? 'bg-orange-500 text-white' : 'bg-white text-orange-500 border border-orange-100 hover:bg-orange-50'}
          `}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Play className="w-5 h-5 fill-current" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
          <span className="ml-2 font-bold">{isLoading ? '加载中' : isPlaying ? '播放中' : '听我读'}</span>
        </button>
      </div>
      <div className={`text-slate-600 text-lg leading-relaxed ${textClassName}`}>
        {content}
      </div>
    </motion.div>
  );
}
