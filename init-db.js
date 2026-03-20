const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'cashcash.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new DatabaseSync(dbPath);

const schema = `
CREATE TABLE Employe(
   Matricule INTEGER PRIMARY KEY,
   NomEmploye VARCHAR(50),
   PrenomEmploye VARCHAR(50),
   AdresseEmploye VARCHAR(70),
   DateEmbauche DATE,
   PasswordHash VARCHAR(255),
   Role VARCHAR(20)
);

CREATE TABLE Agence(
   idAgence Varchar(5) PRIMARY KEY,
   Nomagence VARCHAR(50),
   TelephoneAgence Varchar(10),
   Adresseagence VARCHAR(50)
);

CREATE TABLE Client(
   NumeroClient INTEGER PRIMARY KEY,
   RaisonSociale VARCHAR(60),
   Siren INT,
   CodeApe Varchar(5),
   Adresse VARCHAR(70),
   TelephoneClient Varchar(10),
   Email VARCHAR(50),
   DureeDeplacement TIME,
   DistanceKM INT,
   idAgence Varchar(5),
   FOREIGN KEY(idAgence) REFERENCES Agence(idAgence)
);

CREATE TABLE TypeContrat(
   RefTypeContrat INTEGER PRIMARY KEY,
   DelaiIntervention TIME,
   TauxApplicable REAL
);

CREATE TABLE TypeMateriel(
   ReferenceInterne INTEGER PRIMARY KEY,
   LibelleTypemateriel VARCHAR(50)
);

CREATE TABLE Technicien(
   Matricule INTEGER PRIMARY KEY,
   TelephoneMobile Varchar(10),
   Qualification VARCHAR(60),
   DateObtention DATE,
   idAgence Varchar(5),
   FOREIGN KEY(Matricule) REFERENCES Employe(Matricule),
   FOREIGN KEY(idAgence) REFERENCES Agence(idAgence)
);

CREATE TABLE Intervention(
   NumeroIntervent INTEGER PRIMARY KEY,
   DateVisite DATE,
   HeureVisite TIME,
   Matricule INT NOT NULL,
   NumeroClient INT NOT NULL,
   FOREIGN KEY(Matricule) REFERENCES Technicien(Matricule),
   FOREIGN KEY(NumeroClient) REFERENCES Client(NumeroClient)
);

CREATE TABLE Contratdemaintenance(
   NumerodeContrat INTEGER PRIMARY KEY,
   DateSignature DATE,
   DateEcheance DATE,
   NumeroClient INT NOT NULL,
   RefTypeContrat INT NOT NULL,
   FOREIGN KEY(NumeroClient) REFERENCES Client(NumeroClient),
   FOREIGN KEY(RefTypeContrat) REFERENCES TypeContrat(RefTypeContrat)
);

CREATE TABLE Materiel(
   NumerodeSerie INTEGER PRIMARY KEY,
   Datedevente DATE,
   DateInstallation DATETIME,
   PrixdeVente REAL,
   Emplacement VARCHAR(50),
   ReferenceInterne INT NOT NULL,
   NumerodeContrat INT,
   NumeroClient INT NOT NULL,
   FOREIGN KEY(ReferenceInterne) REFERENCES TypeMateriel(ReferenceInterne),
   FOREIGN KEY(NumerodeContrat) REFERENCES Contratdemaintenance(NumerodeContrat),
   FOREIGN KEY(NumeroClient) REFERENCES Client(NumeroClient)
);

CREATE TABLE Controler(
   NumeroIntervent INT,
   NumerodeSerie INT,
   TempsPasse TIME,
   Commentaire TEXT,
   PRIMARY KEY(NumeroIntervent, NumerodeSerie),
   FOREIGN KEY(NumeroIntervent) REFERENCES Intervention(NumeroIntervent),
   FOREIGN KEY(NumerodeSerie) REFERENCES Materiel(NumerodeSerie)
);
`;

const agences = [
   ['59ARM', 'Agence Lille - Armentieres', '0320456789', '12 rue du Commerce, 59100 Armentieres'],
   ['68MUL', 'Agence Mulhouse', '0389754123', '3 place de la Republique, 68100 Mulhouse'],
   ['76ROU', 'Agence Rouen', '0235678901', '5 avenue du Port, 76000 Rouen'],
   ['34MON', 'Agence Montpellier', '0624021144', '1925 Rue Saint-Priest, 34185 Montpellier']
];

const employes = [
   [1001, 'DUPONT', 'Claire', '4 rue des Ecoles, 59000 Lille', '2008-06-15', 'technicien'],
   [1002, 'MARTIN', 'Julien', '22 rue Verte, 68100 Mulhouse', '2015-09-01', 'technicien'],
   [1003, 'LEFEVRE', 'Sophie', '10 boulevard Victor, 76000 Rouen', '2020-03-20', 'technicien'],
   [1004, 'GIRARD', 'Maxime', '12 rue des Lilas, 59110 La Madeleine', '2012-04-18', 'technicien'],
   [1005, 'ROUSSEL', 'Amelie', '7 rue du Stade, 68270 Wittenheim', '2018-10-09', 'technicien'],
   [2001, 'BERNARD', 'Paul', '1 avenue Foch, 59000 Lille', '2010-02-12', 'gestionnaire'],
   [2002, 'PETIT', 'Marie', '32 rue de la Paix, 68100 Mulhouse', '2016-11-05', 'gestionnaire']
];

const techniciens = [
   [1001, '0612345678', 'Niveau 2 - Reseau', '2009-05-10', '59ARM'],
   [1002, '0623456789', 'Niveau 3 - Electrique', '2016-11-22', '68MUL'],
   [1003, '0634567890', 'Niveau 2 - Systemes', '2020-04-15', '76ROU'],
   [1004, '0645678912', 'Niveau 1 - Maintenance', '2013-05-12', '59ARM'],
   [1005, '0656789123', 'Niveau 3 - Reseau avance', '2019-11-03', '68MUL']
];

const typeContrats = [
   [1, '04:00:00', 75.00],
   [2, '02:00:00', 95.00],
   [3, '08:00:00', 120.00]
];

const typeMateriels = [
   [10, 'Imprimante thermique modele A'],
   [20, 'Lecteur de codes-barres serie X'],
   [30, 'Terminal de paiement TPV Pro']
];

const clients = [
   [132547890, 'Boulangerie du Centre', 123456789, '5610A', '8 rue du Marche, 59100 Lille', '0320223344', 'contact@..', '01:15:00', 18, '59ARM'],
   [214365879, 'Supermarche Mulhouse Sud', 987654321, '4711B', '14 rue du Commerce, 68200 Mulhouse', '0389765432', 'contact@..', '00:45:00', 12, '68MUL'],
   [198765432, 'Cabinet Medical Rouen', 111222333, '8622C', '2 rue des Acacias, 76000 Rouen', '0234567890', 's@..', '00:30:00', 7, '76ROU'],
   [123456789, 'Atelier Informatique Lille', 192837465, '6202A', '20 avenue Jean Jaures, 59000 Lille', '0320112233', 'a@..', '00:50:00', 15, '59ARM'],
   [345678912, 'Garage du Moulin', 567123890, '4520B', '15 rue du Moulin, 59130 Lambersart', '0320445566', 'contact@garagemoulin.fr', '00:40:00', 10, '59ARM'],
   [456789123, 'Pharmacie Centrale Mulhouse', 781234569, '4773Z', '5 avenue Kennedy, 68200 Mulhouse', '0389761200', 'info@pharmacie-mulhouse.fr', '00:30:00', 8, '68MUL']
];

const interventions = [
   [2025110001, '2025-11-15', '09:00:00', 1001, 132547890],
   [2025090052, '2025-09-18', '14:30:00', 1002, 214365879],
   [2025070003, '2025-07-02', '08:30:00', 1003, 198765432],
   [2025110004, '2025-11-03', '10:15:00', 1001, 123456789],
   [2025010002, '2025-01-28', '11:10:00', 1004, 345678912],
   [2025020001, '2025-02-10', '15:45:00', 1002, 456789123]
];

const materiels = [
   [50001, '2023-06-20', '2023-06-21 09:30:00', 450.00, 'Backoffice - rayon caisse', 10, null, 132547890],
   [50002, '2024-10-10', '2024-10-12 14:00:00', 1290.00, 'Comptoir principal', 30, null, 214365879],
   [50003, '2021-02-01', '2021-02-02 11:15:00', 220.00, 'Cabinet 2 - salle 1', 20, null, 198765432]
];

const controles = [
   [2025110001, 50001, '00:45:00', 'Remplacement bobine, test OK'],
   [2025090052, 50002, '01:20:00', 'Mise a jour firmware, calibrage effectue'],
   [2025070003, 50003, '00:30:00', 'Nettoyage tete lecture, recalibration']
];

db.exec(schema);

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

const insertAgence = db.prepare('INSERT INTO Agence (idAgence, Nomagence, TelephoneAgence, Adresseagence) VALUES (?, ?, ?, ?)');
agences.forEach(a => insertAgence.run(...a));

const insertEmploye = db.prepare('INSERT INTO Employe (Matricule, NomEmploye, PrenomEmploye, AdresseEmploye, DateEmbauche, PasswordHash, Role) VALUES (?, ?, ?, ?, ?, ?, ?)');
employes.forEach(e => insertEmploye.run(e[0], e[1], e[2], e[3], e[4], defaultPasswordHash, e[5]));

const insertTech = db.prepare('INSERT INTO Technicien (Matricule, TelephoneMobile, Qualification, DateObtention, idAgence) VALUES (?, ?, ?, ?, ?)');
techniciens.forEach(t => insertTech.run(...t));

const insertTypeContrat = db.prepare('INSERT INTO TypeContrat (RefTypeContrat, DelaiIntervention, TauxApplicable) VALUES (?, ?, ?)');
typeContrats.forEach(tc => insertTypeContrat.run(...tc));

const insertTypeMateriel = db.prepare('INSERT INTO TypeMateriel (ReferenceInterne, LibelleTypemateriel) VALUES (?, ?)');
typeMateriels.forEach(tm => insertTypeMateriel.run(...tm));

const insertClient = db.prepare('INSERT INTO Client (NumeroClient, RaisonSociale, Siren, CodeApe, Adresse, TelephoneClient, Email, DureeDeplacement, DistanceKM, idAgence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
clients.forEach(c => insertClient.run(...c));

const insertInterv = db.prepare('INSERT INTO Intervention (NumeroIntervent, DateVisite, HeureVisite, Matricule, NumeroClient) VALUES (?, ?, ?, ?, ?)');
interventions.forEach(i => insertInterv.run(...i));

const insertMateriel = db.prepare('INSERT INTO Materiel (NumerodeSerie, Datedevente, DateInstallation, PrixdeVente, Emplacement, ReferenceInterne, NumerodeContrat, NumeroClient) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
materiels.forEach(m => insertMateriel.run(...m));

const insertControle = db.prepare('INSERT INTO Controler (NumeroIntervent, NumerodeSerie, TempsPasse, Commentaire) VALUES (?, ?, ?, ?)');
controles.forEach(c => insertControle.run(...c));

db.close();
console.log("Database initialized successfully.");
