------------------- Programme -------------------

/* Le Programme ci-dessous va être utilisée pour
la création de la BDD de CashCash. On y retrouve
la création des différentes tables :

    - Client
    - Agence
    - Technicien
    - Employe
    - Intervention
    - TypeMateriel
    - Contrat
    - Gerant
    - Materiel
    - materielIntervention

On y retrouve aussi les définitions des users 
(User1 et User2) ainsi que leurs droits sur la 
BDD. 

------------------------------------------------
Code et commentaire :
            Lou KINOWSKI DESMIT
            Teo Durieux

MCD :
            Lou KINOWSKI DESMIT
            Lucas DUTHOIT
            Teo DURIEUX
------------------------------------------------
*/

-------- Création des différentes table --------

CREATE TABLE Employé(
   Matricule INT,
   NomEmploye VARCHAR(50),
   PrenomEmploye VARCHAR(50),
   AdresseEmploye VARCHAR(70),
   DateEmbauche DATE,
   PRIMARY KEY(Matricule)
);

CREATE TABLE Agence(
   idAgence Varchar(5),
   Nomagence VARCHAR(50),
   TelephoneAgence Varchar(10),
   Adresseagence VARCHAR(50),
   PRIMARY KEY(idAgence)
);

CREATE TABLE Client(
   NumeroClient INT,
   RaisonSociale VARCHAR(60),
   Siren INT,
   CodeApe Varchar(5),
   Adresse VARCHAR(70),
   TelephoneClient Varchar(10),
   Email VARCHAR(50),
   DureeDeplacement TIME,
   DistanceKM INT,
   idAgence Varchar (5),
   PRIMARY KEY(NumeroClient),
   FOREIGN KEY(idAgence) REFERENCES Agence(idAgence)
);

CREATE TABLE TypeContrat(
   RefTypeContrat INT,
   DelaiIntervention TIME,
   TauxApplicable DECIMAL(15,2),
   PRIMARY KEY(RefTypeContrat)
);

CREATE TABLE TypeMateriel(
   ReferenceInterne INT,
   LibelleTypemateriel VARCHAR(50),
   PRIMARY KEY(ReferenceInterne)
);

CREATE TABLE Technicien(
   Matricule INT,
   TelephoneMobile Varchar(10),
   Qualification VARCHAR(60),
   DateObtention DATE,
   idAgence Varchar(5),
   PRIMARY KEY(Matricule),
   FOREIGN KEY(Matricule) REFERENCES Employé(Matricule),
   FOREIGN KEY(idAgence) REFERENCES Agence(idAgence)
);

CREATE TABLE Intervention(
   NumeroIntervent INT,
   DateVisite DATE,
   HeureVisite TIME,
   Matricule INT NOT NULL,
   NumeroClient INT NOT NULL,
   PRIMARY KEY(NumeroIntervent),
   FOREIGN KEY(Matricule) REFERENCES Technicien(Matricule),
   FOREIGN KEY(NumeroClient) REFERENCES Client(NumeroClient)
);

CREATE TABLE Contratdemaintenance(
   NumerodeContrat INT,
   DateSignature DATE,
   DateEcheance DATE,
   NumeroClient INT NOT NULL,
   RefTypeContrat INT NOT NULL,
   PRIMARY KEY(NumerodeContrat),
   UNIQUE(NumeroClient),
   FOREIGN KEY(NumeroClient) REFERENCES Client(NumeroClient),
   FOREIGN KEY(RefTypeContrat) REFERENCES TypeContrat(RefTypeContrat)
);

CREATE TABLE Materiel(
   NumerodeSerie INT,
   Datedevente DATE,
   DateInstallation DATETIME,
   PrixdeVente CURRENCY,
   Emplacement VARCHAR(50),
   ReferenceInterne INT NOT NULL,
   NumerodeContrat INT,
   NumeroClient INT NOT NULL,
   PRIMARY KEY(NumerodeSerie),
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



-------- Définition des utilisateurs et attribution des droits --------

-- Role Manager : Select, Insert, Delete --

-- Role Dev : All --

-- Utilisateur Manager
CREATE USER 'manager1'@'%' IDENTIFIED BY 'ManagerPwd123!';
GRANT 'manager_role' TO 'manager1';

-- Utilisateur Dev
CREATE USER 'dev1'@'%' IDENTIFIED BY 'DevPwd123!';
GRANT 'dev_role' TO 'dev1';

SET DEFAULT ROLE 'manager_role' TO 'manager1';
SET DEFAULT ROLE 'dev_role' TO 'dev1';



-------- Jeu d'essai --------

-- ========== AGENCES ==========
INSERT INTO Agence(idAgence, Nomagence, TelephoneAgence, Adresseagence) VALUES
('59ARM', 'Agence Lille - Armentières', '0320456789', '12 rue du Commerce, 59100 Armentières'),
('68MUL', 'Agence Mulhouse', '0389754123', '3 place de la République, 68100 Mulhouse'),
('76ROU', 'Agence Rouen', '0235678901', '5 avenue du Port, 76000 Rouen');
("34MON", "Agence Montpellier", "0624021144", "1925 Rue Saint-Priest, 34185 Montpellier");

-- ========== EMPLOYÉS ==========
INSERT INTO Employé(Matricule, NomEmploye, PrenomEmploye, AdresseEmploye, DateEmbauche) VALUES
(1001, 'DUPONT', 'Claire', '4 rue des Écoles, 59000 Lille', '2008-06-15'),
(1002, 'MARTIN', 'Julien', '22 rue Verte, 68100 Mulhouse', '2015-09-01'),
(1003, 'LEFEVRE', 'Sophie', '10 boulevard Victor, 76000 Rouen', '2020-03-20');
(1004, 'GIRARD', 'Maxime', '12 rue des Lilas, 59110 La Madeleine', '2012-04-18'),
(1005, 'ROUSSEL', 'Amélie', '7 rue du Stade, 68270 Wittenheim', '2018-10-09');

-- ========== TECHNICIENS (référence Employé.Matricule) ==========
INSERT INTO Technicien(Matricule, TelephoneMobile, Qualification, DateObtention, idAgence) VALUES
(1001, '0612345678', 'Niveau 2 - Réseau', '2009-05-10', '59ARM'),
(1002, '0623456789', 'Niveau 3 - Électrique', '2016-11-22', '68MUL'),
(1003, '0634567890', 'Niveau 2 - Systèmes', '2020-04-15', '76ROU');
(1004, '0645678912', 'Niveau 1 - Maintenance', '2013-05-12', '59ARM'),
(1005, '0656789123', 'Niveau 3 - Réseau avancé', '2019-11-03', '68MUL');

-- ========== TYPE CONTRAT ==========
INSERT INTO TypeContrat(RefTypeContrat, DelaiIntervention, TauxApplicable) VALUES
(1, '04:00:00', 75.00),
(2, '02:00:00', 95.00),
(3, '08:00:00', 120.00);

-- ========== TYPE MATERIEL ==========
INSERT INTO TypeMateriel(ReferenceInterne, LibelleTypemateriel) VALUES
(10, 'Imprimante thermique modèle A'),
(20, 'Lecteur de codes-barres série X'),
(30, 'Terminal de paiement TPV Pro');

-- ========== CLIENTS ==========
-- NumeroClient simulé depuis UUID -> valeurs entières uniques (9 chiffres)
INSERT INTO Client(NumeroClient, RaisonSociale, Siren, CodeApe, Adresse, TelephoneClient, Email, DureeDeplacement, DistanceKM, idAgence) VALUES
(132547890, 'Boulangerie du Centre', 123456789, '5610A', '8 rue du Marché, 59100 Lille', '0320223344', 'contact@boulangerie-centre.fr', '01:15:00', 18, '59ARM'),
(214365879, 'Supermarché Mulhouse Sud', 987654321, '4711B', '14 rue du Commerce, 68200 Mulhouse', '0389765432', 'contact@sm-mulhouse.fr', '00:45:00', 12, '68MUL'),
(198765432, 'Cabinet Médical Rouen', 111222333, '8622C', '2 rue des Acacias, 76000 Rouen', '0234567890', 'secretariat@cabinet-rouen.fr', '00:30:00', 7, '76ROU'),
(123456789, 'Atelier Informatique Lille', 192837465, '6202A', '20 avenue Jean Jaurès, 59000 Lille', '0320112233', 'atelier@it-lille.fr', '00:50:00', 15, '59ARM');
(345678912, 'Garage du Moulin', 567123890, '4520B', '15 rue du Moulin, 59130 Lambersart', '0320445566', 'contact@garagemoulin.fr', '00:40:00', 10, '59ARM'),
(456789123, 'Pharmacie Centrale Mulhouse', 781234569, '4773Z', '5 avenue Kennedy, 68200 Mulhouse', '0389761200', 'info@pharmacie-mulhouse.fr', '00:30:00', 8, '68MUL'),
(567891234, 'Restaurant Le Havre d Or', 912345678, '5610C', '9 quai Corneille, 76000 Rouen', '0235679911', 'contact@havredor.fr', '00:25:00', 6, '76ROU'),
(678912345, 'Opticien Vision Plus', 456789123, '4778A', '22 rue Nationale, 59800 Lille', '0320349988', 'contact@visionplus-lille.fr', '01:10:00', 20, '59ARM'),
(789123456, 'Entreprise Duval & Fils', 123987456, '7020B', '10 rue des Cerisiers, 68300 Saint-Louis', '0389423344', 'contact@duval-fils.fr', '00:50:00', 14, '68MUL'),
(891234567, 'Menuiserie des Sapins', 789654123, '1623Z', '3 chemin des Sapins, 76100 Rouen', '0235621144', 'menuiserie@sapins.fr', '00:35:00', 9, '76ROU'),
(912345678, 'Boucherie Lambert', 192837465, '4722A', '6 rue du Parc, 59350 Saint-André', '0320548877', 'contact@boucherie-lambert.fr', '00:45:00', 16, '59ARM'),
(234567891, 'Auto École Horizon', 345678901, '8553B', '18 rue des Fleurs, 68400 Riedisheim', '0389624455', 'contact@horizon-ae.fr', '00:40:00', 11, '68MUL'),
(321654987, 'Clinique Saint-Charles', 912678543, '8610A', '27 rue Saint-Charles, 76000 Rouen', '0235894411', 'contact@clinique-sc.fr', '00:20:00', 5, '76ROU'),
(147258369, 'Brasserie Les Trois Lions', 753951456, '5630B', '11 place du Général, 59000 Lille', '0320157788', 'contact@troislions.fr', '01:05:00', 17, '59ARM');

-- ========== CONTRATS DE MAINTENANCE ==========
-- NumerodeContrat : valeurs entières uniques simulant UUID
-- DateEcheance = DateSignature + 1 an
INSERT INTO Contratdemaintenance(NumerodeContrat, DateSignature, DateEcheance, NumeroClient, RefTypeContrat) VALUES
(400000001, '2023-07-12', '2024-07-12', 132547890, 1),
(400000002, '2024-11-20', '2025-11-20', 214365879, 2),
(400000003, '2022-03-01', '2023-03-01', 198765432, 1),
(400000004, '2025-01-15', '2026-01-15', 123456789, 3),
(400000005, '2023-09-10', '2024-09-10', 345678912, 1),
(400000006, '2024-02-18', '2025-02-18', 456789123, 2),
(400000007, '2023-06-25', '2024-06-25', 567891234, 1),
(400000008, '2024-08-07', '2025-08-07', 678912345, 3),
(400000009, '2022-11-30', '2023-11-30', 789123456, 2),
(400000010, '2023-04-12', '2024-04-12', 891234567, 1),
(400000011, '2024-03-05', '2025-03-05', 912345678, 3),
(400000012, '2023-10-22', '2024-10-22', 234567891, 1),
(400000013, '2024-06-14', '2025-06-14', 321654987, 2),
(400000014, '2025-01-04', '2026-01-04', 147258369, 1);

-- ========== MATERIEL ==========
-- NumerodeSerie int, DateInstallation DATETIME, PrixdeVente (valeur numérique)
INSERT INTO Materiel(NumerodeSerie, Datedevente, DateInstallation, PrixdeVente, Emplacement, ReferenceInterne, NumerodeContrat, NumeroClient) VALUES
(50001, '2023-06-20', '2023-06-21 09:30:00', 450.00, 'Backoffice - rayon caisse', 10, 400000001, 132547890),
(50002, '2024-10-10', '2024-10-12 14:00:00', 1290.00, 'Comptoir principal', 30, 400000002, 214365879),
(50003, '2021-02-01', '2021-02-02 11:15:00', 220.00, 'Cabinet 2 - salle 1', 20, 400000003, 198765432),
(50004, '2025-07-30', '2025-08-01 08:45:00', 450.00, 'Atelier - poste 3', 10, 400000004, 123456789),
(50005, '2020-12-12', '2021-01-10 10:00:00', 130.00, 'Stock - pièce 4', 20, NULL, 132547890);
(50006, '2022-03-15', '2022-03-16 10:20:00', 320.00, 'Zone stockage — étagère 2', 10, 400000005, 132547890),
(50007, '2023-11-05', '2023-11-07 15:45:00', 980.00, 'Accueil — borne 1', 30, 400000006, 214365879),
(50008, '2024-01-22', '2024-01-23 09:10:00', 150.00, 'Salle consultation 3', 20, NULL, 198765432),
(50009, '2023-08-14', '2023-08-15 13:30:00', 540.00, 'Atelier — banc test 2', 10, 400000007, 123456789),
(50010, '2022-10-01', '2022-10-03 11:00:00', 260.00, 'Réserve — rack B4', 20, 400000008, 214365879),
(50011, '2025-02-18', '2025-02-20 08:15:00', 1120.00, 'Salle informatique — baie serveur', 30, NULL, 123456789);

-- ========== INTERVENTIONS ==========
-- NumeroIntervent au format YYYYMMXXXX (entier) ; exemple : 2025110001
INSERT INTO Intervention(NumeroIntervent, DateVisite, HeureVisite, Matricule, NumeroClient) VALUES
(2025110001, '2025-11-15', '09:00:00', 1001, 132547890),
(2025090052, '2025-09-18', '14:30:00', 1002, 214365879),
(2025070003, '2025-07-02', '08:30:00', 1003, 198765432),
(2025110004, '2025-11-03', '10:15:00', 1001, 123456789);
(2025010002, '2025-01-28', '11:10:00', 1004, 345678912),
(2025020001, '2025-02-10', '15:45:00', 1002, 456789123),
(2025020002, '2025-02-22', '09:20:00', 1005, 567891234),
(2025030001, '2025-03-05', '13:55:00', 1001, 678912345),
(2025030002, '2025-03-18', '10:40:00', 1003, 789123456),
(2025040001, '2025-04-03', '09:00:00', 1005, 891234567),
(2025040002, '2025-04-17', '16:15:00', 1004, 912345678),
(2025050001, '2025-05-09', '08:45:00', 1002, 234567891),
(2025050002, '2025-05-21', '14:10:00', 1001, 321654987),
(2025060001, '2025-06-02', '11:50:00', 1003, 147258369),
(2025060002, '2025-06-25', '15:30:00', 1004, 345678912),
(2025070004, '2025-07-15', '10:00:00', 1005, 456789123),
(2025080001, '2025-08-01', '13:25:00', 1002, 567891234),
(2025080002, '2025-08-19', '09:50:00', 1001, 678912345),
(2025090060, '2025-09-05', '14:40:00', 1003, 789123456),
(2025090061, '2025-09-22', '16:00:00', 1004, 891234567),
(2025100005, '2025-10-04', '10:20:00', 1005, 912345678),
(2025100006, '2025-10-19', '08:35:00', 1002, 234567891),
(2025110005, '2025-11-06', '11:25:00', 1003, 321654987),
(2025110006, '2025-11-18', '14:55:00', 1004, 147258369);

-- ========== CONTROLER (liaison Intervention <-> Materiel) ==========
INSERT INTO Controler(NumeroIntervent, NumerodeSerie, TempsPasse, Commentaire) VALUES
(2025110001, 50001, '00:45:00', 'Remplacement bobine, test OK'),
(2025090052, 50002, '01:20:00', 'Mise à jour firmware, calibrage effectué'),
(2025070003, 50003, '00:30:00', 'Nettoyage tête lecture, recalibration'),
(2025110004, 50004, '00:55:00', 'Installation et configuration initiale'),
(2025110001, 50005, '00:25:00', 'Diagnostic stockage, remplacement câble');
(2025110005, 50006, '00:35:00', 'Réglage capteur thermique'),
(2025110005, 50007, '00:20:00', 'Test alimentation, RAS'),
(2025100010, 50008, '01:10:00', 'Remplacement ventilateur interne'),
(2025100010, 50009, '00:45:00', 'Nettoyage général et resserrage connectiques'),
(2025120007, 50010, '00:55:00', 'Mise à jour logiciel interne'),
(2025120007, 50011, '00:30:00', 'Contrôle batterie, aucune anomalie'),
(2025080020, 50012, '00:25:00', 'Diagnostic rapide, panne non reproduite'),
(2025080020, 50013, '00:50:00', 'Reconfiguration réseau'),
(2025110006, 50014, '01:15:00', 'Remplacement écran tactile'),
(2025110006, 50015, '00:40:00', 'Test complet post-réparation'),
(2025100009, 50016, '00:45:00', 'Problème de capteur résolu'),
(2025100009, 50017, '00:30:00', 'Nettoyage interne'),
(2025090053, 50018, '00:35:00', 'Réglage tension alimentation'),
(2025090053, 50019, '00:25:00', 'Vérification câblage interne'),
(2025110008, 50020, '01:05:00', 'Remplacement carte mère'),
(2025110008, 50021, '00:20:00', 'Test des modules, tout OK'),
(2025070004, 50022, '00:30:00', 'Entretien standard annuel'),
(2025070004, 50023, '00:45:00', 'Changement pièce usée'),
(2025110009, 50024, '00:40:00', 'Mise à jour sécurité'),
(2025110009, 50025, '00:15:00', 'Test de fin d’intervention');