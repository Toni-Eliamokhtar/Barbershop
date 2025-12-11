# language: fr
Fonctionnalité: Réservation chez le barbier
  En tant que client
  Je veux réserver un créneau chez un barbier
  Pour obtenir une coupe ou un service

  Contexte:
    Soit des barbiers disponibles
    Et des services proposés

  Scénario: Réservation réussie avec paiement
    Étant donné que je suis un client non authentifié
    Quand je sélectionne un barbier disponible
    Et je choisis un service "Coupe classique" à 25€
    Et je réserve pour "2025-12-20" à "14:00"
    Et je fournis mes informations de paiement valides
    Alors la réservation est confirmée
    Et je reçois un numéro de confirmation
    Et un email de confirmation est envoyé
    Et le créneau n'est plus disponible pour les autres

  Scénario: Réservation impossible - créneau occupé
    Étant donné une réservation existante le "2025-12-20" à "14:00"
    Quand je tente de réserver le même créneau "2025-12-20" à "14:00"
    Alors je reçois une erreur "Créneau indisponible"
    Et aucune réservation n'est créée

  Scénario: Réservation impossible - heure en dehors des heures d'ouverture
    Étant donné que je suis un client
    Quand je tente de réserver à "08:00" (avant 09:00)
    Alors je reçois une erreur "Horaires d'ouverture: 09:00-19:00"
    Et le créneau n'est pas proposé

  Scénario: Annulation de réservation
    Étant donné une réservation confirmée
    Quand j'annule la réservation
    Alors le remboursement est traité
    Et le créneau redevient disponible
    Et un email d'annulation est envoyé

  Scénario: Modification de réservation
    Étant donné une réservation confirmée
    Quand je change le créneau à "15:00"
    Et que le créneau est disponible
    Alors la réservation est modifiée
    Et un email de confirmation est renvoyé
