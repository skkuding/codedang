FROM gitpod/workspace-full

# load .env
ENV $(grep -v '^#' .env.development | xargs)
