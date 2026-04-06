import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchCourseRatings, postCourseRating, deleteCourseRating } from '../services/api';
import { Star, MessageSquare, Trash2, Send, Plus, User, BookOpen, GraduationCap } from 'lucide-react';
import '../index.css';

const Ratings = () => {
  const { user } = useContext(AuthContext);
  const [ratings, setRatings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [courseName, setCourseName] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      const data = await fetchCourseRatings();
      setRatings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseName || !stars) return;
    try {
      await postCourseRating({ courseName, professorName, stars, reviewText });
      setCourseName('');
      setProfessorName('');
      setStars(5);
      setReviewText('');
      setShowForm(false);
      loadRatings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        await deleteCourseRating(id);
        loadRatings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderStars = (count, interactive = false) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={interactive ? 24 : 16}
            fill={i <= count ? "#fbbf24" : "transparent"}
            color={i <= count ? "#fbbf24" : "var(--text-secondary)"}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => interactive && setStars(i)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Star color="var(--accent-blue)" /> Anonymous Course Ratings
          </h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
            Help your peers choosing subjects and professors. Your identity remains hidden.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="primary-button"
          style={{ background: showForm ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-gradient)', border: showForm ? '1px solid #ef4444' : 'none', color: showForm ? '#ef4444' : 'white' }}
        >
          {showForm ? 'Cancel' : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Post Review
            </span>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', marginBottom: '32px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Course Name</label>
              <input 
                className="glass-input" 
                placeholder="e.g. Data Structures" 
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Professor (Optional)</label>
              <input 
                className="glass-input" 
                placeholder="e.g. Dr. Sharma" 
                value={professorName}
                onChange={e => setProfessorName(e.target.value)}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rating</label>
            {renderStars(stars, true)}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your Review</label>
            <textarea 
              className="glass-input" 
              placeholder="What was your experience? (Workload, Grading, Teaching Style...)" 
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />
          </div>

          <button type="submit" className="primary-button" style={{ width: '100%' }}>
            Post Anonymous Review (+15 Rep)
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>Loading reviews...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {ratings.length === 0 && !showForm && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>No reviews yet for {user?.college}. Be the first to help your campus!</p>
            </div>
          )}
          {ratings.map((r) => (
            <div key={r.id} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={18} color="var(--accent-blue)" /> {r.courseName}
                  </h4>
                  {r.professorName && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GraduationCap size={16} /> {r.professorName}
                    </p>
                  )}
                </div>
                {renderStars(r.stars)}
              </div>
              
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {r.reviewText}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> {r.anonymousIdentifier}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                   {r.isMine && (
                     <button onClick={() => handleDelete(r.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                     </button>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ratings;
