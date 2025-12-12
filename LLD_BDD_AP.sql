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

-- User1 --

-- User2 --

-------- Jeu d'essai --------

-- À refaire avec les données avec la bonne syntaxe --