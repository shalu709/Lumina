import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchVaultResources, shareVaultResource, upvoteVaultResource } from '../services/api';
import { FolderHeart, ExternalLink, ThumbsUp, Plus } from 'lucide-react';
import '../index.css';

const Vault = () => {
    const { user } = useContext(AuthContext);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form States
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');
    const [subjectContext, setSubjectContext] = useState('');

    const loadResources = async () => {
        setLoading(true);
        try {
            const data = await fetchVaultResources();
            setResources(data);
        } catch (err) {
            console.error("Failed to fetch vault", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadResources();
    }, []);

    const handleShare = async (e) => {
        e.preventDefault();
        if (!title || !resourceUrl) return;
        
        try {
            await shareVaultResource({ title, description, resourceUrl, subjectContext });
            setShowForm(false);
            setTitle('');
            setDescription('');
            setResourceUrl('');
            setSubjectContext('');
            loadResources();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to share resource");
        }
    };

    const handleUpvote = async (id) => {
        try {
            await upvoteVaultResource(id);
            // Optimistic UI update
            setResources(resources.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r).sort((a,b) => b.upvotes - a.upvotes));
        } catch (err) {
            alert(err.response?.data?.error || "Cannot upvote your own post");
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FolderHeart size={36} color="var(--accent-blue)" /> The Digital Vault
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Shared notes and drives exclusively for Section {user?.section}. Most upvoted resources bubble to the top.
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {showForm ? 'Cancel' : <><Plus size={18} /> Add Resource</>}
                </button>
            </header>

            {showForm && (
                <form className="glass-panel" onSubmit={handleShare} style={{ padding: '24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <input className="glass-input" style={{ flex: 1 }} placeholder="Resource Title (e.g. OOPS Unit 1 Notes)" value={title} onChange={e => setTitle(e.target.value)} required />
                        <input className="glass-input" style={{ flex: 1 }} placeholder="Subject / Tag" value={subjectContext} onChange={e => setSubjectContext(e.target.value)} />
                    </div>
                    <input className="glass-input" type="url" placeholder="Paste Link (Google Drive, Notion, YouTube, etc.)" value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} required />
                    <textarea className="glass-input" placeholder="Brief description of what's inside..." value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ resize: 'vertical' }} />
                    <button type="submit" className="primary-button" style={{ alignSelf: 'flex-start' }}>Share to Section</button>
                </form>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    <div className="blinking-dot" style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent-blue)', borderRadius: '50%', marginBottom: 16 }}></div>
                    <p>Unlocking the Vault...</p>
                </div>
            ) : resources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
                    <FolderHeart size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>No resources found.</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Be the first to share an important link with Section {user?.section} and earn Reputation Points!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {resources.map(resource => (
                        <div key={resource.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{resource.title}</h3>
                                    {resource.subjectContext && <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: '12px' }}>{resource.subjectContext}</span>}
                                </div>
                                <a href={resource.resourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                                    <ExternalLink size={14} /> Open
                                </a>
                            </div>
                            
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                                {resource.description || 'No description provided.'}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                        {resource.uploadedBy?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{resource.uploadedBy?.name}</span>
                                </div>
                                
                                <button 
                                    onClick={() => handleUpvote(resource.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'transparent', border: 'none', color: '#fbbf24', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <ThumbsUp size={16} /> {resource.upvotes}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Vault;
