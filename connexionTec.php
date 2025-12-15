<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Connexion</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .login-box {
            width: 500px;
            padding: 40px;
            border: 5px solid #000;
            border-radius: 20px;
            box-sizing: border-box;
        }

        .login-box h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 36px;
        }

        .avatar {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
        }

        .avatar img {
            width: 120px;
            height: 120px;
        }

        .field {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }

        .field label {
            width: 150px;
            font-size: 20px;
        }

        .field input {
            flex: 1;
            padding: 10px;
            font-size: 16px;
            border-radius: 15px;
            border: 1px solid #000;
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
        }

        .actions button {
            background-color: #0d8bff;
            color: white;
            border: none;
            padding: 12px 25px;
            font-size: 18px;
            border-radius: 15px;
            cursor: pointer;
        }

        .actions button:hover {
            background-color: #006edc;
        }

        .error {
            color: red;
            text-align: center;
            margin-top: 15px;
        }
    </style>
</head>
<body>

<div class="login-box">
    <h1>Se connecter</h1>

    <div class="avatar">
        <!-- icône simple, remplaçable -->
        <img src="user.png" alt="Utilisateur">
    </div>

    <form action="connexion.php" method="post">
        <div class="field">
            <label for="email">Email :</label>
            <input type="email" id="email" name="email" required>
        </div>

        <div class="field">
            <label for="password">Mot de passe :</label>
            <input type="password" id="password" name="password" required>
        </div>

        <div class="actions">
            <button type="submit">Connexion →</button>
        </div>
    </form>

    <!-- Message d'erreur éventuel -->
    <?php if (isset($_GET['error'])): ?>
        <div class="error">Identifiants incorrects</div>
    <?php endif; ?>
</div>

</body>
</html>
