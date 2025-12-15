<?php
require_once "database.php";  

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $raison_sociale = $_POST['raison_sociale'];
    $siren = $_POST['siren'];
    $code_ape = $_POST['code_ape'];
    $adresse = $_POST['adresse'];
    $telephone = $_POST['telephone'];
    $email = $_POST['email'];

    try {
        $stmt = $pdo->prepare("INSERT INTO Client (RaisonSociale, Siren, CodeApe, Adresse, TelephoneClient, Email) 
                               VALUES (:raison_sociale, :siren, :code_ape, :adresse, :telephone, :email)");

        $stmt->bindParam(':raison_sociale', $raison_sociale);
        $stmt->bindParam(':siren', $siren);
        $stmt->bindParam(':code_ape', $code_ape);
        $stmt->bindParam(':adresse', $adresse);
        $stmt->bindParam(':telephone', $telephone);
        $stmt->bindParam(':email', $email);

        $stmt->execute();

        echo "Le client a été enregistré avec succès.";
    } catch (PDOException $e) {
        echo "Erreur : " . $e->getMessage();
    }
}
?>