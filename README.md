# Jour J

Une application qui prédit la date du retour de Jésus. Elle se trompe, et elle
le dit.

Tout ce qu'elle affiche est tiré au hasard : la date, les présages, le
pourcentage de confiance. Il n'y a ni serveur, ni base de données, ni calcul.
C'est un jouet.

## Pourquoi elle existe

Pour être installée depuis un lien, sur un vrai téléphone, en un geste — et
pour montrer ce qui a rendu ça possible.

L'APK est compilé par GitHub Actions et distribué par [Sokial](https://sokial.app).
Personne n'a transféré de fichier par WhatsApp, personne n'a cherché un `.apk`
dans ses téléchargements. Un lien, une page, une installation.

C'est la démonstration ; l'application est le prétexte.

## Construire

```
npm ci
npm run android
```
