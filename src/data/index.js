// src/data.js

export const EVENT_DATE = new Date('May 21, 2026 09:00:00');

export const navLinks = [
  { label: 'Accueil', href: '#hero' },
  { label: 'Histoire', href: '#story' },
  { label: 'Concept', href: '#concept' },
  { label: 'Programme', href: '#programme' },
  { label: 'Récompenses', href: '#prizes' },
];

export const timelineItems = [
  {
    id: 'jour-1',
    dayLabel: 'Jour 1',
    date: '21 Mai 2026',
    title: 'Lancement du hackathon',
    items: [
      'Escape game immersif',
      'Présentation du défi et formation des équipes'
    ]
  },
  {
    id: 'jour-2-3',
    dayLabel: 'Jour 2 – 3',
    date: '22 - 23 Mai 2026',
    title: 'Phase de création et de prototypage',
    items: [
      'Travail en équipe avec l’accompagnement d’experts si besoin',
      'Mise à disposition de ressources pour designer, prototyper, itérer et présenter une solution'
    ]
  },
  {
    id: 'jour-4',
    dayLabel: 'Jour 4',
    date: '24 Mai 2026',
    title: 'PITCH FINAL',
    items: [
      'Pitch final devant le jury',
      'Annonce des équipes gagnantes'
    ]
  }
];

export const features = [
  { id: 1, icon: '🧩', title: 'Défis Techniques', desc: 'Des défis techniques stimulants à résoudre en un temps limité.' },
  { id: 2, icon: '🤝', title: 'Expérience Collaborative', desc: 'Une expérience collaborative intense et formatrice en équipe.' },
  { id: 3, icon: '⚡', title: 'Sprint de Création', desc: 'Un sprint de création et d’innovation pour prototyper rapidement.' },
  { id: 4, icon: '🏆', title: 'Compétition', desc: 'Une compétition saine entre équipes passionnées par la technologie.' }
];

export const deliverableTypes = [
  { id: '01', label: 'Modèles d’intelligence artificielle' },
  { id: '02', label: 'Plateformes numériques' },
  { id: '03', label: 'Applications mobiles' },
  { id: '04', label: 'API et webservices' }
];

export const skills = [
  { id: 'dev', label: 'Développeurs' },
  { id: 'data', label: 'Data Scientists' },
  { id: 'ux', label: 'Designers' },
  { id: 'ai', label: 'Spécialistes IA' },
  { id: 'tech', label: 'Passionnés de technologie' }
];

export const prizes = [
  { id: 'p1', emoji: '🧠', name: 'IA la plus intelligente', amount: '60 000 DZD' },
  { id: 'p2', emoji: '✨', name: 'UI la plus ergonomique et design', amount: '60 000 DZD' },
  { id: 'p3', emoji: '🚀', name: 'Le produit le plus abouti', amount: '60 000 DZD' },
  { id: 'p4', emoji: '🤝', name: 'L’équipe la plus collaborative', amount: '60 000 DZD' },
  { id: 'p5', emoji: '💡', name: 'Le produit le plus innovant', amount: '60 000 DZD' }
];

export const profiles = [
  { id: 'pr1', icon: '💻', name: 'Développeurs' },
  { id: 'pr2', icon: '📊', name: 'Data Scientists' },
  { id: 'pr3', icon: '🎨', name: 'Designers' },
  { id: 'pr4', icon: '🤖', name: 'Spécialistes IA' },
  { id: 'pr5', icon: '❤️', name: 'Passionnés' }
];