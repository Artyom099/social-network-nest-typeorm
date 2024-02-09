# образ на котором будет работать докер контейнер
FROM node:18.17.1-alpine

# переключаемся на управление от пользователя node
# по умолчанию докер запускает контейнер как root, что может представлять проблему безопасности внутри контейнера
USER node

# создаем папку для проекта
RUN mkdir -p /home/node/dist/social-network-nest-typeorm

# инструкция WORKDIR позволяет один раз уразать путь до рабочей директории приложения внутри контейнера
# после чего больщинство команд (RUN, COPY) будут ввполняться в контексте этого каталога
WORKDIR /home/node/dist/social-network-nest-typeorm

# копируем эти файлы в контейнер для установки зависимостей проекта
# --chown изменяет влядельца скопированных файлов в контейнере
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


# для локальной сборки =>
# docker build . t social-network-nest-typeorm
# порт вне контейнера : порт внутри контейнера
# docker run -p 3000:3001 social-network-nest-typeorm