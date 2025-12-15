<?php
session_start();

$host = "localhost";
$dbname = "LLD_BDD_AP";
$user = "ton_user";
$pass = "ton_mot_de_passe";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("Erreur connexion BDD");
}

if (!isset($_POST['email'], $_POST['password'])) {
    header("Location: connexion.html");
    exit;
}

$email = $_POST['email'];
$password = $_POST['password'];

$sql = "SELECT id, password FROM users WHERE email = :email";
$stmt = $pdo->prepare($sql);
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    header("Location: dashboard.php");
    exit;
} else {
    header("Location: connexion.html?error=1");
    exit;
}
