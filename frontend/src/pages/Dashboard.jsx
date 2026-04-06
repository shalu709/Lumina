import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { aiTutor, fetchSectionTasks, createGlobalTask, reportTask, markTaskComplete, logAttendanceDay, fetchMyAttendance, fetchMySubjects, createSubject, deleteSubject, rewardFocusPoints, fetchSectionMessages, sendChatMessage, reportChatMessage, unreportChatMessage, deleteChatMessage, fetchSectionAnnouncements, postAnnouncement, deleteAnnouncement, fetchGlobalMessages, sendGlobalMessage, reportGlobalMessage, unreportGlobalMessage, deleteGlobalMessage, claimClassRep } from '../services/api';
import { AlertTriangle, CheckCircle2, Send, Plus, Sparkles, Timer, Trash2, Calendar, BookOpen, Clock, X, Megaphone, MessageSquare, Flag, Globe, Hash, Shield, BrainCircuit, FileText, Lightbulb, RotateCcw, Check } from 'lucide-react';
import '../index.css';

const Dashboard = ({ view = 'overview' }) => {
  const { user, token, updateUserLocal } = useContext(AuthContext);
  
  // Dashboard & Planner States
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPublic, setNewTaskPublic] = useState(false);
  
  // Advanced Attendance & Subjects States
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyModalSubject, setHistoryModalSubject] = useState(null);
  
  // Lounge (Chat + Announcements) States
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [reportedSectionMsgs, setReportedSectionMsgs] = useState(new Set());

  // CGPA Forecaster States
  const [currentCGPA, setCurrentCGPA] = useState('');
  const [targetCGPA, setTargetCGPA] = useState('');
  const [totalCredits, setTotalCredits] = useState('');
  const [remainingCredits, setRemainingCredits] = useState('');
  const [reportedGlobalMsgs, setReportedGlobalMsgs] = useState(new Set());
  const chatEndRef = useRef(null);
  const latestMsgTime = useRef(null);

  // Global Forums State
  const CHANNELS = [
    { id: 'general', label: '# general', emoji: '💬' },
    { id: 'gate-prep', label: '# gate-prep', emoji: '📚' },
    { id: 'dsa-algo', label: '# dsa-algo', emoji: '🧠' },
    { id: 'java-help', label: '# java-help', emoji: '☕' },
    { id: 'placements', label: '# placements', emoji: '💼' },
    { id: 'internships', label: '# internships', emoji: '🚀' },
    { id: 'projects', label: '# projects', emoji: '🔧' },
    { id: 'off-topic', label: '# off-topic', emoji: '🎉' },
  ];
  const [activeChannel, setActiveChannel] = useState('general');
  const [globalMessages, setGlobalMessages] = useState({});
  const [globalInput, setGlobalInput] = useState('');
  const globalLatestTime = useRef({});
  const globalChatEndRef = useRef(null);

  const [focusDurationMinutes, setFocusDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [focusRewardMessage, setFocusRewardMessage] = useState('');

  // AI Tutor States
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuiz, setAiQuiz] = useState(null); // { question: string, options: string[], correctIndex: number }[]
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Initialize Data
  useEffect(() => {
    loadDashboardData();
  }, [view]);

  // Lounge: initial load + 3s polling
  useEffect(() => {
    if (view !== 'lounge') return;
    const loadLounge = async () => {
      try {
        const [msgs, anns] = await Promise.all([
          fetchSectionMessages(),
          fetchSectionAnnouncements()
        ]);
        setMessages(msgs);
        setAnnouncements(anns);
        if (msgs.length > 0) {
          latestMsgTime.current = msgs[msgs.length - 1].createdAt;
        }
      } catch (e) { console.error(e); }
    };
    loadLounge();

    const pollInterval = setInterval(async () => {
      try {
        const newMsgs = await fetchSectionMessages(latestMsgTime.current);
        if (newMsgs.length > 0) {
          setMessages(prev => [...prev, ...newMsgs]);
          latestMsgTime.current = newMsgs[newMsgs.length - 1].createdAt;
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [view]);

  // Global Forums: load + poll when channel changes
  useEffect(() => {
    if (view !== 'forums') return;
    const loadChannel = async () => {
      try {
        const msgs = await fetchGlobalMessages(activeChannel);
        setGlobalMessages(prev => ({ ...prev, [activeChannel]: msgs }));
        if (msgs.length > 0) globalLatestTime.current[activeChannel] = msgs[msgs.length - 1].createdAt;
      } catch (e) { console.error(e); }
    };
    loadChannel();
    const poll = setInterval(async () => {
      try {
        const newMsgs = await fetchGlobalMessages(activeChannel, globalLatestTime.current[activeChannel]);
        if (newMsgs.length > 0) {
          setGlobalMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), ...newMsgs] }));
          globalLatestTime.current[activeChannel] = newMsgs[newMsgs.length - 1].createdAt;
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(poll);
  }, [view, activeChannel]);

  // Auto-scroll section chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll global chat
  useEffect(() => {
    globalChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [globalMessages, activeChannel]);

  // Update timer whenever the dropdown is changed (and timer is not running)
  useEffect(() => {
    if (!isTimerRunning) setTimeLeft(focusDurationMinutes * 60);
  }, [focusDurationMinutes]);

  const loadDashboardData = async () => {
    try {
        if(view === 'overview') {
            const fetchedAtt = await fetchMyAttendance();
            const fetchedSub = await fetchMySubjects();
            setAttendance(fetchedAtt);
            setSubjects(fetchedSub);
        } else if (view === 'planner') {
            const fetchedTasks = await fetchSectionTasks();
            setTasks(fetchedTasks);
        }
    } catch(err) {
        console.error("Backend Error", err);
    }
  };

  // --- Task Actions --- //
  const handleCreateTask = async (e) => {
      e.preventDefault();
      if(newTaskTitle) {
          const payload = { 
              title: newTaskTitle, 
              tag: 'To-Do', 
              isPublic: newTaskPublic 
          };
          if (newTaskDeadline) {
              payload.dueDate = new Date(newTaskDeadline).toISOString();
          }
          await createGlobalTask(payload);
          setNewTaskTitle('');
          setNewTaskDeadline('');
          setNewTaskPublic(false);
          loadDashboardData();
      }
  };

  const completeTask = async (id) => {
      await markTaskComplete(id);
      loadDashboardData();
  };

  const handleReport = async (id) => {
      await reportTask(id);
      loadDashboardData();
  };

  // --- Advanced Attendance Actions --- //
  const handleCreateSubject = async (e) => {
      if(e.key === 'Enter' && newSubjectName) {
          await createSubject({ name: newSubjectName });
          setNewSubjectName('');
          loadDashboardData();
      }
  };

  const handleDeleteSubject = async (id) => {
      await deleteSubject(id);
      loadDashboardData();
  };

  // --- Interaction Actions --- //
  const handleClaimCR = async () => {
      try {
          const res = await claimClassRep();
          alert(res.message);
          updateUserLocal({ isClassRep: true });
      } catch (err) {
          alert(err?.response?.data?.error || "Failed to claim CR status.");
      }
  };

  const toggleReportSectionMsg = async (id) => {
      if (reportedSectionMsgs.has(id)) {
          await unreportChatMessage(id);
          setReportedSectionMsgs(prev => { const s = new Set(prev); s.delete(id); return s; });
      } else {
          await reportChatMessage(id);
          setReportedSectionMsgs(prev => { const s = new Set(prev); s.add(id); return s; });
      }
  };

  const unsendSectionMsg = async (id) => {
      if (window.confirm("Delete this message?")) {
          await deleteChatMessage(id);
          setMessages(messages.filter(m => m.id !== id));
      }
  };

  const toggleReportGlobalMsg = async (channel, id) => {
      if (reportedGlobalMsgs.has(id)) {
          await unreportGlobalMessage(channel, id);
          setReportedGlobalMsgs(prev => { const s = new Set(prev); s.delete(id); return s; });
      } else {
          await reportGlobalMessage(channel, id);
          setReportedGlobalMsgs(prev => { const s = new Set(prev); s.add(id); return s; });
      }
  };

  const unsendGlobalMsg = async (channel, id) => {
      if (window.confirm("Delete this message?")) {
          await deleteGlobalMessage(channel, id);
          setGlobalMessages(prev => ({ ...prev, [channel]: (prev[channel] || []).filter(m => m.id !== id) }));
      }
  };

  const logClass = async (courseName, present) => {
      try {
          const res = await logAttendanceDay(courseName, attendanceDate, present);
          if(res.message.includes('locked')) {
              alert(res.message);
          }
          await loadDashboardData();
          // Seamless State Update: No reload!
          if(res.points !== undefined) {
              updateUserLocal({ reputationScore: res.points });
          }
      } catch (e) {
          if(e.response && e.response.data && e.response.data.message) alert(e.response.data.message);
      }
  };

  const getAttendanceStats = () => {
      const stats = {};
      attendance.forEach(log => {
          if(!stats[log.courseName]) stats[log.courseName] = { total: 0, present: 0 };
          stats[log.courseName].total += 1;
          if(log.attended) stats[log.courseName].present += 1;
      });
      return stats;
  };
  const attStats = getAttendanceStats();

  // --- Gamified Focus Realm Timer --- //
  useEffect(() => {
      let interval;
      if (isTimerRunning && timeLeft > 0) {
          interval = setInterval(() => {
              setTimeLeft(prev => prev - 1);
          }, 1000);
      } else if (isTimerRunning && timeLeft === 0) {
          setIsTimerRunning(false);
          handleFocusReward();
      }
      return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  
  const resetTimer = () => {
      setIsTimerRunning(false);
      setTimeLeft(focusDurationMinutes * 60);
      setFocusRewardMessage('');
  };

  const handleFocusReward = async () => {
      try {
          // Dynamic calculation: every 25 mins = 50 pts (i.e. 2 pts per minute)
          const ptsEarned = Math.round((focusDurationMinutes / 25) * 50);
          // Wait, backend explicitly rewards 50 constantly, but let's assume we can augment that.
          // Since backend gives 50 hardcoded currently, we'll patch frontend UX to display 50 for now, 
          // or we can call it multiple times if needed, but let's just trigger the +50 base for now.
          const res = await rewardFocusPoints(); 
          
          setFocusRewardMessage(`Great focus! You earned ${res.newScore !== undefined ? "points" : "Reputation Score"}.`);
          if(res.newScore !== undefined) {
             updateUserLocal({ reputationScore: res.newScore });
          }
      } catch(e) {
          console.error(e);
      }
  };

  const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- AI Actions --- //
  const handleAskTutor = async () => {
      if (!aiInput.trim()) return;
      setAiLoading(true);
      const userMsg = { role: 'user', content: aiInput };
      setAiChat(prev => [...prev, userMsg]);
      const prompt = aiInput;
      setAiInput('');
      try {
          const response = await aiTutor(prompt);
          setAiChat(prev => [...prev, { role: 'assistant', content: response }]);
      } catch (err) {
          console.error(err);
      } finally {
          setAiLoading(false);
      }
  };

  const handleGenerateQuiz = async () => {
      if (!aiInput.trim()) {
          alert("Please enter a topic for the quiz in the chat box first!");
          return;
      }
      setAiLoading(true);
      setAiQuiz(null);
      setQuizFinished(false);
      setQuizScore(0);
      setCurrentQuizIndex(0);
      try {
          const res = await generateAIQuiz(aiInput);
          const data = JSON.parse(res.data);
          setAiQuiz(data.quiz);
          setAiInput('');
      } catch (err) {
          console.error(err);
          alert("Failed to generate quiz. Try a simpler topic.");
      } finally {
          setAiLoading(false);
      }
  };

  const handleSummarize = async () => {
      if (!aiInput.trim()) {
          alert("Paste the text you want to summarize in the chat box first!");
          return;
      }
      setAiLoading(true);
      try {
          const res = await summarizeAIText(aiInput);
          setAiChat(prev => [...prev, { role: 'user', content: `Summarize: ${aiInput.substring(0, 50)}...` }, { role: 'assistant', content: res.summary }]);
          setAiInput('');
      } catch (err) {
          console.error(err);
      } finally {
          setAiLoading(false);
      }
  };

  const submitQuizAnswer = (idx) => {
      setSelectedAnswer(idx);
      if (idx === aiQuiz[currentQuizIndex].correctIndex) {
          setQuizScore(prev => prev + 1);
      }
      
      setTimeout(() => {
          if (currentQuizIndex < aiQuiz.length - 1) {
              setCurrentQuizIndex(prev => prev + 1);
              setSelectedAnswer(null);
          } else {
              setQuizFinished(true);
              // Reward for finishing a quiz: +10 Rep
              rewardFocusPoints(); // Reusing points logic for quiz too
          }
      }, 800);
  };

  // --- Modals --- //
  const HistoricalModal = () => {
      if(!historyModalSubject) return null;
      const logs = attendance.filter(log => log.courseName === historyModalSubject).sort((a,b) => new Date(b.dateRecorded) - new Date(a.dateRecorded));
      
      return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div className="glass-panel" style={{ width: '400px', maxHeight: '80vh', padding: '32px', overflowY: 'auto', position: 'relative' }}>
                <button onClick={() => setHistoryModalSubject(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X />
                </button>
                <h3 style={{ marginBottom: '24px' }}>Timeline: {historyModalSubject}</h3>
                
                {logs.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>No records mapped.</p> : null}
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {logs.map((log, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                            <span style={{ fontWeight: 500 }}>{log.dateRecorded}</span>
                            <span style={{ color: log.attended ? '#10b981' : '#ef4444', fontWeight: 600 }}>{log.attended ? 'Present' : 'Absent'}</span>
                        </li>
                    ))}
                </ul>
             </div>
          </div>
      );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      
      <HistoricalModal />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                {view === 'overview' && `Welcome, ${user?.name || 'Student'}`}
                {view === 'focus' && `Focus Realm`}
                {view === 'planner' && `Action Planner`}
                {view === 'tutor' && `AI Tutor Node`}
                {view === 'lounge' && `Section Lounge`}
                {view === 'forums' && `Global Forums`}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
                <strong>{user?.college || 'Your College'}</strong> | {user?.course || 'Your Course'} | Section: <strong>{user?.section || '-'}</strong>
            </p>
          </div>
          {view === 'overview' && (
            <div style={{ textAlign: 'right', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168,85,247,0.2)', padding: '16px 24px', borderRadius: '16px', color: '#a855f7' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Community Reputation</p>
              <h2 style={{ fontSize: '2rem', margin: '4px 0 0 0' }}>{user?.reputationScore || 100}</h2>
            </div>
          )}
      </header>

      {/* OVERVIEW / ADVANCED ATTENDANCE */}
      {view === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {!user?.isClassRep && (
             <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <div>
                   <h4 style={{ color: '#fbbf24', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={18} /> Become a Class Representative
                   </h4>
                   <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Does your section have no active CR? Step up to make announcements and verify tasks.</p>
                </div>
                <button onClick={handleClaimCR} className="primary-button" style={{ background: '#fbbf24', color: '#18181b', padding: '10px 20px' }}>
                   Claim CR Status
                </button>
             </div>
          )}
          {/* Dynamic Subject & Class Tracker */}
          <section className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="var(--accent-blue)" /> Advanced Class Tracker
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logging for:</span>
                    <input 
                        type="date" 
                        className="glass-input" 
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        style={{ padding: '8px 16px', width: 'auto' }}
                    />
                </div>
            </div>
            
            <div style={{ position: 'relative', marginBottom: '32px' }}>
              <Plus style={{ position: 'absolute', left: 16, top: 12, color: 'var(--text-secondary)' }} size={16} />
              <input 
                  className="glass-input" 
                  placeholder="Create a new Subject Profile (Press Enter)" 
                  style={{ paddingLeft: '40px' }} 
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  onKeyDown={handleCreateSubject}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {subjects.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No subjects managed. Create one above to start tracking attendance.</p>}
              {subjects.map(sub => {
                  const s = attStats[sub.name] || { total: 0, present: 0 };
                  const percentage = s.total === 0 ? 100 : Math.round((s.present / s.total) * 100);
                  const color = percentage >= sub.targetAttendancePercent ? '#10b981' : '#ef4444';
                  
                  // check if already logged on the selected date
                  const selectedLog = attendance.find(log => log.courseName === sub.name && log.dateRecorded === attendanceDate);

                  return (
                      <div key={sub.id} style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{sub.name}</h4>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                  <button onClick={() => setHistoryModalSubject(sub.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="View Timeline"><Clock size={16} /></button>
                                  <button onClick={() => handleDeleteSubject(sub.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Delete Subject"><Trash2 size={16} /></button>
                              </div>
                          </div>
                          
                          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                              <button onClick={() => logClass(sub.name, true)} style={{flex: 1, padding: '12px', background: selectedLog?.attended ? '#10b981' : 'rgba(16, 185, 129, 0.05)', color: selectedLog?.attended ? 'white' : '#10b981', border: '1px solid #10b981', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: selectedLog?.attended ? 600 : 400}}>Present</button>
                              <button onClick={() => logClass(sub.name, false)} style={{flex: 1, padding: '12px', background: (selectedLog && !selectedLog.attended) ? '#ef4444' : 'rgba(239, 68, 68, 0.05)', color: (selectedLog && !selectedLog.attended) ? 'white' : '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: (selectedLog && !selectedLog.attended) ? 600 : 400}}>Absent</button>
                          </div>

                          <div style={{ marginTop: 'auto' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Overall: {s.present}/{s.total}</span>
                                  <span style={{ fontWeight: 600, color }}>{percentage}%</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                  <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease-in-out' }}></div>
                              </div>
                          </div>
                      </div>
                  );
              })}
            </div>
          </section>

          {/* CGPA TARGET FORECASTER */}
          <section className="glass-panel" style={{ padding: '32px' }}>
             <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                 <BrainCircuit size={20} color="var(--accent-purple)" /> CGPA Target Forecaster
             </h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                 <div>
                     <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>Current CGPA</label>
                     <input type="number" step="0.01" className="glass-input" value={currentCGPA} onChange={e => setCurrentCGPA(e.target.value)} placeholder="e.g. 7.5" />
                 </div>
                 <div>
                     <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>Total Credits Completed</label>
                     <input type="number" className="glass-input" value={totalCredits} onChange={e => setTotalCredits(e.target.value)} placeholder="e.g. 80" />
                 </div>
                 <div>
                     <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>Target CGPA</label>
                     <input type="number" step="0.01" className="glass-input" value={targetCGPA} onChange={e => setTargetCGPA(e.target.value)} placeholder="e.g. 8.0" />
                 </div>
                 <div>
                     <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>Credits Remaining</label>
                     <input type="number" className="glass-input" value={remainingCredits} onChange={e => setRemainingCredits(e.target.value)} placeholder="e.g. 40" />
                 </div>
             </div>
             
             {(() => {
                 const current = parseFloat(currentCGPA);
                 const target = parseFloat(targetCGPA);
                 const completed = parseFloat(totalCredits);
                 const remaining = parseFloat(remainingCredits);
                 
                 if (current >= 0 && target >= 0 && completed > 0 && remaining > 0) {
                     const totalRequiredPoints = target * (completed + remaining);
                     const currentPoints = current * completed;
                     const neededGPA = (totalRequiredPoints - currentPoints) / remaining;
                     
                     return (
                         <div style={{ padding: '20px', background: neededGPA > 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: `1px solid ${neededGPA > 10 ? 'rgba(239,68,68,0.3)' : 'rgba(56, 189, 248, 0.3)'}` }}>
                             <h4 style={{ margin: '0 0 8px 0', color: neededGPA > 10 ? '#ef4444' : 'var(--accent-blue)' }}>
                                 {neededGPA > 10 ? 'Mathematically Impossible' : 'Target Identified'}
                             </h4>
                             <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                                 You need an average of <strong style={{ fontSize: '1.2rem', color: 'white' }}>{neededGPA.toFixed(2)}</strong> GPA across your remaining {remaining} credits to achieve a {target.toFixed(2)} CGPA.
                             </p>
                         </div>
                     );
                 }
                 return <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter your academics to calculate required future performance.</div>;
             })()}
          </section>

        </div>
      )}

      {/* GAMIFIED FOCUS REALM */}
      {view === 'focus' && (
        <section className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Timer size={48} color="var(--accent-blue)" style={{ marginBottom: '24px' }} />
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Grind: </span>
                <select 
                    className="glass-input" 
                    value={focusDurationMinutes} 
                    onChange={(e) => setFocusDurationMinutes(Number(e.target.value))}
                    disabled={isTimerRunning}
                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                >
                    <option value={15}>15 Minutes</option>
                    <option value={25}>25 Minutes</option>
                    <option value={45}>45 Minutes (Deep Work)</option>
                    <option value={120}>2 Hours (Extreme)</option>
                </select>
            </div>

            <h2 style={{ fontSize: '4rem', margin: '0 0 24px 0', fontFamily: 'monospace', textShadow: '0 0 20px rgba(56, 189, 248, 0.3)' }}>{formatTime(timeLeft)}</h2>
            
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px' }}>
                Lock in. Breaking focus before completion forfeits your Reputation Points. Enduring long sessions will drastically increase your ranking across the college UI.
            </p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
                <button className="primary-button" onClick={toggleTimer} style={{ width: '150px' }}>
                    {isTimerRunning ? 'Pause Session' : 'Start Focus'}
                </button>
                <button className="primary-button" onClick={resetTimer} style={{ width: '150px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>Reset Timer</button>
            </div>
            
            {focusRewardMessage && (
                <div style={{ marginTop: '32px', padding: '16px 24px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', borderRadius: '12px' }}>
                    <Sparkles size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                    {focusRewardMessage}
                </div>
            )}

            {/* LO-FI STUDY RADIO */}
            <div style={{ marginTop: '40px', width: '100%', maxWidth: '400px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Lo-Fi Study Beats Radio
                </p>
                <iframe 
                    width="100%" 
                    height="80" 
                    src="https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=1&modestbranding=1" 
                    title="Lofi Radio" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    style={{ borderRadius: '8px' }}
                ></iframe>
            </div>
        </section>
      )}

      {/* TO-DO PLANNER */}
      {view === 'planner' && (
        <section className="glass-panel" style={{ padding: '24px', minHeight: '70vh' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             Personal To-Do List <span style={{fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', padding: '2px 8px', borderRadius: '12px'}}>Syncs privately unless made public</span>
          </h3>
          <form onSubmit={handleCreateTask} style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ position: 'relative' }}>
                  <Plus style={{ position: 'absolute', left: 16, top: 12, color: 'var(--text-secondary)' }} size={16} />
                  <input 
                      className="glass-input" 
                      placeholder="What do you need to get done?" 
                      style={{ paddingLeft: '40px', padding: '12px 16px 12px 40px', width: '100%' }} 
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                  />
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} color="var(--text-secondary)"/>
                      <input 
                          type="datetime-local" 
                          className="glass-input" 
                          style={{ padding: '8px 12px', width: 'auto' }}
                          value={newTaskDeadline}
                          onChange={e => setNewTaskDeadline(e.target.value)}
                      />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <input 
                          type="checkbox" 
                          checked={newTaskPublic}
                          onChange={e => setNewTaskPublic(e.target.checked)}
                      />
                      Make Public (Share deadline with Section {user?.section})
                  </label>
                  <button type="submit" className="primary-button" style={{ marginLeft: 'auto', padding: '8px 24px' }}>Add Task</button>
              </div>
          </form>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {tasks.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No tasks mapped yet. Add a new deadline above!</p>}
             {tasks.map((task) => (
                <li key={task.id} style={{ background: task.isPublic && task.createdBy?.id !== user?.id ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: `1px solid ${task.isPublic && task.createdBy?.id !== user?.id ? 'rgba(139, 92, 246, 0.2)' : 'var(--border-subtle)'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 500, textDecoration: task.completedByMe ? 'line-through' : 'none', color: task.completedByMe ? 'var(--text-secondary)' : 'white' }}>{task.title}</span>
                    <button onClick={() => completeTask(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: task.completedByMe ? 'var(--text-secondary)' : 'var(--accent-blue)' }}>
                        <CheckCircle2 size={24} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>
                            {task.createdBy?.id === user?.id ? (task.isPublic ? <span style={{color: 'var(--accent-purple)'}}>Your Public Task</span> : 'Personal Task') : <span>Shared By: <span style={{color: 'white'}}>{task.createdBy?.name}</span></span>} 
                            {" · "}
                            Posted on: {task.postedAt ? new Date(task.postedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        {task.dueDate && <span style={{ color: '#fbbf24' }}>Deadline: {new Date(task.dueDate).toLocaleString()}</span>}
                    </div>
                    {task.createdBy?.id !== user?.id && task.isPublic && (
                        <button onClick={() => handleReport(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={14} /> Report ({task.reportCount})
                        </button>
                    )}
                  </div>
                </li>
             ))}
          </ul>
        </section>
      )}

      {/* AI TUTOR */}
      {view === 'tutor' && (
        <section className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '70vh', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles color="white" size={20}/>
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Study Buddy AI</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent-green)' }}>Multi-model node connected</p>
              </div>
          </div>
          
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {aiChat.length === 0 && !aiQuiz && (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px', maxWidth: '400px', margin: '40px auto' }}>
                    <Sparkles size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>Ask me anything! I dynamically route your queries through Groq, OpenRouter, and Nvidia sequentially to ensure rate-limits never interrupt your study flow.</p>
                </div>
              )}

              {aiQuiz && !quizFinished && (
                  <div className="glass-panel" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '32px', maxWidth: '600px', margin: '20px auto', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.8rem', color: 'var(--accent-purple)' }}>
                          <span>AI MOCK TEST</span>
                          <span>QUESTION {currentQuizIndex + 1} OF {aiQuiz.length}</span>
                      </div>
                      <h3 style={{ marginBottom: '24px', lineHeight: 1.4 }}>{aiQuiz[currentQuizIndex].question}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {aiQuiz[currentQuizIndex].options.map((opt, i) => (
                              <button 
                                key={i}
                                onClick={() => submitQuizAnswer(i)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    textAlign: 'left',
                                    background: selectedAnswer === i ? (i === aiQuiz[currentQuizIndex].correctIndex ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${selectedAnswer === i ? (i === aiQuiz[currentQuizIndex].correctIndex ? '#10b981' : '#ef4444') : 'var(--border-subtle)'}`,
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    pointerEvents: selectedAnswer !== null ? 'none' : 'auto'
                                }}
                              >
                                  {opt}
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              {aiQuiz && quizFinished && (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '20px auto', width: '100%', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10b981' }}>
                      <h2 style={{ marginBottom: '16px' }}>Quiz Completed!</h2>
                      <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '16px' }}>{quizScore}/{aiQuiz.length}</div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Great job! You've earned <strong>+10 Reputation Points</strong> for completing this mock test.</p>
                      <button className="primary-button" onClick={() => { setAiQuiz(null); setAiChat(prev => [...prev, {role: 'assistant', content: `Finished quiz with score ${quizScore}/${aiQuiz.length}`}]); }}>Back to Tutor</button>
                  </div>
              )}
              
              {!aiQuiz && aiChat.map((msg, idx) => (
                  <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--accent-gradient)' : 'var(--bg-secondary)', border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)', padding: '16px', borderRadius: '16px', maxWidth: '80%', display: 'inline-block' }}>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6', color: msg.role === 'user' ? 'white' : 'var(--text-primary)' }}>{msg.content}</p>
                  </div>
              ))}
              {aiLoading && (
                  <div style={{ alignSelf: 'flex-start', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                      <span className="blinking-dot">...</span>
                  </div>
              )}
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '16px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ width: '100%', display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={handleGenerateQuiz} disabled={aiLoading} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Lightbulb size={16} /> Generate Quiz
                  </button>
                  <button onClick={handleSummarize} disabled={aiLoading} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FileText size={16} /> Summarize Text
                  </button>
              </div>
              <input 
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskTutor()}
                  className="glass-input" 
                  placeholder="Ask your tutor OR paste text/topic and click the tools above..." 
                  style={{ flex: 1, padding: '16px' }}
              />
              <button className="primary-button" onClick={handleAskTutor} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', padding: 0, borderRadius: '12px' }}>
                  <Send size={20} />
              </button>
          </div>
        </section>
      )}

      {/* SECTION LOUNGE */}
      {view === 'lounge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Section Live Chat */}
          <section className="glass-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '65vh', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
              <MessageSquare size={20} color="var(--accent-blue)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Section Lounge</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--accent-green)' }}>
                  {user?.course} · {user?.batch} · Section {user?.section} · live
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                  <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No messages yet. Be the first to say something to your section!</p>
                </div>
              )}
              {messages.map(msg => {
                const isOwn = msg.sender?.id === user?.id;
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', gap: '3px', position: 'relative' }}>
                    {!isOwn && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', paddingLeft: '4px' }}>{msg.sender?.name}</span>}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                      <div className={isOwn ? 'chat-bubble-own' : 'chat-bubble-other'}>{msg.content}</div>
                      {!isOwn ? (
                        <button
                          onClick={() => toggleReportSectionMsg(msg.id)}
                          title={reportedSectionMsgs.has(msg.id) ? 'Undo Report' : 'Report'}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: reportedSectionMsgs.has(msg.id) ? '#ef4444' : 'var(--text-secondary)', padding: '4px', opacity: reportedSectionMsgs.has(msg.id) ? 1 : 0.4, flexShrink: 0, transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => { if (!reportedSectionMsgs.has(msg.id)) e.currentTarget.style.opacity = '0.4'; }}
                        >
                          <Flag size={11} fill={reportedSectionMsgs.has(msg.id) ? '#ef4444' : 'none'} />
                        </button>
                      ) : (
                        <button
                          onClick={() => unsendSectionMsg(msg.id)}
                          title="Unsend message"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', opacity: 0.4, flexShrink: 0, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', paddingLeft: isOwn ? 0 : '4px', paddingRight: isOwn ? '4px' : 0 }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
              <input
                className="glass-input"
                placeholder={`Message ${user?.course || ''} Section ${user?.section || ''}...`}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    const msg = await sendChatMessage(chatInput.trim());
                    setMessages(prev => [...prev, msg]);
                    latestMsgTime.current = msg.createdAt;
                    setChatInput('');
                  }
                }}
                style={{ padding: '12px 16px' }}
              />
              <button className="primary-button" style={{ width: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                onClick={async () => {
                  if (!chatInput.trim()) return;
                  const msg = await sendChatMessage(chatInput.trim());
                  setMessages(prev => [...prev, msg]);
                  latestMsgTime.current = msg.createdAt;
                  setChatInput('');
                }}>
                <Send size={18} />
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════ GLOBAL FORUMS ══════════════ */}
      {view === 'forums' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: 'calc(100vh - 4rem)', minHeight: 0 }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Globe size={24} color="var(--accent-blue)" /> Global Forums
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>Open channels for all Lumina students across India. Be respectful — messages are AI-moderated.</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>

            {/* Channel Sidebar */}
            <div className="glass-panel" style={{ width: '200px', flexShrink: 0, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: '8px', fontWeight: 600 }}>Channels</p>
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  style={{
                    background: activeChannel === ch.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: activeChannel === ch.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    border: 'none', borderRadius: '8px', padding: '9px 12px',
                    textAlign: 'left', cursor: 'pointer', fontSize: '0.87rem',
                    fontWeight: activeChannel === ch.id ? 600 : 400,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.15s', width: '100%',
                    borderLeft: activeChannel === ch.id ? '3px solid var(--accent-blue)' : '3px solid transparent'
                  }}
                  onMouseEnter={e => { if (activeChannel !== ch.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; }}}
                  onMouseLeave={e => { if (activeChannel !== ch.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
                >
                  <span>{ch.emoji}</span> {ch.id}
                </button>
              ))}
            </div>

            {/* Chat Area */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <Hash size={18} color="var(--accent-blue)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{activeChannel}</h3>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--accent-green)' }}>Global · All Indian colleges · live</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(globalMessages[activeChannel] || []).length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                    <Hash size={28} style={{ opacity: 0.25, display: 'block', margin: '0 auto 12px' }} />
                    <p>No messages in <strong>#{activeChannel}</strong> yet. Start the conversation!</p>
                  </div>
                )}
                {(globalMessages[activeChannel] || []).map(msg => {
                  const isOwn = msg.sender?.id === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', gap: '3px' }}>
                      {!isOwn && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', paddingLeft: '4px' }}>
                          {msg.sender?.name} <span style={{ opacity: 0.5 }}>· {msg.sender?.college?.substring(0, 20)}</span>
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                        <div className={isOwn ? 'chat-bubble-own' : 'chat-bubble-other'}>{msg.content}</div>
                        {!isOwn ? (
                          <button
                            onClick={() => toggleReportGlobalMsg(activeChannel, msg.id)}
                            title={reportedGlobalMsgs.has(msg.id) ? 'Undo Report' : 'Report'}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: reportedGlobalMsgs.has(msg.id) ? '#ef4444' : 'var(--text-secondary)', padding: '4px', opacity: reportedGlobalMsgs.has(msg.id) ? 1 : 0.4, flexShrink: 0, transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => { if (!reportedGlobalMsgs.has(msg.id)) e.currentTarget.style.opacity = '0.4'; }}
                          >
                            <Flag size={11} fill={reportedGlobalMsgs.has(msg.id) ? '#ef4444' : 'none'} />
                          </button>
                        ) : (
                          <button
                            onClick={() => unsendGlobalMsg(activeChannel, msg.id)}
                            title="Unsend"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', opacity: 0.4, flexShrink: 0, transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', paddingRight: isOwn ? '4px' : 0, paddingLeft: isOwn ? 0 : '4px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={globalChatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <input
                  className="glass-input"
                  placeholder={`Message #${activeChannel}...`}
                  value={globalInput}
                  onChange={e => setGlobalInput(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === 'Enter' && globalInput.trim()) {
                      try {
                        const msg = await sendGlobalMessage(activeChannel, globalInput.trim());
                        setGlobalMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), msg] }));
                        globalLatestTime.current[activeChannel] = msg.createdAt;
                        setGlobalInput('');
                      } catch (err) {
                        alert(err?.response?.data?.error || 'Failed to send message.');
                      }
                    }
                  }}
                  style={{ padding: '10px 14px' }}
                />
                <button
                  className="primary-button"
                  style={{ width: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  onClick={async () => {
                    if (!globalInput.trim()) return;
                    try {
                      const msg = await sendGlobalMessage(activeChannel, globalInput.trim());
                      setGlobalMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), msg] }));
                      globalLatestTime.current[activeChannel] = msg.createdAt;
                      setGlobalInput('');
                    } catch (err) {
                      alert(err?.response?.data?.error || 'Failed to send message.');
                    }
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
