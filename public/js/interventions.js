$(document).ready(function () {
    const userJson = localStorage.getItem('cashcash_user');
    if (!userJson) {
        window.location.href = 'index.html';
        return;
    }
    const user = JSON.parse(userJson);
    const API_URL = 'http://localhost:3000/api';

    // UI Initialization
    $('#user-name').text(user.prenom + ' ' + user.nom);
    $('#user-role').text(user.role);
    $('#user-avatar').text(user.prenom[0] + user.nom[0]);

    if (user.role === 'gestionnaire') {
        $('#tab-stats').show();
        $('#filter-tech').show();
        $('#btn-create-intervention').show();
    }

    // Logout
    $('#btn-logout').on('click', function () {
        localStorage.removeItem('cashcash_token');
        localStorage.removeItem('cashcash_user');
        window.location.href = 'index.html';
    });

    // Navigation Tabs
    $('#tab-interventions').on('click', function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        $('#view-stats').hide();
        $('#view-interventions').fadeIn();
        loadInterventions();
    });

    $('#tab-stats').on('click', function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        $('#view-interventions').hide();
        $('#view-stats').fadeIn();
        loadStats();
    });

    // Load Data
    function loadInterventions() {
        $('#interventions-body').html('<tr><td colspan="6" style="text-align:center;">Chargement...</td></tr>');

        const dateFilter = $('#filter-date').val();
        const techFilter = $('#filter-tech').val();

        let url = API_URL + '/interventions';
        let query = [];
        if (dateFilter) query.push('date=' + encodeURIComponent(dateFilter));
        if (techFilter && user.role === 'gestionnaire') query.push('technicien=' + encodeURIComponent(techFilter));
        if (query.length) url += '?' + query.join('&');

        $.ajax({
            url: url,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + user.token },
            success: function (data) {
                renderInterventions(data);
            },
            error: function (xhr) {
                // Mockup Fallback
                if (xhr.status === 0) {
                    const mocks = [
                        { NumeroIntervent: 2025110001, DateVisite: '2025-11-15', HeureVisite: '09:00:00', RaisonSociale: 'Boulangerie du Centre', AdresseClient: '8 rue du Marche, Lille', DistanceKM: 18, TechMatricule: 1001, TechNom: 'DUPONT', TechPrenom: 'Claire' },
                        { NumeroIntervent: 2025110004, DateVisite: '2025-11-03', HeureVisite: '10:15:00', RaisonSociale: 'Atelier Informatique Lille', AdresseClient: '20 avenue Jean Jaures', DistanceKM: 15, TechMatricule: 1001, TechNom: 'DUPONT', TechPrenom: 'Claire' },
                        { NumeroIntervent: 2025090052, DateVisite: '2025-09-18', HeureVisite: '14:30:00', RaisonSociale: 'Supermarché Mulhouse Sud', AdresseClient: '14 rue du Commerce', DistanceKM: 12, TechMatricule: 1002, TechNom: 'MARTIN', TechPrenom: 'Julien' }
                    ];
                    // local filter demo:
                    let filtered = mocks;
                    if (user.role === 'technicien') filtered = mocks.filter(m => m.TechMatricule === user.matricule);
                    else if (techFilter) filtered = mocks.filter(m => m.TechMatricule == techFilter);

                    if (dateFilter) filtered = filtered.filter(m => m.DateVisite === dateFilter);

                    // sorting closest first
                    filtered.sort((a, b) => a.DistanceKM - b.DistanceKM);

                    renderInterventions(filtered);
                } else {
                    $('#interventions-body').html(`<tr><td colspan="6" style="color:#EF4444;">Erreur serveur</td></tr>`);
                }
            }
        });
    }

    function renderInterventions(data) {
        const tbody = $('#interventions-body');
        tbody.empty();

        if (!data || data.length === 0) {
            tbody.html('<tr><td colspan="6" style="text-align:center;">Aucune intervention trouvée.</td></tr>');
            return;
        }

        data.forEach(i => {
            const tr = $('<tr>');
            tr.html(`
                <td><strong>#${i.NumeroIntervent}</strong></td>
                <td>${i.DateVisite} <span style="color:#94A3B8;font-size:12px;">${i.HeureVisite}</span></td>
                <td><strong>${i.RaisonSociale}</strong><br><span style="color:#94A3B8;font-size:12px;">${i.AdresseClient}</span></td>
                <td>${i.DistanceKM != null ? i.DistanceKM + ' km' : '-'}</td>
                <td>${i.TechPrenom} ${i.TechNom} (ID: ${i.TechMatricule})</td>
                <td>
                    <button class="action-btn btn-open" data-id="${i.NumeroIntervent}">Consulter / Valider</button>
                </td>
            `);
            tbody.append(tr);
        });

        $('.btn-open').on('click', function () {
            openInterventionModal($(this).data('id'));
        });
    }

    // Modal logic
    function openInterventionModal(id) {
        $('#intervention-modal').addClass('active');
        $('#modal-id').text(id);
        $('#modal-materiels').html('<p>Chargement...</p>');

        $.ajax({
            url: API_URL + '/interventions/' + id,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + user.token },
            success: function (data) {
                fillModalData(data);
            },
            error: function (xhr) {
                if (xhr.status === 0) {
                    // Mock fallback
                    fillModalData({
                        NumeroIntervent: id, DateVisite: '2025-11-15', HeureVisite: '09:00:00',
                        RaisonSociale: 'Boulangerie du Centre', AdresseClient: '8 rue du Marche',
                        NomEmploye: 'DUPONT', PrenomEmploye: 'Claire',
                        materiels: [
                            { NumerodeSerie: 50001, LibelleTypemateriel: 'Imprimante', Emplacement: 'Caisse', TempsPasse: '00:45:00', Commentaire: 'Remplacement bobine' }
                        ]
                    });
                }
            }
        });
    }

    function fillModalData(data) {
        $('#modal-client').text(data.RaisonSociale);
        $('#modal-address').text(data.AdresseClient);
        $('#modal-date').text(data.DateVisite + ' ' + data.HeureVisite);
        $('#modal-tech').text('Technicien: ' + data.PrenomEmploye + ' ' + data.NomEmploye);

        const list = $('#modal-materiels');
        list.empty();

        if (!data.materiels || data.materiels.length === 0) {
            list.html('<p>Aucun matériel couvert testé.</p>');
            return;
        }

        data.materiels.forEach(m => {
            const card = $('<div class="materiel-card">');

            // editable only if technician
            const isManager = user.role === 'gestionnaire';
            const disableInputs = isManager ? 'disabled' : '';

            card.html(`
                <div class="materiel-header">
                    <span>${m.LibelleTypemateriel}</span>
                    <span style="color:var(--text-muted);font-size:12px;">S/N: ${m.NumerodeSerie} | ${m.Emplacement}</span>
                </div>
                <div class="materiel-form no-print">
                    <input type="time" class="filter-input t-passe" value="${m.TempsPasse || ''}" placeholder="Temps" ${disableInputs}>
                    <input type="text" class="filter-input t-comment" value="${m.Commentaire || ''}" placeholder="Commentaire" ${disableInputs}>
                    ${!isManager ? `<button class="btn-save" data-id="${data.NumeroIntervent}" data-serie="${m.NumerodeSerie}">✔</button>` : ''}
                </div>
                <div style="display:none;" class="print-only">
                    Temps passé: ${m.TempsPasse || 'N/A'}<br>
                    Commentaire: ${m.Commentaire || 'N/A'}
                </div>
            `);
            list.append(card);
        });

        $('.btn-save').on('click', function () {
            const btn = $(this);
            const card = btn.closest('.materiel-card');
            const temps = card.find('.t-passe').val() + ':00'; // formatting to time
            const comment = card.find('.t-comment').val();
            const idInt = btn.data('id');
            const idSerie = btn.data('serie');

            btn.text('...');
            $.ajax({
                url: API_URL + '/interventions/' + idInt + '/controler/' + idSerie,
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + user.token },
                contentType: 'application/json',
                data: JSON.stringify({ tempsPasse: temps, commentaire: comment }),
                success: function () { btn.text('✔').css('background', '#34D399'); },
                error: function (xhr) {
                    if (xhr.status === 0) btn.text('✔').css('background', '#34D399'); // demo override
                    else alert('Erreur lors de la sauvegarde');
                }
            });
        });
    }

    $('.close-modal').on('click', function () {
        $('#intervention-modal').removeClass('active');
    });

    // PDF Generation using html2pdf
    $('#btn-pdf').on('click', function () {
        // hide buttons and forms for clean print
        $('.no-print').hide();
        $('.print-only').show();

        const element = document.getElementById('printable-area');
        const opt = {
            margin: 1,
            filename: 'Intervention_CashCash.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // restore view
            $('.no-print').show();
            $('.print-only').hide();
        });
    });

    // Stats Logic (Managers only)
    function loadStats() {
        const month = $('#filter-month').val() || '2025-11';
        $('#stats-body').html('<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>');

        $.ajax({
            url: API_URL + '/stats?month=' + encodeURIComponent(month),
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + user.token },
            success: function (data) {
                renderStats(data);
            },
            error: function (xhr) {
                // Mockup fallback
                if (xhr.status === 0) {
                    renderStats([
                        { Matricule: 1001, NomEmploye: 'DUPONT', PrenomEmploye: 'Claire', NbInterventions: 12, KmParcourus: 340, DureeMinutes: 450 },
                        { Matricule: 1002, NomEmploye: 'MARTIN', PrenomEmploye: 'Julien', NbInterventions: 8, KmParcourus: 200, DureeMinutes: 320 }
                    ]);
                }
            }
        });
    }

    function renderStats(data) {
        const tbody = $('#stats-body');
        tbody.empty();

        if (!data || data.length === 0) {
            tbody.html('<tr><td colspan="5" style="text-align:center;">Aucune donnée statistique pour ce mois.</td></tr>');
            return;
        }

        data.forEach(s => {
            const tr = $('<tr>');
            tr.html(`
                <td><strong>${s.Matricule}</strong></td>
                <td>${s.PrenomEmploye} ${s.NomEmploye}</td>
                <td><span class="status-badge status-done">${s.NbInterventions}</span></td>
                <td>${s.KmParcourus || 0} km</td>
                <td>${s.DureeMinutes || 0} min</td>
            `);
            tbody.append(tr);
        });
    }

    $('#btn-refresh').on('click', loadInterventions);
    $('#filter-date, #filter-tech').on('change', loadInterventions);
    $('#btn-refresh-stats').on('click', loadStats);
    $('#filter-month').on('change', loadStats);

    // Create Intervention Logic
    $('#btn-create-intervention').on('click', function () {
        $('#create-intervention-modal').addClass('active');
        $('#form-create-intervention')[0].reset();
        $('#create-error').removeClass('visible').text('');
    });

    $('#close-create-modal').on('click', function () {
        $('#create-intervention-modal').removeClass('active');
    });

    $('#form-create-intervention').on('submit', function (e) {
        e.preventDefault();

        const NumeroClient = $('#create-client').val();
        const DateVisite = $('#create-date').val();
        const HeureVisite = $('#create-time').val() + ':00';
        const Matricule = $('#create-tech').val();

        const btnText = $('#btn-submit-create .btn-text');
        const spinner = $('#btn-submit-create .spinner');
        $('#btn-submit-create').prop('disabled', true);
        btnText.hide(); spinner.show();

        const payload = { NumeroClient, DateVisite, HeureVisite, Matricule };

        $.ajax({
            url: API_URL + '/interventions',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Authorization': 'Bearer ' + user.token },
            data: JSON.stringify(payload),
            success: function () {
                $('#create-intervention-modal').removeClass('active');
                loadInterventions(); // reload
                $('#btn-submit-create').prop('disabled', false);
                btnText.show(); spinner.hide();
            },
            error: function (xhr) {
                // Mock fallback handling
                if (xhr.status === 0) {
                    $('#create-intervention-modal').removeClass('active');
                    alert('Simulation: Intervention créée avec succès (mode hors ligne)');
                    // Cannot easily inject mock here without rewriting mock structure, 
                    // relying on alert for demo
                    $('#btn-submit-create').prop('disabled', false);
                    btnText.show(); spinner.hide();
                } else {
                    $('#create-error').addClass('visible').text(xhr.responseJSON?.error || 'Erreur');
                    $('#btn-submit-create').prop('disabled', false);
                    btnText.show(); spinner.hide();
                }
            }
        });
    });

    // Add extra CSS dynamically for prints inside the script
    $('<style>.print-only { display: none; margin-top: 10px; font-size: 14px; }</style>').appendTo('head');

    // Init 
    loadInterventions();
});
