output "ec2_public_ip" {

  value = aws_eip.backend_eip.public_ip

}


output "cloudfront_url" {
  value = aws_cloudfront_distribution.frontend.domain_name
}


output "frontend_bucket" {

  value = aws_s3_bucket.frontend.bucket

}

output "cloudfront_domain" {
  description = "CloudFront Distribution Domain Name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}