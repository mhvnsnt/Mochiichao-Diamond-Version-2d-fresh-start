# grok-local serving image — same server, same flags as launch.sh,
# for hosts that want a container (and reusable as a serverless
# worker image base; see DEPLOY-RUNBOOK.md route 2).
#
# Base image: vllm/vllm-openai v0.8.5 (the official vLLM OpenAI
# server image; vLLM itself is Apache-2.0). Weights are NOT baked
# into the image — they are pulled at deploy time by pull_model.py
# (staging law) and mounted at /models.
FROM vllm/vllm-openai:v0.8.5

# Defaults mirror launch.sh's primary variant. Every value can be
# overridden by compose / the host's env; the entrypoint keeps
# vLLM's own (the base image starts the OpenAI server with the
# args after the image name).
ENV MODEL_DIR=/models/primary \
    SERVED_MODEL_NAME=grok-local \
    PORT=8000

EXPOSE 8000
