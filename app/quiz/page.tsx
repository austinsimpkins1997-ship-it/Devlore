'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import styles from './quiz.module.css';

const HERO_CLASSES: Record<string, {
  name: string;
  title: string;
  emoji: string;
  color: string;
  glow: string;
  desc: string;
  traits: string[];
}> = {
  'arcane-architect': { name: 'Arcane Architect', title: 'Weaver of Typed Sorcery', emoji: '🏛️', color: '#7c3aed', glow: 'rgba(124,58,237,0.3)', desc: 'You see systems where others see chaos. Before a line of code is written, you have the architecture mapped — typed, structured, and inevitable. You are the calm at the center of every technical storm.', traits: ['Systems Thinker', 'Type Safety Evangelist', 'Pattern Recognizer'] },
  'script-sorcerer': { name: 'Script Sorcerer', title: 'Binder of Automated Will', emoji: '⚡', color: '#059669', glow: 'rgba(5,150,105,0.3)', desc: 'Manual tasks are an insult to you. If something happens twice, it gets automated. Your scripts are quiet spells running in the background — invisible, reliable, essential.', traits: ['Automation First', 'Ship Fast', 'Reliability Obsessed'] },
  'shell-wraith': { name: 'Shell Wraith', title: 'Haunter of the Command Line', emoji: '🌑', color: '#64748b', glow: 'rgba(100,116,139,0.3)', desc: 'You live in the terminal. GUIs feel like painting with oven mitts. You know flags nobody else has read and aliases nobody else would write. You are the ghost in every machine you touch.', traits: ['Terminal Native', 'Deep Focus', 'Invisible Operator'] },
  'pixel-paladin': { name: 'Pixel Paladin', title: 'Guardian of Beautiful Interfaces', emoji: '🎨', color: '#ec4899', glow: 'rgba(236,72,153,0.3)', desc: 'You feel it when a button is 2px too small. You notice micro-interactions others call unnecessary. To you, UX is not decoration — it is the entire point. Every user who does not have to think is a victory.', traits: ['UX Champion', 'Detail Obsessed', 'User Advocate'] },
  'data-druid': { name: 'Data Druid', title: 'Whisperer to Databases', emoji: '🌿', color: '#0891b2', glow: 'rgba(8,145,178,0.3)', desc: 'Opinions without data are just noise to you. You query before you conclude. You chart before you claim. In a room full of gut feelings, you are the one with the spreadsheet that changes the conversation.', traits: ['Evidence Driven', 'SQL Native', 'Pattern Finder'] },
  'iron-forger': { name: 'Iron Forger', title: 'Keeper of the Living Infrastructure', emoji: '⚙️', color: '#b45309', glow: 'rgba(180,83,9,0.3)', desc: 'Production never sleeps. Neither do you, not really. You built the pipelines, you wrote the alerts, you planned the rollback. When everything is on fire, you are the one who already had the extinguisher.', traits: ['Infrastructure First', 'Incident Ready', 'Zero Downtime'] },
  'chaos-mage': { name: 'Chaos Mage', title: 'Wielder of the Wild Commit', emoji: '🔥', color: '#ea580c', glow: 'rgba(234,88,12,0.3)', desc: 'Rules are starting points. You push to main when the mood strikes. Your experiments break things in instructive ways. Where others see recklessness, you see creative velocity. You ship the impossible because you never asked if it was possible.', traits: ['Creative First', 'High Velocity', 'Fearless Experimenter'] },
  'open-sage': { name: 'Open Sage', title: 'Guardian of the Commons', emoji: '📚', color: '#4f46e5', glow: 'rgba(79,70,229,0.3)', desc: 'You build in public. You document, not because you were asked, but because someone would need it. You answer questions you have already answered. You are the reason projects have communities instead of just codebases.', traits: ['Community Builder', 'Documentation Believer', 'Public by Default'] },
};

const QUESTIONS = [
  {
    question: 'A new project lands on your desk. Your first move is...',
    options: [
      { text: 'Plan the full architecture before writing a line', slug: 'arcane-architect' },
      { text: 'Just start building — figure it out as you go', slug: 'chaos-mage' },
      { text: 'Study the data and requirements first', slug: 'data-druid' },
      { text: 'Find existing open source I can adapt', slug: 'open-sage' },
    ]
  },
  {
    question: 'It is 11pm. You should sleep. Instead you are...',
    options: [
      { text: 'Debugging a race condition that has been haunting you all week', slug: 'shell-wraith' },
      { text: 'Reading architecture docs for the joy of it', slug: 'arcane-architect' },
      { text: 'Contributing to a project you love', slug: 'open-sage' },
      { text: 'Learning something completely unrelated to your day job', slug: 'chaos-mage' },
    ]
  },
  {
    question: 'Your ideal codebase is...',
    options: [
      { text: 'Perfectly typed, every edge case handled', slug: 'arcane-architect' },
      { text: 'Lean, battle-tested, runs anywhere', slug: 'iron-forger' },
      { text: 'Beautifully documented, welcoming to contributors', slug: 'open-sage' },
      { text: 'Experimental — it might break but it is exciting', slug: 'chaos-mage' },
    ]
  },
  {
    question: 'When something breaks in production, you...',
    options: [
      { text: 'Already had an alert and a rollback ready', slug: 'iron-forger' },
      { text: 'Dive in fearlessly — this is where learning happens', slug: 'script-sorcerer' },
      { text: 'Trace logs and data until root cause is obvious', slug: 'data-druid' },
      { text: 'Fix it live while posting about it on Twitter', slug: 'chaos-mage' },
    ]
  },
  {
    question: 'Your favorite part of a project is...',
    options: [
      { text: 'The architecture diagram coming together', slug: 'arcane-architect' },
      { text: 'Making it beautiful for users', slug: 'pixel-paladin' },
      { text: 'Analyzing how real people use it', slug: 'data-druid' },
      { text: 'The refactor that makes it 10x cleaner', slug: 'shell-wraith' },
    ]
  },
  {
    question: 'People who work with you say...',
    options: [
      { text: 'You make the complex feel simple', slug: 'open-sage' },
      { text: 'You ship when others are still debating', slug: 'script-sorcerer' },
      { text: 'You are the infrastructure wizard nobody thanks enough', slug: 'iron-forger' },
      { text: 'You have surprising opinions about design', slug: 'pixel-paladin' },
    ]
  },
  {
    question: 'Your relationship with aesthetics and design is...',
    options: [
      { text: 'I care deeply — bad UI is an offense', slug: 'pixel-paladin' },
      { text: 'Functional over beautiful, always', slug: 'iron-forger' },
      { text: 'I appreciate great design but leave it to the experts', slug: 'data-druid' },
      { text: 'I have strong opinions and I will impose them', slug: 'arcane-architect' },
    ]
  },
  {
    question: 'Your superpower, honestly, is...',
    options: [
      { text: 'Seeing the shape of a system before anyone else', slug: 'arcane-architect' },
      { text: 'Making things talk to each other reliably', slug: 'iron-forger' },
      { text: 'Getting others to care about your project', slug: 'open-sage' },
      { text: 'Shipping things nobody else would attempt', slug: 'chaos-mage' },
    ]
  }
];

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [resultSlug, setResultSlug] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleSelect = (slug: string) => {
    if (animating) return;
    setAnimating(true);
    
    setTimeout(() => {
      const newAnswers = [...answers, slug];
      setAnswers(newAnswers);
      
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Calculate result
        const counts: Record<string, number> = {};
        let maxCount = 0;
        let winner = newAnswers[0];
        
        for (const ans of newAnswers) {
          counts[ans] = (counts[ans] || 0) + 1;
          if (counts[ans] > maxCount) {
            maxCount = counts[ans];
            winner = ans;
          }
        }
        setResultSlug(winner);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setAnimating(false);
    }, 300);
  };

  const handleShare = () => {
    if (!resultSlug) return;
    const hero = HERO_CLASSES[resultSlug];
    const text = `I am a ${hero.name} — ${hero.title}. Discover your hero class at devlore.app/quiz`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleTryAgain = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setResultSlug(null);
  };

  return (
    <>
      <Navbar />
      <div className={styles.quizPage}>
        {!resultSlug ? (
          <div key={currentQuestionIndex} className={styles.questionCard}>
            <div className={styles.progressTrack}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${((currentQuestionIndex) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            
            <div className={styles.questionHeader}>
              <div className={styles.questionNumber}>
                Q{currentQuestionIndex + 1} / {QUESTIONS.length}
              </div>
              <h2 className={styles.questionText}>
                {QUESTIONS[currentQuestionIndex].question}
              </h2>
            </div>

            <div className={styles.answerGrid}>
              {QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  className={styles.answerCard}
                  onClick={() => handleSelect(option.slug)}
                  disabled={animating}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.resultCard}>
            <div className={styles.resultEmoji}>{HERO_CLASSES[resultSlug].emoji}</div>
            <h1 className={styles.heroName}>{HERO_CLASSES[resultSlug].name}</h1>
            <div className={styles.heroTitle}>{HERO_CLASSES[resultSlug].title}</div>
            
            <p className={styles.heroDesc}>{HERO_CLASSES[resultSlug].desc}</p>
            
            <div className={styles.traitsList}>
              {HERO_CLASSES[resultSlug].traits.map((trait, idx) => (
                <span 
                  key={idx} 
                  className={styles.traitBadge}
                  style={{ 
                    borderColor: HERO_CLASSES[resultSlug].color,
                    backgroundColor: HERO_CLASSES[resultSlug].glow
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
            
            <div className={styles.ctaRow}>
              <button className={styles.shareBtn} onClick={handleShare}>
                Share Result
              </button>
              <button className={styles.tryAgainBtn} onClick={handleTryAgain}>
                Try Again
              </button>
              <Link href="/sign-in" className={styles.confirmBtn}>
                Confirm with GitHub
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
