# BlueBoard Infrastructure

Infrastructure is provisioned using Terraform.

## Components

- VPC
- Public Subnet
- Internet Gateway
- Route Table
- Security Group
- EC2 Instance
- Elastic IP
- IAM Role
- IAM Instance Profile
- Frontend S3 Bucket

## Deployment

```powershell
.\tf.ps1 init
.\tf.ps1 plan
.\tf.ps1 apply