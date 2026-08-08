#!/bin/bash
set -e

# ------------------------------------
# Retry helper
# ------------------------------------

retry() {
    local retries=10
    local delay=15
    local count=0

    until "$@"; do
        count=$((count + 1))

        if [ "$count" -ge "$${retries}" ]; then
            echo "Command failed after $${retries} attempts."
            exit 1
        fi

        echo "Retrying in $${delay} seconds..."
        sleep "$${delay}"
    done
}

# ------------------------------------
# System packages
# ------------------------------------

apt-get update -y

apt-get install -y \
    docker.io \
    docker-compose-v2 \
    git \
    nginx \
    jq \
    sudo \
    unzip \
    curl

# ------------------------------------
# Start services
# ------------------------------------

systemctl enable docker
systemctl start docker

systemctl enable nginx
systemctl start nginx

# Add users to Docker group
usermod -aG docker ubuntu

# ------------------------------------
# Verify Docker
# ------------------------------------

docker --version
docker compose version

# ------------------------------------
# AWS CLI v2
# ------------------------------------

retry curl -fL \
    https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip \
    -o /tmp/awscliv2.zip

unzip -q /tmp/awscliv2.zip -d /tmp

/tmp/aws/install --update

rm -rf /tmp/aws /tmp/awscliv2.zip

aws --version

# ------------------------------------
# Deployment directories
# ------------------------------------

mkdir -p /opt/blueboard/backend
mkdir -p /opt/blueboard/deployment
mkdir -p /opt/blueboard/logs

# ------------------------------------
# GitHub Runner user
# ------------------------------------

if ! id -u github-runner >/dev/null 2>&1; then
    useradd -m -s /bin/bash github-runner
fi

usermod -aG docker github-runner

chown -R ubuntu:ubuntu /opt/blueboard
chown -R github-runner:github-runner /home/github-runner

# ------------------------------------
# Download GitHub Actions Runner
# ------------------------------------

mkdir -p /home/github-runner/actions-runner
cd /home/github-runner/actions-runner

RUNNER_VERSION="2.336.0"

retry curl -fL \
    "https://github.com/actions/runner/releases/download/v$${RUNNER_VERSION}/actions-runner-linux-x64-$${RUNNER_VERSION}.tar.gz" \
    -o actions-runner-linux-x64.tar.gz

tar -xzf actions-runner-linux-x64.tar.gz

rm -f actions-runner-linux-x64.tar.gz

chown -R github-runner:github-runner /home/github-runner/actions-runner

# ------------------------------------
# Backend Environment
# ------------------------------------

retry aws ssm get-parameter \
    --name "/blueboard/backend/env" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text \
    > /opt/blueboard/backend/.env.production

echo "" >> /opt/blueboard/backend/.env.production

echo "CORS_ORIGINS=https://${cloudfront_domain}" \
    >> /opt/blueboard/backend/.env.production

chown ubuntu:ubuntu /opt/blueboard/backend/.env.production
chmod 600 /opt/blueboard/backend/.env.production

# ------------------------------------
# GitHub Configuration
# ------------------------------------

GITHUB_PAT=$(retry aws ssm get-parameter \
    --name "/blueboard/github/pat" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text)

GITHUB_OWNER=$(retry aws ssm get-parameter \
    --name "/blueboard/github/owner" \
    --query "Parameter.Value" \
    --output text)

GITHUB_REPO=$(retry aws ssm get-parameter \
    --name "/blueboard/github/repo" \
    --query "Parameter.Value" \
    --output text)

# ------------------------------------
# Request Runner Registration Token
# ------------------------------------

RUNNER_TOKEN=$(retry curl -fsSL -X POST \
    -H "Authorization: Bearer $${GITHUB_PAT}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$${GITHUB_OWNER}/$${GITHUB_REPO}/actions/runners/registration-token" \
    | jq -r '.token')

if [ -z "$${RUNNER_TOKEN}" ] || [ "$${RUNNER_TOKEN}" = "null" ]; then
    echo "Failed to obtain GitHub Actions runner registration token."
    exit 1
fi

# ------------------------------------
# Configure GitHub Runner
# ------------------------------------

cd /home/github-runner/actions-runner

sudo -u github-runner ./config.sh \
    --url "https://github.com/$${GITHUB_OWNER}/$${GITHUB_REPO}" \
    --token "$${RUNNER_TOKEN}" \
    --unattended \
    --replace \
    --name "$(hostname)" \
    --work "_work"

# ------------------------------------
# Install Runner Service
# ------------------------------------

./svc.sh install github-runner
./svc.sh start

# ------------------------------------
# Completion
# ------------------------------------

echo "========================================="
echo "BlueBoard EC2 initialization completed."
echo "GitHub Actions runner is configured."
echo "========================================="