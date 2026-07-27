variable "project_name" {
  description = "Project Name"
  type        = string
}

variable "environment" {
  description = "Deployment Environment"
  type        = string
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR Block for VPC"
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR Block for Public Subnet"
  type        = string
}

variable "availability_zone" {
  description = "Availability Zone"
  type        = string
}

variable "instance_type" {
  description = "EC2 Instance Type"
  type        = string
}

variable "frontend_bucket_name" {
  description = "S3 Bucket Name for Frontend Hosting"
  type        = string
}


variable "key_pair_name" {
  description = "EC2 Key Pair Name"
  type        = string
}