resource "aws_s3_bucket" "frontend" {

  bucket = var.frontend_bucket_name

}

resource "aws_s3_bucket_versioning" "frontend_versioning" {

  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {

    status = "Enabled"

  }

}


resource "aws_s3_bucket_public_access_block" "frontend_block" {

  bucket = aws_s3_bucket.frontend.id

  block_public_acls = true

  block_public_policy = true

  ignore_public_acls = true

  restrict_public_buckets = true

}


resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "AllowCloudFrontRead"
        Effect = "Allow"

        Principal = {
          Service = "cloudfront.amazonaws.com"
        }

        Action = "s3:GetObject"

        Resource = "${aws_s3_bucket.frontend.arn}/*"

        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}