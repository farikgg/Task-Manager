# Task Manager Application

Полноценное веб-приложение для управления задачами с использованием React, Node.js, MongoDB и Docker.

## Структура проекта

```
.
├── front/                 # React фронтенд
├── To-Do-Api/            # Node.js бэкенд
├── docker-compose.yml    # Конфигурация Docker
└── nginx.conf           # Конфигурация Nginx
```

## Требования

- Docker
- Docker Compose
- Node.js (для локальной разработки)
- npm (для локальной разработки)

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Создайте файл .env в корневой директории:
```bash
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

3. Запустите приложение с помощью Docker Compose:
```bash
docker-compose up --build
```

Приложение будет доступно по адресу: http://localhost

## Разработка

### Фронтенд (React)

```bash
cd front
npm install
npm start
```

### Бэкенд (Node.js)

```bash
cd To-Do-Api
npm install
npm start
```

## API Endpoints

- POST /api/auth/register - Регистрация пользователя
- POST /api/auth/login - Вход в систему
- GET /api/tasks - Получение списка задач
- POST /api/tasks - Создание новой задачи
- PUT /api/tasks/:id - Обновление задачи
- DELETE /api/tasks/:id - Удаление задачи

## Технологии

- Frontend: React, Redux, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- Containerization: Docker, Docker Compose
- Web Server: Nginx 