import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
signOut, onAuthStateChanged, updateProfile
} from "firebase/auth";
import {
getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs,
onSnapshot, updateDoc, query, orderBy, serverTimestamp, arrayUnion, arrayRemove
} from "firebase/firestore";
import {
Search, Upload, BookOpen, Users, Home, User, Plus, Star, Heart,
MessageCircle, ChevronRight, Grid, Layers, ArrowLeft, Trash2,
Edit3, X, Check, Send, Image, Sun, Moon, Camera, LogOut, Mail, Lock, Eye, EyeOff
} from "lucide-react";
// ── Firebase config ──────────────────────────────────────────────────────────
const firebaseConfig = {
apiKey: "AIzaSyDyYk7LbmhpTXMuOEBhMMGFGFY-YHWEYps",
authDomain: "brickbuilderz.firebaseapp.com",
projectId: "brickbuilderz",
storageBucket: "brickbuilderz.firebasestorage.app",
messagingSenderId: "984904538590",
appId: "1:984904538590:web:6a9e4cecb227027031654f"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// ── Constants ────────────────────────────────────────────────────────────────
const SAMPLE_BUILDS = [
{ id: 1, title: "Medieval Castle", author: "BrickMaster99", pieces: 1240, likes: 342, steps
{ id: 2, title: "Space Rocket", author: "CosmicBuilder", pieces: 560, likes: 189, steps: 12
{ id: 3, title: "Cozy Cottage", author: "TinyBricks", pieces: 380, likes: 274, steps: 18, t
{ id: 4, title: "Dragon", author: "MythicMOC", pieces: 890, likes: 511, steps: 30, tags: ["
{ id: 5, title: "Racing Car", author: "SpeedBricks", pieces: 210, likes: 93, steps: 9, tags
{ id: 6, title: "Lighthouse", author: "OceanMOC", pieces: 670, likes: 158, steps: 21, tags:
];
const DIFFICULTY_COLORS = {
Beginner: "bg-emerald-100 text-emerald-700",
Intermediate: "bg-amber-100 text-amber-700",
Advanced: "bg-red-100 text-red-700",
};
const AVATAR_GRADIENTS = [
"from-blue-500 to-blue-700",
"from-indigo-500 to-purple-600",
"from-emerald-500 to-green-700",
"from-cyan-500 to-blue-600",
"from-orange-400 to-rose-500",
"from-pink-500 to-rose-600",
"from-violet-500 to-purple-700",
];
const NAV_ITEMS = [
{ id: "home", label: "Discover", icon: Home },
{ id: "community", label: "Community", icon: Users },
{ id: "upload", label: "Upload", icon: Upload },
{ id: "instructions", label: "Guide", icon: BookOpen },
{ id: "profile", label: "Profile", icon: User },
];
// ── Helpers ──────────────────────────────────────────────────────────────────
function readFileAsDataUrl(file) {
return new Promise((resolve) => {
const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.readAsDataURL(file);
});
}
function getGradient(uid) {
if (!uid) return AVATAR_GRADIENTS[0];
let hash = 0;
for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}
function Avatar({ user, size = "sm" }) {
const sizes = { sm: "w-9 h-9 text-sm", md: "w-12 h-12 text-base", lg: "w-16 h-16 text-2xl",
const gradient = getGradient(user?.uid || user?.username);
if (user?.photoURL) {
return <img src={user.photoURL} alt={user.displayName} className={`${sizes[size]} rounded
}
return (
</div>
<div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-cen
{(user?.displayName || user?.username || "?")[0].toUpperCase()}
);
}
// ── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
const [mode, setMode] = useState("login");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [username, setUsername] = useState("");
const [showPass, setShowPass] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const handleSubmit = async () => {
setError(""); setLoading(true);
try {
if (mode === "signup") {
if (!username.trim()) { setError("Username is required"); setLoading(false); return;
const cred = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(cred.user, { displayName: username.trim() });
await setDoc(doc(db, "users", cred.user.uid), {
uid: cred.user.uid,
displayName: username.trim(),
email: email,
bio: "New to BrickBuilder ",
followers: [], following: [],
createdAt: serverTimestamp(),
photoURL: null,
});
onAuth(cred.user);
} else {
const cred = await signInWithEmailAndPassword(auth, email, password);
onAuth(cred.user);
}
} catch (e) {
const msgs = {
"auth/email-already-in-use": "Email already in use.",
"auth/invalid-email": "Invalid email address.",
"auth/weak-password": "Password must be at least 6 characters.",
"auth/user-not-found": "No account found with this email.",
"auth/wrong-password": "Incorrect password.",
"auth/invalid-credential": "Incorrect email or password.",
};
setError(msgs[e.code] || e.message);
}
setLoading(false);
};
return (
<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 ma
<div className="w-full">
<div className="flex flex-col items-center mb-8">
<div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center
<Grid size={24} className="text-white" />
</div>
<h1 className="text-3xl font-bold text-gray-900 tracking-tight">BrickBuilder</h1>
<p className="text-gray-400 text-sm mt-1">Discover & share LEGO builds</p>
</div>
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
<div className="flex rounded-xl bg-gray-100 p-1 mb-6">
{["login", "signup"].map(m => (
<button key={m} onClick={() => { setMode(m); setError(""); }} className={`flex-
{m === "login" ? "Sign In" : "Create Account"}
</button>
))}
</div>
<div className="space-y-3">
{mode === "signup" && (
<div className="relative">
<User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray
<input value={username} onChange={e => setUsername(e.target.value)} placehold
</div>
)}
<div className="relative">
<Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-4
<input type="email" value={email} onChange={e => setEmail(e.target.value)} plac
</div>
<div className="relative">
<Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-4
<input type={showPass ? "text" : "password"} value={password} onChange={e => se
<button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/
{showPass ? <EyeOff size={16} /> : <Eye size={16} />}
</button>
</div>
</div>
{error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
<button onClick={handleSubmit} disabled={loading} className={`w-full mt-5 py-3.5 ro
{loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
</button>
</div>
<p className="text-center text-xs text-gray-400 mt-4">
{mode === "login" ? "Don't have an account? " : "Already have an account? "}
<button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("
{mode === "login" ? "Sign up" : "Sign in"}
</button>
</p>
</div>
</div>
);
}
// ── Build Card ───────────────────────────────────────────────────────────────
function BuildCard({ build, onClick }) {
const [liked, setLiked] = useState(false);
return (
<div onClick={onClick} className="bg-white rounded-2xl shadow-sm border border-gray-100 o
<div className="h-36 overflow-hidden bg-gray-100 flex items-center justify-center">
{build.image
? <img src={build.image} alt={build.title} className="w-full h-full object-cover" /
: <span className="text-6xl">{build.emoji || " "}</span>
${DIFF
pcs</s
|| 0}
}
</div>
<div className="p-4">
<div className="flex items-start justify-between mb-1">
<h3 className="font-semibold text-gray-900 text-sm leading-tight">{build.title}</h3
<span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 </div>
<p className="text-xs text-gray-400 mb-3">by {build.author}</p>
<div className="flex items-center justify-between text-xs text-gray-500">
<span className="flex items-center gap-1"><Layers size={12} />{build.pieces} <span className="flex items-center gap-1"><BookOpen size={12} />{build.steps <button onClick={e => { e.stopPropagation(); setLiked(l => !l); }} className="flex
<Heart size={12} className={liked ? "fill-red-400 text-red-400" : ""} />
<span>{liked ? (build.likes || 0) + 1 : (build.likes || 0)}</span>
</button>
</div>
<div className="flex flex-wrap gap-1 mt-3">
{(build.tags || []).slice(0, 2).map(t => (
<span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-fu
))}
</div>
</div>
</div>
);
}
// ── Build Detail Modal ───────────────────────────────────────────────────────
function BuildDetail({ build, onClose, onViewInstructions }) {
return (
<div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-cen
<div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] o
<div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-c
{build.image
? <img src={build.image} alt={build.title} className="w-full h-full object-cover"
: <span className="text-8xl">{build.emoji || " "}</span>
["Like
}
<button onClick={onClose} className="absolute top-4 right-4 bg-white/80 rounded-ful
</div>
<div className="p-6">
<div className="flex items-start justify-between mb-1">
<h2 className="text-xl font-bold text-gray-900">{build.title}</h2>
<span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFFICULTY_COLORS[
</div>
<p className="text-sm text-gray-400 mb-4">by {build.author}</p>
<div className="grid grid-cols-3 gap-3 mb-5">
{[["Pieces", build.pieces, Layers], ["Steps", build.steps || 0, BookOpen], <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
<Icon size={16} className="mx-auto mb-1 text-gray-400" />
<p className="font-bold text-gray-800">{val}</p>
<p className="text-xs text-gray-400">{label}</p>
</div>
))}
</div>
<div className="flex flex-wrap gap-1 mb-5">
{(build.tags || []).map(t => <span key={t} className="text-sm bg-gray-100 text-gr
</div>
<button onClick={() => onViewInstructions(build)} className="w-full bg-gray-900 tex
<BookOpen size={16} /> View Step-by-Step Instructions
</button>
</div>
</div>
</div>
);
}
// ── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ onViewBuild, currentUser }) {
const [query, setQuery] = useState("");
const [filter, setFilter] = useState("All");
const [communityBuilds, setCommunityBuilds] = useState([]);
useEffect(() => {
const q = query_firestore(collection(db, "builds"), orderBy("createdAt", "desc"));
const unsub = onSnapshot(collection(db, "builds"), snap => {
const builds = snap.docs.map(d => ({ id: d.id, ...d.data() }));
setCommunityBuilds(builds);
});
return unsub;
}, []);
const allBuilds = [...SAMPLE_BUILDS, ...communityBuilds];
const filtered = allBuilds.filter(b =>
(filter === "All" || b.difficulty === filter) &&
(b.title?.toLowerCase().includes(query.toLowerCase()) || (b.author || "").toLowerCase().i
);
return (
<div className="pb-24">
<div className="px-4 pt-6 pb-4">
<h1 className="text-2xl font-bold text-gray-900 mb-1">Discover Builds</h1>
<p className="text-sm text-gray-400 mb-4">Browse the community's creations</p>
<div className="relative mb-4">
<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400
<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search b
</div>
<div className="flex gap-2 overflow-x-auto pb-1">
{["All", "Beginner", "Intermediate", "Advanced"].map(f => (
<button key={f} onClick={() => setFilter(f)} className={`shrink-0 px-4 py-1.5 rou
))}
</div>
</div>
{filtered.length === 0
? <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3"> </p
: <div className="px-4 grid grid-cols-2 gap-3">{filtered.map(b => <BuildCard key={b.i
}
</div>
);
}
// ── Community Page ───────────────────────────────────────────────────────────
function CommunityPage({ currentUser }) {
const [posts, setPosts] = useState([]);
const [showNewPost, setShowNewPost] = useState(false);
const [newCaption, setNewCaption] = useState("");
const [newPhoto, setNewPhoto] = useState(null);
const [posting, setPosting] = useState(false);
const [newPosted, setNewPosted] = useState(false);
const fileRef = useRef(null);
useEffect(() => {
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
const unsub = onSnapshot(q, snap => {
setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});
return unsub;
}, []);
const handleFile = async (e) => {
const file = e.target.files?.[0];
if (!file) return;
setNewPhoto(await readFileAsDataUrl(file));
};
const submitPost = async () => {
if (!newCaption.trim() || posting) return;
setPosting(true);
await addDoc(collection(db, "posts"), {
authorId: currentUser.uid,
authorName: currentUser.displayName || "Anonymous",
caption: newCaption.trim(),
image: newPhoto || null,
emoji: " ",
likes: [],
comments: [],
createdAt: serverTimestamp(),
});
setNewCaption(""); setNewPhoto(null); setShowNewPost(false);
setNewPosted(true); setPosting(false);
setTimeout(() => setNewPosted(false), 3000);
};
rounde
return (
<div className="pb-24">
<div className="px-4 pt-5 pb-3 flex items-center justify-between">
<div><h1 className="text-2xl font-bold text-gray-900">Community</h1><p className="tex
<button onClick={() => setShowNewPost(true)} className="bg-gray-900 text-white </div>
{newPosted && (
<div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-
<Check size={16} /> Your post is live!
</div>
)}
{posts.length === 0 && (
<div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3"> </p><
)}
<div className="divide-y divide-gray-100">
{posts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} />)}
</div>
{showNewPost && (
<div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick
<div className="bg-white rounded-t-3xl w-full max-w-lg p-6" onClick={e => e.stopPro
<div className="flex items-center justify-between mb-5">
<h2 className="text-lg font-bold text-gray-900">New Post</h2>
<button onClick={() => setShowNewPost(false)}><X size={20} className="text-gray
</div>
{newPhoto ? (
<div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 m
<img src={newPhoto} alt="Post" className="w-full h-full object-cover" />
<button onClick={() => setNewPhoto(null)} className="absolute top-2 right-2 b
</div>
) : (
<div onClick={() => fileRef.current?.click()} className="border-2 border-dashed
<Image size={28} className="text-gray-300" />
<p className="text-sm font-medium text-gray-500">Add a photo (optional)</p>
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange
</div>
)}
<textarea value={newCaption} onChange={e => setNewCaption(e.target.value)} placeh
<button onClick={submitPost} disabled={posting} className={`w-full py-3.5 rounded
{posting ? "Posting…" : "Share with Community"}
</button>
</div>
</div>
)}
</div>
);
}
function PostCard({ post, currentUser }) {
const [showComments, setShowComments] = useState(false);
const [commentText, setCommentText] = useState("");
const inputRef = useRef(null);
const liked = (post.likes || []).includes(currentUser.uid);
const toggleLike = async () => {
const ref = doc(db, "posts", post.id);
await updateDoc(ref, { likes: liked ? arrayRemove(currentUser.uid) : arrayUnion(currentUs
};
const submitComment = async () => {
const text = commentText.trim();
if (!text) return;
const comment = { id: Date.now().toString(), userId: currentUser.uid, username: currentUs
await updateDoc(doc(db, "posts", post.id), { comments: arrayUnion(comment) });
setCommentText("");
};
const timeAgo = post.createdAt?.toDate ? (() => {
const diff = Date.now() - post.createdAt.toDate().getTime();
const m = Math.floor(diff / 60000);
if (m < 1) return "Just now";
if (m < 60) return `${m}m ago`;
if (m < 1440) return `${Math.floor(m / 60)}h ago`;
return `${Math.floor(m / 1440)}d ago`;
})() : "Just now";
return (
<div className="bg-white border-b border-gray-100">
<div className="flex items-center gap-3 px-4 py-3">
<div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(post.authorId)}
{(post.authorName || "?")[0].toUpperCase()}
</div>
<div className="flex-1 min-w-0">
<p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
<p className="text-xs text-gray-400">{timeAgo}</p>
</div>
</div>
{post.image
? <img src={post.image} alt="" className="w-full aspect-[4/3] object-cover" />
: <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 fle
}
<div className="px-4 pt-3 pb-1">
<div className="flex items-center gap-4 mb-2">
<button onClick={toggleLike} className="flex items-center gap-1.5 active:scale-90 t
<Heart size={22} className={liked ? "fill-red-500 text-red-500" : "text-gray-600"
<span className="text-sm font-semibold text-gray-700">{(post.likes || []).length}
</button>
<button onClick={() => { setShowComments(s => !s); setTimeout(() => inputRef.curren
<MessageCircle size={22} className="text-gray-600" />
<span className="text-sm font-semibold text-gray-700">{(post.comments || []).leng
</button>
</div>
<p className="text-sm text-gray-800 mb-3"><span className="font-semibold mr-1">{post.
</div>
{(post.comments || []).length > 0 && !showComments && (
<button onClick={() => setShowComments(true)} className="px-4 pb-2 text-xs text-gray-
)}
{showComments && (
<div className="px-4 pb-2 space-y-2">
{(post.comments || []).map(c => (
<div key={c.id} className="flex gap-2 text-sm">
<span className="font-semibold text-gray-800 shrink-0">{c.username}</span>
<span className="text-gray-600 flex-1">{c.text}</span>
<span className="text-xs text-gray-400 shrink-0">{c.time}</span>
</div>
))}
</div>
)}
<div className="flex items-center gap-3 px-4 py-3 border-t border-gray-50">
<div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(currentUser.uid
{(currentUser.displayName || "?")[0].toUpperCase()}
</div>
<input ref={inputRef} value={commentText} onChange={e => setCommentText(e.target.valu
{commentText.trim() && <button onClick={submitComment}><Send size={18} className="tex
</div>
</div>
);
}
// ── Upload Page ──────────────────────────────────────────────────────────────
function UploadPage({ currentUser }) {
const [step, setStep] = useState(1);
const [form, setForm] = useState({ title: "", pieces: "", difficulty: "Beginner", tags: "",
const [submitted, setSubmitted] = useState(false);
const [photo, setPhoto] = useState(null);
const [uploading, setUploading] = useState(false);
const fileRef = useRef(null);
const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
const handleFile = async (e) => {
const file = e.target.files?.[0];
if (!file) return;
setPhoto(await readFileAsDataUrl(file));
};
const handlePublish = async () => {
setUploading(true);
await addDoc(collection(db, "builds"), {
title: form.title,
pieces: parseInt(form.pieces) || 0,
difficulty: form.difficulty,
tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
image: photo || null,
emoji: " ",
likes: 0, steps: 0,
author: currentUser.displayName || "Anonymous",
authorId: currentUser.uid,
desc: form.desc,
createdAt: serverTimestamp(),
});
setUploading(false);
setSubmitted(true);
};
if (submitted) return (
<div className="flex flex-col items-center justify-center h-full px-8 text-center pb-24 p
<div className="text-6xl mb-4"> </div>
<h2 className="text-xl font-bold text-gray-900 mb-2">Build Uploaded!</h2>
<p className="text-sm text-gray-400 mb-6">Your creation is now live for everyone to dis
<button onClick={() => { setSubmitted(false); setStep(1); setForm({ title: "", pieces:
</div>
);
return (
<div className="pb-24 px-4 pt-6">
<h1 className="text-2xl font-bold text-gray-900 mb-1">Upload a Build</h1>
<p className="text-sm text-gray-400 mb-6">Share your creation with the community</p>
<div className="flex items-center gap-2 mb-6">
{[1, 2].map(s => (
<div key={s} className="flex items-center gap-2">
<div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs fo
{s < 2 && <div className={`h-0.5 w-12 transition-all ${step > s ? "bg-gray-900" :
</div>
))}
<span className="text-xs text-gray-400 ml-2">{step === 1 ? "Build Details" : "Photos"
</div>
{step === 1 && (
<div className="space-y-4">
{[["Build Title", "title", "text", "e.g. My Epic Castle"], ["Number of Pieces", "pi
<div key={key}>
<label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</labe
<input type={type} value={form[key]} onChange={e => update(key, e.target.value)
</div>
))}
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Difficulty</lab
<div className="flex gap-2">
{["Beginner", "Intermediate", "Advanced"].map(d => (
<button key={d} onClick={() => update("difficulty", d)} className={`flex-1 py
))}
</div>
</div>
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Tags</label>
<input value={form.tags} onChange={e => update("tags", e.target.value)} placehold
</div>
<div>
<label className="text-sm font-medium text-gray-700 block mb-1.5">Description</la
<textarea value={form.desc} onChange={e => update("desc", e.target.value)} placeh
</div>
<button onClick={() => form.title && setStep(2)} className={`w-full py-3.5 rounded-
</div>
)}
bg-bla
{step === 2 && (
<div className="space-y-4">
{photo ? (
<div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100">
<img src={photo} alt="Build" className="w-full h-full object-cover" />
<button onClick={() => setPhoto(null)} className="absolute top-2 right-2 </div>
) : (
<div onClick={() => fileRef.current?.click()} className="border-2 border-dashed b
<Camera size={32} className="text-gray-300" />
<p className="text-sm font-medium text-gray-500">Add a photo of your build</p>
<span className="text-xs text-gray-400 bg-gray-100 px-4 py-2 rounded-xl">Choose
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={
</div>
)}
<div className="flex gap-3">
<button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border borde
<button onClick={handlePublish} disabled={uploading} className={`flex-grow py-3 r
</div>
</div>
)}
</div>
);
}
// ── Instructions Page ────────────────────────────────────────────────────────
function InstructionsPage({ preloadBuild, currentUser }) {
const [selectedBuild, setSelectedBuild] = useState(preloadBuild || null);
const [steps, setSteps] = useState([]);
const [newStep, setNewStep] = useState({ title: "", desc: "" });
const [published, setPublished] = useState(false);
const [saving, setSaving] = useState(false);
const addStep = () => {
if (!newStep.title) return;
setSteps(s => [...s, { ...newStep, id: Date.now() }]);
setNewStep({ title: "", desc: "" });
};
const publishInstructions = async () => {
if (!selectedBuild || steps.length === 0) return;
setSaving(true);
await addDoc(collection(db, "instructions"), {
buildId: selectedBuild.id?.toString(),
buildTitle: selectedBuild.title,
authorId: currentUser.uid,
authorName: currentUser.displayName,
steps,
createdAt: serverTimestamp(),
});
setSaving(false);
setPublished(true);
};
if (published) return (
<div className="flex flex-col items-center justify-center h-full px-8 text-center pb-24 p
<div className="text-6xl mb-4"> </div>
<h2 className="text-xl font-bold text-gray-900 mb-2">Instructions Published!</h2>
<p className="text-sm text-gray-400 mb-6">Builders can now follow your step-by-step gui
<button onClick={() => { setPublished(false); setSteps([]); setSelectedBuild(null); }}
</div>
);
return (
<div className="pb-24 px-4 pt-6">
<h1 className="text-2xl font-bold text-gray-900 mb-1">Instruction Builder</h1>
<p className="text-sm text-gray-400 mb-5">Create step-by-step guides for your builds</p
{!selectedBuild ? (
<>
<p className="text-sm font-medium text-gray-700 mb-3">Choose a build:</p>
<div className="space-y-2">
{SAMPLE_BUILDS.map(b => (
<button key={b.id} onClick={() => setSelectedBuild(b)} className="w-full flex i
<div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-ce
<div className="flex-1"><p className="font-semibold text-gray-900 text-sm">{b
<ChevronRight size={16} className="text-gray-300 shrink-0" />
</button>
))}
</div>
</>
) : (
<>
<div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
<div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center
<div className="flex-1"><p className="font-semibold text-sm text-gray-900">{selec
<button onClick={() => setSelectedBuild(null)} className="text-xs text-gray-400 u
</div>
<div className="space-y-3 mb-5">
{steps.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No s
{steps.map((s, i) => (
<div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 shado
<div className="flex items-start gap-3">
<span className="bg-gray-900 text-white text-xs font-bold w-6 h-6 rounded-f
<div><p className="font-semibold text-sm text-gray-900">{s.title}</p>{s.des
</div>
<button onClick={() => setSteps(s => s.filter(x => x.id !== s.id))} className
</div>
))}
</div>
<div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
<p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Add St
<input value={newStep.title} onChange={e => setNewStep(n => ({ ...n, title: e.tar
<textarea value={newStep.desc} onChange={e => setNewStep(n => ({ ...n, desc: e.ta
<button onClick={addStep} className={`w-full py-3 rounded-xl text-sm font-semibol
</div>
{steps.length > 0 && (
<button onClick={publishInstructions} disabled={saving} className={`w-full {saving ? "Publishing…" : `Publish Instructions (${steps.length} steps)`}
</button>
py-3.5
)}
</>
)}
</div>
);
}
// ── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage({ currentUser, onSignOut }) {
const [profile, setProfile] = useState(null);
const [userBuilds, setUserBuilds] = useState([]);
const [activeTab, setActiveTab] = useState("builds");
const [editing, setEditing] = useState(false);
const [editName, setEditName] = useState("");
const [editBio, setEditBio] = useState("");
const [saving, setSaving] = useState(false);
const [photo, setPhoto] = useState(null);
const fileRef = useRef(null);
useEffect(() => {
const unsub = onSnapshot(doc(db, "users", currentUser.uid), snap => {
if (snap.exists()) setProfile(snap.data());
});
return unsub;
}, [currentUser.uid]);
useEffect(() => {
const unsub = onSnapshot(
query(collection(db, "builds"), orderBy("createdAt", "desc")),
snap => setUserBuilds(snap.docs.filter(d => d.data().authorId === currentUser.uid).map(
);
return unsub;
}, [currentUser.uid]);
const handleFile = async (e) => {
const file = e.target.files?.[0];
if (!file) return;
setPhoto(await readFileAsDataUrl(file));
};
const saveProfile = async () => {
setSaving(true);
const updates = { displayName: editName, bio: editBio };
if (photo) updates.photoURL = photo;
await updateDoc(doc(db, "users", currentUser.uid), updates);
await updateProfile(auth.currentUser, { displayName: editName, ...(photo ? { photoURL: ph
setSaving(false); setEditing(false); setPhoto(null);
};
if (!profile) return <div className="flex items-center justify-center h-64"><div className=
if (editing) return (
<div className="pb-24 px-4 pt-6">
<div className="flex items-center justify-between mb-6">
<button onClick={() => setEditing(false)} className="flex items-center gap-2 text-sm
<h1 className="text-base font-bold text-gray-900">Edit Profile</h1>
<button onClick={saveProfile} disabled={saving} className="text-sm font-semibold text
</div>
<div className="flex flex-col items-center gap-3 mb-6">
<div className="relative">
{photo || profile.photoURL
? <img src={photo || profile.photoURL} alt="" className="w-24 h-24 rounded-2xl ob
: <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getGradient(currentU
}
<button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -rig
</div>
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handle
</div>
<div className="space-y-4">
<div><label className="text-sm font-medium text-gray-700 block mb-1.5">Display Name</
<div><label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label><te
<button onClick={saveProfile} disabled={saving} className={`w-full py-3.5 rounded-xl
</div>
</div>
);
return (
<div className="pb-24">
<div className="px-4 pt-6 pb-4">
<div className="flex items-center gap-4 mb-4">
{profile.photoURL
? <img src={profile.photoURL} alt="" className="w-16 h-16 rounded-2xl object-cove
: <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(currentU
}
<div><h2 className="text-xl font-bold text-gray-900">{profile.displayName}</h2><p c
</div>
<p className="text-sm text-gray-500 mb-4">{profile.bio}</p>
<div className="grid grid-cols-3 gap-3 mb-4">
{[["Builds", userBuilds.length], ["Followers", (profile.followers || []).length], [
<div key={label} className="bg-gray-50 rounded-xl py-3 text-center"><p className=
))}
</div>
<div className="flex gap-2">
<button onClick={() => { setEditName(profile.displayName); setEditBio(profile.bio);
<button onClick={onSignOut} className="py-2.5 px-4 border border-gray-200 rounded-x
</div>
</div>
<div className="flex border-b border-gray-100 px-4 mb-4">
<button onClick={() => setActiveTab("builds")} className={`flex-1 py-3 text-sm </div>
<div className="px-4">
{userBuilds.length === 0
? <div className="flex flex-col items-center justify-center text-center py-16 gap-3
: <div className="grid grid-cols-2 gap-3">{userBuilds.map(b => <BuildCard key={b.id
font-s
}
</div>
</div>
);
}
// ── Help Page ────────────────────────────────────────────────────────────────
function HelpPage() {
const [open, setOpen] = useState(null);
const [msg, setMsg] = useState("");
const [sent, setSent] = useState(false);
const faqs = [
["How do I upload a build?", "Tap the Upload tab, fill in your build details, then add a
["How do I create instructions?", "Go to the Guide tab, pick a build, then add steps one
["Can I edit my profile?", "Yes! Go to Profile and tap Edit Profile to update your name,
["How do I like a post?", "Tap the heart icon on any post in the Community feed."],
["Is BrickBuilder free?", "Absolutely — BrickBuilder is free for everyone!"],
];
return (
<div className="pb-24 px-4 pt-6">
<h1 className="text-2xl font-bold text-gray-900 mb-1">Help & Support</h1>
<p className="text-sm text-gray-400 mb-6">Find answers or get in touch</p>
<div className="space-y-2 mb-8">
{faqs.map(([q, a], i) => (
<div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden
<button onClick={() => setOpen(open === i ? null : i)} className="w-full flex ite
<span className="text-sm font-medium text-gray-800 pr-3">{q}</span>
<ChevronRight size={16} className={`text-gray-300 shrink-0 transition-transform
</button>
{open === i && <div className="px-4 pb-4 text-sm text-gray-500 border-t border-gr
</div>
))}
</div>
{sent ? (
) : (
</div>
<div className="bg-gray-50 rounded-2xl p-6 text-center"><Check size={32} className="m
<div className="bg-gray-50 rounded-2xl p-4 space-y-3">
<textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Describe
<button onClick={() => msg && setSent(true)} className={`w-full py-3 rounded-xl tex
)}
</div>
);
}
// ── Root App ─────────────────────────────────────────────────────────────────
// Fix: alias the firestore query function to avoid name clash
const query_firestore = query;
export default function BrickBuilderApp() {
const [currentUser, setCurrentUser] = useState(undefined); // undefined = loading
const [tab, setTab] = useState("home");
const [viewBuild, setViewBuild] = useState(null);
const [instructionsBuild, setInstructionsBuild] = useState(null);
useEffect(() => {
const unsub = onAuthStateChanged(auth, user => setCurrentUser(user || null));
return unsub;
}, []);
const handleSignOut = async () => { await signOut(auth); setCurrentUser(null); };
// Loading state
if (currentUser === undefined) {
return (
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
<div className="flex flex-col items-center gap-3">
<div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center"
<div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full ani
</div>
</div>
);
}
// Auth screen
if (!currentUser) return <AuthScreen onAuth={setCurrentUser} />;
// Main app
return (
<div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative font-sans">
<div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px
<div className="flex items-center gap-2">
<div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center"><G
<span className="text-base font-bold text-gray-900 tracking-tight">BrickBuilder</sp
</div>
<div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(currentUser.uid
{(currentUser.displayName || "?")[0].toUpperCase()}
</div>
</div>
<div className="overflow-y-auto">
{tab === "home" && <HomePage onViewBuild={setViewBuild} currentUser={currentUser} />}
{tab === "community" && <CommunityPage currentUser={currentUser} />}
{tab === "upload" && <UploadPage currentUser={currentUser} />}
{tab === "instructions" && <InstructionsPage preloadBuild={instructionsBuild} current
{tab === "profile" && <ProfilePage currentUser={currentUser} onSignOut={handleSignOut
{tab === "help" && <HelpPage />}
</div>
{viewBuild && <BuildDetail build={viewBuild} onClose={() => setViewBuild(null)} onViewI
<nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/95 ba
<div className="flex justify-around">
{NAV_ITEMS.map(({ id, label, icon: Icon }) => (
<button key={id} onClick={() => { setTab(id); if (id !== "instructions") setInstr
<Icon size={20} strokeWidth={tab === id ? 2.5 : 1.8} />
<span className="text-xs font-medium">{label}</span>
</button>
))}
}
);
</div>
</nav>
</div>
