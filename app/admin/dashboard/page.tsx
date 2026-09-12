"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

type EventItem = {
  id: string;
  title: string;
  description: string;
  naverFormUrl: string;
  isActive: boolean;
  imageUrl?: string | null;
};

const emptyForm = {
  title: "",
  description: "",
  naverFormUrl: "",
  isActive: true,
  imageUrl: "",
};

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function loadEvents() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function startEdit(event: EventItem) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      naverFormUrl: event.naverFormUrl,
      isActive: event.isActive,
      imageUrl: event.imageUrl || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handlePhotoUpload(file: File) {
    setError("");
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
      });

      const formData = new FormData();
      formData.append("file", compressed, file.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setError("사진 업로드에 실패했습니다.");
        return;
      }

      const data = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      console.error(err);
      setError("사진 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/events/${editingId}` : "/api/events";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      resetForm();
      loadEvents();
    } else {
      const data = await res.json();
      setError(data.error || "저장에 실패했습니다.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제할까요?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    loadEvents();
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="container">
      <div className="top-bar">
        <h1 style={{ margin: 0 }}>관리자 대시보드</h1>
        <button className="secondary" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <h2>{editingId ? "행사 수정" : "새 행사 등록"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="행사 제목"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="행사 설명"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="네이버폼 링크 (https://naver...)"
          value={form.naverFormUrl}
          onChange={(e) => setForm({ ...form, naverFormUrl: e.target.value })}
          required
        />

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>행사 사진</label>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => e.target.files && handlePhotoUpload(e.target.files[0])}
          />
          {uploading && <p>업로드 중...</p>}
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="미리보기"
              style={{ maxWidth: 200, marginTop: 8, display: "block" }}
            />
          )}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <input
            type="checkbox"
            style={{ width: "auto" }}
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          진행중으로 표시
        </label>

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editingId ? "수정 완료" : "등록"}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={resetForm}>
              취소
            </button>
          )}
        </div>
      </form>

      <h2 style={{ marginTop: 32 }}>등록된 행사 목록</h2>
      {events.map((event) => (
        <div key={event.id} className="admin-row">
          <div>
            <span className={`badge ${event.isActive ? "active" : "closed"}`}>
              {event.isActive ? "진행중" : "마감"}
            </span>
            <div className="event-title">{event.title}</div>
          </div>
          <div className="admin-row-actions">
            <button className="secondary" onClick={() => startEdit(event)}>
              수정
            </button>
            <button className="danger" onClick={() => handleDelete(event.id)}>
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}