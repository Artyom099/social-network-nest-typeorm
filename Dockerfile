# образ на котором будет работать докер контейнер
FROM node:18.17.1-alpine

# переключаемся на управление от пользователя node
# по умолчанию докер запускает контейнер как root, что может представлять проблему безопасности внутри контейнера
USER node

# создаем папку внутри проекта
RUN mkdir -p /home/node/dist/social-network-nest-typeorm

# инструкция WORKDIR позволяет один раз уразать путь до рабочей директории приложения внутри контейнера
WORKDIR /home/node/dist/social-network-nest-typeorm

# копируем эти файлы в контейнер для установки зависимостей проекта
COPY --chown=node package*.json ./
COPY --chown=node yarn.lock ./

# устанавливаем зависимостей внутри контейнера с блокировкой изменения версий пакетов
RUN yarn install --frozen-lockfile

# устанавливаем переменные окружения
# на этом порту будет рабоать приложение в контейнере
ENV PORT=3001

# копируем файлы проекта
COPY --chown=node . .

# запускаем сборку проекта
RUN yarn build

# инструкция EXPOSE информирует докер, что контейнер прослушивает указанные порты во время выполнения
EXPOSE ${PORT}

# указываем команду и аргументы для выполнения внутри контейнера
CMD [ "yarn", "start" ]
#CMD yarn 'start:dev'