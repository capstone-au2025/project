# Capstone Project

AU2025 JusticeTech

## Development

In a terminal, run the following command to launch development servers for both the frontend and backend:

```
docker compose up --watch --build --remove-orphans
```

Then go to [http://localhost:5173](http://localhost:5173) for the frontend.
The backend is also on the same port, but under `/api`, so [http://localhost:5173/api/hello](http://localhost:5173/api/hello) for example.

The default inference provider for development is a local [Ollama](https://ollama.com) instance on CPU, and is configured to work out of the box with the docker compose watch command in the [Development](#development) section.

The available build tags are as follows.
They should be set in your editor settings for `gopls` to provide accurate autocomplete.

- `aws`
- `ollama`

Having multiple backends helps improve developer experience so that external services do not need to be configured or payed for.
However different backends requires different golang packages.
The packages are also all auto updating.
By using build tags, if one package has breaking changes, the other providers can still be built and the update process can continue.

## Production

Build the `Dockerfile` at the root of the repository:

```
docker build -t project .
```

The server is running on port 3001 by default.
For example, it can then be run with the following command:

```
docker run --rm -p 3001:3001 project
```

Then it will be available at [http://localhost:3001](http://localhost:3001).

The default inference provider for production is [Amazon Bedrock](https://aws.amazon.com/bedrock), and requires configuration through its environment variables.

The available inference provider for production can be configured with a build argument to docker:

```
docker build --build-arg BUILD_TAGS=aws,ollama -t project .
```

## Unit Tests

Run the following command from the root of the repository to test the backend:

```
docker build -t backend backend && docker run --env-file .env -it backend go test -tags aws,ollama -v
```

Note that the required environment variables must be set to run the tests for each inference provider.

## Testing on mobile with Tailscale

Create a free [Tailscale](https://tailscale.com/) account.
Install and login to Tailscale on both your laptop and your phone.
Make sure to run `sudo tailscale up` on your laptop and enable
Tailscale in the app on your phone.
Then you should be able to navigate to `yourlaptophostname:5173/` on your phone to see the website in its mobile glory.
