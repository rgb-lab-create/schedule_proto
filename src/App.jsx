import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COLOR_PALETTES = [
  {
    id: "misty",
    name: "Misty Garden",
    colors: ["#B5C4B1","#C9B8A8","#D4C5B0","#A8B8C8","#C5B8D4","#B8C8A8","#D4B8B8","#C8D4B8","#B8D4C8","#D4D4B8"],
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    colors: ["#2C4A6E","#3D6B8C","#1E3A5F","#4A6E8C","#2C5A7A","#1A4A6E","#3A5C7A","#2A3F5F","#4A7A8C","#1E5070"],
  },
  {
    id: "terracotta",
    name: "Terracotta Dusk",
    colors: ["#C4785A","#8C4A3A","#D4956E","#A86450","#7A3A2A","#C48A6E","#8C5A4A","#D4A87A","#A87050","#6E3A2A"],
  },
  {
    id: "sage",
    name: "Sage & Stone",
    colors: ["#7A8C6E","#9CA882","#5C6E50","#8C9A78","#6E7C5C","#A0AA8A","#5A6A4A","#8A9870","#6A7A58","#9AA680"],
  },
  {
    id: "lavender",
    name: "Lavender Mist",
    colors: ["#8C7AAA","#AA94C8","#6E5A8C","#C8B4D4","#7A6898","#9A84B8","#5E4A7A","#B8A4CC","#7870A0","#AA98C4"],
  },
  {
    id: "amber",
    name: "Amber Forge",
    colors: ["#C4902A","#8C5C10","#D4AA4A","#A87020","#6A3C08","#C4A040","#8C6420","#D4B860","#A08030","#5C3408"],
  },
  {
    id: "nordic",
    name: "Nordic Frost",
    colors: ["#4A6E7A","#8CAAB8","#2C4E5A","#6A8E9C","#3A5E6A","#9ABCC8","#2A3E4A","#5A7E8C","#4A6E7C","#7A9CAA"],
  },
  {
    id: "rose",
    name: "Rose Smoke",
    colors: ["#C47A8A","#8C4A5A","#D49AAA","#A46070","#7A3A4A","#C48A98","#8A5060","#D4AAB8","#A06878","#6A3040"],
  },
];

const DEFAULT_CATEGORIES = ["작업", "개인용무", "잠", "식사", "휴식"];

const TASK_STATUS = { TODO: "todo", IN_PROGRESS: "in_progress", DONE: "done" };

const ENCOURAGEMENTS = [
  "잘했어요! 정말 대단해요! 🌟",
  "완료! 오늘도 멋지게 해냈군요! ✨",
  "훌륭해요! 한 걸음씩 나아가고 있어요! 🎉",
  "최고예요! 자랑스럽게 생각해요! 💪",
  "완벽해요! 이 기세로 쭉 가요! 🚀",
];

const CLICK_DIALOGUES = [
  "오늘도 화이팅! 당신은 할 수 있어요!",
  "집중하다 지쳤나요? 잠깐 쉬어도 괜찮아요 😊",
  "지금 이 순간도 충분히 잘하고 있어요!",
  "작은 것부터 하나씩, 그게 비결이에요 🌱",
  "오늘 할 일이 많아도, 당신이라면 할 수 있어요!",
];

const TODAY_MESSAGES = [
  "오늘도 최선을 다해봐요! 🌸",
  "하나씩 차근차근, 잘 해낼 거예요! ⭐",
  "지금 시작하면 충분해요, 화이팅! 🎯",
  "오늘의 작은 성취가 쌓여 큰 변화가 돼요! 💫",
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const getDateKey = (date) => date.toISOString().split("T")[0];
const getTodayKey = () => getDateKey(new Date());

const loadDayData = (dateKey) => {
  try {
    const raw = localStorage.getItem(`scheduler_day_${dateKey}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveDayData = (dateKey, data) => {
  try {
    localStorage.setItem(`scheduler_day_${dateKey}`, JSON.stringify(data));
  } catch (e) { console.error("Save failed", e); }
};

const loadCategories = () => {
  try {
    const raw = localStorage.getItem("scheduler_categories");
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
};

const saveCategories = (cats) => {
  localStorage.setItem("scheduler_categories", JSON.stringify(cats));
};

const emptyDayData = (prevPaletteId) => ({
  tasks: [],
  checklist: [],
  memo: "",
  paletteId: prevPaletteId || COLOR_PALETTES[0].id,
  characterMessage: TODAY_MESSAGES[Math.floor(Math.random() * TODAY_MESSAGES.length)],
});

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const minutesToHHMM = (mins) => {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const parseTimeToMins = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// ─── PALETTE PICKER ───────────────────────────────────────────────────────────

function PalettePicker({ currentId, onChange }) {
  const [open, setOpen] = useState(false);
  const current = COLOR_PALETTES.find(p => p.id === currentId) || COLOR_PALETTES[0];
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10, padding: "7px 14px", cursor: "pointer", color: "#e8e0d5",
          fontSize: 13, fontFamily: "inherit",
        }}
      >
        <span style={{ display: "flex", gap: 3 }}>
          {current.colors.slice(0, 5).map((c, i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c, display: "inline-block" }} />
          ))}
        </span>
        <span>{current.name}</span>
        <span style={{ opacity: 0.6 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "110%", left: 0, zIndex: 999,
          background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", gap: 8,
          minWidth: 260, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {COLOR_PALETTES.map(p => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: p.id === currentId ? "rgba(255,255,255,0.12)" : "transparent",
                border: "none", borderRadius: 8, padding: "6px 10px",
                cursor: "pointer", color: "#e8e0d5", fontSize: 13, fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ display: "flex", gap: 3 }}>
                {p.colors.slice(0, 7).map((c, i) => (
                  <span key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c, display: "inline-block" }} />
                ))}
              </span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COLOR PICKER FOR TASK ────────────────────────────────────────────────────

function TaskColorPicker({ palette, value, onChange }) {
  const colors = (COLOR_PALETTES.find(p => p.id === palette) || COLOR_PALETTES[0]).colors;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {colors.map((c, i) => (
        <button
          key={i}
          onClick={() => onChange(c)}
          style={{
            width: 22, height: 22, borderRadius: 6, background: c, border: "none",
            cursor: "pointer", outline: value === c ? "2px solid #fff" : "none",
            outlineOffset: 2, transition: "transform 0.15s",
            transform: value === c ? "scale(1.2)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

// ─── TIME RANGE INPUT ─────────────────────────────────────────────────────────

function TimeRangeInput({ entry, onChange, onAdd, onRemove }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <input
        type="time" value={entry.start || ""}
        onChange={e => onChange({ ...entry, start: e.target.value })}
        style={inputStyle}
      />
      <span style={{ color: "#888", fontSize: 12 }}>~</span>
      <input
        type="time" value={entry.end || ""}
        onChange={e => onChange({ ...entry, end: e.target.value })}
        style={inputStyle}
      />
      <button onClick={onAdd} style={smallBtnStyle("#4a7a5a")}>+구간</button>
      {onRemove && <button onClick={onRemove} style={smallBtnStyle("#7a4a4a")}>✕</button>}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 7, color: "#e8e0d5", padding: "4px 8px", fontSize: 12,
  fontFamily: "inherit",
};

const smallBtnStyle = (bg) => ({
  background: bg, border: "none", borderRadius: 6, color: "#fff",
  fontSize: 11, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit",
});

// ─── TASK ITEM ────────────────────────────────────────────────────────────────

function TaskItem({ task, palette, onUpdate, onComplete, categories }) {
  const [expanded, setExpanded] = useState(false);

  const statusLabel = {
    [TASK_STATUS.TODO]: { text: "대기", bg: "rgba(255,255,255,0.1)" },
    [TASK_STATUS.IN_PROGRESS]: { text: "진행중", bg: "rgba(90,140,200,0.3)" },
    [TASK_STATUS.DONE]: { text: "완료", bg: "rgba(80,160,100,0.3)" },
  }[task.status];

  const addTimeRange = () => {
    const newRanges = [...(task.timeRanges || []), { start: "", end: "" }];
    const newStatus = task.status === TASK_STATUS.TODO ? TASK_STATUS.IN_PROGRESS : task.status;
    onUpdate({ ...task, timeRanges: newRanges, status: newStatus });
  };

  const updateRange = (i, val) => {
    const newRanges = [...(task.timeRanges || [])];
    newRanges[i] = val;
    onUpdate({ ...task, timeRanges: newRanges });
  };

  const removeRange = (i) => {
    const newRanges = (task.timeRanges || []).filter((_, idx) => idx !== i);
    onUpdate({ ...task, timeRanges: newRanges });
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", borderRadius: 12,
      border: `1.5px solid ${task.color || "#555"}44`,
      borderLeft: `4px solid ${task.color || "#888"}`,
      marginBottom: 8, padding: "10px 14px",
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: task.color || "#888", flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, background: statusLabel.bg, borderRadius: 5,
          padding: "2px 7px", color: "#e8e0d5", flexShrink: 0,
        }}>{statusLabel.text}</span>
        <span style={{ fontSize: 11, color: "#aaa", flexShrink: 0 }}>[{task.category}]</span>
        <span style={{ fontSize: 14, color: "#e8e0d5", flex: 1 }}>{task.content}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16 }}
        >{expanded ? "▲" : "▼"}</button>
        {task.status !== TASK_STATUS.DONE && (
          <button
            onClick={() => onComplete(task.id)}
            style={{
              background: "rgba(80,160,100,0.3)", border: "1px solid rgba(80,160,100,0.5)",
              borderRadius: 7, color: "#a0e0b0", fontSize: 11, padding: "3px 10px",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >완료✓</button>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#aaa" }}>색상</span>
            <div style={{ marginTop: 4 }}>
              <TaskColorPicker
                palette={palette}
                value={task.color}
                onChange={c => onUpdate({ ...task, color: c })}
              />
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: "#aaa" }}>수행 시간 구간</span>
            {(task.timeRanges || []).map((r, i) => (
              <TimeRangeInput
                key={i} entry={r}
                onChange={v => updateRange(i, v)}
                onAdd={addTimeRange}
                onRemove={i > 0 ? () => removeRange(i) : undefined}
              />
            ))}
            {(task.timeRanges || []).length === 0 && (
              <button onClick={addTimeRange} style={{ ...smallBtnStyle("#4a5a7a"), marginTop: 6 }}>
                + 시간 입력 시작
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD TASK FORM ────────────────────────────────────────────────────────────

function AddTaskForm({ palette, categories, onAdd, onClose }) {
  const colors = (COLOR_PALETTES.find(p => p.id === palette) || COLOR_PALETTES[0]).colors;
  const [cat, setCat] = useState(categories[0] || "작업");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(colors[0]);

  const handleAdd = () => {
    if (!content.trim()) return;
    onAdd({ category: cat, content: content.trim(), color });
    setContent("");
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.12)", padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <select
          value={cat} onChange={e => setCat(e.target.value)}
          style={{ ...inputStyle, flex: "0 0 auto", cursor: "pointer" }}
        >
          {categories.map(c => <option key={c} value={c} style={{ background: "#1e1e2e" }}>{c}</option>)}
        </select>
        <input
          value={content} onChange={e => setContent(e.target.value)}
          placeholder="할 일 입력..."
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
      <TaskColorPicker palette={palette} value={color} onChange={setColor} />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={handleAdd} style={{ ...smallBtnStyle("#4a5a7a"), padding: "6px 16px", fontSize: 13 }}>
          추가
        </button>
        <button onClick={onClose} style={{ ...smallBtnStyle("#555"), padding: "6px 16px", fontSize: 13 }}>
          취소
        </button>
      </div>
    </div>
  );
}

// ─── TIMETABLE ────────────────────────────────────────────────────────────────

function TimeTable({ tasks }) {
  // Build a 24 x 6 grid (hours x 10-min-slots)
  const grid = Array.from({ length: 24 }, () => Array(6).fill(null));

  tasks.forEach(task => {
    (task.timeRanges || []).forEach(range => {
      const start = parseTimeToMins(range.start);
      const end = parseTimeToMins(range.end);
      if (start == null || end == null || end <= start) return;
      for (let m = start; m < end; m += 10) {
        const h = Math.floor(m / 60);
        const slot = Math.floor((m % 60) / 10);
        if (h < 24 && slot < 6) {
          grid[h][slot] = task.color || "#888";
        }
      }
    });
  });

  const hours = Array.from({ length: 24 }, (_, i) => {
    const label = i === 0 ? "오전 12" : i < 12 ? `오전 ${i}` : i === 12 ? "오후 12" : `오후 ${i - 12}`;
    return label;
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 360 }}>
        {/* Header */}
        <div style={{ display: "flex", marginBottom: 2 }}>
          <div style={{ width: 64, flexShrink: 0 }} />
          {["10","20","30","40","50","60"].map(m => (
            <div key={m} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#666" }}>{m}</div>
          ))}
        </div>
        {/* Rows */}
        {hours.map((label, h) => (
          <div key={h} style={{ display: "flex", marginBottom: 1 }}>
            <div style={{ width: 64, flexShrink: 0, fontSize: 10, color: "#666", paddingRight: 6, textAlign: "right", paddingTop: 3 }}>
              {label}
            </div>
            {grid[h].map((color, s) => (
              <div
                key={s}
                style={{
                  flex: 1, height: 18, borderRadius: 3,
                  background: color || "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.05)",
                  margin: "0 1px",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DAILY STATS ─────────────────────────────────────────────────────────────

function DailyStats({ tasks, checklist, categories }) {
  const statsByCategory = {};
  categories.forEach(c => { statsByCategory[c] = { time: 0, done: 0, total: 0 }; });

  tasks.forEach(task => {
    if (!statsByCategory[task.category]) statsByCategory[task.category] = { time: 0, done: 0, total: 0 };
    statsByCategory[task.category].total += 1;
    if (task.status === TASK_STATUS.DONE) statsByCategory[task.category].done += 1;
    (task.timeRanges || []).forEach(r => {
      const s = parseTimeToMins(r.start), e = parseTimeToMins(r.end);
      if (s != null && e != null && e > s) statsByCategory[task.category].time += e - s;
    });
  });

  const checkDone = checklist.filter(c => c.checked).length;
  const checkTotal = checklist.length;

  return (
    <div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 10, fontWeight: 600 }}>📊 오늘의 통계</div>
      {Object.entries(statsByCategory)
        .filter(([, v]) => v.total > 0)
        .map(([cat, v]) => (
          <div key={cat} style={{
            background: "rgba(255,255,255,0.04)", borderRadius: 10,
            padding: "8px 12px", marginBottom: 6,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#e8e0d5" }}>
              <span>{cat}</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>
                {minutesToHHMM(v.time)} | {v.done}/{v.total} 완료
              </span>
            </div>
            <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: "rgba(120,180,140,0.7)",
                width: `${v.total > 0 ? (v.done / v.total) * 100 : 0}%`,
                transition: "width 0.3s",
              }} />
            </div>
          </div>
        ))}
      {checkTotal > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.04)", borderRadius: 10,
          padding: "8px 12px", marginTop: 4,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#e8e0d5" }}>
            <span>체크리스트</span>
            <span style={{ color: "#aaa", fontSize: 12 }}>{checkDone}/{checkTotal} 완료</span>
          </div>
          <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: "rgba(180,140,200,0.7)",
              width: `${checkTotal > 0 ? (checkDone / checkTotal) * 100 : 0}%`,
              transition: "width 0.3s",
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

function ChecklistPanel({ items, onUpdate, onAdd, onShowEncouragement }) {
  const [newText, setNewText] = useState("");
  const [newTime, setNewTime] = useState("");

  const addItem = () => {
    if (!newText.trim()) return;
    onAdd({ id: Date.now().toString(), text: newText.trim(), time: newTime, checked: false });
    setNewText(""); setNewTime("");
  };

  const toggle = (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (!item.checked) onShowEncouragement();
    onUpdate(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 10, fontWeight: 600 }}>📋 체크리스트</div>
      {items.map(item => (
        <div
          key={item.id}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 6, opacity: item.checked ? 0.5 : 1,
          }}
        >
          <input
            type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}
            style={{ cursor: "pointer", accentColor: "#a0c0e0", width: 16, height: 16 }}
          />
          <span style={{
            fontSize: 13, color: "#e8e0d5", flex: 1,
            textDecoration: item.checked ? "line-through" : "none",
          }}>{item.text}</span>
          {item.time && <span style={{ fontSize: 11, color: "#888" }}>{item.time}</span>}
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input
          value={newText} onChange={e => setNewText(e.target.value)}
          placeholder="항목 추가..."
          onKeyDown={e => e.key === "Enter" && addItem()}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
          style={{ ...inputStyle, width: 90 }}
        />
        <button onClick={addItem} style={smallBtnStyle("#4a5a7a")}>+</button>
      </div>
    </div>
  );
}

// ─── CHARACTER WIDGET ─────────────────────────────────────────────────────────

function CharacterWidget({ message, onShowEncouragement }) {
  const [charPos, setCharPos] = useState({ x: 0, y: 0 });
  const [bubble, setBubble] = useState(null);
  const posRef = useRef({ x: 0, y: 0, vx: 0.3, vy: 0.2 });
  const frameRef = useRef(null);
  const containerRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  // Gentle floating animation
  useEffect(() => {
    const animate = () => {
      const p = posRef.current;
      const bounds = { x: 60, y: 40 };
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > bounds.x || p.x < -bounds.x) p.vx *= -1;
      if (p.y > bounds.y || p.y < -bounds.y) p.vy *= -1;
      setCharPos({ x: p.x, y: p.y });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleClick = () => {
    const msg = randomItem(CLICK_DIALOGUES);
    setBubble(msg);
    setTimeout(() => setBubble(null), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target.result);
      localStorage.setItem("scheduler_character_img", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const saved = localStorage.getItem("scheduler_character_img");
    if (saved) setImageUrl(saved);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", height: 130, marginBottom: 8 }}>
      {/* Character */}
      <div
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: `translate(calc(-50% + ${charPos.x}px), calc(-50% + ${charPos.y}px))`,
          cursor: "pointer", userSelect: "none",
        }}
        onClick={handleClick}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="character" style={{ width: 70, height: 70, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }} />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #a0b8e0, #c0a0d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}>🌟</div>
        )}
      </div>
      {/* Speech bubble */}
      {(bubble) && (
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          background: "rgba(30,30,50,0.95)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12, padding: "8px 14px", fontSize: 12, color: "#e8e0d5",
          whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          animation: "fadeIn 0.3s ease",
          zIndex: 10,
        }}>
          {bubble}
        </div>
      )}
      {/* Upload button */}
      <label style={{
        position: "absolute", bottom: 0, right: 0,
        background: "rgba(255,255,255,0.08)", borderRadius: 7,
        padding: "3px 8px", fontSize: 10, color: "#888",
        cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)",
      }}>
        이미지 {imageUrl ? "변경" : "설정"}
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
      </label>
    </div>
  );
}

// ─── DATE NAVIGATOR ───────────────────────────────────────────────────────────

function DateNavigator({ currentDate, onChange }) {
  const goBack = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onChange(d);
  };
  const goForward = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    if (d <= new Date()) onChange(d);
  };
  const isToday = getDateKey(currentDate) === getTodayKey();
  const fmt = currentDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <button onClick={goBack} style={{ ...smallBtnStyle("rgba(255,255,255,0.08)"), fontSize: 16, padding: "2px 10px" }}>←</button>
      <span style={{ fontSize: 15, color: "#e8e0d5", fontWeight: 600 }}>{fmt}</span>
      {!isToday && (
        <button onClick={goForward} style={{ ...smallBtnStyle("rgba(255,255,255,0.08)"), fontSize: 16, padding: "2px 10px" }}>→</button>
      )}
      {!isToday && (
        <button onClick={() => onChange(new Date())} style={{ ...smallBtnStyle("rgba(100,140,200,0.3)"), fontSize: 12, padding: "3px 10px" }}>오늘</button>
      )}
    </div>
  );
}

// ─── CATEGORY MANAGER ─────────────────────────────────────────────────────────

function CategoryManager({ categories, onUpdate, onClose }) {
  const [cats, setCats] = useState([...categories]);
  const [newCat, setNewCat] = useState("");

  const add = () => {
    if (newCat.trim() && !cats.includes(newCat.trim())) {
      setCats([...cats, newCat.trim()]);
      setNewCat("");
    }
  };
  const remove = (c) => setCats(cats.filter(x => x !== c));
  const save = () => { onUpdate(cats); onClose(); };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#1a1a2e", borderRadius: 18, padding: 24, width: 340,
        border: "1px solid rgba(255,255,255,0.15)",
      }}>
        <div style={{ fontSize: 15, color: "#e8e0d5", fontWeight: 700, marginBottom: 16 }}>구분 항목 편집</div>
        {cats.map(c => (
          <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: "#e8e0d5" }}>{c}</span>
            <button onClick={() => remove(c)} style={{ ...smallBtnStyle("#7a4a4a"), fontSize: 11 }}>삭제</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={newCat} onChange={e => setNewCat(e.target.value)}
            placeholder="새 구분 추가..."
            onKeyDown={e => e.key === "Enter" && add()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={add} style={smallBtnStyle("#4a5a7a")}>+</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={save} style={{ ...smallBtnStyle("#4a7a5a"), padding: "8px 20px", fontSize: 13 }}>저장</button>
          <button onClick={onClose} style={{ ...smallBtnStyle("#555"), padding: "8px 20px", fontSize: 13 }}>취소</button>
        </div>
      </div>
    </div>
  );
}

// ─── MONTHLY REPORT ───────────────────────────────────────────────────────────

function MonthlyReport({ onClose, categories }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const computeStats = () => {
    const days = new Date(year, month, 0).getDate();
    const stats = {};
    categories.forEach(c => { stats[c] = { time: 0, done: 0, total: 0 }; });
    let checkDone = 0, checkTotal = 0;

    for (let d = 1; d <= days; d++) {
      const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const data = loadDayData(key);
      if (!data) continue;
      (data.tasks || []).forEach(task => {
        if (!stats[task.category]) stats[task.category] = { time: 0, done: 0, total: 0 };
        stats[task.category].total += 1;
        if (task.status === TASK_STATUS.DONE) stats[task.category].done += 1;
        (task.timeRanges || []).forEach(r => {
          const s = parseTimeToMins(r.start), e = parseTimeToMins(r.end);
          if (s != null && e != null && e > s) stats[task.category].time += e - s;
        });
      });
      (data.checklist || []).forEach(item => {
        checkTotal += 1;
        if (item.checked) checkDone += 1;
      });
    }
    return { stats, checkDone, checkTotal };
  };

  const { stats, checkDone, checkTotal } = computeStats();

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#1a1a2e", borderRadius: 20, padding: 28, width: 480, maxHeight: "80vh",
        overflowY: "auto", border: "1px solid rgba(255,255,255,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 17, color: "#e8e0d5", fontWeight: 700 }}>📅 월간 리포트</span>
          <button onClick={onClose} style={{ ...smallBtnStyle("#555") }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            type="number" value={year} onChange={e => setYear(Number(e.target.value))}
            min={2020} max={2099} style={{ ...inputStyle, width: 80 }}
          />
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1} style={{ background: "#1e1e2e" }}>{i + 1}월</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 14, color: "#aaa", marginBottom: 10 }}>{year}년 {month}월 통계</div>
        {Object.entries(stats).map(([cat, v]) => (
          <div key={cat} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#e8e0d5" }}>
              <span>{cat}</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>
                총 {minutesToHHMM(v.time)} | {v.done}/{v.total} 완료
                {v.total > 0 ? ` (${Math.round(v.done / v.total * 100)}%)` : ""}
              </span>
            </div>
          </div>
        ))}
        {checkTotal > 0 && (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#e8e0d5" }}>
              <span>체크리스트</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>
                {checkDone}/{checkTotal} 완료 ({Math.round(checkDone / checkTotal * 100)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── YEARLY REPORT ────────────────────────────────────────────────────────────

function YearlyReport({ onClose, categories }) {
  const [year, setYear] = useState(new Date().getFullYear());

  const computeStats = () => {
    const stats = {};
    categories.forEach(c => { stats[c] = { time: 0, done: 0, total: 0 }; });
    let checkDone = 0, checkTotal = 0;

    for (let m = 1; m <= 12; m++) {
      const days = new Date(year, m, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const key = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const data = loadDayData(key);
        if (!data) continue;
        (data.tasks || []).forEach(task => {
          if (!stats[task.category]) stats[task.category] = { time: 0, done: 0, total: 0 };
          stats[task.category].total += 1;
          if (task.status === TASK_STATUS.DONE) stats[task.category].done += 1;
          (task.timeRanges || []).forEach(r => {
            const s = parseTimeToMins(r.start), e = parseTimeToMins(r.end);
            if (s != null && e != null && e > s) stats[task.category].time += e - s;
          });
        });
        (data.checklist || []).forEach(item => {
          checkTotal += 1;
          if (item.checked) checkDone += 1;
        });
      }
    }
    return { stats, checkDone, checkTotal };
  };

  const { stats, checkDone, checkTotal } = computeStats();

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#1a1a2e", borderRadius: 20, padding: 28, width: 480, maxHeight: "80vh",
        overflowY: "auto", border: "1px solid rgba(255,255,255,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 17, color: "#e8e0d5", fontWeight: 700 }}>📊 연간 리포트</span>
          <button onClick={onClose} style={{ ...smallBtnStyle("#555") }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            type="number" value={year} onChange={e => setYear(Number(e.target.value))}
            min={2020} max={2099} style={{ ...inputStyle, width: 100 }}
          />
          <span style={{ fontSize: 13, color: "#aaa", alignSelf: "center" }}>년 전체</span>
        </div>
        {Object.entries(stats).map(([cat, v]) => (
          <div key={cat} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#e8e0d5" }}>
              <span>{cat}</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>
                총 {minutesToHHMM(v.time)} | {v.done}/{v.total} 완료
                {v.total > 0 ? ` (${Math.round(v.done / v.total * 100)}%)` : ""}
              </span>
            </div>
          </div>
        ))}
        {checkTotal > 0 && (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#e8e0d5" }}>
              <span>체크리스트</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>
                {checkDone}/{checkTotal} ({Math.round(checkDone / checkTotal * 100)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CLOCK ────────────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "center", marginBottom: 12 }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#e8e0d5", letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>
        {time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div style={{ fontSize: 13, color: "#888" }}>
        {time.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
      </div>
    </div>
  );
}

// ─── ENCOURAGEMENT TOAST ──────────────────────────────────────────────────────

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
      background: "linear-gradient(135deg, rgba(80,120,180,0.95), rgba(120,80,160,0.95))",
      borderRadius: 16, padding: "14px 28px", fontSize: 15, color: "#fff",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 9999,
      animation: "slideUp 0.4s ease",
      border: "1px solid rgba(255,255,255,0.2)",
    }}>
      {message}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayData, setDayData] = useState(null);
  const [categories, setCategories] = useState(loadCategories());
  const [showAddTask, setShowAddTask] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showYearly, setShowYearly] = useState(false);

  const dateKey = getDateKey(currentDate);
  const isToday = dateKey === getTodayKey();

  // Load day data when date changes
  useEffect(() => {
    const saved = loadDayData(dateKey);
    if (saved) {
      setDayData(saved);
    } else {
      // Get previous day's palette as default
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevData = loadDayData(getDateKey(prevDate));
      setDayData(emptyDayData(prevData?.paletteId));
    }
  }, [dateKey]);

  // Auto-save whenever dayData changes
  useEffect(() => {
    if (dayData) saveDayData(dateKey, dayData);
  }, [dayData, dateKey]);

  const updateDayData = useCallback((updater) => {
    setDayData(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  const showEncouragement = useCallback((msg) => {
    setToast(msg || randomItem(ENCOURAGEMENTS));
  }, []);

  // Tasks
  const todos = (dayData?.tasks || []).filter(t => t.status !== TASK_STATUS.DONE);
  const dones = (dayData?.tasks || []).filter(t => t.status === TASK_STATUS.DONE);

  const addTask = (taskData) => {
    const task = {
      id: Date.now().toString(),
      ...taskData,
      status: TASK_STATUS.TODO,
      timeRanges: [],
      createdAt: new Date().toISOString(),
    };
    updateDayData(prev => ({ ...prev, tasks: [...(prev.tasks || []), task] }));
    setShowAddTask(false);
  };

  const updateTask = (updated) => {
    updateDayData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t => t.id === updated.id ? updated : t),
    }));
  };

  const completeTask = (id) => {
    updateDayData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t =>
        t.id === id ? { ...t, status: TASK_STATUS.DONE, completedAt: new Date().toISOString() } : t
      ),
    }));
    showEncouragement();
  };

  const palette = dayData?.paletteId || COLOR_PALETTES[0].id;

  const panelStyle = {
    background: "rgba(255,255,255,0.03)",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 18,
    overflowY: "auto",
    backdropFilter: "blur(8px)",
  };

  if (!dayData) return (
    <div style={{ color: "#e8e0d5", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f0f1a" }}>
      로딩 중...
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f1a1a 100%)",
      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      color: "#e8e0d5",
      padding: 16,
      boxSizing: "border-box",
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        input[type=time]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        select option { background: #1a1a2e; color: #e8e0d5; }
      `}</style>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1, color: "#c8d0e8" }}>
          ✦ FOCUS FLOW
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <PalettePicker currentId={palette} onChange={id => updateDayData(prev => ({ ...prev, paletteId: id }))} />
          <button onClick={() => setShowCatManager(true)} style={smallBtnStyle("rgba(255,255,255,0.08)")}>구분 편집</button>
          <button onClick={() => setShowMonthly(true)} style={smallBtnStyle("rgba(100,120,180,0.3)")}>월간 리포트</button>
          <button onClick={() => setShowYearly(true)} style={smallBtnStyle("rgba(120,100,180,0.3)")}>연간 리포트</button>
        </div>
      </div>

      {/* Date navigator */}
      <DateNavigator currentDate={currentDate} onChange={setCurrentDate} />

      {/* 3-column layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr 1fr",
        gap: 14,
        height: "calc(100vh - 130px)",
        minHeight: 600,
      }}>

        {/* ── COLUMN 1: Clock, Character, Checklist, Memo ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Clock */}
          <div style={panelStyle}>
            <LiveClock />
            <CharacterWidget
              message={dayData.characterMessage}
              onShowEncouragement={() => showEncouragement()}
            />
            <div style={{
              textAlign: "center", fontSize: 12, color: "#a0a8c0",
              background: "rgba(255,255,255,0.04)", borderRadius: 8,
              padding: "6px 10px", marginTop: 4, fontStyle: "italic",
            }}>
              {dayData.characterMessage}
            </div>
          </div>

          {/* Checklist */}
          <div style={{ ...panelStyle, flex: 1 }}>
            <ChecklistPanel
              items={dayData.checklist || []}
              onUpdate={items => updateDayData(prev => ({ ...prev, checklist: items }))}
              onAdd={item => updateDayData(prev => ({ ...prev, checklist: [...(prev.checklist || []), item] }))}
              onShowEncouragement={() => showEncouragement()}
            />
          </div>

          {/* Memo */}
          <div style={{ ...panelStyle }}>
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8, fontWeight: 600 }}>📝 메모</div>
            <textarea
              value={dayData.memo || ""}
              onChange={e => updateDayData(prev => ({ ...prev, memo: e.target.value }))}
              placeholder="오늘의 메모..."
              style={{
                width: "100%", minHeight: 80, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                color: "#e8e0d5", padding: 10, fontSize: 13, resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* ── COLUMN 2: Todo + Done ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
          {/* Todo */}
          <div style={{ ...panelStyle, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#c8d0e8" }}>📌 To-Do</span>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                style={smallBtnStyle(showAddTask ? "#555" : "rgba(100,130,200,0.4)")}
              >
                {showAddTask ? "닫기" : "+ 할 일 추가"}
              </button>
            </div>
            {showAddTask && (
              <AddTaskForm
                palette={palette}
                categories={categories}
                onAdd={addTask}
                onClose={() => setShowAddTask(false)}
              />
            )}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {todos.length === 0 && !showAddTask && (
                <div style={{ textAlign: "center", color: "#555", fontSize: 13, marginTop: 24 }}>
                  할 일을 추가해보세요! 🌱
                </div>
              )}
              {todos.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  palette={palette}
                  categories={categories}
                  onUpdate={updateTask}
                  onComplete={completeTask}
                />
              ))}
            </div>
          </div>

          {/* Done */}
          <div style={{ ...panelStyle, flex: "0 0 auto", maxHeight: "35%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#a0c0a8", marginBottom: 10 }}>
              ✅ Done ({dones.length})
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {dones.length === 0 && (
                <div style={{ textAlign: "center", color: "#555", fontSize: 13, marginTop: 8 }}>
                  완료된 항목이 없어요
                </div>
              )}
              {dones.map(task => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(80,160,100,0.08)",
                  borderRadius: 10, padding: "8px 12px", marginBottom: 6,
                  borderLeft: `3px solid ${task.color || "#4a8"}`,
                  opacity: 0.8,
                }}>
                  <span style={{ fontSize: 11, color: "#aaa" }}>[{task.category}]</span>
                  <span style={{ fontSize: 13, color: "#b8d8b8", textDecoration: "line-through" }}>{task.content}</span>
                  <span style={{ fontSize: 10, color: "#666", marginLeft: "auto" }}>
                    {task.completedAt ? new Date(task.completedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: Timetable + Stats ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
          {/* Timetable */}
          <div style={{ ...panelStyle, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#c8d0e8", marginBottom: 10 }}>
              🕐 타임 테이블
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <TimeTable tasks={dayData.tasks || []} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ ...panelStyle, flex: "0 0 auto" }}>
            <DailyStats
              tasks={dayData.tasks || []}
              checklist={dayData.checklist || []}
              categories={categories}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCatManager && (
        <CategoryManager
          categories={categories}
          onUpdate={cats => { setCategories(cats); saveCategories(cats); }}
          onClose={() => setShowCatManager(false)}
        />
      )}
      {showMonthly && <MonthlyReport onClose={() => setShowMonthly(false)} categories={categories} />}
      {showYearly && <YearlyReport onClose={() => setShowYearly(false)} categories={categories} />}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
