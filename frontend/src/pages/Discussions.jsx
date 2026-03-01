import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  MessageSquare, Plus, ThumbsUp, Clock, Loader2, X, Send,
  AlertCircle, ChevronDown, ChevronUp, Reply, Trash2,
} from "lucide-react";

export default function Discussions() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [replyError, setReplyError] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});

  const fetchList = async () => {
    try {
      const res = await axios.get("/api/discussions");
      setList(res.data.discussions || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchList().finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !content.trim() || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await axios.post("/api/discussions", { title, content }, { withCredentials: true });
      setTitle("");
      setContent("");
      setShowForm(false);
      await fetchList();
    } catch {
      setError("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id) => {
    if (!user || likeLoading[id]) return;
    setLikeLoading((p) => ({ ...p, [id]: true }));
    try {
      await axios.post(`/api/discussions/${id}/like`, {}, { withCredentials: true });
      await fetchList();
    } catch { /* ignore */ }
    setLikeLoading((p) => ({ ...p, [id]: false }));
  };

  const handleReply = async (id) => {
    const text = replyText[id]?.trim();
    if (!text || replyLoading[id]) return;
    setReplyLoading((p) => ({ ...p, [id]: true }));
    setReplyError((p) => ({ ...p, [id]: "" }));
    try {
      await axios.post(`/api/discussions/${id}/reply`, { content: text }, { withCredentials: true });
      setReplyText((p) => ({ ...p, [id]: "" }));
      await fetchList();
    } catch {
      setReplyError((p) => ({ ...p, [id]: "Failed to post reply." }));
    }
    setReplyLoading((p) => ({ ...p, [id]: false }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this discussion?")) return;
    setDeleteLoading((p) => ({ ...p, [id]: true }));
    try {
      await axios.delete(`/api/discussions/${id}`, { withCredentials: true });
      setList((prev) => prev.filter((d) => d._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { /* ignore */ }
    setDeleteLoading((p) => ({ ...p, [id]: false }));
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setReplyError((p) => ({ ...p, [id]: "" }));
  };

  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const Avatar = ({ name, size = "sm" }) => {
    const s = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
    return (
      <div className={`${s} rounded-full bg-blue-100 flex items-center justify-center shrink-0`}>
        <span className="font-bold text-blue-600">{name?.charAt(0)?.toUpperCase() || "?"}</span>
      </div>
    );
  };

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MessageSquare size={26} className="text-blue-600" />
            Discussions
          </h1>
          <p className="page-subtitle">Share solutions, ask questions, learn from others</p>
        </div>
        {user && (
          <button
            onClick={() => { setShowForm(!showForm); setError(""); }}
            className={`btn-primary ${showForm ? "bg-slate-600 hover:bg-slate-700" : ""}`}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Post"}
          </button>
        )}
      </div>

      {/* New post form */}
      {showForm && (
        <div className="ca-card p-6 mb-6 animate-slide-up">
          <h3 className="section-title">Create a Discussion</h3>
          {error && (
            <div className="alert-error flex items-center gap-2 mb-4">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div className="ca-field mb-4">
            <label className="ca-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your topic or question?"
              className="ca-input"
            />
          </div>
          <div className="ca-field mb-4">
            <label className="ca-label">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Share your thoughts, questions, or solutions..."
              className="ca-textarea"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={handlePost}
              disabled={!title.trim() || !content.trim() || submitting}
              className="btn-primary"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? "Posting..." : "Post Discussion"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="loading-container">
          <svg className="spinner" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><MessageSquare size={24} /></div>
          <p className="text-slate-600 font-medium">No discussions yet</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to start a conversation!</p>
          {user && (
            <button onClick={() => setShowForm(true)} className="btn-primary btn-sm mt-5">
              <Plus size={14} /> Start Discussion
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((d) => {
            const isExpanded = expandedId === d._id;
            const replies = Array.isArray(d.replies) ? d.replies : [];
            const replyCount = replies.length;
            const likedByMe = user && Array.isArray(d.likedBy) && d.likedBy.includes(user.userId || user._id);
            const canDelete = user && (user.username === d.author || user.role === "admin" || user.role === "teacher");

            return (
              <div key={d._id} className="ca-card overflow-hidden">
                {/* Discussion header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar name={d.author} size="md" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 leading-snug">{d.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="font-medium text-slate-500">{d.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {timeAgo(d.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Like */}
                      <button
                        onClick={() => handleLike(d._id)}
                        disabled={!user || likeLoading[d._id]}
                        title={user ? (likedByMe ? "Unlike" : "Like") : "Login to like"}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          likedByMe
                            ? "bg-blue-50 border-blue-300 text-blue-600"
                            : "border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                        } disabled:opacity-50`}
                      >
                        <ThumbsUp size={13} className={likedByMe ? "fill-blue-500" : ""} />
                        {d.likes || 0}
                      </button>
                      {/* Delete */}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(d._id)}
                          disabled={deleteLoading[d._id]}
                          title="Delete discussion"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          {deleteLoading[d._id] ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className={`mt-3 text-sm text-slate-600 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                    {d.content}
                  </p>

                  <button
                    onClick={() => toggleExpand(d._id)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded
                      ? "Collapse"
                      : replyCount > 0
                      ? `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                      : "Reply"}
                  </button>
                </div>

                {/* Expanded: replies + reply box */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60">
                    {replyCount > 0 ? (
                      <div className="px-5 pt-4 pb-2 space-y-4">
                        {replies.map((r, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Avatar name={r.author} size="sm" />
                            <div className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-slate-700">{r.author}</span>
                                <span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-5 pt-4 text-xs text-slate-400 italic">No replies yet — be the first!</p>
                    )}

                    {/* Reply input */}
                    {user ? (
                      <div className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <Avatar name={user.username} size="sm" />
                          <div className="flex-1">
                            <textarea
                              value={replyText[d._id] || ""}
                              onChange={(e) => setReplyText((p) => ({ ...p, [d._id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply(d._id);
                              }}
                              rows={2}
                              placeholder="Write a reply… (Ctrl+Enter to send)"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                            />
                            {replyError[d._id] && (
                              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle size={11} /> {replyError[d._id]}
                              </p>
                            )}
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleReply(d._id)}
                                disabled={!replyText[d._id]?.trim() || replyLoading[d._id]}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                {replyLoading[d._id] ? <Loader2 size={13} className="animate-spin" /> : <Reply size={13} />}
                                {replyLoading[d._id] ? "Posting..." : "Post Reply"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="px-5 py-4 text-xs text-slate-500">
                        <a href="/login" className="text-blue-600 font-semibold hover:underline">Log in</a> to reply.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!user && list.length > 0 && (
        <div className="alert-info mt-6 text-center">
          <a href="/login" className="font-semibold text-blue-700 hover:underline">Log in</a> to like and reply to discussions.
        </div>
      )}
    </div>
  );
}
