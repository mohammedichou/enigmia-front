import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('enigmia_token') || '');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [candidatures, setCandidatures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // ── ÉTATS POUR LA RECHERCHE ET LES FILTRES ──
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [profilFilter, setProfilFilter] = useState('tous');

  // ── CONFIGURATION DE L'API ──
  const API_URL = 'http://localhost:5001'; // Modifie cette URL pour la production

  // ── CONNEXION ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('enigmia_token', data.token);
      } else {
        setLoginError(data.message || 'Identifiants incorrects');
      }
    } catch (error) {
      setLoginError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('enigmia_token');
  };

  // ── RÉCUPÉRATION DES CANDIDATURES ──
  const fetchCandidatures = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${API_URL}/api/candidatures/admin`, {
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      if (response.ok) {
        setCandidatures(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchCandidatures();
  }, [token]);

  // ── MISE À JOUR DU STATUT ──
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/candidatures/admin/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setCandidatures(prev => 
          prev.map(cand => cand._id === id ? { ...cand, status: newStatus } : cand)
        );
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  // ── LOGIQUE DE FILTRAGE ──
  const filteredCandidatures = candidatures.filter(cand => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      cand.prenom.toLowerCase().includes(searchLower) || 
      cand.nom.toLowerCase().includes(searchLower) ||
      cand.email.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'tous' || cand.status === statusFilter;
    const matchesProfil = profilFilter === 'tous' || cand.profil === profilFilter;

    return matchesSearch && matchesStatus && matchesProfil;
  });

  // ── STATISTIQUES ──
  const stats = {
    total: candidatures.length,
    acceptes: candidatures.filter(c => c.status === 'accepté').length,
    attente: candidatures.filter(c => c.status === 'en_attente').length,
    refuses: candidatures.filter(c => c.status === 'refusé').length,
  };

  // ── EXPORT EXCEL (CSV) ──
  const exportToExcel = () => {
    const headers = ['Date', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Ville', 'Déplacement', 'Profil', 'Compétences', 'Statut'];
    const rows = filteredCandidatures.map(cand => [
      new Date(cand.createdAt).toLocaleDateString('fr-FR'),
      `"${cand.nom}"`, `"${cand.prenom}"`, `"${cand.email}"`, `"${cand.telephone}"`,
      `"${cand.ville}"`, cand.deplacement, `"${cand.profil}"`, `"${cand.competences.replace(/\n/g, ' ')}"`, cand.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `EnigmIA_Candidatures_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const exportToPDF = () => window.print();

  // ==========================================
  // VUE 1 : CONNEXION (Style Pro)
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="absolute top-6 left-6">
          <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
            Retour à l'accueil
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-white">
            Administration <span className="text-[#E1C199]">EnigmIA</span>
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Veuillez vous identifier pour accéder au tableau de bord.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#141414] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-zinc-800">
            {loginError && (
              <div className="mb-4 rounded-md bg-red-950/50 border border-red-900 p-3 text-sm text-red-400 text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Adresse e-mail</label>
                <div className="mt-1">
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} 
                    className="block w-full appearance-none rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-[#E1C199] focus:outline-none focus:ring-[#E1C199] sm:text-sm transition-colors" 
                    placeholder="admin@enigmia.fr" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">Mot de passe</label>
                <div className="mt-1">
                  <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} 
                    className="block w-full appearance-none rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-[#E1C199] focus:outline-none focus:ring-[#E1C199] sm:text-sm transition-colors" 
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} 
                className={`flex w-full justify-center rounded-md border border-transparent bg-[#E1C199] py-2 px-4 text-sm font-medium text-[#0a0a0a] shadow-sm hover:bg-[#c9a781] focus:outline-none transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VUE 2 : TABLEAU DE BORD (Style Pro)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans print:bg-white print:text-black">
      {/* HEADER */}
      <header className="bg-[#141414] border-b border-zinc-800 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">Tableau de bord <span className="text-[#E1C199]">EnigmIA</span></h1>
            <span className="text-zinc-500 text-sm border-l border-zinc-700 pl-4 hidden sm:block">Gestion des candidatures</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">Retour au site</Link>
            <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ACTIONS & OUTILS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div className="flex flex-1 w-full gap-4">
            <input 
              type="text" placeholder="Rechercher (nom, email)..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full max-w-xs rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#E1C199] focus:outline-none focus:ring-1 focus:ring-[#E1C199]"
            />
            <select 
              value={profilFilter} onChange={(e) => setProfilFilter(e.target.value)}
              className="block rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-[#E1C199] focus:outline-none focus:ring-1 focus:ring-[#E1C199]"
            >
              <option value="tous">Tous les profils</option>
              <option value="Développeur">Développeur</option>
              <option value="Data scientist">Data Scientist</option>
              <option value="Désigner">Designer</option>
              <option value="Spécialiste IA">Spécialiste IA</option>
              <option value="Architecte">Architecte</option>
              <option value="Product manager">Product Manager</option>
            </select>
            <select 
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="block rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-[#E1C199] focus:outline-none focus:ring-1 focus:ring-[#E1C199]"
            >
              <option value="tous">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="accepté">Accepté</option>
              <option value="refusé">Refusé</option>
            </select>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={exportToExcel} className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
              Exporter CSV
            </button>
            <button onClick={exportToPDF} className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
              Exporter PDF
            </button>
            <button onClick={fetchCandidatures} className="inline-flex items-center rounded-md border border-transparent bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white transition-colors">
              {isFetching ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 print:hidden">
          <div className="overflow-hidden rounded-lg bg-[#141414] border border-zinc-800 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-zinc-400">Total Candidatures</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{stats.total}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-[#141414] border border-zinc-800 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-zinc-400">Dossiers Acceptés</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-400">{stats.acceptes}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-[#141414] border border-zinc-800 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-zinc-400">En Attente</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-[#E1C199]">{stats.attente}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-[#141414] border border-zinc-800 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-zinc-400">Dossiers Refusés</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-400">{stats.refuses}</dd>
          </div>
        </div>

        {/* TABLEAU */}
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#141414] print:border-gray-300 print:bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 print:divide-gray-300">
              <thead className="bg-zinc-900/50 print:bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider print:text-black">Candidat</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider print:text-black">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider print:text-black">Profil & Détails</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider print:text-black">Documents</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider print:text-black">Statut</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-[#141414] print:divide-gray-200 print:bg-white">
                {filteredCandidatures.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-zinc-500 print:text-gray-500">
                      Aucune candidature trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredCandidatures.map((cand) => (
                    <tr key={cand._id} className="hover:bg-zinc-800/50 transition-colors print:text-black">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white print:text-black">{cand.prenom} {cand.nom}</div>
                        <div className="text-xs text-zinc-500 mt-1">{cand.ville} • {cand.deplacement === 'oui' ? 'Mobile' : 'Sédentaire'}</div>
                        <div className="text-xs text-zinc-600 mt-0.5">{new Date(cand.createdAt).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-300 print:text-black">{cand.email}</div>
                        <div className="text-sm text-zinc-500">{cand.telephone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#E1C199] print:text-black">{cand.profil}</div>
                        <div className="text-sm text-zinc-400 mt-1 max-w-xs truncate" title={cand.competences}>
                          {cand.competences}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex flex-col gap-1">
                          {cand.cvUrl ? (
                            <a href={`${API_URL}${cand.cvUrl}`} target="_blank" rel="noreferrer" className="text-[#E1C199] hover:text-white transition-colors font-medium">Consulter le CV</a>
                          ) : (
                            <span className="text-zinc-600">Aucun fichier</span>
                          )}
                          <div className="flex gap-3 mt-1 text-xs">
                            {cand.linkedin && <a href={cand.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>}
                            {cand.github && <a href={cand.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border print:border-none print:px-0
                          ${cand.status === 'accepté' ? 'bg-green-900/30 text-green-400 border-green-800/50' : 
                            cand.status === 'refusé' ? 'bg-red-900/30 text-red-400 border-red-800/50' : 
                            'bg-yellow-900/30 text-yellow-500 border-yellow-800/50'}`}
                        >
                          {cand.status === 'en_attente' ? 'En attente' : cand.status === 'accepté' ? 'Accepté' : 'Refusé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
                        <div className="flex justify-end gap-2">
                          {cand.status !== 'accepté' && (
                            <button onClick={() => updateStatus(cand._id, 'accepté')} className="text-green-500 hover:text-green-400 transition-colors">
                              Accepter
                            </button>
                          )}
                          {cand.status !== 'refusé' && (
                            <button onClick={() => updateStatus(cand._id, 'refusé')} className="text-red-500 hover:text-red-400 transition-colors">
                              Refuser
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}