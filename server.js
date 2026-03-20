const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'cashcash_super_secret_key';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide' });
        req.user = user;
        next();
    });
};

// Login 
app.post('/api/login', (req, res) => {
    const { matricule, password } = req.body;

    if (!matricule || !password) {
        return res.status(400).json({ error: 'Matricule et mot de passe requis' });
    }

    try {
        const row = db.prepare('SELECT * FROM Employe WHERE Matricule = ?').get(matricule);
        if (!row) return res.status(401).json({ error: 'Matricule ou mot de passe incorrect' });

        const validPassword = bcrypt.compareSync(password, row.PasswordHash);
        if (!validPassword) return res.status(401).json({ error: 'Matricule ou mot de passe incorrect' });

        const token = jwt.sign({
            matricule: row.Matricule,
            nom: row.NomEmploye,
            prenom: row.PrenomEmploye,
            role: row.Role
        }, SECRET_KEY, { expiresIn: '8h' });

        res.json({ token, role: row.Role, nom: row.NomEmploye, prenom: row.PrenomEmploye, matricule: row.Matricule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET list of interventions
app.get('/api/interventions', authenticateToken, (req, res) => {
    try {
        let query = `
            SELECT i.NumeroIntervent, i.DateVisite, i.HeureVisite, 
                   c.RaisonSociale, c.Adresse as AdresseClient, c.TelephoneClient,
                   a.Nomagence as Agence, c.DistanceKM,
                   t.Matricule as TechMatricule, e.NomEmploye as TechNom, e.PrenomEmploye as TechPrenom
            FROM Intervention i
            JOIN Client c ON i.NumeroClient = c.NumeroClient
            JOIN Technicien t ON i.Matricule = t.Matricule
            JOIN Employe e ON t.Matricule = e.Matricule
            JOIN Agence a ON c.idAgence = a.idAgence
        `;

        const params = [];
        const conditions = [];

        if (req.user.role === 'technicien') {
            conditions.push('i.Matricule = ?');
            params.push(req.user.matricule);
        } else if (req.query.technicien) {
            conditions.push('i.Matricule = ?');
            params.push(req.query.technicien);
        }

        if (req.query.date) {
            conditions.push('i.DateVisite = ?');
            params.push(req.query.date);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY i.DateVisite DESC, c.DistanceKM ASC';

        const interventions = db.prepare(query).all(...params);
        res.json(interventions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Create an intervention (Gestionnaire only)
app.post('/api/interventions', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'gestionnaire') return res.status(403).json({ error: 'Accès interdit' });

        const { NumeroClient, DateVisite, HeureVisite, Matricule } = req.body;
        if (!NumeroClient || !DateVisite || !HeureVisite || !Matricule) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        // Generate a new ID (Example: YYYYMM + sequence, simplified here as max id + 1)
        const maxIdRow = db.prepare('SELECT MAX(NumeroIntervent) as maxId FROM Intervention').get();
        const nextId = (maxIdRow.maxId || 2025000000) + 1;

        const stmt = db.prepare('INSERT INTO Intervention (NumeroIntervent, DateVisite, HeureVisite, Matricule, NumeroClient) VALUES (?, ?, ?, ?, ?)');
        stmt.run(nextId, DateVisite, HeureVisite, Matricule, NumeroClient);

        res.status(201).json({ message: 'Intervention créée avec succès', NumeroIntervent: nextId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur lors de la création' });
    }
});

// GET single intervention with equipment
app.get('/api/interventions/:id', authenticateToken, (req, res) => {
    try {
        const id = req.params.id;
        const interv = db.prepare(`
            SELECT i.NumeroIntervent, i.DateVisite, i.HeureVisite, 
                   c.RaisonSociale, c.Adresse as AdresseClient, c.TelephoneClient,
                   e.NomEmploye, e.PrenomEmploye
            FROM Intervention i
            JOIN Client c ON i.NumeroClient = c.NumeroClient
            JOIN Employe e ON i.Matricule = e.Matricule
            WHERE i.NumeroIntervent = ?
        `).get(id);

        if (!interv) return res.status(404).json({ error: 'Intervention introuvable' });

        const controles = db.prepare(`
            SELECT m.NumerodeSerie, tm.LibelleTypemateriel, m.Emplacement,
                   ctrl.TempsPasse, ctrl.Commentaire
            FROM Controler ctrl
            JOIN Materiel m ON ctrl.NumerodeSerie = m.NumerodeSerie
            JOIN TypeMateriel tm ON m.ReferenceInterne = tm.ReferenceInterne
            WHERE ctrl.NumeroIntervent = ?
        `).all(id);

        interv.materiels = controles;
        res.json(interv);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Update an intervention's equipment check (Valider)
app.put('/api/interventions/:id/controler/:serie', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'technicien') return res.status(403).json({ error: 'Non autorise' });

        const idInterv = req.params.id;
        const nSerie = req.params.serie;
        const { tempsPasse, commentaire } = req.body;

        const checkAuth = db.prepare('SELECT Matricule FROM Intervention WHERE NumeroIntervent = ?').get(idInterv);
        if (checkAuth.Matricule !== req.user.matricule) {
            return res.status(403).json({ error: 'Intervention ne vous appartient pas' });
        }

        const stmt = db.prepare('UPDATE Controler SET TempsPasse = ?, Commentaire = ? WHERE NumeroIntervent = ? AND NumerodeSerie = ?');
        const info = stmt.run(tempsPasse, commentaire, idInterv, nSerie);

        if (info.changes === 0) {
            // Might need to insert if not exist
            const insert = db.prepare('INSERT INTO Controler (NumeroIntervent, NumerodeSerie, TempsPasse, Commentaire) VALUES (?, ?, ?, ?)');
            insert.run(idInterv, nSerie, tempsPasse, commentaire);
        }

        res.json({ message: 'Intervention mise a jour avec succes' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Analytics
app.get('/api/stats', authenticateToken, (req, res) => {
    if (req.user.role !== 'gestionnaire') return res.status(403).json({ error: 'Accès interdit' });

    try {
        const month = req.query.month || new Date().toISOString().substring(0, 7);
        const sql = `
            SELECT e.Matricule, e.NomEmploye, e.PrenomEmploye,
                   COUNT(DISTINCT i.NumeroIntervent) as NbInterventions,
                   SUM(c.DistanceKM) * 2 as KmParcourus,
                   SUM(
                       CAST(SUBSTR(IFNULL(ctrl.TempsPasse, '00:00:00'), 1, 2) AS INTEGER) * 60 + 
                       CAST(SUBSTR(IFNULL(ctrl.TempsPasse, '00:00:00'), 4, 2) AS INTEGER)
                   ) as DureeMinutes
            FROM Intervention i
            JOIN Technicien t ON i.Matricule = t.Matricule
            JOIN Employe e ON t.Matricule = e.Matricule
            JOIN Client c ON i.NumeroClient = c.NumeroClient
            LEFT JOIN Controler ctrl ON i.NumeroIntervent = ctrl.NumeroIntervent
            WHERE strftime('%Y-%m', i.DateVisite) = ?
            GROUP BY e.Matricule
        `;
        const stats = db.prepare(sql).all(month);
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
