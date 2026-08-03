#!/bin/bash
set -e

# Retry helper
retry() {
    local retries=10
    local delay=15
    local count=0

    until "$@"; do
        count=$((count + 1))

        if [ "$count" -ge "$retries" ]; then
            echo "Command failed after $${retries} attempts."
            exit 1
        fi

        echo "Retrying in $${delay} seconds..."
        sleep "$delay"
    done
}

apt-get update -y

# Install required packages
apt-get install -y \
    docker.io \
    git \
    nginx \
    jq \
    sudo \
    unzip

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
    -o "awscliv2.zip"

unzip awscliv2.zip

./aws/install

rm -rf aws awscliv2.zip

systemctl enable docker
systemctl start docker

systemctl enable nginx
systemctl start nginx

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Docker Compose v2 Plugin
mkdir -p /usr/local/lib/docker/cli-plugins

retry curl -fSL \
https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
-o /usr/local/lib/docker/cli-plugins/docker-compose

chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

docker --version
docker compose version

# Deployment directories
mkdir -p /opt/blueboard/backend
mkdir -p /opt/blueboard/deployment
mkdir -p /opt/blueboard/logs

# Create GitHub Runner user
if ! id -u github-runner >/dev/null 2>&1; then
    useradd -m -s /bin/bash github-runner
fi

# Add runner to docker group
usermod -aG docker github-runner

# Permissions
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

chown -R github-runner:github-runner /home/github-runner/actions-runner

# ------------------------------------
# Create Backend Environment File
# ------------------------------------

aws ssm get-parameter \
    --name "/blueboard/backend/env" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text \
    > /opt/blueboard/backend/.env.production

echo "" >> /opt/blueboard/backend/.env.production
echo "CORS_ORIGINS=https://${cloudfront_domain}" >> /opt/blueboard/backend/.env.production

chown ubuntu:ubuntu /opt/blueboard/backend/.env.production
chmod 600 /opt/blueboard/backend/.env.production

# ------------------------------------
# Read GitHub Configuration
# ------------------------------------

GITHUB_PAT=$(aws ssm get-parameter \
    --name "/blueboard/github/pat" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text)

GITHUB_OWNER=$(aws ssm get-parameter \
    --name "/blueboard/github/owner" \
    --query "Parameter.Value" \
    --output text)

GITHUB_REPO=$(aws ssm get-parameter \
    --name "/blueboard/github/repo" \
    --query "Parameter.Value" \
    --output text)

# ------------------------------------
# Request Temporary Runner Token
# ------------------------------------

RUNNER_TOKEN=$(curl -fsSL -X POST \
    -H "Authorization: Bearer $${GITHUB_PAT}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$${GITHUB_OWNER}/$${GITHUB_REPO}/actions/runners/registration-token" \
    | jq -r '.token')

# ------------------------------------
# Configure GitHub Runner
# ------------------------------------

sudo -u github-runner ./config.sh \
    --url "https://github.com/$${GITHUB_OWNER}/$${GITHUB_REPO}" \
    --token "$${RUNNER_TOKEN}" \
    --unattended \
    --replace \
    --name "$(hostname)" \
    --work "_work"

# Install GitHub Runner as a Service
./svc.sh install

# Start Runner
./svc.sh start