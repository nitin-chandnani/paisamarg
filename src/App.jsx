import { useState, useEffect, useRef } from "react";

// ── Global CSS — injected once on mount ───────────────────────────────────────
const GLOBAL_CSS = `
  *{box-sizing:border-box}
  ::selection{background:rgba(0,208,156,0.18);color:#00d09c}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}

  /* Shimmer gradient text */
  .pm-shine{
    background:linear-gradient(90deg,#00d09c,#3b82f6,#8b5cf6,#00d09c);
    background-size:300% auto;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:pmShine 7s linear infinite;
  }

  /* Home-screen calculator cards */
  .pm-card{
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
               box-shadow 0.22s ease,
               border-color 0.22s ease;
  }
  .pm-card:hover{
    transform:translateY(-5px) !important;
    box-shadow:0 22px 44px rgba(15,23,42,0.12) !important;
  }
  .pm-card:active{transform:translateY(-1px) !important}

  /* ── Desktop responsive ────────────────────────────────── */
  @media (min-width:640px){
    .pm-content{ max-width:720px !important; }
    .pm-home-cards{ grid-template-columns:repeat(3,1fr) !important; }
    .pm-home-pad{ padding-left:28px !important; padding-right:28px !important; }
    .pm-calc-inner{ max-width:580px; margin:0 auto; }
  }
  @media (min-width:1024px){
    .pm-content{ max-width:980px !important; }
    .pm-home-pad{ padding-left:48px !important; padding-right:48px !important; }
  }

  /* Keyframes */
  @keyframes pmShine{
    0%{background-position:0% center}
    100%{background-position:300% center}
  }
  @keyframes pmOrb1{
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(55px,-38px) scale(1.08)}
    66%{transform:translate(-32px,28px) scale(0.93)}
  }
  @keyframes pmOrb2{
    0%,100%{transform:translate(0,0) scale(1)}
    40%{transform:translate(-48px,-22px) scale(1.06)}
    70%{transform:translate(30px,42px) scale(0.94)}
  }
  @keyframes pmOrb3{
    0%,100%{transform:translate(0,0);opacity:0.5}
    50%{transform:translate(24px,-32px);opacity:0.9}
  }
  @keyframes pmNumPop{
    0%{transform:scale(0.80);opacity:0.25}
    55%{transform:scale(1.08);opacity:1}
    100%{transform:scale(1);opacity:1}
  }
  @keyframes pmSlideUp{
    from{transform:translateY(16px);opacity:0}
    to{transform:translateY(0);opacity:1}
  }
  @keyframes pmCardIn{
    from{transform:translateY(16px);opacity:0}
    to{transform:translateY(0);opacity:1}
  }
  @keyframes pmModalUp{
    from{transform:translateY(110%)}
    to{transform:translateY(0)}
  }
  @keyframes pmPulse{
    0%,100%{opacity:1;transform:scale(1)}
    50%{opacity:0.5;transform:scale(0.85)}
  }
`;

// ── Supabase config — drop your keys here when ready ─────────────────────────
const SUPABASE_URL  = "YOUR_SUPABASE_URL";
const SUPABASE_ANON = "YOUR_SUPABASE_ANON_KEY";
const supabaseReady = !SUPABASE_URL.startsWith("YOUR");

const sbInsert = async (table, row) => {
  if (!supabaseReady) return { error: "Supabase not configured" };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON,
      "Authorization": `Bearer ${SUPABASE_ANON}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(row),
  });
  return res.ok ? { error: null } : { error: await res.text() };
};

const canSubmit = (email) => {
  const key = `pm_last_${email}`;
  const last = parseInt(localStorage.getItem(key) || "0");
  if (Date.now() - last < 60000) return false;
  localStorage.setItem(key, Date.now());
  return true;
};

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── Utility ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));

const fmtCr = (n) => {
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const rupee = (n) => `\u20B9${fmtCr(n)}`;

// ── Animated background orbs + dot grid ──────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
      {/* Dot grid — faint graph-paper texture */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"radial-gradient(circle, rgba(100,116,139,0.16) 1px, transparent 1px)",
        backgroundSize:"28px 28px",
        opacity:0.6,
      }} />
      {/* Green orb — top left */}
      <div style={{
        position:"absolute", width:640, height:640, borderRadius:"50%",
        background:"radial-gradient(circle at center,rgba(0,208,156,0.16) 0%,transparent 62%)",
        top:-220, left:-170, filter:"blur(20px)",
        animation:"pmOrb1 20s ease-in-out infinite",
      }} />
      {/* Blue orb — bottom right */}
      <div style={{
        position:"absolute", width:540, height:540, borderRadius:"50%",
        background:"radial-gradient(circle at center,rgba(59,130,246,0.14) 0%,transparent 62%)",
        bottom:-170, right:-170, filter:"blur(20px)",
        animation:"pmOrb2 25s ease-in-out infinite",
      }} />
      {/* Purple orb — mid */}
      <div style={{
        position:"absolute", width:380, height:380, borderRadius:"50%",
        background:"radial-gradient(circle at center,rgba(139,92,246,0.11) 0%,transparent 62%)",
        top:"38%", left:"4%", filter:"blur(16px)",
        animation:"pmOrb3 30s ease-in-out infinite 7s",
      }} />
    </div>
  );
}

// ── Slider with tap-to-type ───────────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, display }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const startEdit = () => { setInputVal(String(value)); setEditing(true); };
  const commit = () => {
    const num = parseFloat(String(inputVal).replace(/,/g, ""));
    if (!isNaN(num)) onChange(Math.min(max, Math.max(min, Math.round(num / step) * step)));
    setEditing(false);
  };
  const onKey = (e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditing(false); };

  return (
    <div style={{ marginBottom:22 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ color:"#64748b", fontSize:13, fontFamily:"DM Sans, sans-serif" }}>{label}</span>
        {editing ? (
          <input autoFocus type="number" value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={commit} onKeyDown={onKey}
            style={{
              background:"#ffffff", border:"2px solid #00d09c", color:"#00d09c",
              padding:"3px 10px", borderRadius:20, fontSize:13, fontWeight:700,
              fontFamily:"DM Sans, sans-serif", width:140, textAlign:"right", outline:"none",
            }}
          />
        ) : (
          <span onClick={startEdit} style={{
            background:"linear-gradient(135deg,#00d09c,#00b386)", color:"#fff",
            padding:"4px 12px 4px 14px", borderRadius:20, fontSize:13, fontWeight:700,
            fontFamily:"DM Sans, sans-serif", cursor:"pointer", userSelect:"none",
            display:"flex", alignItems:"center", gap:5,
            boxShadow:"0 2px 10px rgba(0,208,156,0.25)",
          }}>
            {display}<span style={{ fontSize:10, opacity:0.8 }}>✏</span>
          </span>
        )}
      </div>
      <div style={{ position:"relative", height:6 }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(226,232,240,0.9)", borderRadius:10 }} />
        <div style={{
          position:"absolute", top:0, left:0, bottom:0, width:`${pct}%`,
          background:"linear-gradient(90deg,#00d09c,#00b386)", borderRadius:10, transition:"width 0.12s",
        }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position:"absolute", top:-7, left:0, width:"100%", opacity:0, cursor:"pointer", height:20, margin:0 }}
        />
        <div style={{
          position:"absolute", left:`calc(${pct}% - 9px)`, top:-6,
          width:18, height:18, background:"#00d09c", borderRadius:"50%",
          border:"3px solid #f7f9fc", boxShadow:"0 0 0 3px rgba(0,208,156,0.28), 0 2px 8px rgba(0,208,156,0.3)",
          transition:"left 0.12s", pointerEvents:"none",
        }} />
      </div>
    </div>
  );
}

// ── Result Card — number pops when value changes ──────────────────────────────
function ResultCard({ label, value, accent }) {
  const len = String(value).length;
  const fs = accent
    ? (len > 13 ? 13 : len > 11 ? 15 : len > 8 ? 18 : 22)
    : (len > 13 ? 11 : len > 11 ? 13 : len > 8 ? 15 : 18);
  return (
    <div style={{
      background: accent ? "linear-gradient(135deg,rgba(0,208,156,0.12),rgba(0,179,134,0.06))" : "rgba(255,255,255,0.75)",
      border:`1px solid ${accent ? "rgba(0,208,156,0.25)" : "rgba(15,23,42,0.06)"}`,
      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
      borderRadius:14, padding:"14px 8px", textAlign:"center", overflow:"hidden",
    }}>
      <div style={{ color:"#64748b", fontSize:10, marginBottom:5, fontFamily:"DM Sans, sans-serif", textTransform:"uppercase", letterSpacing:0.8 }}>
        {label}
      </div>
      {/* key={value} causes React to remount this element on every change, re-triggering the animation */}
      <div key={value} style={{
        color: accent ? "#00d09c" : "#1e293b",
        fontSize:fs, fontWeight:800, fontFamily:"Syne, sans-serif",
        lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
        animation:"pmNumPop 0.38s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {value}
      </div>
    </div>
  );
}

// ── Donut ─────────────────────────────────────────────────────────────────────
function Donut({ a, b, labelA = "#00d09c", labelB = "#f97316" }) {
  const total = a + b, r = 50, cx = 70, cy = 70, circ = 2 * Math.PI * r, gap = 2;
  const aDash = (a / total) * circ, bDash = (b / total) * circ;
  const totalStr = rupee(total);
  const fs = totalStr.length > 10 ? 9 : 11;
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(226,232,240,0.9)" strokeWidth={16} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={labelA} strokeWidth={16}
        strokeDasharray={`${aDash - gap} ${circ - aDash + gap}`}
        strokeDashoffset={circ / 4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={labelB} strokeWidth={16}
        strokeDasharray={`${bDash - gap} ${circ - bDash + gap}`}
        strokeDashoffset={circ / 4 - aDash + gap} strokeLinecap="round" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#64748b" fontSize={9} fontFamily="DM Sans, sans-serif">Total</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#1e293b" fontSize={fs} fontWeight={700} fontFamily="DM Sans, sans-serif">{totalStr}</text>
    </svg>
  );
}

// ── Growth Bar ────────────────────────────────────────────────────────────────
function GrowthBar({ invested, returns }) {
  const total = invested + returns;
  return (
    <div style={{ marginTop:14 }}>
      <div style={{ display:"flex", borderRadius:8, overflow:"hidden", height:10 }}>
        <div style={{ width:`${(invested / total) * 100}%`, background:"#3b82f6", transition:"width 0.4s" }} />
        <div style={{ width:`${(returns / total) * 100}%`, background:"#00d09c", transition:"width 0.4s" }} />
      </div>
      <div style={{ display:"flex", gap:16, marginTop:8 }}>
        {[["#3b82f6","Invested"],["#00d09c","Returns"]].map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:c }} />
            <span style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Row ──────────────────────────────────────────────────────────────────
function StatRow({ label, value, color = "#00d09c" }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"rgba(248,250,252,0.85)", borderRadius:10, border:"1px solid rgba(15,23,42,0.06)", marginTop:10 }}>
      <span style={{ color:"#64748b", fontSize:12, fontFamily:"DM Sans, sans-serif" }}>{label}</span>
      <span style={{ color, fontWeight:700, fontSize:13, fontFamily:"Syne, sans-serif" }}>{value}</span>
    </div>
  );
}

// ── EMI ───────────────────────────────────────────────────────────────────────
function EMICalc() {
  const [loan, setLoan] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const mr = rate / 12 / 100, n = tenure * 12;
  const emi = loan * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1);
  const totalPay = emi * n, totalInterest = totalPay - loan;

  return (
    <div>
      <Slider label="Loan Amount" value={loan} min={100000} max={100000000} step={100000} onChange={setLoan} display={rupee(loan)} />
      <Slider label="Interest Rate (p.a.)" value={rate} min={5} max={20} step={0.1} onChange={setRate} display={`${rate}%`} />
      <Slider label="Tenure" value={tenure} min={1} max={30} step={1} onChange={setTenure} display={`${tenure} yrs`} />

      <div style={{ display:"flex", justifyContent:"center", margin:"16px 0 8px" }}>
        <Donut a={loan} b={totalInterest} />
      </div>
      <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:14 }}>
        {[["#00d09c","Principal"],["#f97316","Interest"]].map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:c }} />
            <span style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif" }}>{l}</span>
          </div>
        ))}
      </div>

      <ResultCard label="Monthly EMI" value={rupee(emi)} accent />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
        <ResultCard label="Principal" value={rupee(loan)} />
        <ResultCard label="Interest" value={rupee(totalInterest)} />
      </div>
      <div style={{ marginTop:8 }}><ResultCard label="Total Payment" value={rupee(totalPay)} /></div>
      <StatRow label="Interest as % of loan" value={`${((totalInterest / loan) * 100).toFixed(1)}%`} color="#f97316" />
    </div>
  );
}

// ── SIP + Lumpsum ─────────────────────────────────────────────────────────────
function SIPCalc() {
  const [mode, setMode] = useState("SIP");
  const [monthly, setMonthly] = useState(10000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(15);
  const [lumpsum, setLumpsum] = useState(500000);
  const [lsRate, setLsRate] = useState(12);
  const [lsYears, setLsYears] = useState(10);

  const sipN = sipYears * 12, sipR = sipRate / 12 / 100;
  const sipFV = monthly * ((Math.pow(1 + sipR, sipN) - 1) / sipR) * (1 + sipR);
  const sipInv = monthly * sipN;

  const lsFV = lumpsum * Math.pow(1 + lsRate / 100, lsYears);

  const isSIP = mode === "SIP";
  const fv = isSIP ? sipFV : lsFV;
  const inv = isSIP ? sipInv : lumpsum;
  const ret = fv - inv;

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:22 }}>
        {["SIP","Lumpsum"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex:1, padding:"10px 0", borderRadius:12, border:"none", cursor:"pointer",
            background: mode === m ? "linear-gradient(135deg,#00d09c,#00b386)" : "rgba(226,232,240,0.9)",
            color: mode === m ? "#fff" : "#64748b", fontWeight:700, fontSize:14,
            fontFamily:"Syne, sans-serif", transition:"all 0.2s",
            boxShadow: mode === m ? "0 4px 16px rgba(0,208,156,0.28)" : "none",
          }}>{m}</button>
        ))}
      </div>

      {isSIP ? (<>
        <Slider label="Monthly SIP" value={monthly} min={500} max={1000000} step={500} onChange={setMonthly} display={rupee(monthly)} />
        <Slider label="Expected Return (p.a.)" value={sipRate} min={1} max={30} step={0.5} onChange={setSipRate} display={`${sipRate}%`} />
        <Slider label="Investment Period" value={sipYears} min={1} max={40} step={1} onChange={setSipYears} display={`${sipYears} yrs`} />
      </>) : (<>
        <Slider label="Lumpsum Amount" value={lumpsum} min={10000} max={100000000} step={10000} onChange={setLumpsum} display={rupee(lumpsum)} />
        <Slider label="Expected Return (p.a.)" value={lsRate} min={1} max={30} step={0.5} onChange={setLsRate} display={`${lsRate}%`} />
        <Slider label="Investment Period" value={lsYears} min={1} max={40} step={1} onChange={setLsYears} display={`${lsYears} yrs`} />
      </>)}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:18 }}>
        <ResultCard label="Future Value" value={rupee(fv)} accent />
        <ResultCard label="Wealth Gained" value={rupee(ret)} accent />
        <ResultCard label={isSIP ? "Total Invested" : "Invested"} value={rupee(inv)} />
        <ResultCard label="Return Multiple" value={`${(fv / inv).toFixed(2)}x`} />
      </div>
      <GrowthBar invested={inv} returns={ret} />
      <StatRow label={isSIP ? "Daily SIP equivalent" : "CAGR"} value={isSIP ? `\u20B9${fmt(monthly / 30)}/day` : `${lsRate}% p.a.`} />
    </div>
  );
}

// ── FD / RD ───────────────────────────────────────────────────────────────────
function FDCalc() {
  const [mode, setMode] = useState("FD");
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(5);
  const [monthly, setMonthly] = useState(10000);

  let maturity, invested, interest;
  if (mode === "FD") {
    maturity = principal * Math.pow(1 + rate / (4 * 100), 4 * years);
    invested = principal; interest = maturity - invested;
  } else {
    const n = years * 12, r = rate / 12 / 100;
    maturity = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    invested = monthly * n; interest = maturity - invested;
  }

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:22 }}>
        {["FD","RD"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex:1, padding:"10px 0", borderRadius:12, border:"none", cursor:"pointer",
            background: mode === m ? "linear-gradient(135deg,#00d09c,#00b386)" : "rgba(226,232,240,0.9)",
            color: mode === m ? "#fff" : "#64748b", fontWeight:700, fontSize:14,
            fontFamily:"Syne, sans-serif", transition:"all 0.2s",
          }}>{m === "FD" ? "Fixed Deposit" : "Recurring Deposit"}</button>
        ))}
      </div>

      {mode === "FD"
        ? <Slider label="Principal Amount" value={principal} min={10000} max={50000000} step={10000} onChange={setPrincipal} display={rupee(principal)} />
        : <Slider label="Monthly Deposit" value={monthly} min={1000} max={500000} step={1000} onChange={setMonthly} display={rupee(monthly)} />
      }
      <Slider label="Interest Rate (p.a.)" value={rate} min={4} max={10} step={0.05} onChange={setRate} display={`${rate}%`} />
      <Slider label="Duration" value={years} min={1} max={10} step={1} onChange={setYears} display={`${years} yrs`} />

      <div style={{ display:"flex", justifyContent:"center", margin:"16px 0 8px" }}>
        <Donut a={invested} b={interest} />
      </div>
      <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:14 }}>
        {[["#00d09c", mode === "FD" ? "Principal" : "Deposited"],["#f97316","Interest"]].map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:c }} />
            <span style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif" }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <ResultCard label="Maturity Value" value={rupee(maturity)} accent />
        <ResultCard label="Interest Earned" value={rupee(interest)} accent />
        <ResultCard label={mode === "FD" ? "Principal" : "Total Deposited"} value={rupee(invested)} />
        <ResultCard label="Effective Yield" value={`${((interest / invested) * 100).toFixed(1)}%`} />
      </div>
    </div>
  );
}

// ── FIRE / Retirement Calculator ─────────────────────────────────────────────
function FIRECalc() {
  const [mode, setMode] = useState("need");

  const [monthlyExp, setMonthlyExp] = useState(50000);
  const [yearsToRetire, setYearsToRetire] = useState(20);
  const [inflation, setInflation] = useState(6);
  const [preReturnRate, setPreReturnRate] = useState(12);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const [currentCorpus, setCurrentCorpus] = useState(1000000);
  const [monthlySIP, setMonthlySIP] = useState(20000);
  const [haveYears, setHaveYears] = useState(20);
  const [haveReturn, setHaveReturn] = useState(12);
  const [postReturn, setPostReturn] = useState(7);
  const [postInflation, setPostInflation] = useState(6);

  const annualExpToday = monthlyExp * 12;
  const annualExpAtRetirement = annualExpToday * Math.pow(1 + inflation / 100, yearsToRetire);
  const monthlyExpAtRetirement = annualExpAtRetirement / 12;
  const fireNumber = annualExpAtRetirement / (withdrawalRate / 100);
  const r1 = preReturnRate / 12 / 100, n1 = yearsToRetire * 12;
  const sipNeeded = fireNumber / (((Math.pow(1 + r1, n1) - 1) / r1) * (1 + r1));
  const realReturn = ((1 + preReturnRate / 100) / (1 + inflation / 100) - 1) * 100;

  const n2 = haveYears * 12, r2 = haveReturn / 12 / 100;
  const sipFV = monthlySIP * ((Math.pow(1 + r2, n2) - 1) / r2) * (1 + r2);
  const corpusFV = currentCorpus * Math.pow(1 + haveReturn / 100, haveYears);
  const totalCorpus = sipFV + corpusFV;
  const monthlyIncome = (totalCorpus * (withdrawalRate / 100)) / 12;
  const monthlyPostReturn = postReturn / 12 / 100;
  const monthlyInflAdj = monthlyIncome * Math.pow(1 + inflation / 100, haveYears);
  let survivalYears = 0;
  let bal = totalCorpus;
  let withdrawal = monthlyInflAdj;
  while (bal > 0 && survivalYears < 100) {
    for (let m = 0; m < 12; m++) {
      bal = bal * (1 + monthlyPostReturn) - withdrawal;
      if (bal <= 0) break;
    }
    withdrawal *= (1 + postInflation / 100);
    survivalYears++;
    if (survivalYears >= 100) break;
  }
  const corpusForever = totalCorpus * (monthlyPostReturn * 12) > monthlyInflAdj * 12;
  const isNeed = mode === "need";
  const survivalColor = survivalYears >= 30 ? "#00d09c" : survivalYears >= 20 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:22 }}>
        {[["need","🎯 What do I need?"],["have","💰 What will I have?"]].map(([m,lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex:1, padding:"10px 6px", borderRadius:12, border:"none", cursor:"pointer",
            background: mode === m ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(226,232,240,0.9)",
            color: mode === m ? "#fff" : "#64748b", fontWeight:700, fontSize:12,
            fontFamily:"Syne, sans-serif", transition:"all 0.2s",
            boxShadow: mode === m ? "0 4px 16px rgba(99,102,241,0.28)" : "none",
          }}>{lbl}</button>
        ))}
      </div>

      {isNeed ? (<>
        <Slider label="Monthly Expenses Today" value={monthlyExp} min={10000} max={500000} step={5000} onChange={setMonthlyExp} display={rupee(monthlyExp)} />
        <Slider label="Years to Retirement" value={yearsToRetire} min={1} max={40} step={1} onChange={setYearsToRetire} display={`${yearsToRetire} yrs`} />
        <Slider label="Expected Inflation (p.a.)" value={inflation} min={2} max={12} step={0.5} onChange={setInflation} display={`${inflation}%`} />
        <Slider label="Pre-retirement Return" value={preReturnRate} min={5} max={20} step={0.5} onChange={setPreReturnRate} display={`${preReturnRate}%`} />
        <Slider label="Withdrawal Rate" value={withdrawalRate} min={2} max={8} step={0.5} onChange={setWithdrawalRate} display={`${withdrawalRate}%`} />

        <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.07))", border:"1px solid rgba(99,102,241,0.25)", borderRadius:16, padding:"20px 16px", textAlign:"center", marginBottom:10 }}>
          <div style={{ color:"#4f46e5", fontSize:11, textTransform:"uppercase", letterSpacing:1, fontFamily:"DM Sans, sans-serif", marginBottom:6 }}>Your FIRE Number</div>
          <div key={rupee(fireNumber)} style={{ color:"#4338ca", fontSize:32, fontWeight:800, fontFamily:"Syne, sans-serif", lineHeight:1, animation:"pmNumPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>{rupee(fireNumber)}</div>
          <div style={{ color:"#64748b", fontSize:11, marginTop:6, fontFamily:"DM Sans, sans-serif" }}>corpus needed to retire in {yearsToRetire} years</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
          <ResultCard label="Monthly Expense at Retirement" value={rupee(monthlyExpAtRetirement)} />
          <ResultCard label="SIP Needed / Month" value={rupee(sipNeeded)} accent />
          <ResultCard label="Real Return (inflation-adj)" value={`${realReturn.toFixed(1)}%`} />
          <ResultCard label="Withdrawal Rate" value={`${withdrawalRate}% p.a.`} />
        </div>
        <StatRow label="Annual expense at retirement" value={rupee(annualExpAtRetirement)} color="#a5b4fc" />
        <StatRow label="Inflation multiplier" value={`${Math.pow(1 + inflation / 100, yearsToRetire).toFixed(2)}x`} color="#f59e0b" />

      </>) : (<>
        <Slider label="Current Savings / Corpus" value={currentCorpus} min={0} max={50000000} step={50000} onChange={setCurrentCorpus} display={rupee(currentCorpus)} />
        <Slider label="Monthly SIP" value={monthlySIP} min={0} max={500000} step={1000} onChange={setMonthlySIP} display={rupee(monthlySIP)} />
        <Slider label="Years to Retirement" value={haveYears} min={1} max={40} step={1} onChange={setHaveYears} display={`${haveYears} yrs`} />
        <Slider label="Pre-retirement Return" value={haveReturn} min={5} max={20} step={0.5} onChange={setHaveReturn} display={`${haveReturn}%`} />
        <Slider label="Post-retirement Return" value={postReturn} min={3} max={12} step={0.5} onChange={setPostReturn} display={`${postReturn}%`} />
        <Slider label="Post-retirement Inflation" value={postInflation} min={2} max={10} step={0.5} onChange={setPostInflation} display={`${postInflation}%`} />

        <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.07))", border:"1px solid rgba(99,102,241,0.25)", borderRadius:16, padding:"20px 16px", textAlign:"center", marginBottom:10 }}>
          <div style={{ color:"#4f46e5", fontSize:11, textTransform:"uppercase", letterSpacing:1, fontFamily:"DM Sans, sans-serif", marginBottom:6 }}>Projected Corpus at Retirement</div>
          <div key={rupee(totalCorpus)} style={{ color:"#4338ca", fontSize:32, fontWeight:800, fontFamily:"Syne, sans-serif", lineHeight:1, animation:"pmNumPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>{rupee(totalCorpus)}</div>
          <div style={{ color:"#64748b", fontSize:11, marginTop:6, fontFamily:"DM Sans, sans-serif" }}>in {haveYears} years at {haveReturn}% return</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
          <ResultCard label="Monthly Passive Income" value={rupee(monthlyIncome)} accent />
          <ResultCard label="From SIP Growth" value={rupee(sipFV)} />
          <ResultCard label="From Current Corpus" value={rupee(corpusFV)} />
          <ResultCard label="Withdrawal Rate" value={`${withdrawalRate}%`} />
        </div>

        <div style={{ background:"rgba(248,250,252,0.85)", border:"1px solid rgba(15,23,42,0.06)", borderRadius:14, padding:"16px", marginTop:4 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ color:"#64748b", fontSize:12, fontFamily:"DM Sans, sans-serif" }}>Corpus lasts</span>
            <span style={{ color:survivalColor, fontWeight:800, fontSize:15, fontFamily:"Syne, sans-serif" }}>
              {corpusForever ? "Forever ♾" : `${survivalYears} years`}
            </span>
          </div>
          {!corpusForever && (<>
            <div style={{ background:"rgba(226,232,240,0.9)", borderRadius:8, height:10, overflow:"hidden" }}>
              <div style={{ width:`${Math.min(100,(survivalYears/40)*100)}%`, background:survivalColor, height:"100%", borderRadius:8, transition:"width 0.4s" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ color:"#334155", fontSize:10, fontFamily:"DM Sans, sans-serif" }}>0</span>
              <span style={{ color:"#334155", fontSize:10, fontFamily:"DM Sans, sans-serif" }}>40 yrs</span>
            </div>
            <div style={{ color:"#64748b", fontSize:11, marginTop:8, fontFamily:"DM Sans, sans-serif" }}>
              {survivalYears < 20 ? "⚠️ Corpus may run out. Increase SIP or reduce withdrawal rate." : survivalYears < 30 ? "Decent runway. Consider boosting corpus for extra cushion." : "✅ Strong retirement corpus. You're on track."}
            </div>
          </>)}
          {corpusForever && <div style={{ color:"#00d09c", fontSize:11, marginTop:4, fontFamily:"DM Sans, sans-serif" }}>✅ Your corpus generates more than you withdraw. Wealth compounds forever.</div>}
        </div>
        <StatRow label="Withdrawal slider" value={`${withdrawalRate}% — adjust in Mode 1`} color="#a5b4fc" />
      </>)}
    </div>
  );
}

// ── CTC to In-Hand Calculator (New Tax Regime FY2025-26) ─────────────────────
function CTCCalc() {
  const [ctc, setCtc] = useState(1200000);
  const [basicPct, setBasicPct] = useState(40);
  const [hraPct, setHraPct] = useState(20);
  const [pfOpt, setPfOpt] = useState(true);
  const [npsOpt, setNpsOpt] = useState(false);
  const [lta, setLta] = useState(true);
  const [mealAllowance, setMealAllowance] = useState(true);
  const [bonus, setBonus] = useState(0);
  const [esop, setEsop] = useState(0);
  const [showOptimiser, setShowOptimiser] = useState(false);

  const stdDeduction = 75000;
  const professionalTax = 2400;

  const calcScenario = (bPct, hPct, pf, nps, ltaOn, mealOn) => {
    const basic = ctc * (bPct / 100);
    const hra = ctc * (hPct / 100);
    const pfEmp = pf ? Math.min(basic * 0.12, 21600) : 0;
    const pfEmpr = pf ? Math.min(basic * 0.12, 21600) : 0;
    const npsEmpr = nps ? Math.min(basic * 0.10, 150000) : 0;
    const ltaAmt = ltaOn ? Math.min(ctc * 0.05, 50000) : 0;
    const mealAmt = mealOn ? 26400 : 0;
    const special = Math.max(0, ctc - basic - hra - pfEmpr - npsEmpr - ltaAmt - mealAmt);
    const gross = basic + hra + ltaAmt + mealAmt + special;
    const totalIncome = gross + bonus + esop;
    const taxable = Math.max(0, totalIncome - stdDeduction - pfEmp);
    const calcTax = (inc) => {
      if (inc <= 300000) return 0;
      let t = 0;
      [[300000,700000,0.05],[700000,1000000,0.10],[1000000,1200000,0.15],[1200000,1500000,0.20],[1500000,Infinity,0.30]]
        .forEach(([lo, hi, r]) => { if (inc > lo) t += (Math.min(inc, hi) - lo) * r; });
      return t;
    };
    let tax = taxable <= 700000 ? 0 : calcTax(taxable);
    let surcharge = 0;
    if (taxable > 5000000) surcharge = tax * 0.10;
    if (taxable > 10000000) surcharge = tax * 0.15;
    const cess = (tax + surcharge) * 0.04;
    const totalTax = tax + surcharge + cess;
    const totalDed = totalTax + pfEmp + professionalTax;
    const monthlyInHand = (gross - totalDed) / 12;
    const effectiveTaxRate = gross > 0 ? (totalTax / gross) * 100 : 0;
    return { monthlyInHand, totalTax, effectiveTaxRate, gross, pfEmp, taxable, totalDed };
  };

  const current = calcScenario(basicPct, hraPct, pfOpt, npsOpt, lta, mealAllowance);
  const optimised = calcScenario(35, hraPct, pfOpt, true, true, true);
  const annualSaving = (optimised.monthlyInHand - current.monthlyInHand) * 12;

  const tips = [
    { applied: basicPct <= 35, label:"Lower Basic to 35%", desc:"Reduces PF deduction and shifts more to tax-efficient allowances", action:() => setBasicPct(35) },
    { applied: npsOpt, label:"Add NPS Employer (10% of basic)", desc:"Section 80CCD(2) — tax-free in new regime, builds retirement corpus", action:() => setNpsOpt(true) },
    { applied: mealAllowance, label:"Add Meal Allowance ₹2,200/mo", desc:"₹26,400/year completely tax-free as food coupon/allowance", action:() => setMealAllowance(true) },
    { applied: lta, label:"Add LTA Component", desc:"Tax-free reimbursement twice in a 4-year block for travel", action:() => setLta(true) },
  ];

  const unappliedTips = tips.filter(t => !t.applied);
  const allApplied = unappliedTips.length === 0;
  const taxColor = (r) => r < 10 ? "#00d09c" : r < 20 ? "#f59e0b" : "#ef4444";

  const Toggle = ({ label, value, onChange }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(15,23,42,0.06)" }}>
      <span style={{ color:"#64748b", fontSize:13, fontFamily:"DM Sans, sans-serif" }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{ width:44, height:24, borderRadius:12, cursor:"pointer", transition:"background 0.2s", background: value ? "#00d09c" : "#cbd5e1", position:"relative" }}>
        <div style={{ position:"absolute", top:3, left: value ? 23 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
      </div>
    </div>
  );

  return (
    <div>
      <Slider label="Annual CTC" value={ctc} min={300000} max={10000000} step={50000} onChange={setCtc} display={rupee(ctc)} />
      <Slider label="Basic % of CTC" value={basicPct} min={30} max={60} step={5} onChange={setBasicPct} display={`${basicPct}%`} />
      <Slider label="HRA % of CTC" value={hraPct} min={10} max={30} step={5} onChange={setHraPct} display={`${hraPct}%`} />

      <div style={{ marginBottom:18 }}>
        <Toggle label="PF Contribution (12% of basic)" value={pfOpt} onChange={setPfOpt} />
        <Toggle label="NPS Employer (10% basic, tax-free)" value={npsOpt} onChange={setNpsOpt} />
        <Toggle label="LTA Component" value={lta} onChange={setLta} />
        <Toggle label="Meal Allowance ₹2,200/mo" value={mealAllowance} onChange={setMealAllowance} />
      </div>

      <div style={{ marginBottom:18 }}>
        <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif", marginBottom:10, textTransform:"uppercase", letterSpacing:0.8 }}>Additional Income</div>
        <Slider label="Annual Bonus" value={bonus} min={0} max={5000000} step={25000} onChange={setBonus} display={bonus > 0 ? rupee(bonus) : "None"} />
        <Slider label="ESOP Exercise Value" value={esop} min={0} max={10000000} step={50000} onChange={setEsop} display={esop > 0 ? rupee(esop) : "None"} />
      </div>

      <div style={{ background:"linear-gradient(135deg,rgba(0,208,156,0.12),rgba(0,179,134,0.06))", border:"1px solid rgba(0,208,156,0.22)", borderRadius:16, padding:"18px 16px", textAlign:"center", marginBottom:10 }}>
        <div style={{ color:"#059669", fontSize:11, textTransform:"uppercase", letterSpacing:1, fontFamily:"DM Sans, sans-serif", marginBottom:4 }}>Monthly In-Hand</div>
        <div key={rupee(current.monthlyInHand)} style={{ color:"#00d09c", fontSize:34, fontWeight:800, fontFamily:"Syne, sans-serif", lineHeight:1, animation:"pmNumPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>{rupee(current.monthlyInHand)}</div>
        <div style={{ color:"#64748b", fontSize:11, marginTop:6, fontFamily:"DM Sans, sans-serif" }}>
          Annual take-home: {rupee(current.monthlyInHand * 12)}{(bonus > 0 || esop > 0) ? " (excl. bonus/ESOP)" : ""}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
        <ResultCard label="Income Tax" value={rupee(current.totalTax)} />
        <ResultCard label="Effective Tax Rate" value={`${current.effectiveTaxRate.toFixed(1)}%`} />
        <ResultCard label="PF (Employee)" value={rupee(current.pfEmp * 12)} />
        <ResultCard label="Gross Salary" value={rupee(current.gross)} />
      </div>

      <div style={{ background:"rgba(248,250,252,0.85)", border:"1px solid rgba(15,23,42,0.06)", borderRadius:12, padding:"12px 14px", marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ color:"#64748b", fontSize:12, fontFamily:"DM Sans, sans-serif" }}>Tax burden</span>
          <span style={{ color:taxColor(current.effectiveTaxRate), fontWeight:700, fontSize:13, fontFamily:"Syne, sans-serif" }}>{current.effectiveTaxRate.toFixed(1)}%</span>
        </div>
        <div style={{ background:"rgba(226,232,240,0.9)", borderRadius:6, height:8 }}>
          <div style={{ width:`${Math.min(100,current.effectiveTaxRate * 3)}%`, background:taxColor(current.effectiveTaxRate), height:"100%", borderRadius:6, transition:"width 0.4s" }} />
        </div>
        <div style={{ color:"#334155", fontSize:10, marginTop:6, fontFamily:"DM Sans, sans-serif" }}>
          {current.effectiveTaxRate < 5 ? "✅ Excellent — nearly tax-free" : current.effectiveTaxRate < 15 ? "👍 Good tax efficiency" : current.effectiveTaxRate < 25 ? "⚠️ Room to optimise your structure" : "🔴 High tax — restructure your CTC"}
        </div>
      </div>

      {(bonus > 0 || esop > 0) && (
        <div style={{ background:"rgba(248,250,252,0.85)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:10 }}>
          <div style={{ color:"#fbbf24", fontSize:12, fontWeight:700, fontFamily:"Syne, sans-serif", marginBottom:6 }}>⚡ Bonus & ESOP Tax</div>
          {bonus > 0 && <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif", marginBottom:4 }}>Bonus taxed at your slab rate. TDS deducted by employer at payout.</div>}
          {esop > 0 && <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif" }}>ESOP: perquisite tax at exercise (FMV − strike price). Separate LTCG/STCG when you sell. <span style={{ color:"#6366f1" }}>Hold 12+ months for 10% LTCG.</span></div>}
        </div>
      )}

      <div style={{ background:"rgba(248,250,252,0.85)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:14, overflow:"hidden" }}>
        <div onClick={() => setShowOptimiser(!showOptimiser)} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color:"#4f46e5", fontSize:13, fontWeight:700, fontFamily:"Syne, sans-serif" }}>
              💡 Negotiation Optimiser {allApplied ? "✅" : ""}
            </div>
            <div style={{ color:"#334155", fontSize:11, marginTop:2, fontFamily:"DM Sans, sans-serif" }}>
              {allApplied ? "All optimisations applied — max take-home achieved" : `Apply all → save ${rupee(annualSaving)} more/year`}
            </div>
          </div>
          <div style={{ color:"#6366f1", fontSize:16 }}>{showOptimiser ? "▲" : "▼"}</div>
        </div>

        {showOptimiser && (
          <div style={{ padding:"0 16px 16px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
              <div style={{ background:"rgba(226,232,240,0.9)", borderRadius:10, padding:"12px 10px", textAlign:"center" }}>
                <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase", letterSpacing:0.8, fontFamily:"DM Sans, sans-serif" }}>Current Monthly</div>
                <div style={{ color:"#1e293b", fontSize:18, fontWeight:800, fontFamily:"Syne, sans-serif" }}>{rupee(current.monthlyInHand)}</div>
                <div style={{ color:"#64748b", fontSize:10, marginTop:3, fontFamily:"DM Sans, sans-serif" }}>{current.effectiveTaxRate.toFixed(1)}% tax</div>
              </div>
              <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.07))", border:"1px solid rgba(99,102,241,0.25)", borderRadius:10, padding:"12px 10px", textAlign:"center" }}>
                <div style={{ color:"#4f46e5", fontSize:10, marginBottom:4, textTransform:"uppercase", letterSpacing:0.8, fontFamily:"DM Sans, sans-serif" }}>Fully Optimised</div>
                <div style={{ color:"#4338ca", fontSize:18, fontWeight:800, fontFamily:"Syne, sans-serif" }}>{rupee(optimised.monthlyInHand)}</div>
                <div style={{ color:"#64748b", fontSize:10, marginTop:3, fontFamily:"DM Sans, sans-serif" }}>{optimised.effectiveTaxRate.toFixed(1)}% tax</div>
              </div>
            </div>

            {tips.map(({ applied, label, desc, action }) => (
              <div key={label} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8, padding:"10px 12px", background: applied ? "rgba(248,250,252,0.9)" : "rgba(255,255,255,0.75)", borderRadius:10, border:`1px solid ${applied ? "rgba(15,23,42,0.06)" : "rgba(15,23,42,0.06)"}`, opacity: applied ? 0.5 : 1 }}>
                <div style={{ flex:1 }}>
                  <div style={{ color: applied ? "#334155" : "#1e293b", fontSize:12, fontWeight:600, fontFamily:"DM Sans, sans-serif", marginBottom:2, textDecoration: applied ? "line-through" : "none" }}>{label}</div>
                  <div style={{ color:"#334155", fontSize:11, fontFamily:"DM Sans, sans-serif" }}>{desc}</div>
                </div>
                <button onClick={action} disabled={applied} style={{
                  flexShrink:0, padding:"5px 12px", borderRadius:8, border:"none",
                  cursor: applied ? "default" : "pointer",
                  background: applied ? "rgba(226,232,240,0.9)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: applied ? "#334155" : "#fff",
                  fontSize:11, fontWeight:700, fontFamily:"Syne, sans-serif", whiteSpace:"nowrap",
                  transition:"all 0.2s",
                }}>{applied ? "Applied ✓" : "Apply"}</button>
              </div>
            ))}

            {!allApplied && (
              <button onClick={() => { setBasicPct(35); setNpsOpt(true); setMealAllowance(true); setLta(true); }} style={{
                width:"100%", padding:"10px", borderRadius:10, border:"none", cursor:"pointer",
                background:"linear-gradient(135deg,#00d09c,#00b386)", color:"#fff",
                fontSize:13, fontWeight:700, fontFamily:"Syne, sans-serif", marginTop:4,
              }}>⚡ Apply All Optimisations</button>
            )}
            <div style={{ color:"#1e293b", fontSize:10, fontFamily:"DM Sans, sans-serif", lineHeight:1.5, marginTop:12 }}>
              * New Tax Regime FY2025-26. Std deduction ₹75K. Rebate u/s 87A for taxable income ≤ ₹7L. Consult a CA for exact figures.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PPF Calculator ─────────────────────────────────────────────────────────────
function PPFCalc() {
  const [yearly, setYearly] = useState(150000);
  const [years, setYears] = useState(15);
  const [rate] = useState(7.1);

  let balance = 0, totalInvested = 0;
  const yearlyData = [];
  for (let y = 1; y <= years; y++) {
    balance = (balance + yearly) * (1 + rate / 100);
    totalInvested += yearly;
    yearlyData.push({ year:y, balance:Math.round(balance), invested:totalInvested });
  }
  const maturity = balance;
  const interest = maturity - totalInvested;
  const effectiveReturn = ((maturity / totalInvested - 1) * 100).toFixed(1);

  const ext5 = (() => { let b = balance; for (let y = 0; y < 5; y++) b = (b + yearly) * (1 + rate / 100); return b; })();
  const ext10 = (() => { let b = balance; for (let y = 0; y < 10; y++) b = (b + yearly) * (1 + rate / 100); return b; })();

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(248,250,252,0.85)", border:"1px solid rgba(15,23,42,0.06)", borderRadius:12, padding:"10px 14px", marginBottom:20 }}>
        <div>
          <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif" }}>Current PPF Rate (Govt. Fixed)</div>
          <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif", marginTop:2 }}>Reviewed quarterly · Tax-free · EEE status</div>
        </div>
        <div style={{ color:"#00d09c", fontSize:22, fontWeight:800, fontFamily:"Syne, sans-serif" }}>7.1%</div>
      </div>

      <Slider label="Yearly Investment" value={yearly} min={500} max={150000} step={500} onChange={setYearly} display={rupee(yearly)} />
      <div style={{ color:"#334155", fontSize:11, fontFamily:"DM Sans, sans-serif", marginTop:-14, marginBottom:18 }}>Max ₹1.5L/year allowed under PPF rules</div>

      <Slider label="Investment Period" value={years} min={15} max={30} step={1} onChange={setYears} display={`${years} yrs`} />
      <div style={{ color:"#334155", fontSize:11, fontFamily:"DM Sans, sans-serif", marginTop:-14, marginBottom:18 }}>Minimum 15 yrs · Extendable in 5-yr blocks after maturity</div>

      <div style={{ background:"linear-gradient(135deg,rgba(0,208,156,0.12),rgba(0,179,134,0.06))", border:"1px solid rgba(0,208,156,0.22)", borderRadius:16, padding:"20px 16px", textAlign:"center", marginBottom:10 }}>
        <div style={{ color:"#059669", fontSize:11, textTransform:"uppercase", letterSpacing:1, fontFamily:"DM Sans, sans-serif", marginBottom:4 }}>Maturity Value ({years} years)</div>
        <div key={rupee(maturity)} style={{ color:"#00d09c", fontSize:34, fontWeight:800, fontFamily:"Syne, sans-serif", lineHeight:1, animation:"pmNumPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>{rupee(maturity)}</div>
        <div style={{ color:"#64748b", fontSize:11, marginTop:6, fontFamily:"DM Sans, sans-serif" }}>100% tax-free · No LTCG · No wealth tax</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
        <ResultCard label="Total Invested" value={rupee(totalInvested)} />
        <ResultCard label="Interest Earned" value={rupee(interest)} accent />
        <ResultCard label="Wealth Multiple" value={`${(maturity / totalInvested).toFixed(2)}x`} />
        <ResultCard label="Effective Return" value={`${effectiveReturn}%`} />
      </div>

      <GrowthBar invested={totalInvested} returns={interest} />

      <div style={{ background:"rgba(248,250,252,0.85)", border:"1px solid rgba(15,23,42,0.06)", borderRadius:14, padding:"14px 16px", marginTop:12 }}>
        <div style={{ color:"#1e293b", fontSize:13, fontWeight:700, fontFamily:"Syne, sans-serif", marginBottom:12 }}>🔄 Extension Scenarios</div>
        <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif", marginBottom:12 }}>PPF can be extended in 5-year blocks after maturity</div>
        {[[`${years} yrs (Maturity)`, maturity, "#00d09c"],[`${years+5} yrs (+5 ext)`, ext5, "#3b82f6"],[`${years+10} yrs (+10 ext)`, ext10, "#8b5cf6"]].map(([label, val, color]) => (
          <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(15,23,42,0.06)" }}>
            <span style={{ color:"#64748b", fontSize:12, fontFamily:"DM Sans, sans-serif" }}>{label}</span>
            <span style={{ color, fontWeight:700, fontSize:14, fontFamily:"Syne, sans-serif" }}>{rupee(val)}</span>
          </div>
        ))}
      </div>

      <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))", border:"1px solid rgba(99,102,241,0.2)", borderRadius:12, padding:"12px 14px", marginTop:10 }}>
        <div style={{ color:"#4f46e5", fontSize:12, fontWeight:700, fontFamily:"Syne, sans-serif", marginBottom:6 }}>💜 EEE Tax Status — Triple Exempt</div>
        {[["Invest","Deposits qualify under 80C (old regime)"],["Earn","Interest is fully tax-free every year"],["Withdraw","Maturity amount 100% tax-free"]].map(([stage,desc]) => (
          <div key={stage} style={{ display:"flex", gap:8, marginBottom:4 }}>
            <span style={{ color:"#6366f1", fontSize:11, fontWeight:700, fontFamily:"Syne, sans-serif", width:50, flexShrink:0 }}>{stage}</span>
            <span style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif" }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Income Tax Calculator (Old vs New Regime, FY2025-26) ─────────────────────
function IncomeTaxCalc() {
  const [income, setIncome] = useState(1500000);   // gross annual salary income
  const [ded80C, setDed80C] = useState(150000);    // 80C investments (max 1.5L)
  const [ded80D, setDed80D] = useState(25000);     // health insurance
  const [hra, setHra] = useState(0);               // HRA exemption claimed

  // ── New Regime FY2025-26 ──
  // Slabs: 0–4L nil, 4–8L 5%, 8–12L 10%, 12–16L 15%, 16–20L 20%, 20–24L 25%, >24L 30%
  // Std deduction 75,000. Rebate 87A: full rebate if taxable ≤ 12L (up to ₹60,000).
  const newStdDed = 75000;
  const newTaxable = Math.max(0, income - newStdDed);
  const newSlabTax = (() => {
    let t = 0;
    [[400000,800000,0.05],[800000,1200000,0.10],[1200000,1600000,0.15],
     [1600000,2000000,0.20],[2000000,2400000,0.25],[2400000,Infinity,0.30]]
      .forEach(([lo,hi,r]) => { if (newTaxable > lo) t += (Math.min(newTaxable,hi) - lo) * r; });
    return t;
  })();
  // 87A rebate — taxable income up to 12L pays zero
  const newRebate = newTaxable <= 1200000 ? newSlabTax : 0;
  const newTaxAfterRebate = Math.max(0, newSlabTax - newRebate);
  const newCess = newTaxAfterRebate * 0.04;
  const newTotalTax = newTaxAfterRebate + newCess;

  // ── Old Regime ──
  // Slabs: 0–2.5L nil, 2.5–5L 5%, 5–10L 20%, >10L 30%
  // Std deduction 50,000. Deductions: 80C (max 1.5L), 80D, HRA. Rebate 87A if taxable ≤ 5L.
  const oldStdDed = 50000;
  const oldDeductions = Math.min(ded80C, 150000) + ded80D + hra;
  const oldTaxable = Math.max(0, income - oldStdDed - oldDeductions);
  const oldSlabTax = (() => {
    let t = 0;
    [[250000,500000,0.05],[500000,1000000,0.20],[1000000,Infinity,0.30]]
      .forEach(([lo,hi,r]) => { if (oldTaxable > lo) t += (Math.min(oldTaxable,hi) - lo) * r; });
    return t;
  })();
  const oldRebate = oldTaxable <= 500000 ? oldSlabTax : 0;
  const oldTaxAfterRebate = Math.max(0, oldSlabTax - oldRebate);
  const oldCess = oldTaxAfterRebate * 0.04;
  const oldTotalTax = oldTaxAfterRebate + oldCess;

  // ── Winner ──
  const saving = Math.abs(newTotalTax - oldTotalTax);
  const newWins = newTotalTax <= oldTotalTax;
  const winnerLabel = newWins ? "New Regime" : "Old Regime";
  const winnerColor = "#00d09c";

  // Regime comparison card
  const RegimeCard = ({ title, taxable, totalTax, isWinner, accent }) => (
    <div style={{
      background: isWinner ? "linear-gradient(135deg,rgba(0,208,156,0.12),rgba(0,179,134,0.06))" : "rgba(255,255,255,0.75)",
      border:`1px solid ${isWinner ? "rgba(0,208,156,0.3)" : "rgba(15,23,42,0.07)"}`,
      borderRadius:14, padding:"16px 14px", textAlign:"center", position:"relative",
    }}>
      {isWinner && (
        <div style={{ position:"absolute", top:-9, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#00d09c,#00b386)", color:"#fff", fontSize:9, fontWeight:800, fontFamily:"Syne, sans-serif", padding:"3px 10px", borderRadius:10, textTransform:"uppercase", letterSpacing:0.5, whiteSpace:"nowrap" }}>✓ Best for you</div>
      )}
      <div style={{ color:"#64748b", fontSize:11, marginBottom:8, marginTop: isWinner ? 4 : 0, fontFamily:"DM Sans, sans-serif", textTransform:"uppercase", letterSpacing:0.8 }}>{title}</div>
      <div key={totalTax} style={{ color: isWinner ? "#00b386" : "#1e293b", fontSize:22, fontWeight:800, fontFamily:"Syne, sans-serif", lineHeight:1.1, animation:"pmNumPop 0.38s cubic-bezier(0.34,1.56,0.64,1)" }}>{rupee(totalTax)}</div>
      <div style={{ color:"#94a3b8", fontSize:10, marginTop:4, fontFamily:"DM Sans, sans-serif" }}>tax on {rupee(taxable)} taxable</div>
    </div>
  );

  return (
    <div>
      <Slider label="Annual Income (Gross Salary)" value={income} min={300000} max={10000000} step={50000} onChange={setIncome} display={rupee(income)} />

      {/* Old-regime deductions */}
      <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif", marginBottom:10, marginTop:4, textTransform:"uppercase", letterSpacing:0.8 }}>
        Deductions (used by Old Regime only)
      </div>
      <Slider label="80C — PF, ELSS, LIC, PPF…" value={ded80C} min={0} max={150000} step={5000} onChange={setDed80C} display={ded80C > 0 ? rupee(ded80C) : "None"} />
      <Slider label="80D — Health Insurance" value={ded80D} min={0} max={100000} step={5000} onChange={setDed80D} display={ded80D > 0 ? rupee(ded80D) : "None"} />
      <Slider label="HRA Exemption" value={hra} min={0} max={500000} step={10000} onChange={setHra} display={hra > 0 ? rupee(hra) : "None"} />

      {/* Winner hero */}
      <div style={{ background:"linear-gradient(135deg,rgba(0,208,156,0.12),rgba(0,179,134,0.06))", border:"1px solid rgba(0,208,156,0.25)", borderRadius:16, padding:"18px 16px", textAlign:"center", margin:"18px 0 14px" }}>
        <div style={{ color:"#059669", fontSize:11, textTransform:"uppercase", letterSpacing:1, fontFamily:"DM Sans, sans-serif", marginBottom:4 }}>You Save With</div>
        <div key={winnerLabel} style={{ color:"#00b386", fontSize:26, fontWeight:800, fontFamily:"Syne, sans-serif", lineHeight:1.1, animation:"pmNumPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>{winnerLabel}</div>
        <div style={{ color:"#64748b", fontSize:12, marginTop:6, fontFamily:"DM Sans, sans-serif" }}>
          {saving < 1 ? "Both regimes cost the same" : `Saves you ${rupee(saving)} per year`}
        </div>
      </div>

      {/* Side-by-side */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <RegimeCard title="New Regime" taxable={newTaxable} totalTax={newTotalTax} isWinner={newWins} />
        <RegimeCard title="Old Regime" taxable={oldTaxable} totalTax={oldTotalTax} isWinner={!newWins} />
      </div>

      {/* Breakdown stats */}
      <StatRow label="New regime taxable income" value={rupee(newTaxable)} color="#00b386" />
      <StatRow label="Old regime taxable income" value={rupee(oldTaxable)} color="#6366f1" />
      <StatRow label="Old regime total deductions" value={rupee(oldStdDed + oldDeductions)} color="#f59e0b" />

      {/* Helper note */}
      <div style={{ background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:12, padding:"12px 14px", marginTop:12 }}>
        <div style={{ color:"#4f46e5", fontSize:12, fontWeight:700, fontFamily:"Syne, sans-serif", marginBottom:5 }}>💡 Quick guide</div>
        <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>
          The <strong>New Regime</strong> has lower rates but no deductions — best if you don't invest much. The <strong>Old Regime</strong> rewards 80C/80D/HRA — best if you claim a lot. Under the new regime, income up to ₹12L is effectively tax-free.
        </div>
      </div>
    </div>
  );
}

// ── Email Capture Modal ───────────────────────────────────────────────────────
function EmailModal({ onClose, subject, body, source }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleSubmit = async () => {
    if (!validEmail(email)) { setMsg("Please enter a valid email."); return; }
    if (!canSubmit(email))  { setMsg("Please wait 60 seconds before submitting again."); return; }
    setStatus("sending");
    const { error } = await sbInsert("email_subscribers", { email, source, created_at: new Date().toISOString() });
    if (error && !error.includes("duplicate")) {
      setStatus("error");
      setMsg(supabaseReady ? "Something went wrong. Try again." : "⚠️ Supabase not connected yet — add your keys to activate.");
      return;
    }
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
    setStatus("done");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", zIndex:100, display:"flex", alignItems:"flex-end" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"rgba(255,255,255,0.97)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderRadius:"24px 24px 0 0", padding:"28px 24px 40px", width:"100%", border:"1px solid rgba(15,23,42,0.06)", animation:"pmModalUp 0.32s cubic-bezier(0.32,0.72,0,1)" }}>
        {status === "done" ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
            <div style={{ color:"#0f172a", fontSize:18, fontWeight:800, fontFamily:"Syne, sans-serif", marginBottom:8 }}>Check your inbox!</div>
            <div style={{ color:"#64748b", fontSize:13, fontFamily:"DM Sans, sans-serif", marginBottom:24 }}>Your calculation has been sent to {email}</div>
            <button onClick={onClose} style={{ background:"linear-gradient(135deg,#00d09c,#00b386)", color:"#fff", border:"none", borderRadius:12, padding:"12px 32px", fontSize:14, fontWeight:700, fontFamily:"Syne, sans-serif", cursor:"pointer" }}>Done</button>
          </div>
        ) : (<>
          <div style={{ color:"#0f172a", fontSize:18, fontWeight:800, fontFamily:"Syne, sans-serif", marginBottom:4 }}>Email this calculation</div>
          <div style={{ color:"#64748b", fontSize:13, fontFamily:"DM Sans, sans-serif", marginBottom:20 }}>We'll send your results + save you a spot for new calculators.</div>
          <input ref={inputRef} type="email" placeholder="your@email.com" value={email}
            onChange={(e) => { setEmail(e.target.value); setMsg(""); }}
            style={{ width:"100%", background:"rgba(248,250,252,0.85)", border:"1px solid rgba(15,23,42,0.06)", borderRadius:12, padding:"14px 16px", color:"#0f172a", fontSize:14, fontFamily:"DM Sans, sans-serif", outline:"none", boxSizing:"border-box", marginBottom:12 }}
          />
          {msg && <div style={{ color:"#f97316", fontSize:12, fontFamily:"DM Sans, sans-serif", marginBottom:10 }}>{msg}</div>}
          <button onClick={handleSubmit} disabled={status === "sending"} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor: status === "sending" ? "wait" : "pointer", background:"linear-gradient(135deg,#00d09c,#00b386)", color:"#fff", fontSize:15, fontWeight:700, fontFamily:"Syne, sans-serif", opacity: status === "sending" ? 0.7 : 1 }}>
            {status === "sending" ? "Sending…" : "Send & Save →"}
          </button>
          <div style={{ color:"#1e293b", fontSize:11, fontFamily:"DM Sans, sans-serif", textAlign:"center", marginTop:12 }}>No spam. Unsubscribe anytime.</div>
        </>)}
      </div>
    </div>
  );
}

// ── Notify Me Modal ───────────────────────────────────────────────────────────
function NotifyModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleSubmit = async () => {
    if (!validEmail(email)) { setMsg("Please enter a valid email."); return; }
    if (!canSubmit(email))  { setMsg("Please wait 60 seconds before trying again."); return; }
    setStatus("sending");
    const { error } = await sbInsert("email_subscribers", { email, source:"notify_me", created_at: new Date().toISOString() });
    if (error && !error.includes("duplicate")) {
      setStatus("error");
      setMsg(supabaseReady ? "Something went wrong. Try again." : "⚠️ Supabase not connected yet — add your keys to activate.");
      return;
    }
    setStatus("done");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", zIndex:100, display:"flex", alignItems:"flex-end" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"rgba(255,255,255,0.97)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderRadius:"24px 24px 0 0", padding:"28px 24px 40px", width:"100%", border:"1px solid rgba(15,23,42,0.06)", animation:"pmModalUp 0.32s cubic-bezier(0.32,0.72,0,1)" }}>
        {status === "done" ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
            <div style={{ color:"#0f172a", fontSize:18, fontWeight:800, fontFamily:"Syne, sans-serif", marginBottom:8 }}>You're on the list!</div>
            <div style={{ color:"#64748b", fontSize:13, fontFamily:"DM Sans, sans-serif", marginBottom:24 }}>We'll notify you when new calculators drop.</div>
            <button onClick={onClose} style={{ background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff", border:"none", borderRadius:12, padding:"12px 32px", fontSize:14, fontWeight:700, fontFamily:"Syne, sans-serif", cursor:"pointer" }}>Done</button>
          </div>
        ) : (<>
          <div style={{ color:"#0f172a", fontSize:18, fontWeight:800, fontFamily:"Syne, sans-serif", marginBottom:4 }}>Get notified 🔔</div>
          <div style={{ color:"#64748b", fontSize:13, fontFamily:"DM Sans, sans-serif", marginBottom:20 }}>Tax regime, NPS, Rent vs Buy and more — be first to know.</div>
          <input ref={inputRef} type="email" placeholder="your@email.com" value={email}
            onChange={(e) => { setEmail(e.target.value); setMsg(""); }}
            style={{ width:"100%", background:"rgba(248,250,252,0.85)", border:"1px solid rgba(15,23,42,0.06)", borderRadius:12, padding:"14px 16px", color:"#0f172a", fontSize:14, fontFamily:"DM Sans, sans-serif", outline:"none", boxSizing:"border-box", marginBottom:12 }}
          />
          {msg && <div style={{ color:"#f97316", fontSize:12, fontFamily:"DM Sans, sans-serif", marginBottom:10 }}>{msg}</div>}
          <button onClick={handleSubmit} disabled={status === "sending"} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor: status === "sending" ? "wait" : "pointer", background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff", fontSize:15, fontWeight:700, fontFamily:"Syne, sans-serif", opacity: status === "sending" ? 0.7 : 1 }}>
            {status === "sending" ? "Saving…" : "Notify Me →"}
          </button>
          <div style={{ color:"#1e293b", fontSize:11, fontFamily:"DM Sans, sans-serif", textAlign:"center", marginTop:12 }}>No spam. Unsubscribe anytime.</div>
        </>)}
      </div>
    </div>
  );
}

// ── Affiliate links ───────────────────────────────────────────────────────────
const AFFILIATES = {
  emi:  { label:"Compare home loan rates", url:"https://www.paisabazaar.com/home-loan/?ref=paisamarg", cta:"Check Rates →" },
  sip:  { label:"Start this SIP on Groww", url:"https://groww.in/?ref=paisamarg", cta:"Invest on Groww →" },
  fd:   { label:"Best FD rates right now", url:"https://www.bankbazaar.com/fixed-deposit.html?ref=paisamarg", cta:"Compare FDs →" },
  ppf:  { label:"Open PPF — SBI / Post Office", url:"https://www.onlinesbi.sbi/?ref=paisamarg", cta:"Open Account →" },
  fire: { label:"Start retirement SIP on Coin", url:"https://coin.zerodha.com/?ref=paisamarg", cta:"Invest on Zerodha →" },
  ctc:  { label:"Find higher-paying roles", url:"https://www.naukri.com/?ref=paisamarg", cta:"Browse Jobs →" },
  tax:  { label:"File your taxes online", url:"https://cleartax.in/?ref=paisamarg", cta:"File ITR →" },
};

function AffiliateNudge({ calcId }) {
  const aff = AFFILIATES[calcId];
  if (!aff) return null;
  return (
    <a href={aff.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginTop:14 }}>
      <div style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", border:"1px solid rgba(15,23,42,0.06)", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:"#334155", fontSize:10, fontFamily:"DM Sans, sans-serif", textTransform:"uppercase", letterSpacing:0.8, marginBottom:3 }}>Sponsored</div>
          <div style={{ color:"#334155", fontSize:13, fontWeight:600, fontFamily:"DM Sans, sans-serif" }}>{aff.label}</div>
        </div>
        <div style={{ background:"linear-gradient(135deg,#00d09c,#00b386)", color:"#fff", padding:"7px 12px", borderRadius:10, fontSize:11, fontWeight:700, fontFamily:"Syne, sans-serif", whiteSpace:"nowrap", marginLeft:10 }}>{aff.cta}</div>
      </div>
    </a>
  );
}

// ── Disclaimers ───────────────────────────────────────────────────────────────
const DISCLAIMERS = {
  emi:  "Actual EMI may vary based on lender processing fees, GST charges, and exact disbursement date. Rate shown is reducing balance. Consult your lender for a final amortisation schedule.",
  sip:  "Mutual fund investments are subject to market risks. Returns shown are based on assumed rates and are not guaranteed. Past performance is not indicative of future results. Read all scheme documents carefully.",
  fd:   "Interest rates vary by bank, tenure and deposit amount. Senior citizen rates may differ. TDS applicable on interest above ₹40,000/year (₹50,000 for seniors).",
  ppf:  "PPF interest rate is set by the Government of India and reviewed quarterly. The 7.1% rate is current as of FY2025-26 and may change. Partial withdrawal rules apply after year 6.",
  fire: "Retirement projections are illustrative estimates based on assumed inflation and return rates. Actual outcomes will vary. This is not a financial plan. Consult a SEBI-registered investment advisor.",
  ctc:  "Tax calculations are indicative under the New Tax Regime FY2025-26. Actual liability depends on your specific salary structure, exemptions, and employer TDS. Consult a qualified CA for exact figures.",
  tax:  "Tax estimates are indicative for FY2025-26 (AY2026-27) and assume a salaried individual below 60. Surcharge for high incomes, marginal relief, and other deductions are simplified. Consult a qualified CA for exact figures.",
};

function DisclaimerBar({ calcId }) {
  const [expanded, setExpanded] = useState(false);
  const text = DISCLAIMERS[calcId];
  if (!text) return null;
  return (
    <div style={{ marginTop:14, background:"rgba(248,250,252,0.9)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:12, padding:"12px 14px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif", lineHeight:1.5, flex:1 }}>
          ⚠️ {expanded ? text : text.slice(0,80) + (text.length > 80 ? "…" : "")}
        </div>
        {text.length > 80 && (
          <button onClick={() => setExpanded(!expanded)} style={{ background:"none", border:"none", color:"#64748b", fontSize:11, cursor:"pointer", fontFamily:"DM Sans, sans-serif", flexShrink:0, padding:0 }}>
            {expanded ? "Less" : "More"}
          </button>
        )}
      </div>
      <div style={{ color:"#64748b", fontSize:10, fontFamily:"DM Sans, sans-serif", marginTop:6 }}>
        For reference only · Not financial advice · Consult a CA or SEBI-registered advisor
      </div>
    </div>
  );
}

function AdSlot({ position = "inline" }) {
  return (
    <div style={{ margin:"14px 0", background:"rgba(248,250,252,0.9)", border:"1px dashed rgba(226,232,240,0.9)", borderRadius:12, padding:"14px", textAlign:"center", minHeight: position === "banner" ? 90 : 60, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:4 }}>
      <div style={{ color:"#1e293b", fontSize:10, fontFamily:"DM Sans, sans-serif" }}>Ad</div>
      <div style={{ color:"#1e293b", fontSize:9, fontFamily:"DM Sans, sans-serif" }}>media.net slot — activate after approval</div>
    </div>
  );
}

// ── Global disclaimer modal ───────────────────────────────────────────────────
function GlobalDisclaimer({ onAccept }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:200, display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:"rgba(255,255,255,0.97)", backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", borderRadius:"24px 24px 0 0", padding:"28px 24px 40px", width:"100%", border:"1px solid rgba(15,23,42,0.06)", boxSizing:"border-box", animation:"pmModalUp 0.4s cubic-bezier(0.32,0.72,0,1)" }}>
        <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>📊</div>
        <div style={{ color:"#0f172a", fontSize:18, fontWeight:800, fontFamily:"Syne, sans-serif", marginBottom:10, textAlign:"center" }}>For Reference Only</div>
        <div style={{ color:"#64748b", fontSize:13, fontFamily:"DM Sans, sans-serif", lineHeight:1.6, marginBottom:8 }}>
          PaisaMarg calculators provide <strong style={{ color:"#1e293b" }}>indicative estimates</strong> for educational purposes only.
        </div>
        <div style={{ color:"#64748b", fontSize:12, fontFamily:"DM Sans, sans-serif", lineHeight:1.6, marginBottom:20 }}>
          Results are based on inputs and assumed rates — they do not constitute financial, tax, or investment advice. Market returns are not guaranteed. Tax calculations may vary based on your individual circumstances.
          <br /><br />
          Always consult a <strong style={{ color:"#64748b" }}>qualified CA</strong> or <strong style={{ color:"#64748b" }}>SEBI-registered investment advisor</strong> before making financial decisions.
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[["🏦","Not a bank or broker"],["📈","Returns are assumptions"],["💼","Not a CA or advisor"],["⚖️","Not legal/tax advice"]].map(([icon,text]) => (
            <div key={text} style={{ background:"rgba(255,255,255,0.75)", borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>{icon}</span>
              <span style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif" }}>{text}</span>
            </div>
          ))}
        </div>
        <button onClick={onAccept} style={{ width:"100%", marginTop:20, padding:"15px", borderRadius:14, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#00d09c,#00b386)", color:"#fff", fontSize:15, fontWeight:800, fontFamily:"Syne, sans-serif", boxShadow:"0 8px 24px rgba(0,208,156,0.28)" }}>
          I Understand — Let me Calculate
        </button>
        <div style={{ color:"#1e293b", fontSize:10, fontFamily:"DM Sans, sans-serif", textAlign:"center", marginTop:10 }}>Shown once · Stored locally · No data collected</div>
      </div>
    </div>
  );
}

// ── Calculator registry ───────────────────────────────────────────────────────
const CALCULATORS = [
  { id:"emi",  label:"EMI Calculator",  icon:"🏠", tagline:"Know your EMI before you sign",         category:"borrow", color:"#3b82f6", component:EMICalc  },
  { id:"sip",  label:"SIP & Lumpsum",   icon:"📈", tagline:"Watch your wealth compound",            category:"invest", color:"#00d09c", component:SIPCalc  },
  { id:"fd",   label:"FD / RD",         icon:"🏦", tagline:"Safe, steady, guaranteed",              category:"invest", color:"#00d09c", component:FDCalc   },
  { id:"ppf",  label:"PPF Calculator",  icon:"💜", tagline:"Tax-free 7.1% — the gold standard",    category:"invest", color:"#8b5cf6", component:PPFCalc  },
  { id:"fire", label:"FIRE Planner",    icon:"🔥", tagline:"Find your retirement number",          category:"plan",   color:"#f97316", component:FIRECalc },
  { id:"ctc",  label:"Salary / CTC",    icon:"💼", tagline:"Negotiate smarter, take home more",    category:"plan",   color:"#6366f1", component:CTCCalc  },
  { id:"tax",  label:"Income Tax",      icon:"🧾", tagline:"Old vs New regime — find your winner", category:"plan",   color:"#ef4444", component:IncomeTaxCalc },
];

const CATEGORIES = [
  { id:"all",    label:"All",    icon:"⚡" },
  { id:"borrow", label:"Borrow", icon:"🏠" },
  { id:"invest", label:"Invest", icon:"📈" },
  { id:"plan",   label:"Plan",   icon:"🎯" },
];

// ── SEO metadata — per calculator + info pages ────────────────────────────────
const SITE_URL = "https://paisamarg.in";

const SEO = {
  home: {
    title: "PaisaMarg — Free Personal Finance Calculators for India",
    description: "Free, easy money calculators for India: EMI, SIP, FD/RD, PPF, FIRE retirement and salary/CTC. No signup. Instant results.",
  },
  emi: {
    title: "EMI Calculator — Home, Car & Personal Loan EMI | PaisaMarg",
    description: "Calculate your monthly loan EMI instantly. See total interest, principal breakdown and amortisation for home, car and personal loans in India.",
  },
  sip: {
    title: "SIP Calculator — Mutual Fund SIP & Lumpsum Returns | PaisaMarg",
    description: "Calculate SIP and lumpsum mutual fund returns. See future value, wealth gained and return multiple for your monthly investments.",
  },
  fd: {
    title: "FD & RD Calculator — Fixed & Recurring Deposit Returns | PaisaMarg",
    description: "Calculate Fixed Deposit (FD) and Recurring Deposit (RD) maturity value and interest earned with quarterly compounding.",
  },
  ppf: {
    title: "PPF Calculator — Public Provident Fund Maturity | PaisaMarg",
    description: "Calculate your PPF maturity value at the current 7.1% rate. See tax-free returns, extension scenarios and the EEE tax benefit.",
  },
  fire: {
    title: "FIRE Calculator — Retirement Planning for India | PaisaMarg",
    description: "Find your FIRE number and plan early retirement. Calculate the corpus you need and whether your savings will last.",
  },
  ctc: {
    title: "Salary Calculator — CTC to In-Hand (New Tax Regime) | PaisaMarg",
    description: "Convert your CTC to monthly in-hand salary under the new tax regime FY2025-26. See tax, PF, and optimise your structure.",
  },
  tax: {
    title: "Income Tax Calculator — Old vs New Regime FY2025-26 | PaisaMarg",
    description: "Compare old vs new tax regime side by side for FY2025-26. See which regime saves you more tax with 80C, 80D and HRA deductions.",
  },
  about:      { title: "About PaisaMarg — Money Tools for India", description: "Learn about PaisaMarg, free personal finance calculators built for Indian users." },
  contact:    { title: "Contact PaisaMarg", description: "Get in touch with the PaisaMarg team." },
  privacy:    { title: "Privacy Policy — PaisaMarg", description: "How PaisaMarg handles your data and privacy." },
  disclaimer: { title: "Disclaimer — PaisaMarg", description: "Important information about using PaisaMarg calculators." },
};

// Apply title, meta description, canonical + JSON-LD for the current view
function applySEO(key) {
  const meta = SEO[key] || SEO.home;
  try {
    document.title = meta.title;

    // Meta description
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement("meta"); desc.name = "description"; document.head.appendChild(desc); }
    desc.content = meta.description;

    // Canonical URL
    const path = key === "home" ? "/" : `/${key}`;
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
    canon.href = SITE_URL + path;

    // Open Graph
    const setOG = (prop, content) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.content = content;
    };
    setOG("og:title", meta.title);
    setOG("og:description", meta.description);
    setOG("og:url", SITE_URL + path);
    setOG("og:type", "website");
    setOG("og:site_name", "PaisaMarg");

    // JSON-LD structured data — mark calculators as WebApplication
    let ld = document.getElementById("pm-jsonld");
    if (!ld) { ld = document.createElement("script"); ld.id = "pm-jsonld"; ld.type = "application/ld+json"; document.head.appendChild(ld); }
    const calc = CALCULATORS.find(c => c.id === key);
    ld.textContent = JSON.stringify(
      calc
        ? {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: meta.title.split(" | ")[0],
            description: meta.description,
            url: SITE_URL + path,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
            publisher: { "@type": "Organization", name: "PaisaMarg", url: SITE_URL },
          }
        : {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "PaisaMarg",
            description: SEO.home.description,
            url: SITE_URL,
          }
    );
  } catch {}
}

// ── Home Screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onSelect }) {
  const [cat, setCat] = useState("all");
  const [showNotify, setShowNotify] = useState(false);
  const filtered = cat === "all" ? CALCULATORS : CALCULATORS.filter(c => c.category === cat);

  return (
    <div style={{ paddingBottom:40 }}>
      {/* Hero */}
      <div className="pm-home-pad" style={{ padding:"30px 20px 0" }}>
        {/* Eyebrow badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(0,208,156,0.08)", border:"1px solid rgba(0,208,156,0.18)", borderRadius:20, padding:"5px 13px", marginBottom:18 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#00d09c", animation:"pmPulse 2.2s ease-in-out infinite" }} />
          <span style={{ color:"#00d09c", fontSize:11, fontWeight:600, fontFamily:"DM Sans, sans-serif", letterSpacing:0.3 }}>Free · No signup · Built for India</span>
        </div>

        {/* Headline */}
        <div style={{ fontFamily:"Syne, sans-serif", lineHeight:1.1, marginBottom:10 }}>
          <div style={{ color:"#0f172a", fontSize:33, fontWeight:800 }}>Your money,</div>
          <span className="pm-shine" style={{ fontSize:33, fontWeight:800, display:"block" }}>calculated.</span>
        </div>
        <div style={{ color:"#64748b", fontSize:13, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>
          Smart tools to plan, borrow and invest smarter
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display:"flex", gap:8, padding:"22px 20px 0", overflowX:"auto", scrollbarWidth:"none" }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            flexShrink:0, padding:"7px 16px", borderRadius:20, border:"none", cursor:"pointer",
            background: cat === c.id ? "linear-gradient(135deg,#00d09c,#00b386)" : "rgba(241,245,249,0.85)",
            backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
            color: cat === c.id ? "#fff" : "#64748b",
            fontSize:12, fontWeight:700, fontFamily:"Syne, sans-serif", transition:"all 0.2s",
            boxShadow: cat === c.id ? "0 4px 16px rgba(0,208,156,0.3)" : "none",
          }}>{c.icon} {c.label}</button>
        ))}
      </div>

      {/* Calculator cards */}
      <div className="pm-home-cards pm-home-pad" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"16px 20px 0" }}>
        {filtered.map((calc, i) => (
          <button
            key={calc.id}
            onClick={() => onSelect(calc.id)}
            className="pm-card"
            style={{
              background:"rgba(255,255,255,0.82)",
              backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
              border:"1px solid rgba(15,23,42,0.06)",
              borderRadius:20, padding:"18px 15px",
              textAlign:"left", cursor:"pointer",
              display:"flex", flexDirection:"column",
              minHeight:172,
              boxShadow:"0 4px 20px rgba(15,23,42,0.12)",
              animation:`pmCardIn 0.4s ease-out ${i * 0.07}s both`,
              position:"relative", overflow:"hidden",
            }}
          >
            {/* Per-card colour glow — top right corner */}
            <div style={{ position:"absolute", top:-25, right:-25, width:90, height:90, borderRadius:"50%", background:`radial-gradient(circle,${calc.color}1e,transparent 70%)`, pointerEvents:"none" }} />

            {/* Icon badge */}
            <div style={{ width:46, height:46, borderRadius:14, marginBottom:12, flexShrink:0, background:`${calc.color}12`, border:`1px solid ${calc.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
              {calc.icon}
            </div>

            <div style={{ color:"#1e293b", fontSize:13, fontWeight:700, fontFamily:"Syne, sans-serif", lineHeight:1.3, marginBottom:5 }}>
              {calc.label}
            </div>
            <div style={{ color:"#334155", fontSize:11, fontFamily:"DM Sans, sans-serif", lineHeight:1.45, flex:1 }}>
              {calc.tagline}
            </div>

            {/* Bottom colour strip */}
            <div style={{ marginTop:12, height:2, borderRadius:2, background:`linear-gradient(90deg,${calc.color}55,transparent)` }} />
          </button>
        ))}
      </div>

      {showNotify && <NotifyModal onClose={() => setShowNotify(false)} />}

      {/* Coming soon teaser */}
      <div style={{ margin:"16px 20px 0", background:"rgba(59,130,246,0.07)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", border:"1px solid rgba(59,130,246,0.14)", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:"#1e293b", fontSize:13, fontWeight:600, fontFamily:"Syne, sans-serif" }}>More calculators coming</div>
          <div style={{ color:"#64748b", fontSize:11, marginTop:2, fontFamily:"DM Sans, sans-serif" }}>Tax regime, NPS, Rent vs Buy & more</div>
        </div>
        <button onClick={() => setShowNotify(true)} style={{ background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff", padding:"8px 14px", borderRadius:10, fontSize:12, fontWeight:700, fontFamily:"Syne, sans-serif", cursor:"pointer", border:"none", boxShadow:"0 4px 14px rgba(99,102,241,0.28)", flexShrink:0 }}>
          Notify Me
        </button>
      </div>

      <div style={{ padding:"0 20px" }}>
        <AdSlot position="banner" />
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════
// INFO PAGES — About / Contact / Privacy / Disclaimer + Footer
// ════════════════════════════════════════════════════════════════════════
const CONTACT_EMAIL = "hello@paisamarg.in";
const LAST_UPDATED = "June 2026";

// ── Shared page shell ─────────────────────────────────────────────────────────
function InfoPageShell({ title, subtitle, children }) {
  return (
    <div style={{ padding:"24px 20px 60px", maxWidth:680, margin:"0 auto" }}>
      <div style={{ color:"#0f172a", fontSize:26, fontWeight:800, fontFamily:"Syne, sans-serif", lineHeight:1.2 }}>{title}</div>
      {subtitle && <div style={{ color:"#64748b", fontSize:14, marginTop:8, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>{subtitle}</div>}
      <div style={{ marginTop:24 }}>{children}</div>
    </div>
  );
}

function InfoSection({ heading, children }) {
  return (
    <div style={{ marginBottom:26 }}>
      {heading && <div style={{ color:"#0f172a", fontSize:16, fontWeight:700, fontFamily:"Syne, sans-serif", marginBottom:10 }}>{heading}</div>}
      <div style={{ color:"#475569", fontSize:14, fontFamily:"DM Sans, sans-serif", lineHeight:1.7 }}>{children}</div>
    </div>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <InfoPageShell
      title="About PaisaMarg"
      subtitle="Clear, honest money tools — built for India."
    >
      <InfoSection>
        PaisaMarg is a free collection of personal finance calculators designed
        specifically for Indian users. Whether you're working out the EMI on a
        home loan, projecting how a SIP could grow, planning your retirement
        number, or figuring out your real take-home salary, PaisaMarg gives you
        clear answers in seconds — no sign-up, no jargon, no cost.
      </InfoSection>

      <InfoSection heading="Why we built it">
        Most financial calculators are either buried inside a bank's website,
        cluttered with upsells, or built for a different country's tax rules.
        PaisaMarg focuses on the numbers that matter to Indians — PPF, the new
        tax regime, CTC structuring, FIRE planning — and presents them simply,
        on any device.
      </InfoSection>

      <InfoSection heading="How our calculators work">
        Every calculator uses standard, widely-accepted financial formulas —
        the same compound interest, EMI, and tax-slab maths used across the
        industry. We show our assumptions clearly so you always understand what
        drives the result. Where rates are set by the government (like PPF), we
        use the current published figure and note when it was last reviewed.
      </InfoSection>

      <InfoSection heading="What PaisaMarg is not">
        PaisaMarg is an educational tool, not a financial advisor. We are not a
        bank, broker, or registered investment adviser. Our results are
        indicative estimates to help you think — not personalised advice. For
        decisions that matter, always consult a qualified CA or a
        SEBI-registered investment adviser.
      </InfoSection>

      <InfoSection heading="Stay in touch">
        We're always adding new calculators. If you have a suggestion, spot an
        error, or just want to say hello, email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color:"#00b386", fontWeight:600, textDecoration:"none" }}>{CONTACT_EMAIL}</a>.
      </InfoSection>
    </InfoPageShell>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
function ContactPage() {
  return (
    <InfoPageShell
      title="Contact Us"
      subtitle="We'd love to hear from you."
    >
      <InfoSection>
        Have a question, a calculator suggestion, found a bug, or want to discuss
        a partnership? Reach us by email and we'll get back to you as soon as we can.
      </InfoSection>

      <a href={`mailto:${CONTACT_EMAIL}`} style={{ textDecoration:"none", display:"block" }}>
        <div style={{
          background:"linear-gradient(135deg,rgba(0,208,156,0.1),rgba(0,179,134,0.05))",
          border:"1px solid rgba(0,208,156,0.25)", borderRadius:16, padding:"20px",
          display:"flex", alignItems:"center", gap:14,
        }}>
          <div style={{ width:46, height:46, borderRadius:12, background:"rgba(0,208,156,0.14)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>📧</div>
          <div>
            <div style={{ color:"#64748b", fontSize:11, fontFamily:"DM Sans, sans-serif", textTransform:"uppercase", letterSpacing:0.8 }}>Email us</div>
            <div style={{ color:"#00b386", fontSize:16, fontWeight:700, fontFamily:"Syne, sans-serif", marginTop:2 }}>{CONTACT_EMAIL}</div>
          </div>
        </div>
      </a>

      <InfoSection heading="Response time">
        We're a small operation, so please allow a few working days for a reply.
        For corrections to a calculation, it helps if you tell us which calculator
        and the inputs you used.
      </InfoSection>
    </InfoPageShell>
  );
}

// ── PRIVACY POLICY ────────────────────────────────────────────────────────────
function PrivacyPage() {
  return (
    <InfoPageShell
      title="Privacy Policy"
      subtitle={`Last updated: ${LAST_UPDATED}`}
    >
      <InfoSection>
        This Privacy Policy explains what information PaisaMarg ("we", "us",
        "the site") collects when you use paisamarg.in, how we use it, and the
        choices you have. By using the site, you agree to the practices described here.
      </InfoSection>

      <InfoSection heading="Information we collect">
        <strong>Email addresses you give us.</strong> If you choose to email
        yourself a calculation or sign up to be notified about new calculators,
        we store the email address you enter, along with which feature you used
        and the date. You provide this voluntarily — the calculators work fully
        without it.
        <br /><br />
        <strong>Calculator inputs.</strong> The numbers you type into a
        calculator are processed in your browser to show results. We do not store
        the figures you enter on our servers.
        <br /><br />
        <strong>Automatically collected data.</strong> Like most websites, our
        hosting and analytics tools may collect standard technical information
        such as your browser type, device, approximate region, and pages visited.
        This helps us understand usage and improve the site.
      </InfoSection>

      <InfoSection heading="Cookies and similar technologies">
        We may use cookies and similar technologies for basic site functionality,
        to remember preferences (such as dismissing the disclaimer notice), and to
        measure traffic. Advertising partners (see below) may also set cookies.
        You can control or delete cookies through your browser settings; some
        features may not work as well if you disable them.
      </InfoSection>

      <InfoSection heading="Advertising">
        We may display advertisements served by third-party advertising networks,
        including Media.net and its partners. These networks may use cookies, web
        beacons, or similar technologies to serve ads based on your prior visits
        to this and other websites, and to measure ad performance. We do not share
        the email addresses you give us with advertising networks. You can learn
        about opting out of personalised advertising at sites such as
        youronlinechoices.com or the Network Advertising Initiative.
      </InfoSection>

      <InfoSection heading="Analytics">
        We may use analytics services to understand how visitors use the site in
        aggregate. These services may collect information such as pages viewed and
        general location, and may use cookies. The data is used to improve the
        site, not to identify you personally.
      </InfoSection>

      <InfoSection heading="How we use your information">
        We use the information we collect to: provide and improve the calculators;
        send you a calculation or new-calculator notification if you requested one;
        understand site usage; display and measure advertising; and keep the site
        secure. We do not sell your personal information.
      </InfoSection>

      <InfoSection heading="Data sharing">
        We share data only with the service providers that help us run the site —
        for example our hosting provider, database provider, analytics, and
        advertising partners — and only as needed for those services. We may also
        disclose information if required by law.
      </InfoSection>

      <InfoSection heading="Data retention and your rights">
        We keep the email addresses you provide until you ask us to remove them.
        You can request access to, correction of, or deletion of the personal
        information we hold about you at any time by emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color:"#00b386", fontWeight:600, textDecoration:"none" }}>{CONTACT_EMAIL}</a>.
      </InfoSection>

      <InfoSection heading="Children">
        PaisaMarg is intended for adults making financial decisions and is not
        directed at children under 13. We do not knowingly collect personal
        information from children.
      </InfoSection>

      <InfoSection heading="Changes to this policy">
        We may update this policy from time to time. When we do, we'll revise the
        "Last updated" date at the top of this page.
      </InfoSection>

      <InfoSection heading="Contact">
        Questions about this policy? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color:"#00b386", fontWeight:600, textDecoration:"none" }}>{CONTACT_EMAIL}</a>.
      </InfoSection>
    </InfoPageShell>
  );
}

// ── DISCLAIMER ────────────────────────────────────────────────────────────────
function DisclaimerPage() {
  return (
    <InfoPageShell
      title="Disclaimer"
      subtitle={`Last updated: ${LAST_UPDATED}`}
    >
      <InfoSection heading="For reference only">
        All calculators and content on PaisaMarg are provided for general
        informational and educational purposes only. They produce indicative
        estimates based on the inputs you provide and standard financial formulas.
        They do not constitute financial, investment, tax, legal, or accounting advice.
      </InfoSection>

      <InfoSection heading="Not a substitute for professional advice">
        PaisaMarg is not a bank, broker, financial institution, or
        SEBI-registered investment adviser. Nothing on this site should be taken
        as a recommendation to buy, sell, or hold any financial product. Before
        making any financial decision, you should consult a qualified Chartered
        Accountant (CA) or a SEBI-registered investment adviser who can consider
        your individual circumstances.
      </InfoSection>

      <InfoSection heading="No guarantee of accuracy">
        While we work to keep our formulas and rates correct and up to date,
        we make no warranty that results are accurate, complete, or current.
        Interest rates, tax rules, and government scheme terms change over time.
        Market-linked returns are assumptions, not guarantees — past performance
        does not indicate future results.
      </InfoSection>

      <InfoSection heading="Third-party links and ads">
        This site may contain advertisements and links to third-party websites,
        including affiliate links. We are not responsible for the content,
        products, or services of those third parties. A link or ad does not imply
        our endorsement. If you click an affiliate link and take an action, we may
        earn a commission at no extra cost to you.
      </InfoSection>

      <InfoSection heading="Limitation of liability">
        To the fullest extent permitted by law, PaisaMarg and its operators accept
        no liability for any loss or damage arising from your use of, or reliance
        on, the calculators or content on this site. You use the site at your own
        risk and are solely responsible for your financial decisions.
      </InfoSection>
    </InfoPageShell>
  );
}

// ── FOOTER (with links to the info pages) ─────────────────────────────────────
function SiteFooter({ onNavigate }) {
  const links = [
    ["about", "About"],
    ["contact", "Contact"],
    ["privacy", "Privacy Policy"],
    ["disclaimer", "Disclaimer"],
  ];
  return (
    <div style={{ borderTop:"1px solid rgba(15,23,42,0.07)", marginTop:8, padding:"24px 20px 36px", textAlign:"center" }}>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"10px 20px", justifyContent:"center", marginBottom:16 }}>
        {links.map(([id, label]) => (
          <button key={id} onClick={() => onNavigate(id)} style={{
            background:"none", border:"none", cursor:"pointer",
            color:"#64748b", fontSize:13, fontWeight:600, fontFamily:"DM Sans, sans-serif", padding:0,
          }}>{label}</button>
        ))}
      </div>
      <div style={{ color:"#94a3b8", fontSize:11, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>
        PaisaMarg provides indicative estimates for educational purposes only — not financial advice.
        <br />
        © {new Date().getFullYear()} PaisaMarg · Made in India 🇮🇳
      </div>
    </div>
  );
}

export default function PaisaMarg() {
  // Read initial route from URL path (e.g. /emi, /about) or ?calc= query
  const readInitialRoute = () => {
    try {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
      const query = new URLSearchParams(window.location.search).get("calc");
      const id = path || query || "";
      if (CALCULATORS.some(c => c.id === id)) return { activeId: id, view: null };
      if (["about", "contact", "privacy", "disclaimer"].includes(id)) return { activeId: null, view: id };
    } catch {}
    return { activeId: null, view: null };
  };
  const initial = readInitialRoute();

  const [activeId, setActiveId] = useState(initial.activeId);
  const [emailModal, setEmailModal] = useState(false);
  const [view, setView] = useState(initial.view); // null = app, or 'about'|'contact'|'privacy'|'disclaimer'
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    try {
      // Version stamp — bump this string any time you want all users to see the disclaimer again
      const VERSION = "v2";
      return localStorage.getItem("pm_disclaimer_accepted") !== VERSION;
    }
    catch { return true; }
  });

  const acceptDisclaimer = () => {
    try { localStorage.setItem("pm_disclaimer_accepted", "v2"); } catch {}
    setShowDisclaimer(false);
  };

  useEffect(() => {
    // Inject global CSS once
    if (!document.getElementById("pm-styles")) {
      const style = document.createElement("style");
      style.id = "pm-styles";
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }

    // Fonts
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(link);

    // PWA meta tags
    const metas = [
      { name:"theme-color",                      content:"#f7f9fc" },
      { name:"mobile-web-app-capable",            content:"yes" },
      { name:"apple-mobile-web-app-capable",      content:"yes" },
      { name:"apple-mobile-web-app-status-bar-style", content:"black-translucent" },
      { name:"apple-mobile-web-app-title",        content:"PaisaMarg" },
      { name:"description",                       content:"Free personal finance calculators for India — EMI, SIP, PPF, FIRE, Salary and more." },
    ];
    metas.forEach(({ name, content:val }) => {
      const m = document.createElement("meta");
      m.name = name; m.content = val;
      document.head.appendChild(m);
    });
    const ml = document.createElement("link");
    ml.rel = "manifest"; ml.href = "/manifest.json";
    document.head.appendChild(ml);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    // Title/description handled dynamically by applySEO
  }, []);

  const activeCalc = CALCULATORS.find(c => c.id === activeId);
  const CalcComponent = activeCalc?.component;

  // Push a clean URL without reloading the page
  const pushURL = (path) => {
    try { window.history.pushState({}, "", path); } catch {}
  };

  // Open a calculator
  const openCalc = (id) => {
    setView(null);
    setActiveId(id);
    setEmailModal(false);
    pushURL(`/${id}`);
    try { window.scrollTo(0, 0); } catch {}
  };

  // Navigate to an info page (about/contact/privacy/disclaimer)
  const goToPage = (pageId) => {
    setView(pageId);
    setActiveId(null);
    setEmailModal(false);
    pushURL(`/${pageId}`);
    try { window.scrollTo(0, 0); } catch {}
  };
  // Return to the calculator app home
  const goHome = () => {
    setView(null);
    setActiveId(null);
    setEmailModal(false);
    pushURL("/");
    try { window.scrollTo(0, 0); } catch {}
  };

  // Keep SEO tags in sync with the current view
  useEffect(() => {
    applySEO(view || activeId || "home");
  }, [view, activeId]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const onPop = () => {
      const r = readInitialRoute();
      setActiveId(r.activeId);
      setView(r.view);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const INFO_PAGES = { about: AboutPage, contact: ContactPage, privacy: PrivacyPage, disclaimer: DisclaimerPage };
  const InfoComponent = view ? INFO_PAGES[view] : null;

  return (
    <div style={{
      minHeight:"100vh",
      background:"#f7f9fc",
      fontFamily:"DM Sans, sans-serif",
      position:"relative",
    }}>
      {/* Animated background — fixed, fills full viewport on all screen sizes */}
      <BackgroundOrbs />

      {/* Content column — max 480px mobile, wider on desktop via CSS class */}
      <div className="pm-content" style={{ maxWidth:480, margin:"0 auto", position:"relative", zIndex:1, minHeight:"100vh" }}>

        {/* Sticky header */}
        <div style={{
          position:"sticky", top:0, zIndex:50,
          background:"rgba(248,250,252,0.9)",
          backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
          borderBottom:"1px solid rgba(15,23,42,0.06)",
          boxShadow:"0 1px 12px rgba(15,23,42,0.04)",
          padding:"14px 20px",
          display:"flex", alignItems:"center", gap:10,
        }}>
          {(activeId || view) && (
            <button onClick={goHome} style={{
              background:"rgba(241,245,249,0.85)", border:"1px solid rgba(15,23,42,0.06)", borderRadius:10,
              width:34, height:34, cursor:"pointer", color:"#64748b",
              fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            }}>←</button>
          )}
          <div onClick={goHome} style={{ display:"flex", alignItems:"center", gap:8, flex:1, cursor:"pointer" }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#00d09c,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0, boxShadow:"0 0 18px rgba(0,208,156,0.28)" }}>₹</div>
            <div>
              <div style={{ color:"#0f172a", fontSize:17, fontWeight:800, fontFamily:"Syne, sans-serif", lineHeight:1 }}>PaisaMarg</div>
              {activeId && <div style={{ color:"#334155", fontSize:10, fontFamily:"DM Sans, sans-serif" }}>{activeCalc?.label}</div>}
            </div>
          </div>
          {activeId && <div style={{ fontSize:22 }}>{activeCalc?.icon}</div>}
        </div>

        {showDisclaimer && <GlobalDisclaimer onAccept={acceptDisclaimer} />}

        {/* Screen transition — key changes on navigation, re-triggers animation */}
        <div key={view ?? activeId ?? "home"} style={{ animation:"pmSlideUp 0.28s ease-out" }}>
          {view ? (
            <InfoComponent />
          ) : !activeId ? (
            <HomeScreen onSelect={openCalc} />
          ) : (
            <div style={{ padding:"16px 20px 40px" }}>
              {emailModal && (
                <EmailModal
                  onClose={() => setEmailModal(false)}
                  subject={`My ${activeCalc?.label} — PaisaMarg`}
                  body={`Hi,\n\nHere are my ${activeCalc?.label} results from PaisaMarg.\n\nVisit https://paisamarg.in to recalculate.\n\n— PaisaMarg`}
                  source={activeId}
                />
              )}

              {/* Calculator title + email button */}
              <div style={{ marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ color:"#0f172a", fontSize:20, fontWeight:800, fontFamily:"Syne, sans-serif" }}>{activeCalc?.label}</div>
                  <div style={{ color:"#334155", fontSize:12, marginTop:3, fontFamily:"DM Sans, sans-serif" }}>{activeCalc?.tagline}</div>
                </div>
                <button onClick={() => setEmailModal(true)} style={{
                  flexShrink:0,
                  background:"rgba(241,245,249,0.85)",
                  backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                  border:"1px solid rgba(15,23,42,0.06)",
                  borderRadius:10, padding:"8px 12px", cursor:"pointer", color:"#64748b",
                  fontSize:11, fontWeight:700, fontFamily:"Syne, sans-serif",
                  display:"flex", alignItems:"center", gap:5, marginLeft:10,
                }}>📧 Email</button>
              </div>

              {/* Calculator card — frosted white */}
              <div style={{
                background:"rgba(255,255,255,0.88)",
                backdropFilter:"blur(22px)", WebkitBackdropFilter:"blur(22px)",
                borderRadius:22,
                border:"1px solid rgba(15,23,42,0.07)",
                padding:"22px 18px",
                boxShadow:"0 12px 40px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}>
                {CalcComponent && <CalcComponent />}
              </div>

              <AdSlot position="inline" />
              <AffiliateNudge calcId={activeId} />
              <DisclaimerBar calcId={activeId} />
            </div>
          )}
        </div>

        {/* Footer — always visible, links to info pages */}
        <SiteFooter onNavigate={goToPage} />
      </div>
    </div>
  );
}
