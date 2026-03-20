$(document).ready(function () {
    $('#login-form').on('submit', function (e) {
        e.preventDefault();

        const matricule = $('#matricule').val();
        const password = $('#password').val();
        const errorDiv = $('#login-error');
        const btn = $('#btn-login');
        const btnText = btn.find('.btn-text');
        const spinner = btn.find('.spinner');

        // Hide error
        errorDiv.removeClass('visible').text('');
        btn.prop('disabled', true);
        btnText.hide();
        spinner.show();

        // Prepare request
        $.ajax({
            url: 'http://localhost:3000/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ matricule, password }),
            success: function (response) {
                // Successful real login
                localStorage.setItem('cashcash_token', response.token);
                localStorage.setItem('cashcash_user', JSON.stringify(response));

                setTimeout(() => {
                    window.location.href = 'interventions.html';
                }, 500);
            },
            error: function (xhr, status, error) {
                // Feature for Demo (if Node backend is not running)
                if (xhr.status === 0) {
                    // Simulate login if there's no server (for prototype presentation)
                    if (password === 'password123') {
                        let mockupUser = null;
                        if (matricule === '1001') mockupUser = { role: 'technicien', nom: 'DUPONT', prenom: 'Claire', matricule: 1001, token: 'mock-token-tech' };
                        else if (matricule === '2001') mockupUser = { role: 'gestionnaire', nom: 'BERNARD', prenom: 'Paul', matricule: 2001, token: 'mock-token-manager' };

                        if (mockupUser) {
                            localStorage.setItem('cashcash_token', mockupUser.token);
                            localStorage.setItem('cashcash_user', JSON.stringify(mockupUser));
                            setTimeout(() => {
                                window.location.href = 'interventions.html';
                            }, 500);
                            return;
                        }
                    }

                    showError("Serveur injoignable. Démo locale : matricule 1001 ou 2001, MDP : password123");
                } else {
                    const msg = xhr.responseJSON ? xhr.responseJSON.error : 'Erreur de connexion';
                    showError(msg);
                }
            }
        });

        function showError(msg) {
            btn.prop('disabled', false);
            spinner.hide();
            btnText.show();
            errorDiv.text(msg).addClass('visible');
        }
    });

    // Check if already logged in (Only redirect if not already on interventions page)
    if (localStorage.getItem('cashcash_token')) {
        if (!window.location.href.includes('interventions.html')) {
            window.location.href = 'interventions.html';
        }
    }
});
