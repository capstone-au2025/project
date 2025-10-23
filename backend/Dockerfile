FROM golang:latest AS typst-wrapper
WORKDIR /app
COPY typst-wrapper /app
RUN go get -u
RUN go mod tidy
ENV CGO_ENABLED=0
RUN go build

FROM golang:latest
WORKDIR /app
COPY --from=ghcr.io/typst/typst:v0.13.1 /bin/typst /bin/typst
COPY --from=typst-wrapper /app/typst-wrapper /bin/typst-wrapper

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . /app

CMD ["air", "-build.cmd", "go build -tags=aws,ollama -o ./tmp/main ."]
