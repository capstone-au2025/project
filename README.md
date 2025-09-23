# Capstone Project

AU2025 JusticeTech

## Development

In a terminal, run the following command to launch development servers for both the frontend and backend:

```
docker compose up --watch
```

Then go to [http://localhost:5173](http://localhost:5173) for the frontend.
The backend is also on the same port, but under `/api`, so [http://localhost:5173/api/hello](http://localhost:5173/api/hello) for example.

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

## Running GO Test Cases

Build and run with 

docker compose up --watch --build

Run tests using
docker compose run backend go test -v ./


## Testing on mobile with Tailscale

Create a free [Tailscale](https://tailscale.com/) account.
Install and login to Tailscale on both your laptop and your phone.
Make sure to run `sudo tailscale up` on your laptop and enable
Tailscale in the app on your phone.
Then you should be able to navigate to `yourlaptophostname:5173/` on your phone
to see the website in its mobile glory.
