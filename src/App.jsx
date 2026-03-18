import { useState, useEffect, useRef } from “react”;
import { initializeApp } from “firebase/app”;
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from “firebase/auth”;
import { getFirestore, collection, doc, addDoc, setDoc, onSnapshot, updateDoc, query, orderBy, serverTimestamp, arrayUnion, arrayRemove } from “firebase/firestore”;
import { Search, Upload, BookOpen, Users, Home, User, Plus, Heart, MessageCircle, ChevronRight, Grid, Layers, ArrowLeft, Trash2, Edit3, X, Check, Send, Image, Camera, LogOut, Mail, Lock, Eye, EyeOff } from “lucide-react”;

const firebaseConfig = {
apiKey: “AIzaSyDyYk7LbmhpTXMuOEBhMMGFGFY-YHWEYps”,
authDomain: “brickbuilderz.firebaseapp.com”,
projectId: “brickbuilderz”,
storageBucket: “brickbuilderz.firebasestorage.app”,
messagingSenderId: “984904538590”,
appId: “1:984904538590:web:6a9e4cecb227027031654f”
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const BUILDS = [
{ id: 1, title: “Medieval Castle”, author: “BrickMaster99”, pieces: 1240, likes: 342, steps: 24, tags: [“Castle”, “Medieval”], difficulty: “Advanced”, color: “from-red-200 to-orange-200” },
{ id: 2, title: “Space Rocket”, author: “CosmicBuilder”, pieces: 560, likes: 189, steps: 12, tags: [“Space”, “Sci-Fi”], difficulty: “Intermediate”, color: “from-blue-200 to-indigo-200” },
{ id: 3, title: “Cozy Cottage”, author: “TinyBricks”, pieces: 380, likes: 274, steps: 18, tags: [“House”, “Cozy”], difficulty: “Beginner”, color: “from-green-200 to-emerald-200” },
{ id: 4, title: “Dragon”, author: “MythicMOC”, pieces: 890, likes: 511, steps: 30, tags: [“Fantasy”, “Animal”], difficulty: “Advanced”, color: “from-purple-200 to-pink-200” },
{ id: 5, title: “Racing Car”, author: “SpeedBricks”, pieces: 210, likes: 93, steps: 9, tags: [“Vehicle”], difficulty: “Beginner”, color: “from-yellow-200 to-amber-200” },
{ id: 6, title: “Lighthouse”, author: “OceanMOC”, pieces: 670, likes: 158, steps: 21, tags: [“Architecture”], difficulty: “Intermediate”, color: “from-cyan-200 to-teal-200” }
];

const DIFF = {
Beginner: “bg-emerald-100 text-emerald-700”,
Intermediate: “bg-amber-100 text-amber-700”,
Advanced: “bg-red-100 text-red-700”
};

const GR = [“from-blue-500 to-blue-700”, “from-indigo-500 to-purple-600”, “from-emerald-500 to-green-700”, “from-orange-400 to-rose-500”, “from-pink-500 to-rose-600”];

const NAV = [
{ id: “home”, label: “Discover”, icon: Home },
{ id: “community”, label: “Community”, icon: Users },
{ id: “upload”, label: “Upload”, icon: Upload },
{ id: “guide”, label: “Guide”, icon: BookOpen },
{ id: “profile”, label: “Profile”, icon: User }
];

function readFile(file) {
return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
}

function gr(uid) {
if (!uid) return GR[0];
let h = 0;
for (let i = 0; i < uid.length; i++) { h = uid.charCodeAt(i) + ((h << 5) - h); }
return GR[Math.abs(h) % GR.length];
}

function AuthScreen({ onAuth }) {
const [mode, setMode] = useState(“login”);
const [email, setEmail] = useState(””);
const [pass, setPass] = useState(””);
const [name, setName] = useState(””);
const [show, setShow] = useState(false);
const [err, setErr] = useState(””);
const [loading, setLoading] = useState(false);

const submit = async () => {
setErr(””);
setLoading(true);
try {
if (mode === “signup”) {
if (!name.trim()) {
setErr(“Username required”);
setLoading(false);
return;
}
const c = await createUserWithEmailAndPassword(auth, email, pass);
await updateProfile(c.user, { displayName: name.trim() });
await setDoc(doc(db, “users”, c.user.uid), {
uid: c.user.uid,
displayName: name.trim(),
email: email,
bio: “New to BrickBuilder”,
followers: [],
following: [],
createdAt: serverTimestamp(),
photoURL: null
});
onAuth(c.user);
} else {
const c = await signInWithEmailAndPassword(auth, email, pass);
onAuth(c.user);
}
} catch (e) {
const msgs = {
“auth/email-already-in-use”: “Email already in use.”,
“auth/invalid-email”: “Invalid email.”,
“auth/weak-password”: “Password needs 6+ characters.”,
“auth/invalid-credential”: “Wrong email or password.”
};
setErr(msgs[e.code] || e.message);
}
setLoading(false);
};

return (
<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
<div className="w-full">
<div className="flex flex-col items-center mb-8">
<div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
<Grid size={24} className="text-white" />
</div>
<h1 className="text-3xl font-bold text-gray-900">BrickBuilder</h1>
<p className="text-gray-400 text-sm mt-1">Discover and share LEGO builds</p>
</div>
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
<div className="flex rounded-xl bg-gray-100 p-1 mb-6">
{[“login”, “signup”].map(m => (
<button key={m} onClick={() => { setMode(m); setErr(””); }} className={“flex-1 py-2 rounded-lg text-sm font-semibold transition-all “ + (mode === m ? “bg-white text-gray-900 shadow-sm” : “text-gray-400”)}>
{m === “login” ? “Sign In” : “Create Account”}
</button>
))}
</div>
<div className="space-y-3">
{mode === “signup” && (
<div className="relative">
<User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
<input value={name} onChange={e => setName(e.target.value)} placeholder=“Username” className=“w-full pl-9 pr-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200” />
</div>
)}
<div className="relative">
<Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
<input type=“email” value={email} onChange={e => setEmail(e.target.value)} placeholder=“Email” className=“w-full pl-9 pr-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200” />
</div>
<div className="relative">
<Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
<input type={show ? “text” : “password”} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === “Enter” && submit()} placeholder=“Password” className=“w-full pl-9 pr-10 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200” />
<button onClick={() => setShow(s => !s)} className=“absolute right-3 top-1/2 -translate-y-1/2 text-gray-400”>
{show ? <EyeOff size={16} /> : <Eye size={16} />}
</button>
</div>
</div>
{err && <p className="text-red-500 text-xs mt-3 text-center">{err}</p>}
<button onClick={submit} disabled={loading} className={“w-full mt-5 py-3.5 rounded-xl font-semibold text-sm “ + (loading ? “bg-gray-300 text-gray-400” : “bg-gray-900 text-white”)}>
{loading ? “Please wait…” : mode === “login” ? “Sign In” : “Create Account”}
</button>
</div>
<p className="text-center text-xs text-gray-400 mt-4">
{mode === “login” ? “No account? “ : “Have an account? “}
<button onClick={() => { setMode(mode === “login” ? “signup” : “login”); setErr(””); }} className=“text-gray-700 font-semibold underline”>
{mode === “login” ? “Sign up” : “Sign in”}
</button>
</p>
</div>
</div>
);
}

function BuildCard({ build, onClick }) {
const [liked, setLiked] = useState(false);
return (
<div onClick={onClick} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all">
<div className={“h-36 bg-gradient-to-br flex items-center justify-center “ + (build.color || “from-gray-200 to-gray-300”)}>
{build.image
? <img src={build.image} alt={build.title} className="w-full h-full object-cover" />
: <Grid size={32} className="text-white/60" />
}
</div>
<div className="p-4">
<div className="flex items-start justify-between mb-1">
<h3 className="font-semibold text-gray-900 text-sm">{build.title}</h3>
<span className={“text-xs px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 “ + (DIFF[build.difficulty] || “”)}>{build.difficulty}</span>
</div>
<p className="text-xs text-gray-400 mb-3">by {build.author}</p>
<div className="flex items-center justify-between text-xs text-gray-500">
<span className="flex items-center gap-1"><Layers size={12} />{build.pieces} pcs</span>
<span className="flex items-center gap-1"><BookOpen size={12} />{build.steps || 0} steps</span>
<button onClick={e => { e.stopPropagation(); setLiked(l => !l); }} className=“flex items-center gap-1”>
<Heart size={12} className={liked ? “fill-red-400 text-red-400” : “”} />
<span>{liked ? (build.likes || 0) + 1 : build.likes || 0}</span>
</button>
</div>
</div>
</div>
);
}

function HomePage({ onViewBuild }) {
const [q, setQ] = useState(””);
const [filter, setFilter] = useState(“All”);
const [extra, setExtra] = useState([]);

useEffect(() => {
return onSnapshot(collection(db, “builds”), snap => {
setExtra(snap.docs.map(d => ({ id: d.id, …d.data() })));
});
}, []);

const all = […BUILDS, …extra];
const filtered = all.filter(b =>
(filter === “All” || b.difficulty === filter) &&
(b.title || “”).toLowerCase().includes(q.toLowerCase())
);

return (
<div className="pb-24">
<div className="px-4 pt-6 pb-4">
<h1 className="text-2xl font-bold text-gray-900 mb-1">Discover Builds</h1>
<p className="text-sm text-gray-400 mb-4">Browse the community’s creations</p>
<div className="relative mb-4">
<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
<input value={q} onChange={e => setQ(e.target.value)} placeholder=“Search builds…” className=“w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200” />
</div>
<div className="flex gap-2 overflow-x-auto pb-1">
{[“All”, “Beginner”, “Intermediate”, “Advanced”].map(f => (
<button key={f} onClick={() => setFilter(f)} className={“shrink-0 px-4 py-1.5 rounded-full text-sm font-medium “ + (filter === f ? “bg-gray-900 text-white” : “bg-gray-100 text-gray-500”)}>
{f}
</button>
))}
</div>
</div>
<div className="px-4 grid grid-cols-2 gap-3">
{filtered.map(b => <BuildCard key={b.id} build={b} onClick={() => onViewBuild(b)} />)}
</div>
</div>
);
}

function PostCard({ post, user }) {
const [showC, setShowC] = useState(false);
const [text, setText] = useState(””);
const liked = (post.likes || []).includes(user.uid);

const toggleLike = () => {
updateDoc(doc(db, “posts”, post.id), {
likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid)
});
};

const addComment = async () => {
if (!text.trim()) return;
await updateDoc(doc(db, “posts”, post.id), {
comments: arrayUnion({
id: Date.now().toString(),
userId: user.uid,
username: user.displayName || “Anonymous”,
text: text.trim(),
time: new Date().toLocaleTimeString([], { hour: “2-digit”, minute: “2-digit” })
})
});
setText(””);
};

const ago = post.createdAt?.toDate
? (() => {
const d = Date.now() - post.createdAt.toDate();
const m = Math.floor(d / 60000);
if (m < 1) return “Just now”;
if (m < 60) return m + “m ago”;
return Math.floor(m / 60) + “h ago”;
})()
: “Just now”;

return (
<div className="bg-white border-b border-gray-100">
<div className="flex items-center gap-3 px-4 py-3">
<div className={“w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold “ + gr(post.authorId)}>
{(post.authorName || “?”)[0].toUpperCase()}
</div>
<div>
<p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
<p className="text-xs text-gray-400">{ago}</p>
</div>
</div>
{post.image
? <img src={post.image} className="w-full aspect-video object-cover" />
: <div className="w-full aspect-video bg-gray-100 flex items-center justify-center"><Grid size={40} className="text-gray-300" /></div>
}
<div className="px-4 pt-3 pb-2">
<div className="flex items-center gap-4 mb-2">
<button onClick={toggleLike} className="flex items-center gap-1.5">
<Heart size={22} className={liked ? “fill-red-500 text-red-500” : “text-gray-600”} />
<span className="text-sm font-semibold text-gray-700">{(post.likes || []).length}</span>
</button>
<button onClick={() => setShowC(s => !s)} className=“flex items-center gap-1.5”>
<MessageCircle size={22} className="text-gray-600" />
<span className="text-sm font-semibold text-gray-700">{(post.comments || []).length}</span>
</button>
</div>
<p className="text-sm text-gray-800 mb-2">
<span className="font-semibold mr-1">{post.authorName}</span>{post.caption}
</p>
</div>
{showC && (
<div className="px-4 pb-2 space-y-1">
{(post.comments || []).map(c => (
<div key={c.id} className="flex gap-2 text-sm">
<span className="font-semibold text-gray-800">{c.username}</span>
<span className="text-gray-600">{c.text}</span>
</div>
))}
</div>
)}
<div className="flex items-center gap-3 px-4 py-3 border-t border-gray-50">
<div className={“w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold “ + gr(user.uid)}>
{(user.displayName || “?”)[0].toUpperCase()}
</div>
<input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === “Enter” && addComment()} placeholder=“Add a comment…” className=“flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none” />
{text.trim() && <button onClick={addComment}><Send size={18} className="text-gray-900" /></button>}
</div>
</div>
);
}

function CommunityPage({ user }) {
const [posts, setPosts] = useState([]);
const [show, setShow] = useState(false);
const [caption, setCaption] = useState(””);
const [photo, setPhoto] = useState(null);
const [done, setDone] = useState(false);
const fileRef = useRef(null);

useEffect(() => {
const q = query(collection(db, “posts”), orderBy(“createdAt”, “desc”));
return onSnapshot(q, snap => setPosts(snap.docs.map(d => ({ id: d.id, …d.data() }))));
}, []);

const handleFile = async e => {
const f = e.target.files[0];
if (f) setPhoto(await readFile(f));
};

const submitPost = async () => {
if (!caption.trim()) return;
await addDoc(collection(db, “posts”), {
authorId: user.uid,
authorName: user.displayName || “Anonymous”,
caption: caption.trim(),
image: photo || null,
likes: [],
comments: [],
createdAt: serverTimestamp()
});
setCaption(””);
setPhoto(null);
setShow(false);
setDone(true);
setTimeout(() => setDone(false), 3000);
};

return (
<div className="pb-24">
<div className="px-4 pt-5 pb-3 flex items-center justify-between">
<div>
<h1 className="text-2xl font-bold text-gray-900">Community</h1>
<p className="text-sm text-gray-400">See what everyone’s building</p>
</div>
<button onClick={() => setShow(true)} className=“bg-gray-900 text-white rounded-full p-2.5”>
<Camera size={18} />
</button>
</div>
{done && (
<div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-emerald-700">
<Check size={16} /> Post is live!
</div>
)}
{posts.length === 0 && (
<div className="text-center py-16 text-gray-400">
<p className="font-medium">No posts yet - be the first!</p>
</div>
)}
<div className="divide-y divide-gray-100">
{posts.map(p => <PostCard key={p.id} post={p} user={user} />)}
</div>
{show && (
<div className=“fixed inset-0 bg-black/40 z-50 flex items-end justify-center” onClick={() => setShow(false)}>
<div className=“bg-white rounded-t-3xl w-full max-w-lg p-6” onClick={e => e.stopPropagation()}>
<div className="flex items-center justify-between mb-5">
<h2 className="text-lg font-bold text-gray-900">New Post</h2>
<button onClick={() => setShow(false)}><X size={20} className="text-gray-400" /></button>
</div>
{photo
? (
<div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 mb-4">
<img src={photo} className="w-full h-full object-cover" />
<button onClick={() => setPhoto(null)} className=“absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5”><X size={14} /></button>
</div>
)
: (
<div onClick={() => fileRef.current?.click()} className=“border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-2 mb-4 cursor-pointer”>
<Image size={28} className="text-gray-300" />
<p className="text-sm text-gray-400">Add photo (optional)</p>
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
</div>
)
}
<textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder=“Share your build…” rows={3} className=“w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none resize-none mb-4” />
<button onClick={submitPost} className={“w-full py-3.5 rounded-xl font-semibold text-sm “ + (caption.trim() ? “bg-gray-900 text-white” : “bg-gray-200 text-gray-400”)}>
Share with Community
</button>
</div>
</div>
)}
</div>
);
}

function UploadPage({ user }) {
const [step, setStep] = useState(1);
const [form, setForm] = useState({ title: “”, pieces: “”, difficulty: “Beginner”, tags: “”, desc: “” });
const [done, setDone] = useState(false);
const [photo, setPhoto] = useState(null);
const [saving, setSaving] = useState(false);
const fileRef = useRef(null);
const set = (k, v) => setForm(f => ({ …f, [k]: v }));

const handleFile = async e => {
const f = e.target.files[0];
if (f) setPhoto(await readFile(f));
};

const publish = async () => {
setSaving(true);
await addDoc(collection(db, “builds”), {
title: form.title,
pieces: parseInt(form.pieces) || 0,
difficulty: form.difficulty,
tags: form.tags.split(”,”).map(t => t.trim()).filter(Boolean),
image: photo || null,
color: “from-gray-200 to-gray-300”,
likes: 0,
steps: 0,
author: user.displayName || “Anonymous”,
authorId: user.uid,
desc: form.desc,
createdAt: serverTimestamp()
});
setSaving(false);
setDone(true);
};

if (done) return (
<div className="flex flex-col items-center justify-center px-8 text-center pb-24 pt-16">
<h2 className="text-xl font-bold text-gray-900 mb-2">Build Uploaded!</h2>
<p className="text-sm text-gray-400 mb-6">Your creation is live for everyone to discover.</p>
<button onClick={() => { setDone(false); setStep(1); setForm({ title: “”, pieces: “”, difficulty: “Beginner”, tags: “”, desc: “” }); setPhoto(null); }} className=“bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold”>
Upload Another
</button>
</div>
);

return (
<div className="pb-24 px-4 pt-6">
<h1 className="text-2xl font-bold text-gray-900 mb-1">Upload a Build</h1>
<p className="text-sm text-gray-400 mb-6">Share your creation with the community</p>
{step === 1 && (
<div className="space-y-4">
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Build Title</label>
<input value={form.title} onChange={e => set(“title”, e.target.value)} placeholder=“e.g. My Epic Castle” className=“w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200” />
</div>
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Number of Pieces</label>
<input type=“number” value={form.pieces} onChange={e => set(“pieces”, e.target.value)} placeholder=“e.g. 450” className=“w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200” />
</div>
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Difficulty</label>
<div className="flex gap-2">
{[“Beginner”, “Intermediate”, “Advanced”].map(d => (
<button key={d} onClick={() => set(“difficulty”, d)} className={“flex-1 py-2.5 rounded-xl text-xs font-semibold “ + (form.difficulty === d ? “bg-gray-900 text-white” : “bg-gray-100 text-gray-500”)}>
{d}
</button>
))}
</div>
</div>
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Tags</label>
<input value={form.tags} onChange={e => set(“tags”, e.target.value)} placeholder=“e.g. Castle, Medieval” className=“w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200” />
</div>
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
<textarea value={form.desc} onChange={e => set(“desc”, e.target.value)} placeholder=“Tell the community about your build…” rows={3} className=“w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none resize-none” />
</div>
<button onClick={() => form.title && setStep(2)} className={“w-full py-3.5 rounded-xl font-semibold text-sm “ + (form.title ? “bg-gray-900 text-white” : “bg-gray-200 text-gray-400”)}>
Next: Add Photos
</button>
</div>
)}
{step === 2 && (
<div className="space-y-4">
{photo
? (
<div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100">
<img src={photo} className="w-full h-full object-cover" />
<button onClick={() => setPhoto(null)} className=“absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5”><X size={14} /></button>
</div>
)
: (
<div onClick={() => fileRef.current?.click()} className=“border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer”>
<Camera size={32} className="text-gray-300" />
<p className="text-sm text-gray-500">Add a photo</p>
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
</div>
)
}
<div className="flex gap-3">
<button onClick={() => setStep(1)} className=“flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600”>Back</button>
<button onClick={publish} disabled={saving} className={“flex-grow py-3 rounded-xl text-sm font-semibold “ + (saving ? “bg-gray-300 text-gray-400” : “bg-gray-900 text-white”)}>
{saving ? “Publishing…” : “Publish Build”}
</button>
</div>
</div>
)}
</div>
);
}

function GuidePage({ user }) {
const [build, setBuild] = useState(null);
const [steps, setSteps] = useState([]);
const [step, setStep] = useState({ title: “”, desc: “” });
const [done, setDone] = useState(false);

const add = () => {
if (!step.title) return;
setSteps(s => […s, { …step, id: Date.now() }]);
setStep({ title: “”, desc: “” });
};

const publish = async () => {
await addDoc(collection(db, “instructions”), {
buildId: build.id?.toString(),
buildTitle: build.title,
authorId: user.uid,
authorName: user.displayName,
steps: steps,
createdAt: serverTimestamp()
});
setDone(true);
};

if (done) return (
<div className="flex flex-col items-center justify-center px-8 text-center pb-24 pt-16">
<h2 className="text-xl font-bold text-gray-900 mb-2">Instructions Published!</h2>
<button onClick={() => { setDone(false); setSteps([]); setBuild(null); }} className=“mt-4 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold”>
Create Another
</button>
</div>
);

return (
<div className="pb-24 px-4 pt-6">
<h1 className="text-2xl font-bold text-gray-900 mb-1">Instruction Builder</h1>
<p className="text-sm text-gray-400 mb-5">Create step-by-step guides</p>
{!build ? (
<div className="space-y-2">
{BUILDS.map(b => (
<button key={b.id} onClick={() => setBuild(b)} className=“w-full flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-3.5 text-left hover:border-gray-300 shadow-sm”>
<div className={“w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 “ + b.color}>
<Grid size={18} className="text-white/60" />
</div>
<div className="flex-1">
<p className="font-semibold text-gray-900 text-sm">{b.title}</p>
<p className="text-xs text-gray-400">{b.pieces} pcs - {b.difficulty}</p>
</div>
<ChevronRight size={16} className="text-gray-300" />
</button>
))}
</div>
) : (
<div>
<div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
<div className={“w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 “ + (build.color || “from-gray-200 to-gray-300”)}>
<Grid size={18} className="text-white/60" />
</div>
<div className="flex-1">
<p className="font-semibold text-sm text-gray-900">{build.title}</p>
</div>
<button onClick={() => setBuild(null)} className=“text-xs text-gray-400 underline”>Change</button>
</div>
{steps.length === 0 && <p className="text-sm text-gray-400 text-center py-4 mb-4">No steps yet.</p>}
<div className="space-y-3 mb-5">
{steps.map((s, i) => (
<div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start justify-between">
<div className="flex gap-3">
<span className="bg-gray-900 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
<div>
<p className="font-semibold text-sm text-gray-900">{s.title}</p>
{s.desc && <p className="text-xs text-gray-400">{s.desc}</p>}
</div>
</div>
<button onClick={() => setSteps(prev => prev.filter(x => x.id !== s.id))}>
<Trash2 size={15} className="text-gray-300" />
</button>
</div>
))}
</div>
<div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
<input value={step.title} onChange={e => setStep(n => ({ …n, title: e.target.value }))} placeholder=“Step title” className=“w-full px-4 py-3 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200 border border-gray-100” />
<textarea value={step.desc} onChange={e => setStep(n => ({ …n, desc: e.target.value }))} placeholder=“Description (optional)” rows={2} className=“w-full px-4 py-3 bg-white rounded-xl text-sm outline-none border border-gray-100 resize-none” />
<button onClick={add} className={“w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 “ + (step.title ? “bg-gray-800 text-white” : “bg-gray-200 text-gray-400”)}>
<Plus size={16} />Add Step
</button>
</div>
{steps.length > 0 && (
<button onClick={publish} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm">
Publish ({steps.length} steps)
</button>
)}
</div>
)}
</div>
);
}

function ProfilePage({ user, onSignOut }) {
const [profile, setProfile] = useState(null);
const [builds, setBuilds] = useState([]);
const [editing, setEditing] = useState(false);
const [name, setName] = useState(””);
const [bio, setBio] = useState(””);
const [saving, setSaving] = useState(false);
const [photo, setPhoto] = useState(null);
const fileRef = useRef(null);

useEffect(() => {
return onSnapshot(doc(db, “users”, user.uid), s => {
if (s.exists()) setProfile(s.data());
});
}, [user.uid]);

useEffect(() => {
return onSnapshot(
query(collection(db, “builds”), orderBy(“createdAt”, “desc”)),
s => setBuilds(s.docs.filter(d => d.data().authorId === user.uid).map(d => ({ id: d.id, …d.data() })))
);
}, [user.uid]);

const handleFile = async e => {
const f = e.target.files[0];
if (f) setPhoto(await readFile(f));
};

const save = async () => {
setSaving(true);
const u = { displayName: name, bio: bio };
if (photo) u.photoURL = photo;
await updateDoc(doc(db, “users”, user.uid), u);
await updateProfile(auth.currentUser, { displayName: name, …(photo ? { photoURL: photo } : {}) });
setSaving(false);
setEditing(false);
setPhoto(null);
};

if (!profile) return (
<div className="flex items-center justify-center h-64">
<div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
</div>
);

if (editing) return (
<div className="pb-24 px-4 pt-6">
<div className="flex items-center justify-between mb-6">
<button onClick={() => setEditing(false)} className=“flex items-center gap-2 text-sm text-gray-500”>
<ArrowLeft size={16} />Cancel
</button>
<h1 className="text-base font-bold text-gray-900">Edit Profile</h1>
<button onClick={save} className="text-sm font-semibold text-gray-900">{saving ? “Saving…” : “Save”}</button>
</div>
<div className="flex flex-col items-center gap-3 mb-6">
<div className="relative">
{photo || profile.photoURL
? <img src={photo || profile.photoURL} className=“w-24 h-24 rounded-2xl object-cover shadow-lg” />
: <div className={“w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl text-white font-bold shadow-lg “ + gr(user.uid)}>{(profile.displayName || “?”)[0].toUpperCase()}</div>
}
<button onClick={() => fileRef.current?.click()} className=“absolute -bottom-2 -right-2 bg-gray-900 text-white rounded-full p-1.5”>
<Camera size={14} />
</button>
</div>
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
</div>
<div className="space-y-4">
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Name</label>
<input value={name} onChange={e => setName(e.target.value)} className=“w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none” />
</div>
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label>
<textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className=“w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none resize-none” />
</div>
<button onClick={save} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm">Save Changes</button>
</div>
</div>
);

return (
<div className="pb-24">
<div className="px-4 pt-6 pb-4">
<div className="flex items-center gap-4 mb-4">
{profile.photoURL
? <img src={profile.photoURL} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
: <div className={“w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl text-white font-bold shadow-lg “ + gr(user.uid)}>{(profile.displayName || “?”)[0].toUpperCase()}</div>
}
<div>
<h2 className="text-xl font-bold text-gray-900">{profile.displayName}</h2>
<p className="text-sm text-gray-400">{profile.email}</p>
</div>
</div>
<p className="text-sm text-gray-500 mb-4">{profile.bio}</p>
<div className="grid grid-cols-3 gap-3 mb-4">
{[[“Builds”, builds.length], [“Followers”, (profile.followers || []).length], [“Following”, (profile.following || []).length]].map(([l, v]) => (
<div key={l} className="bg-gray-50 rounded-xl py-3 text-center">
<p className="font-bold text-gray-900">{v}</p>
<p className="text-xs text-gray-400">{l}</p>
</div>
))}
</div>
<div className="flex gap-2">
<button onClick={() => { setName(profile.displayName); setBio(profile.bio); setEditing(true); }} className=“flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 flex items-center justify-center gap-2”>
<Edit3 size={14} />Edit Profile
</button>
<button onClick={onSignOut} className="py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-red-500 flex items-center justify-center gap-2">
<LogOut size={14} />Sign Out
</button>
</div>
</div>
<div className="px-4 border-t border-gray-100 pt-4">
<p className="text-sm font-semibold text-gray-700 mb-3">My Builds</p>
{builds.length === 0
? (
<div className="text-center py-12">
<Upload size={40} className="mx-auto text-gray-200 mb-2" />
<p className="text-sm text-gray-400">No builds yet</p>
</div>
)
: <div className="grid grid-cols-2 gap-3">{builds.map(b => <BuildCard key={b.id} build={b} onClick={() => {}} />)}</div>
}
</div>
</div>
);
}

export default function App() {
const [user, setUser] = useState(undefined);
const [tab, setTab] = useState(“home”);
const [viewBuild, setViewBuild] = useState(null);

useEffect(() => {
return onAuthStateChanged(auth, u => setUser(u || null));
}, []);

const signout = async () => {
await signOut(auth);
setUser(null);
};

if (user === undefined) return (
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
<div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
</div>
);

if (!user) return <AuthScreen onAuth={setUser} />;

return (
<div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
<div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
<Grid size={14} className="text-white" />
</div>
<span className="text-base font-bold text-gray-900">BrickBuilder</span>
</div>
<div className={“w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold “ + gr(user.uid)}>
{(user.displayName || “?”)[0].toUpperCase()}
</div>
</div>
<div className="overflow-y-auto">
{tab === “home” && <HomePage onViewBuild={setViewBuild} />}
{tab === “community” && <CommunityPage user={user} />}
{tab === “upload” && <UploadPage user={user} />}
{tab === “guide” && <GuidePage user={user} />}
{tab === “profile” && <ProfilePage user={user} onSignOut={signout} />}
</div>
{viewBuild && (
<div className=“fixed inset-0 bg-black/40 z-50 flex items-end justify-center” onClick={() => setViewBuild(null)}>
<div className=“bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto” onClick={e => e.stopPropagation()}>
<div className={“relative h-48 bg-gradient-to-br flex items-center justify-center “ + (viewBuild.color || “from-gray-200 to-gray-300”)}>
{viewBuild.image
? <img src={viewBuild.image} className="w-full h-full object-cover" />
: <Grid size={48} className="text-white/40" />
}
<button onClick={() => setViewBuild(null)} className=“absolute top-4 right-4 bg-white/80 rounded-full p-1.5”>
<X size={18} />
</button>
</div>
<div className="p-6">
<div className="flex items-start justify-between mb-1">
<h2 className="text-xl font-bold text-gray-900">{viewBuild.title}</h2>
<span className={“text-xs px-2 py-1 rounded-full font-medium “ + (DIFF[viewBuild.difficulty] || “”)}>{viewBuild.difficulty}</span>
</div>
<p className="text-sm text-gray-400 mb-4">by {viewBuild.author}</p>
<div className="grid grid-cols-3 gap-3 mb-5">
{[[“Pieces”, viewBuild.pieces], [“Steps”, viewBuild.steps || 0], [“Likes”, viewBuild.likes || 0]].map(([l, v]) => (
<div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
<p className="font-bold text-gray-800">{v}</p>
<p className="text-xs text-gray-400">{l}</p>
</div>
))}
</div>
<div className="flex flex-wrap gap-1">
{(viewBuild.tags || []).map(t => <span key={t} className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{t}</span>)}
</div>
</div>
</div>
</div>
)}
<nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/95 backdrop-blur border-t border-gray-100 px-2 py-2 z-40">
<div className="flex justify-around">
{NAV.map(({ id, label, icon: Icon }) => (
<button key={id} onClick={() => setTab(id)} className={“flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all “ + (tab === id ? “text-gray-900” : “text-gray-400”)}>
<Icon size={20} strokeWidth={tab === id ? 2.5 : 1.8} />
<span className="text-xs font-medium">{label}</span>
</button>
))}
</div>
</nav>
</div>
);
}
