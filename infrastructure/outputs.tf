output "ec2_public_ip" {

  value = aws_eip.backend_eip.public_ip

}

/*
output "cloudfront_url" {
  value = aws_cloudfront_distribution.frontend.domain_name
}
*/

output "frontend_bucket" {

  value = aws_s3_bucket.frontend.bucket

}