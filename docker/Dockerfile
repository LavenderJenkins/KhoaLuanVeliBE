#Base image
FROM node:18.18.0

USER root
COPY ["SERVICE.tgz", "/SERVICE.tgz"]
COPY ["env", "/SERVICE/.env"]
COPY ["start.sh", "/start.sh"]

RUN ln -fns /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && echo Asis/Ho_Chi_Minh > /etc/timezone

RUN tar -xzf SERVICE.tgz --directory /SERVICE && rm SERVICE.tgz

RUN chmod -R 777 /SERVICE

RUN chmod -R 777 /start.sh

EXPOSE 5000

WORKDIR /SERVICE

RUN yarn install

RUN yarn build

ENTRYPOINT ["/start.sh"]
