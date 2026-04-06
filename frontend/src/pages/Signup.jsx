import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Mail, Lock, Building, Layers, Search, IdCard, BookOpen, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const Signup = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        college: '', collegeId: '', course: '', batch: '', section: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // College Autocomplete state — queries OUR backend which proxies GitHub
    const [collegeQuery, setCollegeQuery] = useState('');
    const [collegeSuggestions, setCollegeSuggestions] = useState([]);
    const [collegeDropOpen, setCollegeDropOpen] = useState(false);
    const [collegesLoading, setCollegesLoading] = useState(false);
    const dropdownRef = useRef(null);
    const searchTimeout = useRef(null);

    // Debounced search — fires 300ms after user stops typing
    useEffect(() => {
        if (collegeQuery.length < 2) {
            setCollegeSuggestions([]);
            setCollegeDropOpen(false);
            return;
        }
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setCollegesLoading(true);
            try {
                const res = await axios.get(`${API_URL}/colleges/search`, {
                    params: { q: collegeQuery }
                });
                setCollegeSuggestions(res.data || []);
                setCollegeDropOpen((res.data || []).length > 0);
            } catch (e) {
                console.warn('College search failed:', e.message);
                setCollegeSuggestions([]);
            }
            setCollegesLoading(false);
        }, 300);
        return () => clearTimeout(searchTimeout.current);
    }, [collegeQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setCollegeDropOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const selectCollege = (entry) => {
        const name = entry.college;
        setFormData({ ...formData, college: name });
        setCollegeQuery(name);
        setCollegeDropOpen(false);
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please complete all fields before continuing.');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!formData.college) {
            setError('Please select a verified college from the dropdown.');
            return;
        }
        if (!formData.collegeId) {
            setError('College Roll Number / ID is required for identity verification.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/register`, formData);
            login(res.data.token, res.data.user);
            navigate('/overview');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        }
        setLoading(false);
    };

    const fieldStyle = { position: 'relative' };
    const iconStyle = { position: 'absolute', left: 16, top: 14, color: 'var(--text-secondary)', pointerEvents: 'none' };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="glass-panel" style={{ width: '560px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-gradient)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(56, 189, 248, 0.3)' }}>
                        <UserPlus color="white" size={26} />
                    </div>
                    <h2 style={{ fontSize: '2.2rem', margin: '0 0 8px' }}>Join Your Campus</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Your verified academic OS profile.
                    </p>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '3px', background: 'var(--accent-gradient)', borderRadius: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: step === 1 ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 600 }}>1 · Account</span>
                    <div style={{ flex: 1, height: '3px', background: step === 2 ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: 'background 0.4s' }} />
                    <span style={{ fontSize: '0.85rem', color: step === 2 ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 600 }}>2 · Academic ID</span>
                    <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239,68,68,0.3)', padding: '14px 16px', borderRadius: '10px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                {/* ---- STEP 1: Basic Account ---- */}
                {step === 1 && (
                    <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={fieldStyle}>
                            <UserPlus style={iconStyle} size={18} />
                            <input name="name" type="text" placeholder="Full Name" className="glass-input"
                                style={{ paddingLeft: '48px' }} onChange={handleChange} value={formData.name} required />
                        </div>
                        <div style={fieldStyle}>
                            <Mail style={iconStyle} size={18} />
                            <input name="email" type="email" placeholder="Email (institutional preferred)" className="glass-input"
                                style={{ paddingLeft: '48px' }} onChange={handleChange} value={formData.email} required />
                        </div>
                        <div style={fieldStyle}>
                            <Lock style={iconStyle} size={18} />
                            <input name="password" type="password" placeholder="Create Password" className="glass-input"
                                style={{ paddingLeft: '48px' }} onChange={handleChange} value={formData.password} required />
                        </div>
                        <button type="submit" className="primary-button" style={{ marginTop: '8px' }}>
                            Continue →
                        </button>
                    </form>
                )}

                {/* ---- STEP 2: Academic Identity ---- */}
                {step === 2 && (
                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* College Autocomplete */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                                <Building size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                College / University — select from verified list
                            </label>
                            <div ref={dropdownRef} style={{ position: 'relative' }}>
                                <Search style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-secondary)', pointerEvents: 'none' }} size={18} />
                                <input
                                    type="text"
                                    placeholder={collegesLoading ? 'Searching...' : 'Type college name (e.g. IIT, BITS, DTU...)'}
                                    className="glass-input"
                                    style={{ paddingLeft: '48px', paddingRight: '36px' }}
                                    value={collegeQuery}
                                    onChange={(e) => {
                                        setCollegeQuery(e.target.value);
                                        setFormData({ ...formData, college: '' }); // clear until picked
                                    }}
                                    autoComplete="off"
                                />
                                {collegeSuggestions.length > 0 && (
                                    <ChevronDown style={{ position: 'absolute', right: 16, top: 14, color: 'var(--text-secondary)', pointerEvents: 'none' }} size={18} />
                                )}
                                {collegeDropOpen && (
                                    <ul style={{
                                        position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100,
                                        background: 'rgba(15, 15, 35, 0.98)', border: '1px solid var(--border-subtle)',
                                        borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                                        maxHeight: '220px', overflowY: 'auto', padding: '8px', margin: 0, listStyle: 'none'
                                    }}>
                                        {collegeSuggestions.map((entry, idx) => (
                                            <li key={idx}
                                                onClick={() => selectCollege(entry)}
                                                style={{
                                                    padding: '14px 16px', borderRadius: '8px', cursor: 'pointer',
                                                    fontSize: '0.9rem', color: 'var(--text-primary)',
                                                    transition: 'background 0.15s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ fontWeight: 500 }}>{entry.college}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                    {entry.state}{entry.district ? ` · ${entry.district}` : ''}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {formData.college && (
                                    <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '6px', marginLeft: '4px' }}>
                                        ✓ Verified: {formData.college}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* College Roll / ID */}
                        <div style={fieldStyle}>
                            <IdCard style={iconStyle} size={18} />
                            <input name="collegeId" type="text" placeholder="College Roll No. / Student ID" className="glass-input"
                                style={{ paddingLeft: '48px' }} onChange={handleChange} value={formData.collegeId} required />
                        </div>

                        {/* Course & Section Row */}
                        <div style={fieldStyle}>
                            <BookOpen style={iconStyle} size={18} />
                            <input name="course" type="text" placeholder="Course (e.g. B.Tech CSE)" className="glass-input"
                                style={{ paddingLeft: '48px' }} onChange={handleChange} value={formData.course} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={fieldStyle}>
                                <input name="batch" type="text" placeholder="Batch Year (e.g. 2026)" className="glass-input"
                                    onChange={handleChange} value={formData.batch} required />
                            </div>
                            <div style={fieldStyle}>
                                <input name="section" type="text" placeholder="Section (e.g. A3)" className="glass-input"
                                    onChange={handleChange} value={formData.section} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button type="button" onClick={() => { setStep(1); setError(''); }}
                                className="primary-button"
                                style={{ flex: '0 0 120px', background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                                ← Back
                            </button>
                            <button type="submit" className="primary-button" style={{ flex: 1 }} disabled={loading}>
                                {loading ? 'Creating Profile...' : 'Create Account 🚀'}
                            </button>
                        </div>
                    </form>
                )}

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
