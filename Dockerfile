FROM node:24 AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend /app
RUN npm run build

FROM golang:latest AS backend
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend /app
ENV CGO_ENABLED=0
RUN go build

FROM scratch
WORKDIR /app
COPY --from=frontend /app/dist /app/frontend
COPY --from=backend /app/main /app/main
CMD ["./main"]
