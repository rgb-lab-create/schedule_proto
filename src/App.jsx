import { useState, useEffect, useRef, useCallback } from "react";

// ─── CHARACTER IMAGE ──────────────────────────────────────────────────────────
const CHARACTER_IMAGE_URL = null;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COLOR_PALETTES = [
  { id: "misty",      name: "Misty Garden",    colors: ["#B5C4B1","#C9B8A8","#D4C5B0","#A8B8C8","#C5B8D4","#B8C8A8","#D4B8B8","#C8D4B8","#B8D4C8","#D4D4B8"] },
  { id: "deep-ocean", name: "Deep Ocean",      colors: ["#4A90D9","#5BC4B4","#7B68EE","#3CB371","#FF7F7F","#FFB347","#87CEEB","#DDA0DD","#F0E68C","#98FB98"] },
  { id: "terracotta", name: "Terracotta Dusk", colors: ["#E8845A","#C45A3A","#F0A870","#A84A2A","#F0C890","#804030","#E0A060","#C07050","#F08060","#A06040"] },
  { id: "sage",       name: "Sage & Stone",    colors: ["#6AAF7A","#9CB870","#3A8A5A","#C8C870","#5A9A9A","#A8D890","#2A7A6A","#D8A870","#8A7A50","#50A060"] },
  { id: "lavender",   name: "Lavender Mist",   colors: ["#9B7EC8","#C87EB8","#7B9EE8","#D87878","#78C8A8","#E8B850","#A868A8","#68A8D8","#E88878","#88C870"] },
  { id: "amber",      name: "Amber Forge",     colors: ["#F0A020","#E06820","#F0C840","#A04010","#F0D880","#B06820","#E08040","#C85020","#F0B050","#803010"] },
  { id: "nordic",     name: "Nordic Frost",    colors: ["#5B9BD5","#70C8A8","#E87878","#F0C860","#A878D0","#50B870","#D07090","#78B8E0","#E0A050","#60A890"] },
  { id: "rose",       name: "Rose Smoke",      colors: ["#E07890","#C04868","#F0A0A8","#A83058","#F0C8C0","#803050","#E09898","#C07080","#F0B0B8","#A05070"] },
];

const DEFAULT_CATEGORIES = ["작업", "개인용무", "잠", "식사", "휴식"];
const TASK_STATUS = { TODO: "todo", IN_PROGRESS: "in_progress", DONE: "done" };
const KO_DAYS = ["일","월","화","수","목","금","토"];
const REPEAT_DAYS_KO = ["일","월","화","수","목","금","토"];

const ENCOURAGEMENTS = ["잘했어요! 정말 대단해요! 🌟","완료! 오늘도 멋지게 해냈군요! ✨","훌륭해요! 한 걸음씩 나아가고 있어요! 🎉","최고예요! 자랑스럽게 생각해요! 💪","완벽해요! 이 기세로 쭉 가요! 🚀","해냈어요! 역시 당신이에요! 🌈"];
const CLICK_DIALOGUES = ["오늘도 화이팅! 당신은 할 수 있어요!","집중하다 지쳤나요? 잠깐 쉬어도 괜찮아요 😊","지금 이 순간도 충분히 잘하고 있어요!","작은 것부터 하나씩, 그게 비결이에요 🌱","오늘 할 일이 많아도, 당신이라면 할 수 있어요!","저 여기 있어요! 같이 해봐요 🤝"];
const TODAY_MESSAGES = ["오늘도 최선을 다해봐요! 🌸","하나씩 차근차근, 잘 해낼 거예요! ⭐","지금 시작하면 충분해요, 화이팅! 🎯","오늘의 작은 성취가 쌓여 큰 변화가 돼요! 💫","당신의 하루를 응원해요! 🌻"];

const THEMES = {
  dark: { bg:"linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#0f1a1a 100%)", panelBg:"rgba(255,255,255,0.03)", panelBorder:"rgba(255,255,255,0.08)", text:"#e8e0d5", textMuted:"#666", textSub:"#aaa", inputBg:"rgba(255,255,255,0.08)", inputBorder:"rgba(255,255,255,0.15)", titleColor:"#c8d0e8", taskBg:"rgba(255,255,255,0.04)", doneBg:"rgba(80,160,100,0.08)", statBar:"rgba(255,255,255,0.1)", scrollbar:"rgba(255,255,255,0.15)", btnSecondary:"rgba(255,255,255,0.08)", timeTableCell:"rgba(255,255,255,0.04)", timeTableBorder:"rgba(255,255,255,0.05)", bubbleBg:"rgba(20,20,40,0.97)", calBg:"#16162a", calHover:"rgba(255,255,255,0.1)" },
  light: { bg:"linear-gradient(135deg,#f0ece8 0%,#e8eaf4 50%,#e8f0ec 100%)", panelBg:"rgba(255,255,255,0.75)", panelBorder:"rgba(0,0,0,0.08)", text:"#2a2640", textMuted:"#aaa", textSub:"#666", inputBg:"rgba(0,0,0,0.05)", inputBorder:"rgba(0,0,0,0.15)", titleColor:"#3a3860", taskBg:"rgba(0,0,0,0.03)", doneBg:"rgba(80,160,100,0.07)", statBar:"rgba(0,0,0,0.08)", scrollbar:"rgba(0,0,0,0.15)", btnSecondary:"rgba(0,0,0,0.06)", timeTableCell:"rgba(0,0,0,0.04)", timeTableBorder:"rgba(0,0,0,0.06)", bubbleBg:"rgba(248,248,255,0.97)", calBg:"#f0f0fa", calHover:"rgba(0,0,0,0.07)" },
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const getDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
};
const getTodayKey = () => getDateKey(new Date());
const dateFromKey = (key) => { const [y,m,d]=key.split("-").map(Number); return new Date(y,m-1,d); };

const loadDayData = (k) => { try { const r=localStorage.getItem(`scheduler_day_${k}`); return r?JSON.parse(r):null; } catch{return null;} };
const saveDayData = (k,data) => { try{localStorage.setItem(`scheduler_day_${k}`,JSON.stringify(data));}catch(e){console.error(e);} };
const loadCategories = () => { try{const r=localStorage.getItem("scheduler_categories");return r?JSON.parse(r):DEFAULT_CATEGORIES;}catch{return DEFAULT_CATEGORIES;} };
const saveCategories = (cats) => localStorage.setItem("scheduler_categories",JSON.stringify(cats));
const loadRoutines = () => { try{const r=localStorage.getItem("scheduler_routines");return r?JSON.parse(r):[];}catch{return[];} };
const saveRoutines = (routines) => localStorage.setItem("scheduler_routines",JSON.stringify(routines));

const routineApplies = (routine, dateKey) => {
  if (routine.deletedFrom && dateKey >= routine.deletedFrom) return false;
  const date = dateFromKey(dateKey);
  const dow = date.getDay();
  const dom = date.getDate();
  if (routine.repeatType==="daily") return true;
  if (routine.repeatType==="weekly") return (routine.weekDays||[]).includes(dow);
  if (routine.repeatType==="monthly") return (routine.monthDays||[]).includes(dom);
  return false;
};

const injectRoutines = (dayData, dateKey, routines) => {
  const applicable = routines.filter(r => routineApplies(r, dateKey));
  if (!applicable.length) return dayData;
  let tasks = [...(dayData.tasks||[])];
  let checklist = [...(dayData.checklist||[])];
  applicable.forEach(r => {
    if (r.type==="todo") {
      if (!tasks.find(t=>t.routineId===r.id)) tasks.push({id:`routine_${r.id}_${dateKey}`,routineId:r.id,content:r.content,category:r.category||DEFAULT_CATEGORIES[0],color:r.color||"#888",status:TASK_STATUS.TODO,timeRanges:[],subTasks:[],createdAt:new Date().toISOString()});
    } else {
      if (!checklist.find(c=>c.routineId===r.id)) checklist.push({id:`routine_${r.id}_${dateKey}`,routineId:r.id,text:r.content,time:r.time||"",checked:false});
    }
  });
  return {...dayData,tasks,checklist};
};

const emptyDayData = (prevPaletteId) => ({tasks:[],checklist:[],memo:"",paletteId:prevPaletteId||COLOR_PALETTES[0].id,characterMessage:TODAY_MESSAGES[Math.floor(Math.random()*TODAY_MESSAGES.length)]});
const randomItem = (arr) => arr[Math.floor(Math.random()*arr.length)];
const minutesToHHMM = (mins) => { if(!mins)return"0m"; const h=Math.floor(mins/60),m=mins%60; return h>0?`${h}h ${m}m`:`${m}m`; };
const parseTimeToMins = (t) => { if(!t)return null; const[h,m]=t.split(":").map(Number); return h*60+m; };

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────

const makeStyles = (t) => ({
  input: {background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:8,color:t.text,padding:"5px 9px",fontSize:12,fontFamily:"inherit",outline:"none"},
  smallBtn: (bg,color="#e8e0d5") => ({background:bg,border:"none",borderRadius:7,color,fontSize:11,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit",transition:"opacity 0.15s"}),
  panel: {background:t.panelBg,borderRadius:18,border:`1px solid ${t.panelBorder}`,padding:14,backdropFilter:"blur(10px)"},
});

// ─── PALETTE PICKER ───────────────────────────────────────────────────────────

function PalettePicker({currentId,onChange,t}){
  const[open,setOpen]=useState(false);
  const st=makeStyles(t);const isDark=t===THEMES.dark;
  const current=COLOR_PALETTES.find(p=>p.id===currentId)||COLOR_PALETTES[0];
  return(
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{...st.smallBtn(t.btnSecondary,t.text),display:"flex",alignItems:"center",gap:5,padding:"5px 10px"}}>
        {current.colors.slice(0,6).map((c,i)=><span key={i} style={{width:11,height:11,borderRadius:3,background:c,display:"inline-block"}}/>)}
        <span style={{marginLeft:3,fontSize:11}}>{current.name}</span><span style={{opacity:.5}}>▾</span>
      </button>
      {open&&(<div style={{position:"absolute",top:"110%",left:0,zIndex:999,background:isDark?"#1e1e2e":"#f8f8ff",border:`1px solid ${t.panelBorder}`,borderRadius:13,padding:10,display:"flex",flexDirection:"column",gap:5,minWidth:230,boxShadow:"0 8px 30px rgba(0,0,0,0.35)"}}>
        {COLOR_PALETTES.map(p=>(
          <button key={p.id} onClick={()=>{onChange(p.id);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:6,background:p.id===currentId?(isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.07)"):"transparent",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",color:t.text,fontSize:11,fontFamily:"inherit",textAlign:"left"}}>
            {p.colors.map((c,i)=><span key={i} style={{width:11,height:11,borderRadius:3,background:c,display:"inline-block"}}/>)}
            <span style={{marginLeft:3}}>{p.name}</span>
          </button>
        ))}
      </div>)}
    </div>
  );
}

// ─── TASK COLOR PICKER ────────────────────────────────────────────────────────

function TaskColorPicker({palette,value,onChange}){
  const colors=(COLOR_PALETTES.find(p=>p.id===palette)||COLOR_PALETTES[0]).colors;
  return(<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{colors.map((c,i)=><button key={i} onClick={()=>onChange(c)} style={{width:20,height:20,borderRadius:5,background:c,border:"none",cursor:"pointer",outline:value===c?"2.5px solid #fff":"none",outlineOffset:2,transform:value===c?"scale(1.25)":"scale(1)",transition:"transform 0.15s"}}/>)}</div>);
}

// ─── TIME SELECT INPUT ────────────────────────────────────────────────────────

function TimeSelectInput({value,onChange,t}){
  const st=makeStyles(t);
  const hours=Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
  const minutes=["00","10","20","30","40","50"];
  const[h,m]=value?value.split(":"):[" "," "];
  return(<div style={{display:"flex",alignItems:"center",gap:2}}>
    <select value={h||""} onChange={e=>onChange(`${e.target.value}:${m||"00"}`)} style={{...st.input,width:52,padding:"5px 4px",cursor:"pointer"}}>
      <option value="">--</option>{hours.map(hh=><option key={hh} value={hh}>{hh}시</option>)}
    </select>
    <select value={m||""} onChange={e=>onChange(`${h||"00"}:${e.target.value}`)} style={{...st.input,width:52,padding:"5px 4px",cursor:"pointer"}}>
      <option value="">--</option>{minutes.map(mm=><option key={mm} value={mm}>{mm}분</option>)}
    </select>
  </div>);
}

function TimeRangeInput({entry,onChange,onAdd,onRemove,t}){
  const st=makeStyles(t);
  return(<div style={{display:"flex",alignItems:"center",gap:5,marginTop:5,flexWrap:"wrap"}}>
    <TimeSelectInput value={entry.start||""} onChange={val=>onChange({...entry,start:val})} t={t}/>
    <span style={{color:t.textMuted,fontSize:11}}>~</span>
    <TimeSelectInput value={entry.end||""} onChange={val=>onChange({...entry,end:val})} t={t}/>
    <button onClick={onAdd} style={st.smallBtn("rgba(74,122,90,0.7)")}>+구간</button>
    {onRemove&&<button onClick={onRemove} style={st.smallBtn("rgba(122,74,74,0.7)")}>✕</button>}
  </div>);
}

// ─── SUBTASK LIST ─────────────────────────────────────────────────────────────

function SubTaskList({subTasks,onUpdate,t}){
  const[newText,setNewText]=useState("");
  const st=makeStyles(t);const items=subTasks||[];
  const addSub=()=>{if(!newText.trim())return;onUpdate([...items,{id:Date.now().toString(),text:newText.trim(),checked:false}]);setNewText("");};
  const toggle=(id)=>onUpdate(items.map(s=>s.id===id?{...s,checked:!s.checked}:s));
  const remove=(id)=>onUpdate(items.filter(s=>s.id!==id));
  const move=(idx,dir)=>{const arr=[...items];const target=idx+dir;if(target<0||target>=arr.length)return;[arr[idx],arr[target]]=[arr[target],arr[idx]];onUpdate(arr);};
  const doneCount=items.filter(s=>s.checked).length;
  return(<div style={{marginTop:10}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
      <span style={{fontSize:11,color:t.textSub,fontWeight:700}}>📎 세부 목표</span>
      {items.length>0&&<span style={{fontSize:10,color:t.textMuted}}>({doneCount}/{items.length})</span>}
    </div>
    {items.length>0&&(<div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:6}}>
      {items.map((sub,idx)=>(
        <div key={sub.id} style={{display:"flex",alignItems:"center",gap:4,background:sub.checked?(t===THEMES.dark?"rgba(80,160,100,0.08)":"rgba(80,160,100,0.06)"):(t===THEMES.dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)"),borderRadius:7,padding:"4px 7px",opacity:sub.checked?.6:1}}>
          <div style={{display:"flex",flexDirection:"column",gap:1,flexShrink:0}}>
            <button onClick={()=>move(idx,-1)} disabled={idx===0} style={{background:"none",border:"none",padding:0,color:idx===0?t.textMuted:t.textSub,cursor:idx===0?"default":"pointer",fontSize:8,lineHeight:1,opacity:idx===0?.3:.7}}>▲</button>
            <button onClick={()=>move(idx,1)} disabled={idx===items.length-1} style={{background:"none",border:"none",padding:0,color:idx===items.length-1?t.textMuted:t.textSub,cursor:idx===items.length-1?"default":"pointer",fontSize:8,lineHeight:1,opacity:idx===items.length-1?.3:.7}}>▼</button>
          </div>
          <button onClick={()=>toggle(sub.id)} style={{width:18,height:18,borderRadius:5,border:"none",flexShrink:0,background:sub.checked?"rgba(80,160,100,0.5)":t.btnSecondary,color:sub.checked?"#7ad098":t.textMuted,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>{sub.checked?"✓":"○"}</button>
          <span style={{fontSize:12,color:t.text,flex:1,textDecoration:sub.checked?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub.text}</span>
          <button onClick={()=>remove(sub.id)} style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:11,flexShrink:0,padding:"0 2px"}}>✕</button>
        </div>
      ))}
    </div>)}
    <div style={{display:"flex",gap:4}}>
      <input value={newText} onChange={e=>setNewText(e.target.value)} placeholder="세부 목표 추가..." onKeyDown={e=>e.key==="Enter"&&addSub()} style={{...st.input,flex:1,minWidth:0,fontSize:11,padding:"4px 8px"}}/>
      <button onClick={addSub} style={{...st.smallBtn("rgba(74,90,122,0.6)"),padding:"3px 8px"}}>+</button>
    </div>
  </div>);
}

// ─── TASK ITEM ────────────────────────────────────────────────────────────────

function TaskItem({task,palette,onUpdate,onComplete,onRestore,categories,t,isFirst,isLast,onMoveUp,onMoveDown}){
  const[expanded,setExpanded]=useState(false);
  const st=makeStyles(t);
  const isDone=task.status===TASK_STATUS.DONE;
  const statusInfo={[TASK_STATUS.TODO]:{text:"대기",bg:"rgba(128,128,128,0.2)",col:"#aaa"},[TASK_STATUS.IN_PROGRESS]:{text:"진행중",bg:"rgba(90,140,200,0.25)",col:"#7ab0e0"},[TASK_STATUS.DONE]:{text:"완료",bg:"rgba(80,160,100,0.25)",col:"#7ad098"}}[task.status];
  const addTimeRange=()=>{const nr=[...(task.timeRanges||[]),{start:"",end:""}];const ns=task.status===TASK_STATUS.TODO?TASK_STATUS.IN_PROGRESS:task.status;onUpdate({...task,timeRanges:nr,status:ns});};
  const updateRange=(i,val)=>{const r=[...(task.timeRanges||[])];r[i]=val;onUpdate({...task,timeRanges:r});};
  const removeRange=(i)=>onUpdate({...task,timeRanges:(task.timeRanges||[]).filter((_,idx)=>idx!==i)});
  const subDone=(task.subTasks||[]).filter(s=>s.checked).length;
  const subTotal=(task.subTasks||[]).length;
  return(
    <div style={{background:t.taskBg,borderRadius:12,border:`1.5px solid ${task.color||"#555"}33`,borderLeft:`4px solid ${task.color||"#888"}`,marginBottom:8,padding:"9px 11px"}}>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        {!isDone&&(<div style={{display:"flex",flexDirection:"column",gap:1,flexShrink:0}}>
          <button onClick={onMoveUp} disabled={isFirst} style={{background:"none",border:"none",padding:0,color:isFirst?t.textMuted:t.textSub,cursor:isFirst?"default":"pointer",fontSize:9,lineHeight:1,opacity:isFirst?.25:.65}}>▲</button>
          <button onClick={onMoveDown} disabled={isLast} style={{background:"none",border:"none",padding:0,color:isLast?t.textMuted:t.textSub,cursor:isLast?"default":"pointer",fontSize:9,lineHeight:1,opacity:isLast?.25:.65}}>▼</button>
        </div>)}
        <div style={{width:7,height:7,borderRadius:"50%",background:task.color||"#888",flexShrink:0}}/>
        <span style={{fontSize:10,background:statusInfo.bg,borderRadius:5,padding:"2px 6px",color:statusInfo.col,flexShrink:0,fontWeight:600}}>{statusInfo.text}</span>
        <span style={{fontSize:10,color:t.textSub,flexShrink:0}}>[{task.category}]</span>
        <span style={{fontSize:13,color:t.text,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecoration:isDone?"line-through":"none",opacity:isDone?.7:1}}>{task.content}</span>
        {subTotal>0&&<span style={{fontSize:10,color:t.textMuted,flexShrink:0,background:t.taskBg,borderRadius:5,padding:"1px 5px",border:`1px solid ${t.panelBorder}`}}>{subDone}/{subTotal}</span>}
        {!isDone&&<button onClick={()=>setExpanded(!expanded)} style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:12,padding:"0 3px",flexShrink:0}}>{expanded?"▲":"▼"}</button>}
        {!isDone&&<button onClick={()=>onComplete(task.id)} style={{...st.smallBtn("rgba(80,160,100,0.3)","#a0e0b0"),border:"1px solid rgba(80,160,100,0.4)",flexShrink:0}}>완료 ✓</button>}
        {isDone&&<button onClick={()=>onRestore(task.id)} title="완료 취소" style={{...st.smallBtn("rgba(180,120,80,0.3)","#e0c090"),border:"1px solid rgba(180,120,80,0.4)",flexShrink:0,fontSize:10}}>↩ 되돌리기</button>}
      </div>
      {expanded&&!isDone&&(
        <div style={{marginTop:9,paddingTop:9,borderTop:`1px solid ${t.panelBorder}`}}>
          <div style={{marginBottom:8}}><span style={{fontSize:11,color:t.textSub}}>색상</span><div style={{marginTop:4}}><TaskColorPicker palette={palette} value={task.color} onChange={c=>onUpdate({...task,color:c})}/></div></div>
          <span style={{fontSize:11,color:t.textSub}}>수행 시간 구간</span>
          {(task.timeRanges||[]).map((r,i)=><TimeRangeInput key={i} entry={r} t={t} onChange={v=>updateRange(i,v)} onAdd={addTimeRange} onRemove={i>0?()=>removeRange(i):undefined}/>)}
          {(task.timeRanges||[]).length===0&&<button onClick={addTimeRange} style={{...st.smallBtn("rgba(74,90,122,0.6)"),marginTop:6}}>+ 시간 입력 시작</button>}
          <div style={{borderTop:`1px solid ${t.panelBorder}`,marginTop:10,paddingTop:2}}>
            <SubTaskList subTasks={task.subTasks||[]} onUpdate={subs=>onUpdate({...task,subTasks:subs})} t={t}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD TASK FORM ────────────────────────────────────────────────────────────

function AddTaskForm({palette,categories,onAdd,onClose,t}){
  const isDark=t===THEMES.dark;
  const colors=(COLOR_PALETTES.find(p=>p.id===palette)||COLOR_PALETTES[0]).colors;
  const[cat,setCat]=useState(categories[0]||"작업");
  const[content,setContent]=useState("");
  const[color,setColor]=useState(colors[0]);
  const st=makeStyles(t);
  const isSleep=cat==="잠";
  const handleAdd=()=>{if(!isSleep&&!content.trim())return;onAdd({category:cat,content:isSleep?"잠":content.trim(),color});setContent("");};
  return(<div style={{background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",borderRadius:12,border:`1px solid ${t.panelBorder}`,padding:12,marginBottom:10}}>
    <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
      <select value={cat} onChange={e=>setCat(e.target.value)} style={{...st.input,cursor:"pointer"}}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
      {!isSleep&&<input value={content} onChange={e=>setContent(e.target.value)} placeholder="할 일 입력..." onKeyDown={e=>e.key==="Enter"&&handleAdd()} style={{...st.input,flex:1,minWidth:100}}/>}
    </div>
    <TaskColorPicker palette={palette} value={color} onChange={setColor}/>
    <div style={{display:"flex",gap:6,marginTop:9}}>
      <button onClick={handleAdd} style={{...st.smallBtn("rgba(74,90,122,0.8)"),padding:"6px 14px",fontSize:12}}>추가</button>
      <button onClick={onClose} style={{...st.smallBtn(t.btnSecondary,t.textSub),padding:"6px 12px",fontSize:12}}>취소</button>
    </div>
  </div>);
}

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

function ChecklistPanel({items,onUpdate,onAdd,onShowEncouragement,t}){
  const[newText,setNewText]=useState("");
  const[newTime,setNewTime]=useState("");
  const st=makeStyles(t);
  const addItem=()=>{if(!newText.trim())return;onAdd({id:Date.now().toString(),text:newText.trim(),time:newTime,checked:false});setNewText("");setNewTime("");};
  const toggle=(id)=>{const item=items.find(i=>i.id===id);if(!item)return;if(!item.checked)onShowEncouragement();onUpdate(items.map(i=>i.id===id?{...i,checked:!i.checked}:i));};
  const removeItem=(id)=>onUpdate(items.filter(i=>i.id!==id));
  return(<div style={{width:"100%"}}>
    <div style={{fontSize:12,color:t.textSub,marginBottom:8,fontWeight:700}}>📋 체크리스트</div>
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {items.map(item=>(
        <div key={item.id} style={{display:"flex",alignItems:"center",gap:5,width:"100%"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:5,background:t.taskBg,borderRadius:8,padding:"5px 8px",minWidth:0,overflow:"hidden",opacity:item.checked?.5:1}}>
            {item.time&&<span style={{fontSize:10,color:t.textMuted,flexShrink:0,whiteSpace:"nowrap"}}>{item.time}</span>}
            <span style={{fontSize:12,color:t.text,flex:1,textDecoration:item.checked?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.text}</span>
          </div>
          <button onClick={()=>toggle(item.id)} style={{width:26,height:26,borderRadius:7,border:"none",flexShrink:0,background:item.checked?"rgba(80,160,100,0.5)":t.btnSecondary,color:item.checked?"#7ad098":t.textSub,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>{item.checked?"✓":"○"}</button>
          {item.checked&&<button onClick={()=>toggle(item.id)} title="완료 취소" style={{...st.smallBtn("rgba(180,120,80,0.25)","#e0c090"),fontSize:10,padding:"3px 6px",flexShrink:0}}>↩</button>}
          <button onClick={()=>removeItem(item.id)} style={{width:20,height:20,borderRadius:5,border:"none",flexShrink:0,background:"transparent",color:t.textMuted,cursor:"pointer",fontSize:11}}>✕</button>
        </div>
      ))}
    </div>
    <div style={{display:"flex",gap:4,marginTop:9,width:"100%"}}>
      <input value={newText} onChange={e=>setNewText(e.target.value)} placeholder="항목 추가..." onKeyDown={e=>e.key==="Enter"&&addItem()} style={{...st.input,flex:1,minWidth:0}}/>
      <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} style={{...st.input,width:84,flexShrink:0}}/>
      <button onClick={addItem} style={{...st.smallBtn("rgba(74,90,122,0.7)"),flexShrink:0,padding:"4px 8px"}}>+</button>
    </div>
  </div>);
}

// ─── TIMETABLE ────────────────────────────────────────────────────────────────

function TimeTable({tasks,t}){
  const grid=Array.from({length:24},()=>Array(6).fill(null));
  tasks.forEach(task=>{(task.timeRanges||[]).forEach(range=>{const start=parseTimeToMins(range.start),end=parseTimeToMins(range.end);if(start==null||end==null||end<=start)return;for(let m=start;m<end;m+=10){const h=Math.floor(m/60),s=Math.floor((m%60)/10);if(h<24&&s<6)grid[h][s]=task.color||"#888";}});});
  const hours=Array.from({length:24},(_,i)=>i===0?"자정":i<12?`오전${i}`:i===12?"정오":`오후${i-12}`);
  return(<div style={{overflowX:"auto"}}><div style={{minWidth:260}}>
    <div style={{display:"flex",marginBottom:2}}><div style={{width:44,flexShrink:0}}/>{["10","20","30","40","50","60"].map(m=><div key={m} style={{flex:1,textAlign:"center",fontSize:9,color:t.textMuted}}>{m}</div>)}</div>
    {hours.map((label,h)=>(<div key={h} style={{display:"flex",marginBottom:1}}>
      <div style={{width:44,flexShrink:0,fontSize:9,color:t.textMuted,textAlign:"right",paddingRight:5,paddingTop:3}}>{label}</div>
      {grid[h].map((color,s)=><div key={s} style={{flex:1,height:15,borderRadius:2,background:color||t.timeTableCell,border:`0.5px solid ${t.timeTableBorder}`,margin:"0 1px",transition:"background 0.3s"}}/>)}
    </div>))}
  </div></div>);
}

// ─── DAILY STATS ─────────────────────────────────────────────────────────────

function DailyStats({tasks,checklist,categories,t}){
  const stats={};
  categories.forEach(c=>{stats[c]={time:0,done:0,total:0};});
  tasks.forEach(task=>{if(!stats[task.category])stats[task.category]={time:0,done:0,total:0};stats[task.category].total+=1;if(task.status===TASK_STATUS.DONE)stats[task.category].done+=1;(task.timeRanges||[]).forEach(r=>{const s=parseTimeToMins(r.start),e=parseTimeToMins(r.end);if(s!=null&&e!=null&&e>s)stats[task.category].time+=e-s;});});
  const checkDone=checklist.filter(c=>c.checked).length;
  const checkTotal=checklist.length;
  const orderedEntries=categories.map(c=>[c,stats[c]||{time:0,done:0,total:0}]).filter(([,v])=>v.total>0);
  return(<div>
    <div style={{fontSize:12,color:t.textSub,marginBottom:7,fontWeight:700}}>📊 오늘의 통계</div>
    {orderedEntries.map(([cat,v])=>(
      <div key={cat} style={{background:t.taskBg,borderRadius:9,padding:"6px 10px",marginBottom:5}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:t.text}}><span style={{fontWeight:600}}>{cat}</span><span style={{color:t.textSub,fontSize:11}}>{minutesToHHMM(v.time)} | {v.done}/{v.total}</span></div>
        <div style={{marginTop:3,height:3,borderRadius:2,background:t.statBar}}><div style={{height:"100%",borderRadius:2,background:"rgba(120,180,140,0.8)",width:`${v.total>0?(v.done/v.total)*100:0}%`,transition:"width 0.4s"}}/></div>
      </div>
    ))}
    {checkTotal>0&&(<div style={{background:t.taskBg,borderRadius:9,padding:"6px 10px"}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:t.text}}><span style={{fontWeight:600}}>체크리스트</span><span style={{color:t.textSub,fontSize:11}}>{checkDone}/{checkTotal}</span></div>
      <div style={{marginTop:3,height:3,borderRadius:2,background:t.statBar}}><div style={{height:"100%",borderRadius:2,background:"rgba(180,140,220,0.8)",width:`${checkTotal>0?(checkDone/checkTotal)*100:0}%`,transition:"width 0.4s"}}/></div>
    </div>)}
  </div>);
}

// ─── MONTHLY REPORT ───────────────────────────────────────────────────────────

function MonthlyReport({onClose,categories,t}){
  const[year,setYear]=useState(new Date().getFullYear());
  const[month,setMonth]=useState(new Date().getMonth()+1);
  const isDark=t===THEMES.dark;const st=makeStyles(t);
  const computeStats=()=>{
    const days=new Date(year,month,0).getDate();const stats={};
    categories.forEach(c=>{stats[c]={time:0,done:0,total:0};});
    let checkDone=0,checkTotal=0;const sleepHours=[];
    for(let d=1;d<=days;d++){const key=`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const data=loadDayData(key);if(!data)continue;
      (data.tasks||[]).forEach(task=>{if(!stats[task.category])stats[task.category]={time:0,done:0,total:0};stats[task.category].total+=1;if(task.status===TASK_STATUS.DONE)stats[task.category].done+=1;(task.timeRanges||[]).forEach(r=>{const s=parseTimeToMins(r.start),e=parseTimeToMins(r.end);if(s!=null&&e!=null&&e>s){stats[task.category].time+=e-s;if(task.category==="잠")sleepHours.push({day:d,start:s,end:e});}});});
      (data.checklist||[]).forEach(item=>{checkTotal+=1;if(item.checked)checkDone+=1;});
    }
    return{stats,checkDone,checkTotal,sleepHours,days};
  };
  const{stats,checkDone,checkTotal,sleepHours,days}=computeStats();
  const fmtMin=m=>{if(m==null)return"--";const h=Math.floor(m/60)%24,mn=m%60;return`${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;};
  const avgStart=sleepHours.length>0?Math.round(sleepHours.reduce((a,b)=>a+b.start,0)/sleepHours.length):null;
  const avgEnd=sleepHours.length>0?Math.round(sleepHours.reduce((a,b)=>a+b.end,0)/sleepHours.length):null;
  const sleepByDay={};sleepHours.forEach(s=>{if(!sleepByDay[s.day])sleepByDay[s.day]=[];sleepByDay[s.day].push(s);});
  const orderedStats=categories.map(c=>[c,stats[c]||{time:0,done:0,total:0}]);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
    <div style={{background:isDark?"#1a1a2e":"#f8f8ff",borderRadius:20,padding:22,width:540,maxHeight:"85vh",overflowY:"auto",border:`1px solid ${t.panelBorder}`,boxShadow:"0 16px 48px rgba(0,0,0,0.45)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:15,color:t.text,fontWeight:700}}>📅 월간 리포트</span><button onClick={onClose} style={st.smallBtn(t.btnSecondary,t.textSub)}>✕ 닫기</button></div>
      <div style={{display:"flex",gap:7,marginBottom:16}}>
        <input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} min={2020} max={2099} style={{...st.input,width:76}}/>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{...st.input,cursor:"pointer"}}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}월</option>)}</select>
      </div>
      {sleepHours.length>0&&(<div style={{background:t.taskBg,borderRadius:12,padding:"12px 14px",marginBottom:13}}>
        <div style={{fontSize:13,color:t.text,fontWeight:700,marginBottom:8}}>😴 수면 패턴</div>
        <div style={{fontSize:12,color:t.textSub,marginBottom:10}}>평균 취침 <b style={{color:t.text}}>{fmtMin(avgStart)}</b> &nbsp;|&nbsp; 평균 기상 <b style={{color:t.text}}>{fmtMin(avgEnd)}</b> &nbsp;|&nbsp; 평균 수면 <b style={{color:t.text}}>{avgStart&&avgEnd?minutesToHHMM(avgEnd-avgStart):"--"}</b></div>
        <div style={{display:"flex",flexDirection:"column",gap:2}}>{Array.from({length:days},(_,idx)=>idx+1).filter(d=>sleepByDay[d]).map(d=>(<div key={d} style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:9,color:t.textMuted,width:22,flexShrink:0}}>{d}일</span><div style={{flex:1,height:8,background:t.statBar,borderRadius:4,position:"relative"}}>{(sleepByDay[d]||[]).map((seg,si)=><div key={si} style={{position:"absolute",height:"100%",borderRadius:4,background:"rgba(120,160,220,0.7)",left:`${(seg.start/1440)*100}%`,width:`${Math.max(1,((seg.end-seg.start)/1440)*100)}%`}}/>)}</div></div>))}</div>
      </div>)}
      {orderedStats.map(([cat,v])=>(<div key={cat} style={{background:t.taskBg,borderRadius:9,padding:"8px 11px",marginBottom:6}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:t.text}}><span style={{fontWeight:600}}>{cat}</span><span style={{color:t.textSub,fontSize:11}}>{minutesToHHMM(v.time)} | {v.done}/{v.total}{v.total>0?` (${Math.round(v.done/v.total*100)}%)`:""}</span></div>
        <div style={{marginTop:3,height:3,borderRadius:2,background:t.statBar}}><div style={{height:"100%",borderRadius:2,background:"rgba(120,180,140,0.8)",width:`${v.total>0?(v.done/v.total)*100:0}%`,transition:"width 0.4s"}}/></div>
      </div>))}
      {checkTotal>0&&(<div style={{background:t.taskBg,borderRadius:9,padding:"8px 11px"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:t.text}}><span style={{fontWeight:600}}>체크리스트</span><span style={{color:t.textSub,fontSize:11}}>{checkDone}/{checkTotal} ({checkTotal>0?Math.round(checkDone/checkTotal*100):0}%)</span></div></div>)}
    </div>
  </div>);
}

// ─── YEARLY REPORT ────────────────────────────────────────────────────────────

function YearlyReport({onClose,categories,t}){
  const[year,setYear]=useState(new Date().getFullYear());
  const isDark=t===THEMES.dark;const st=makeStyles(t);
  const computeStats=()=>{
    const stats={};categories.forEach(c=>{stats[c]={time:0,done:0,total:0};});
    let checkDone=0,checkTotal=0;const heatmap={};
    for(let m=1;m<=12;m++){const days=new Date(year,m,0).getDate();for(let d=1;d<=days;d++){const key=`${year}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const data=loadDayData(key);if(!data)continue;let dayDone=0;
      (data.tasks||[]).forEach(task=>{if(!stats[task.category])stats[task.category]={time:0,done:0,total:0};stats[task.category].total+=1;if(task.status===TASK_STATUS.DONE){stats[task.category].done+=1;dayDone++;}(task.timeRanges||[]).forEach(r=>{const s=parseTimeToMins(r.start),e=parseTimeToMins(r.end);if(s!=null&&e!=null&&e>s)stats[task.category].time+=e-s;});});
      (data.checklist||[]).forEach(item=>{checkTotal+=1;if(item.checked){checkDone+=1;dayDone++;}});heatmap[key]=dayDone;}}
    return{stats,checkDone,checkTotal,heatmap};
  };
  const{stats,checkDone,checkTotal,heatmap}=computeStats();
  const maxVal=Math.max(1,...Object.values(heatmap));
  const getHeatColor=val=>{if(!val||val===0)return t.statBar;const intensity=Math.min(val/maxVal,1);return`rgba(100,180,130,${0.12+intensity*0.75})`;};
  const orderedStats=categories.map(c=>[c,stats[c]||{time:0,done:0,total:0}]);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
    <div style={{background:isDark?"#1a1a2e":"#f8f8ff",borderRadius:20,padding:22,width:620,maxHeight:"88vh",overflowY:"auto",border:`1px solid ${t.panelBorder}`,boxShadow:"0 16px 48px rgba(0,0,0,0.45)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:15,color:t.text,fontWeight:700}}>📊 연간 리포트</span><button onClick={onClose} style={st.smallBtn(t.btnSecondary,t.textSub)}>✕ 닫기</button></div>
      <div style={{display:"flex",gap:7,marginBottom:16,alignItems:"center"}}><input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} min={2020} max={2099} style={{...st.input,width:86}}/><span style={{fontSize:12,color:t.textSub}}>년 전체</span></div>
      <div style={{background:t.taskBg,borderRadius:13,padding:"13px 15px",marginBottom:15}}>
        <div style={{fontSize:13,color:t.text,fontWeight:700,marginBottom:11}}>🗓️ 활동 히트맵</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {Array.from({length:12},(_,mi)=>mi+1).map(m=>{const days=new Date(year,m,0).getDate();return(<div key={m} style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9,color:t.textMuted,width:24,flexShrink:0}}>{m}월</span><div style={{display:"flex",gap:2,flexWrap:"nowrap"}}>{Array.from({length:days},(_,d)=>{const key=`${year}-${String(m).padStart(2,"0")}-${String(d+1).padStart(2,"0")}`;const val=heatmap[key]||0;return<div key={d} title={`${m}/${d+1}: ${val}개 완료`} style={{width:11,height:11,borderRadius:2,background:getHeatColor(val),border:`0.5px solid ${t.timeTableBorder}`}}/>;})}</div></div>);})}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,marginTop:9}}><span style={{fontSize:9,color:t.textMuted}}>적음</span>{[0.1,0.3,0.5,0.7,0.95].map(v=><div key={v} style={{width:10,height:10,borderRadius:2,background:`rgba(100,180,130,${0.12+v*0.75})`}}/>)}<span style={{fontSize:9,color:t.textMuted}}>많음</span></div>
      </div>
      {orderedStats.map(([cat,v])=>(<div key={cat} style={{background:t.taskBg,borderRadius:9,padding:"8px 11px",marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:t.text}}><span style={{fontWeight:600}}>{cat}</span><span style={{color:t.textSub,fontSize:11}}>{minutesToHHMM(v.time)} | {v.done}/{v.total}{v.total>0?` (${Math.round(v.done/v.total*100)}%)`:""}</span></div><div style={{marginTop:3,height:3,borderRadius:2,background:t.statBar}}><div style={{height:"100%",borderRadius:2,background:"rgba(120,180,140,0.8)",width:`${v.total>0?(v.done/v.total)*100:0}%`,transition:"width 0.4s"}}/></div></div>))}
      {checkTotal>0&&(<div style={{background:t.taskBg,borderRadius:9,padding:"8px 11px"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:t.text}}><span style={{fontWeight:600}}>체크리스트</span><span style={{color:t.textSub,fontSize:11}}>{checkDone}/{checkTotal} ({checkTotal>0?Math.round(checkDone/checkTotal*100):0}%)</span></div></div>)}
    </div>
  </div>);
}

// ─── [2] DATE NAVIGATOR with CALENDAR ────────────────────────────────────────

function DateNavigator({currentDate,onChange,t}){
  const[showCal,setShowCal]=useState(false);
  const[calYear,setCalYear]=useState(currentDate.getFullYear());
  const[calMonth,setCalMonth]=useState(currentDate.getMonth());
  const st=makeStyles(t);const isDark=t===THEMES.dark;
  const goBack=()=>{const d=new Date(currentDate);d.setDate(d.getDate()-1);onChange(d);};
  const goFwd=()=>{const d=new Date(currentDate);d.setDate(d.getDate()+1);onChange(d);}; // [1] no future restriction
  const isToday=getDateKey(currentDate)===getTodayKey();
  const fmt=currentDate.toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"short"});
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const todayKey=getTodayKey();const selKey=getDateKey(currentDate);
  const prevMonth=()=>{if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11);}else setCalMonth(m=>m-1);};
  const nextMonth=()=>{if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1);};
  const selectDay=(d)=>{onChange(new Date(calYear,calMonth,d));setShowCal(false);};
  const calCells=[];for(let i=0;i<firstDay;i++)calCells.push(null);for(let d=1;d<=daysInMonth;d++)calCells.push(d);
  return(<div style={{position:"relative",display:"inline-block",marginBottom:10}}>
    <div style={{display:"flex",alignItems:"center",gap:7}}>
      <button onClick={goBack} style={{...st.smallBtn(t.btnSecondary,t.textSub),fontSize:14,padding:"2px 9px"}}>←</button>
      <button onClick={()=>{setCalYear(currentDate.getFullYear());setCalMonth(currentDate.getMonth());setShowCal(v=>!v);}} style={{background:"none",border:"none",padding:"2px 4px",cursor:"pointer",fontSize:14,color:t.text,fontWeight:700,fontFamily:"inherit",borderBottom:`1px dashed ${t.textMuted}`}}>{fmt}</button>
      <button onClick={goFwd} style={{...st.smallBtn(t.btnSecondary,t.textSub),fontSize:14,padding:"2px 9px"}}>→</button>
      {!isToday&&<button onClick={()=>onChange(new Date())} style={{...st.smallBtn("rgba(100,140,200,0.4)"),fontSize:10,padding:"3px 9px"}}>오늘</button>}
    </div>
    {showCal&&(<div style={{position:"absolute",top:"110%",left:0,zIndex:900,background:t.calBg,border:`1px solid ${t.panelBorder}`,borderRadius:16,padding:14,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",minWidth:240}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <button onClick={prevMonth} style={{...st.smallBtn(t.btnSecondary,t.textSub),padding:"2px 8px",fontSize:13}}>‹</button>
        <span style={{fontSize:13,color:t.text,fontWeight:700}}>{calYear}년 {calMonth+1}월</span>
        <button onClick={nextMonth} style={{...st.smallBtn(t.btnSecondary,t.textSub),padding:"2px 8px",fontSize:13}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {KO_DAYS.map((d,i)=><div key={d} style={{textAlign:"center",fontSize:10,color:i===0?"#e07070":i===6?"#70a0e0":t.textMuted,padding:"2px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {calCells.map((d,i)=>{
          if(d===null)return<div key={`e-${i}`}/>;
          const key=`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const isSel=key===selKey;const isT=key===todayKey;const dow=new Date(calYear,calMonth,d).getDay();
          return(<button key={d} onClick={()=>selectDay(d)} style={{border:"none",borderRadius:7,padding:"5px 0",cursor:"pointer",fontSize:11,fontFamily:"inherit",background:isSel?"rgba(100,130,200,0.7)":isT?t.calHover:"transparent",color:isSel?"#fff":isT?t.titleColor:dow===0?"#e07070":dow===6?"#70a0e0":t.text,fontWeight:isSel||isT?700:400,outline:isT&&!isSel?`1px solid ${t.panelBorder}`:"none"}}>{d}</button>);
        })}
      </div>
      <button onClick={()=>setShowCal(false)} style={{...st.smallBtn(t.btnSecondary,t.textMuted),width:"100%",marginTop:10,textAlign:"center"}}>닫기</button>
    </div>)}
  </div>);
}

// ─── [4] CATEGORY MANAGER with ORDER ─────────────────────────────────────────

function CategoryManager({categories,onUpdate,onClose,t}){
  const[cats,setCats]=useState([...categories]);const[newCat,setNewCat]=useState("");
  const isDark=t===THEMES.dark;const st=makeStyles(t);
  const add=()=>{if(newCat.trim()&&!cats.includes(newCat.trim())){setCats([...cats,newCat.trim()]);setNewCat("");}};
  const remove=(c)=>setCats(cats.filter(x=>x!==c));
  const move=(idx,dir)=>{const arr=[...cats];const target=idx+dir;if(target<0||target>=arr.length)return;[arr[idx],arr[target]]=[arr[target],arr[idx]];setCats(arr);};
  const save=()=>{onUpdate(cats);onClose();};
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
    <div style={{background:isDark?"#1a1a2e":"#f8f8ff",borderRadius:18,padding:20,width:320,border:`1px solid ${t.panelBorder}`}}>
      <div style={{fontSize:14,color:t.text,fontWeight:700,marginBottom:13}}>구분 항목 편집</div>
      {cats.map((c,idx)=>(
        <div key={c} style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
          <div style={{display:"flex",flexDirection:"column",gap:1}}>
            <button onClick={()=>move(idx,-1)} disabled={idx===0} style={{background:"none",border:"none",padding:0,color:idx===0?t.textMuted:t.textSub,cursor:idx===0?"default":"pointer",fontSize:9,lineHeight:1,opacity:idx===0?.3:.7}}>▲</button>
            <button onClick={()=>move(idx,1)} disabled={idx===cats.length-1} style={{background:"none",border:"none",padding:0,color:idx===cats.length-1?t.textMuted:t.textSub,cursor:idx===cats.length-1?"default":"pointer",fontSize:9,lineHeight:1,opacity:idx===cats.length-1?.3:.7}}>▼</button>
          </div>
          <span style={{fontSize:13,color:t.text,flex:1}}>{c}</span>
          <button onClick={()=>remove(c)} style={st.smallBtn("rgba(180,80,80,0.5)")}>삭제</button>
        </div>
      ))}
      <div style={{display:"flex",gap:6,marginTop:10}}>
        <input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="새 구분 추가..." onKeyDown={e=>e.key==="Enter"&&add()} style={{...st.input,flex:1}}/>
        <button onClick={add} style={st.smallBtn("rgba(74,90,122,0.7)")}>+</button>
      </div>
      <div style={{display:"flex",gap:6,marginTop:13}}>
        <button onClick={save} style={{...st.smallBtn("rgba(74,122,90,0.8)"),padding:"7px 16px",fontSize:12}}>저장</button>
        <button onClick={onClose} style={{...st.smallBtn(t.btnSecondary,t.textSub),padding:"7px 12px",fontSize:12}}>취소</button>
      </div>
    </div>
  </div>);
}

// ─── [5] ROUTINE MANAGER ──────────────────────────────────────────────────────

function RoutineForm({routine,onChange,onSave,onCancel,categories,t,st}){
  const r=routine;const isDark=t===THEMES.dark;
  const toggleWeekDay=(d)=>{const cur=r.weekDays||[];onChange({...r,weekDays:cur.includes(d)?cur.filter(x=>x!==d):[...cur,d].sort()});};
  const toggleMonthDay=(d)=>{const cur=r.monthDays||[];onChange({...r,monthDays:cur.includes(d)?cur.filter(x=>x!==d):[...cur,d].sort((a,b)=>a-b)});};
  const colors=(COLOR_PALETTES.find(p=>p.id==="misty")||COLOR_PALETTES[0]).colors;
  return(<div style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",borderRadius:12,border:`1px solid ${t.panelBorder}`,padding:14,marginTop:10}}>
    <div style={{fontSize:12,color:t.textSub,fontWeight:700,marginBottom:10}}>루틴 설정</div>
    <div style={{display:"flex",gap:6,marginBottom:10}}>
      {["todo","checklist"].map(tp=><button key={tp} onClick={()=>onChange({...r,type:tp})} style={{...st.smallBtn(r.type===tp?"rgba(100,130,200,0.6)":t.btnSecondary,r.type===tp?"#fff":t.textSub),fontSize:11}}>{tp==="todo"?"📌 할일":"📋 체크리스트"}</button>)}
    </div>
    <input value={r.content} onChange={e=>onChange({...r,content:e.target.value})} placeholder="루틴 내용 입력..." style={{...st.input,width:"100%",marginBottom:8}}/>
    {r.type==="todo"&&<select value={r.category} onChange={e=>onChange({...r,category:e.target.value})} style={{...st.input,cursor:"pointer",marginBottom:8,width:"100%"}}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>}
    {r.type==="todo"&&(<div style={{marginBottom:10}}><div style={{fontSize:11,color:t.textSub,marginBottom:4}}>색상</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{colors.map((c,i)=><button key={i} onClick={()=>onChange({...r,color:c})} style={{width:18,height:18,borderRadius:4,background:c,border:"none",cursor:"pointer",outline:r.color===c?"2px solid #fff":"none",outlineOffset:2}}/>)}</div></div>)}
    {r.type==="checklist"&&<input type="time" value={r.time||""} onChange={e=>onChange({...r,time:e.target.value})} style={{...st.input,marginBottom:8}}/>}
    <div style={{display:"flex",gap:6,marginBottom:10}}>
      {["daily","weekly","monthly"].map(rt=><button key={rt} onClick={()=>onChange({...r,repeatType:rt})} style={{...st.smallBtn(r.repeatType===rt?"rgba(100,160,130,0.6)":t.btnSecondary,r.repeatType===rt?"#fff":t.textSub),fontSize:11}}>{rt==="daily"?"매일":rt==="weekly"?"매주":"매월"}</button>)}
    </div>
    {r.repeatType==="weekly"&&(<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>{REPEAT_DAYS_KO.map((d,i)=><button key={i} onClick={()=>toggleWeekDay(i)} style={{...st.smallBtn((r.weekDays||[]).includes(i)?"rgba(100,130,200,0.7)":t.btnSecondary,(r.weekDays||[]).includes(i)?"#fff":t.textSub),padding:"3px 8px",fontSize:11}}>{d}</button>)}</div>)}
    {r.repeatType==="monthly"&&(<div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>{Array.from({length:31},(_,i)=>i+1).map(d=><button key={d} onClick={()=>toggleMonthDay(d)} style={{...st.smallBtn((r.monthDays||[]).includes(d)?"rgba(100,130,200,0.7)":t.btnSecondary,(r.monthDays||[]).includes(d)?"#fff":t.textSub),padding:"2px 6px",fontSize:10,minWidth:24}}>{d}</button>)}</div>)}
    <div style={{display:"flex",gap:7}}>
      <button onClick={()=>onSave(r)} style={{...st.smallBtn("rgba(74,122,90,0.8)"),padding:"6px 16px",fontSize:12}}>저장</button>
      <button onClick={onCancel} style={{...st.smallBtn(t.btnSecondary,t.textSub),padding:"6px 12px",fontSize:12}}>취소</button>
    </div>
  </div>);
}

function RoutineManager({routines,onUpdate,onClose,categories,t}){
  const[list,setList]=useState(routines.filter(r=>!r.deletedFrom));
  const[editing,setEditing]=useState(null);
  const isDark=t===THEMES.dark;const st=makeStyles(t);
  const blankRoutine=()=>({id:Date.now().toString(),type:"todo",repeatType:"daily",weekDays:[],monthDays:[],content:"",category:categories[0]||"작업",color:"#888",time:""});
  const save=(r)=>{if(!r.content.trim())return;setList(prev=>{const exists=prev.find(x=>x.id===r.id);return exists?prev.map(x=>x.id===r.id?r:x):[...prev,r];});setEditing(null);};
  const deleteRoutine=(id)=>{const today=getTodayKey();const updated=routines.map(r=>r.id===id?{...r,deletedFrom:today}:r);onUpdate(updated);setList(list.filter(r=>r.id!==id));};
  const handleSaveAll=()=>{const deletedOnes=routines.filter(r=>r.deletedFrom);onUpdate([...list,...deletedOnes]);onClose();};
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
    <div style={{background:isDark?"#1a1a2e":"#f8f8ff",borderRadius:20,padding:22,width:520,maxHeight:"85vh",overflowY:"auto",border:`1px solid ${t.panelBorder}`,boxShadow:"0 16px 48px rgba(0,0,0,0.45)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:15,color:t.text,fontWeight:700}}>🔁 반복 루틴 관리</span><button onClick={onClose} style={st.smallBtn(t.btnSecondary,t.textSub)}>✕ 닫기</button></div>
      {list.length===0&&!editing&&<div style={{textAlign:"center",color:t.textMuted,fontSize:12,padding:"20px 0"}}>설정된 루틴이 없습니다</div>}
      {list.map(r=>(<div key={r.id} style={{background:t.taskBg,borderRadius:10,padding:"9px 12px",marginBottom:7,display:"flex",alignItems:"center",gap:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
            <span style={{fontSize:10,background:r.type==="todo"?"rgba(100,130,200,0.3)":"rgba(140,100,200,0.3)",borderRadius:4,padding:"1px 6px",color:r.type==="todo"?"#90b0e8":"#c090e8"}}>{r.type==="todo"?"할일":"체크"}</span>
            <span style={{fontSize:12,color:t.text,fontWeight:600}}>{r.content}</span>
          </div>
          <span style={{fontSize:10,color:t.textMuted}}>
            {r.repeatType==="daily"&&"매일"}
            {r.repeatType==="weekly"&&`매주 ${(r.weekDays||[]).map(d=>REPEAT_DAYS_KO[d]).join(", ")}`}
            {r.repeatType==="monthly"&&`매월 ${(r.monthDays||[]).join(", ")}일`}
            {r.type==="todo"&&` · [${r.category}]`}{r.time&&` · ${r.time}`}
          </span>
        </div>
        <button onClick={()=>setEditing({...r})} style={st.smallBtn("rgba(100,130,180,0.4)")}>편집</button>
        <button onClick={()=>deleteRoutine(r.id)} style={st.smallBtn("rgba(180,80,80,0.4)")}>삭제</button>
      </div>))}
      {editing&&<RoutineForm routine={editing} onChange={setEditing} onSave={save} onCancel={()=>setEditing(null)} categories={categories} t={t} st={st}/>}
      <div style={{display:"flex",gap:8,marginTop:14}}>
        {!editing&&<button onClick={()=>setEditing(blankRoutine())} style={{...st.smallBtn("rgba(74,90,122,0.8)"),padding:"7px 16px",fontSize:12}}>+ 새 루틴 추가</button>}
        <button onClick={handleSaveAll} style={{...st.smallBtn("rgba(74,122,90,0.8)"),padding:"7px 16px",fontSize:12}}>저장 후 닫기</button>
      </div>
    </div>
  </div>);
}

// ─── LIVE CLOCK ───────────────────────────────────────────────────────────────

function LiveClock({t}){
  const[time,setTime]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(id);},[]);
  return(<div style={{textAlign:"center",marginBottom:8}}><div style={{fontSize:26,fontWeight:700,color:t.titleColor,letterSpacing:3,fontVariantNumeric:"tabular-nums"}}>{time.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div></div>);
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({message,onDone}){
  useEffect(()=>{const ti=setTimeout(onDone,3000);return()=>clearTimeout(ti);},[onDone]);
  return(<div style={{position:"fixed",bottom:38,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,rgba(80,120,180,0.97),rgba(120,80,160,0.97))",borderRadius:15,padding:"13px 26px",fontSize:14,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:9999,animation:"slideUp 0.4s ease",border:"1px solid rgba(255,255,255,0.2)",whiteSpace:"nowrap"}}>{message}</div>);
}

// ─── CHARACTER OVERLAY ────────────────────────────────────────────────────────

function CharacterOverlay({onShowEncouragement,t}){
  const posRef=useRef({x:20,y:70});const targetRef=useRef({x:50,y:50});const frameRef=useRef(null);
  const[pos,setPos]=useState({x:20,y:70});const[bubble,setBubble]=useState(null);const timerRef=useRef(null);
  const pickNewTarget=useCallback(()=>{targetRef.current={x:6+Math.random()*86,y:8+Math.random()*80};timerRef.current=setTimeout(pickNewTarget,3000+Math.random()*4000);},[]);
  useEffect(()=>{pickNewTarget();return()=>clearTimeout(timerRef.current);},[pickNewTarget]);
  useEffect(()=>{const animate=()=>{const p=posRef.current,tgt=targetRef.current,speed=0.018;p.x+=(tgt.x-p.x)*speed;p.y+=(tgt.y-p.y)*speed;setPos({x:p.x,y:p.y});frameRef.current=requestAnimationFrame(animate);};frameRef.current=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frameRef.current);},[]);
  const handleClick=(e)=>{e.stopPropagation();setBubble(randomItem(CLICK_DIALOGUES));setTimeout(()=>setBubble(null),3200);};
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:500}}>
    <div onClick={handleClick} style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,transform:"translate(-50%,-50%)",pointerEvents:"all",cursor:"pointer",userSelect:"none"}}>
      <div style={{position:"absolute",inset:-10,borderRadius:"50%",background:"radial-gradient(circle,rgba(180,160,230,0.18) 0%,transparent 70%)",animation:"pulse 2.8s ease-in-out infinite",pointerEvents:"none"}}/>
      {CHARACTER_IMAGE_URL?(<img src={CHARACTER_IMAGE_URL} alt="캐릭터" style={{width:60,height:60,objectFit:"contain",filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.4))"}}/>) : (<div style={{width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#a0b8e0,#c0a0d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",border:"3px solid rgba(255,255,255,0.3)"}}>🌟</div>)}
      {bubble&&(<div style={{position:"absolute",bottom:"115%",left:"50%",transform:"translateX(-50%)",background:t.bubbleBg,border:`1px solid ${t.panelBorder}`,borderRadius:14,padding:"9px 14px",fontSize:12,color:t.text,boxShadow:"0 4px 16px rgba(0,0,0,0.3)",animation:"fadeIn 0.3s ease",pointerEvents:"none",width:180,textAlign:"center",wordBreak:"keep-all",overflowWrap:"break-word",whiteSpace:"normal",lineHeight:1.7,zIndex:600}}>
        {bubble}<div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",width:10,height:10,background:t.bubbleBg,clipPath:"polygon(0 0,100% 0,50% 100%)"}}/>
      </div>)}
    </div>
  </div>);
}

// ─── DONE PARTICLES ───────────────────────────────────────────────────────────

function DoneParticles({onDone}){
  const[particles]=useState(()=>Array.from({length:8},(_,i)=>({id:i,angle:(i/8)*Math.PI*2,r:40+Math.random()*30,emoji:["✨","🌟","⭐","💫"][Math.floor(Math.random()*4)]})));
  useEffect(()=>{const ti=setTimeout(onDone,800);return()=>clearTimeout(ti);},[onDone]);
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:801,display:"flex",alignItems:"center",justifyContent:"center"}}>{particles.map(p=><div key={p.id} style={{position:"absolute",left:"50%",top:"50%",fontSize:16,animation:"particleFly 0.7s ease-out forwards","--tx":`${Math.cos(p.angle)*p.r}px`,"--ty":`${Math.sin(p.angle)*p.r}px`}}>{p.emoji}</div>)}</div>);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App(){
  const[currentDate,setCurrentDate]=useState(new Date());
  const[dayData,setDayData]=useState(null);
  const[categories,setCategories]=useState(loadCategories());
  const[routines,setRoutines]=useState(loadRoutines());
  const[showAddTask,setShowAddTask]=useState(false);
  const[toast,setToast]=useState(null);
  const[showCatManager,setShowCatManager]=useState(false);
  const[showRoutineManager,setShowRoutineManager]=useState(false);
  const[showMonthly,setShowMonthly]=useState(false);
  const[showYearly,setShowYearly]=useState(false);
  const[isDark,setIsDark]=useState(true);
  const[showParticles,setShowParticles]=useState(false);
  const[showCharacter,setShowCharacter]=useState(true);

  const t=isDark?THEMES.dark:THEMES.light;
  const st=makeStyles(t);
  const dateKey=getDateKey(currentDate);

  useEffect(()=>{
    const saved=loadDayData(dateKey);
    const base=saved||(()=>{const prev=new Date(currentDate);prev.setDate(prev.getDate()-1);return emptyDayData(loadDayData(getDateKey(prev))?.paletteId);})();
    setDayData(injectRoutines(base,dateKey,routines));
  },[dateKey,routines]);

  useEffect(()=>{if(dayData)saveDayData(dateKey,dayData);},[dayData,dateKey]);

  const updateDayData=useCallback((updater)=>{setDayData(prev=>typeof updater==="function"?updater(prev):updater);},[]);
  const showEncouragement=useCallback((msg)=>{setToast(msg||randomItem(ENCOURAGEMENTS));},[]);

  const todos=(dayData?.tasks||[]).filter(task=>task.status!==TASK_STATUS.DONE);
  const dones=(dayData?.tasks||[]).filter(task=>task.status===TASK_STATUS.DONE);

  const addTask=(taskData)=>{const task={id:Date.now().toString(),...taskData,status:TASK_STATUS.TODO,timeRanges:[],subTasks:[],createdAt:new Date().toISOString()};updateDayData(prev=>({...prev,tasks:[...(prev.tasks||[]),task]}));setShowAddTask(false);};
  const moveTask=(id,dir)=>{updateDayData(prev=>{const tasks=[...(prev.tasks||[])];const idx=tasks.findIndex(tk=>tk.id===id);if(idx<0)return prev;const target=idx+dir;if(target<0||target>=tasks.length)return prev;[tasks[idx],tasks[target]]=[tasks[target],tasks[idx]];return{...prev,tasks};});};
  const updateTask=(updated)=>{updateDayData(prev=>({...prev,tasks:(prev.tasks||[]).map(tk=>tk.id===updated.id?updated:tk)}));};
  const completeTask=(id)=>{updateDayData(prev=>({...prev,tasks:(prev.tasks||[]).map(tk=>tk.id===id?{...tk,status:TASK_STATUS.DONE,completedAt:new Date().toISOString()}:tk)}));setShowParticles(true);showEncouragement();};
  const restoreTask=(id)=>{updateDayData(prev=>({...prev,tasks:(prev.tasks||[]).map(tk=>tk.id===id?{...tk,status:TASK_STATUS.IN_PROGRESS,completedAt:undefined}:tk)}));};
  const handleSaveRoutines=(updated)=>{setRoutines(updated);saveRoutines(updated);};

  const palette=dayData?.paletteId||COLOR_PALETTES[0].id;
  const panelStyle={...st.panel,display:"flex",flexDirection:"column"};

  if(!dayData)return(<div style={{color:"#e8e0d5",display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0f0f1a",fontSize:14}}>불러오는 중...</div>);

  return(
    <div style={{minHeight:"100vh",background:t.bg,fontFamily:"'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif",color:t.text,padding:"11px 13px",boxSizing:"border-box",position:"relative"}}>
      <style>{`
        @keyframes slideUp{from{transform:translateX(-50%) translateY(18px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes particleFly{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.scrollbar};border-radius:4px}
        select option{background:${isDark?"#1a1a2e":"#fff"};color:${t.text}}
      `}</style>

      {showCharacter&&<CharacterOverlay onShowEncouragement={showEncouragement} t={t}/>}
      {showParticles&&<DoneParticles onDone={()=>setShowParticles(false)}/>}

      {/* TOP BAR */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,flexWrap:"wrap",gap:7}}>
        <div style={{fontSize:16,fontWeight:800,letterSpacing:2,color:t.titleColor}}>✦ FOCUS FLOW</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <PalettePicker currentId={palette} onChange={id=>updateDayData(prev=>({...prev,paletteId:id}))} t={t}/>
          <button onClick={()=>setShowCatManager(true)} style={st.smallBtn(t.btnSecondary,t.textSub)}>구분 편집</button>
          <button onClick={()=>setShowRoutineManager(true)} style={st.smallBtn("rgba(100,160,130,0.4)")}>🔁 루틴</button>
          <button onClick={()=>setShowMonthly(true)} style={st.smallBtn("rgba(100,120,180,0.4)")}>📅 월간</button>
          <button onClick={()=>setShowYearly(true)} style={st.smallBtn("rgba(120,100,180,0.4)")}>📊 연간</button>
          <button onClick={()=>setIsDark(!isDark)} style={{...st.smallBtn(isDark?"rgba(255,220,100,0.2)":"rgba(60,60,120,0.13)",isDark?"#f0d060":"#5060a0"),padding:"4px 11px",fontSize:12}}>{isDark?"☀ 라이트":"🌙 다크"}</button>
          <button onClick={()=>setShowCharacter(v=>!v)} style={{...st.smallBtn(showCharacter?"rgba(180,140,220,0.25)":t.btnSecondary,showCharacter?"#c0a0e8":t.textMuted),padding:"4px 11px",fontSize:12}}>{showCharacter?"🌟 캐릭터 ON":"🌟 캐릭터 OFF"}</button>
        </div>
      </div>

      {/* [2] Date Navigator with calendar */}
      <DateNavigator currentDate={currentDate} onChange={setCurrentDate} t={t}/>

      {/* 3-COLUMN LAYOUT */}
      <div style={{display:"grid",gridTemplateColumns:"260px 1fr 1fr",gap:11,height:"calc(100vh - 112px)",minHeight:520}}>

        {/* COL 1 */}
        <div style={{display:"flex",flexDirection:"column",gap:10,overflow:"hidden"}}>
          <div style={{...panelStyle,flex:"0 0 auto"}}>
            <LiveClock t={t}/>
            <div style={{textAlign:"center",fontSize:12,color:isDark?"#a0a8c0":"#5060a0",background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",borderRadius:8,padding:"6px 9px",fontStyle:"italic",lineHeight:1.55}}>{dayData.characterMessage}</div>
          </div>
          <div style={{...panelStyle,flex:1,overflow:"hidden"}}>
            <div style={{overflowY:"auto",flex:1,width:"100%"}}>
              <ChecklistPanel items={dayData.checklist||[]} onUpdate={items=>updateDayData(prev=>({...prev,checklist:items}))} onAdd={item=>updateDayData(prev=>({...prev,checklist:[...(prev.checklist||[]),item]}))} onShowEncouragement={()=>showEncouragement()} t={t}/>
            </div>
          </div>
          <div style={{...panelStyle,flex:"0 0 auto"}}>
            <div style={{fontSize:12,color:t.textSub,marginBottom:6,fontWeight:700}}>📝 메모</div>
            <textarea value={dayData.memo||""} onChange={e=>updateDayData(prev=>({...prev,memo:e.target.value}))} placeholder="오늘의 메모를 자유롭게..." style={{width:"100%",minHeight:68,background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)",border:`1px solid ${t.panelBorder}`,borderRadius:9,color:t.text,padding:"8px 9px",fontSize:12,resize:"vertical",fontFamily:"inherit",outline:"none",lineHeight:1.6}}/>
          </div>
        </div>

        {/* COL 2: Todo + Done */}
        <div style={{display:"flex",flexDirection:"column",gap:10,overflow:"hidden"}}>
          <div style={{...panelStyle,flex:1,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
              <span style={{fontSize:13,fontWeight:700,color:t.titleColor}}>📌 To-Do <span style={{fontSize:11,color:t.textMuted,fontWeight:400}}>({todos.length})</span></span>
              <button onClick={()=>setShowAddTask(!showAddTask)} style={st.smallBtn(showAddTask?"rgba(120,80,80,0.5)":"rgba(100,130,200,0.5)")}>{showAddTask?"✕ 닫기":"+ 추가"}</button>
            </div>
            {showAddTask&&<AddTaskForm palette={palette} categories={categories} onAdd={addTask} onClose={()=>setShowAddTask(false)} t={t}/>}
            <div style={{overflowY:"auto",flex:1}}>
              {todos.length===0&&!showAddTask&&<div style={{textAlign:"center",color:t.textMuted,fontSize:12,marginTop:22,lineHeight:2}}>오늘의 할 일을 추가해보세요! 🌱</div>}
              {todos.map((task,idx)=>(
                <div key={task.id} data-task-id={task.id}>
                  <TaskItem task={task} palette={palette} categories={categories} onUpdate={updateTask} onComplete={completeTask} onRestore={restoreTask} t={t} isFirst={idx===0} isLast={idx===todos.length-1} onMoveUp={()=>moveTask(task.id,-1)} onMoveDown={()=>moveTask(task.id,1)}/>
                </div>
              ))}
            </div>
          </div>
          {/* Done */}
          <div style={{...panelStyle,flex:"0 0 auto",maxHeight:"37%",overflow:"hidden"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#7ad098",marginBottom:8}}>✅ Done <span style={{fontSize:11,color:t.textMuted,fontWeight:400}}>({dones.length})</span></div>
            <div style={{overflowY:"auto",flex:1}}>
              {dones.length===0&&<div style={{textAlign:"center",color:t.textMuted,fontSize:11,marginTop:8}}>완료된 항목이 없어요</div>}
              {dones.map(task=>(<div key={task.id} style={{display:"flex",alignItems:"center",gap:6,background:t.doneBg,borderRadius:9,padding:"6px 10px",marginBottom:5,borderLeft:`3px solid ${task.color||"#4a8"}`,opacity:.85,animation:"fadeIn 0.4s ease"}}>
                <span style={{fontSize:10,color:t.textSub}}>[{task.category}]</span>
                <span style={{fontSize:12,color:isDark?"#b8d8b8":"#3a6a4a",textDecoration:"line-through",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.content}</span>
                <span style={{fontSize:10,color:t.textMuted,flexShrink:0}}>{task.completedAt?new Date(task.completedAt).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"}):""}</span>
                {/* [3] Restore in done list */}
                <button onClick={()=>restoreTask(task.id)} title="완료 취소" style={{...st.smallBtn("rgba(180,120,80,0.3)","#e0c090"),fontSize:10,padding:"2px 6px",flexShrink:0}}>↩</button>
              </div>))}
            </div>
          </div>
        </div>

        {/* COL 3 */}
        <div style={{display:"flex",flexDirection:"column",gap:10,overflow:"hidden"}}>
          <div style={{...panelStyle,flex:1,overflow:"hidden"}}>
            <div style={{fontSize:13,fontWeight:700,color:t.titleColor,marginBottom:9}}>🕐 타임 테이블</div>
            <div style={{flex:1,overflowY:"auto"}}><TimeTable tasks={dayData.tasks||[]} t={t}/></div>
          </div>
          <div style={{...panelStyle,flex:"0 0 auto"}}><DailyStats tasks={dayData.tasks||[]} checklist={dayData.checklist||[]} categories={categories} t={t}/></div>
        </div>
      </div>

      {/* MODALS */}
      {showCatManager&&<CategoryManager categories={categories} onUpdate={cats=>{setCategories(cats);saveCategories(cats);}} onClose={()=>setShowCatManager(false)} t={t}/>}
      {showRoutineManager&&<RoutineManager routines={routines} onUpdate={handleSaveRoutines} onClose={()=>setShowRoutineManager(false)} categories={categories} t={t}/>}
      {showMonthly&&<MonthlyReport onClose={()=>setShowMonthly(false)} categories={categories} t={t}/>}
      {showYearly&&<YearlyReport onClose={()=>setShowYearly(false)} categories={categories} t={t}/>}
      {toast&&<Toast message={toast} onDone={()=>setToast(null)}/>}
    </div>
  );
}
