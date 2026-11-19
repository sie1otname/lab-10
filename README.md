# SEG3502 — Laboratoire 10 — Conteneurs : Docker, Docker Compose et Kubernetes

Sie Samuel Traore — 300445506

Conteneurisation de l'application BookStore du laboratoire 7 (client Angular + API REST Spring Boot + MySQL).

```
books-rest-api/     API REST Spring Boot (Kotlin) + Dockerfile + application.properties paramétrable
bookstore-client/   Client Angular + Dockerfile + entrypoint.sh + src/assets/env*.json
docker/             docker-compose.yml
k8s/                Objets Kubernetes : mysql-deployment, mysql-volume, booksserver-deployment, booksclient-deployment
```

## 1. Docker (commandes une par une)

```bash
cd books-rest-api   && docker image build --network=host -t books-rest-api:latest . && cd ..
cd bookstore-client && docker image build -t books-api-client:latest . && cd ..

docker network create mysql-network
docker container run -d --name mysqldb --network mysql-network -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=booksDb mysql:9
docker container run -d --network mysql-network --name booksserver \
  -e MYSQL_USER=root -e MYSQL_PASSWORD=root -e MYSQL_DB=booksDb -e MYSQL_HOST=mysqldb \
  -p 8080:8080 books-rest-api:latest
docker container run -d --name booksclient -e API_URL='http://localhost:8080/books-api/' \
  -p 4100:80 books-api-client:latest
docker container ls
```

Application : http://localhost:4100 — API : http://localhost:8080/books-api/books

## 2. Docker Compose

```bash
cd docker
docker compose up -d --build
docker compose down
```

## 3. Kubernetes (Minikube)

```bash
minikube start
minikube image load books-rest-api:latest
minikube image load books-api-client:latest
cd k8s
kubectl apply -f .
kubectl get deployments
kubectl port-forward service/booksserver 8080:8080    # terminal 1
kubectl port-forward service/booksapp 4100:4100       # terminal 2
kubectl get pods
kubectl delete pod <nom-d-un-pod-booksserver>         # un nouveau pod remplace celui supprimé
kubectl delete -f .
```

## Modifications par rapport au code du laboratoire 7

- `books-rest-api/application.properties` : connexion MySQL lue depuis les variables d'environnement
  `MYSQL_HOST`, `MYSQL_DB`, `MYSQL_USER`, `MYSQL_PASSWORD` (valeurs par défaut pour l'exécution locale).
- `bookstore-client/src/main.ts` : charge `/assets/env.json` avant de démarrer l'application et le place dans `window.env`.
- `bookstore-client/src/app/books/service/books.service.ts` : l'URL de l'API vient de `window.env.apiUrl`.
- `bookstore-client/angular.json` : le dossier `src/assets` est copié dans le build (`/assets/env.json`).
- `bookstore-client/entrypoint.sh` : `envsubst` génère `env.json` à partir de `API_URL` au démarrage du conteneur.
- Dockerfile du serveur : `./gradlew bootJar` (le PDF écrit `gradlew`, qui n'est pas trouvé dans l'image).
- `k8s/booksserver-deployment.yaml` : `replicas: 2` (le texte du PDF et la démonstration de réplication
  supposent deux pods booksserver).
