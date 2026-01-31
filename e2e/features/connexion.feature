Feature: Connexion des utilisateurs
    Pour accéder à mon espace privé
    En tant qu'utilisateur enregistré
    Je veux m'authentifier avec mes identifiants

    Background:
        Given Je suis sur la page de connexion

    Scenario: Connexion réussie en tant qu'admin
        Given J'ai un compte admin nouvellement créé
        When Je remplis le champ email avec un compte admin
        And Je rentre mon mot de passe avec un compte admin
        And J'appuie sur le bouton "Se connecter"
        Then L'utilisateur est redirigé sur l'écran principal
        And L'utilisateur est connecté en tant qu'admin
        And L'admin a accès aux pages de modification, d'ajout de joueurs et d'évènements.

    Scenario: Connexion échouée pour faute de mail non conforme en tant qu'admin
        When Je remplis le champ email avec un mail non conforme
        And Je rentre mon mot de passe avec un compte admin
        And J'appuie sur le bouton "Se connecter"
        Then Le message "L'email n'est pas valide" s'affiche
        And La bordure du champ email devient rouge
        And L'accès à la plateforme n'est pas autorisé

    Scenario: Connexion échouée pour faute de mot de passe en tant qu'admin
        Given J'ai un compte admin nouvellement créé
        When Je remplis le champ email avec un compte admin
        And Je rentre un mauvais mot de passe
        And J'appuie sur le bouton "Se connecter"
        Then L'accès à la plateforme n'est pas autorisé
        And La connexion a échouée
        And Un compteur expliquant qu'il reste 4 tentatives restantes s'affiche

    Scenario: Connexion échouée pour faute de mail non renseigné en tant qu'admin
        When Je laisse le champ email vide
        And Je rentre mon mot de passe avec un compte admin
        And J'appuie sur le bouton "Se connecter"
        Then La bordure du champ email devient rouge
        And Le message "L'email n'est pas valide" s'affiche

    Scenario: Connexion échouée pour faute de mot de passe non renseigné en tant qu'admin
        When Je remplis le champ email avec "admin@test.com"
        And Je laisse le champ mot de passe vide
        And J'appuie sur le bouton "Se connecter"
        Then Le message "Le mot de passe doit contenir au moins 12 caractères" s'affiche
        And La bordure du champ mot de passe devient rouge

    Scenario: Connexion échouée après 5 tentatives en tant qu'admin
        When L'admin a tenté de se connecter 5 fois avec les mauvaises credentiels
        Then La connexion au compte admin est verrouillé
        And Le temps restant avant le déblocage du compte est affiché
        And Le message "Compte verrouillé" s'affiche

    Scenario: Connexion échouée pour faute de mot de passe non renseigné en tant que joueur
        Given J'ai un compte joueur nouvellement créé
        When Je remplis le champ email avec un compte joueur
        And Je laisse le champ mot de passe vide
        And J'appuie sur le bouton "Se connecter"
        Then La bordure du champ mot de passe devient rouge
        And Le message "Le mot de passe doit contenir au moins 12 caractères" s'affiche

    Scenario: Connexion réussie en tant que joueur
        Given J'ai un compte joueur nouvellement créé
        When Je remplis le champ email avec un compte joueur
        And Je rentre mon mot de passe avec un compte joueur
        And J'appuie sur le bouton "Se connecter"
        Then L'utilisateur est redirigé sur l'écran principal
        And L'utilisateur est connecté en tant que joueur
        And Le joueur n'a pas accès aux onglets pour l'admin

    Scenario: Connexion échouée pour faute de mail non conforme en tant que joueur
        When Je remplis le champ email avec un mail non conforme
        And Je rentre mon mot de passe avec un compte joueur
        And J'appuie sur le bouton "Se connecter"
        Then Le message "L'email n'est pas valide" s'affiche
        And La bordure du champ email devient rouge
        And L'accès à la plateforme n'est pas autorisé

    Scenario: Connexion échouée pour faute de mot de passe en tant que joueur
        Given J'ai un compte joueur nouvellement créé
        When Je remplis le champ email avec un compte joueur
        And Je rentre un mauvais mot de passe
        And J'appuie sur le bouton "Se connecter"
        Then La connexion a échouée
        And Un compteur expliquant qu'il reste 4 tentatives restantes s'affiche
        And L'accès à la plateforme n'est pas autorisé

    Scenario: Connexion échouée pour faute de mail non renseigné en tant que joueur
        When Je laisse le champ email vide
        And Je rentre mon mot de passe avec un compte joueur
        And J'appuie sur le bouton "Se connecter"
        Then La bordure du champ email devient rouge
        And Le message "L'email n'est pas valide" s'affiche

    Scenario: Connexion échouée après 5 tentatives en tant que joueur
        Given J'ai un compte joueur nouvellement créé
        When Le joueur a tenté de se connecter 5 fois avec les mauvaises credentiels
        Then La connexion au compte joueur est verrouillé
        And Le temps restant avant le déblocage du compte est affiché
        And Le message "Compte verrouillé" s'affiche