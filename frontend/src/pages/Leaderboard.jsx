import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchGlobalLeaderboard, fetchSectionLeaderboard } from '../services/api';
import { Trophy, Globe, Users, Flame } from 'lucide-react';
import '../index.css';

const Leaderboard = () => {
    const { user } = useContext(AuthContext);
    const [globalScores, setGlobalScores] = useState([]);
    const [sectionScores, setSectionScores] = useState([]);
    const [activeTab, setActiveTab] = useState('global');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboards = async () => {
            setLoading(true);
            try {
                const [globalData, sectionData] = await Promise.all([
                    fetchGlobalLeaderboard(),
                    fetchSectionLeaderboard()
                ]);
                setGlobalScores(globalData);
                setSectionScores(sectionData);
            } catch (err) {
                console.error("Failed to fetch leaderboards", err);
            }
            setLoading(false);
        };
        loadLeaderboards();
    }, []);

    const renderList = (data, isGlobal) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No data yet. Start tracking focus sessions to earn points!</p>}
            {data.map((player, index) => {
                const isMe = player.id === user?.id;
                let rankColor = 'var(--text-secondary)';
                if (index === 0) rankColor = '#fbbf24'; // Gold
                if (index === 1) rankColor = '#94a3b8'; // Silver
                if (index === 2) rankColor = '#b45309'; // Bronze

                return (
                    <div 
                        key={player.id} 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            background: isMe ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-secondary)', 
                            border: `1px solid ${isMe ? 'rgba(56, 189, 248, 0.4)' : 'var(--border-subtle)'}`,
                            padding: '16px 24px', 
                            borderRadius: '12px',
                            transition: 'transform 0.2s',
                            boxShadow: isMe ? '0 0 15px rgba(56, 189, 248, 0.1)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <h2 style={{ margin: 0, width: '30px', color: rankColor }}>#{index + 1}</h2>
                            <div>
                                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: isMe ? 'var(--accent-blue)' : 'white' }}>
                                    {player.name} {isMe && <span style={{ fontSize: '0.75rem', background: 'var(--accent-blue)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>YOU</span>}
                                </h4>
                                {isGlobal && <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{player.college}</p>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-green)' }}>
                            <Flame size={20} color="var(--accent-green)" />
                            {player.score} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>pts</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', marginBottom: '16px' }}>
                    <Trophy size={32} />
                </div>
                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Hall of Fame</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Rank high by taking quizzes, holding focus sessions, and contributing to the Vault.</p>
            </header>

            <div className="glass-panel" style={{ padding: '32px', minHeight: '60vh' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                    <button 
                        onClick={() => setActiveTab('global')}
                        style={{ flex: 1, padding: '12px', background: activeTab === 'global' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'global' ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                    >
                        <Globe size={18} /> Global Top 10
                    </button>
                    <button 
                        onClick={() => setActiveTab('section')}
                        style={{ flex: 1, padding: '12px', background: activeTab === 'section' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'section' ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                    >
                        <Users size={18} /> Section {user?.section}
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                        <div className="blinking-dot" style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent-blue)', borderRadius: '50%', marginBottom: 16 }}></div>
                        <p>Crunching the numbers...</p>
                    </div>
                ) : (
                    activeTab === 'global' ? renderList(globalScores, true) : renderList(sectionScores, false)
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
