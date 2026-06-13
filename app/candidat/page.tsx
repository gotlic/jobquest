'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload, Trash2, Star, FileText, Edit3, Save, X, ChevronRight, Download, Eye } from 'lucide-react';

type Category = { id: number; name: string; color: string; icon: string };
type CV = { id: number; category_id: number; filename: string; original_name: string; version: string; notes: string; is_default: number; created_at: string };
type Letter = { id: number; category_id: number | null; title: string; content: string; is_default: number; created_at: string };

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  green:  { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700' },
};

export default function CandidatPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [activeTab, setActiveTab] = useState<'cvs' | 'letters'>('cvs');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📄');
  const [newCatColor, setNewCatColor] = useState('violet');
  const [showNewLetter, setShowNewLetter] = useState(false);
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<Category | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [cats, cvsRes, letts] = await Promise.all([
      fetch('/api/cv-categories').then(r => r.json()),
      fetch('/api/cvs').then(r => r.json()),
      fetch('/api/cover-letters').then(r => r.json()),
    ]);
    setCategories(cats);
    setCvs(cvsRes);
    setLetters(letts);
    if (cats.length > 0 && !selectedCat) setSelectedCat(cats[0].id);
  }

  useEffect(() => { load(); }, []);

  async function uploadFile(file: File) {
    if (!file || !selectedCat) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category_id', String(selectedCat));
    fd.append('version', `v${(cvs.filter(c => c.category_id === selectedCat).length + 1)}`);
    await fetch('/api/cvs', { method: 'POST', body: fd });
    await load();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  }

  async function deleteCV(id: number) {
    await fetch(`/api/cvs/${id}`, { method: 'DELETE' });
    await load();
  }

  async function deleteCategory(cat: Category) {
    await fetch(`/api/cv-categories/${cat.id}`, { method: 'DELETE' });
    setConfirmDeleteCat(null);
    if (selectedCat === cat.id) setSelectedCat(null);
    await load();
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    await fetch('/api/cv-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName, icon: newCatIcon, color: newCatColor }),
    });
    setNewCatName('');
    setShowNewCat(false);
    await load();
  }

  async function saveLetter(letter: Letter) {
    await fetch(`/api/cover-letters/${letter.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: letter.title, content: letter.content }),
    });
    setEditingLetter(null);
    await load();
  }

  async function deleteLetter(id: number) {
    await fetch(`/api/cover-letters/${id}`, { method: 'DELETE' });
    await load();
  }

  async function addLetter() {
    if (!newLetterTitle.trim()) return;
    await fetch('/api/cover-letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newLetterTitle, content: '', category_id: selectedCat }),
    });
    setNewLetterTitle('');
    setShowNewLetter(false);
    await load();
  }

  const selectedCategory = categories.find(c => c.id === selectedCat);
  const catColors = COLOR_CLASSES[selectedCategory?.color ?? 'violet'];
  const catCvs = cvs.filter(c => c.category_id === selectedCat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none">JobQuest</h1>
              <p className="text-xs text-gray-400 font-medium">Recherche collaborative</p>
            </div>
          </button>

          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-700">👤 Zone Candidat</span>
          </div>

          <div className="ml-auto flex gap-2">
            <button onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              ← Retour au dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar — catégories */}
          <div className="w-64 flex-shrink-0 space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Profils</h2>
              <button onClick={() => setShowNewCat(true)}
                className="w-7 h-7 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center hover:bg-violet-200 transition-colors">
                <Plus size={14} />
              </button>
            </div>

            {categories.map(cat => {
              const c = COLOR_CLASSES[cat.color] ?? COLOR_CLASSES.violet;
              const count = cvs.filter(cv => cv.category_id === cat.id).length;
              return (
                <div key={cat.id} className="relative group/cat">
                  <button
                    onClick={() => setSelectedCat(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                      selectedCat === cat.id
                        ? `${c.bg} ${c.border} ${c.text} shadow-sm font-semibold`
                        : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="flex-1 text-sm font-medium truncate">{cat.name}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${selectedCat === cat.id ? c.badge : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDeleteCat(cat); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-white text-gray-300 hover:bg-red-50 hover:text-red-400 opacity-0 group-hover/cat:opacity-100 transition-all shadow-sm border border-gray-100"
                    title="Supprimer ce profil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}

            {showNewCat && (
              <div className="bg-white border border-violet-200 rounded-2xl p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="w-12 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center text-gray-900"
                    placeholder="🎯"
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                  />
                  <input
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900"
                    placeholder="Nom du profil..."
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCategory()}
                    autoFocus
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {Object.keys(COLOR_CLASSES).map(color => (
                    <button key={color} onClick={() => setNewCatColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        newCatColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
                      } ${COLOR_CLASSES[color].badge.split(' ')[0]}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowNewCat(false)} className="flex-1 py-1.5 text-xs border rounded-lg text-gray-500 hover:bg-gray-50">Annuler</button>
                  <button onClick={addCategory} className="flex-1 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold">Créer</button>
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {selectedCategory && (
              <>
                {/* Category header */}
                <div className={`${catColors.bg} border ${catColors.border} rounded-2xl px-6 py-4 mb-6 flex items-center gap-4`}>
                  <span className="text-4xl">{selectedCategory.icon}</span>
                  <div>
                    <h2 className={`text-xl font-black ${catColors.text}`}>{selectedCategory.name}</h2>
                    <p className="text-sm text-gray-500">{catCvs.length} CV · {letters.filter(l => l.category_id === selectedCat || !l.category_id).length} lettre(s)</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setActiveTab('cvs')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'cvs' ? 'bg-white shadow ' + catColors.text : 'text-gray-500 hover:bg-white/50'}`}
                    >
                      📄 CV ({catCvs.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('letters')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'letters' ? 'bg-white shadow ' + catColors.text : 'text-gray-500 hover:bg-white/50'}`}
                    >
                      ✉️ Lettres ({letters.length})
                    </button>
                  </div>
                </div>

                {/* CVs tab */}
                {activeTab === 'cvs' && (
                  <div className="space-y-4">
                    {/* Upload zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed ${dragging ? 'border-violet-500 bg-violet-50 scale-[1.02]' : catColors.border} rounded-2xl p-8 text-center cursor-pointer hover:${catColors.bg} transition-all group`}
                    >
                      <Upload size={32} className={`mx-auto mb-3 ${catColors.text} opacity-50 group-hover:opacity-100 transition-opacity`} />
                      <p className={`font-semibold ${catColors.text}`}>
                        {uploading ? '⏳ Upload en cours...' : 'Déposer un CV ici'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">PDF, DOCX — max 10 Mo</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                      />
                    </div>

                    {/* CV list */}
                    {catCvs.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <p className="text-4xl mb-3">📂</p>
                        <p className="text-gray-500 font-medium">Aucun CV pour ce profil</p>
                        <p className="text-sm text-gray-400 mt-1">Uploadez votre premier CV ci-dessus</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {catCvs.map(cv => (
                          <div key={cv.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow group">
                            <div className={`w-12 h-12 ${catColors.bg} ${catColors.border} border rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <FileText size={20} className={catColors.text} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{cv.original_name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors.badge}`}>{cv.version}</span>
                                {cv.is_default === 1 && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">⭐ Par défaut</span>
                                )}
                                <span className="text-xs text-gray-400">{new Date(cv.created_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                              {cv.notes && <p className="text-xs text-gray-400 mt-1 truncate">{cv.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a
                                href={`/api/uploads/${cv.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Voir"
                              >
                                <Eye size={14} />
                              </a>
                              <a
                                href={`/api/uploads/${cv.filename}`}
                                download={cv.original_name}
                                className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Télécharger"
                              >
                                <Download size={14} />
                              </a>
                              <button
                                onClick={() => deleteCV(cv.id)}
                                className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Letters tab */}
                {activeTab === 'letters' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">Cliquez sur une lettre pour la modifier. Les zones entre [CROCHETS] sont à personnaliser.</p>
                      <button
                        onClick={() => setShowNewLetter(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all"
                      >
                        <Plus size={14} /> Nouvelle lettre
                      </button>
                    </div>

                    {showNewLetter && (
                      <div className="bg-white border border-violet-200 rounded-2xl p-4 flex gap-3">
                        <input
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                          placeholder="Titre de la lettre..."
                          value={newLetterTitle}
                          onChange={e => setNewLetterTitle(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addLetter()}
                          autoFocus
                        />
                        <button onClick={addLetter} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700">Créer</button>
                        <button onClick={() => setShowNewLetter(false)} className="px-3 py-2 border rounded-xl text-sm text-gray-500 hover:bg-gray-50">Annuler</button>
                      </div>
                    )}

                    {letters.map(letter => (
                      <div key={letter.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                        {editingLetter?.id === letter.id ? (
                          <div className="p-4 space-y-3">
                            <input
                              className="w-full font-bold text-gray-900 text-base border-b border-gray-200 pb-2 focus:outline-none focus:border-violet-400 bg-transparent"
                              value={editingLetter.title}
                              onChange={e => setEditingLetter({ ...editingLetter, title: e.target.value })}
                            />
                            <textarea
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono leading-relaxed resize-none"
                              rows={18}
                              value={editingLetter.content}
                              onChange={e => setEditingLetter({ ...editingLetter, content: e.target.value })}
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingLetter(null)} className="px-4 py-2 border rounded-xl text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-1.5"><X size={14} /> Annuler</button>
                              <button onClick={() => saveLetter(editingLetter)} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 flex items-center gap-1.5"><Save size={14} /> Sauvegarder</button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">✉️</span>
                                <h3 className="font-bold text-gray-900">{letter.title}</h3>
                                {letter.is_default === 1 && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">⭐ Par défaut</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingLetter(letter)}
                                  className="p-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteLetter(letter.id)}
                                  className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3 max-h-40 overflow-y-auto">
                              <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap leading-relaxed">{letter.content || '— Cliquez sur ✏️ pour rédiger —'}</pre>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Les zones <span className="bg-yellow-100 text-yellow-700 px-1 rounded font-mono">[EN CROCHETS]</span> sont à personnaliser pour chaque offre</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation suppression profil */}
      {confirmDeleteCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {confirmDeleteCat.icon}
              </div>
              <div>
                <h3 className="font-black text-gray-900">Supprimer ce profil ?</h3>
                <p className="text-sm text-gray-500">{confirmDeleteCat.name}</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-sm text-red-700">
              <p className="font-semibold mb-1">⚠️ Action irréversible</p>
              <p>Tous les CV de ce profil seront supprimés définitivement.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteCat(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteCategory(confirmDeleteCat)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
