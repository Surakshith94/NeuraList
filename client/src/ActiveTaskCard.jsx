import React from 'react';

const ActiveTaskCard = ({ task, onComplete, onPause }) => {
  if (!task) return null; // Don't show anything if no task is active

  // Taking inspiration from the sleek dark mode image
  const styles = {
    card: {
      background: 'linear-gradient(145deg, #1A1A24 0%, #121218 100%)', // Soft dark gradient
      borderRadius: '28px', // Heavy rounded corners like the image
      padding: '24px',
      color: '#FFFFFF',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)', // Deep shadow for floating effect
      border: '1px solid rgba(255, 255, 255, 0.05)', // Subtle glass edge
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden'
    },
    glowLine: {
      position: 'absolute',
      top: 0,
      left: '10%',
      width: '80%',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, #4CAF50, transparent)', // Neon accent
      opacity: 0.8
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    tag: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      color: '#A0A0B0',
      backdropFilter: 'blur(10px)'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      lineHeight: '1.2'
    },
    timeText: {
      color: '#8E8E93',
      fontSize: '14px',
      margin: '0 0 24px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    buttonRow: {
      display: 'flex',
      gap: '12px'
    },
    btnDone: {
      background: '#E8F5E9', // Soft high-contrast button
      color: '#2E7D32',
      padding: '14px 24px',
      borderRadius: '16px',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      flex: 2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      transition: 'transform 0.1s ease'
    },
    btnPause: {
      background: 'rgba(255, 255, 255, 0.08)', // Glassy secondary button
      color: '#FFFFFF',
      padding: '14px 24px',
      borderRadius: '16px',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.glowLine}></div>
      
      <div style={styles.header}>
        <span style={styles.tag}>Now Playing</span>
        <span style={styles.tag}>{task.energyLevel}</span>
      </div>

      <h2 style={styles.title}>{task.title}</h2>
      
      <p style={styles.timeText}>
        ⏳ {task.timeSpent} mins spent / {task.estimatedMinutes} mins total
      </p>

      <div style={styles.buttonRow}>
        <button style={styles.btnDone} onClick={() => onComplete(task._id)}>
          <span style={{ fontSize: '20px' }}>✅</span> Done
        </button>
        <button style={styles.btnPause} onClick={() => onPause(task._id)}>
          ⏸️ Pause
        </button>
      </div>
    </div>
  );
};

export default ActiveTaskCard;