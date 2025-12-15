# 💈 Barbershop 514

[![CI - Tests](https://github.com/CalinSanduta/Barbershop/actions/workflows/ci.yml/badge.svg)](https://github.com/CalinSanduta/Barbershop/actions/workflows/ci.yml)

Application de réservation pour salon de coiffure avec backend Node.js et frontend React.

## 🚀 GitHub Actions - CI/CD

Ce projet utilise GitHub Actions pour l'intégration continue :

- Tests unitaires backend (33 tests)
- Tests d'intégration backend (9 tests)
- Tests frontend React
- Rapports de couverture de code

Le workflow se déclenche automatiquement à chaque push et pull request.

### Voir les résultats

[Consulter les workflows GitHub Actions →](https://github.com/CalinSanduta/Barbershop/actions)

## 🛠️ Technologies

- **Backend** : Node.js, Express, Supabase
- **Frontend** : React, React Router
- **Tests** : Jest, Cypress, Cucumber
- **CI/CD** : GitHub Actions
- **Analyse** : Sokrates

## 📊 Tests

```bash
# Backend - Tests unitaires
cd backend
npm run test:unit

# Backend - Tests d'intégration
npm run test:integration

# Frontend - Tests E2E
cd frontend/user-app
npm run test:e2e:open
```

## 📈 Métriques de qualité

- **Couverture de code** : 94.89% (tests unitaires)
- **Tests** : 42 tests passants
- **CI/CD** : Automatisé avec GitHub Actions
