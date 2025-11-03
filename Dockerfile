FROM node:latest AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend /app
COPY app-config.yaml /app-config.yaml
RUN npm run build

FROM golang:latest AS backend
RUN apt-get update
RUN apt-get install -y yq
ARG BUILD_TAGS="aws"
WORKDIR /app
COPY backend /app
COPY app-config.yaml ./app-config.yaml
RUN yq '{"questions": [.[].[].[]?.[]?] | map(select(objects)), "systemPrompt": .inference.systemPrompt, "userPrompt": .inference.userPrompt}' app-config.yaml > app-config.json
RUN go get -u
RUN go mod tidy
ENV CGO_ENABLED=0
RUN go build -tags=$BUILD_TAGS



FROM golang:latest AS typst-wrapper
WORKDIR /app
COPY backend/typst-wrapper /app
RUN go get -u
RUN go mod tidy
ENV CGO_ENABLED=0
RUN go build

FROM alpine
WORKDIR /app
COPY --from=ghcr.io/typst/typst:v0.13.1 /bin/typst /bin/typst
ENV PATH=/bin
COPY --from=frontend /app/dist /app/frontend
COPY --from=backend /app/backend /app/backend
COPY --from=backend /app/app-config.json /app/app-config.json
COPY --from=typst-wrapper /app/typst-wrapper /bin/typst-wrapper
CMD ["./backend"]
