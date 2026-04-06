import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Trash2, Download } from 'lucide-react';

const Scratchpad = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [lineWidth, setLineWidth] = useState(3);
    const [isEraser, setIsEraser] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#1e1e24';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Dark background
    }, []);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = isEraser ? '#1e1e24' : color;
        ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e1e24';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadBoard = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `scratchpad-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <PenTool size={18} color="var(--accent-blue)" /> Digital Scratchpad
                    </h3>
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => { setColor(e.target.value); setIsEraser(false); }} 
                        style={{ border: 'none', background: 'transparent', width: 32, height: 32, cursor: 'pointer', padding: 0 }}
                    />
                    <button 
                        onClick={() => setIsEraser(!isEraser)}
                        style={{ background: isEraser ? 'rgba(56, 189, 248, 0.2)' : 'transparent', border: '1px solid var(--border-subtle)', color: isEraser ? 'var(--accent-blue)' : 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Eraser size={16} /> Eraser
                    </button>
                    <input 
                        type="range" 
                        min="1" max="10" 
                        value={lineWidth} 
                        onChange={(e) => setLineWidth(e.target.value)} 
                        style={{ width: '80px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={clearCanvas} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Clear Board"><Trash2 size={18} /></button>
                    <button onClick={downloadBoard} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Save Image"><Download size={18} /></button>
                </div>
            </div>
            
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                style={{ flex: 1, cursor: isEraser ? 'cell' : 'crosshair', background: '#1e1e24', display: 'block', width: '100%', height: '500px' }}
            />
        </div>
    );
};

export default Scratchpad;
