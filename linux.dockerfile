# https://www.electron.build/multi-platform-build
FROM electronuserland/builder

USER root
WORKDIR /project

ENV ELECTRON_CACHE="/root/.cache/electron"
ENV ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder"

COPY . .
VOLUME ${PWD}:/project
VOLUME ~/.cache/electron:/root/.cache/electron
VOLUME ~/.cache/electron-builder:/root/.cache/electron-builder