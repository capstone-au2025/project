#show link: underline

#set heading(numbering: "1.")
#outline()

= Configuration

Deployment options which are specific to the environment are configured with environment variables.
The primary app configuration which is agnostic to the environment is done through `app-config.yaml` in the root of the repository, and includes the questions asked and the system prompt templates for example.

== Global

#table(
  columns: (auto, auto, 1fr),
  table.header(
    [*Environment Variable*], [*Default Value*], [*Description*],
  ),
  `MAX_INPUT_TOKENS`, `2000`, [Instructs the inference provider to not allow more than `MAX_INPUT_TOKENS` number of input tokens. Useful to bound the cost of inference and malicious requests],
  `MAX_OUTPUT_TOKENS`, `800`, [Instructs the inference provider to not output more than `MAX_OUTPUT_TOKENS` number of output tokens. Useful to bound the cost of inference],
)

== Inference

There are multiple backend inference providers which require different configuration.

=== Ollama

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

=== AWS

#link("https://aws.amazon.com/bedrock")[Amazon Bedrock] is a managed LLM inference runner.
It provides very large and fast models, and is billed per token.

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

==== IAM Inline Policy

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

=== Mock

When no other inference provider is specified, it defaults to the mock inference provider.
Alternatively, it can be forced by setting `INFERENCE_PROVIDER=mock`.
The mock inference provider is available in all container images.
It simply echoes back the input as the output, and does not use an LLM.

= Deployment

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

== Recipes

=== Local

A production ready #link("https://docs.docker.com/compose")[docker compose] file is available at `infra/docker-compose/docker-compose.yaml` in the repository which can be copied. It is also reproduced below for reference.

This configuration uses the #link("https://deepmind.google/models/gemma")[`gemma3` model from Google] at 4 billion parameters, which strikes a balance of usable outputs while still being runnable on a few CPUs.
It also uses `watchtower` to automatically pull updates to the containers as they come out to ensure the latest security updates are always applied.
The server is available on port 3001 which should be configured by a reverse proxy of choice to expose over HTTPS to the internet.

#let text = read("./infra/docker-compose/docker-compose.yaml")
#raw(text, lang: "yaml")

=== NRP Kubernetes Cluster

Kubernetes manifests are available in the repository to run on the #link("https://nrp.ai")[National Research Platform].
To create the resources, simply run the following command:

```
kubectl -n landlord-letters apply -f infra/nrp/manifest.yaml
```

The website will then be available at #link("https://letter-generator.nrp-nautilus.io")[letter-generator.nrp-nautilus.io].

=== AWS

todo
