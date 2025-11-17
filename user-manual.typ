#show link: underline

#set heading(numbering: "1.")
#outline()

= Administrator Manual

== Configuration

Deployment options which are specific to the environment are configured with environment variables.
The primary app configuration which is agnostic to the environment is done through `app-config.yaml` in the root of the repository, and includes the questions asked and the system prompt templates for example.

=== Global

#table(
  columns: (auto, auto, 1fr),
  table.header(
    [*Environment Variable*], [*Default Value*], [*Description*],
  ),
  `MAX_INPUT_TOKENS`, `2000`, [Instructs the inference provider to not allow more than `MAX_INPUT_TOKENS` number of input tokens. Useful to bound the cost of inference and malicious requests],
  `MAX_OUTPUT_TOKENS`, `800`, [Instructs the inference provider to not output more than `MAX_OUTPUT_TOKENS` number of output tokens. Useful to bound the cost of inference],
)

=== `app-config.yaml`

The backend's text generation is controlled by the inference section of `app-config.yaml`. It contains two prompts, a user prompt and a system prompt. The system prompt should contain the instructions for the model, the specific task it needs to perform. The user prompt should contain the user's input, formatted in a way to assist the model's understanding of it.

Both the system and user prompts are #link("https://pkg.go.dev/text/template")[Go templates]. The system prompt is templated with the current time (key `CurrentTime`), and the user prompt is templated with the user's responses to the survey questions (each keyed by the question's `name`).

```yaml
inference:
  systemPrompt: |
    Rewrite the input into more formal language.
  userPrompt: |
    The tenant's main problems are {{.mainProblem}}.
```
The frontend UI elements are defined in app-config.yaml as well. This configuration file should act as an easy place for the administrator to update any text they want on the frontend including the title, the landing page of the website (and all elements within it), the button text, the questions, the terms of service, the tips, and any other text elements on the frontend. This allows for easy testing as well, as the tests read from this configuration file, so updates to text on the site do not break the CI pipeline. 
=== Inference <inference>

There are multiple backend inference providers which require different configuration.

==== Ollama <ollama>

#link("https://ollama.com")[Ollama] is an open source, self hosted LLM inference runner.

#table(
  columns: (auto, auto, 1fr),
  table.header(
    [*Environment Variable*], [*Example*], [*Description*],
  ),
  `INFERENCE_PROVIDER`, `ollama`, [Must be `ollama`],
  `OLLAMA_HOST`, `http://ollama:11434`, [URL to a running Ollama instance reachable by the container],
  `OLLAMA_MODEL_ID`, `gemma3:4b`, [Model ID. The list of model IDs are available at #link("https://ollama.com/search")[`ollama.com/search`]],
)

==== Amazon Bedrock <bedrock>

#link("https://aws.amazon.com/bedrock")[Amazon Bedrock] is a managed LLM inference runner.
It provides very large and fast models, and is billed per token.
Also, the user of Bedrock as an inference provider does not require running the rest of the application on AWS, so long as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set to an IAM user which can assume the `AWS_ACCESS_KEY_ID` role.

#table(
  columns: (auto, auto, 1fr),
  table.header(
    [*Environment Variable*], [*Example*], [*Description*],
  ),
  `INFERENCE_PROVIDER`, `aws`, [Must be `aws`],
  `AWS_REGION`, `us-east-2`, [Region which the Bedrock model is available in. See `AWS_BEDROCK_MODEL_ID` for more information],
  `AWS_ACCESS_KEY_ID`, `AKIAXXXXXXXXXXXXXXXX`, [Access key to a user which can assume `AWS_BEDROCK_ROLE_ARN` role. Not required if the container is running on AWS with proper IAM assume role principals],
  `AWS_SECRET_ACCESS_KEY`, `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`, [Secret access key to a user which can assume `AWS_BEDROCK_ROLE_ARN` role. Not required if the container is running on AWS with proper IAM assume role principals],
  `AWS_BEDROCK_ROLE_ARN`, `arn:aws:iam::XXXXXXXXXXXX:role/YYY`, [AWS role ARN which has the inline policy JSON below],
  `AWS_BEDROCK_MODEL_ID`, `meta.llama3-3-70b-instruct-v1:0`, [Must be a Model ID from the list available at #link("https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html")[`docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html`]. Note that not all models are available in all regions],
)

===== IAM Inline Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BedrockAPIs",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": "*"
        }
    ]
}
```

==== OpenAI <openai>

The OpenAI inference provider can attach to any OpenAI v1 compatible API. This includes OpenAI's API as well as others like the #link("https://nrp.ai/documentation/userdocs/ai/llm-managed/#_top")[NRP cluster managed LLMs].

#table(
  columns: (auto, auto, 1fr),
  table.header(
    [*Environment Variable*], [*Example*], [*Description*],
  ),
  `INFERENCE_PROVIDER`, `openai`, [Must be `openai`],
  `OPENAI_API_KEY`, `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`, [API Key to use for requests],
  `OPENAI_MODEL_ID`, `gemma3`, [The model to use for inference. NRP models listed at #link("https://nrp.ai/documentation/userdocs/ai/llm-managed/#available-models"). OpenAI models listed at #link("https://platform.openai.com/docs/models")],
  `OPENAI_BASE_URL`, `https://ellm.nrp-nautilus.io/v1`, [Base URL for an OpenAI compatible API],
)
==== Mock <mock>

When no other inference provider is specified, it defaults to the mock inference provider.
Alternatively, it can be forced by setting `INFERENCE_PROVIDER=mock`.
The mock inference provider is available in all container images.
It simply echoes back the input as the output, and does not use an LLM.

== Deployment <deployment>

Continuous integration and continuous delivery build new containers weekly on Tuesdays at 4am UTC with the latest updates from all dependencies.
A dashboard of the artifacts is available at #link("https://github.com/capstone-au2025/project/pkgs/container/project")[`github.com/capstone-au2025/project/pkgs/container/project`].

Certain values of the `INFERENCE_PROVIDER` environment variable only work when using the correct container image.
The available images are provided below:

#table(
  columns: (1fr, 1fr),
  table.header(
    [*Container Image*], [*Available Environment Variable Value*],
  ),
  `ghcr.io/capstone-au2025/project:aws`, `INFERENCE_PROVIDER=aws`,
  `ghcr.io/capstone-au2025/project:ollama`, `INFERENCE_PROVIDER=ollama`,
  `ghcr.io/capstone-au2025/project:openai`, `INFERENCE_PROVIDER=openai`,
)

=== Recipes <recipes>

==== Local

A production ready #link("https://docs.docker.com/compose")[docker compose] file is available at `infra/docker-compose/docker-compose.yaml` in the repository which can be copied. It is also reproduced below for reference.

This configuration uses the #link("https://deepmind.google/models/gemma")[`gemma3` model from Google] at 4 billion parameters, which strikes a balance of usable outputs while still being runnable on a few CPUs.
It also uses `watchtower` to automatically pull updates to the containers as they come out to ensure the latest security updates are always applied.
The server is available on port 3001 which should be configured by a reverse proxy of choice to expose over HTTPS to the internet.

#let text = read("./infra/docker-compose/docker-compose.yaml")
#raw(text, lang: "yaml")

==== NRP Kubernetes Cluster

Kubernetes manifests are available in the repository to run on the #link("https://nrp.ai")[National Research Platform].
To create the resources, simply run the following command:

```
kubectl -n landlord-letters apply -f infra/nrp/manifest.yaml
```

The website will then be available at #link("https://letter-generator.nrp-nautilus.io")[letter-generator.nrp-nautilus.io].

= Developer Manual

== File Overview

#let item(l, r) = [#l #h(1fr) #r]

- #item(`https://github.com/capstone-au2025/project`, [Project root directory])
  - #item(`backend/`, [Directory containing all backend code])
    - #item(`typst-wrapper/`, [Directory containing sandboxed #link("https://typst.app")[Typst] wrapper])
      - #item(`main.go`, [Executable using #link("https://docs.kernel.org/userspace-api/landlock.html")[Landlock] to sandbox Typst])
    - #item(`analytics.go`, [Implementation of analytics])
    - #item(`analytics_test.go`, [Tests for analytics implementation])
    - #item(`aws.go`, [Implementation of #link(<bedrock>)[Amazon Bedrock inference provider]])
    - #item(`aws_test.go`, [Tests for Amazon Bedrock inference provider])
    - #item(`go.mod`, [#link("https://go.dev/ref/mod#go-mod-file")[Golang module file]])
    - #item(`go.sum`, [#link("https://go.dev/ref/mod#go-sum-files")[Golang dependency checksum file]])
    - #item(`inference.go`, [Definition of #link(<inference>)[inference provider] interface, and #link(<mock>)[mock implementation]])
    - #item(`inference_test.go`, [Tests for mock inference provider implementation])
    - #item(`letter-template.typst`, [Typst template to render generated PDFs with])
    - #item(`letter.go`, [Implementation of PDF letter rendering])
    - #item(`main.go`, [Entrypoint and server route definitions])
    - #item(`main_test.go`, [Tests of server routes])
    - #item(`ollama.go`, [Implementation of #link(<ollama>)[Ollama local inference provider]])
    - #item(`ollama_test.go`, [Tests for Ollama local inference provider])
    - #item(`openai.go`, [Implementation of #link(<openai>)[OpenAI inference provider]])
  - #item(`frontend/`, [Directory containing all frontend code])
    - #item(`public/`, [Directory containing the Favicon and other public resources])
      - #item(`favicon.svg`, [Favicon displayed in browser tab])
    - #item(`src/`, [Directory containing the source code for the frontend])
      - #item(`index.html`, [HTML entry point that mounts the React application])
      - #item(`main.tsx`, [React DOM initialization and app mounting])
      - #item(`App.tsx`, [Main app component that initializes React Query and loads configuration])
      - #item(`index.css`, [Global stylesheet definitions])
      - #item(`App.css`, [Component-level styling])
      - #item(`vite-env.d.ts`, [TypeScript type definitions for Vite])
      - #item(`assets/`, [Directory containing image assets])
        - #item(`icons8-home.svg`, [Home icon SVG asset])
      - #item(`components/`, [Directory containing React components])
        - #item(`FormContainer.tsx`, [Main routing hub and state management for the form workflow])
        - #item(`FormPage.tsx`, [Generic form page component for rendering configurable questions])
        - #item(`IntroPage.tsx`, [Landing page introducing features and getting started])
        - #item(`AddressPage.tsx`, [Form page for collecting sender and recipient addresses])
        - #item(`TOSPage.tsx`, [Terms of Service display and acceptance page])
        - #item(`SubmittedPage.tsx`, [Success page with PDF download and certified mail options])
        - #item(`PageLayout.tsx`, [Common layout wrapper for consistent page structure])
        - #item(`QuestionBox.tsx`, [Individual form field component for user input])
        - #item(`ProgressIndicator.tsx`, [Visual step indicator showing form completion progress])
        - #item(`icons.tsx`, [SVG icon components used throughout the UI])
      - #item(`config/`, [Directory containing code to load configuration file for frontend])
        - #item(`configLoader.ts`, [Loads YAML configuration at build time and exports TypeScript interfaces for UI setup])
    - #item(`tests/`, [Directory containing the unit tests for the frontend])
      - #item(`setup.ts`, [Test environment configuration])
      - #item(`app.test.tsx`, [Unit tests for the main App component])
      - #item(`FormContainer.test.tsx`, [Tests for routing and state management])
      - #item(`FormPage.test.tsx`, [Tests for the form page component])
      - #item(`IntroPage.test.tsx`, [Tests for the landing page])
      - #item(`AddressPage.test.tsx`, [Tests for address input functionality])
      - #item(`TOSPage.test.tsx`, [Tests for Terms of Service page])
      - #item(`SubmittedPage.test.tsx`, [Tests for the success page])
      - #item(`QuestionBox.test.tsx`, [Tests for individual form field component])
      - #item(`ProgressIndicator.test.tsx`, [Tests for progress indicator])
      - #item(`certifiedmail.test.ts`, [Tests for certified mail utilities])
    - #item(`package.json`, [Project dependencies and scripts for React, TypeScript, Vite, and testing])
    - #item(`vite.config.ts`, [Build configuration with dev server proxy to backend API])
    - #item(`tsconfig.json`, [TypeScript compiler configuration])
    - #item(`tsconfig.app.json`, [TypeScript configuration for application code])
    - #item(`tsconfig.node.json`, [TypeScript configuration for build tools])
    - #item(`eslint.config.js`, [Linting rules for code quality])
    - #item(`.gitignore`, [Git ignore patterns for node_modules and build artifacts])
    - #item(`app-config.yaml`, [Symlink to shared YAML configuration for UI text and form questions])
    - #item(`README.md`, [Project documentation for frontend])
    - #item(`reset-storage.html`, [Utility page for clearing browser localStorage during development])
    
  - #item(`infra/`, [Directory containing different #link(<recipes>)[recipes] for infrastructure deployment])
    - #item(`docker-compose/`, [Directory to deploy locally with Ollama])
      - #item(`docker-compose.yaml`, [Production ready Docker Compose file to deploy locally])
    - #item(`nrp/`, [Directory to deploy to the #link("https://nrp.ai")[National Research Platform (NRP)]])
      - #item(`manifest.yaml`, [#link("https://kubernetes.io")[Kubernetes manifest] containing all resources required to deploy])
  - #item(`Dockerfile`, [Production #link("https://docs.docker.com/reference/dockerfile")[Dockerfile] used to build main container image in CI])
  - #item(`Dockerfile.backend-dev`, [Development Dockerfile for backend])
  - #item(`Dockerfile.frontend-dev`, [Development Dockerfile for frontend])
  - #item(`app-config.yaml`, [Main app configuration])
  - #item(`docker-compose.yaml`, [Development #link("https://docs.docker.com/compose")[Docker Compose] file])
  - #item(`flake.nix`, [Optional #link("https://wiki.nixos.org/wiki/Flakes")[Nix Flake] for development dependency management])
  - #item(`openapi.yaml`, [#link("https://swagger.io/resources/open-api")[OpenAPI] schema to communicate between backend and frontend])
  - #item(`user-manual.typ`, [Source Typst code for this document])
  - #item(`user-manual.pdf`, [PDF rendered version of this documentation])

== Development Environment

In a terminal, run the following command to launch development servers for both the frontend and backend:

```
docker compose up --watch --build --remove-orphans
```

Then go to http://localhost:5173 for the frontend.
The backend is also on the same port, but under `/api`, so http://localhost:5173/api/hello for example.

The default inference provider for development is a local #link(<ollama>)[Ollama] instance on CPU, and is configured to work out of the box with the docker compose watch command.

== Production Build

Container images are built automatically as described in @deployment. To build for production locally, follow these steps:

Build the `Dockerfile` at the root of the repository:

```
docker build -t project .
```

The server is running on port 3001 by default.
For example, it can then be run with the following command:

```
docker run --rm -p 3001:3001 project
```

Then it will be available at http://localhost:3001.

The default inference provider for production is @bedrock[Amazon Bedrock], and requires configuration through its environment variables.

The available inference provider for production can be configured with a build argument to docker:

```
docker build --build-arg BUILD_TAGS=openai,aws,ollama -t project .
```

== Build Tags

The available build tags are as follows.
They should be set in your editor settings for `gopls` to provide accurate autocomplete.

- `aws`
- `ollama`
- `openai`

Having multiple backends helps improve developer experience so that external services do not need to be configured or payed for.
However different backends requires different golang packages.
The packages are also all auto updating.
By using build tags, if one package has breaking changes, the other providers can still be built and the update process can continue.


== Unit Tests

Run the following command from the root of the repository to test the backend:

```
docker build -t backend backend && docker run --env-file .env -it backend go test -tags aws,ollama -v
```

Note that the required environment variables must be set to run the tests for each inference provider.

The unit tests are required to pass in CI in order for the inference provider container image to be published.

Run the following in the frontend directory to test the frontend: 

```
npm run test
```

And run the following in the frontend directory to test with a coverage report, which allows you to see where you need to add unit tests for new components or pages added later: 

```
npm run coverage
```

The frontend uses Vitest as its testing framework paired with React Testing Library for component testing. This test suite covers all major components and utilities, including routing logic, form submission flows, and state management. Tests are configured with happy-dom as the dom environment and utilize a shared setup file for consistent test configuration. The project includes npm scripts for running tests and generating coverage reports shown above, which helps ensure code quality and prevent regressions as the application evolves in the future. 

= API Consumer Manual

== `/healthz`

== `/api/pdf`

== `/api/text`

= User (Tenant Using Tool) Manual
