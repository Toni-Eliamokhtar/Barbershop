# language: fr
Fonctionnalité: Paiement de réservation
  En tant que client
  Je veux payer ma réservation de manière sécurisée
  Pour finaliser mon rendez-vous

  Contexte:
    Soit une réservation en attente de paiement

  Scénario: Paiement par carte réussi
    Étant donné une réservation pour "25€"
    Quand je fournis un numéro de carte valide "4242424242424242"
    Et je fournis un CVC valide "123"
    Et je fournis une date d'expiration valide "12/25"
    Et je confirme le paiement
    Alors la transaction est acceptée
    Et la réservation est finalisée
    Et un reçu est généré
    Et le client reçoit une confirmation par email

  Scénario: Paiement rejeté - carte invalide
    Étant donné une réservation pour "25€"
    Quand je fournis un numéro de carte invalide "4000000000000002"
    Et je confirme le paiement
    Alors le paiement est rejeté
    Et un message d'erreur "Carte refusée" s'affiche
    Et la réservation reste en attente de paiement

  Scénario: Paiement rejeté - montant insuffisant
    Étant donné une réservation pour "25€"
    Quand je fournis une carte avec solde insuffisant
    Et je confirme le paiement
    Alors le paiement est rejeté
    Et un message d'erreur s'affiche
    Et je peux essayer avec une autre carte

  Scénario: Remboursement de paiement
    Étant donné une réservation annulée avec paiement effectué
    Quand le système traite le remboursement
    Alors le montant est recrédité
    Et un email de remboursement est envoyé
    Et le statut de la réservation est "remboursée"

  Scénario: Surcharge week-end appliquée
    Étant donné une réservation le samedi "2025-12-20"
    Et un service à "25€"
    Quand je confirme la réservation
    Alors le prix affiché inclut la surcharge week-end
    Et le montant total est "28,75€"
    Et le détail de la surcharge est visible

  Scénario: Paiement partial non autorisé
    Étant donné une réservation pour "25€"
    Quand je tente de payer "20€"
    Alors le paiement est rejeté
    Et un message "Montant insuffisant" s'affiche
    Et je dois payer le montant complet
