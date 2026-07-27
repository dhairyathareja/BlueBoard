$env:AWS_SHARED_CREDENTIALS_FILE = "$PSScriptRoot\.aws\credentials"
$env:AWS_CONFIG_FILE = "$PSScriptRoot\.aws\config"

terraform @args